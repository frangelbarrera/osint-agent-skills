# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in the OSINT Agent Skills knowledge base, MCP server, or any tool integrations:

- **Do not open a public issue.**
- Email the maintainer at the GitHub profile email listed on the repository.
- Include a detailed description of the vulnerability and steps to reproduce.

You will receive a response within 72 hours. If the vulnerability is confirmed, a fix will be prepared and released as soon as possible.

## Scope

This policy covers:

- The MCP server implementation (`tools/mcp-server.js`) â€” specifically, injection vulnerabilities, unsafe HTTP handling, or credential exposure.
- The knowledge base structure â€” specifically, any content that could enable harmful behavior when used by an autonomous agent (e.g., techniques that cross the line from OSINT into intrusion).
- The validation scripts (`scripts/validate.ps1`, `scripts/validate.sh`) â€” specifically, any command injection or path traversal vulnerabilities.

## Out of scope

- The third-party tools and APIs referenced in the tool registries. Report vulnerabilities in those tools to their respective maintainers.
- User misconfiguration (e.g., exposing API keys in unsecured environments).
- The behavior of LLMs or agent frameworks that consume this knowledge base â€” the anti-hallucination rules are guidance, not guarantees.

## Supported versions

Only the latest release is supported. See the [releases page](https://github.com/frangelbarrera/osint-agent-skills/releases) for the current version.

## Disclosure policy

- Vulnerabilities will be disclosed 30 days after a fix is released, or sooner if the vulnerability is already publicly known.
- Credit will be given to the reporter unless anonymity is requested.
