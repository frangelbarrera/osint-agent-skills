# OSINT Agent Skills + Claude Code

## What you get

Claude Code (Anthropic's CLI agent) becomes a senior OSINT analyst. By pointing Claude Code at the `osint-agent-skills` knowledge base, the agent will load the OSINT Agent Skills system prompt as its operating identity, consult the methodology and pivot playbooks during investigations, invoke the MCP-format tools from `tools/mcp-tools.json` as callable functions, and produce intelligence reports using the templates in `templates/reports/`. Claude Code's native file-system access and shell-execution capabilities make it one of the best-suited agents for this knowledge base — it can both read the knowledge files and execute the CLI tools they reference.

## Setup (5 minutes)

1. **Clone the knowledge base** into a stable location:

   ```bash
   git clone https://github.com/frangelbarrera/osint-agent-skills ~/osint-agent-skills
   ```

2. **Create the Claude Code project directory** (or use an existing one) and place the settings file:

   ```bash
   mkdir -p ~/osint-projects/.claude
   ```

3. **Write `.claude/settings.json`:**

   ```json
   {
     "systemPromptFile": "~/osint-agent-skills/system-prompt.md",
     "knowledgeBase": [
       "~/osint-agent-skills/agent-config.yaml",
       "~/osint-agent-skills/knowledge/",
       "~/osint-agent-skills/tools/",
       "~/osint-agent-skills/templates/",
       "~/osint-agent-skills/ethics/",
       "~/osint-agent-skills/case-studies/",
       "~/osint-agent-skills/examples/"
     ],
     "mcpServers": {
       "osint-agent-skills-tools": {
         "command": "node",
         "args": ["~/osint-agent-skills/tools/mcp-server.js"],
         "env": {
           "OSINT_TOOLS_REGISTRY": "~/osint-agent-skills/tools/mcp-tools.json"
         }
       }
     },
     "permissions": {
      "allow": [
        "Bash(dig:*)",
        "Bash(curl:*)",
        "Bash(whois:*)",
        "Bash(sherlock:*)",
        "Bash(holehe:*)",
        "Bash(httpx:*)"
      ],
      "deny": [
        "Bash(rm -rf:*)",
        "Bash(sudo:*)"
      ]
     }
   }
   ```

   Adjust the `command` for the MCP server to match your local MCP runtime. If you are not running a local MCP server, omit the `mcpServers` block; Claude Code will still consume the knowledge base and can invoke the CLI tools directly through the shell.

4. **Launch Claude Code** from the project directory:

   ```bash
   cd ~/osint-projects
   claude
   ```

5. **Verify** by running the test prompt below.

## Test prompt

```
Investigate the domain example.com using OSINT Agent Skills methodology.
Produce a full intelligence report using templates/reports/intelligence-report.md.
Document every tool invocation in the evidence log.
```

Expected behavior: Claude Code loads the system prompt, reads the agent config, plans the investigation using the five-phase Intelligence Cycle, runs DNS/WHOIS/RDAP/crt.sh lookups using the free tools registry, follows the `domain-to-infrastructure.md` pivot playbook, and produces a structured Markdown report.

## What the agent will do

- **Adopt the OSINT Agent Skills persona** — no conversational filler, no "Sure!" — and produce intelligence product directly.
- **Consult `knowledge/methodologies/`** before planning, especially `intelligence-cycle.md` and `mitre-attack-mapping.md` for threat-intel investigations.
- **Use `tools/free-tools.yaml` first** for free DNS/WHOIS/RDAP/certificate-transparency lookups before invoking paid APIs.
- **Follow `knowledge/pivot-playbooks/`** by default when a finding triggers a pivot, pausing for user approval before consuming paid API quota or executing flagged techniques.
- **Produce reports using `templates/reports/intelligence-report.md`** with the standard structure: classification, metadata, executive summary, methodology, findings, pivots performed, recommended next steps, sources, limitations.
- **Respect `ethics/legal-frameworks.md`** throughout — refusing pretexting, breach-credential use, and facial-recognition pivots without explicit authorization.
- **Document every step** in the evidence log per `templates/evidence/evidence-log.md`.

## Advanced configuration

- **Custom tool additions.** Add new MCP tools by appending to `tools/mcp-tools.json` following the existing schema. Each tool definition requires `name`, `description`, `input_schema`, and `annotations` (with `endpoint`, `method`, `auth_required`, `rate_limit`).
- **Custom pivot playbooks.** Drop new Markdown files in `knowledge/pivot-playbooks/` following the template in `knowledge/pivot-playbooks/README.md`. Claude Code will consult them by trigger condition.
- **Custom jurisdiction.** Override the default US jurisdiction by passing a `--jurisdiction` flag or by editing `defaults.default_jurisdiction` in `agent-config.yaml`. The agent will consult `ethics/jurisdiction-rules.md` for the relevant country.
- **Project-scoped context.** For repeated investigations of related subjects, place subject-specific notes in `~/osint-projects/notes/` and reference them in the prompt. Claude Code will read them as additional context.

## Troubleshooting

- **"System prompt file not found."** Verify the path in `systemPromptFile` is absolute and the file exists. Use `~/` only if Claude Code's shell expansion is enabled; otherwise use the full `/home/<user>/...` path.
- **MCP tools not appearing.** Confirm `node` is on `PATH` and that `tools/mcp-server.js` exists. If you skipped the MCP server install, omit the `mcpServers` block — the agent will still use the CLI tools directly.
- **Sherlock or holehe not found.** These are CLI tools, not bundled. Install per `tools/cli-tools.yaml`: `pipx install sherlock-project` and `pipx install holehe`.
- **Agent ignores the system prompt.** Claude Code prioritizes the system prompt only if no other system prompt is set higher in the chain. Confirm `.claude/settings.json` is in the working directory you launched from.
- **Rate limits on free tools.** Google DoH, RDAP, and crt.sh have generous but not infinite limits. The agent should report rate-limit errors verbatim, not silently degrade.

## Cross-references

- [`../system-prompt.md`](../system-prompt.md) — the OSINT Agent Skills system prompt.
- [`../agent-config.yaml`](../agent-config.yaml) — declarative agent configuration.
- [`../tools/mcp-tools.json`](../tools/mcp-tools.json) — MCP-format tool registry.
- [`generic-agent.md`](generic-agent.md) — universal integration recipe.
