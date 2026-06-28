# OSINT Agent Skills + OpenCode

## What you get

OpenCode (the open-source AI coding agent) becomes a senior OSINT analyst. OpenCode's architecture — a model-agnostic agent that reads from a project directory, executes commands in a sandboxed shell, and emits structured output — is well-suited to consuming the OSINT Agent Skills knowledge base. By pointing OpenCode at the repository root and loading `system-prompt.md` as the agent's operating identity, you get an agent that consults the methodology, runs the CLI tools referenced in `tools/cli-tools.yaml`, and produces reports using the templates.

OpenCode is particularly useful when you want a fully open-source, fully inspectable agent stack — no proprietary IDE, no cloud-dependent config — that you can extend or fork.

## Setup (5 minutes)

1. **Clone the knowledge base and OpenCode** (if you do not already have OpenCode installed):

   ```bash
   git clone https://github.com/frangelbarrera/osint-agent-skills ~/osint-agent-skills
   # Install OpenCode per its README: https://github.com/opencode-ai/opencode
   ```

2. **Create an OpenCode workspace** for OSINT investigations:

   ```bash
   mkdir -p ~/osint-projects/.opencode
   cd ~/osint-projects
   ```

3. **Symlink the knowledge base** so OpenCode's file index includes it:

   ```bash
   ln -s ~/osint-agent-skills ~/osint-projects/osint-agent-skills
   ```

4. **Write `.opencode/config.json`:**

   ```json
   {
     "systemPromptFile": "osint-agent-skills/system-prompt.md",
     "contextDirectories": [
       "osint-agent-skills/knowledge/",
       "osint-agent-skills/tools/",
       "osint-agent-skills/templates/",
       "osint-agent-skills/ethics/",
       "osint-agent-skills/case-studies/",
       "osint-agent-skills/examples/"
     ],
     "configFiles": [
       "osint-agent-skills/agent-config.yaml"
     ],
     "allowedCommands": [
       "dig", "whois", "curl", "sherlock", "holehe", "httpx", "nmap"
     ],
     "deniedCommands": [
       "rm", "sudo", "curl -X POST http"
     ]
   }
   ```

   Adjust `allowedCommands` and `deniedCommands` to your local security policy. OpenCode will refuse to execute commands outside the allowlist unless you approve at the prompt.

5. **Launch OpenCode** from the project directory:

   ```bash
   cd ~/osint-projects
   opencode
   ```

6. **Verify** by running the test prompt below.

## Test prompt

```
Investigate the domain example.com using OSINT Agent Skills methodology.
Produce a full intelligence report using osint-agent-skills/templates/reports/intelligence-report.md.
Document every tool invocation in the evidence log.
```

Expected behavior: OpenCode loads the system prompt, reads the agent config, plans the investigation using the five-phase Intelligence Cycle, runs DNS/WHOIS/RDAP/crt.sh lookups through its sandboxed shell, follows the `domain-to-infrastructure.md` pivot playbook, and produces a structured Markdown report.

## What the agent will do

- **Adopt the OSINT Agent Skills persona** — no conversational filler — and produce intelligence product directly.
- **Consult `knowledge/methodologies/`** before planning, especially `intelligence-cycle.md` and `target-triangulation.md`.
- **Use `tools/free-tools.yaml` first** for free lookups, escalating to paid APIs only with user approval.
- **Follow `knowledge/pivot-playbooks/`** by default when a finding triggers a pivot, pausing for user approval before consuming paid API quota or executing flagged techniques.
- **Produce reports using `templates/reports/intelligence-report.md`** with the standard structure.
- **Respect `ethics/legal-frameworks.md`** — refusing pretexting, breach-credential use, and facial-recognition pivots without explicit authorization.
- **Document every step** in the evidence log per `templates/evidence/evidence-log.md`.

## Advanced configuration

- **Custom tool additions.** Add new CLI tools to `tools/cli-tools.yaml` following the existing schema. Update `.opencode/config.json` `allowedCommands` to include them.
- **Custom pivot playbooks.** Drop new Markdown files in `knowledge/pivot-playbooks/` following the template in `knowledge/pivot-playbooks/README.md`. OpenCode will consult them by trigger condition.
- **Sandboxed execution.** For high-sensitivity investigations, run OpenCode inside a Docker container with read-only access to the knowledge base and write-only access to a designated output directory.
- **Multiple profiles.** Maintain separate `.opencode/` directories per jurisdiction or per investigation type, each pointing at the same knowledge base but with different `allowedCommands` lists.

## Troubleshooting

- **System prompt not loaded.** Verify the path in `systemPromptFile` is relative to the workspace root. OpenCode reads paths from `.opencode/config.json` relative to the workspace.
- **Command refused.** Confirm the command is in `allowedCommands`. OpenCode refuses anything outside the allowlist by default.
- **Sherlock or holehe not found.** These are CLI tools, not bundled. Install per `tools/cli-tools.yaml`: `pipx install sherlock-project` and `pipx install holehe`.
- **Agent ignores the knowledge files.** OpenCode reads files on workspace open. If you just added the symlink, restart OpenCode.
- **Rate limits on free tools.** The agent should report rate-limit errors verbatim, not silently degrade.

## Cross-references

- [`../system-prompt.md`](../system-prompt.md) — the OSINT Agent Skills system prompt.
- [`../agent-config.yaml`](../agent-config.yaml) — declarative agent configuration.
- [`../tools/cli-tools.yaml`](../tools/cli-tools.yaml) — CLI tool registry.
- [`generic-agent.md`](generic-agent.md) — universal integration recipe.
