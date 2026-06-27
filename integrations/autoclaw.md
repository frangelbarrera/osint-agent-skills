# OSINT Agent Skills + AutoClaw

## What you get

AutoClaw becomes a senior OSINT analyst. AutoClaw is an autonomous agent framework designed to consume external skill packages and execute them with disciplined methodology. By pointing AutoClaw at the OSINT Agent Skills knowledge base, the agent will load the OSINT Agent Skills system prompt as its operating identity, consult the methodology and pivot playbooks during investigations, expose the tools directory as callable functions, and produce intelligence reports using the templates.

Because AutoClaw is built around the same "knowledge-as-a-package" philosophy as OSINT Agent Skills, the integration is the cleanest of the agent frameworks documented here: the knowledge base is essentially a skill package, and AutoClaw loads it as such.

## Setup (5 minutes)

1. **Clone the knowledge base:**

   ```bash
   git clone https://github.com/frangelbarrera/osint-agent-skills ~/osint-agent-skills
   ```

2. **Point AutoClaw at the knowledge base root.** AutoClaw discovers skills from a configured skills directory. Symlink the knowledge base into AutoClaw's skills directory:

   ```bash
   ln -s ~/osint-agent-skills ~/.autoclaw/skills/osint-agent-skills
   ```

3. **Register the skill in AutoClaw's config.** Edit `~/.autoclaw/config.yaml` (or the equivalent config file for your AutoClaw installation) and add:

   ```yaml
   skills:
     - name: osint-agent-skills
       root: ~/.autoclaw/skills/osint-agent-skills
       system_prompt: ./system-prompt.md
       agent_config: ./agent-config.yaml
       knowledge_base: ./knowledge/
       tools:
         free: ./tools/free-tools.yaml
         apis: ./tools/apis.yaml
         mcp: ./tools/mcp-tools.json
         cli: ./tools/cli-tools.yaml
       templates: ./templates/
       ethics: ./ethics/
       case_studies: ./case-studies/
       examples: ./examples/
       enabled: true
   ```

4. **Verify the install:**

   ```bash
   autoclaw skills list
   ```

   You should see `osint-agent-skills` listed as enabled.

5. **Verify** by running the test prompt below.

## Test prompt

```
autoclaw run "Investigate the domain example.com using OSINT Agent Skills
methodology. Produce a full intelligence report using
templates/reports/intelligence-report.md. Document every tool invocation
in the evidence log."
```

Expected behavior: AutoClaw loads the OSINT Agent Skills skill, reads the agent config, plans the investigation using the five-phase Intelligence Cycle, runs DNS/WHOIS/RDAP/crt.sh lookups through the configured tool runtimes, follows the `domain-to-infrastructure.md` pivot playbook, and produces a structured Markdown report.

## What the agent will do

- **Adopt the OSINT Agent Skills persona** — no conversational filler — and produce intelligence product directly.
- **Consult `knowledge/methodologies/`** before planning, especially `intelligence-cycle.md` and `mitre-attack-mapping.md`.
- **Use `tools/free-tools.yaml` first** for free lookups, escalating to paid APIs only with user approval.
- **Follow `knowledge/pivot-playbooks/`** by default when a finding triggers a pivot, pausing for user approval before consuming paid API quota or executing flagged techniques.
- **Produce reports using `templates/reports/intelligence-report.md`** with the standard structure.
- **Respect `ethics/legal-frameworks.md`** — refusing pretexting, breach-credential use, and facial-recognition pivots without explicit authorization.
- **Document every step** in the evidence log per `templates/evidence/evidence-log.md`.

## Advanced configuration

- **Custom tool additions.** Add new CLI tools to `tools/cli-tools.yaml` following the existing schema. AutoClaw picks them up at next skill reload.
- **MCP integration.** AutoClaw supports MCP-format tool servers natively. To run the OSINT Agent Skills MCP server alongside the skill, add an `mcp_servers` block to the skill registration pointing at the local `tools/mcp-server.js`.
- **Per-investigation workspaces.** For long-running investigations, create a separate AutoClaw workspace per investigation and place subject-specific notes in the workspace root. AutoClaw will treat them as additional context.
- **Custom jurisdiction.** Override the default US jurisdiction by editing `defaults.default_jurisdiction` in `agent-config.yaml`. AutoClaw will consult `ethics/jurisdiction-rules.md` for the relevant country.
- **Custom templates.** Drop new Markdown templates in `templates/reports/` and reference them by name in the prompt. AutoClaw will use the specified template instead of the default `intelligence-report.md`.

## Troubleshooting

- **Skill not loaded.** Run `autoclaw skills list` to confirm `osint-agent-skills` is registered and `enabled: true`. If missing, check the symlink and the `skills:` block in your config file.
- **System prompt not applied.** Verify the `system_prompt:` path in the skill registration is relative to the `root:` and resolves correctly. Run `autoclaw skills verify osint-agent-skills` if your AutoClaw version supports it.
- **Sherlock or holehe not found.** These are CLI tools, not bundled with AutoClaw. Install per `tools/cli-tools.yaml`: `pipx install sherlock-project` and `pipx install holehe`.
- **Agent produces conversational filler.** This means the system prompt is not being applied. Verify the skill registration and reload AutoClaw.
- **Rate limits on free tools.** The agent should report rate-limit errors verbatim, not silently degrade.

## Cross-references

- [`../system-prompt.md`](../system-prompt.md) — the OSINT Agent Skills system prompt.
- [`../agent-config.yaml`](../agent-config.yaml) — declarative agent configuration.
- [`../tools/mcp-tools.json`](../tools/mcp-tools.json) — MCP-format tool registry.
- [`generic-agent.md`](generic-agent.md) — universal integration recipe.
