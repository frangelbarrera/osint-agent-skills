"use strict";

// Offline tests for the stdio MCP server. These exercise local behavior
// (protocol handling, argument validation, redaction, integrity
// verification) plus the HTTP transport through a stubbed http/https module
// and a stubbed dns.lookup, so the whole suite runs without network access
// and without dependencies. Each test drives the server exactly the way an
// MCP client would: JSON-RPC messages on stdin, responses on stdout.

const test = require("node:test");
const assert = require("node:assert");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const SERVER = path.join(ROOT, "tools", "mcp-server.js");
const HTTP_STUB = path.join(__dirname, "helpers", "http-stub.js");
const DNS_STUB = path.join(__dirname, "helpers", "dns-stub.js");

// Request log files (one per session) live in a private temp directory.
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "osint-agent-skills-tests-"));
let logCounter = 0;
function newLog() {
  return path.join(TMP, "requests-" + ++logCounter + ".jsonl");
}
function readLog(logPath) {
  try {
    return fs.readFileSync(logPath, "utf-8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  } catch (e) {
    return [];
  }
}

// Spawn the server the way an MCP client would. Preloads the http/dns stubs
// unless opts.stubs === false, and merges opts.env over the environment.
function spawnServer(opts) {
  opts = opts || {};
  const args = [];
  if (opts.stubs !== false) args.push("-r", HTTP_STUB, "-r", DNS_STUB);
  args.push(SERVER);
  const child = spawn(process.execPath, args, {
    cwd: ROOT,
    stdio: ["pipe", "pipe", "inherit"],
    env: Object.assign({}, process.env, opts.env || {}),
  });
  const responses = [];
  let buffer = "";
  child.stdout.setEncoding("utf-8");
  child.stdout.on("data", (d) => {
    buffer += d;
    let idx;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (line) {
        try { responses.push(JSON.parse(line)); } catch (e) { /* not JSON: ignore */ }
      }
    }
  });
  return {
    child: child,
    responses: responses,
    push(msg) { child.stdin.write((typeof msg === "string" ? msg : JSON.stringify(msg)) + "\n"); },
  };
}

// Send a batch of JSON-RPC messages (objects, or raw lines as strings),
// wait for the server to drain and exit, and return every parsed response.
function session(messages, opts) {
  opts = opts || {};
  return new Promise((resolve, reject) => {
    const h = spawnServer(opts);
    const child = h.child;
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("server did not exit within 15s"));
    }, 15000);
    child.on("error", reject);
    child.on("exit", (code) => {
      clearTimeout(timer);
      resolve({ responses: h.responses, code: code });
    });
    messages.forEach((m, i) => {
      const text = typeof m === "string" ? m : JSON.stringify(m);
      const isLast = i === messages.length - 1;
      child.stdin.write(text + (isLast && opts.noFinalNewline ? "" : "\n"));
    });
    child.stdin.end();
  });
}

// Unwrap the tool payload carried inside a CallToolResult.
function payload(response) {
  return JSON.parse(response.result.content[0].text);
}

function call(name, args, id) {
  return { jsonrpc: "2.0", id: id, method: "tools/call", params: { name: name, arguments: args } };
}

function busyResponses(responses) {
  return responses.filter((r) => {
    if (!r.result || !r.result.isError) return false;
    try { return /Server busy/.test(payload(r).message); } catch (e) { return false; }
  });
}

// ── Protocol ────────────────────────────────────────────────────────────────

test("initialize reports the package version", async () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf-8"));
  const { responses } = await session([{ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }], { stubs: false });
  const init = responses.find((r) => r.id === 1);
  assert.ok(init && init.result, "initialize must answer");
  assert.equal(init.result.serverInfo.version, pkg.version);
});

test("tools/list exposes the whole registry", async () => {
  const registry = JSON.parse(fs.readFileSync(path.join(ROOT, "tools", "mcp-tools.json"), "utf-8"));
  const { responses } = await session([{ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }], { stubs: false });
  const list = responses.find((r) => r.id === 2);
  assert.equal(list.result.tools.length, registry.tools.length);
});

test("numeric id 0 is echoed on both results and errors", async () => {
  const { responses } = await session([
    { jsonrpc: "2.0", id: 0, method: "no_such_method" },
    { jsonrpc: "2.0", id: 0, method: "ping" },
  ], { stubs: false });
  const err = responses.find((r) => r.id === 0 && r.error);
  assert.ok(err, "an error response for id 0 is required");
  assert.equal(err.error.code, -32601);
  const pong = responses.find((r) => r.id === 0 && r.result);
  assert.ok(pong, "a result for id 0 is required");
});

test("messages without an id (notifications) produce no response", async () => {
  const { responses } = await session([
    { jsonrpc: "2.0", method: "ping" },
    { jsonrpc: "2.0", method: "initialized" },
    { jsonrpc: "2.0", method: "no_such_method" },
  ], { stubs: false });
  assert.equal(responses.length, 0);
});

test("malformed JSON lines are answered with -32700", async () => {
  const { responses } = await session([
    "not json{{",
    { jsonrpc: "2.0", id: 51, method: "ping" },
  ], { stubs: false });
  assert.equal(responses[0].error.code, -32700);
  assert.equal(responses[0].id, null);
  assert.ok(responses.find((r) => r.id === 51 && r.result), "the server must keep answering after a parse error");
});

test("non-object JSON lines are answered with -32600", async () => {
  const { responses } = await session([
    "42",
    { jsonrpc: "2.0", id: 52, method: "ping" },
  ], { stubs: false });
  assert.equal(responses[0].error.code, -32600);
  assert.equal(responses[0].id, null);
  assert.ok(responses.find((r) => r.id === 52 && r.result));
});

test("batch arrays are answered with -32600", async () => {
  const { responses } = await session([
    '[{"jsonrpc":"2.0","id":1,"method":"ping"}]',
  ], { stubs: false });
  assert.equal(responses.length, 1);
  assert.equal(responses[0].error.code, -32600);
  assert.equal(responses[0].id, null);
});

test("an object with an id but no method is invalid", async () => {
  const { responses } = await session([{ jsonrpc: "2.0", id: 53 }], { stubs: false });
  assert.equal(responses.length, 1);
  assert.equal(responses[0].error.code, -32600);
  assert.equal(responses[0].id, 53);
});

test("requests with a null id are rejected and not executed", async () => {
  const log = newLog();
  const { responses } = await session([
    { jsonrpc: "2.0", id: null, method: "tools/call", params: { name: "dns_lookup", arguments: { domain: "example.com" } } },
  ], { env: { STUB_MODE: "ok", STUB_LOG: log } });
  assert.equal(responses.length, 1);
  assert.equal(responses[0].error.code, -32600);
  assert.equal(responses[0].id, null);
  assert.equal(readLog(log).length, 0, "a malformed request must not reach the transport");
});

test("a trailing line without a newline is still processed", async () => {
  const { responses } = await session([{ jsonrpc: "2.0", id: 54, method: "ping" }], { stubs: false, noFinalNewline: true });
  const pong = responses.find((r) => r.id === 54 && r.result);
  assert.ok(pong, "the final line must be parsed even without a trailing newline");
});

// ── Argument validation ─────────────────────────────────────────────────────

test("missing required arguments fail locally", async () => {
  const { responses } = await session([call("dns_lookup", {}, 3)], { stubs: false });
  const r = responses.find((x) => x.id === 3);
  assert.equal(r.result.isError, true);
  assert.match(payload(r).message, /missing required property 'domain'/);
});

test("arguments with the wrong type are rejected before any request", async () => {
  const { responses } = await session([call("dns_lookup", { domain: 123 }, 4)], { stubs: false });
  const r = responses.find((x) => x.id === 4);
  assert.equal(r.result.isError, true);
  assert.match(payload(r).message, /property 'domain' must be of type string/);
});

test("declared enum values are enforced", async () => {
  const { responses } = await session([call("dns_lookup", { domain: "example.com", type: "NOT-A-TYPE" }, 5)], { stubs: false });
  const r = responses.find((x) => x.id === 5);
  assert.equal(r.result.isError, true);
  assert.match(payload(r).message, /property 'type' must be one of/);
});

test("unknown tools return an error", async () => {
  const { responses } = await session([call("no_such_tool", {}, 6)], { stubs: false });
  const r = responses.find((x) => x.id === 6);
  assert.equal(r.result.isError, true);
  assert.match(payload(r).message, /Unknown tool/);
});

test("verify_output_integrity rejects malformed hashes", async () => {
  const args = { hash: "not-a-hash", tool: "dns_lookup", endpoint: "https://dns.google/resolve", status: 200, result: { a: 1 } };
  const { responses } = await session([call("verify_output_integrity", args, 7)], { stubs: false });
  const r = responses.find((x) => x.id === 7);
  assert.equal(r.result.isError, true);
  assert.match(payload(r).message, /64-character lowercase hex/);
});

test("verify_output_integrity accepts a well-formed hash", async () => {
  const fields = { tool: "dns_lookup", endpoint: "https://dns.google/resolve", status: 200, result: { a: 1 } };
  const hash = crypto.createHash("sha256").update(JSON.stringify(fields)).digest("hex");
  const { responses } = await session([call("verify_output_integrity", Object.assign({ hash: hash }, fields), 8)], { stubs: false });
  const r = responses.find((x) => x.id === 8);
  assert.equal(payload(r).result.valid, true);
});

test("sensitive argument keys are redacted at every nesting level", async () => {
  const fields = { tool: "dns_lookup", endpoint: "https://dns.google/resolve", status: 200, result: { answer: 42, api_key: "abc", list: [{ token: "def" }] } };
  const hash = crypto.createHash("sha256").update(JSON.stringify(fields)).digest("hex");
  const args = Object.assign({ hash: hash }, fields);
  const { responses } = await session([call("verify_output_integrity", args, 9)], { stubs: false });
  const r = responses.find((x) => x.id === 9);
  const echoed = payload(r).query;
  assert.equal(echoed.result.api_key, "[REDACTED]");
  assert.equal(echoed.result.list[0].token, "[REDACTED]");
});

test("unknown argument properties are rejected locally", async () => {
  const log = newLog();
  const { responses } = await session([call("dns_lookup", { domain: "example.com", extra: "x" }, 10)], {
    env: { STUB_MODE: "ok", STUB_LOG: log },
  });
  const r = responses.find((x) => x.id === 10);
  assert.equal(r.result.isError, true);
  assert.match(payload(r).message, /unknown property 'extra'/);
  assert.equal(readLog(log).length, 0, "rejected arguments must not reach the transport");
});

test("regex-metacharacter argument keys are rejected, not compiled", async () => {
  const log = newLog();
  const { responses } = await session([
    call("shodan_internetdb", { ip: "1.2.3.4", ".*": "EVILINJECT" }, 11),
    call("shodan_internetdb", { ip: "1.2.3.4", "x(": "EVILINJECT" }, 12),
  ], { env: { STUB_MODE: "ok", STUB_LOG: log } });
  for (const id of [11, 12]) {
    const r = responses.find((x) => x.id === id);
    assert.equal(r.result.isError, true, "id " + id + " must fail");
    assert.match(payload(r).message, /unknown property/);
    assert.ok(!/SyntaxError/.test(payload(r).message), "argument keys must never reach RegExp compilation");
  }
  assert.equal(readLog(log).length, 0);
});

test("non-object arguments fail with a clear error", async () => {
  const log = newLog();
  const { responses } = await session([
    { jsonrpc: "2.0", id: 13, method: "tools/call", params: { name: "dns_lookup", arguments: "oops" } },
  ], { env: { STUB_MODE: "ok", STUB_LOG: log } });
  const r = responses.find((x) => x.id === 13);
  assert.equal(r.result.isError, true);
  assert.match(payload(r).message, /expected an object/);
  assert.equal(readLog(log).length, 0);
});

test("null argument values fall back to schema defaults", async () => {
  const log = newLog();
  const { responses } = await session([call("dns_lookup", { domain: "example.com", type: null }, 14)], {
    env: { STUB_MODE: "ok", STUB_LOG: log },
  });
  const r = responses.find((x) => x.id === 14);
  assert.ok(r.result && !r.result.isError, "the call must succeed with the default");
  const entries = readLog(log);
  assert.equal(entries.length, 1);
  assert.match(entries[0].path, /type=A/);
  assert.ok(!/type=null/.test(entries[0].path), "null must never be sent as a literal parameter value");
});

// ── HTTP transport (stubbed) ────────────────────────────────────────────────

test("HTTP error statuses are marked as tool errors", async () => {
  const { responses } = await session([call("dns_lookup", { domain: "example.com" }, 20)], {
    env: { STUB_MODE: "forbidden" },
  });
  const r = responses.find((x) => x.id === 20);
  assert.equal(r.result.isError, true);
  assert.equal(payload(r).status, 403);
});

test("HTTP 404 stays a normal result for OSINT semantics", async () => {
  const { responses } = await session([call("dns_lookup", { domain: "example.com" }, 21)], {
    env: { STUB_MODE: "notfound" },
  });
  const r = responses.find((x) => x.id === 21);
  assert.ok(r.result && !r.result.isError, "404 is a valid answer, not a tool error");
  assert.equal(payload(r).status, 404);
});

test("rate-limit headers are surfaced on throttled responses", async () => {
  const { responses } = await session([call("dns_lookup", { domain: "example.com" }, 22)], {
    env: { STUB_MODE: "throttled" },
  });
  const r = responses.find((x) => x.id === 22);
  assert.equal(r.result.isError, true);
  assert.equal(payload(r).status, 429);
  assert.deepEqual(payload(r).rate_limit, { retry_after: "60", remaining: "0", reset: "1750000000" });
});

test("multi-byte UTF-8 bodies survive chunk boundaries", async () => {
  const { responses } = await session([call("dns_lookup", { domain: "example.com" }, 23)], {
    env: { STUB_MODE: "utf8split" },
  });
  const r = responses.find((x) => x.id === 23);
  assert.equal(payload(r).result, "é".repeat(600));
});

test("a per-call api_key overrides the environment key", async () => {
  const log = newLog();
  const { responses } = await session([call("shodan_host_lookup", { ip: "1.2.3.4", api_key: "caller-key" }, 24)], {
    env: { STUB_MODE: "ok", STUB_LOG: log, SHODAN_KEY: "env-key" },
  });
  const r = responses.find((x) => x.id === 24);
  const entries = readLog(log);
  assert.equal(entries.length, 1);
  assert.match(entries[0].path, /key=caller-key/);
  assert.ok(!/env-key/.test(entries[0].path), "the env key must not be sent when a per-call key is given");
  assert.equal((entries[0].path.match(/key=/g) || []).length, 1, "only one key parameter may be sent");
  assert.ok(!/caller-key/.test(payload(r).endpoint), "the per-call key must not leak through the endpoint echo");
  assert.equal(payload(r).query.api_key, "[REDACTED]");
});

test("redirect targets are redacted like endpoints", async () => {
  const { responses } = await session([call("gravatar_lookup", { email: "user@example.com" }, 25)], {
    env: { STUB_MODE: "redirect" },
  });
  const r = responses.find((x) => x.id === 25);
  const p = payload(r);
  assert.ok(p.redirect, "a 3xx response must surface the redirect target");
  assert.match(p.redirect, /access_token=REDACTED/);
  assert.match(p.redirect, /sig=REDACTED/);
  assert.ok(!/SECRETO|ABC123/.test(p.redirect), "key material must not leak through the redirect echo");
});

test("per-call keys in the endpoint echo are redacted", async () => {
  const { responses } = await session([call("hunter_email_finder", { domain: "example.com", api_key: "hunter-key" }, 26)], {
    env: { STUB_MODE: "ok" },
  });
  const r = responses.find((x) => x.id === 26);
  const p = payload(r);
  assert.match(p.endpoint, /api_key=REDACTED/);
  assert.ok(!/hunter-key/.test(p.endpoint), "the per-call key must not leak through the endpoint echo");
  assert.equal(p.query.api_key, "[REDACTED]");
});

test("oversized responses are rejected locally", async () => {
  const { responses } = await session([call("dns_lookup", { domain: "example.com" }, 27)], {
    env: { STUB_MODE: "huge" },
  });
  const r = responses.find((x) => x.id === 27);
  assert.equal(r.result.isError, true);
  assert.match(payload(r).message, /Response too large/);
});

// ── Hostname validation (stubbed DNS) ───────────────────────────────────────

test("resolved addresses in blocked ranges are rejected", async () => {
  const log = newLog();
  const dnsMap = {
    "relay192-blocked.org": ["192.88.99.1"],
    "teredo-blocked.org": ["2001::1"],
    "v4compat-blocked.org": ["::7f00:1"],
    "bench-blocked.org": ["2001:2::1"],
  };
  const messages = Object.keys(dnsMap).map((inst, i) =>
    call("mastodon_user_lookup", { instance: inst, handle: "a@b.com" }, 30 + i));
  const { responses } = await session(messages, {
    env: { STUB_MODE: "ok", STUB_LOG: log, STUB_DNS: JSON.stringify(dnsMap) },
  });
  for (const id of [30, 31, 32, 33]) {
    const r = responses.find((x) => x.id === id);
    assert.equal(r.result.isError, true, "id " + id + " must be rejected");
    assert.match(payload(r).message, /non-public address/);
  }
  assert.equal(readLog(log).length, 0, "blocked resolutions must not reach the transport");
});

test("multi-answer DNS with any private address is rejected", async () => {
  const log = newLog();
  const { responses } = await session([call("mastodon_user_lookup", { instance: "mixed-blocked.org", handle: "a@b.com" }, 34)], {
    env: {
      STUB_MODE: "ok",
      STUB_LOG: log,
      STUB_DNS: JSON.stringify({ "mixed-blocked.org": ["93.184.216.34", "10.0.0.5"] }),
    },
  });
  const r = responses.find((x) => x.id === 34);
  assert.equal(r.result.isError, true);
  assert.match(payload(r).message, /non-public address/);
  assert.equal(readLog(log).length, 0);
});

test("public instances resolve, pin, and answer", async () => {
  const log = newLog();
  const { responses } = await session([call("mastodon_user_lookup", { instance: "mastodon-public.org", handle: "a@b.com" }, 35)], {
    env: {
      STUB_MODE: "ok",
      STUB_LOG: log,
      STUB_DNS: JSON.stringify({ "mastodon-public.org": ["93.184.216.34"] }),
    },
  });
  const r = responses.find((x) => x.id === 35);
  assert.ok(r.result && !r.result.isError);
  assert.equal(payload(r).status, 200);
  const entries = readLog(log);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].hostname, "93.184.216.34", "the connection must be pinned to the resolved IP");
  assert.equal(entries[0].headers.Host, "mastodon-public.org", "the Host header must keep the original hostname");
});

// ── Concurrency and queueing ────────────────────────────────────────────────

test("excess concurrent calls are refused once the queue is full", async () => {
  const log = newLog();
  const h = spawnServer({ env: { STUB_MODE: "slow", STUB_LOG: log } });
  try {
    for (let i = 0; i < 73; i++) {
      h.push(call("dns_lookup", { domain: "example.com" }, 900 + i));
    }
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline && busyResponses(h.responses).length < 1) {
      await new Promise((res) => setTimeout(res, 50));
    }
    assert.equal(busyResponses(h.responses).length, 1, "exactly the call past the queue cap must be refused");
    assert.equal(readLog(log).length, 8, "only the concurrency cap worth of requests may reach the transport");
  } finally {
    h.child.kill("SIGKILL");
  }
});
