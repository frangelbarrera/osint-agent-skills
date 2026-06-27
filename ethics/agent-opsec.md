# Agent OPSEC: Operational Security for Autonomous Investigation

## Purpose

This document defines operational security rules for an autonomous agent conducting OSINT investigations. The system prompt states "maintain OPSEC" — this file makes that directive concrete and actionable.

OSINT is passive collection, but it is not invisible. Every DNS query, every HTTP request, every WHOIS lookup leaves a trace. A target that monitors its infrastructure can detect an investigation in progress. An agent that does not practice OPSEC can:
- Tip off the target, causing evidence destruction.
- Reveal the investigator's identity or infrastructure.
- Trigger defensive countermeasures (WAF blocks, honeypot deployment).
- Violate platform terms of service, leading to IP bans.
- Generate traffic patterns that compromise the investigation's existence.

## Core principles

1. **Minimize footprint.** Use the fewest requests necessary to answer the question.
2. **Blend in.** Traffic should look like normal user behavior, not automated scanning.
3. **Respect boundaries.** robots.txt, rate limits, and ToS are not optional.
4. **Preserve deniability.** Do not leave investigator-identifiable traces on target infrastructure.
5. **Protect the chain.** Evidence collected with poor OPSEC may be inadmissible or unreliable.

## Rules

### R1: User-Agent rotation

**Rule:** Do not use a single, identifiable User-Agent string for all requests.

- Use realistic browser User-Agent strings, not tool defaults (e.g., `python-requests/2.31.0` reveals automation).
- Rotate among 5-10 current, common browser User-Agents.
- Never use an investigative tool name in the User-Agent (e.g., "OSINT-Agent-Skills/1.0", "sherlock", "nmap").

**Exception:** Some APIs require a specific User-Agent for authentication (e.g., HIBP requires a User-Agent that identifies the application). In these cases, use the API's required User-Agent — the API provider already knows who you are.

### R2: Rate limiting

**Rule:** Self-impose rate limits stricter than the tool's published limits.

| Tool category | Self-imposed limit | Rationale |
|---|---|---|
| Free APIs (Google DoH, RDAP, crt.sh) | 1 req/sec | Avoid triggering anti-abuse heuristics |
| Paid APIs (Shodan, VirusTotal, etc.) | 50% of published limit | Preserve quota; avoid rate-limit errors |
| Website scraping (non-API) | 1 req/5sec | Look like a human browsing |
| CLI tools (sherlock, holehe) | Default tool throttle | Tools have built-in throttling; do not override |

**Rule:** Never run multiple collection tools simultaneously against the same target. Sequential execution only. This prevents the target from observing a burst of queries from different tools in the same time window.

### R3: robots.txt compliance

**Rule:** Respect robots.txt for all web scraping activities.

- Before crawling or scraping a website (not API calls — raw HTML retrieval), check `robots.txt`.
- Do not access paths disallowed by robots.txt without explicit user authorization.
- API endpoints are exempt (robots.txt governs crawlers, not API clients). But if a site's robots.txt disallows `/api/`, treat that as a signal that the API is not intended for third-party use.

### R4: No direct target interaction

**Rule:** The agent must not interact with the target's infrastructure in ways that could alert the target.

**Prohibited:**
- Visiting a target's LinkedIn profile (LinkedIn notifies the user).
- Sending probe emails to the target's mail server to verify email existence.
- Attempting to log in to the target's accounts (even with correct credentials — this is intrusion, not OSINT).
- Filling forms on the target's website with test data.
- Subscribing to the target's newsletter to verify email acceptance.
- Connecting to the target's SSH, RDP, or other interactive services.

**Permitted:**
- Passive DNS lookups (query third-party databases, not the target's authoritative resolver).
- Certificate Transparency log searches (query CT aggregators, not the target).
- Wayback Machine queries (query the archive, not the target).
- Viewing publicly indexed pages via search engines.
- Shodan/Censys lookups (query the intel platform, not the target).

### R5: DNS OPSEC

**Rule:** Do not query the target's authoritative DNS servers directly.

- Use public recursive resolvers (Google 8.8.8.8, Cloudflare 1.1.1.1) for standard lookups.
- Use passive DNS databases (SecurityTrails, DNSDB) for historical lookups.
- Do not run `dig @ns1.target.com example.com` — this sends a query directly to the target's nameserver, revealing your IP address and the fact that someone is investigating the domain.
- Exception: zone transfer attempts (AXFR) are inherently noisy. Only attempt AXFR if the user has authorized active techniques, and document the attempt in the evidence log regardless of success.

### R6: Infrastructure separation

**Rule:** The agent's investigation traffic should not originate from the same IP as the investigator's normal traffic.

- If the agent runs on the user's local machine, the user's home IP is exposed to every API and website queried.
- Recommend the use of a VPN or proxy for investigation traffic, especially for sensitive investigations.
- If a VPN is not available, prioritize API-based collection (which does not expose the investigator's IP to the target) over direct website access.
- Never use the target's own infrastructure to route investigation traffic (e.g., do not use a target's open resolver for DNS lookups about the target).

### R7: Evidence preservation OPSEC

**Rule:** Preserve evidence in a way that does not alter the evidence itself.

- When archiving a web page, use the Wayback Machine's Save Page Now API (`https://web.archive.org/save/{url}`) rather than taking a local screenshot. The Wayback Machine creates a timestamped, third-party-verifiable snapshot.
- When downloading files (PDFs, images, documents), record the SHA-256 hash immediately. Do not modify the file (no re-saving, no format conversion) before hashing.
- When capturing social media posts, archive the raw HTML (via Wayback or a local snapshot tool) in addition to taking a screenshot. Screenshots are not verifiable; HTML with timestamps is.
- Do not delete evidence artifacts after including them in a report. The evidence log must reference files that still exist.

### R8: No social engineering

**Rule:** The agent must not engage in social engineering, pretexting, or deception.

- Do not create fake social media profiles to friend/follow the target.
- Do not impersonate a journalist, recruiter, or vendor to elicit information from the target or their associates.
- Do not join private groups or communities under a false identity to access non-public information.
- Do not send messages to the target's associates fishing for information.

This is both an OPSEC rule (pretexting leaves traces and can alert the target) and an ethics rule (see `code-of-conduct.md` and `legal-frameworks.md`).

### R9: Log and audit

**Rule:** Every external request the agent makes must be logged in the evidence log.

The log entry for each request must include:
- Timestamp (UTC)
- Tool name
- Target (domain, IP, URL, email, etc.)
- Request type (DNS lookup, HTTP GET, API query, CLI execution)
- Response status
- Bytes received
- User-Agent used (if HTTP)
- Source IP or resolver used (if relevant)

This log is the agent's OPSEC audit trail. If the target claims they were tipped off, the log shows exactly what the agent did and when.

### R10: Sensitive finding handling

**Rule:** Findings that could cause harm if disclosed are handled with additional care.

- Breach credentials are never stored in the conversation transcript. They are referenced by breach name and data class only.
- Personal information about non-public figures (family members, minors, bystanders) is redacted in the report and evidence log.
- If the investigation discovers information that could facilitate a physical attack (e.g., the home address of a public figure), the information is reported to the user privately with a recommendation to handle via law enforcement, not published in the report.

## OPSEC checklist before starting an investigation

Before beginning collection, the agent must verify:

- [ ] The investigation scope is defined (Phase 1 of the Intelligence Cycle).
- [ ] The legal basis is established (`ethics/jurisdiction-rules.md`).
- [ ] The user has been informed if the investigation will be conducted from their IP address.
- [ ] Rate limits are configured per R2.
- [ ] The evidence log is initialized and ready to receive entries.
- [ ] No direct target interaction is planned (R4).
- [ ] DNS queries will use recursive resolvers, not the target's authoritative servers (R5).
- [ ] If the investigation is sensitive, a VPN or proxy is recommended to the user (R6).

## OPSEC checklist after completing an investigation

- [ ] All requests are logged in the evidence log (R9).
- [ ] Evidence artifacts are hashed and preserved (R7).
- [ ] No sensitive data (credentials, PII of non-targets) is in the report body.
- [ ] The report's Limitations section notes any OPSEC constraints that affected collection (e.g., "DNS history could not be retrieved because the target's authoritative resolver was not queried per OPSEC policy").
- [ ] Wayback Machine snapshots were created for any web pages cited as evidence.

## Cross-references

- Ethics: `code-of-conduct.md`, `legal-frameworks.md`, `privacy-guidelines.md`, `anti-hallucination.md`
- Methodology: `intelligence-cycle.md` (Phase 2 — Collection, Phase 5 — Dissemination)
- Templates: `../../templates/evidence/evidence-log.md`
- System prompt: "Maintain OPSEC" core principle
