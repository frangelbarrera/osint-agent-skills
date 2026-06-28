# Changelog

All notable changes to OSINT Agent Skills are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased]

_Nothing yet._

## [1.3.0] â€” 2026-06-27

### Added

- **Test suite** (`tests/test-prompts.md`) â€” 10 test prompts with expected behavior,
  pass/fail criteria, and fail indicators. Covers: persona adoption, anti-hallucination,
  domain investigation with pivots, ethics refusal, OPSEC compliance, SATs for
  attribution, confidence labeling, graph generation, timeline generation, and tool
  failure handling. Includes scoring rubric (10/10 = operational, <6 = re-setup required).

- **Validation scripts** (`scripts/validate.ps1` + `scripts/validate.sh`) â€” automated
  repository validation. 10 check categories covering: core files, knowledge base,
  tool registries, templates, ethics, JSON validity, YAML validity, MCP server syntax,
  config path references, and system prompt cross-references. Cross-platform
  (PowerShell for Windows, Bash for Linux/macOS). Exit code 0 = pass, 1 = fail.

- **GitHub CI** (`.github/workflows/validate.yml`) â€” runs validation on every push
  and PR. Checks: repository structure, MCP server syntax, JSON validity, broken
  internal links, and agent-config.yaml references.

- **Issue templates** (`.github/ISSUE_TEMPLATE/`):
  - `tool-request.md` â€” structured form for requesting new tools. Includes fields
    for category, pricing, rate limits, endpoint, example usage, and verification
    checklist.
  - `playbook-request.md` â€” structured form for requesting new pivot playbooks.
    Includes trigger, steps, anti-patterns, output format, and verification checklist.

- **PR template** (`.github/PULL_REQUEST_TEMPLATE.md`) â€” structured PR form with
  change type, files changed, validation checklist, reviewer notes, and attribution.

- **Quick reference card** (`docs/quick-reference.md`) â€” one-page cheat sheet.
  What it is, 30-second setup, what the agent becomes, what's inside (92+ files),
  what it does NOT do, test prompt, validation commands, key principles, license.

### Changed

- `agent-config.yaml` â€” no structural changes (v1.2.0 config remains valid). Version
  note: the quick reference and test suite are discoverable via the standard
  directory structure.

## [1.2.0] â€” 2026-06-27

### Added

- **Structured Analytic Techniques (SATs)** (`knowledge/methodologies/structured-analytic-techniques.md`)
  â€” ACH, Key Assumptions Check, Devil's Advocacy. Mandatory before attribution claims.
- **Threat Actor Profiling** (`knowledge/domains/threat-actors.md` + `templates/reports/threat-actor-profile.md`).
- **Agent OPSEC** (`ethics/agent-opsec.md`) â€” 10 operational security rules with pre/post checklists.

### Changed

- `agent-config.yaml` â€” v1.2.0. Added SATs, threat actor, OPSEC references.
- `system-prompt.md` â€” Phase 4b (SATs), attribution standard, OPSEC rules, threat actor protocol.

## [1.1.0] â€” 2026-06-27

### Added

- **MCP Server** (`tools/mcp-server.js`) â€” runnable stdio MCP server.
- **Investigation graph templates** (`templates/graphs/`) â€” Mermaid, DOT, JSON schema.
- **Graph generation technique** (`knowledge/techniques/graph-generation.md`).
- **Timeline template** (`templates/reports/timeline.md`).

### Changed

- `agent-config.yaml` â€” v1.1.0. Added graph and timeline references.
- `system-prompt.md` â€” graph + timeline mandatory in reports.

## [1.0.0] â€” 2026-06-27

### Added

- Initial release. System prompt, agent config, 6 methodologies, 10 domain guides,
  10 techniques, 9 pivot playbooks, 4 tool registries, 5 report templates, 5 ethics
  documents, 5 case studies, 6 integration guides, 3 examples.

### Attribution

- Methodology distilled from OSINT-BIBLE by Frangel RaÃºl Crespo Barrera
  (https://github.com/frangelbarrera/OSINT-BIBLE).

[Unreleased]: https://github.com/frangelbarrera/osint-agent-skills/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/frangelbarrera/osint-agent-skills/releases/tag/v1.3.0
[1.2.0]: https://github.com/frangelbarrera/osint-agent-skills/releases/tag/v1.2.0
[1.1.0]: https://github.com/frangelbarrera/osint-agent-skills/releases/tag/v1.1.0
[1.0.0]: https://github.com/frangelbarrera/osint-agent-skills/releases/tag/v1.0.0
