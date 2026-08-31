"use strict";

// Test transport stub for tests/server.test.js. Replaces http.request and
// https.request so HTTP behavior (status codes, response headers, chunked
// bodies, redirects, oversized responses, in-flight caps) can be exercised
// without network access. Response bodies are delivered as real Buffers,
// with multi-byte UTF-8 sequences split across chunk boundaries where
// relevant, so body decoding is exercised the way a real socket would.
//
// The response shape is selected through the STUB_MODE environment variable:
//   ok         200, small JSON body
//   forbidden  403, JSON body
//   throttled  429 + retry-after + x-ratelimit-* headers
//   redirect   302 + Location header with key-like query params
//   utf8split  200, body of 600 "e-acute" chars split mid-sequence in two chunks
//   huge       200 with a Content-Length over the response cap
//   slow       request accepted, response never arrives
//
// Every request is appended to the STUB_LOG file (one JSON line per request)
// so tests can assert on the exact hostname, path, and headers sent.

const http = require("http");
const https = require("https");
const fs = require("fs");
const { Readable, EventEmitter } = require("stream");

function currentMode() {
  return process.env.STUB_MODE || "ok";
}

function stubRequest(reqOpts, callback) {
  const entry = {
    hostname: reqOpts.hostname,
    path: reqOpts.path,
    headers: reqOpts.headers || {},
    method: reqOpts.method || "GET",
  };
  if (process.env.STUB_LOG) {
    try {
      fs.appendFileSync(process.env.STUB_LOG, JSON.stringify(entry) + "\n");
    } catch (e) {
      // A logging failure must never break the request under test.
    }
  }

  const mode = currentMode();
  const req = new EventEmitter();
  req.write = function () { return true; };
  req.end = function () {};
  req.destroy = function () {};
  if (mode === "slow") return req; // the response never settles

  const res = new Readable({ read: function () {} });
  res.statusCode = 200;
  res.headers = {};
  let body = Buffer.from(JSON.stringify({ stub: "ok" }));

  if (mode === "forbidden") {
    res.statusCode = 403;
    body = Buffer.from(JSON.stringify({ message: "rate limit exceeded" }));
  } else if (mode === "notfound") {
    res.statusCode = 404;
    body = Buffer.from(JSON.stringify({ message: "not found" }));
  } else if (mode === "throttled") {
    res.statusCode = 429;
    res.headers["retry-after"] = "60";
    res.headers["x-ratelimit-remaining"] = "0";
    res.headers["x-ratelimit-reset"] = "1750000000";
    body = Buffer.from(JSON.stringify({ message: "too many requests" }));
  } else if (mode === "redirect") {
    res.statusCode = 302;
    res.headers["location"] = "https://snapshot.example/archive?access_token=SECRETO&sig=ABC123";
    body = Buffer.alloc(0);
  } else if (mode === "utf8split") {
    // "é" encodes as two UTF-8 bytes; the split below hands the first byte
    // of the first character in its own chunk, so per-chunk string decoding
    // would corrupt it.
    body = Buffer.from("é".repeat(600), "utf8");
  } else if (mode === "huge") {
    res.statusCode = 200;
    res.headers["content-length"] = String(6 * 1024 * 1024);
    body = Buffer.alloc(0);
  }

  process.nextTick(function () {
    callback(res);
    process.nextTick(function () {
      if (mode === "utf8split") {
        res.push(body.subarray(0, 1));
        res.push(body.subarray(1));
        res.push(null);
      } else {
        if (body.length) res.push(body);
        res.push(null);
      }
    });
  });
  return req;
}

http.request = stubRequest;
https.request = stubRequest;
