# OSINT Agent Skills â€” Quick Reference

> One-page cheat sheet. What it is, how to set it up, what it does, what it doesn't.

---

## What is this?

A **structured knowledge base** that turns any autonomous AI agent (Claude Code, Cursor, Ollama, OpenCode, AutoClaw, any MCP-compatible agent) into a senior OSINT analyst. Not an agent. Not a script. Not a SaaS. A knowledge package the agent consumes.

## 30-second setup

```bash
git clone https://github.com/frangelbarrera/osint-agent-skills
cd osint-agent-skills
# Point your agent at the repo â€” see integrations/ for your specific agent
```

For Claude Code with MCP server:
```json
{
  "systemPromptFile": "./osint-agent-skills/system-prompt.md",
  "mcpServers": {
    "osint-tools": {
      "command": "node",
      "args": ["./osint-agent-skills/tools/mcp-server.js"]
    }
  }
}
```

## What the agent becomes

- **Senior OSINT analyst** â€” methodical, source-cited, no hallucination
- **Anti-fabrication** â€” never invents IPs, emails, dates, or tool output
- **Pivot-capable** â€” 9 pivot playbooks (emailâ†’username, domainâ†’infrastructure, IPâ†’attribution, etc.)
- **Graph-capable** â€” generates Mermaid/DOT/JSON investigation graphs
- **SATs-enabled** â€” Analysis of Competing Hypotheses, Key Assumptions Check, Devil's Advocacy
- **OPSEC-disciplined** â€” no direct target interaction, respects robots.txt, rate-limited
- **Jurisdiction-aware** â€” legal frameworks for US, EU, UK, LatAm
- **Threat actor profiler** â€” ATT&CK mapping, ACH-based attribution

## What's inside (92 files)

| Directory | What's there |
|---|---|
| `system-prompt.md` | The "brain" â€” identity, principles, methodology, anti-hallucination rules |
| `agent-config.yaml` | Declarative config â€” paths, defaults, refusals, output discipline |
| `knowledge/methodologies/` | Intelligence Cycle, ATT&CK mapping, Bellingcat, SATs, Kill Chain, more |
| `knowledge/domains/` | 11 domain guides: person, domain, IP, company, phone, crypto, social, dark-web, geoint, threat-actors |
| `knowledge/techniques/` | 11 techniques: DNS recon, CT, dorks, EXIF, Wayback, Shodan, graphs, more |
| `knowledge/pivot-playbooks/` | 9 playbooks: "if you find X, investigate Y" |
| `tools/` | 4 registries (free, paid, CLI, MCP) + runnable MCP server |
| `templates/` | Reports (intelligence, threat-actor, timeline), graphs (Mermaid, DOT, JSON), evidence, plans |
| `ethics/` | Legal frameworks, jurisdiction rules, code of conduct, privacy, anti-hallucination, agent OPSEC |
| `case-studies/` | 5 worked examples: Stuxnet, Ukraine 2015, MH17, Colonial Pipeline, Reddit attribution |
| `integrations/` | 6 setup guides: Claude Code, Cursor, Ollama, OpenCode, AutoClaw, generic |
| `tests/` | 10 test prompts with pass/fail criteria |

## What it does NOT do

- **Does not execute attacks.** OSINT only â€” no exploitation, no credential use, no intrusion.
- **Does not store credentials.** Breach data is referenced by name, never stored in transcripts.
- **Does not bypass authentication.** If a source requires auth, the agent asks for a key.
- **Does not investigate minors** (except documented safeguarding cases).
- **Does not fabricate.** If a tool returns nothing, the agent reports "no results."

## Test it

After setup, send this prompt:

> Investigate the domain `example.com` using OSINT Agent Skills methodology. Produce a full intelligence report.

Expected: DNS/WHOIS/RDAP/crt.sh lookups â†’ domain-to-infrastructure pivot â†’ structured report with graph, sources, and limitations.

Run `tests/test-prompts.md` for the full 10-test validation suite.

## Validate it

```bash
# Linux/macOS
bash scripts/validate.sh

# Windows
pwsh scripts/validate.ps1
```

Checks: all files exist, JSON valid, YAML parseable, config references intact, MCP server syntax valid.

## Key principles (the short version)

1. **Verify, don't assume** â€” every claim needs a source
2. **Pivot intelligently** â€” follow the playbooks by default
3. **Never hallucinate** â€” no fabricating identifiers or tool output
4. **Respect legality** â€” jurisdiction-aware, refuse malicious requests
5. **Maintain OPSEC** â€” no direct target interaction, no tipping off
6. **Document everything** â€” evidence log is mandatory
7. **Minimize harm** â€” redact PII of non-targets
8. **Apply SATs before attribution** â€” ACH + Key Assumptions + Devil's Advocacy

## License

MIT. See `LICENSE`.

## Contributing

See `CONTRIBUTING.md`. PRs for new playbooks, tools, and jurisdiction rules are especially welcome.
