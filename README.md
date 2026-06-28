# OSINT Agent Skills

> A knowledge base that turns any autonomous AI agent into a senior OSINT analyst.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: v1.0](https://img.shields.io/badge/Status-v1.3-blue.svg)](CHANGELOG.md)
[![Maintainer](https://img.shields.io/badge/Maintainer-Frangel%20Crespo-red.svg)](https://github.com/frangelbarrera)

---

## What is this?

`osint-agent-skills` is **not** an agent. It is **not** a script. It is **not** a SaaS.

It is a **structured knowledge base** â€” a curated set of methodologies, tool registries, pivot playbooks, ethics rules, and report templates â€” that any autonomous AI agent can consume to instantly adopt the operating discipline of a senior open-source intelligence analyst.

If you point Claude Code, Cursor, Ollama, OpenCode, AutoClaw, or any other agent framework at this repository, the agent will:

1. Load `system-prompt.md` and adopt the OSINT Agent Skills persona.
2. Consult `knowledge/methodologies/` to plan its investigation.
3. Use `tools/free-tools.yaml` and `tools/apis.yaml` to execute lookups.
4. Follow `knowledge/pivot-playbooks/` to chain findings into networks.
5. Generate a report using `templates/reports/intelligence-report.md`.
6. Respect `ethics/legal-frameworks.md` throughout â€” never suggesting illegal techniques, never fabricating findings.

This repository is **agent-agnostic**. It works the same way regardless of which LLM or agent framework you use.

---

## Why does this exist?

Modern LLMs are powerful OSINT tools â€” but only when given the right discipline. Without an explicit operating framework, agents hallucinate IPs, skip source citations, blur the line between OSINT and intrusion, and produce reports that look authoritative but cannot be audited.

`osint-agent-skills` solves this by codifying the operating rules that a senior analyst would otherwise enforce through peer review. The system prompt is brutally explicit about anti-hallucination. The pivot playbooks tell the agent exactly what to do when it finds an email, a domain, a phone number, a cryptocurrency wallet, or a photograph. The ethics framework defines what is in-bounds by jurisdiction. The report templates enforce source citation and confidence labeling.

The result: when you ask an agent that has consumed this knowledge base "investigate the domain `example.com`", you get a structured intelligence report with cited sources, performed pivots, and explicit limitations â€” not a stream of plausible-sounding prose.

---

## Who is this for?

- **Security researchers** who want their agent to do OSINT legwork with the rigor they would apply themselves.
- **Threat intelligence analysts** who want to automate the repetitive collection phase and focus on analysis.
- **Journalists** investigating disinformation, fraud, or corruption â€” especially those using Bellingcat-style methodology.
- **Due diligence teams** who need to background companies and individuals from public sources.
- **OSINT educators** who want a reference framework for teaching methodology.
- **Anyone** who has watched an LLM "investigate" something and produce confidently wrong results.

---

## Quick start

```bash
git clone https://github.com/frangelbarrera/osint-agent-skills
cd osint-agent-skills
```

Then point your agent at the repository. Integration guides:

| Agent | Guide |
|---|---|
| Claude Code | [`integrations/claude-code.md`](integrations/claude-code.md) |
| Cursor | [`integrations/cursor.md`](integrations/cursor.md) |
| Ollama (local) | [`integrations/ollama.md`](integrations/ollama.md) |
| OpenCode | [`integrations/opencode.md`](integrations/opencode.md) |
| AutoClaw | [`integrations/autoclaw.md`](integrations/autoclaw.md) |
| Any other agent | [`integrations/generic-agent.md`](integrations/generic-agent.md) |

Test prompt after setup:

> Investigate the domain `example.com` using OSINT Agent Skills methodology. Produce a full intelligence report.

The agent should load the system prompt, plan the investigation using the intelligence cycle, run DNS/WHOIS/RDAP/CT-lookups against free tools, follow the domain-to-infrastructure pivot playbook, and deliver a structured report.

---

## Repository structure

```
osint-agent-skills/
â”œâ”€â”€ system-prompt.md           # The "brain" â€” agent adopts this persona
â”œâ”€â”€ agent-config.yaml          # Declarative config that agents read
â”œâ”€â”€ README.md                  # This file
â”œâ”€â”€ LICENSE                    # MIT
â”œâ”€â”€ CONTRIBUTING.md            # How to contribute
â”œâ”€â”€ CHANGELOG.md               # Version history
â”‚
â”œâ”€â”€ knowledge/                 # The methodology + playbooks
â”‚   â”œâ”€â”€ methodologies/         # Intelligence cycle, ATT&CK, Bellingcat, etc.
â”‚   â”œâ”€â”€ domains/               # Person, domain, IP, company, phone, crypto, ...
â”‚   â”œâ”€â”€ techniques/            # Dorks, EXIF, Wayback, CT logs, ...
â”‚   â””â”€â”€ pivot-playbooks/       # "If you find X, investigate Y"
â”‚
â”œâ”€â”€ tools/                     # Tool registries
â”‚   â”œâ”€â”€ free-tools.yaml        # No API key required
â”‚   â”œâ”€â”€ apis.yaml              # API key required
â”‚   â”œâ”€â”€ mcp-tools.json         # MCP-format for Claude / Cursor
â”‚   â””â”€â”€ cli-tools.yaml         # Local CLI tools (sherlock, holehe, ...)
â”‚
â”œâ”€â”€ templates/                 # Report / plan / evidence / graph templates
â”‚   â”œâ”€â”€ reports/               # ICD-203 inspired intelligence reports
â”‚   â”œâ”€â”€ investigation-plan/    # Scope + plan templates
â”‚   â””â”€â”€ evidence/              # Evidence logs and chain of custody
|   - graphs/                # Investigation graph templates (Mermaid, DOT, JSON)
â”‚
â”œâ”€â”€ ethics/                    # Legal + ethical framework
â”‚   â”œâ”€â”€ legal-frameworks.md    # Per-jurisdiction laws (US, EU, UK, LatAm)
â”‚   â”œâ”€â”€ jurisdiction-rules.md  # Country-specific rules
â”‚   â”œâ”€â”€ code-of-conduct.md     # Investigator code of conduct
â”‚   â”œâ”€â”€ privacy-guidelines.md  # PII handling
â”‚   â””â”€â”€ anti-hallucination.md  # Anti-fabrication rules
â”‚
â”œâ”€â”€ case-studies/              # Worked examples of real investigations
â”œâ”€â”€ integrations/              # How to wire into each agent framework
â””â”€â”€ examples/                  # Walkthroughs of common investigations
```

---

## What's inside the system prompt?

The system prompt (`system-prompt.md`, ~3000 words) defines:

- **Identity.** OSINT Agent Skills â€” a senior analyst, not a chatbot.
- **Core principles.** Verify, don't assume. Pivot intelligently. Never hallucinate. Respect legality. Maintain OPSEC. Document everything. Minimize harm.
- **Methodology.** A five-phase Intelligence Cycle adapted for autonomous OSINT work.
- **Anti-hallucination rules.** Explicit prohibitions on fabricating identifiers, tool output, dates, or confidence levels.
- **Tool usage protocol.** How to choose tools, when to ask for paid-quota approval, when to flag techniques for human review.
- **Pivot protocol.** When to pivot autonomously vs. when to pause for user approval.
- **Reporting standard.** The default report structure (ICD-203 inspired).
- **Ethical boundaries.** Hard refusals (stalking, doxxing, pretexting without authorization, deepfake generation, investigating minors outside safeguarding context).
- **Output format.** No conversational filler. No artificial endings. Source per finding. Limitations section mandatory.

Read it in full: [`system-prompt.md`](system-prompt.md).

---

## What's inside the pivot playbooks?

The pivot playbooks are the most operationally valuable part of this repository. Each playbook specifies:

- The **trigger** â€” what finding activates this playbook.
- The **steps** â€” ordered collection actions with tool, command, and expected output.
- The **anti-patterns** â€” what NOT to do (e.g., do not assume two identical usernames indicate the same person).
- The **output format** â€” how to report the pivot's results.

Current playbooks:

| Playbook | Trigger |
|---|---|
| `email-to-username.md` | You found an email address |
| `username-to-identity.md` | You found a username |
| `domain-to-infrastructure.md` | You found a domain |
| `ip-to-attribution.md` | You found an IP address |
| `breach-to-credentials.md` | You confirmed an email is in a breach |
| `phone-to-person.md` | You found a phone number |
| `crypto-to-fiat.md` | You found a cryptocurrency wallet |
| `photo-to-location.md` | You have a photo to geolocate |
| `metadata-to-attribution.md` | You have a document with metadata |

See [`knowledge/pivot-playbooks/`](knowledge/pivot-playbooks/).

---

## Anti-hallucination commitment

This repository was built with one principle above all others: **agents that consume this knowledge base do not fabricate findings.**

The system prompt explicitly forbids inventing IP addresses, email addresses, usernames, dates, tool outputs, or confidence levels. Each finding in a report must cite a source. Each tool invocation must be real â€” if a tool failed or returned nothing, that is what gets reported.

If an agent that has consumed this knowledge base fabricates a finding, that is a critical defect and should be reported as an issue. See [`ethics/anti-hallucination.md`](ethics/anti-hallucination.md) for the full rule set.

---

## Attribution

This repository distills and restructures methodology originally compiled in [OSINT-BIBLE](https://github.com/frangelbarrera/OSINT-BIBLE) by [Frangel RaÃºl Crespo Barrera](https://github.com/frangelbarrera). OSINT-BIBLE is a curated index of 426+ OSINT resources across 33 sections; `osint-agent-skills` adapts that material for autonomous agent consumption.

Case studies reference investigations originally published by Bellingcat, Mandiant, CrowdStrike, CISA, and other public-domain threat intelligence sources. Citations appear in each case study file.

Tool descriptions reference the official documentation of each tool. Pricing and rate-limit information was current as of the repository's last update â€” always verify with the provider before relying on a specific limit.

---

## License

MIT. See [`LICENSE`](LICENSE).

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Pull requests that add new pivot playbooks, new free tools, or new jurisdiction rules are especially welcome.

## Changelog

See [`CHANGELOG.md`](CHANGELOG.md).
