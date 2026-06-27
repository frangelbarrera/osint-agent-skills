# OSINT Agent Skills + Generic Agent

## What you get

Any agent framework that can read files and follow Markdown instructions can consume the OSINT Agent Skills knowledge base. This guide describes the universal recipe — the five-step pattern that, applied to any agent, produces an OSINT Agent Skills instance. If your specific agent framework has a dedicated integration guide in this directory, prefer that guide; this is the fallback for everything else.

The knowledge base is **agent-agnostic by design.** It is a set of Markdown files, YAML registries, JSON tool schemas, and directory conventions. The agent's job is to (1) load the system prompt, (2) read the knowledge base as context, (3) call the tools, (4) format output through the templates, and (5) consult the ethics files before executing flagged techniques.

## The five-step universal recipe

### Step 1 — Load `system-prompt.md` as the system prompt

The system prompt (`system-prompt.md`, ~3,000 words) defines the OSINT Agent Skills persona, the five-phase Intelligence Cycle, the anti-hallucination rules, the tool-usage protocol, the pivot protocol, and the reporting standard. Every agent that consumes this knowledge base must load this file as its system prompt — not as a "context document," not as a "user message," but as the system-level instruction that takes precedence over user input.

Most agent frameworks support a `system_prompt` or `systemPrompt` config key that points to a file path. If your framework does not, embed the contents of `system-prompt.md` directly into the system-message slot of your agent's API call.

### Step 2 — Expose `knowledge/` as readable context

The `knowledge/` directory contains the operational knowledge the agent needs to consult during investigations:

- `knowledge/methodologies/` — intelligence cycle, ATT&CK mapping, Bellingcat methodology, target triangulation, source verification.
- `knowledge/domains/` — person, domain, IP, company, phone, crypto, social media, breach, dark web, GEOINT.
- `knowledge/techniques/` — Google dorks, username enumeration, email pivoting, metadata extraction, Wayback, CT logs, DNS recon, Shodan, facial recognition, reverse image search.
- `knowledge/pivot-playbooks/` — the canonical chains that turn single findings into networks.

The agent does not need to read every file at startup. The agent consults the relevant file when the investigation's phase requires it. Expose the directory as readable context — either by indexing it for retrieval, by allowing the agent to read files on demand, or by including the index file (`knowledge/README.md`) as a navigation aid.

### Step 3 — Wire `tools/mcp-tools.json` as available functions

The `tools/` directory contains four registries:

- `tools/free-tools.yaml` — tools that require no API key (Google DoH, RDAP, crt.sh, etc.). Always available.
- `tools/apis.yaml` — tools that require an API key (Shodan, Censys, HaveIBeenPwned, etc.). Available only if the key is provisioned.
- `tools/mcp-tools.json` — MCP-format tool schema for agents that speak MCP (Claude Code, Cursor, OpenCode, AutoClaw).
- `tools/cli-tools.yaml` — CLI tools the agent can invoke through its shell (`sherlock`, `holehe`, `httpx`, `dig`, `whois`).

Wire these into the agent's tool-calling surface. For MCP-compatible agents, load `tools/mcp-tools.json` as an MCP server. For non-MCP agents, parse the YAML registries and expose each tool as a callable function with the documented endpoint, parameters, and auth requirements.

When a tool requires an API key that is not provisioned, the agent should report "tool unavailable: API key not set" rather than fabricating output or silently substituting a different tool.

### Step 4 — Use `templates/` for output formatting

The `templates/` directory contains report, plan, and evidence templates. The default report template is `templates/reports/intelligence-report.md`. The agent should:

- Generate investigation plans using `templates/investigation-plan/`.
- Document every collection step in `templates/evidence/evidence-log.md`.
- Produce the final report using `templates/reports/intelligence-report.md` (or a specialized template if the investigation type warrants it).

The templates enforce the OSINT Agent Skills reporting standard: classification, metadata, executive summary, methodology, findings, pivots performed, recommended next steps, sources, limitations. No conversational filler. No "End of report" markers. Source per finding. Limitations section mandatory.

### Step 5 — Consult `ethics/` before executing flagged techniques

The `ethics/` directory contains:

- `ethics/legal-frameworks.md` — per-jurisdiction laws (US CFAA, UK Computer Misuse Act, EU GDPR, regional frameworks).
- `ethics/jurisdiction-rules.md` — country-specific rules.
- `ethics/code-of-conduct.md` — investigator code of conduct.
- `ethics/privacy-guidelines.md` — PII handling.
- `ethics/anti-hallucination.md` — anti-fabrication rules.

Before executing any technique flagged in the system prompt as requiring human review (facial recognition, breach-credential retrieval, dark-web source consultation, third-party identification), the agent must consult `ethics/` and either confirm the technique is permitted within the investigation's jurisdiction or pause and request user approval.

The agent refuses — without negotiation — requests whose stated purpose is stalking, harassment, doxxing, political repression, unauthorized access, credential stuffing, pretexting without authorization, deepfake generation, or investigation of minors outside safeguarding context.

## Setup (5 minutes)

1. **Clone the knowledge base:**

   ```bash
   git clone https://github.com/frangelbarrera/osint-agent-skills ~/osint-agent-skills
   ```

2. **Configure your agent** per the five-step recipe above. The exact configuration syntax depends on your agent framework. As a generic template:

   ```yaml
   # Generic agent configuration — adapt to your framework's syntax.
   system_prompt: ~/osint-agent-skills/system-prompt.md
   agent_config: ~/osint-agent-skills/agent-config.yaml
   knowledge_base_root: ~/osint-agent-skills/knowledge/
   tools:
     free: ~/osint-agent-skills/tools/free-tools.yaml
     apis: ~/osint-agent-skills/tools/apis.yaml
     mcp: ~/osint-agent-skills/tools/mcp-tools.json
     cli: ~/osint-agent-skills/tools/cli-tools.yaml
   templates_root: ~/osint-agent-skills/templates/
   ethics_root: ~/osint-agent-skills/ethics/
   case_studies: ~/osint-agent-skills/case-studies/
   examples: ~/osint-agent-skills/examples/
   ```

3. **Test** by running the test prompt below.

## Test prompt

```
Investigate the domain example.com using OSINT Agent Skills methodology.
Produce a full intelligence report using templates/reports/intelligence-report.md.
Document every tool invocation in the evidence log.
```

Expected behavior: the agent loads the system prompt, reads the agent config, plans the investigation using the five-phase Intelligence Cycle, runs DNS/WHOIS/RDAP/crt.sh lookups, follows the `domain-to-infrastructure.md` pivot playbook, and produces a structured Markdown report.

## What the agent will do

- **Adopt the OSINT Agent Skills persona** — no conversational filler — and produce intelligence product directly.
- **Consult `knowledge/methodologies/`** before planning.
- **Use `tools/free-tools.yaml` first** for free lookups, escalating to paid APIs only with user approval.
- **Follow `knowledge/pivot-playbooks/`** by default, pausing for user approval before consuming paid API quota or executing flagged techniques.
- **Produce reports using `templates/reports/intelligence-report.md`** with the standard structure.
- **Respect `ethics/legal-frameworks.md`** — refusing flagged techniques without explicit authorization.
- **Document every step** in the evidence log.

## Troubleshooting

- **Agent ignores the system prompt.** Confirm `system-prompt.md` is loaded as the **system message**, not as a user message or as context. Most frameworks treat system messages with strict precedence; user messages can be overridden.
- **Tools not available.** Confirm the tool registries are loaded and that each tool's dependencies (CLI install, API key, MCP runtime) are provisioned. The agent should report "tool unavailable" rather than fabricating output.
- **Agent produces conversational filler.** This means the system prompt is not being applied with sufficient precedence. Re-load it as the system message.
- **Hallucinated findings.** This is a critical defect. The system prompt's anti-hallucination rules must be enforced; if your framework allows per-message enforcement, add a reminder to the user-message slot: "Anti-hallucination rules apply. Do not fabricate identifiers, tool output, dates, or confidence levels."

## Cross-references

- [`../system-prompt.md`](../system-prompt.md) — the OSINT Agent Skills system prompt.
- [`../agent-config.yaml`](../agent-config.yaml) — declarative agent configuration.
- [`../tools/README.md`](../tools/README.md) — tool registry index.
- [`../templates/README.md`](../templates/README.md) — template index.
- [`../ethics/code-of-conduct.md`](../ethics/code-of-conduct.md) — investigator code of conduct.
- Framework-specific guides: [`claude-code.md`](claude-code.md), [`cursor.md`](cursor.md), [`ollama.md`](ollama.md), [`opencode.md`](opencode.md), [`autoclaw.md`](autoclaw.md).
