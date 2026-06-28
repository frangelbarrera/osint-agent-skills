# Tools Registry

This directory catalogs every OSINT tool referenced by the OSINT Agent Skills knowledge base. Tools are organized by access model — agents consult these files when selecting a tool for a given investigative question.

## File index

| File | Description | API key required | Count |
|---|---|---|---|
| `free-tools.yaml` | HTTP APIs that require no authentication | No | 30+ |
| `apis.yaml` | HTTP APIs that require an API key or paid subscription | Yes | 25+ |
| `mcp-tools.json` | MCP-format tool catalog for Claude Code, Cursor, and other MCP-compatible agents | Mixed | 22 |
| `cli-tools.yaml` | Local command-line tools an agent invokes as subprocesses | Mixed | 20+ |

## Tool selection protocol

Agents selecting a tool follow this decision tree:

1. **Can the question be answered with a free, no-auth HTTP API?** Use `free-tools.yaml`. These have no cost and no rate limit impact on paid quota.
2. **Does the question require paid data (historical DNS, breach details, full Shodan banners, enrichment)?** Use `apis.yaml`. Pause for user approval if the user has not authorized the specific API.
3. **Does the question require bulk processing (e.g., enumerate 400+ platforms for a username)?** Use `cli-tools.yaml`. Local tools are often the only practical way to do bulk operations.
4. **Is the consuming agent MCP-compatible (Claude Code, Cursor)?** Prefer `mcp-tools.json` for direct integration, then fall back to the YAML/CLI registries for tools not yet wrapped in MCP format.

## YAML schema

Both `free-tools.yaml` and `apis.yaml` use a consistent schema. Each tool entry includes:

| Field | Description |
|---|---|
| `name` | Human-readable tool name. |
| `category` | One of: dns, whois, certificates, archive, infrastructure, geolocation, routing, code-search, threat-intel, subdomain-enum, username-enum, breach-data, social-media, cryptocurrency, people-intel, company-intel, phone-intel, facial-recognition, reverse-image, geoint, general. |
| `description` | One- or two-sentence description of what the tool returns. |
| `signup_url` | Where to obtain an API key (paid APIs only). |
| `pricing` | Free tier limits and paid tier price points. |
| `rate_limit` | Requests per second / minute / day, per IP or per key. |
| `authentication` | "API key in URL parameter", "Basic auth", "OAuth2", etc. |
| `endpoint` | HTTP endpoint with `{placeholder}` syntax for parameters. |
| `parameters` | Named parameters with descriptions. |
| `example_usage` | Working `curl` command an agent can adapt. |
| `output_format` | JSON, XML, plain text, CSV, etc. |
| `documentation` | Link to official docs. |
| `free_tier_value` | low / medium / high / n/a — how useful is the free tier for real investigations. |
| `tags` | Tag list for cross-referencing. |
| `notes` | Optional operational notes (gotchas, ethical flags, alternatives). |

## CLI tools

CLI tools (`cli-tools.yaml`) are invoked as subprocesses. Each entry includes:

| Field | Description |
|---|---|
| `name` | Tool name. |
| `category` | Same vocabulary as the HTTP APIs. |
| `description` | What the tool does. |
| `repo` | Source repository. |
| `install` | One-line install command (`pipx`, `go install`, `apt`, etc.). |
| `command` | Command template with `{placeholder}` syntax. |
| `parameters` | Named parameters. |
| `output_format` | Expected output format. |
| `integration_difficulty` | easy / medium / hard — how much setup is required. |
| `notes` | Operational caveats. |
| `tags` | Tag list. |

## Adding a tool

When adding a new tool, follow these rules:

1. **Verify the tool is operational.** Test the example command. If a tool is deprecated, list it under "Deprecated tools" at the bottom of the relevant file with a note explaining what to use instead.
2. **Verify pricing and rate limits.** Cite the source URL in a comment.
3. **Provide a working example.** The `example_usage` should run as-is (modulo API key substitution) and return the documented output format.
4. **Tag consistently.** Reuse existing tags; do not invent near-duplicates ("dns" vs "DNS lookup").
5. **Note ethical constraints.** Facial recognition, breach credential retrieval, and dark-web tools must include a `notes` field flagging them for human review per `ethics/anti-hallucination.md` and `ethics/code-of-conduct.md`.

## Tool inventory by category

For a complete inventory grouped by category, see the tags in each YAML file. The category breakdown is roughly:

- **Infrastructure / DNS / WHOIS**: Google DoH, Cloudflare DoH, RDAP, crt.sh, Shodan, Censys, BinaryEdge, Onyphe, ipinfo, RIPEstat, BGPview.
- **Domain intelligence**: SecurityTrails, DNSDB, PassiveTotal, HackerTarget.
- **Threat intelligence**: VirusTotal, AlienVault OTX, ThreatCrowd, urlscan, GreyNoise, Pulsedive.
- **People intelligence**: Hunter, Snov.io, Clearbit, FullContact, Gravatar.
- **Breach data**: HaveIBeenPwned, DeHashed, IntelX, h8mail.
- **Phone intelligence**: Twilio Lookup, NumLookupAPI.
- **Company intelligence**: OpenCorporates, Clearbit, RiskRecon.
- **Facial recognition (high-sensitivity)**: PimEyes, FaceCheck.ID.
- **Reverse image**: TinEye.
- **Geospatial**: Nominatim, Overpass, Google Street View, Sentinel Hub.
- **Cryptocurrency**: Blockchain.com, Blockchair, Etherscan.
- **Code search**: GitHub REST API, gitrob.
- **Social media (free APIs)**: Mastodon, GitHub user lookup.
- **CLI tools**: sherlock, holehe, maigret, theHarvester, amass, subfinder, httpx, nuclei, ExifTool, Metagoofil, Photon, twint, instaloader, recon-ng, SpiderFoot, Maltego.
