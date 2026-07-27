#!/usr/bin/env node
/**
 * OSINT Agent Skills — MCP Server (stdio transport)
 *
 * Exposes the tools defined in mcp-tools.json as a Model Context Protocol
 * server that Claude Code, Cursor, or any MCP-compatible client can load
 * natively. The server reads the tool registry, registers each tool, and
 * proxies HTTP requests to the real endpoints.
 *
 * Usage:
 *   node mcp-server.js
 *
 * Environment:
 *   OSINT_TOOLS_REGISTRY  — path to mcp-tools.json (default: ./mcp-tools.json)
 *   API keys are read from the environment (SHODAN_KEY, VT_API_KEY, HIBP_KEY,
 *     HUNTER_KEY, ETHERSCAN_KEY, SECURITYTRAILS_KEY, GITHUB_TOKEN).
 *   OSINT_USER_AGENT      — overrides the default User-Agent sent on outbound
 *     requests (OPSEC). Defaults preserve previous behavior.
 */

"use strict";

const fs = require("fs");
const https = require("https");
const http = require("http");
const { URL } = require("url");
const path = require("path");
const net = require("net");

// ── Load tool registry ──────────────────────────────────────────────────────

const registryPath = process.env.OSINT_TOOLS_REGISTRY ||
  path.join(__dirname, "mcp-tools.json");

let toolRegistry;
try {
  toolRegistry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
} catch (err) {
  process.stderr.write("[osint-agent-skills] Failed to load tool registry: " + err.message + "\n");
  process.exit(1);
}

// ── MCP protocol (JSON-RPC over stdio) ──────────────────────────────────────

const PROTOCOL_VERSION = "2024-11-05";

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

function error(id, code, message) {
  send({ jsonrpc: "2.0", id: id || null, error: { code, message } });
}

// ── HTTP fetch helper ───────────────────────────────────────────────────────

function fetchUrl(url, options) {
  options = options || {};
  return new Promise(function(resolve, reject) {
    var parsed = new URL(url);
    var lib = parsed.protocol === "https:" ? https : http;

    var reqOpts = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: options.method || "GET",
      headers: options.headers || {},
      timeout: 30000,
    };

    // Inject API keys from environment based on endpoint
    if (parsed.hostname.indexOf("shodan.io") !== -1 && process.env.SHODAN_KEY) {
      reqOpts.path += (parsed.search ? "&" : "?") + "key=" + process.env.SHODAN_KEY;
    }
    if (parsed.hostname.indexOf("virustotal.com") !== -1 && process.env.VT_API_KEY) {
      reqOpts.headers["x-apikey"] = process.env.VT_API_KEY;
    }
    if (parsed.hostname.indexOf("hunter.io") !== -1 && process.env.HUNTER_KEY) {
      reqOpts.path += (parsed.search ? "&" : "?") + "api_key=" + process.env.HUNTER_KEY;
    }
    if (parsed.hostname.indexOf("haveibeenpwned.com") !== -1) {
      // Per-call api_key (from the tool invocation args) takes precedence
      // over the env var fallback. Both write to the same `hibp-api-key`
      // header that HIBP's v3 API requires.
      var hibpKey = (options.args && options.args.api_key) ? options.args.api_key : process.env.HIBP_KEY;
      if (hibpKey) {
        reqOpts.headers["hibp-api-key"] = hibpKey;
        reqOpts.headers["User-Agent"] = process.env.OSINT_USER_AGENT || "OSINT-Agent-Skills";
      }
    }
    if (parsed.hostname.indexOf("etherscan.io") !== -1 && process.env.ETHERSCAN_KEY) {
      reqOpts.path += (parsed.search ? "&" : "?") + "apikey=" + process.env.ETHERSCAN_KEY;
    }
    if (parsed.hostname.indexOf("securitytrails.com") !== -1) {
      // SecurityTrails uses an APIKey header (per official docs).
      // Per-call api_key (from tool args) takes precedence over env var.
      var stKey = (options.args && options.args.api_key) ? options.args.api_key : process.env.SECURITYTRAILS_KEY;
      if (stKey) {
        reqOpts.headers["APIKey"] = stKey;
      }
    }

    var req = lib.request(reqOpts, function(res) {
      var data = "";
      res.on("data", function(chunk) { data += chunk; });
      res.on("end", function() {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", reject);
    req.on("timeout", function() {
      req.destroy();
      reject(new Error("Request timed out (30s)"));
    });

    if (options.body) req.write(options.body);
    req.end();
  });
}

// ── Input validation helpers ───────────────────────────────────────────────

// Block IP literals and inet_aton shorthand forms that getaddrinfo() resolves
// on Linux/glibc but net.isIP() does not recognize (e.g. 127.1, 0x7f000001,
// 2130706433, 017700000001). See SSRF defense-in-depth for mastodon_user_lookup.
function isValidPublicHostname(hostname) {
  if (typeof hostname !== "string" || hostname.length === 0 || hostname.length > 253) return false;

  // 1. Block standard IP literals (IPv4 dotted-quad, IPv6)
  if (net.isIP(hostname) !== 0) return false;

  // 2. Block inet_aton shorthand forms (decimal, hex, octal, dotted variants)
  //    Per-pass: one leading octet + 0-3 dotted octets, each octet being
  //    decimal, 0x-prefixed hex, or 0-prefixed octal.
  if (/^(\d+|0x[0-9a-f]+|0[0-7]+)(\.(?:\d+|0x[0-9a-f]+|0[0-7]+)){0,3}$/i.test(hostname)) return false;

  // 3. Block path/query/fragment separators and other dangerous characters
  if (/[\/\\?#@:\s]/.test(hostname)) return false;

  // 4. Block localhost and well-known metadata endpoints
  var lower = hostname.toLowerCase();
  if (lower === "localhost") return false;
  if (lower === "metadata" || lower === "metadata.google.internal") return false;

  // 5. Block magic DNS hostnames that resolve to loopback or private ranges
  if (/\.(nip\.io|sslip\.io|xip\.io|localtest\.me)$/i.test(lower)) return false;

  // 6. Block private-use TLDs often used for internal networks
  if (/\.(internal|local|localhost|intranet|home|lan|corp|priv|example|test|invalid)$/i.test(lower)) return false;

  // 7. Validate hostname format (letters, digits, dots, hyphens only)
  if (!/^[a-zA-Z0-9]([a-zA-Z0-9.\-]*[a-zA-Z0-9])?$/.test(hostname)) return false;

  return true;
}

// Redact sensitive fields from tool args before returning them in the response
// payload. Prevents accidental API key leakage through the `query: args` field.
var SENSITIVE_ARG_KEYS = /^(api[_-]?key|apikey|token|secret|password|hibp[_-]?key|shodan[_-]?key|vt[_-]?api[_-]?key|hunter[_-]?key|etherscan[_-]?key|securitytrails[_-]?key)$/i;

function redactSensitiveArgs(args) {
  if (!args || typeof args !== "object") return args;
  var redacted = {};
  for (var k in args) {
    if (Object.prototype.hasOwnProperty.call(args, k)) {
      redacted[k] = SENSITIVE_ARG_KEYS.test(k) ? (args[k] ? "[REDACTED]" : args[k]) : args[k];
    }
  }
  return redacted;
}

// ── Tool execution ──────────────────────────────────────────────────────────

// Compute a sha256 hash over the canonical JSON form of a tool output's stable
// fields ({tool, endpoint, status, result}). Excludes `query` (which is input,
// not output) and `timestamp` (which varies per call). The hash lets downstream
// consumers — audit logs, report verifiers, external scripts — confirm that any
// data attributed to a tool call was actually produced by that tool call.
//
// Canonical form: JSON.stringify with default V8 key ordering (insertion order).
// Cross-language reproducibility: in Python use
//   json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
// then hashlib.sha256(...).hexdigest().
function computeOutputHash(response) {
  var crypto = require("crypto");
  var payload = {
    tool: response.tool,
    endpoint: response.endpoint,
    status: response.status,
    result: response.result,
  };
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

async function executeTool(toolName, args) {
  var tool = toolRegistry.tools.find(function(t) { return t.name === toolName; });
  if (!tool) {
    throw new Error("Unknown tool: " + toolName);
  }

  // Local tool: verify_output_integrity (no HTTP call, returns immediately).
  if (toolName === "verify_output_integrity") {
    var payload = {
      tool: args.tool,
      endpoint: args.endpoint,
      status: args.status,
      result: args.result,
    };
    var actualHash = require("crypto").createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    var verifyResponse = {
      tool: toolName,
      query: redactSensitiveArgs(args),
      endpoint: "local://verify_output_integrity",
      status: 200,
      timestamp: new Date().toISOString(),
      result: {
        valid: actualHash === args.hash,
        expected_hash: args.hash,
        actual_hash: actualHash,
      },
    };
    verifyResponse.output_hash = computeOutputHash(verifyResponse);
    return verifyResponse;
  }

  var ann = tool.annotations || {};
  var endpoint = ann.endpoint || "";
  if (!endpoint) {
    throw new Error("Tool " + toolName + " has no endpoint defined");
  }

  // Replace {placeholder} tokens in endpoint with args
  var key;
  for (key in args) {
    if (Object.prototype.hasOwnProperty.call(args, key)) {
      endpoint = endpoint.replace(new RegExp("\\{" + key + "\\}", "g"), encodeURIComponent(args[key]));
    }
  }

  // Special case: Wayback CDX
  if (toolName === "wayback_cdx") {
    var params = new URLSearchParams();
    params.set("url", args.url);
    params.set("output", "json");
    params.set("fl", "timestamp,original,statuscode,mimetype");
    params.set("collapse", args.collapse || "digest");
    if (args.from) params.set("from", args.from);
    if (args.to) params.set("to", args.to);
    endpoint = "http://web.archive.org/cdx/search/cdx?" + params.toString();
  }

  if (toolName === "wayback_save") {
    endpoint = "https://web.archive.org/save/" + args.url;
  }
  if (toolName === "github_code_search") {
    endpoint = "https://api.github.com/search/code?q=" + encodeURIComponent(args.query);
  }
  if (toolName === "urlscan_search") {
    endpoint = "https://urlscan.io/api/v1/search/?q=" + encodeURIComponent(args.query);
  }
  if (toolName === "alienvault_otx_lookup") {
    endpoint = "https://otx.alienvault.com/api/v1/indicators/" + args.indicator_type + "/" + encodeURIComponent(args.value) + "/general";
  }
  if (toolName === "hibp_breach_check") {
    endpoint = "https://haveibeenpwned.com/api/v3/breachedaccount/" + encodeURIComponent(args.email);
  }
  if (toolName === "gravatar_lookup") {
    var hash = require("crypto").createHash("md5").update(args.email.trim().toLowerCase()).digest("hex");
    endpoint = "https://www.gravatar.com/" + hash + ".json";
  }
  if (toolName === "hunter_email_finder") {
    endpoint = "https://api.hunter.io/v2/email-finder?domain=" + encodeURIComponent(args.domain);
    if (args.api_key) endpoint += "&api_key=" + args.api_key;
  }
  if (toolName === "etherscan_address_lookup") {
    endpoint = "https://api.etherscan.io/api?module=account&action=txlist&address=" + encodeURIComponent(args.address) + "&sort=desc";
    if (args.api_key) endpoint += "&apikey=" + args.api_key;
  }
  if (toolName === "mastodon_user_lookup") {
    // SSRF defense: validate that args.instance is a public hostname. Rejects
    // IP literals, inet_aton shorthand (127.1, 0x7f000001, ...), path/query
    // injection, localhost, metadata endpoints, and magic DNS rebinding names.
    if (!args.instance || !isValidPublicHostname(args.instance)) {
      throw new Error("Invalid instance: must be a public hostname (no IPs, paths, or query strings)");
    }
    endpoint = "https://" + args.instance + "/api/v1/accounts/lookup?acct=" + encodeURIComponent(args.handle);
  }
  if (toolName === "nominatim_geocode") {
    endpoint = "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(args.query) + "&format=json";
  }
  if (toolName === "blockchain_address_lookup") {
    endpoint = "https://blockchain.info/rawaddr/" + encodeURIComponent(args.address);
  }

  // Set headers
  var headers = {};
  headers["User-Agent"] = process.env.OSINT_USER_AGENT || "OSINT-Agent-Skills-MCP/1.0";
  if (endpoint.indexOf("cloudflare-dns.com") !== -1 || endpoint.indexOf("dns.quad9.net") !== -1) {
    headers["Accept"] = "application/dns-json";
  }
  if (endpoint.indexOf("api.github.com") !== -1 && process.env.GITHUB_TOKEN) {
    headers["Authorization"] = "token " + process.env.GITHUB_TOKEN;
  }

  var response = await fetchUrl(endpoint, { headers: headers, args: args });

  // Try to parse JSON
  var parsed;
  try {
    parsed = JSON.parse(response.body);
  } catch (e) {
    parsed = response.body;
  }

  var responseObject = {
    tool: toolName,
    query: redactSensitiveArgs(args),
    endpoint: endpoint.replace(/([?&])(api[_-]?key|apikey|key|token|secret|password)=[^&\s]+/gi, "$1$2=REDACTED"),
    status: response.statusCode,
    timestamp: new Date().toISOString(),
    result: parsed,
  };
  responseObject.output_hash = computeOutputHash(responseObject);
  return responseObject;
}

// ── MCP message handlers ────────────────────────────────────────────────────

async function handleMessage(msg) {
  var id = msg.id;
  var method = msg.method;
  var params = msg.params || {};

  if (method === "initialize") {
    send({
      jsonrpc: "2.0",
      id: id,
      result: {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: {
          tools: { listChanged: false },
        },
        serverInfo: {
          name: "osint-agent-skills-tools",
          version: toolRegistry.version || "1.0.0",
        },
      },
    });
    return;
  }

  if (method === "initialized") {
    return; // Notification, no response
  }

  if (method === "tools/list") {
    send({
      jsonrpc: "2.0",
      id: id,
      result: {
        tools: toolRegistry.tools.map(function(t) {
          return {
            name: t.name,
            description: t.description,
            inputSchema: t.input_schema,
          };
        }),
      },
    });
    return;
  }

  if (method === "tools/call") {
    try {
      var result = await executeTool(params.name, params.arguments || {});
      send({
        jsonrpc: "2.0",
        id: id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        },
      });
    } catch (err) {
      send({
        jsonrpc: "2.0",
        id: id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: true,
                message: err.message,
                tool: params.name,
                timestamp: new Date().toISOString(),
              }, null, 2),
            },
          ],
          isError: true,
        },
      });
    }
    return;
  }

  if (method === "ping") {
    send({ jsonrpc: "2.0", id: id, result: {} });
    return;
  }

  if (id) {
    error(id, -32601, "Method not found: " + method);
  }
}

// ── Main loop ───────────────────────────────────────────────────────────────

var buffer = "";

process.stdin.setEncoding("utf-8");
process.stdin.on("data", function(chunk) {
  buffer += chunk;
  var newlineIdx;
  while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
    var line = buffer.slice(0, newlineIdx).trim();
    buffer = buffer.slice(newlineIdx + 1);
    if (!line) continue;
    try {
      var msg = JSON.parse(line);
      handleMessage(msg).catch(function(err) {
        process.stderr.write("[osint-agent-skills] Error handling message: " + err.message + "\n");
        if (msg.id) error(msg.id, -32603, err.message);
      });
    } catch (err) {
      process.stderr.write("[osint-agent-skills] JSON parse error: " + err.message + "\n");
    }
  }
});

process.stdin.on("end", function() {
  process.exit(0);
});

process.stderr.write("[osint-agent-skills] MCP server started. Loading " + toolRegistry.tools.length + " tools.\n");
