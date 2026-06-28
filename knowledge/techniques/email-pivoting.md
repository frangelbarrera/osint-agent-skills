# Technique: Email Pivoting

## What this technique does

Email pivoting treats a single email address as a hub and pulls every connectable spoke from it: which websites the address was used to register on, which breaches exposed it, what avatar is associated with it, whether it appears in public code commits, and what its Skype/Microsoft account presence is. The email is the densest identifier most people leave behind because it sits at the intersection of authentication, communication, and public records. A single address frequently yields five to ten secondary identifiers in under fifteen minutes of disciplined pivoting.

## When to use it

Trigger this technique when the analyst has an email address from any source — a leaked database, a corporate contact page, a WHOIS record (post-GDPR historical records), a PGP key listing, a GitHub profile, or a manual guess based on naming convention. Email pivoting is the natural successor to `username-enumeration.md` when the username was derived from an email local-part, and the natural predecessor to `metadata-extraction.md` when the email is associated with downloadable documents.

## Tools

- Holehe (free, open source, 120+ sites): <https://github.com/megadose/holehe>
- Have I Been Pwned (free for breach lookups, paid API for bulk): <https://haveibeenpwned.com/>
- DeHashed (paid, deeper metadata per breach): <https://www.dehashed.com/>
- Intelligence X (freemium): <https://intelx.io/>
- Gravatar (free): <https://gravatar.com/site/check/>
- GitHub commit search (free): <https://github.com/search?q=author-email&type=commits>
- EPIEOS (free): <https://epieos.com/>
- Hunter.io (freemium, email format inference): <https://hunter.io/>
- EmailRep (free API): <https://emailrep.io/>
- OSINT.industries (paid): <https://osint.industries/>

## Procedure

### Step 1: Run Holehe to enumerate registered sites

```
holehe --only-used --timeout 20 jane.doe@example.com
```

Holehe checks whether the email is registered on each supported site by triggering a password-reset flow that returns a different response for "account exists" versus "no such account". The `--only-used` flag suppresses negative hits for cleaner output.

### Step 2: Query Have I Been Pwned

```
curl -H "hibp-api-key: $HIBP_KEY" \
     "https://haveibeenpwned.com/api/v3/breachedaccount/jane.doe@example.com?truncateResponse=false"
```

Each breach entry names the service, the breach date, the data classes exposed (email, password, dob, ip, etc.), and whether the breach is in the public domain. Breaches including passwords or IP addresses are especially high-value pivots.

### Step 3: Resolve Gravatar

Hash the lowercased trimmed email with MD5 and request:

```
https://www.gravatar.com/avatar/<md5>?d=404
```

A 200 response yields a profile photo; replacing `/avatar/` with `/` may expose a full Gravatar JSON profile (name, bio, links, crypto wallets if linked). Save the avatar for `reverse-image-search.md` and `facial-recognition.md`.

### Step 4: Dork for the email in quotes

```
"jane.doe@example.com" -site:example.com
"jane.doe@example.com" (filetype:pdf OR filetype:doc OR filetype:txt)
"jane.doe@example.com" site:linkedin.com
"jane.doe@example.com" site:github.com
```

### Step 5: Search GitHub commit authorship

Open `https://github.com/search?q=author-email%3Ajane.doe%40example.com&type=commits`. Each hit reveals a repository the person contributed to, often with timestamps, code patterns, and additional contributor emails visible in the commit log.

### Step 6: Run EPIEOS for Skype and Microsoft accounts

Submit the email at `https://epieos.com/` — EPIEOS probes Skype's lookup API and Microsoft account presence, returning Skype username, Microsoft account ID, and sometimes the account creation date.

### Step 7: Infer corporate email format

If the target is corporate, use Hunter.io or `curl https://api.hunter.io/v2/email-finder?domain=acme.com&full_name=jane+doe&api_key=$KEY` to derive `firstname.lastname@acme.com` versus `flast@acme.com` versus `jane@acme.com`. Validate the format by checking which variation appears in HIBP breach data.

### Step 8: Pivot through breach secondary fields

For each HIBP breach, query DeHashed or IntelX with the email to pull IP addresses, physical addresses, phone numbers, and passwords (hashed or plaintext) exposed in the same breach. Phone numbers feed SMS-lookup pivots; IPs feed geo-correlation.

### Step 9: Cross-reference with EmailRep

```
curl "https://emailrep.io/jane.doe@example.com"
```

EmailRep aggregates community-reported reputation data and may flag the address as disposable, malicious, or tied to a known persona.

## Interpreting results

A *strong pivot* is one where the email resolves to a secondary identifier with high reliability: a HIBP breach with password + IP, a GitHub commit log with timestamped activity, a Gravatar profile with photo and name. A *probable pivot* lacks confirmation — Holehe says "registered on Pinterest" but there is no profile photo or bio to confirm it is the same person. A *weak pivot* is a dork hit where the email appears in a list (e.g., a conference attendee roster) but there is no second attribute to confirm identity.

## Common false positives

- Holehe returns false positives on sites that always respond with 200 to password-reset requests regardless of account existence; verify any high-stakes hit manually.
- HIBP matches on email alone can collide for shared corporate addresses (`info@`, `admin@`, `support@`).
- Gravatar hashes match the email — but if the email has been reassigned to a different person (corporate role handover), the avatar is the previous holder.
- GitHub commit author emails can be spoofed; treat unverified commits as leads, not findings.
- EPIEOS Skype hits sometimes return stale accounts that have been deleted but not purged from the lookup index.

## Anti-patterns

- Do not use HIBP passwords to attempt logins elsewhere. That is credential stuffing, not OSINT, and crosses legal lines.
- Do not assume corporate email format from a single sample; verify against at least three known employees.
- Do not rely on Hunter.io's "verify" endpoint as authoritative — it returns false negatives for greylisted SMTP servers.
- Do not publish breach-exposed passwords, even partially redacted, in any report.
- Do not pivot through email-based services for minors; see `../../ethics/`.

## Cross-references

- Related playbooks: `../pivot-playbooks/email-to-username.md`, `../pivot-playbooks/email-to-domain.md`
- Tools used: `../../tools/apis.md`, `../../tools/cli-tools.md`, `../../tools/free-tools.md`
- Domain guides: `../domains/social-media.md`, `../domains/corporate.md`
