"use strict";

// Offline tests for the stdio MCP server. These exercise local behavior
// only (protocol handling, argument validation, redaction, integrity
// verification), so the suite runs without network access and without
// dependencies. Each test drives the server exactly the way an MCP client
// would: JSON-RPC messages on stdin, responses on stdout.

const test = require("node:test");
const assert = require("node:assert");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const SERVER = path.join(ROOT, "tools", "mcp-server.js");

// Send a batch of JSON-RPC messages, wait for the server to drain and exit,
// and return every parsed response line.
function session(messages) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [SERVER], { cwd: ROOT, stdio: ["pipe", "pipe", "inherit"] });
    let buffer = "";
    const responses = [];
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
    child.on("error", reject);
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("server did not exit within 15s"));
    }, 15000);
    child.on("exit", (code) => {
      clearTimeout(timer);
      resolve({ responses, code });
    });
    for (const m of messages) child.stdin.write(JSON.stringify(m) + "\n");
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

test("initialize reports the package version", async () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf-8"));
  const { responses } = await session([{ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }]);
  const init = responses.find((r) => r.id === 1);
  assert.ok(init && init.result, "initialize must answer");
  assert.equal(init.result.serverInfo.version, pkg.version);
});

test("tools/list exposes the whole registry", async () => {
  const registry = JSON.parse(fs.readFileSync(path.join(ROOT, "tools", "mcp-tools.json"), "utf-8"));
  const { responses } = await session([{ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }]);
  const list = responses.find((r) => r.id === 2);
  assert.equal(list.result.tools.length, registry.tools.length);
});

test("numeric id 0 is echoed on both results and errors", async () => {
  const { responses } = await session([
    { jsonrpc: "2.0", id: 0, method: "no_such_method" },
    { jsonrpc: "2.0", id: 0, method: "ping" },
  ]);
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
  ]);
  assert.equal(responses.length, 0);
});

test("missing required arguments fail locally", async () => {
  const { responses } = await session([call("dns_lookup", {}, 3)]);
  const r = responses.find((x) => x.id === 3);
  assert.equal(r.result.isError, true);
  assert.match(payload(r).message, /missing required property 'domain'/);
});

test("arguments with the wrong type are rejected before any request", async () => {
  const { responses } = await session([call("dns_lookup", { domain: 123 }, 4)]);
  const r = responses.find((x) => x.id === 4);
  assert.equal(r.result.isError, true);
  assert.match(payload(r).message, /property 'domain' must be of type string/);
});

test("declared enum values are enforced", async () => {
  const { responses } = await session([call("dns_lookup", { domain: "example.com", type: "NOT-A-TYPE" }, 5)]);
  const r = responses.find((x) => x.id === 5);
  assert.equal(r.result.isError, true);
  assert.match(payload(r).message, /property 'type' must be one of/);
});

test("unknown tools return an error", async () => {
  const { responses } = await session([call("no_such_tool", {}, 6)]);
  const r = responses.find((x) => x.id === 6);
  assert.equal(r.result.isError, true);
  assert.match(payload(r).message, /Unknown tool/);
});

test("verify_output_integrity rejects malformed hashes", async () => {
  const args = { hash: "not-a-hash", tool: "dns_lookup", endpoint: "https://dns.google/resolve", status: 200, result: { a: 1 } };
  const { responses } = await session([call("verify_output_integrity", args, 7)]);
  const r = responses.find((x) => x.id === 7);
  assert.equal(r.result.isError, true);
  assert.match(payload(r).message, /64-character lowercase hex/);
});

test("verify_output_integrity accepts a well-formed hash", async () => {
  const fields = { tool: "dns_lookup", endpoint: "https://dns.google/resolve", status: 200, result: { a: 1 } };
  const hash = crypto.createHash("sha256").update(JSON.stringify(fields)).digest("hex");
  const { responses } = await session([call("verify_output_integrity", Object.assign({ hash: hash }, fields), 8)]);
  const r = responses.find((x) => x.id === 8);
  assert.equal(payload(r).result.valid, true);
});

test("sensitive argument keys are redacted at every nesting level", async () => {
  const fields = { tool: "dns_lookup", endpoint: "https://dns.google/resolve", status: 200, result: { answer: 42 } };
  const hash = crypto.createHash("sha256").update(JSON.stringify(fields)).digest("hex");
  const args = Object.assign(
    { hash: hash, nested: { api_key: "abc", list: [{ token: "def" }] } },
    fields
  );
  const { responses } = await session([call("verify_output_integrity", args, 9)]);
  const r = responses.find((x) => x.id === 9);
  const echoed = payload(r).query;
  assert.equal(echoed.nested.api_key, "[REDACTED]");
  assert.equal(echoed.nested.list[0].token, "[REDACTED]");
});
