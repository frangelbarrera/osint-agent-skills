# Example: Investigate a Domain

**Target:** `example.com` (reserved per RFC 2606 — safe synthetic target)
**Investigation type:** Domain-to-infrastructure pivot chain
**Methodology reference:** [`../knowledge/pivot-playbooks/domain-to-infrastructure.md`](../knowledge/pivot-playbooks/domain-to-infrastructure.md)
**Output template:** [`../templates/reports/intelligence-report.md`](../templates/reports/intelligence-report.md) (specialized as `domain-profile.md`)

## Objective

From the domain `example.com` alone, characterize its DNS configuration, registration, certificate-transparency history, subdomain footprint, infrastructure exposure, and historical content. Produce a structured domain profile.

## Agent reasoning (Phase 1 — Planning and Direction)

> Subject: the domain `example.com`.
> Objective: characterize the domain's infrastructure and historical footprint from public OSINT sources.
> Scope: DNS, RDAP/WHOIS, certificate transparency, subdomain enumeration, infrastructure probing (Shodan InternetDB), Wayback Machine historical content. No active scanning (no nmap, no port scanning).
> Pivots authorized: free tools only.
> Success criteria: a domain profile with DNS records, registration data, subdomain list, certificate-transparency history, infrastructure exposure notes, and Wayback content summary.

## Agent actions (Phase 2 — Collection)

### Step 1 — DNS records via Google DoH

```bash
curl -s "https://dns.google/resolve?name=example.com&type=A"
curl -s "https://dns.google/resolve?name=example.com&type=AAAA"
curl -s "https://dns.google/resolve?name=example.com&type=MX"
curl -s "https://dns.google/resolve?name=example.com&type=NS"
curl -s "https://dns.google/resolve?name=example.com&type=TXT"
curl -s "https://dns.google/resolve?name=example.com&type=SOA"
```

**Raw output (excerpt):**

```json
{"Status":0,"Answer":[{"name":"example.com.","type":1,"TTL":300,"data":"93.184.216.34"}]}
{"Status":0,"Answer":[]}
{"Status":0,"Answer":[]}
{"Status":0,"Answer":[{"name":"example.com.","type":2,"TTL":86400,"data":"a.iana-servers.net."},{"name":"example.com.","type":2,"TTL":86400,"data":"b.iana-servers.net."}]}
{"Status":0,"Answer":[{"name":"example.com.","type":16,"TTL":3600,"data":"v=spf1 -all"},{"name":"example.com.","type":16,"TTL":3600,"data":"wgyf8z8cgvm2qmxpnbnldrcltvk4xqfn"}]}
```

Findings: A record → `93.184.216.34`. No AAAA. No MX (no email service). NS → `a.iana-servers.net`, `b.iana-servers.net`. TXT → SPF `v=spf1 -all` (no email senders authorized) and a verification token. SOA → `ns.icann.org`.

### Step 2 — RDAP/WHOIS lookup

```bash
curl -s "https://rdap.org/domain/example.com"
```

**Raw output (excerpt):**

```json
{
  "objectClassName": "domain",
  "ldhName": "EXAMPLE.COM",
  "events": [
    {"eventAction": "registration", "eventDate": "1995-08-14T04:00:00Z"},
    {"eventAction": "expiration", "eventDate": "2025-08-13T04:00:00Z"}
  ],
  "entities": [
    {"roles": ["registrar"], "vcardArray": [...,"Internet Corporation for Assigned Names and Numbers (ICANN)"]},
    {"roles": ["registrant"], "vcardArray": [...,"Internet Corporation for Assigned Names and Numbers (ICANN)"]}
  ],
  "nameservers": [
    {"ldhName": "A.IANA-SERVERS.NET"},
    {"ldhName": "B.IANA-SERVERS.NET"}
  ]
}
```

Findings: Registered 1995-08-14 (30-year history). Expiration 2025-08-13. Registrar and registrant both ICANN. Nameservers match the DNS resolution.

### Step 3 — crt.sh subdomain enumeration

```bash
curl -s "https://crt.sh/?q=%25.example.com&output=json"
```

**Raw output (excerpt):**

```json
[
  {"name_value":"example.com","not_before":"2024-01-15"},
  {"name_value":"www.example.com","not_before":"2024-01-15"},
  {"name_value":"dev.example.com","not_before":"2023-09-01"},
  {"name_value":"staging.example.com","not_before":"2023-09-01"},
  {"name_value":"mail.example.com","not_before":"2022-03-01"}
]
```

Findings: Five subdomains with certificate-transparency history. `www`, `dev`, `staging`, `mail` are enumerated for follow-up probing. (For a synthetic target, the actual results may be sparser; the agent records what is observed.)

### Step 4 — httpx probe on found subdomains

```bash
echo "www.example.com\ndev.example.com\nstaging.example.com\nmail.example.com" | httpx -silent -title -tech-detect -status-code
```

**Raw output (excerpt):**

```
https://www.example.com [200] [Example Domain] [Nginx]
https://dev.example.com [403] [] [Cloudflare]
https://staging.example.com [404] [] []
http://mail.example.com [502] [] []
```

Findings: `www` resolves and serves the canonical example.com page on Nginx. `dev` is behind Cloudflare and returns 403. `staging` returns 404. `mail` returns 502 — no functioning mail server.

### Step 5 — Shodan InternetDB on resolved IP

```bash
curl -s "https://internetdb.shodan.io/93.184.216.34"
```

**Raw output (excerpt):**

```json
{
  "cpes": [],
  "hostnames": ["www.example.com"],
  "ip": "93.184.216.34",
  "ports": [80, 443],
  "tags": [],
  "vulns": []
```

Findings: Open ports 80 and 443 only. No exposed services beyond HTTP/HTTPS. No known vulnerabilities tagged. Hostname `www.example.com` confirmed.

### Step 6 — Wayback CDX for historical content

```bash
curl -s "http://web.archive.org/cdx/search/cdx?url=example.com/*&output=json&limit=20&collapse=urlkey"
```

**Raw output (excerpt):**

```json
[["urlkey","timestamp","original","mimetype","statuscode","digest","length"],
["com,example)/","19960101000000","http://example.com:80/","text/html","200","M5WQ3RZB...","1234"],
["com,example)/","20020101000000","http://example.com:80/","text/html","200","M5WQ3RZB...","1234"],
["com,example)/","20200101000000","http://example.com:80/","text/html","200","M5WQ3RZB...","1234"]]
```

Findings: Wayback has snapshots dating back to 1996. The content hash is identical across snapshots, suggesting the canonical example.com page has been stable for decades.

## Agent analysis (Phase 3 & 4 — Processing and Production)

The agent processes the raw output:
- Normalizes the resolved IP and confirmation that no AAAA exists.
- Confirms the registration predates most modern DNS security practices — typical for a legacy ICANN-managed domain.
- Notes that `mail.example.com` returns 502, consistent with the absence of MX records — the domain does not send or receive email.
- Notes that SPF is `v=spf1 -all` — the domain explicitly authorizes no email senders, a strong anti-impersonation posture.
- Records each tool invocation in the evidence log with timestamp, exit code, and response hash.

## Final report excerpt

```markdown
## CLASSIFICATION
UNCLASSIFIED

## REPORT METADATA
- Report ID: OSINT-2024-DOM-001
- Date: 2024-06-15 (UTC)
- Analyst: OSINT Agent Skills
- Subject: domain example.com
- Confidence: Confirmed (primary-source verified)

## EXECUTIVE SUMMARY
example.com is a synthetic reserved domain (RFC 2606) maintained by ICANN
for documentation purposes. DNS resolution returns a single IPv4 address
(93.184.216.34) with no AAAA record and no MX records. The SPF record
explicitly authorizes no email senders (v=spf1 -all). RDAP confirms
ICANN-registered since 1995-08-14. Certificate-transparency logs reveal
five subdomains (www, dev, staging, mail, plus the apex); httpx probing
confirms only www.example.com is fully functional. Shodan InternetDB
reports open ports 80 and 443 only, with no tagged vulnerabilities.
Wayback Machine has snapshots dating back to 1996, with stable content
across the historical record.

## METHODOLOGY
Five-phase Intelligence Cycle per knowledge/methodologies/intelligence-cycle.md.
Pivot playbook: knowledge/pivot-playbooks/domain-to-infrastructure.md. Tools:
Google DoH (DNS), RDAP.org (registration), crt.sh (certificate transparency),
httpx (subdomain probe), Shodan InternetDB (infrastructure exposure),
Wayback CDX (historical content). All tools free-tier; no paid API quota
consumed. No active scanning performed.

## FINDINGS

### Finding 1 — DNS resolution
**Confidence:** Confirmed
**Source:** Google DoH, executed 2024-06-15T15:02:11Z
**Details:** A record → 93.184.216.34. No AAAA record. No MX record. NS →
a.iana-servers.net, b.iana-servers.net. SOA → ns.icann.org. TXT →
"v=spf1 -all" (no senders authorized) and a verification token.
**Implications:** The domain does not send or receive email. The SPF
record is a strong anti-impersonation posture.

### Finding 2 — Registration
**Confidence:** Confirmed
**Source:** RDAP.org, executed 2024-06-15T15:03:22Z
**Details:** Registered 1995-08-14. Expiration 2025-08-13. Registrar and
registrant: ICANN. Nameservers match DNS resolution.
**Implications:** Three-decade registration history consistent with ICANN
stewardship of the reserved domain.

### Finding 3 — Subdomain enumeration
**Confidence:** Confirmed
**Source:** crt.sh, executed 2024-06-15T15:04:45Z
**Details:** Five subdomains with CT-log history: www, dev, staging, mail,
plus the apex domain.
**Implications:** Subdomain footprint is minimal and consistent with a
documentation-purpose domain.

### Finding 4 — Infrastructure exposure
**Confidence:** Confirmed
**Source:** Shodan InternetDB, executed 2024-06-15T15:06:01Z
**Details:** Open ports 80 and 443 only. No tagged vulnerabilities. No
exposed services beyond HTTP/HTTPS.
**Implications:** The infrastructure footprint is minimal. No attack
surface beyond web ports.

### Finding 5 — Historical content
**Confidence:** Confirmed
**Source:** Wayback CDX, executed 2024-06-15T15:07:30Z
**Details:** Snapshots dating back to 1996. Content hash identical across
snapshots — the canonical example.com page has been stable for decades.
**Implications:** No historical content changes to investigate.

## PIVOTS PERFORMED
1. Domain → DNS records (Google DoH). Pivot: domain-to-infrastructure.
2. Domain → registration (RDAP). Pivot: domain-to-registrar.
3. Domain → subdomains (crt.sh). Pivot: subdomain-to-service.
4. Subdomains → live HTTP (httpx). Pivot: service-to-technology.
5. Resolved IP → infrastructure exposure (Shodan InternetDB). Pivot:
   ip-to-attribution.
6. Domain → historical content (Wayback CDX). Pivot: archive-to-content.

## RECOMMENDED NEXT STEPS
1. If investigation expands to identifying the hosting provider, query
   BGP/ASN data for the resolved IP (93.184.216.34) — likely Edgecast or
   Fastly based on the IANA-managed example.com infrastructure.
2. If investigation expands to historical infrastructure, query
   PassiveDNS for historical A-record changes.
3. No paid-API pivots recommended for this synthetic target. For
   real-world targets, Censys and BinaryEdge would complement Shodan
   InternetDB.

## SOURCES
- Google DoH: https://dns.google/resolve
- RDAP.org: https://rdap.org/
- crt.sh: https://crt.sh/
- httpx: https://github.com/projectdiscovery/httpx
- Shodan InternetDB: https://internetdb.shodan.io/
- Wayback CDX: http://web.archive.org/cdx/search/

## LIMITATIONS
- example.com is a synthetic reserved domain. Real-world investigations
  will yield materially richer findings (more subdomains, historical
  content changes, exposed services, ASN pivots).
- Shodan InternetDB returns only the most recent scan data; for
  historical exposure, the paid Shodan API would be required.
- Wayback CDX returns a maximum of 20 snapshots in this query; for full
  historical coverage, paginated queries would be required.
- No active scanning was performed. For targets where infrastructure
  fingerprinting is critical, nmap and Nikto would complement httpx —
  but only with explicit authorization per ethics/legal-frameworks.md.
```

## Notes for the agent

- The agent correctly identified that the SPF record `v=spf1 -all` is itself an intelligence finding — a strong anti-impersonation posture — not just a configuration detail.
- The agent correctly labeled each finding "Confirmed" because each was verified against a primary source (DNS resolver, RDAP registry, CT log, infrastructure scanner).
- The agent correctly declined to run active scanning (nmap, Nikto) without explicit user authorization, per `../ethics/legal-frameworks.md`.
- The agent correctly noted the data-freshness limitation for Shodan InternetDB and recommended the paid Shodan API for historical exposure data.
