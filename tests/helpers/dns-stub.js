"use strict";

// Test DNS stub for tests/server.test.js. Replaces dns.lookup so hostname
// validation (public-IP policy, multi-answer responses) can be exercised
// without network access. The address list per hostname comes from the
// STUB_DNS environment variable as JSON, e.g.
//   STUB_DNS={"public.example":["93.184.216.34"],"mixed.example":["93.184.216.34","10.0.0.5"]}
// Hostnames without a mapping resolve to a single public address.

const dns = require("dns");
const net = require("net");

const answers = {};
try {
  Object.assign(answers, JSON.parse(process.env.STUB_DNS || "{}"));
} catch (e) {
  // Fall back to the default public address for every hostname.
}

const DEFAULT_ADDRESS = "93.184.216.34";

dns.lookup = function (hostname, opts, callback) {
  if (typeof opts === "function") {
    callback = opts;
    opts = {};
  }
  const list = answers[hostname] || [DEFAULT_ADDRESS];
  process.nextTick(function () {
    if (opts && opts.all) {
      callback(null, list.map(function (a) {
        return { address: a, family: net.isIP(a) || 4 };
      }));
    } else {
      callback(null, list[0], net.isIP(list[0]) || 4);
    }
  });
};
