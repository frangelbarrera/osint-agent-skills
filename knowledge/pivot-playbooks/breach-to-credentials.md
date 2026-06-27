# Pivot Playbook: Breach -> Credentials

## Trigger

You have confirmed that an email, username, phone number, or other identifier appears in one or more public data breaches. The breach participation was discovered either via Have I Been Pwned (HIBP) during the email-to-username playbook, via direct mention in a leaked database indexed by IntelX or DeHashed, via a dark-web monitoring feed, or via a breach-corpus reference in a published threat-intelligence report.

This playbook is **strictly read-only**. The credentials retrieved from breach corpora are evidence — never to be used for authentication. Using breached credentials to log in to any system, even the system the credentials were stolen from, is intrusion under the Computer Fraud and Abuse Act (CFAA, US), the Computer Misuse Act (CMA, UK), the Council of Europe Convention on Cybercrime, and equivalent statutes in virtually every jurisdiction. The agent must enforce this rule without exception.

The goal of this playbook is to extract intelligence from breach records: pivot identifiers, document password reuse patterns (for threat modeling), attribute account ownership across services, and identify the broader breach corpus context that reveals the target's digital footprint.

## Inputs

- A confirmed breach participation record (from HIBP or similar).
- The email, username, or phone to search across breach corpora.
- API keys for: HIBP, DeHashed (paid), IntelX (free + paid).
- Optional: a list of secondary identifiers (alternate emails, usernames, phone) to cross-pivot in the same breach.
- A persistent evidence log location to record every breach record retrieved (chain-of-custody).

## Step 1: Confirm breach participation via HIBP

- **Tool:** HIBP API v3 — https://haveibeenpwned.com/API/v3
- **Command:**
  ```bash
  curl -s -H "hibp-api-key: $HIBP_KEY" \
       -H "user-agent: osint-agent-skills" \
       "https://haveibeenpwned.com/api/v3/breachedaccount/target@example.com?truncateResponse=false" \
    | jq '.[] | {Name, Title, Domain, BreachDate, AddedDate, PwnCount, DataClasses, IsVerified, IsFabricated, IsSensitive, IsRetired, IsSpamList}'
  ```
- **Expected output:** JSON array of breach objects. Each breach includes the breach name, the affected site domain, the breach date, the data classes exposed (Emails, Passwords, Usernames, Names, Dates of birth, IP addresses, Phone numbers, etc.), and verification status flags.
- **Pivot point:** Each breach name is a label for a corpus that may be searchable via DeHashed or IntelX. The `DataClasses` array tells you what to expect when you query those services. `IsVerified` breaches are higher-confidence; `IsFabricated` and `IsSpamList` breaches should be deprioritized.

## Step 2: Retrieve breach-corpus records via DeHashed

- **Tool:** DeHashed API — https://dehashed.com/api
- **Command:**
  ```bash
  # Search by email
  curl -s -H "Authorization: Bearer $DEHASHED_KEY" \
       -H "Accept: application/json" \
       "https://api.dehashed.com/search?query=email:target@example.com&size=200" \
    | jq '.entries[] | {id, email, username, name, address, phone, ip, database, password_hash, password_plaintext}'

  # Search by username (cross-pivot — find every breach where this username appears)
  curl -s -H "Authorization: Bearer $DEHASHED_KEY" \
       "https://api.dehashed.com/search?query=username:jdoe88&size=500" | jq .
  ```
- **Expected output:** Records from breach corpora. Fields vary by breach; commonly include `email`, `username`, `name`, `password` (sometimes plaintext in older breaches — LinkedIn 2012, Adobe 2013), `password_hash` (bcrypt, MD5, SHA1, PBKDF2), `ip`, `phone`, `address`, and the `database` (breach name).
- **Pivot point:** The `password` (when plaintext) or the `password_hash` is the highest-value pivot. The same password hash appearing across two breaches under different usernames is strong evidence that the same human controlled both accounts (because humans rarely choose identical passwords across services — when they do, it is by the same human). The `name`, `address`, and `phone` fields provide direct identity enrichment.

## Step 3: Enrich with darker-web sources via IntelX

- **Tool:** Intelligence X (IntelX) API — https://2.intelx.io/api
- **Command:**
  ```bash
  # Start a search
  curl -s -X POST "https://2.intelx.io/phonebook/search" \
       -H "x-key: $INTELX_KEY" \
       -H "Content-Type: application/json" \
       -d '{"term":"target@example.com","buckets":[],"maxresults":100,"media":0,"target":1}'

  # Poll for results using the returned ID
  curl -s "https://2.intelx.io/phonebook/search/result?id=$SEARCH_ID&limit=100" \
       -H "x-key: $INTELX_KEY" | jq '.selectors[]'
  ```
- **Expected output:** A list of "selectors" (data points) found in IntelX's indexed corpora — leaks, pastes, dark-web forums, paste sites — associated with the email. Each selector includes the source and the field value.
- **Pivot point:** IntelX covers sources HIBP and DeHashed do not — particularly paste-site leaks, dark-web forum scrapes, and unindexed corpora. The selectors often reveal additional identifiers (alternate emails, usernames, phone numbers, crypto addresses) that reseed the pivot graph.

## Step 4: Identify OTHER usernames in the same breach tied to the email

- **Tool:** DeHashed / IntelX (same as Steps 2-3) — additional analysis step.
- **Command:** For each breach the email participates in, pull ALL records from that breach that share any field with the target record:
  ```bash
  # Find every record in the LinkedIn 2012 breach sharing this IP
  curl -s -H "Authorization: Bearer $DEHASHED_KEY" \
       "https://api.dehashed.com/search?query=ip:\"1.2.3.4\"&database=\"linkedin\"&size=200" | jq .

  # Find every record sharing the target's password hash (extreme care — see ethics)
  curl -s -H "Authorization: Bearer $DEHASHED_KEY" \
       "https://api.dehashed.com/search?query=password_hash:\"5f4dcc3b5aa765d61d8327deb882cf99\"&size=200" | jq .
  ```
- **Expected output:** Records from the same breach that share an identifier with the target — same IP, same password hash, sometimes same name.
- **Pivot point:** A shared IP within a single breach is a strong indicator that the same physical device (and likely the same human) registered multiple accounts. A shared password hash across breaches under different emails is the single strongest account-ownership pivot available in OSINT — humans are remarkably consistent with their passwords.

## Step 5: Document password reuse patterns (NEVER test login)

- **Tool:** None — analysis step. Use a hash library (e.g., `hashcat --show <hash>` against a known-wordlist crack database, or a rainbow-table lookup like `crackstation.net`) ONLY for the purpose of pattern recognition, NOT to enable login attempts.
- **Command:** Aggregate the password field across breaches:
  ```bash
  jq -s 'map(.password_plaintext // empty) | unique' breach_records.json
  ```
- **Expected output:** A list of unique passwords used by the target across breaches.
- **Pivot point:** Patterns to document (not exploit): (a) the target reuses the same password across multiple services — this is a credential-stuffing risk vector for the target themselves; (b) the target uses a base word plus a service suffix (`PasswordLinkedIn`, `PasswordAdobe`) — a recognizable pattern that can be predicted for unsampled services; (c) the target has changed passwords over time — breaches from different years showing different passwords suggest the target updates credentials periodically. NEVER use any of these passwords to attempt login. NEVER include plaintext passwords in the final intelligence report — reference them only by hash or by a pattern description.

## Step 6: Use breach data as pivots, not as credentials

- **Tool:** None — synthesis step.
- **Command:** For each pivot candidate found in Steps 2-5, build a cross-reference table:

  | Breach | Field | Value | Pivot-to-Playbook |
  |---|---|---|---|
  | LinkedIn 2012 | username | jdoe88 | username-to-identity |
  | Adobe 2013 | email | target@example.com | email-to-username (corroborating) |
  | Dropbox 2012 | password_hash | 5f4dcc... | (evidence of ownership, no pivot) |
  | Collection #1 | ip | 1.2.3.4 | ip-to-attribution |

- **Expected output:** A structured pivot table linking each breach finding to the next playbook.
- **Pivot point:** Each row in this table is a launch point for another playbook. The cumulative graph of pivots forms the investigation's evidence chain.

## Step 7: Document the breach-corpus provenance

- **Tool:** None — documentation step.
- **Command:** For each breach record retrieved, record: (a) breach name and breach date; (b) the data source that surfaced it (HIBP, DeHashed, IntelX); (c) the date the breach was added to that source; (d) the date the agent retrieved the record; (e) the API endpoint used; (f) the response body verbatim (stored in evidence log).
- **Expected output:** A complete provenance record per finding.
- **Pivot point:** This provenance record is what makes the finding admissible and auditable. If the breach corpus is later removed from a source (HIBP retires breached accounts on request, DeHashed occasionally removes records), your provenance record preserves the evidence.

## Anti-Patterns (what NOT to do)

- **NEVER use breached credentials to log in to any system.** This is the single most important rule in this playbook. Even if the target reused the password and the system is reachable, logging in is unauthorized access — a criminal offense in nearly every jurisdiction. See `ethics/legal-frameworks.md` for the statutes.
- **NEVER include plaintext passwords in the final intelligence report.** Reference passwords only by hash or by pattern description (e.g., "the target uses a base word plus service suffix"). Including plaintext creates a document that itself becomes a security risk if leaked.
- **Do not attempt to crack password hashes beyond what is needed for pivot-corroboration.** Full offline cracking of every hash you find is scope creep. The pivot value is in the hash itself (matching hashes indicate same password); cracking the hash adds no pivot value unless you need to recognize a pattern.
- **Do not assume a breach record's `name` field is the target's real name.** Users routinely enter fake names at signup. Treat `name` fields as candidate identifiers requiring corroboration, not as confirmed identities.
- **Do not treat all breaches as equal.** HIBP's `IsVerified`, `IsFabricated`, `IsRetired`, and `IsSpamList` flags matter. `IsFabricated: true` breaches are often aggregations of unrelated data masquerading as a single breach — pivots from these are weak.
- **Do not query DeHashed or IntelX with wildcards (`*`) at high volume.** These services rate-limit aggressively and will suspend your account. Use specific queries.
- **Do not share breach records with third parties.** Breach data is itself a form of compromised personal data; sharing it creates additional harm. Store retrieved records in the evidence log, not in chat or shared docs.
- **Do not publish breach findings in a way that could lead to account takeover.** A public report that says "user X used password Y across 5 services" invites credential-stuffing attacks against the user. Anonymize or redact in any non-internal deliverable.
- **Do not request HIBP removal on behalf of the target.** That would erase the very evidence you are investigating. If the target requests removal, that is their right; you simply note the removal date in the provenance record.
- **Do not use breached credentials to test "if the password still works."** Even reading a login response without entering the account is intrusion in many jurisdictions. The line is bright: no login attempts, ever.

## Output Format

When you complete this pivot, report:

- **Seed identifier:** (input email/username/phone)
- **HIBP breaches:** list of `breach_name`, `breach_date`, `data_classes_exposed`, `verification_status`
- **DeHashed records:** list of `database`, `email`, `username`, `name` (if present), `ip` (if present), `password_hash` (redacted to first 8 chars + length), `address` (if present)
- **IntelX selectors:** list of `selector_type`, `selector_value`, `source_name`
- **Cross-breach pivot table:** structured as in Step 6
- **Password reuse pattern summary:** qualitative only — "target reuses one password across 3 services", "target uses service-suffix pattern", etc. — NO plaintext
- **Provenance log:** pointer to evidence log file containing raw API responses
- **Confidence:** low/medium/high per finding
- **Limitations:** API key coverage gaps, breaches not indexed, retired records

## Cross-references

- Related playbooks: [`email-to-username.md`](email-to-username.md), [`username-to-identity.md`](username-to-identity.md), [`ip-to-attribution.md`](ip-to-attribution.md), [`phone-to-person.md`](phone-to-person.md)
- Tools used: [`../../tools/apis.yaml`](../../tools/apis.yaml) (HIBP, DeHashed, IntelX), [`../../tools/cli-tools.yaml`](../../tools/cli-tools.yaml) (h8mail for consolidation)
- Ethics: [`../../ethics/legal-frameworks.md`](../../ethics/legal-frameworks.md) (CFAA, CMA, Cybercrime Convention — no-login rule), [`../../ethics/privacy-guidelines.md`](../../ethics/privacy-guidelines.md) (PII handling for breach data), [`../../ethics/anti-hallucination.md`](../../ethics/anti-hallucination.md)
