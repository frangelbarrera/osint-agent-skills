# Pivot Playbook: Domain -> Infrastructure

## Trigger

You have identified a domain name during collection — for example, from a phishing email's `From` header, a malware C2 indicator, a brand-impersonation complaint, a WHOIS mention in a related investigation, or a direct user request to investigate a target organization's web presence. The domain is the seed artifact; the goal of this playbook is to map the full infrastructure that supports the domain — DNS records, registration history, subdomains, live hosts, ports, services, exposed credentials, and historical content — producing an infrastructure graph suitable for downstream attribution pivots.

This playbook is strictly passive: every action queries third-party services (Google DoH, RDAP, crt.sh, Shodan InternetDB, Wayback) and never sends packets to the target's own servers beyond what a normal web browser would send. Active scanning is out of scope and belongs in authorized penetration testing, not OSINT.

## Inputs

- A single domain name (e.g., `example.com`). Strip any scheme (`https://`), path (`/foo`), or port (`:8080`) before starting.
- Optional: a date range of interest (e.g., "infra as it stood in 2022") — affects Wayback and SecurityTrails history queries.
- Optional: prior knowledge of related domains (parent org, sister brands) — improves subdomain pivots.
- Local installs of `subfinder` and `httpx` (ProjectDiscovery), both via `go install`.
- API key for SecurityTrails if historical DNS is required (free tier: 50 queries/month).
- Optional: `amass` for deeper passive enumeration when subfinder misses coverage.

## Step 1: Authoritative DNS resolution via Google DoH

- **Tool:** Google DNS over HTTPS — https://dns.google/resolve
- **Command:** Run one query per record type:
  ```bash
  for TYPE in A AAAA MX NS TXT SOA CAA SRV; do
    echo "=== $TYPE ==="
    curl -s "https://dns.google/resolve?name=example.com&type=$TYPE" | jq '.Answer // "no answer"'
  done
  ```
- **Expected output:** Structured JSON per record type. A/AAAA yield the IPs serving the apex domain. MX yields the mail handlers (often a third-party like Google, Microsoft, ProtonMail). NS yields the nameservers (Cloudflare, AWS Route 53, etc.). TXT yields SPF, DMARC, DKIM, verification tokens (Google Search Console, Microsoft 365, Stripe, etc.).
- **Pivot point:** Each A/AAAA record is an IP — feed into `ip-to-attribution.md`. Each TXT verification token exposes another service the domain is registered with (e.g., `google-site-verification=...` confirms the operator controls a Google Search Console property). MX records hint at the email platform, which informs the email-to-username playbook.

## Step 2: WHOIS / RDAP lookup for registration data

- **Tool:** RDAP (IANA bootstrap) — https://rdap.org/domain/{domain}
- **Command:**
  ```bash
  curl -s "https://rdap.org/domain/example.com" | jq '{events, entities, nameservers, secureDNS}'
  ```
- **Expected output:** Structured JSON with `events` (registration, expiration, last-changed dates), `entities` (registrar, registrant, admin, tech contacts where exposed), and `nameservers`.
- **Pivot point:** The registrant organization name and email are often redacted under GDPR, but the registrar name and registration date are still informative. Pre-2018 WHOIS records (captured by SecurityTrails, WhoisXML, DomainTools) often contain unredacted registrant data — check historical sources.

## Step 3: Subdomain enumeration via certificate transparency (crt.sh)

- **Tool:** crt.sh — https://crt.sh/
- **Command:**
  ```bash
  curl -s "https://crt.sh/?q=%25.example.com&output=json" \
    | jq -r '.[].name_value' \
    | tr ',' '\n' \
    | sort -u > crtsh_subdomains.txt
  ```
- **Expected output:** A deduplicated list of subdomains observed in publicly issued TLS certificates. Typically 10-1000+ entries for an established domain.
- **Pivot point:** Each subdomain is a candidate live host. Some certs reveal internal hostnames (e.g., `vpn.internal.example.com`, `jenkins.staging.example.com`) that the operator did not intend to expose publicly. These are high-value leads.

## Step 4: Broader subdomain enumeration with subfinder and amass

- **Tool:** subfinder — https://github.com/projectdiscovery/subfinder, amass — https://github.com/owasp-amass/amass
- **Command:**
  ```bash
  subfinder -d example.com -silent -o subfinder_subdomains.txt
  amass enum -d example.com -passive -o amass_subdomains.txt
  cat crtsh_subdomains.txt subfinder_subdomains.txt amass_subdomains.txt | sort -u > all_subdomains.txt
  wc -l all_subdomains.txt
  ```
- **Expected output:** A combined deduplicated list of subdomains from all sources. subfinder pulls from 30+ passive sources; amass adds deeper sources but is slower.
- **Pivot point:** This combined list is the input to the live-host probe in Step 5. Configure `~/.config/subfinder/provider-config.yaml` and `~/.config/amass.ini` with API keys (SecurityTrails, Censys, Shodan, GitHub) for full coverage.

## Step 5: Probe live hosts with httpx

- **Tool:** httpx — https://github.com/projectdiscovery/httpx
- **Command:**
  ```bash
  cat all_subdomains.txt | httpx -title -tech-detect -status-code -ip -follow-redirects -threads 25 -rate-limit 50 -o httpx_live.txt
  ```
- **Expected output:** One line per live host, including the resolved IP, HTTP status code, page title, and detected technologies (CMS, web framework, CDN).
- **Pivot point:** Each live host's IP feeds into `ip-to-attribution.md`. The detected technologies inform the threat-model — a `Jenkins 2.289.1` host is a different attack surface than a `WordPress 6.4` host. The page titles often reveal internal application names and branding useful for pivoting into the organization's other properties.

## Step 6: Per-IP exposure via Shodan InternetDB

- **Tool:** Shodan InternetDB — https://internetdb.shodan.io/ (free, no auth)
- **Command:**
  ```bash
  for IP in $(awk '{print $NF}' httpx_live.txt | sort -u); do
    echo "=== $IP ==="
    curl -s "https://internetdb.shodan.io/$IP" | jq '{cpes, hostnames, ports, vulns}'
  done
  ```
- **Expected output:** JSON per IP with `ports` (e.g., `[22,80,443,8080,9200]`), `hostnames` (reverse-DNS), `cpes` (software versions), and `vulns` (CVE list).
- **Pivot point:** Each open port is a service. Common pivots: SSH (22) on a non-standard cloud host suggests admin access; Elasticsearch (9200) exposed publicly is a data-leak indicator; RDP (3389) on a cloud IP suggests remote access infrastructure. The `vulns` array feeds directly into a threat-assessment section of the final report.

## Step 7: Historical DNS with SecurityTrails

- **Tool:** SecurityTrails API — https://docs.securitytrails.com/
- **Command:**
  ```bash
  curl -s -H "APIKey: $SECURITYTRAILS_KEY" \
       "https://api.securitytrails.com/v1/history/example.com/dns/a" \
       | jq '.records[] | {first_seen, values: [.organizations[].name, .ips[]]}'
  ```
- **Expected output:** A timeline of A-record changes, each with first-seen timestamp and the hosting organization/IP at that time.
- **Pivot point:** Domains that have moved between hosting providers (e.g., from a Tier-1 cloud to a bulletproof host) signal infrastructure shifts that often correspond to takedown attempts, rebranding, or evasion. The historical IPs are themselves leads — they may host other domains still active today.

## Step 8: Historical content via Wayback Machine

- **Tool:** Wayback Machine CDX API + twayback — https://web.archive.org/cdx/search/cdx and https://github.com/anthonyharrison/twayback
- **Command:**
  ```bash
  curl -s "https://web.archive.org/cdx/search/cdx?url=example.com&output=json&collapse=digest&fl=timestamp,original,statuscode,digest&limit=50000&from=20100101&to=20240101" | jq . > wayback_cdx.json
  twayback -u "https://example.com" -o wayback_snapshots/
  ```
- **Expected output:** A timestamped list of archived snapshots plus downloaded HTML for selected snapshots.
- **Pivot point:** Compare snapshots to identify defacements, rebrands, exposed content (e.g., a `/admin` page that was later removed), and historical contact info. Snapshots from a domain's earliest days often reveal the operator's identity more candidly than later, "professionalized" versions.

## Step 9: Build the infrastructure map

- **Tool:** None — analysis step.
- **Command:** Build a graph (text or graphviz):
  ```
  example.com
  ├── A: 93.184.216.34 (Akamai)
  ├── MX: google.com (Google Workspace)
  ├── NS: a.iana-servers.net, b.iana-servers.net
  ├── subdomains (live):
  │   ├── www.example.com -> 93.184.216.34 [ports: 80,443]
  │   ├── api.example.com -> 23.215.0.136 [ports: 443] [tech: nginx]
  │   └── admin.example.com -> 10.0.0.5 [no response — internal]
  └── historical: 2018-04 A=104.20.42.1 (Cloudflare)
  ```
- **Expected output:** A structured infrastructure map suitable for inclusion in the intelligence report.
- **Pivot point:** The infrastructure map is the deliverable. Each IP is the seed for `ip-to-attribution.md`; each MX/NS/SaaS indicator is a pivot into the operator's email and collaboration stack.

## Anti-Patterns (what NOT to do)

- **Do not run active subdomain brute-force against the target's nameservers.** Dictionary brute-force (e.g., gobuster-style DNS bruteforce) sends packets to the target. This crosses from passive OSINT into active reconnaissance. Use passive sources only (crt.sh, subfinder, amass in `-passive` mode).
- **Do not assume DNS records are current.** A/AAAA records have TTLs as low as 60 seconds; a snapshot query captures one moment. For historical accuracy, always consult SecurityTrails or DNSDB.
- **Do not conflate CDN IPs with origin IPs.** A domain fronted by Cloudflare will resolve to Cloudflare anycast IPs; the true origin IP is hidden. Pivot to the origin via historical DNS, certificate transparency (looking for the cert's SAN list), or accidental exposure in email headers (`Received:` lines from the origin's MTA).
- **Do not run nuclei against the target.** Nuclei is an active vulnerability scanner. Even in "passive" template mode, it sends HTTP traffic to the target. This playbook stops at `httpx` detection of the page title and tech stack — no template-based probing.
- **Do not trust the registrar's listed registrant without corroboration.** Privacy services (Domains By Proxy, Withheld for Privacy) redact registrant data. Historical WHOIS may also be wrong — sometimes registrars record the wrong contact.
- **Do not assume two domains sharing a CDN IP are operated by the same entity.** Shared hosting and CDNs aggregate millions of domains per IP. Pivot through cert SANs and DNS history, not raw IP co-occurrence.
- **Do not paste the target domain into random "free WHOIS" lookup sites.** Many such sites sell query logs to data brokers. Stick to RDAP, ICANN-accredited registrars, and reputable paid tools (DomainTools, WhoisXML).
- **Do not omit the negative-result reporting.** If a subdomain enumeration returned only 3 subdomains, say so. If a host had no Shodan InternetDB record, say so. Negative results are findings.

## Output Format

When you complete this pivot, report:

- **Seed domain:** (input)
- **DNS records:** A, AAAA, MX, NS, TXT, SOA, CAA, SRV — each with raw values
- **RDAP / WHOIS:** registrar, registration date, expiration date, registrant (if unredacted), nameservers
- **Subdomain inventory:** source (crt.sh / subfinder / amass), count, full list with live-host status
- **Live hosts (httpx):** hostname, IP, status code, page title, detected technologies
- **Shodan InternetDB per IP:** ports, hostnames, CPEs, vulnerabilities
- **Historical DNS (SecurityTrails):** timeline of A/MX/NS changes with timestamps
- **Wayback recoveries:** snapshot dates and any notable historical content
- **Infrastructure map:** structured graph of domain -> IPs -> ports -> services
- **Limitations:** passive-only scope, any tools that failed, any data gaps

## Cross-references

- Related playbooks: [`ip-to-attribution.md`](ip-to-attribution.md), [`email-to-username.md`](email-to-username.md), [`metadata-to-attribution.md`](metadata-to-attribution.md)
- Tools used: [`../../tools/cli-tools.yaml`](../../tools/cli-tools.yaml) (subfinder, amass, httpx, twayback), [`../../tools/apis.yaml`](../../tools/apis.yaml) (SecurityTrails, Shodan, Censys, DNSDB), [`../../tools/free-tools.yaml`](../../tools/free-tools.yaml) (Google DoH, RDAP, crt.sh, Wayback CDX, Shodan InternetDB)
- Ethics: [`../../ethics/legal-frameworks.md`](../../ethics/legal-frameworks.md) (passive-only scope, computer-misuse boundary), [`../../ethics/anti-hallucination.md`](../../ethics/anti-hallucination.md)
