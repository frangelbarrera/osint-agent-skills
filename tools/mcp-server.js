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

// Exact API-host matching: a key may only be attached when the request
// hostname is the API host itself or a direct subdomain of it.
function isApiHost(hostname, base) {
  var h = String(hostname || "").toLowerCase();
  var b = String(base || "").toLowerCase();
  // h.length > b.length + 1 rejects the empty-label ".shodan.io" form.
  return h === b || (h.length > b.length + 1 && h.slice(-(b.length + 1)) === "." + b);
}

// Append an encoded query parameter to reqOpts.path.
function appendQueryParam(reqOpts, name, value) {
  reqOpts.path += (reqOpts.path.indexOf("?") !== -1 ? "&" : "?") + name + "=" + encodeURIComponent(value);
}

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

    // Inject API keys from environment based on endpoint. A per-call
    // api_key in the tool args always takes precedence over the env var
    // (it is appended to the endpoint in executeTool), so the env fallback
    // is skipped to avoid sending two different keys in one request.
    if (isApiHost(parsed.hostname, "shodan.io") && process.env.SHODAN_KEY && !(options.args && options.args.api_key)) {
      appendQueryParam(reqOpts, "key", process.env.SHODAN_KEY);
    }
    if (isApiHost(parsed.hostname, "virustotal.com")) {
      // Per-call api_key (from the tool invocation args — required by the
      // virustotal_domain_report schema) takes precedence over the env var.
      var vtKey = (options.args && options.args.api_key) ? options.args.api_key : process.env.VT_API_KEY;
      if (vtKey) {
        reqOpts.headers["x-apikey"] = vtKey;
      }
    }
    if (isApiHost(parsed.hostname, "hunter.io") && process.env.HUNTER_KEY && !(options.args && options.args.api_key)) {
      appendQueryParam(reqOpts, "api_key", process.env.HUNTER_KEY);
    }
    if (isApiHost(parsed.hostname, "haveibeenpwned.com")) {
      // Per-call api_key (from the tool invocation args) takes precedence
      // over the env var fallback. Both write to the same `hibp-api-key`
      // header that HIBP's v3 API requires.
      var hibpKey = (options.args && options.args.api_key) ? options.args.api_key : process.env.HIBP_KEY;
      if (hibpKey) {
        reqOpts.headers["hibp-api-key"] = hibpKey;
        reqOpts.headers["User-Agent"] = process.env.OSINT_USER_AGENT || "OSINT-Agent-Skills";
      }
    }
    if (isApiHost(parsed.hostname, "etherscan.io") && process.env.ETHERSCAN_KEY && !(options.args && options.args.api_key)) {
      appendQueryParam(reqOpts, "apikey", process.env.ETHERSCAN_KEY);
    }
    if (isApiHost(parsed.hostname, "securitytrails.com")) {
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
    endpoint = "https://web.archive.org/cdx/search/cdx?" + params.toString();
  }

  if (toolName === "wayback_save") {
    // The save target is an absolute http(s) URL appended as a path segment.
    // Requiring the scheme prevents path traversal ("../../..") and query
    // injection into the archive.org path.
    var saveUrl = String(args.url || "");
    if (!/^https?:\/\/[^\s"'<>\\]+$/i.test(saveUrl)) {
      throw new Error("Invalid url for wayback_save: must be an absolute http(s) URL");
    }
    endpoint = "https://web.archive.org/save/" + saveUrl;
  }
  if (toolName === "github_code_search") {
    endpoint = "https://api.github.com/search/code?q=" + encodeURIComponent(args.query);
  }
  if (toolName === "urlscan_search") {
    endpoint = "https://urlscan.io/api/v1/search/?q=" + encodeURIComponent(args.query);
  }
  if (toolName === "alienvault_otx_lookup") {
    endpoint = "https://otx.alienvault.com/api/v1/indicators/" + encodeURIComponent(args.indicator_type) + "/" + encodeURIComponent(args.value) + "/general";
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
    if (args.api_key) endpoint += "&api_key=" + encodeURIComponent(args.api_key);
  }
  if (toolName === "etherscan_address_lookup") {
    endpoint = "https://api.etherscan.io/api?module=account&action=txlist&address=" + encodeURIComponent(args.address) + "&sort=desc";
    if (args.api_key) endpoint += "&apikey=" + encodeURIComponent(args.api_key);
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
  // GITHUB_TOKEN is only sent when the request hostname is api.github.com itself.
  if (isApiHost(new URL(endpoint).hostname, "api.github.com") && process.env.GITHUB_TOKEN) {
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

  // Surface rate-limit state from response headers so agents and harnesses
  // can back off BEFORE crossing a limit. GitHub sends x-ratelimit-* on every
  // response; many APIs send Retry-After when throttling.
  var rl = {};
  if (response.headers) {
    if (response.headers["retry-after"]) rl.retry_after = response.headers["retry-after"];
    if (response.headers["x-ratelimit-remaining"]) rl.remaining = response.headers["x-ratelimit-remaining"];
    if (response.headers["x-ratelimit-reset"]) rl.reset = response.headers["x-ratelimit-reset"];
  }
  if (Object.keys(rl).length) responseObject.rate_limit = rl;

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
    pendingCalls++;
    try {
      var result = await executeTool(params.name, params.arguments || {});
      // HTTP-level errors (401/403/429/5xx, ...) are tool errors: mark
      // isError so clients can react. 404 is exempt: for OSINT tools
      // "not found" is a valid answer (e.g. hibp_breach_check 404 = email
      // not breached, mastodon 404 = account does not exist).
      var httpError = result && typeof result.status === "number" && result.status >= 400 && result.status !== 404;
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
          isError: httpError ? true : undefined,
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
    } finally {
      pendingCalls--;
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

// In-flight tools/call counter: lets the server drain pending responses on
// stdin EOF instead of exiting mid-request and losing them.
var pendingCalls = 0;

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
  // Drain in-flight tool calls before exiting so responses are not lost.
  // Hard deadline: a stalled response can outlive the 30s timeout, so
  // never hang forever on drain.
  var drainDeadline = Date.now() + 60000;
  (function exitWhenDrained() {
    if (pendingCalls <= 0 || Date.now() > drainDeadline) {
      // Flush whatever is still buffered in stdout before exiting,
      // otherwise a large in-flight response can be truncated.
      process.stdout.write("", function () { process.exit(0); });
      return;
    }
    setTimeout(exitWhenDrained, 25);
  })();
});

// If the client closes our stdout while a response write is in flight (e.g.
// the agent process was killed), the write fails with EPIPE and would crash
// the server with an unhandled 'error' event. Exit cleanly instead.
process.stdout.on("error", function(err) {
  if (err && err.code === "EPIPE") process.exit(0);
  throw err;
});

process.stderr.write("[osint-agent-skills] MCP server started. Loading " + toolRegistry.tools.length + " tools.\n");
