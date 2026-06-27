# Technique: DNS Recon

## What this technique does

DNS reconnaissance enumerates and interprets the Domain Name System records associated with a target domain, its subdomains, and the IP infrastructure those records resolve to. Beyond the obvious `A` and `MX` records, the DNS layer carries TXT-based security signals (SPF, DKIM, DMARC, CAA, BIMI), service-discovery records (SRV, PTR, SVCB, HTTPS), delegation topology (NS, SOA), and signing material (DNSKEY, RRSIG, DS) when DNSSEC is enabled. Combined with passive DNS history, the technique reconstructs how a domain's infrastructure has evolved over time and surfaces dangling records, takeover candidates, email security posture, and previously-unknown subdomains.

## When to use it

Trigger this technique when: the investigation has identified a domain of interest and needs to map its current infrastructure; a phishing campaign needs to be attributed to a domain family (shared nameservers, shared MX, shared SPF include); an acquisition needs to be confirmed pre-announcement (DNS changes often precede press releases); a takeover candidate is suspected (dangling CNAMEs pointing at decommissioned cloud services); or an email's authenticity needs verification (DMARC/SPF/DKIM alignment). DNS recon is also a prerequisite for `certificate-transparency.md` and `shodan-techniques.md` — both rely on hostname lists that DNS recon helps populate.

## Tools

- `dig` (free, universal, part of BIND): <https:// BIND9 / ISC>
- `kdig` (free, with modern DoH/DoT support): <https://www.knot-dns.cz/docs/latest/html/man/kdig.html>
- `dnsx` (free, ProjectDiscovery): <https://github.com/projectdiscovery/dnsx>
- `massdns` (free, high-performance brute): <https://github.com/blechschmidt/massdns>
- `amass` (free, OWASP): <https://github.com/owasp-amass/amass>
- `subfinder` (free, ProjectDiscovery): <https://github.com/projectdiscovery/subfinder>
- SecurityTrails (paid, passive DNS + history): <https://securitytrails.com/>
- DNSDB (paid, Farsight): <https://www.farsightsecurity.com/solutions/dnsdb/>
- PassiveDNS by CIRCL (free): <https://www.circl.lu/services/passive-dns/>
- VirusTotal Passive DNS (free with API): <https://www.virustotal.com/>
- `dnstwist` (free, typosquat detection): <https://github.com/elceef/dnstwist>
- `subjack` (free, takeover detection): <https://github.com/haccer/subjack>

## Procedure

### Step 1: Pull the full standard record set

```
for TYPE in A AAAA MX NS TXT SOA CNAME CAA SRV PTR; do
    dig +noall +answer $TYPE acme.com @1.1.1.1
done
```

Use a clean recursive resolver (Cloudflare 1.1.1.1 or Google 8.8.8.8) for consistency. Record every answer verbatim, including TTL.

### Step 2: Enumerate subdomains via multiple sources

Combine passive and active enumeration. Passive first:

```
subfinder -d acme.com -all -recursive -o subdomains-passive.txt
curl -s "https://crt.sh/?q=%25.acme.com&output=json" | jq -r '.[].name_value' \
    | tr ',' '\n' | sort -u > subdomains-ct.txt
curl -s "https://api.securitytrails.com/v1/history/acme.com/subdomains?children=true" \
    -H "APIKEY: $ST_KEY" | jq -r '.subdomains[]' > subdomains-st.txt
```

Active brute-force for residual coverage:

```
cat wordlist.txt | massdns -r resolvers.txt -t A -o S -w massdns-results.txt
```

Merge and deduplicate:

```
cat subdomains-*.txt | tr 'A-Z' 'a-z' | sort -u > subdomains-all.txt
```

### Step 3: Attempt a zone transfer

AXFR is rarely permitted on the public internet but is trivial to test and occasionally succeeds on misconfigured nameservers:

```
for NS in $(dig +short NS acme.com); do
    dig axfr acme.com @$NS
done
```

A successful AXFR returns the entire zone file. Record the result and notify no one outside the investigation team — it is a sensitive finding.

### Step 4: Validate DNSSEC

```
dig +dnssec DS acme.com @1.1.1.1
dig +dnssec DNSKEY acme.com @1.1.1.1
```

If `DS` records exist at the parent zone, DNSSEC is configured. Validate the chain with `delv`:

```
delv @1.1.1.1 www.acme.com A +root=K-root
```

### Step 5: Reverse DNS sweep

For each IP address discovered, run reverse lookups to find co-hosted domains:

```
for IP in $(awk '{print $NF}' a-records.txt); do
    dig +short -x $IP
done | sort -u
```

Co-hosted domains frequently reveal related organisations, shared infrastructure providers, or operator fingerprints.

### Step 6: Pull DNS history

Use SecurityTrails or DNSDB to retrieve historical A, MX, and NS records. Map the timeline of when each record was first seen and last seen. Look for infrastructure migrations (e.g., from on-prem to AWS), brand acquisitions (MX changes after acquisition), and deprecations (records removed and not replaced — possible takeover candidates).

### Step 7: Inspect email authentication posture

```
dig +short TXT acme.com | grep -i spf
dig +short TXT _dmarc.acme.com
dig +short TXT default._domainkey.acme.com
dig +short CAA acme.com
```

Interpret:
- SPF `~all` (softfail) or `?all` (neutral) is weaker than `-all` (hardfail).
- DMARC `p=none` is monitor-only; `p=quarantine` or `p=reject` is enforced. A target with `p=none` is more susceptible to email impersonation.
- DKIM record existence (selector-dependent) tells you whether the domain signs outbound mail.
- CAA records restrict which CAs may issue certificates for the domain; absence means any public CA can issue.

### Step 8: Scan for dangling DNS records

For every CNAME in the zone, verify the target still resolves and that the target service is owned by the same operator. A CNAME pointing to a `*.herokuapp.com`, `*.s3.amazonaws.com`, `*.azurewebsites.net`, or `*.github.io` endpoint that returns "no such app" is a takeover candidate. Confirm with `subjack` or `nuclei` takeover templates.

### Step 9: Pivot through NS and MX records

Nameserver hostnames often share infrastructure across domains. Pivot by querying SecurityTrails for other domains using the same NS pattern (`ns1.acme-dns.com`). MX records are even more distinctive: a small business using `mx1.acme-mail.com` is almost certainly operated by the same company that runs `acme-mail.com`.

## Interpreting results

A *current infrastructure hit* is an A/AAAA record that resolves to a live server responding on common ports. A *historical hit* is a passive-DNS record that resolved in the past but no longer does — useful for timeline reconstruction but not for current-state claims. A *takeover candidate* is a CNAME whose target returns a vendor-specific "not found" page. A *delegation signal* is a non-standard NS or MX hostname that links two domains infrastructurally.

## Common false positives

- CDN and shared-hosting IPs return many unrelated domains in reverse DNS — a single Cloudflare IP hosting thousands of sites is not an attribution link.
- DNSSEC chain validation fails for transient reasons (resolver timeout, parent zone stale cache); retry before declaring DNSSEC broken.
- TXT records accumulate over time (verification tokens for Google, Microsoft, Atlassian, etc.) — old TXT entries do not imply current service usage.
- SPF `include:` chains can nest up to 10 lookups; an apparent SPF misconfiguration may just be a deep include tree.
- AXFR "success" sometimes returns only a partial zone or a fake zone planted as a honeypot; verify by cross-referencing live A records.
- DNS history products disagree on timestamps; treat dates as approximate to the day, not the hour.

## Anti-patterns

- Do not run active subdomain brute-forcing at high concurrency against a target that has not authorised the investigation; even passive DNS queries can be observed by the target's authoritative resolver.
- Do not assume a domain's NS records reflect the operator's actual hosting — many sites use Cloudflare's NS for proxying while the origin is on AWS.
- Do not rely on a single resolver; some resolvers (especially ISP resolvers) return poisoned or filtered results. Cross-check authoritative lookups by querying the TLD authoritative servers directly.
- Do not publish DMARC reports or DKIM private keys if discovered in leaked configuration.
- Do not treat SPF/DMARC absence as proof that an email is forged — small businesses routinely lack these records, and many legitimate senders operate without them.

## Cross-references

- Related playbooks: `../pivot-playbooks/domain-to-infrastructure.md`, `../pivot-playbooks/email-auth-verification.md`
- Tools used: `../../tools/cli-tools.md`, `../../tools/apis.md`
- Domain guides: `../domains/web-infra.md`, `../domains/corporate.md`
