# Tool Versioning Policy

## Purpose

API endpoints, pricing, rate limits, and tool availability change over time. Without a mechanism to track when tool information was last verified, users of the knowledge base may rely on stale data. This document defines the versioning policy for tool registries.

## last_verified field

Every tool entry in `tools/free-tools.yaml`, `tools/apis.yaml`, and `tools/cli-tools.yaml` should include a `last_verified` field with an ISO 8601 date:

```yaml
- name: "Shodan"
  category: "infrastructure"
  description: "Search engine for Internet-connected devices."
  last_verified: "2026-06-27"
  signup_url: "https://account.shodan.io/register"
  pricing: "Free tier: 100 queries/month. Lifetime API: $49 one-time."
  ...
```

Tools without a `last_verified` field are treated as unverified â€” the agent should warn the user that the tool's information may be stale.

## Staleness threshold

| Age since last_verified | Status | Agent behavior |
|---|---|---|
| 0-3 months | Fresh | Use normally |
| 3-6 months | Current | Use normally, no warning needed |
| 6-12 months | Aging | Warn user: "Tool info for [tool] was last verified [N] months ago. Verify with the provider." |
| 12+ months | Stale | Warn user prominently. Recommend verifying before relying on specific rate limits or pricing. |

## Verification script

Run `scripts/check-stale-tools.ps1` (Windows) or `scripts/check-stale-tools.sh` (Linux/macOS) to scan all tool registries and report staleness status.

## Adding the field

When adding a new tool, set `last_verified` to the current date. When updating a tool's information, update `last_verified` to the current date.

When verifying a tool (confirming it still works, pricing is current, rate limits are accurate), update `last_verified` to the verification date â€” even if nothing changed.

## Community verification

Contributors can verify tools by:
1. Testing the example command from the registry entry.
2. Checking the provider's documentation for current pricing and rate limits.
3. Updating `last_verified` and any changed fields.
4. Submitting a PR with the update.

See `.github/ISSUE_TEMPLATE/tool-request.md` for the tool contribution checklist, which includes verification.
