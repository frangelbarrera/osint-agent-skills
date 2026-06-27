# Investigation Timeline Template

> A timeline is required in any investigation where the temporal sequence of
> events is material to the analysis. This includes infrastructure changes,
> breach timelines, social media activity patterns, domain registration
> history, and any investigation spanning more than 24 hours.

## Timeline: [Investigation Subject]

**Date range:** [YYYY-MM-DD] to [YYYY-MM-DD]
**Timezone:** UTC (all timestamps converted to UTC for consistency)
**Analyst:** OSINT Agent Skills

---

## Events

| Date (UTC) | Event | Entity | Source | Confidence | Notes |
|---|---|---|---|---|---|
| 2024-01-15 | Domain registered | example.com | RDAP | Confirmed | Registrar: GoDaddy |
| 2024-03-22 | First certificate issued | example.com | crt.sh | Confirmed | Issuer: Let's Encrypt |
| 2024-06-01 | DNS A record changed | example.com | SecurityTrails | Probable | 93.184.216.34 → 104.21.32.1 |
| 2024-09-15 | Subdomain appeared | api.example.com | crt.sh | Confirmed | New CT log entry |
| 2024-11-03 | Breach exposure detected | user@example.com | HIBP | Confirmed | Breach: AcmeCorp 2024 |
| 2024-12-01 | Last DNS verification | example.com | Google DoH | Confirmed | Resolves to 104.21.32.1 |

---

## Analysis

### Key temporal observations

1. **Registration-to-activation gap.** The domain was registered on [date] but the first certificate was issued [N] days later. This suggests the domain was parked initially and activated later.

2. **Infrastructure migration.** The DNS change on [date] indicates a migration from [old IP/ASN] to [new IP/ASN]. This may correspond to a hosting provider change, CDN adoption, or infrastructure consolidation.

3. **Breach timeline.** The breach exposure on [date] postdates the domain registration by [N] months, confirming the email was in active use by that date.

### Temporal gaps

- **[date range]:** No CT log entries or DNS changes observed during this period. The domain may have been inactive, or the changes were not captured by the monitoring sources.
- **[date range]:** Gap in social media activity from the associated username. May indicate account suspension, deletion, or a break in usage.

### Corroboration

- The registration date is corroborated by both RDAP and the earliest CT log entry.
- The DNS change is single-source (SecurityTrails passive DNS). Marked as Probable pending cross-verification with DNSDB.
- The breach date is authoritative (HIBP, sourced from the breached company's disclosure).

---

## Notes

- All timestamps are in UTC. If a source provided local time, it was converted to UTC and the original timezone is noted in the Notes column.
- "Probable" timeline events are based on a single source and have not been cross-verified.
- The timeline is a living document — new findings are inserted in chronological order as they are discovered.
- For investigations with >20 events, consider generating a Gantt chart or timeline visualization in addition to this table.
