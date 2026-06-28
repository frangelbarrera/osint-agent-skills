# Domain Profile

## Classification

[Choose one: UNCLASSIFIED // CONFIDENTIAL // SECRET. Delete this instruction
line.]

Classification: [CLASSIFICATION]

## Metadata

- Report ID: [YYYYMMDD-DOMAIN-SLUG]
- Date: [YYYY-MM-DD]
- Analyst: [Analyst name or agent identifier]
- Subject domain: [fully qualified domain name]
- Confidence: [Confirmed / Probable / Unverified / Inferred / Speculative]
- Linked investigation plan: [path or reference]

## Registration

[WHOIS / RDAP-derived data. Note where privacy proxies are used. Where the
registrant is redacted, say so explicitly rather than leaving the field blank.
Delete this instruction line.]

- Registrar: [registrar name]
- Creation date: [YYYY-MM-DD]
- Expiry date: [YYYY-MM-DD]
- Updated date: [YYYY-MM-DD]
- Registrant (if public): [name / "redacted by registrar"]
- Registrant email (if public): [email / "redacted"]
- Name servers: [list]
- Privacy proxy in use: [yes / no / unknown]

## DNS Records

[Table of every DNS record type observed. "First observed" is the date the
analyst first saw this value. Delete this instruction line.]

| Record type | Value | TTL | First observed | Source |
| --- | --- | --- | --- | --- |
| [A / AAAA / MX / TXT / NS / CNAME / SOA / other] | [value] | [seconds] | [YYYY-MM-DD] | [citation] |
| [type] | [value] | [seconds] | [YYYY-MM-DD] | [citation] |

## Subdomains

[Table of every subdomain discovered. "Status" is resolved / NXDOMAIN /
redirect / other. Delete this instruction line.]

| Subdomain | First seen | Last seen | Status | Source |
| --- | --- | --- | --- | --- |
| [FQDN] | [YYYY-MM-DD] | [YYYY-MM-DD] | [status] | [citation] |
| [FQDN] | [YYYY-MM-DD] | [YYYY-MM-DD] | [status] | [citation] |

## Infrastructure

[Infrastructure used to host the domain. Include every IP, ASN, and hosting
provider identified, with the time period each was observed. Delete this
instruction line.]

| IP address | ASN | Hosting provider | Country | First observed | Last observed |
| --- | --- | --- | --- | --- | --- |
| [IP] | [ASN] | [provider] | [country] | [YYYY-MM-DD] | [YYYY-MM-DD] |
| [IP] | [ASN] | [provider] | [country] | [YYYY-MM-DD] | [YYYY-MM-DD] |

## SSL/TLS

[Certificate transparency and live handshake data. Include every certificate
observed, not just the current one. Delete this instruction line.]

- Current issuer: [issuer]
- Valid from: [YYYY-MM-DD]
- Valid to: [YYYY-MM-DD]
- Subject CN: [common name]
- Subject Alternative Names (SANs): [list]
- CT log source: [citation]
- Previous issuers of note: [list with date ranges, or "none observed"]

## Web Stack

[Technologies detected on the live website. Cite the fingerprinting tool used.
Delete this instruction line.]

| Category | Technology | Detected by | First observed |
| --- | --- | --- | --- |
| [server / CMS / framework / analytics / CDN / other] | [name] | [tool] | [YYYY-MM-DD] |
| [category] | [name] | [tool] | [YYYY-MM-DD] |

## Threat Intel Reputation

[Reputation across threat intelligence sources consulted. Include both clean
and malicious verdicts — do not cherry-pick. Delete this instruction line.]

| Source | Verdict | Categories | Last checked |
| --- | --- | --- | --- |
| [source] | [clean / suspicious / malicious] | [categories] | [YYYY-MM-DD] |
| [source] | [verdict] | [categories] | [YYYY-MM-DD] |

## Historical Changes

[Notable changes over time drawn from the Wayback Machine and DNS history
providers. Each entry must cite the archive source. Delete this instruction
line.]

1. [Date] — [change observed]. Source: [Wayback / DNS history citation].
2. [Date] — [change observed]. Source: [citation].

## Sources

[Complete list with URL and access date. Include archive snapshots for ephemeral
content. Delete this instruction line.]

1. [Source title]. URL: [URL]. Accessed: [YYYY-MM-DD]. Archive: [snapshot URL].
2. [Source title]. URL: [URL]. Accessed: [YYYY-MM-DD]. Archive: [snapshot URL].

## Limitations

[State what could not be verified — WHOIS privacy, CDN-obscured origin IPs,
stale DNS records, etc. Mandatory section. Delete this instruction line.]

[Limitation 1.]

[Limitation 2.]
