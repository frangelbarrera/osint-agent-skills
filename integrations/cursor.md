# OSINT Agent Skills + Cursor

## What you get

Cursor (the AI-powered IDE) becomes a senior OSINT analyst workspace. By placing a rule file in `.cursor/rules/` that points Cursor at the OSINT Agent Skills knowledge base, every chat in the workspace will operate under the OSINT Agent Skills persona, consult the methodology and pivot playbooks, and produce intelligence-product output. Cursor's native file-system access lets you @-mention knowledge files directly in chat, and its shell-execution lets the agent run the CLI tools referenced in `tools/cli-tools.yaml`.

## Setup (5 minutes)

1. **Clone the knowledge base:**

   ```bash
   git clone https://github.com/frangelbarrera/osint-agent-skills ~/osint-agent-skills
   ```

2. **Create a Cursor workspace** for OSINT investigations:

   ```bash
   mkdir -p ~/osint-projects/.cursor/rules
   cd ~/osint-projects
   cursor .
   ```

3. **Symlink the knowledge base into the workspace** so Cursor's file index includes it:

   ```bash
   ln -s ~/osint-agent-skills ~/osint-projects/osint-agent-skills
   ```

4. **Write `.cursor/rules/osint-agent-skills.mdc`:**

   ```markdown
   ---
   description: OSINT Agent Skills — senior OSINT analyst operating discipline
   globs: "**/*"
   alwaysApply: true
   ---

   You are OSINT Agent Skills, a senior open-source intelligence analyst. Your operating
   identity, methodology, anti-hallucination rules, tool-usage protocol, pivot
   protocol, and reporting standard are defined in full at:

       osint-agent-skills/system-prompt.md

   Read that file and adopt its identity before answering any OSINT question. When
   the user asks an OSINT question, consult:

   - `osint-agent-skills/agent-config.yaml` — paths and operational defaults
   - `osint-agent-skills/knowledge/methodologies/` — investigation methodologies
   - `osint-agent-skills/knowledge/pivot-playbooks/` — pivot chains
   - `osint-agent-skills/tools/free-tools.yaml`, `tools/apis.yaml`, `tools/cli-tools.yaml`
   - `osint-agent-skills/templates/reports/intelligence-report.md` — default report format
   - `osint-agent-skills/ethics/legal-frameworks.md` — do not cross legal lines
   - `osint-agent-skills/case-studies/` — calibrate output depth against worked examples

   Produce intelligence product, not conversational prose. Cite sources per finding.
   Do not fabricate identifiers, tool output, dates, or confidence levels.
   ```

5. **Reload Cursor** (`Cmd+Shift+P` → "Developer: Reload Window") to pick up the rule.

6. **Verify** by running the test prompt below.

## Test prompt

In Cursor chat (Cmd+L):

```
Investigate the domain example.com using OSINT Agent Skills methodology.
@osint-agent-skills/knowledge/pivot-playbooks/domain-to-infrastructure.md
@osint-agent-skills/templates/reports/intelligence-report.md
Produce a full intelligence report.
```

Expected behavior: Cursor loads the rule file, adopts the OSINT Agent Skills persona, reads the @-mentioned files, runs DNS/WHOIS/RDAP lookups through the shell, follows the domain-to-infrastructure pivot playbook, and produces a structured Markdown report.

## What the agent will do

- **Adopt the OSINT Agent Skills persona** in every chat — no "Sure!", no "Of course!" — and produce intelligence product directly.
- **Consult `knowledge/methodologies/`** for planning, especially `intelligence-cycle.md` for the five-phase structure and `bellingcat-methodology.md` for attribution work.
- **@-mention knowledge files** when you want the agent to focus on a specific playbook or template. Cursor will treat the @-mentioned file as high-priority context.
- **Run CLI tools through Cursor's terminal** — `sherlock`, `holehe`, `dig`, `whois`, `httpx`, `crt.sh` queries — and parse the output.
- **Follow `knowledge/pivot-playbooks/`** by default, pausing for user approval before consuming paid API quota or executing flagged techniques.
- **Produce reports using `templates/reports/intelligence-report.md`** with the standard structure: classification, metadata, executive summary, methodology, findings, pivots performed, recommended next steps, sources, limitations.
- **Respect `ethics/legal-frameworks.md`** — refusing pretexting, breach-credential use, and facial-recognition pivots without explicit authorization.

## Advanced configuration

- **Custom tool additions.** Add new CLI tools to `tools/cli-tools.yaml` following the existing schema. Cursor will treat the registry as documentation; the agent must invoke the tools through the terminal.
- **MCP integration.** Cursor supports MCP servers via its `mcp.json` config. To expose the OSINT Agent Skills MCP tools (`tools/mcp-tools.json`), create `.cursor/mcp.json`:

  ```json
  {
    "mcpServers": {
      "osint-agent-skills-tools": {
        "command": "node",
        "args": ["~/osint-agent-skills/tools/mcp-server.js"]
      }
    }
  }
  ```

- **Per-investigation workspaces.** For long-running investigations, create one Cursor workspace per investigation and add subject-specific notes alongside the `osint-agent-skills/` symlink. The agent will treat them as additional context.
- **Custom report templates.** Drop new Markdown templates in `templates/reports/` and @-mention the specific template when you want the agent to use it instead of the default `intelligence-report.md`.

## Troubleshooting

- **Rule not applied.** Confirm `alwaysApply: true` in the rule front-matter. If the rule is not in `.cursor/rules/`, Cursor will not load it.
- **@-mentions not resolving.** Cursor indexes files on workspace open. If you just symlinked the knowledge base, reload the window (`Cmd+Shift+P` → "Developer: Reload Window").
- **Sherlock or holehe not found.** These are CLI tools, not bundled with Cursor. Install per `tools/cli-tools.yaml`: `pipx install sherlock-project` and `pipx install holehe`.
- **Agent produces conversational filler.** This means the system prompt is not being applied. Verify the rule file is in `.cursor/rules/` and the front-matter is valid.
- **Rate limits on free tools.** Google DoH, RDAP, and crt.sh have generous but not infinite limits. The agent should report rate-limit errors verbatim.

## Cross-references

- [`../system-prompt.md`](../system-prompt.md) — the OSINT Agent Skills system prompt.
- [`../agent-config.yaml`](../agent-config.yaml) — declarative agent configuration.
- [`../tools/mcp-tools.json`](../tools/mcp-tools.json) — MCP-format tool registry.
- [`generic-agent.md`](generic-agent.md) — universal integration recipe.
