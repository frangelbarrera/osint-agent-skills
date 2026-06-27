---
name: Tool Request
about: Request adding a new tool to the OSINT Agent Skills tool registries
title: "[TOOL] Add <tool name> to <registry file>"
labels: tool-request
assignees: ''
---

## Tool name

[The name of the tool]

## Which registry?

- [ ] `tools/free-tools.yaml` (no API key required)
- [ ] `tools/apis.yaml` (API key required)
- [ ] `tools/cli-tools.yaml` (local CLI tool)
- [ ] `tools/mcp-tools.json` (MCP-format for Claude/Cursor)

## Category

[dns / whois / certificates / archive / infrastructure / geolocation / routing / code-search / threat-intel / subdomain-enum / username-enum / breach-data / social-media / cryptocurrency / people-intel / company-intel / phone-intel / facial-recognition / reverse-image / geoint / general]

## Description

[1-2 sentences describing what the tool returns]

## Signup URL

[Where to obtain an API key, if applicable]

## Pricing

[Free tier limits and paid tier price points]

## Rate limit

[Requests per second/minute/day]

## Authentication method

[API key in URL parameter / Basic auth / OAuth2 / None]

## Endpoint

[HTTP endpoint with {placeholder} syntax]

## Example usage

```
curl -s "https://api.example.com/lookup?q=test" | jq .
```

## Output format

[JSON / XML / plain text / CSV]

## Documentation URL

[Link to official docs]

## Free tier value

[low / medium / high / n/a]

## Tags

[Comma-separated tags, reusing existing tags from the registry]

## Notes

[Any operational caveats, ethical flags, or integration notes]

## Verification

I have verified that:
- [ ] The tool is operational (tested the example command)
- [ ] The pricing and rate limits are current
- [ ] The example runs as-is (modulo API key substitution)
- [ ] The tool is not already listed in any registry file
