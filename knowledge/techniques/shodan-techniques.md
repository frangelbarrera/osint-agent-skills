# Technique: Shodan Techniques

## What this technique does

Shodan continuously scans the public IPv4 address space (and a growing slice of IPv6) on hundreds of TCP/UDP ports, captures the banners returned by every responsive service, and indexes those banners in a searchable database. Unlike Google, which indexes web *content*, Shodan indexes service *fingerprints*: HTTP title, SSH version, Redis welcome string, RTSP camera model, ICS protocol identifiers. For OSINT, Shodan turns a hostname, an IP, or a network range into a structured inventory of what is exposed, where, and with which software — and supports pivot searches that find every other host running the same fingerprint. Advanced use of Shodan dorks, facets, CLI bulk queries, and the free InternetDB endpoint turns the platform from a search engine into an investigation framework.

## When to use it

Trigger this technique when the analyst needs to: enumerate the internet-facing attack surface of an organisation (verify what is exposed versus what should be); attribute a phishing or scanning campaign to an operator by fingerprinting shared infrastructure; track the spread of a specific vulnerable software version across a country or sector; find the origin server behind a CDN by searching for non-standard ports carrying the target's TLS certificate; or corroborate a DNS or CT finding with live server evidence. Shodan is also the canonical pivot when the analyst has an IP address and needs to know what is running on it.

## Tools

- Shodan web search (free, limited): <https://www.shodan.io/search>
- Shodan CLI (free with account, requires API key for some commands): <https://cli.shodan.io/>
- Shodan REST API (paid quotas): <https://developer.shodan.io/api>
- Shodan InternetDB (free, no auth, one endpoint per IP): <https://internetdb.shodan.io/>
- Shodan Continuous Monitoring (paid, alert-on-new-exposure): <https://www.shodan.io/monitor>
- Shodan Enterprise (paid, bulk data export): <https://www.shodan.io/enterprise>
- Shodan Images (free, screenshots search): <https://images.shodan.io/>
- Shodan Maps (paid): <https://maps.shodan.io/>
- Censys (freemium, complementary coverage): <https://search.censys.io/>
- ZoomEye (freemium, China-based): <https://www.zoomeye.org/>
- FOFA (freemium, China-based, strong favicon search): <https://fofa.info/>
- Quake (freemium, 360): <https://quake.360.net/>

## Procedure

### Step 1: Frame the question as a dork

Shodan's query grammar combines `field:value` filters with boolean operators (`+`, `-`, parentheses). The most common filters: `port`, `country`, `org`, `hostname`, `net` (CIDR), `product`, `version`, `vuln`, `os`, `city`, `postal`, `geo` (lat,long,radius), `http.title`, `http.favicon.hash`, `ssl.cert`, `tag`, `asn`.

### Step 2: Run ten concrete dorks

1. `port:22 country:RU` — SSH banners in Russia.
2. `product:nginx version:1.18` — specific nginx version globally.
3. `org:"Amazon" port:6379` — Redis exposed on AWS.
4. `vuln:CVE-2021-44228` — Log4Shell-vulnerable hosts.
5. `http.title:"Dashboard" hostname:acme.com` — admin panels on target domain.
6. `http.favicon.hash:-1234567890` — hosts sharing a custom favicon.
7. `ssl.cert.subject.cn:"acme.com"` — hosts presenting an acme.com cert.
8. `port:3389 country:US has_screenshot:true` — RDP with screenshots.
9. `product:"Apache httpd" port:8080 -country:US -country:CN` — filtered by exclusion.
10. `tag:ics port:502` — Modbus ICS devices.

### Step 3: Use the CLI for bulk and scripted queries

```
shodan init $SHODAN_API_KEY
shodan search --fields ip_str,port,org,product,country "ssl.cert.subject.cn:acme.com" \
    --limit 1000 --separator "," > acme-hosts.csv
shodan host 1.2.3.4
shodan data --country US --port 22 --datatypes ssl
```

`shodan host` returns the full service record for an IP including all open ports, banners, vulnerabilities, and historical scan dates.

### Step 4: Pivot through favicon hash

The favicon hash is a MurmurHash3 of the favicon bytes; identical hashes across hosts strongly indicate the same application template. Compute a target favicon hash with:

```
python3 -c "import mmh3, requests, codecs; \
  r = requests.get('https://acme.com/favicon.ico'); \
  print(mmh3.hash(codecs.encode(r.content,'base64')))"
```

Then search Shodan (`http.favicon.hash:<value>`) and FOFA (`icon_hash="<value>"`) for matching hosts. This finds administrative panels, default-app deployments, and clone sites.

### Step 5: Use the free InternetDB for unauthenticated lookups

```
curl -s https://internetdb.shodan.io/1.2.3.4 | jq
```

InternetDB returns a JSON object with `cpes`, `hostnames`, `ip`, `ports`, `tags`, and `vulns`. It is rate-limited but free and requires no API key — ideal for quick checks during report writing.

### Step 6: Aggregate with facets

Facets summarise result distributions:

```
shodan search --facets org,country,port "vuln:CVE-2021-44228" --limit 0
```

Use `--limit 0` to skip individual results and return only the facet counts. This is the fastest way to profile which orgs and countries are most affected by a vulnerability.

### Step 7: Set up Continuous Monitoring

For investigations spanning weeks, register network alerts:

```
shodan alert create acme-monitors 1.2.3.0/24
shodan monitor add acme-monitors "port:3389"
shodan monitor subscribe acme-monitors
```

Shodan will email when new services matching the filters appear in the monitored CIDR.

### Step 8: Cross-reference with Censys

Shodan and Censys scan at different cadences and emphasise different protocols. Always cross-reference high-stakes findings against Censys. A host that appears in Shodan but not Censys is likely a recent exposure; one in Censys but not Shodan may be filtered or geo-blocked.

## Interpreting results

A *confirmed exposure* is a banner that the analyst can independently reproduce by connecting to the IP:port. A *historical exposure* is one Shodan observed in the past but no longer sees — useful for timeline reconstruction. A *probable exposure* is a banner matching the target's fingerprint but on a network range the target does not own — investigate whether it is a related entity (subsidiary, contractor, CDN node). A *false-positive exposure* is a banner that matches a query filter but is actually a different service (e.g., a reverse proxy presenting a backend's certificate).

## Common false positives

- `org:` filters derive from BGP/ASN data and may be inaccurate for IPs announced via secondary providers or cloud egress.
- `http.title:` matches the page's `<title>` at scan time; sites frequently change titles between scans.
- `vuln:` tags are derived from CPE matching and are not always confirmed exploits — a tagged host may be patched or running a non-vulnerable configuration.
- `ssl.cert.subject.cn:` matches the certificate, not the actual hostname — many shared-hosting certificates list hundreds of unrelated domains as SANs.
- `port:6379` open does not equal writable Redis; many deployments bind to localhost or require authentication.
- The same hostname can resolve to different IPs over time; Shodan's records reflect the scan-time resolution, not the current resolution.

## Anti-patterns

- Do not attempt to authenticate to or exploit services discovered via Shodan without explicit authorisation — banner-grabbing is passive, connecting with credentials is not.
- Do not rely solely on Shodan for asset inventory; combine with Censys, ZoomEye, FOFA, and direct DNS recon for completeness.
- Do not publish raw IP lists that include personal devices (home routers, IP cameras) — these are privacy-sensitive.
- Do not assume a Shodan hit on `acme.com` hostname means acme.com owns the host; DNS can be spoofed or shared, and Shodan's hostname field reflects reverse DNS or SNI at scan time.
- Do not run `shodan scan` (active scanning) from a corporate IP — Shodan's terms of service and most legal frameworks treat active scanning differently from passive querying.
- Do not consume API quota without checking rate limits; bulk queries against the free tier return 429 and may lock the key.

## Cross-references

- Related playbooks: `../pivot-playbooks/domain-to-infrastructure.md`, `../pivot-playbooks/ip-to-operator.md`
- Tools used: `../../tools/apis.md`, `../../tools/cli-tools.md`
- Domain guides: `../domains/web-infra.md`, `../domains/ics.md`, `../domains/corporate.md`
