# Changelog

All notable changes to OSINT Agent Skills are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased]

_Nothing yet._


## [1.7.0] — 2026-09-01

### Changed

- **Strict argument validation** — properties the tool schema does not declare are now
  rejected with `unknown property '<name>'` instead of being silently ignored. This hides
  caller mistakes no longer: an `api_key` sent to a tool that never reads it (e.g.
  `shodan_internetdb`) now fails fast with a clear error. Null argument values are treated
  as absent, so an explicit `null` falls back to the schema default instead of being sent
  as the literal string `"null"` in a URL.
- **JSON-RPC protocol errors** — a stdin line that is not valid JSON is answered with
  `-32700`, and structurally invalid messages (non-objects, batch arrays, requests with a
  `null` id, objects with an id but no method) with `-32600`. All of these were previously
  logged to stderr and dropped. A request with a `null` id is malformed per JSON-RPC 2.0
  and is no longer executed silently. A trailing line without a final newline is now
  processed as a complete message on stdin end instead of being discarded.

### Fixed

- **UTF-8 response decoding** — HTTP bodies are accumulated as Buffers and decoded once,
  instead of concatenated as per-chunk strings. Multi-byte sequences split across chunk
  boundaries no longer corrupt into U+FFFD, which also made `output_hash` non-deterministic.
- **Redaction widened** — the sensitive-key pattern for echoed `query` objects now covers
  `x-api-key`, `access_token`, `session_id`, `sig`, `client_secret`, `authorization`,
  `bearer` and spaced/doubled `api key` spellings; the endpoint and redirect echoes now
  redact the same key-shaped query parameters (`access_token=`, `sig=`, `session_id=`, …)
  instead of only `api_key`-style names.
- **Endpoint placeholders walk the schema** — `{placeholder}` substitution iterates the
  schema's declared properties, so caller-controlled argument names are never compiled into
  RegExps (a `".*"` or `"x("` key used to reach `new RegExp` and could rewrite the whole
  path or throw a `SyntaxError`).

### Security

- **Blocked-IP policy widened** — the connection-time blocklist now also rejects the
  deprecated 6to4 relay anycast (`192.88.99.0/24`), Teredo (`2001::/32`), benchmarking
  (`2001:2::/48`) and IPv4-compatible addresses (`::/96`, which covers the hex loopback
  form `::7f00:1`). Note for future edits: `::ffff:0:0/96` must never be added — Node's
  BlockList treats it as `0.0.0.0/0` and it would reject all IPv4 traffic.

### Added

- **Offline test suite** — `tests/server.test.js` (33 tests, zero dependencies) now covers
  JSON-RPC protocol errors, argument validation, key redaction, rate-limit header
  surfacing, multi-byte chunk decoding, redirect/endpoint echoes, oversized responses,
  API key precedence, DNS-based host validation, and the concurrency/queue caps, using an
  in-process http/dns stub (`tests/helpers/`). Run with `npm test`.


## [1.6.0] — 2026-08-31

Published to npm only (`@frangelbarrera/osint-agent-skills@1.6.0`); documents the
hardening round already on `main` between 1.5.0 and this release.

### Added

- **Rate-limit visibility** — `x-ratelimit-remaining`, `x-ratelimit-reset` and `retry-after`
  response headers are surfaced as a `rate_limit` object on every tool response, so agents
  can back off before crossing a limit.
- **HTTP errors are tool errors** — 401/403/429/5xx responses set `isError: true` (404 stays
  a normal result for OSINT semantics) instead of returning error bodies as successful
  results.
- **Concurrency and response caps** — at most 8 tool calls run concurrently (FIFO queue,
  excess calls beyond 64 queued are refused with `Server busy`); responses are capped at
  5 MB each and 32 MB in flight; truncated responses settle with an error instead of hanging.
- **Redirects surfaced, not followed** — 3xx responses include a `redirect` field with the
  target URL, with key-shaped query parameters redacted.
- **Registry-driven validation** — required/type/enum checks and schema defaults enforced
  before any URL is built; `arguments` must be an object.
- **Test suite introduced** — `npm test` runs the offline protocol suite in `tests/`.


## [1.5.0] — 2026-07-27

### Added

- **Output integrity hashing** — every tool response now includes an `output_hash`
  field: a sha256 over the canonical JSON form of `{tool, endpoint, status, result}`.
  Downstream consumers (audit logs, report verifiers, external scripts) can use this
  hash to confirm that any data attributed to a tool call was actually produced by
  that tool call. Cross-language reproducibility documented in `mcp-server.js`.
- **`verify_output_integrity` tool** — new local tool (no HTTP call) that takes a
  claimed hash + the response payload subset and returns `{valid: true}` if the
  recomputed hash matches, or `{valid: false, expected_hash, actual_hash}` otherwise.
  Designed for downstream verifiers, not in-band LLM self-verification.

### Security (backfilled from `main` between 1.4.1 and 1.5.0)

- **SSRF defense in `mastodon_user_lookup`** — `args.instance` is now validated as a
  public hostname. Rejects IP literals, `inet_aton` shorthand forms (`127.1`,
  `0x7f000001`, `2130706433`, `017700000001`, etc.), path/query injection, localhost,
  cloud metadata endpoints, and magic DNS rebinding names.
- **API key redaction** — `api_key`, `token`, `secret`, and `password` fields are now
  redacted from the `query` object echoed back in tool responses. The endpoint URL
  redaction regex was widened to cover non-hex key values and to preserve the original
  parameter name (`api_key=REDACTED`, `apikey=REDACTED`, `key=REDACTED`, etc.).
- **SecurityTrails auth fix** — `securitytrails_history` now sends the `APIKey` header
  (per-call `api_key` arg or `SECURITYTRAILS_KEY` env var). Previously the tool was
  broken by design: the endpoint had no `{api_key}` placeholder and no header injection.
- **OPSEC User-Agent override** — `OSINT_USER_AGENT` env var now overrides the default
  `User-Agent` on outbound requests. Defaults preserve previous behavior.


## [1.4.0] — 2026-06-28

### Added

- **Deep domain rewrites** — dark-web.md (8.6KB) and cryptocurrency.md (10.7KB) rewritten
  with operational procedures. Dark web: Tor/.onion v3, marketplaces, forums, paste sites, ransomware
  leaks, full OPSEC guide. Cryptocurrency: BTC/ETH/XMR chain analysis, clustering heuristics,
  mixers (Wasabi, Samourai, Tornado Cash contract addresses), peel chains, CoinJoin, chainhopping.
- **New domain guides** — ehicle.md (10.3KB): license plates, VIN decoding, registration
  databases by country (US NMVTIS, UK DVLA, EU), stolen vehicle DBs, image corroboration.
  satellite-imagery.md (11.2KB): Sentinel Hub, Landsat, Google Earth, change detection,
  shadow analysis for building height, vehicle counting, QGIS workflow.
- **OSINT-BIBLE mapping** (knowledge/osint-bible-mapping.md, 10.7KB) — 37-row table mapping
  all 33 OSINT-BIBLE sections to their corresponding osint-agent-skills files. Includes 5
  identified gaps (Academic, News, Wireless, Cloud, Vulnerability) as future candidates.
- **Tool versioning** — knowledge/tool-versioning-policy.md with last_verified field
  and staleness thresholds (0-3m fresh / 3-6m current / 6-12m aging / 12m+ stale).
  scripts/check-stale-tools.ps1 and check-stale-tools.sh for automated scanning.
  .github/ISSUE_TEMPLATE/tool-stale.md for community reporting.


## [1.3.0] — 2026-06-27

### Added

- **Test suite** (`tests/test-prompts.md`) — 10 test prompts with expected behavior,
  pass/fail criteria, and fail indicators. Covers: persona adoption, anti-hallucination,
  domain investigation with pivots, ethics refusal, OPSEC compliance, SATs for
  attribution, confidence labeling, graph generation, timeline generation, and tool
  failure handling. Includes scoring rubric (10/10 = operational, <6 = re-setup required).

- **Validation scripts** (`scripts/validate.ps1` + `scripts/validate.sh`) — automated
  repository validation. 10 check categories covering: core files, knowledge base,
  tool registries, templates, ethics, JSON validity, YAML validity, MCP server syntax,
  config path references, and system prompt cross-references. Cross-platform
  (PowerShell for Windows, Bash for Linux/macOS). Exit code 0 = pass, 1 = fail.

- **GitHub CI** (`.github/workflows/validate.yml`) — runs validation on every push
  and PR. Checks: repository structure, MCP server syntax, JSON validity, broken
  internal links, and agent-config.yaml references.

- **Issue templates** (`.github/ISSUE_TEMPLATE/`):
  - `tool-request.md` — structured form for requesting new tools. Includes fields
    for category, pricing, rate limits, endpoint, example usage, and verification
    checklist.
  - `playbook-request.md` — structured form for requesting new pivot playbooks.
    Includes trigger, steps, anti-patterns, output format, and verification checklist.

- **PR template** (`.github/PULL_REQUEST_TEMPLATE.md`) — structured PR form with
  change type, files changed, validation checklist, reviewer notes, and attribution.

- **Quick reference card** (`docs/quick-reference.md`) — one-page cheat sheet.
  What it is, 30-second setup, what the agent becomes, what's inside (92+ files),
  what it does NOT do, test prompt, validation commands, key principles, license.

### Changed

- `agent-config.yaml` — no structural changes (v1.2.0 config remains valid). Version
  note: the quick reference and test suite are discoverable via the standard
  directory structure.


## [1.2.0] — 2026-06-27

### Added

- **Structured Analytic Techniques (SATs)** (`knowledge/methodologies/structured-analytic-techniques.md`)
  — ACH, Key Assumptions Check, Devil's Advocacy. Mandatory before attribution claims.
- **Threat Actor Profiling** (`knowledge/domains/threat-actors.md` + `templates/reports/threat-actor-profile.md`).
- **Agent OPSEC** (`ethics/agent-opsec.md`) — 10 operational security rules with pre/post checklists.

### Changed

- `agent-config.yaml` — v1.2.0. Added SATs, threat actor, OPSEC references.
- `system-prompt.md` — Phase 4b (SATs), attribution standard, OPSEC rules, threat actor protocol.


## [1.1.0] — 2026-06-27

### Added

- **MCP Server** (`tools/mcp-server.js`) — runnable stdio MCP server.
- **Investigation graph templates** (`templates/graphs/`) — Mermaid, DOT, JSON schema.
- **Graph generation technique** (`knowledge/techniques/graph-generation.md`).
- **Timeline template** (`templates/reports/timeline.md`).

### Changed

- `agent-config.yaml` — v1.1.0. Added graph and timeline references.
- `system-prompt.md` — graph + timeline mandatory in reports.


## [1.0.0] — 2026-06-27

### Added

- Initial release. System prompt, agent config, 6 methodologies, 10 domain guides,
  10 techniques, 9 pivot playbooks, 4 tool registries, 5 report templates, 5 ethics
  documents, 5 case studies, 6 integration guides, 3 examples.

### Attribution

- Methodology distilled from OSINT-BIBLE by Frangel Raúl Crespo Barrera
  (https://github.com/frangelbarrera/OSINT-BIBLE).

[Unreleased]: https://github.com/frangelbarrera/osint-agent-skills/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/frangelbarrera/osint-agent-skills/releases/tag/v1.3.0
[1.2.0]: https://github.com/frangelbarrera/osint-agent-skills/releases/tag/v1.2.0
[1.1.0]: https://github.com/frangelbarrera/osint-agent-skills/releases/tag/v1.1.0
[1.0.0]: https://github.com/frangelbarrera/osint-agent-skills/releases/tag/v1.0.0
