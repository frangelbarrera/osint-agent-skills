# Investigating a Domain

## Scope
This guide covers the technical and reputational investigation of an internet domain name — typically a second-level domain (e.g., `example.com`) and any of its subdomains. It applies to threat-intelligence analysts, brand-protection teams, fraud investigators, journalists identifying the infrastructure behind a website, and due-diligence researchers. It does not cover active exploitation of the domain, vulnerability scanning beyond passive enumeration, or any interaction that could be construed as unauthorised access. WHOIS lookups, RDAP queries, passive DNS, certificate transparency log searches, and reading public web content are in scope. Active port scanning of hosts resolved from the domain is covered in ../../knowledge/domains/ip-investigation.md and should be conducted only with authorisation.

## Key questions to answer
- Who registered the domain, when, through which registrar, and is the registration currently active?
- What is the historical registration chain — has ownership changed hands, and when?
- What DNS records exist (A, AAAA, MX, NS, TXT, CAA, DMARC, DKIM, SPF)?
- What subdomains exist and which are exposed to the public internet?
- What infrastructure does the domain resolve to, and has this changed over time?
- What web technology stack does the site run?
- What is the SSL/TLS certificate chain, who issued it, and what other domains share certificates?
- What does the historical web content look like (Wayback Machine, archive.today)?
- What is the domain's reputation across threat-intelligence feeds?
- Is the domain currently or historically associated with malware, phishing, spam, or fraud?

## Data categories
### Category 1: Registration data
WHOIS (legacy port-43 protocol, increasingly redacted under GDPR) and RDAP (modern RESTful replacement, mandatory for gTLDs since 2019). Record the registrar, creation date, last-update date, expiry date, registrant organisation, registrant country, and any name-server information. For ICANN-regulated gTLDs, RDAP returns thinned data with a registrar abuse-contact link. Country-code TLDs vary enormously — `.ch` publishes full data, `.eu` thins, `.cn` requires local presence, `.io` has historically been permissive. Always query both the thick registry (if any) and the registrar of record.

### Category 2: Historical WHOIS
WHOIS history reveals ownership changes, prior registrant identities, and registration pattern anomalies. The dominant sources are WhoisXML Historical WHOIS, DomainTools Whois History, and Whoxy. Two identical domains created within days of each other under different registrants is a strong signal of either a domain sale or a brand-defensive registration.

### Category 3: DNS records
Authoritative DNS lookups via `dig`, `kdig`, `dnspython`, or the Google/Cloudflare DNS-over-HTTPS endpoints. Record all record types. Pay specific attention to:
- **MX** and **TXT (SPF/DKIM/DMARC)** — reveal email provider and email authentication posture.
- **NS** — nameserver hosting provider; a Cloudflare NS is not the same as Cloudflare hosting.
- **CAA** — which certificate authorities are authorised to issue certificates.
- **TXT** — often contains verification tokens (Google Search Console, Microsoft 365, Stripe, etc.) that surface the site's third-party service footprint.

### Category 4: Subdomain enumeration
Three complementary techniques:
1. **Certificate Transparency logs** via crt.sh, Censys, or Cert Spotter — fastest and most authoritative, as certificates are logged at issuance.
2. **Passive DNS** via SecurityTrails, VirusTotal, PassiveDNS providers — historical resolution data.
3. **Active enumeration** via subfinder, amass, or assetfinder — brute-forces common names against the authoritative NS; benign but generates traffic.
Cross-correlate all three. No single source is complete.

### Category 5: Historical DNS
SecurityTrails is the canonical paid source. DNSDB (Farsight) is the canonical deep-history source. Track IP changes, nameserver changes, MX changes. A domain that has flipped between hosting providers five times in a year is suspicious.

### Category 6: Web technology fingerprinting
`httpx` (ProjectDiscovery) for HTTP metadata, headers, response hash, and title extraction. `Wappalyzer` or BuiltWith for technology stack identification. `nuclei` for passive template-based detection (use only non-intrusive templates without authorisation). Record: server header, X-Powered-By, framework (WordPress, Drupal, React, Next.js), CDN in front (Cloudflare, Fastly, Akamai), analytics IDs (Google Analytics `UA-`, `G-`, Tag Manager `GTM-`), and any other third-party identifiers.

### Category 7: SSL/TLS certificate chain
Pull the live certificate with `openssl s_client` or `cryptography`. Record: issuer, subject, SAN list, validity window, serial number. Cross-reference the serial/SAN list against CT logs to find co-issued certificates that may reveal related infrastructure. A SAN list with multiple unrelated domains is a strong pivot signal.

### Category 8: Web archive history
Wayback Machine (web.archive.org) for snapshot history. archive.today (archive.ph) for additional captures and PDF rendering. Compare content changes across the timeline — sudden redesigns or language shifts often correspond to ownership or intent changes.

### Category 9: Threat-intelligence reputation
VirusTotal (aggregate of 80+ AV engines and URL scanners), urlscan.io (sandboxed fetch with screenshot and DOM), AlienVault OTX, IBM X-Force, Spamhaus DBL/ZEN, SURBL, PhishTank, APWG eCrime eXchange. Treat any single detection with caution; require corroboration. A domain flagged by a single AV engine is noise; flagged by 10+ engines with multi-month persistence is signal.

## Canonical tools
| Tool | Use case | Free/Paid |
|---|---|---|
| `whois` / `rdap` CLI | Registration lookup | Free |
| WhoisXML / DomainTools | Historical WHOIS, registrant pivot | Paid |
| `dig` / `kdig` | DNS record queries | Free |
| SecurityTrails | Historical DNS, passive DNS | Freemium |
| DNSDB (Farsight) | Deep historical passive DNS | Paid |
| crt.sh / Cert Spotter | CT log search | Free / Freemium |
| subfinder / amass | Subdomain enumeration | Free |
| httpx (ProjectDiscovery) | HTTP metadata fingerprinting | Free |
| BuiltWith / Wappalyzer | Technology stack identification | Freemium / Free |
| Wayback Machine | Historical web content | Free |
| VirusTotal | Multi-engine reputation | Freemium |
| urlscan.io | Sandboxed fetch with screenshot | Freemium |
| Shodan | Infrastructure correlation (see ip-investigation.md) | Freemium |

## Methodology
1. **Establish registration.** RDAP query first (modern, structured), then `whois` for confirmation and any thin-registry data. Record creation date — it is the most important single fact.
2. **Pull historical WHOIS.** Look for ownership transitions and prior registrant identities.
3. **Enumerate DNS records.** All record types; record exactly what the authoritative NS returns.
4. **Enumerate subdomains.** Run CT log search + passive DNS + active enumeration. Deduplicate.
5. **Resolve and fingerprint.** For each live subdomain, fetch HTTP metadata with httpx. Identify the technology stack.
6. **Inspect SSL/TLS.** Pull the certificate, extract SANs, cross-reference CT logs.
7. **Walk the archive.** Wayback Machine timeline; note content changes.
8. **Check reputation.** VirusTotal, urlscan, Spamhaus, PhishTank. Require corroboration.
9. **Pivot to infrastructure.** Hand resolved IPs and ASNs to the IP investigation workflow.
10. **Capture and timestamp** every artefact per the report template.

## Common pitfalls
- **WHOIS privacy redaction.** Since 2018, ICANN's Temp Spec and the subsequent GDPR-based thinning have removed most registrant PII from gTLDs. The absence of a name does not mean the domain is unowned — query historical WHOIS.
- **CDN confusion.** A Cloudflare nameserver does not mean Cloudflare hosts the origin. The origin IP is often discoverable via historical DNS, misconfigured subdomains, or SSL certificate SANs.
- **Stale DNS.** Cached records, including DNS-over-HTTPS resolvers, can lag the authoritative NS by the TTL or longer. Always query the authoritative NS directly.
- **CT log lag.** Certificates take minutes to hours to appear in CT logs after issuance; precertificates appear faster. A missing CT entry does not mean a missing certificate.
- **Single-source reputation.** One AV engine flagging a domain is statistical noise. Treat reputation as a multi-source question.
- **Subdomain takeover.** Discovering a dangling CNAME pointing to a decommissioned cloud resource is a vulnerability finding, not a free pivot. Report to the owner; do not exploit.
- **Typosquat ambiguity.** A domain that looks like a typosquat may be a legitimate internationalised variant or a brand-defensive registration. Verify before labelling.
- **Registrar vs registrant.** The registrar is the seller; the registrant is the owner. Conflating the two is a frequent error in published threat reports.

## Ethical considerations
- **No active exploitation.** Subdomain enumeration and HTTP fingerprinting are passive. Port scanning, directory brute-forcing, and SQLi testing are not — they require authorisation.
- **Respect `robots.txt`** as a signal of intent, not a legal barrier. Document departures from `robots.txt` in the report.
- **Takedown, not vigilantism.** If you discover phishing or malware infrastructure, the correct action is a report to the registrar, hosting provider, CERT, or a takedown service (e.g., PCH, Netcraft, PhishLabs). Taking it into your own hands is unprofessional and often illegal.
- **Data provenance.** Every fact in the report must trace to a queryable source with a timestamp. Reproducibility is the integrity guarantee.
- **Rate limits.** Use sensible delays. Hammering a registrar's WHOIS server will get your IP banned and degrades the commons for all investigators.
- **Registrant privacy.** Where historical WHOIS contains personal data of an EU/UK registrant, processing it is subject to GDPR. Do not publish a private individual's home address from WHOIS history without a documented public-interest test.

## Output
Produce a domain profile using the template at ../../templates/reports/domain-profile.md. The profile must include: registration summary, historical WHOIS table, DNS records table, subdomain enumeration table, technology stack, SSL certificate summary, archive timeline, reputation table, infrastructure pivot list (IPs and ASNs), confidence-scored assertions, and a sources appendix.

## Cross-references
- Pivot playbooks: ../pivot-playbooks/domain-to-infrastructure.md, ../pivot-playbooks/ssl-cert-pivot.md, ../pivot-playbooks/analytics-id-pivot.md
- Tools: ../../tools/free-tools.yaml, ../../tools/apis.yaml, ../../tools/cli-tools.yaml
- Ethics: ../../ethics/passive-collection.md, ../../ethics/takedown-disclosure.md
- Case studies: ../../case-studies/phishing-infrastructure-takedown.md
