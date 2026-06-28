# Pivot Playbook: IP -> Attribution

## Trigger

You have an IPv4 or IPv6 address from any prior pivot — for example, a DNS A record resolved during domain investigation, an IP observed in a log file, a C2 indicator extracted from a malware sample, the source IP of a phishing email's originating `Received` header, or an IP extracted from a breach record's metadata. The IP is the seed artifact; the goal of this playbook is to attribute the IP to a network operator (ISP, hosting provider, cloud vendor), characterize its services and exposure history, determine whether it is generic shared infrastructure or a targeted/scanner host, and identify related domains that have historically resolved to it.

This playbook is read-only. No traffic is sent to the target IP itself — all queries are directed at third-party data services (RDAP, BGPview, Shodan InternetDB, GreyNoise, VirusTotal, SecurityTrails) that have already scanned or catalogued the IP.

## Inputs

- A single IPv4 or IPv6 address (e.g., `1.2.3.4`).
- Optional: timestamp of when the IP was observed (affects which historical sources are most relevant).
- Optional: contextual artifact (the malware sample, the log line, the domain) — helps frame the attribution narrative.
- API keys for: GreyNoise (free community tier available), VirusTotal (free tier sufficient), SecurityTrails (50 free queries/month), Shodan (free tier sufficient for 1 query/IP lookups).

## Step 1: Network attribution via RDAP

- **Tool:** IANA RDAP bootstrap (IP) — https://rdap.org/ip/{ip}
- **Command:**
  ```bash
  curl -s "https://rdap.org/ip/1.2.3.4" | jq '{
    cidr: (.cidr0_cidrs // []),
    handle: .handle,
    name: (.events // []) ,
    entities: [.entities[]? | {roles, vcardArray}],
    notices: [.notices[]? | .title]
  }'
  ```
- **Expected output:** Structured JSON with the network CIDR, the network `name` (e.g., `AMAZON-AES` for AWS US-East, `GOOGLE` for Google Cloud), the country, and the abuse-contact entity.
- **Pivot point:** The network name is the first-level attribution — it tells you whether the IP is hosted on AWS, GCP, Azure, Cloudflare, DigitalOcean, Hetzner, OVH, or a regional ISP. This immediately narrows the threat-model: an IP on Cloudflare's edge is shared by millions of customers; an IP on a small ISP's DSL pool is residential.

## Step 2: ASN and BGP context via BGPview

- **Tool:** BGPview API — https://bgpview.io/api/
- **Command:**
  ```bash
  # Step 2a: ASN for the IP (via BGPview's prefix lookup)
  curl -s "https://api.bgpview.io/ip/1.2.3.4" | jq '.data | {prefix, asn, as_name: .asn.name, as_country: .asn.country}'

  # Step 2b: Full ASN details — peer prefixes, holder, registration
  curl -s "https://api.bgpview.io/asn/AS$(...)" | jq '.data | {name, website, ownerAddress, peers: [.peers[]?]}'
  ```
- **Expected output:** ASN identifier (e.g., `AS16509` for Amazon), holder name and address, peer ASNs, and the list of prefixes originated by that ASN.
- **Pivot point:** The ASN holder is the operator. ASN peers reveal upstream/downstream transit relationships — small bulletproof hosts often have unusual peering (transit through a single Tier-2 that does not ask questions). The prefix list from a single ASN can be cross-pivoted: if you later find a second IP in the same /24 of this ASN, that is a strong infrastructural link.

## Step 3: Shodan InternetDB for services and exposures

- **Tool:** Shodan InternetDB — https://internetdb.shodan.io/ (free, no auth)
- **Command:**
  ```bash
  curl -s "https://internetdb.shodan.io/1.2.3.4" | jq '{cpes, hostnames, ports, vulns, tags}'
  ```
- **Expected output:** JSON with `ports` (open TCP/UDP ports Shodan has observed), `hostnames` (reverse-DNS), `cpes` (software product identifiers with versions), `vulns` (CVE list), and `tags` (Shodan-curated labels like `iot`, `camera`, `vpn`).
- **Pivot point:** Each port is a service. The `hostnames` array is gold — these are reverse-DNS records that often expose internal hostnames (`mail.internal.corp.com`) revealing the operator's domain. The `vulns` array feeds into threat-assessment. If Shodan InternetDB returns empty, escalate to the full Shodan API or Censys — the IP may simply be unscanned, or it may be a residential IP that Shodan does not detail.

## Step 4: Geo and ASN enrichment via ipinfo.io

- **Tool:** ipinfo.io — https://ipinfo.io/
- **Command:**
  ```bash
  curl -s "https://ipinfo.io/1.2.3.4/json?token=$IPINFO_TOKEN" | jq '{ip, hostname, city, region, country, loc, org, postal, timezone}'
  ```
- **Expected output:** JSON with city-level geolocation (rough — country is reliable, city less so), ISP/org, timezone, and reverse-DNS hostname.
- **Pivot point:** The `org` field is more readable than RDAP's network name (it says `AS16509 Amazon.com, Inc.` rather than just the network). The `loc` (lat/long) is approximate — useful for country-level attribution, never for street-level. The timezone field can corroborate the operator's working hours when paired with traffic-logs.

## Step 5: Scanner / noise classification via GreyNoise

- **Tool:** GreyNoise Community API — https://docs.greynoise.io/reference/get_v3-community-ip
- **Command:**
  ```bash
  curl -s -H "key: $GREYNOISE_KEY" "https://api.greynoise.io/v3/community/1.2.3.4" | jq '{ip, noise: .noise, riot: .riot, classification: .classification, name: .name, link: .link, last_seen: .last_seen, message: .message}'
  ```
- **Expected output:** `noise: true` means the IP has been observed scanning the internet — it is likely background internet noise, not a targeted attacker. `riot: true` means the IP is on GreyNoise's "RIOT" list of known benign common business services (Googlebot, Cloudflare, Microsoft 365, etc.). `classification` is `malicious`, `benign`, or `unknown`.
- **Pivot point:** This is the single most important step for triage. If an IP triggered your alert and GreyNoise classifies it as `benign` and `riot: true`, the alert is almost certainly a false positive (e.g., Googlebot crawling). If `noise: true` and the IP is on a known scanner list (Shadowserver, Censys, Project Sonar), the alert is reconnaissance background. Only if `noise: false` and `classification: malicious` (or unknown) should you escalate the IP as a likely targeted attacker.

## Step 6: Passive DNS and related artifacts via VirusTotal

- **Tool:** VirusTotal v3 API — https://developers.virustotal.com/reference
- **Command:**
  ```bash
  curl -s -H "x-apikey: $VT_KEY" "https://www.virustotal.com/api/v3/ip_addresses/1.2.3.4" \
    | jq '{attributes: .data.attributes | {reputation, last_analysis_stats, asn, as_owner, country, network}, relationships: .data.relationships}'
  curl -s -H "x-apikey: $VT_KEY" "https://www.virustotal.com/api/v3/ip_addresses/1.2.3.4/resolutions?limit=40" \
    | jq '.data[] | {hostname: .attributes.host_name, date: .attributes.date, ip_address: .attributes.ip_address}'
  ```
- **Expected output:** Reputation scores, last analysis stats (number of AV engines flagging the IP), ASN owner, and a list of hostnames that have historically resolved to this IP.
- **Pivot point:** The `resolutions` list is the key pivot — every hostname that has resolved to this IP is a domain controlled (or co-hosted) by the same operator. Feed each hostname back into `domain-to-infrastructure.md` to expand the investigation graph. AV-engine flags indicate malware C2 attribution.

## Step 7: Historical DNS pivot via SecurityTrails

- **Tool:** SecurityTrails API — https://docs.securitytrails.com/
- **Command:**
  ```bash
  # Reverse pivot: which domains point at this IP?
  curl -s -H "APIKey: $SECURITYTRAILS_KEY" \
       "https://api.securitytrails.com/v1/search/list/?ip=1.2.3.4" \
       | jq '.records[] | {hostname, type, first_seen, last_seen}'
  ```
- **Expected output:** List of domains that have historically pointed at this IP, with first/last-seen dates.
- **Pivot point:** Each domain is a candidate pivot back to `domain-to-infrastructure.md`. Domains that co-occur on this IP across long time windows are strong infrastructural-coupling signals. Domains that briefly co-occurred may have been compromised together.

## Step 8: Compose the attribution narrative

- **Tool:** None — analysis step.
- **Command:** Build a structured narrative:
  - **Network attribution:** ASN, holder, prefix, country.
  - **Service attribution:** open ports, services, software versions, vulnerabilities.
  - **Behavioral attribution:** GreyNoise classification — targeted or background noise?
  - **Domain attribution:** list of historical and current domains resolving to this IP.
  - **Threat assessment:** is this a known scanner, a known malware C2, a shared CDN edge, or a residential IP?
  - **Confidence:** low/medium/high with explicit reasoning.
- **Expected output:** A single-paragraph attribution narrative suitable for inclusion in the intelligence report.
- **Pivot point:** The narrative is the deliverable. If the IP is attributed to a shared CDN edge, the value of further pivots is low. If it is a residential IP tied to one operator, the value is high. If it is a known scanner, no further action is needed.

## Anti-Patterns (what NOT to do)

- **Do not port-scan the IP directly.** `nmap`, `masscan`, and `zmap` send packets to the target and cross from OSINT into active reconnaissance. Use Shodan InternetDB, Shodan API, or Censys for pre-scanned data.
- **Do not assume geo-location is accurate at city level.** IP geolocation is reliable at country level (~95% accurate), less reliable at region level (~75%), and unreliable at city level (~50%). Never quote a city without explicit disclaimer.
- **Do not confuse the ASN holder with the actual operator.** An AWS IP is operated by AWS the network operator, but the host running on it is operated by an AWS customer. The IP attribution tells you the datacenter; it does not tell you who rented the VM. Pivot through passive DNS and historical records to find the customer-facing domain.
- **Do not treat `noise: true` from GreyNoise as conclusive "ignore".** Some sophisticated attackers operate from IPs that also perform internet-wide scanning as cover. Use `noise` as a strong prior, not as a dismissal.
- **Do not rely on a single source for attribution.** RDAP, BGPview, Shodan, ipinfo, and GreyNoise can disagree (especially on ASN holder names). Cross-reference at least two sources for any factual claim.
- **Do not infer that two IPs in the same /24 are operated by the same actor.** In cloud and shared hosting, /24s are routinely split among many customers. Co-occurrence in a prefix is a weak signal — corroborate with passive DNS, cert SANs, or shared infrastructure.
- **Do not omit the timestamp of your query.** Shodan data is point-in-time; an IP that was a C2 in 2022 may have been repurposed as a benign CDN node in 2024. Always record when each data point was observed.
- **Do not attribute an IP to an individual human.** IPs attribute to networks and devices, not to people. The chain from IP -> human requires multiple intermediate pivots (IP -> domain -> email -> username -> identity), each with its own confidence rating.
- **Do not use the IP to send any traffic, including ICMP ping.** Even a ping reveals that someone is investigating the IP. Some attacker infrastructure monitors for incoming probes and burns the host in response.

## Output Format

When you complete this pivot, report:

- **Seed IP:** (input, with observation timestamp if known)
- **RDAP network:** CIDR, network name, country, abuse contact
- **ASN:** ASN identifier, holder name, holder address, peer ASNs
- **Shodan InternetDB:** ports, hostnames, CPEs, vulnerabilities, tags
- **ipinfo.io:** city, region, country, lat/long, org, timezone
- **GreyNoise:** noise flag, riot flag, classification, last-seen, scanner-name (if any)
- **VirusTotal:** reputation, AV detections, related domains (with last-resolution dates)
- **SecurityTrails:** historical domain pivots with first/last-seen dates
- **Attribution narrative:** 1-paragraph structured summary
- **Confidence:** low/medium/high with reasoning
- **Limitations:** data freshness, source disagreements, residential-vs-hosting ambiguity

## Cross-references

- Related playbooks: [`domain-to-infrastructure.md`](domain-to-infrastructure.md), [`metadata-to-attribution.md`](metadata-to-attribution.md), [`breach-to-credentials.md`](breach-to-credentials.md)
- Tools used: [`../../tools/free-tools.yaml`](../../tools/free-tools.yaml) (RDAP, BGPview, Shodan InternetDB, ipinfo.io), [`../../tools/apis.yaml`](../../tools/apis.yaml) (GreyNoise, VirusTotal, SecurityTrails, Censys)
- Ethics: [`../../ethics/legal-frameworks.md`](../../ethics/legal-frameworks.md) (passive-only scope, anti-port-scan), [`../../ethics/anti-hallucination.md`](../../ethics/anti-hallucination.md)
