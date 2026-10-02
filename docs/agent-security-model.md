**Maintainer:** Frangel Raúl Crespo Barrera
**Last verified:** 2026-10-02
**Scope:** OSINT sources, prompts, skills, MCP responses, tools, permissions, network behavior, and output handling.

| Field | Current record |
|---|---|
| Status | Validation workflow and tests exist; security claims require evidence per skill/version. |
| Evidence | `tests/server.test.js`, `tests/helpers/`, `tools/`, `server.json`, `agent-config.yaml`, `.github/workflows/validate.yml`. |
| Verification | Run the existing JavaScript tests and validation workflow; use synthetic adversarial inputs. |
| Owner | Repository owner. |
| Limitations | External sources and fetched content are untrusted; inclusion does not endorse their safety. |

Skills should declare permissions, network behavior, data handling, and output limits. Sanitize fetched content and prevent exfiltration of secrets.
