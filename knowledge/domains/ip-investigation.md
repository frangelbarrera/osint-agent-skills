# Investigating an IP Address

## Scope
This guide covers the investigation of an IPv4 or IPv6 address. It applies to incident responders triaging a hostile IP, threat-intelligence analysts enriching an indicator, fraud investigators tracing infrastructure, and journalists identifying who operates a server. It covers passive enrichment (RDAP, passive DNS, reputation feeds, scanner databases) and the interpretation of active scanner data already collected by third parties (Shodan, Censys, GreyNoise). It does **not** cover conducting your own port scans, vulnerability scans, or banner-grabbing against the target without explicit authorisation. Authorised active scanning is covered in ../../knowledge/methodologies/active-recon.md and must be governed by a scope-of-authorisation document.

## Key questions to answer
- Which regional internet registry (RIR) and ASN does the IP belong to, and who is the allocated operator?
- Is the IP dedicated to a single operator or shared across many tenants (hosting provider, CDN, cloud)?
- Where is the IP geographically located, at what level of confidence?
- What is the reverse DNS pointer, and does it correspond to forward DNS?
- What services and ports are exposed to the public internet, and what banners do they present?
- What domains have historically resolved to this IP (passive DNS)?
- Has the IP been observed scanning the internet, and by which scanner group?
- What is the IP's reputation across threat-intelligence feeds?
- Is the IP part of a known botnet, proxy network, or anonymising infrastructure (Tor exit, VPN, residential proxy)?
- What is the temporal pattern — when did activity start, peak, and stop?

## Data categories
### Category 1: Allocation and ASN
RDAP is the modern lookup protocol and returns structured JSON. The five RIRs (ARIN, RIPE NCC, APNIC, LACNIC, AFRINIC) operate RDAP servers; `rdap` CLI and most enrichment frameworks will follow redirects automatically. Record: network name, CIDR range, country of registration, allocation date, registrant organisation, and abuse contact. For a deeper ASN view, use bgp.he.net (Hurricane Electric BGP toolkit), RIPE Stat, or BGPView — these also show the announced prefix and any BGP routing anomalies.

### Category 2: Geolocation
IP geolocation is probabilistic, not deterministic. The country-level attribution is usually reliable; the city-level attribution is frequently wrong. Sources in order of typical accuracy: MaxMind GeoIP2 (paid) / GeoLite2 (free), IPinfo, IP2Location, DB-IP. CDN and cloud IPs are geolocated to the data centre, not the user. An "Amsterdam" Cloudflare IP may serve traffic from anywhere on Earth. Always record the geolocation source and timestamp — providers silently revise historical data.

### Category 3: Reverse DNS
`dig -x <ip>` against the authoritative in-addr.arpa or ip6.arpa zone. Forward-confirm the result: does the returned PTR record resolve back to the same IP? A forward-confirmed reverse DNS (FCrDNS) is a meaningful signal of operator care; a mismatch is a meaningful signal of either misconfiguration or evasion. Many cloud providers do not set PTR records unless the customer configures one; absence is not a finding in itself.

### Category 4: Open ports and services
Third-party scanner databases are the primary passive source:
- **Shodan** — broadest coverage, strong on industrial control systems, IoT, and default-credential banners.
- **Censys** — strong TLS-certificate pivoting and structured host data; weekly scan cadence.
- **BinaryEdge** — strong on European coverage and detailed service fingerprints.
- **ZoomEye** — Chinese-run scanner with broad Asian coverage.
- **Onyphe** — French scanner with broad coverage and a useful cloud-attribute overlay.
For each, record: scan date, ports, protocols, banners (with redaction of any credentials), and any CVE tags. Note that scanner data is a snapshot — the absence of a port in Shodan does not mean the port is closed today, only that Shodan did not observe it open on the last scan.

### Category 5: Passive DNS
Historical forward-resolution data: which domains have resolved to this IP, and when. Sources: VirusTotal (aggregated), SecurityTrails, DNSDB (Farsight), PassiveDNS by CIRCL (free for CSIRTs). Passive DNS is one of the strongest pivot sources — a single hosting IP may reveal dozens of related domains operated by the same actor.

### Category 6: Scanner attribution
GreyNoise is the canonical tool for distinguishing targeted scanning from internet-wide background noise. GreyNoise classifies IPs as: malicious, benign (known scanners like Shadowserver, Rapid7, Censys), or unknown. An IP flagged as "malicious" by GreyNoise has been observed scanning in a pattern consistent with hostile reconnaissance; a "benign" classification means the IP belongs to a research scanner and should not be treated as a threat. Always check GreyNoise before reporting an IP as hostile based on its scan history.

### Category 7: Threat reputation
VirusTotal (aggregate of many engines and historical detection), AbuseIPDB (community-reported abuse), AlienVault OTX, IBM X-Force, Spamhaus, SORBS, Barracuda Reputation. Reputation should be a multi-source signal; single-source flags are noise. Pay attention to confidence scores and report volume — a single complaint is a data point, a thousand complaints is a pattern.

### Category 8: Anonymisation overlay
Is the IP a known Tor exit node? Check the Tor consensus list or ExoneraTor. Is it a commercial VPN endpoint? Check VPN provider published exit lists. Is it a residential proxy (e.g., Luminati/Bright Data, Smartproxy, Soax)? These networks route through consumer devices and produce IP geolocations that look residential but are operated as proxies. A residential-proxy IP may appear as a normal home broadband IP in geolocation databases — the only reliable signal is cross-referencing the provider's published ranges or commercial detection services (e.g., IPinfo's privacy detection).

### Category 9: Service change over time
For long-running investigations, track the temporal pattern: when did the IP first appear in passive DNS, when did services change, when did reputation flags appear and disappear? Censys historical data and SecurityTrails history provide this timeline.

## Canonical tools
| Tool | Use case | Free/Paid |
|---|---|---|
| `rdap` CLI / web | Allocation and ASN lookup | Free |
| BGP.he.net / BGPView | BGP prefix and routing data | Free |
| MaxMind GeoIP2 / GeoLite2 | Geolocation database | Paid / Free |
| IPinfo | Geolocation + privacy detection | Freemium |
| Shodan | Port/service/banner data | Freemium |
| Censys | Host data + certificate pivoting | Freemium |
| BinaryEdge | Service fingerprints | Freemium |
| GreyNoise | Scanner attribution | Freemium |
| SecurityTrails | Passive DNS | Freemium |
| DNSDB (Farsight) | Deep passive DNS | Paid |
| VirusTotal | Reputation aggregation | Freemium |
| AbuseIPDB | Community abuse reports | Freemium |
| ExoneraTor | Tor exit-node confirmation | Free |

## Methodology
1. **Establish allocation.** RDAP lookup → RIR, country, operator, abuse contact.
2. **Determine hosting model.** Is the IP in a cloud provider range (AWS, GCP, Azure, DigitalOcean, Hetzner, OVH)? Is it a CDN edge (Cloudflare, Fastly, Akamai)? This determines how much the IP itself tells you about the operator.
3. **Geolocate with caveats.** Record country (reliable) and city (often wrong) from at least two sources. Flag any cloud/CDN IP as geolocated to data centre, not user.
4. **Reverse DNS with forward confirmation.** `dig -x`, then forward-resolve the PTR.
5. **Pull passive DNS.** All domains that have resolved to this IP — the strongest pivot source.
6. **Pull scanner data.** Shodan + Censys at minimum. Record ports, protocols, banners, scan dates.
7. **Check scanner attribution.** GreyNoise query — is the IP a known research scanner or a hostile?
8. **Pull reputation.** VirusTotal, AbuseIPDB, OTX. Require multi-source corroboration.
9. **Check anonymisation overlay.** Tor exit? VPN endpoint? Residential proxy?
10. **Build the timeline.** When did activity start, peak, stop? Is this a long-lived C2 or a transient scan source?
11. **Pivot.** Hand the ASN, CIDR, and related domains to the appropriate workflows (../../knowledge/domains/domain-investigation.md, ../../knowledge/domains/company-investigation.md).
12. **Capture and timestamp** every artefact.

## Common pitfalls
- **Geolocation overconfidence.** City-level IP geolocation is wrong a meaningful percentage of the time. Never assert "the attacker is in city X" based on a single IP geolocation.
- **CDN masking.** A hostile domain fronted by Cloudflare resolves to a Cloudflare IP. Reporting the Cloudflare IP as the attacker's infrastructure is wrong; the origin IP is what matters (see ../../knowledge/domains/domain-investigation.md).
- **Shared hosting.** A single IP hosting 10,000 customer websites cannot be reported as "the attacker's IP" without identifying which site is the actor's.
- **Scanner data staleness.** Shodan and Censys snapshots may be days to weeks old. The current state of the host may differ.
- **Tor exit conflation.** A Tor exit IP is a relay; the actual user is somewhere else in the Tor network. Reporting a Tor exit IP as "the attacker's IP" is a category error.
- **Residential proxy confusion.** Bright Data / Smartproxy IPs look like consumer broadband and geolocate to residential cities. Treat any residential IP showing hostile behaviour as a possible proxy.
- **Reputation lag.** A clean reputation today does not mean the IP has not been hostile historically. Check historical reputation and passive DNS.
- **ASN scope.** The ASN that announces the prefix is not necessarily the operator of the specific host. Cloud providers sub-allocate.
- **IPv6 scarcity.** IPv6 allocations are vast; a single /64 may contain the entire host's traffic. Do not block an entire /64 lightly.

## Ethical considerations
- **No unauthorised scanning.** Running `nmap` against the target IP is an active scan. It may be legal in some jurisdictions when against your own infrastructure or with consent, and illegal or grey in others. Default to passive-only.
- **Banner redaction.** Banners sometimes contain credentials, API keys, or PII inadvertently exposed by the operator. Do not republish; redact and report to the operator or abuse contact if appropriate.
- **Abuse-contact use.** The RDAP abuse contact exists for reporting. Use it. Do not harass.
- **Residential IP handling.** An IP that traces to a private residence is a strong signal that you may be looking at a compromised home device or a residential proxy, not the actual actor. Investigate the proxy hypothesis before any attribution.
- **Avoid doxxing the wrong person.** Residential IPs frequently map to entire households. Naming an individual based on an IP geolocation is reckless and potentially defamatory.
- **Reputation-report responsibility.** Submitting a false abuse report to a reputation provider harms both the operator and the integrity of the shared reputation commons. Verify before reporting.
- **Operational data sharing.** Sharing IP/IOC data with information-sharing communities (ISACs, FIRST.org, MISP communities) is encouraged; sharing raw victim data is not.

## Output
Produce an IP profile using the template at ../../templates/reports/ip-profile.md. The profile must include: allocation summary, geolocation with confidence, DNS (reverse and forward-confirmed), open ports table (with scan dates), passive DNS table, scanner attribution, reputation table, anonymisation overlay, activity timeline, confidence-scored assertions, and a sources appendix.

## Cross-references
- Pivot playbooks: ../pivot-playbooks/ip-to-domain.md, ../pivot-playbooks/ip-to-asn.md, ../pivot-playbooks/passive-dns-pivot.md
- Tools: ../../tools/free-tools.yaml, ../../tools/apis.yaml, ../../tools/cli-tools.yaml
- Ethics: ../../ethics/passive-collection.md, ../../ethics/active-scan-authorisation.md
- Case studies: ../../case-studies/c2-infrastructure-attribution.md
