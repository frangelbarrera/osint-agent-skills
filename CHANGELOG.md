# Changelog

All notable changes to OSINT Agent Skills are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


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

## [Unreleased]

_Nothing yet._

## [1.3.0] —” 2026-06-27

### Added

- **Test suite** (`tests/test-prompts.md`) —” 10 test prompts with expected behavior,
  pass/fail criteria, and fail indicators. Covers: persona adoption, anti-hallucination,
  domain investigation with pivots, ethics refusal, OPSEC compliance, SATs for
  attribution, confidence labeling, graph generation, timeline generation, and tool
  failure handling. Includes scoring rubric (10/10 = operational, <6 = re-setup required).

- **Validation scripts** (`scripts/validate.ps1` + `scripts/validate.sh`) —” automated
  repository validation. 10 check categories covering: core files, knowledge base,
  tool registries, templates, ethics, JSON validity, YAML validity, MCP server syntax,
  config path references, and system prompt cross-references. Cross-platform
  (PowerShell for Windows, Bash for Linux/macOS). Exit code 0 = pass, 1 = fail.

- **GitHub CI** (`.github/workflows/validate.yml`) —” runs validation on every push
  and PR. Checks: repository structure, MCP server syntax, JSON validity, broken
  internal links, and agent-config.yaml references.

- **Issue templates** (`.github/ISSUE_TEMPLATE/`):
  - `tool-request.md` —” structured form for requesting new tools. Includes fields
    for category, pricing, rate limits, endpoint, example usage, and verification
    checklist.
  - `playbook-request.md` —” structured form for requesting new pivot playbooks.
    Includes trigger, steps, anti-patterns, output format, and verification checklist.

- **PR template** (`.github/PULL_REQUEST_TEMPLATE.md`) —” structured PR form with
  change type, files changed, validation checklist, reviewer notes, and attribution.

- **Quick reference card** (`docs/quick-reference.md`) —” one-page cheat sheet.
  What it is, 30-second setup, what the agent becomes, what's inside (92+ files),
  what it does NOT do, test prompt, validation commands, key principles, license.

### Changed

- `agent-config.yaml` —” no structural changes (v1.2.0 config remains valid). Version
  note: the quick reference and test suite are discoverable via the standard
  directory structure.

## [1.2.0] —” 2026-06-27

### Added

- **Structured Analytic Techniques (SATs)** (`knowledge/methodologies/structured-analytic-techniques.md`)
  —” ACH, Key Assumptions Check, Devil's Advocacy. Mandatory before attribution claims.
- **Threat Actor Profiling** (`knowledge/domains/threat-actors.md` + `templates/reports/threat-actor-profile.md`).
- **Agent OPSEC** (`ethics/agent-opsec.md`) —” 10 operational security rules with pre/post checklists.

### Changed

- `agent-config.yaml` —” v1.2.0. Added SATs, threat actor, OPSEC references.
- `system-prompt.md` —” Phase 4b (SATs), attribution standard, OPSEC rules, threat actor protocol.

## [1.1.0] —” 2026-06-27

### Added

- **MCP Server** (`tools/mcp-server.js`) —” runnable stdio MCP server.
- **Investigation graph templates** (`templates/graphs/`) —” Mermaid, DOT, JSON schema.
- **Graph generation technique** (`knowledge/techniques/graph-generation.md`).
- **Timeline template** (`templates/reports/timeline.md`).

### Changed

- `agent-config.yaml` —” v1.1.0. Added graph and timeline references.
- `system-prompt.md` —” graph + timeline mandatory in reports.

## [1.0.0] —” 2026-06-27

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
