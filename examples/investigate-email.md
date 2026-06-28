# Example: Investigate an Email Address

**Target:** `test@example.com` (reserved per RFC 2606 — safe synthetic target)
**Investigation type:** Email-to-identity pivot chain
**Methodology reference:** [`../knowledge/pivot-playbooks/email-to-username.md`](../knowledge/pivot-playbooks/email-to-username.md)
**Output template:** [`../templates/reports/intelligence-report.md`](../templates/reports/intelligence-report.md)

## Objective

From the email address `test@example.com` alone, determine what can be inferred about the identity behind it using only public OSINT sources. Document every tool invocation in the evidence log. Produce a structured intelligence report.

## Agent reasoning (Phase 1 — Planning and Direction)

> Subject: the operator of email address `test@example.com`.
> Objective: infer identity and cross-platform presence from the email alone.
> Scope: public OSINT sources. No breach-credential retrieval, no contact with the target, no facial recognition.
> Pivots authorized: free tools only. Paid APIs require user approval.
> Success criteria: a structured intelligence report with cited sources per finding and an explicit limitations section.

## Agent actions (Phase 2 — Collection)

### Step 1 — holehe: registered-site enumeration

```bash
holehe test@example.com
```

**Raw output (excerpt):**

```
[+] adobe.com
[+] twitter.com
[+] spotify.com
[-] github.com
[-] instagram.com
[-] facebook.com
```

The email appears to be registered on Adobe, Twitter, and Spotify. It is not registered on GitHub, Instagram, or Facebook.

### Step 2 — HaveIBeenPwned: breach participation check

```bash
curl -s -H "hibp-api-key: $HIBP_KEY" \
  "https://haveibeenpwned.com/api/v3/breachedaccount/test@example.com" \
  -H "user-agent: osint-agent-skills"
```

**Raw output (excerpt):**

```json
[
  {"Name":"Collection1","Domain":"","BreachDate":"2019-01-01"},
  {"Name":"LinkedIn","Domain":"linkedin.com","BreachDate":"2016-05-05"},
  {"Name":"Dropbox","Domain":"dropbox.com","BreachDate":"2012-07-01"}
]
```

The email appears in three breaches: Collection1 (2019), LinkedIn (2016), Dropbox (2012). The LinkedIn breach participation suggests the email was used professionally; the Dropbox breach participation suggests the email was used for file storage. No breach credentials are retrieved — only breach participation is confirmed.

### Step 3 — Gravatar lookup

```bash
curl -s "https://www.gravatar.com/$(echo -n "test@example.com" | md5sum | awk '{print $1}').json"
```

**Raw output:**

```json
[]
```

No Gravatar profile is associated with this email. The hash is recorded in the evidence log; the empty response is recorded verbatim.

### Step 4 — Google dorks for the email address

The agent runs a curated set of dorks:

```
"test@example.com"
"test@example.com" site:linkedin.com
"test@example.com" site:github.com
"test@example.com" site:pastebin.com
"test@example.com" filetype:pdf
```

**Raw output:** zero results across all dorks. The reserved-domain nature of `example.com` means no real-world content references this email.

### Step 5 — Username extraction

The agent cross-references the holehe and HIBP results to look for usernames associated with the email. For `test@example.com`, no username is recoverable from public data — the breach-credential retrieval would be required to recover usernames from the breach records, and that technique is flagged for human review per `../ethics/code-of-conduct.md`.

The agent pauses and asks the user:

> The investigation cannot proceed to username pivoting without breach-credential retrieval, which requires your explicit authorization per ethics/code-of-conduct.md. Do you authorize retrieval of breach-credential metadata (username only, no password retrieval) from the Collection1, LinkedIn, and Dropbox breach records?

### Step 6 — sherlock on the inferred username (if authorized)

If the user authorizes and a username is recovered (hypothetical: `testuser`), the agent runs:

```bash
sherlock testuser --timeout 15 --print-found
```

**Hypothetical output:**

```
[+] GitHub: https://github.com/testuser
[+] Reddit: https://reddit.com/user/testuser
[+] Twitter: https://twitter.com/testuser
[-] Instagram: not found
```

The agent then runs the [`investigate-username.md`](investigate-username.md) walkthrough against the recovered username. **For this example walkthrough**, the user declines authorization, and the agent stops at Step 5.

## Agent analysis (Phase 3 & 4 — Processing and Production)

The agent processes the raw output:
- Normalizes breach dates to ISO 8601.
- Records each tool invocation in the evidence log with timestamp, exit code, and response hash.
- Labels breach-participation findings as "Confirmed" (HIBP is a primary source).
- Labels cross-platform presence as "Unverified" (no username was recovered).
- Labels identity attribution as "Not reached" (insufficient data within the constrained scope).

## Final report excerpt

```markdown
## CLASSIFICATION
UNCLASSIFIED

## REPORT METADATA
- Report ID: OSINT-2024-001
- Date: 2024-06-15 (UTC)
- Analyst: OSINT Agent Skills
- Subject: operator of email address test@example.com
- Confidence: Unverified (no identity attribution reached)

## EXECUTIVE SUMMARY
The email address test@example.com is a synthetic target (RFC 2606 reserved
domain) used for methodology validation. Public OSINT collection confirmed
the email's registration on three platforms (Adobe, Twitter, Spotify) and
its participation in three data breaches (Collection1, LinkedIn, Dropbox).
No Gravatar profile is associated. No public web content references the
email. Username recovery would require breach-credential retrieval, which
is flagged for human review per ethics/code-of-conduct.md and was not
authorized in this run. Identity attribution was not reached within the
constrained scope.

## METHODOLOGY
Five-phase Intelligence Cycle per knowledge/methodologies/intelligence-cycle.md.
Pivot playbook: knowledge/pivot-playbooks/email-to-username.md. Tools: holehe
(registered-site enumeration), HaveIBeenPwned API (breach participation),
Gravatar (profile lookup), Google (dorks). All tools free-tier; no paid API
quota consumed.

## FINDINGS

### Finding 1 — Registered-site enumeration
**Confidence:** Confirmed
**Source:** holehe, executed 2024-06-15T14:03:12Z
**Details:** The email is registered on Adobe, Twitter, and Spotify. Not
registered on GitHub, Instagram, or Facebook.
**Implications:** Cross-platform presence exists; usernames may be recoverable
on each platform via direct lookup.

### Finding 2 — Breach participation
**Confidence:** Confirmed
**Source:** HaveIBeenPwned API v3, executed 2024-06-15T14:05:43Z
**Details:** The email appears in three breaches: Collection1 (2019-01-01),
LinkedIn (2016-05-05), Dropbox (2012-07-01).
**Implications:** Breach-credential retrieval may yield usernames, password
hashes, and partial profile data. Retrieval is flagged for human review per
ethics/code-of-conduct.md and was not authorized in this run.

### Finding 3 — No Gravatar profile
**Confidence:** Confirmed (negative finding)
**Source:** Gravatar JSON API, executed 2024-06-15T14:06:01Z
**Details:** No Gravatar profile is associated with the email's MD5 hash.
**Implications:** No profile image or display name is recoverable via Gravatar.

### Finding 4 — No public web references
**Confidence:** Confirmed (negative finding)
**Source:** Google dorks, executed 2024-06-15T14:06:30Z
**Details:** Zero results across five dork variants. Consistent with the
reserved-domain nature of example.com.
**Implications:** No additional pivot paths from web search.

## PIVOTS PERFORMED
1. Email → registered-site enumeration (holehe). Pivot: email-to-username.
2. Email → breach participation (HIBP). Pivot: breach-to-credentials (paused).
3. Email → profile image (Gravatar). Pivot: photo-to-location (no image found).
4. Email → web references (Google). Pivot: metadata-to-attribution (no references).

## RECOMMENDED NEXT STEPS
1. Authorize breach-credential retrieval (username only) to recover
   cross-platform usernames from the LinkedIn and Dropbox breach records.
2. Direct-lookup the email on Adobe, Twitter, and Spotify to recover any
   public profile data (display name, bio, profile image, registration date).
3. If a username is recovered, run the username-to-identity pivot playbook
   per knowledge/pivot-playbooks/username-to-identity.md.

## SOURCES
- holehe: https://github.com/megadose/holehe
- HaveIBeenPwned API v3: https://haveibeenpwned.com/API/v3
- Gravatar JSON API: https://www.gravatar.com/
- Google: https://www.google.com/

## LIMITATIONS
- Identity attribution was not reached. The investigation was constrained
  to free tools and to techniques not flagged for human review.
- Breach-credential retrieval was paused pending user authorization. If
  authorized, additional findings (usernames, partial passwords) would be
  recoverable.
- The target email is synthetic (RFC 2606 reserved domain). Real-world
  investigations on non-reserved domains may yield materially richer findings.
- Breach data reflects disclosures through the HIBP dataset as of
  2024-06-15; later breaches may not appear.
```

## Notes for the agent

- The agent correctly labeled the breach-participation finding as "Confirmed" (HIBP is a primary source for that question) and the identity attribution as "Not reached" (no data was collected within the constrained scope).
- The agent correctly paused at Step 5 instead of autonomously retrieving breach credentials. The pivot protocol in `../system-prompt.md` requires this pause.
- The agent correctly labeled all negative findings ("no results") as "Confirmed (negative finding)" — the absence of a result is itself an observation, not a missing data point.
- The agent correctly included the limitations section, including the data-freshness caveat for the breach database.
