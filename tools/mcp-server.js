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
const dns = require("dns");

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
  send({ jsonrpc: "2.0", id: id === undefined ? null : id, error: { code, message } });
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

// Cap on response body size: these tools consume JSON APIs, so responses
// are limited to a few MB.
var MAX_RESPONSE_BYTES = 5 * 1024 * 1024;

// Aggregate ceiling on response bodies received concurrently across calls.
// Without it, MAX_CONCURRENT_CALLS in-flight responses can buffer up to
// 40 MB (more once serialized) at the same time.
var MAX_TOTAL_RESPONSE_BYTES = 32 * 1024 * 1024;
var inflightResponseBytes = 0;

function fetchUrl(url, options) {
  options = options || {};
  return new Promise(function(resolve, reject) {
    var parsed = new URL(url);
    var lib = parsed.protocol === "https:" ? https : http;

    function dispatch(connectHost) {
    var reqOpts = {
      hostname: connectHost,
      port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: options.method || "GET",
      headers: options.headers || {},
      timeout: 30000,
    };

    // When the connection is pinned to a pre-resolved IP, keep the original
    // hostname for TLS SNI and the Host header so virtual hosting and
    // certificate verification are unaffected.
    if (connectHost !== parsed.hostname) {
      reqOpts.servername = parsed.hostname;
      reqOpts.headers["Host"] = parsed.hostname;
    }

    // Inject API keys from environment based on endpoint. A per-call
    // api_key in the tool args always takes precedence over the env var
    // fallback, so only one key is ever sent in a single request.
    if (isApiHost(parsed.hostname, "shodan.io")) {
      // Per-call api_key (from the tool invocation args) takes precedence
      // over the env var fallback; only one key parameter is ever sent.
      var shodanKey = (options.args && options.args.api_key) ? options.args.api_key : process.env.SHODAN_KEY;
      if (shodanKey) {
        appendQueryParam(reqOpts, "key", shodanKey);
      }
    }
    if (isApiHost(parsed.hostname, "virustotal.com")) {
      // Per-call api_key (from the tool invocation args) takes precedence
      // over the env var fallback.
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
      var chunks = [];
      var bytes = 0;
      var finished = false;
      var countedBytes = 0;
      var released = false;
      // Give this response's share of the global in-flight budget back.
      // Idempotent: every completion path (end, error, aborted, close) calls
      // it, but only the first call has an effect.
      function releaseInflightBytes() {
        if (released) return;
        released = true;
        inflightResponseBytes -= countedBytes;
      }
      // Reject oversized bodies up front when Content-Length is known.
      var contentLength = parseInt(res.headers && res.headers["content-length"], 10);
      if (!isNaN(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
        releaseInflightBytes();
        reject(new Error("Response too large: Content-Length " + contentLength + " exceeds " + MAX_RESPONSE_BYTES + " bytes"));
        req.destroy();
        return;
      }
      res.on("data", function(chunk) {
        if (inflightResponseBytes + chunk.length > MAX_TOTAL_RESPONSE_BYTES) {
          releaseInflightBytes();
          reject(new Error("Response budget exceeded: " + inflightResponseBytes + " bytes already in flight across concurrent calls, retry when they complete"));
          res.destroy();
          return;
        }
        countedBytes += chunk.length;
        inflightResponseBytes += chunk.length;
        bytes += chunk.length;
        if (bytes > MAX_RESPONSE_BYTES) {
          releaseInflightBytes();
          reject(new Error("Response too large: exceeded " + MAX_RESPONSE_BYTES + " bytes"));
          res.destroy();
          return;
        }
        chunks.push(chunk);
      });
      res.on("end", function() {
        finished = true;
        releaseInflightBytes();
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          // Decode once over the full body: accumulating string chunks can
          // split a multi-byte UTF-8 sequence across chunk boundaries and
          // corrupt it.
          body: Buffer.concat(chunks).toString("utf8"),
          // Redirects are deliberately not followed. Surface the target URL
          // for 3xx responses so callers (e.g. wayback_save snapshots) can
          // use it instead of receiving an empty body.
          location: res.statusCode >= 300 && res.statusCode < 400 && res.headers ? res.headers.location : undefined,
        });
      });
      // If the remote closes the connection before the body completes,
      // settle with an error instead of waiting on a response that will
      // never arrive.
      res.on("aborted", function() {
        releaseInflightBytes();
        reject(new Error("Response aborted by remote"));
      });
      res.on("error", function(err) {
        releaseInflightBytes();
        reject(err);
      });
      res.on("close", function() {
        releaseInflightBytes();
        if (!finished) reject(new Error("Response closed before completion"));
      });
    });

    req.on("error", reject);
    req.on("timeout", function() {
      req.destroy();
      reject(new Error("Request timed out (30s)"));
    });

    if (options.body) req.write(options.body);
    req.end();
    }

    // For user-supplied hostnames, resolve DNS first: every resolved
    // address must be public, and the connection is pinned to the
    // validated IP for the whole request.
    if (options.validateHost) {
      dns.lookup(parsed.hostname, { all: true }, function(err, addresses) {
        if (err) return reject(err);
        if (!addresses || !addresses.length) {
          return reject(new Error("Could not resolve host: " + parsed.hostname));
        }
        for (var i = 0; i < addresses.length; i++) {
          if (!isPublicIp(addresses[i].address)) {
            return reject(new Error("Invalid instance: " + parsed.hostname + " resolves to a non-public address (" + addresses[i].address + ")"));
          }
        }
        dispatch(addresses[0].address);
      });
    } else {
      dispatch(parsed.hostname);
    }
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

// Public-IP policy for connections to user-supplied hostnames: loopback,
// private, link-local, CGNAT, unique-local, multicast and other reserved
// ranges are rejected (see SSRF defense-in-depth for mastodon_user_lookup).
var ipBlockList = null;
function getIpBlockList() {
  if (ipBlockList) return ipBlockList;
  ipBlockList = new net.BlockList();
  ipBlockList.addSubnet("0.0.0.0", 8, "ipv4");
  ipBlockList.addSubnet("10.0.0.0", 8, "ipv4");
  ipBlockList.addSubnet("100.64.0.0", 10, "ipv4");
  ipBlockList.addSubnet("127.0.0.0", 8, "ipv4");
  ipBlockList.addSubnet("169.254.0.0", 16, "ipv4");
  ipBlockList.addSubnet("172.16.0.0", 12, "ipv4");
  ipBlockList.addSubnet("192.0.0.0", 24, "ipv4");
  ipBlockList.addSubnet("192.0.2.0", 24, "ipv4");
  ipBlockList.addSubnet("192.168.0.0", 16, "ipv4");
  ipBlockList.addSubnet("198.18.0.0", 15, "ipv4");
  ipBlockList.addSubnet("198.51.100.0", 24, "ipv4");
  ipBlockList.addSubnet("203.0.113.0", 24, "ipv4");
  ipBlockList.addSubnet("224.0.0.0", 3, "ipv4"); // multicast + reserved
  ipBlockList.addSubnet("192.88.99.0", 24, "ipv4"); // 6to4 relay anycast (deprecated)
  ipBlockList.addSubnet("::", 128, "ipv6");
  ipBlockList.addSubnet("::1", 128, "ipv6");
  ipBlockList.addSubnet("64:ff9b::", 96, "ipv6");
  ipBlockList.addSubnet("2001:db8::", 32, "ipv6");
  ipBlockList.addSubnet("2001::", 32, "ipv6"); // Teredo
  ipBlockList.addSubnet("2001:2::", 48, "ipv6"); // benchmarking
  ipBlockList.addSubnet("2002::", 16, "ipv6");
  // IPv4-compatible addresses (::x, including the hex loopback form ::7f00:1).
  // NOTE: ::ffff:0:0/96 must NOT be added — BlockList's v4-mapped
  // normalization makes it equivalent to 0.0.0.0/0 and it would reject all
  // IPv4 traffic. v4-mapped addresses are normalized to plain IPv4 in
  // isPublicIp() before any list check.
  ipBlockList.addSubnet("::", 96, "ipv6");
  ipBlockList.addSubnet("fc00::", 7, "ipv6");
  ipBlockList.addSubnet("fe80::", 10, "ipv6");
  ipBlockList.addSubnet("ff00::", 8, "ipv6");
  return ipBlockList;
}

function isPublicIp(ip) {
  ip = String(ip || "");
  // An IPv4-mapped IPv6 address (::ffff:a.b.c.d) is routed as plain IPv4.
  var mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip);
  if (mapped) ip = mapped[1];
  var family = net.isIP(ip);
  if (family === 0) return false;
  return !getIpBlockList().check(ip, family === 4 ? "ipv4" : "ipv6");
}

// Redact sensitive fields from tool args before returning them in the response
// payload. Prevents accidental API key leakage through the `query: args` field.
var SENSITIVE_ARG_KEYS = /^(x-api[\s_-]*key|api[\s_-]*key|apikey|access[_-]?token|session[_-]?id|sig|client[_-]?secret|authorization|bearer|token|secret|password|hibp[_-]?key|shodan[_-]?key|vt[_-]?api[_-]?key|hunter[_-]?key|etherscan[_-]?key|securitytrails[_-]?key)$/i;

var MAX_REDACT_DEPTH = 6;

// Sensitive keys are redacted at every nesting level, not just the top one,
// so a key buried inside an object or array argument cannot be echoed back
// in a response payload. Recursion is depth-capped to keep the cost bounded.
function redactSensitiveArgs(value, depth) {
  depth = depth || 0;
  if (Array.isArray(value)) {
    if (depth >= MAX_REDACT_DEPTH) return "[DEPTH_LIMIT]";
    return value.map(function (item) { return redactSensitiveArgs(item, depth + 1); });
  }
  if (!value || typeof value !== "object") return value;
  if (depth >= MAX_REDACT_DEPTH) return "[DEPTH_LIMIT]";
  var redacted = {};
  for (var k in value) {
    if (Object.prototype.hasOwnProperty.call(value, k)) {
      if (SENSITIVE_ARG_KEYS.test(k)) {
        redacted[k] = value[k] ? "[REDACTED]" : value[k];
      } else {
        redacted[k] = redactSensitiveArgs(value[k], depth + 1);
      }
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

  // `arguments` must be a plain object before the schema loops below touch
  // it; anything else (string, number, array) fails with a clear local error.
  if (!args || typeof args !== "object" || Array.isArray(args)) {
    throw new Error("Invalid arguments: expected an object");
  }

  // Enforce the registry's input_schema before building any URL: apply
  // property defaults and fail fast on missing required arguments with a
  // clear local error.
  var schema = tool.input_schema || {};
  var schemaProps = schema.properties || {};
  for (var defKey in schemaProps) {
    if (Object.prototype.hasOwnProperty.call(schemaProps, defKey) &&
        (args[defKey] === undefined || args[defKey] === null) && schemaProps[defKey] && schemaProps[defKey].default !== undefined) {
      args[defKey] = schemaProps[defKey].default;
    }
  }
  var requiredProps = schema.required || [];
  for (var reqIdx = 0; reqIdx < requiredProps.length; reqIdx++) {
    if (args[requiredProps[reqIdx]] === undefined || args[requiredProps[reqIdx]] === null || args[requiredProps[reqIdx]] === "") {
      throw new Error("Invalid arguments: missing required property '" + requiredProps[reqIdx] + "'");
    }
  }

  // Validate declared property types and enum values so malformed arguments
  // fail locally with a clear error instead of reaching the upstream API.
  for (var valKey in schemaProps) {
    if (!Object.prototype.hasOwnProperty.call(schemaProps, valKey)) continue;
    var valSchema = schemaProps[valKey] || {};
    if (args[valKey] === undefined || args[valKey] === null) continue;
    if (valSchema.type) {
      var allowedTypes = Array.isArray(valSchema.type) ? valSchema.type : [valSchema.type];
      var actualType = Array.isArray(args[valKey]) ? "array" : typeof args[valKey];
      var typeMatch = allowedTypes.some(function (t) {
        if (t === actualType) return true;
        if (t === "integer" && actualType === "number" && Number.isInteger(args[valKey])) return true;
        return false;
      });
      if (!typeMatch) {
        throw new Error("Invalid arguments: property '" + valKey + "' must be of type " + allowedTypes.join(" or ") + " (got " + actualType + ")");
      }
    }
    if (valSchema.enum && valSchema.enum.indexOf(args[valKey]) === -1) {
      throw new Error("Invalid arguments: property '" + valKey + "' must be one of: " + valSchema.enum.join(", "));
    }
  }

  // Reject properties the schema does not declare. They used to be ignored
  // silently, which hid caller mistakes (e.g. an api_key sent to a tool that
  // never reads it) and let caller-controlled keys reach the URL-building
  // loops below.
  for (var argKey in args) {
    if (Object.prototype.hasOwnProperty.call(args, argKey) &&
        !Object.prototype.hasOwnProperty.call(schemaProps, argKey)) {
      throw new Error("Invalid arguments: unknown property '" + argKey + "'");
    }
  }

  // Local tool: verify_output_integrity (no HTTP call, returns immediately).
  if (toolName === "verify_output_integrity") {
    // A hash that is not a 64-character lowercase hex digest can never match
    // a sha256 output; reject it instead of reporting a misleading valid:false.
    if (!/^[a-f0-9]{64}$/.test(args.hash)) {
      throw new Error("Invalid arguments: hash must be a 64-character lowercase hex string");
    }
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

  // Replace {placeholder} tokens in the endpoint with argument values. The
  // loop walks the schema's declared properties, not the caller's keys, so
  // caller-controlled argument names are never compiled into RegExps. Null
  // values are treated as absent (defaults were already applied above).
  var key;
  for (key in schemaProps) {
    if (Object.prototype.hasOwnProperty.call(schemaProps, key) &&
        args[key] !== undefined && args[key] !== null) {
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

  // An unresolved {placeholder} at this point means the call is missing an
  // argument; return a local error.
  var unresolved = endpoint.match(/\{[a-zA-Z0-9_]+\}/);
  if (unresolved) {
    throw new Error("Invalid arguments: missing value for endpoint parameter " + unresolved[0]);
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

  var fetchOpts = { headers: headers, args: args };
  // User-supplied hostname: resolve and validate it before connecting.
  if (toolName === "mastodon_user_lookup") fetchOpts.validateHost = true;

  var response = await fetchUrl(endpoint, fetchOpts);

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
    endpoint: endpoint.replace(/([?&])(x-api[\s_-]*key|api[\s_-]*key|apikey|access[_-]?token|session[_-]?id|sig|client[_-]?secret|authorization|bearer|key|token|secret|password)=[^&\s]+/gi, "$1$2=REDACTED"),
    status: response.statusCode,
    timestamp: new Date().toISOString(),
    result: parsed,
  };

  // For 3xx responses the body is usually empty and the redirect target is
  // the actual payload (e.g. a wayback_save snapshot URL). Apply the same
  // query-parameter redaction used for endpoints, since some APIs echo the
  // key back inside the Location header.
  if (response.location) {
    responseObject.redirect = response.location.replace(/([?&])(x-api[\s_-]*key|api[\s_-]*key|apikey|access[_-]?token|session[_-]?id|sig|client[_-]?secret|authorization|bearer|key|token|secret|password)=[^&\s]+/gi, "$1$2=REDACTED");
  }

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

  if (method === "initialized") {
    return; // Always a notification, never a response
  }

  // JSON-RPC notifications carry no id and never receive a response.
  // Everything past this point is a request, where any id (including 0)
  // must be echoed back verbatim.
  if (id === undefined || id === null) return;

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
      await acquireCallSlot();
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
      } finally {
        releaseCallSlot();
      }
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

  error(id, -32601, "Method not found: " + method);
}

// ── Main loop ───────────────────────────────────────────────────────────────

// In-flight tools/call counter: lets the server drain pending responses on
// stdin EOF instead of exiting mid-request and losing them.
var pendingCalls = 0;

// Cap on simultaneous outbound tool calls; excess calls wait in a FIFO
// queue. The queue itself is capped too: beyond MAX_QUEUED_CALLS, new calls
// fail fast with a visible error instead of piling up unboundedly.
var MAX_CONCURRENT_CALLS = 8;
var MAX_QUEUED_CALLS = 64;
var activeCalls = 0;
var callQueue = [];

function acquireCallSlot() {
  return new Promise(function(resolve, reject) {
    function grant() {
      activeCalls++;
      resolve();
    }
    if (activeCalls < MAX_CONCURRENT_CALLS) grant();
    else if (callQueue.length >= MAX_QUEUED_CALLS) {
      reject(new Error("Server busy: " + callQueue.length + " tool calls already queued, retry after in-flight calls complete"));
    } else {
      callQueue.push(grant);
    }
  });
}

function releaseCallSlot() {
  activeCalls--;
  if (callQueue.length > 0 && activeCalls < MAX_CONCURRENT_CALLS) {
    callQueue.shift()();
  }
}

var buffer = "";

process.stdin.setEncoding("utf-8");

// Parse and dispatch one complete stdin line. Per JSON-RPC 2.0, a line that
// is not valid JSON is answered with -32700, and a structurally invalid
// message (not an object, a batch array, a request with a null id, or an
// object with an id but no method) with -32600. Both carry id:null because
// the request id is unknown or unusable. Notifications (no id) never
// receive a response.
function handleLine(line) {
  var msg;
  try {
    msg = JSON.parse(line);
  } catch (err) {
    process.stderr.write("[osint-agent-skills] JSON parse error: " + err.message + "\n");
    error(null, -32700, "Parse error: " + err.message);
    return;
  }
  // JSON-RPC messages are objects. Anything else (null, a bare number,
  // string, boolean, or a batch array) cannot carry a method and id.
  if (msg === null || typeof msg !== "object" || Array.isArray(msg)) {
    process.stderr.write("[osint-agent-skills] Ignoring non-object message\n");
    error(null, -32600, "Invalid Request: expected a single JSON-RPC message object");
    return;
  }
  // A request with a null id is malformed: ids must be strings or numbers
  // (notifications carry no id at all). Answer instead of staying silent.
  if (msg.id === null) {
    error(null, -32600, "Invalid Request: id must be a string or number, not null");
    return;
  }
  // An object with an id but no method cannot be routed to a handler.
  if (msg.method === undefined && msg.id !== undefined) {
    error(msg.id, -32600, "Invalid Request: missing method");
    return;
  }
  handleMessage(msg).catch(function(err) {
    process.stderr.write("[osint-agent-skills] Error handling message: " + err.message + "\n");
    if (msg.id !== undefined && msg.id !== null) error(msg.id, -32603, err.message);
  });
}

process.stdin.on("data", function(chunk) {
  buffer += chunk;
  var newlineIdx;
  while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
    var line = buffer.slice(0, newlineIdx).trim();
    buffer = buffer.slice(newlineIdx + 1);
    if (!line) continue;
    handleLine(line);
  }
});

process.stdin.on("end", function() {
  // A trailing line without a final newline is still a complete message.
  if (buffer.trim()) handleLine(buffer.trim());
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
