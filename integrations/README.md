# Integrations

The `integrations/` directory contains guides for wiring the `osint-agent-skills` knowledge base into specific agent frameworks. Each guide is a short, copy-pasteable recipe.

## Purpose

The knowledge base is **agent-agnostic.** It is a set of Markdown files, YAML registries, JSON tool schemas, and directory conventions. Any agent that can read files and follow Markdown instructions can consume it. The integration guides simply tell you **how** to point each specific agent at the knowledge files — what config to write, where to put it, and what to test.

You do not need an integration guide for the knowledge base to work. If you understand the generic pattern — load `system-prompt.md` as the system prompt, expose `knowledge/` as readable context, wire up `tools/mcp-tools.json` as available functions, use `templates/` for output formatting, and consult `ethics/` before executing flagged techniques — you can integrate with any agent. See [`generic-agent.md`](generic-agent.md) for the universal recipe.

## What the knowledge base provides

Regardless of which agent you use, the knowledge base provides:

- **Identity and methodology.** `system-prompt.md` (~3,000 words) defines the OSINT Agent Skills persona, the five-phase Intelligence Cycle, the anti-hallucination rules, the tool-usage protocol, the pivot protocol, and the reporting standard.
- **Declarative config.** `agent-config.yaml` is a structured declaration of paths, defaults, refusals, and operational thresholds. Agents can read this file to discover where everything is.
- **Knowledge.** `knowledge/` contains methodologies, domain-specific playbooks, techniques, and pivot playbooks — the operational knowledge a senior analyst would carry.
- **Tools.** `tools/` contains four registries: free tools, paid APIs, MCP-format tools (for Claude/Cursor/MCP-compatible agents), and CLI tools.
- **Templates.** `templates/` contains report, plan, and evidence templates that the agent uses to format its output.
- **Ethics.** `ethics/` contains the legal frameworks, jurisdiction rules, code of conduct, privacy guidelines, and anti-hallucination rules the agent must respect.
- **Case studies.** `case-studies/` contains worked examples that calibrate expected output depth.
- **Examples.** `examples/` contains walkthroughs on synthetic targets.

## Integration guides in this directory

| File | Agent | What it covers |
|---|---|---|
| [`claude-code.md`](claude-code.md) | Claude Code (Anthropic CLI) | `.claude/settings.json` with `systemPromptFile` and `knowledgeBase`; MCP server config. |
| [`cursor.md`](cursor.md) | Cursor IDE | `.cursor/rules/` rule file pointing to system-prompt.md; @-mentioning in chat. |
| [`ollama.md`](ollama.md) | Ollama (local LLMs) | `Modelfile` loading system-prompt.md; recommended models. |
| [`opencode.md`](opencode.md) | OpenCode (open-source agent) | Pointing OpenCode at the knowledge base root. |
| [`autoclaw.md`](autoclaw.md) | AutoClaw | Generic AutoClaw integration; principles-based. |
| [`generic-agent.md`](generic-agent.md) | Any other agent | Universal recipe: load system prompt, expose knowledge, wire tools, use templates, consult ethics. |

## A note on tool access

The integration guides tell the agent **where to find** the tool registries, but they do not provision the tools themselves. To actually run `sherlock`, `holehe`, `httpx`, or any other CLI tool, you must install that tool on the host where the agent executes. The `tools/cli-tools.yaml` registry lists each tool's installation command and source repository. The `tools/apis.yaml` registry lists each API's key requirement and signup URL. Agents that lack a tool should report "tool unavailable" rather than fabricating output — see `../system-prompt.md`, "Anti-Hallucination Rules."

## Related

- Root: [`../README.md`](../README.md)
- System prompt: [`../system-prompt.md`](../system-prompt.md)
- Agent config: [`../agent-config.yaml`](../agent-config.yaml)
