# Technique: Certificate Transparency

## What this technique does

Certificate Transparency (CT) is a framework of append-only cryptographic logs maintained by browser vendors and CAs that records every TLS certificate issued by participating Certificate Authorities. Because Chrome and (since 2018) all major browsers require every publicly-trusted certificate to be logged in at least one CT log, the aggregate CT corpus is effectively a public ledger of who requested a certificate for what hostname and when. For OSINT this is invaluable: querying CT logs returns the full set of hostnames (including SANs — Subject Alternative Names) a domain has ever certified, exposing internal subdomains, staging environments, deprecated services, and infrastructure shared between nominally separate organisations. It also allows fingerprinting an operator across many domains via shared certificate serials, issuer patterns, or unusual SAN sets.

## When to use it

Trigger this technique when the analyst needs to enumerate subdomains of a target domain (CT is often richer than DNS zone files because certificates are issued proactively, before DNS records are created); when investigating phishing infrastructure (typosquat domains often share SANs with each other or with the legitimate brand); when trying to attribute a cluster of domains to a single operator; when reconstructing a timeline of infrastructure deployment; or when validating that a corporate target's TLS posture matches their stated security claims. CT is also the canonical pivot for any finding in `shodan-techniques.md` that surfaces a hostname: the certificate yields the issuer, the SAN set, and the issuance date.

## Tools

- crt.sh (free, web + JSON API, maintained by Sectigo): <https://crt.sh/>
- Censys (freemium, deep CT search): <https://search.censys.io/certificates>
- Google CT search (free): <https://transparencyreport.google.com/https/certificates>
- CertSpotter (free, monitor mode paid): <https://sslmate.com/certspotter/>
- Facebook CT monitoring (free): <https://developers.facebook.com/tools/ct/>
- CTFr (free, Python wrapper): <https://github.com/UnaPibaGeek/ctfr>
- Shodan certificate search (paid): <https://www.shodan.io/search?query=ssl.cert>
- Cloudflare Merkle Town (free, log inspection): <https://ct.cloudflare.com/>
- `crt_sh` Python library (free): <https://pypi.org/project/crt-sh/>

## Procedure

### Step 1: Enumerate via crt.sh JSON

```
curl -s "https://crt.sh/?q=%25.acme.com&output=json" | jq -r '.[].name_value' \
    | tr ',' '\n' | tr 'A-Z' 'a-z' | sort -u > subdomains.txt
```

The `%25` is URL-encoded `%` so crt.sh matches any subdomain of `acme.com`. The `name_value` field can contain comma-separated SANs, hence the `tr` split. Deduplicate and lower-case before passing to DNS resolution.

### Step 2: Pull historical certificate entries

For timeline reconstruction, request crt.sh output ordered by certificate `not_before`:

```
curl -s "https://crt.sh/?q=acme.com&output=json" \
    | jq -r '.[] | "\(.not_before) \(.serial_number) \(.name_value)"' \
    | sort
```

This shows when each hostname first entered the CT log — a strong proxy for when the infrastructure was provisioned.

### Step 3: Query Censys for richer certificate metadata

```
curl -H "Authorization: Basic $BASE64_AUTH" \
     "https://search.censys.io/api/v2/certificates/search?q=acme.com"
```

Censys returns the parsed certificate structure including issuer, subject, key algorithm, signature algorithm, extensions, and the CT log entries themselves. Use this when you need to fingerprint an issuer chain.

### Step 4: Extract SANs for cross-domain attribution

The SAN field lists every hostname the certificate covers. Cross-reference SANs across multiple certificates:

```
curl -s "https://crt.sh/?q=acme.com&output=json" \
    | jq -r '.[].name_value' | tr ',' '\n' | sort -u > acme-sans.txt
curl -s "https://crt.sh/?q=acme-subsidiary.com&output=json" \
    | jq -r '.[].name_value' | tr ',' '\n' | sort -u > acme-subsidiary-sans.txt
comm -12 acme-sans.txt acme-subsidiary-sans.txt
```

Overlapping SANs (especially when one certificate lists domains from two nominally separate organisations) is strong evidence of shared infrastructure ownership.

### Step 5: Use the serial number as a fingerprint

The certificate serial number is unique per issuer. Multiple certificates sharing the same serial from different issuers indicates a CA mis-issuance; the same serial from the same issuer indicates the same certificate. Cross-reference serials across queries via Censys.

### Step 6: Distinguish pre-certificates from final certificates

CT logs contain two entries per certificate: a pre-certificate (issued by a special pre-cert signer, used to commit the certificate to CT before binding) and the final certificate (issued by the real CA). When querying by serial, expect two hits per real-world certificate. Filter pre-certificates out using the `ct_precert` extension or by issuer name.

### Step 7: Set up a monitoring feed

For ongoing investigations, register the domain with CertSpotter or Facebook CT monitoring. New certificates will trigger email notifications, allowing real-time detection of new subdomain provisioning.

### Step 8: Pivot into Shodan and Censys host search

Each unique hostname discovered via CT becomes a query target in Shodan (`ssl.cert.subject.cn:"acme.com"`) and Censys, surfacing the actual servers presenting those certificates.

## Interpreting results

A *confirmed subdomain* is one whose certificate was issued by a public CA and whose DNS record resolves. A *planned-but-unlaunched* subdomain has a CT entry but no current DNS A record — the operator provisioned the cert but never stood up the service (or took it down). A *legacy* subdomain has a CT entry whose `not_after` date is in the past, indicating an expired certificate that may or may not have been renewed. A *shared-infrastructure* hit is a single certificate listing SANs across multiple domains — this is a strong attribution signal when the domains are nominally independent.

## Common false positives

- Certificates issued for typosquatted domains by third parties (brand-abuse monitoring services, security researchers, or actual attackers). A CT entry for `arnaz0n.com` does not mean Amazon issued it.
- Wildcard certificates (`*.acme.com`) inflate the apparent hostname count; one cert covers infinite subdomains.
- Let's Encrypt issuance is automated and frequent; some sites renew every 60 days, creating many CT entries for the same hostname. Filter by unique hostname + earliest issuance date to deduplicate.
- Pre-certificates and final certificates appear as two separate entries; deduplicate by serial number.
- Some CAs issue certificates for `localhost` and other reserved names for testing — these are noise in most queries.
- Self-signed certificates never appear in CT logs; their absence does not mean a service is not running.

## Anti-patterns

- Do not assume CT is exhaustive — only certificates from participating CAs are logged. Self-signed certificates, internal PKIs, and certificates issued by CAs that pre-date CT (and were grandfathered) do not appear.
- Do not conflate a CT entry with a live service. The certificate may have been issued but never deployed, or deployed and later retired.
- Do not rely on a single CT search engine; crt.sh and Censys occasionally miss entries due to log sharding. Cross-check at least two sources.
- Do not assume certificate ownership equals domain ownership; the CA validates domain control, not legal ownership.
- Do not publish raw CT dumps that include personal names (Subject CN sometimes contains individual names for S/MIME certificates).

## Cross-references

- Related playbooks: `../pivot-playbooks/domain-to-infrastructure.md`, `../pivot-playbooks/cert-to-operator.md`
- Tools used: `../../tools/free-tools.md`, `../../tools/apis.md`
- Domain guides: `../domains/web-infra.md`, `../domains/corporate.md`
