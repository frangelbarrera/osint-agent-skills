# Example: Investigate a Username

**Target:** `testuser` (generic placeholder — safe synthetic target)
**Investigation type:** Username-to-identity pivot chain
**Methodology reference:** [`../knowledge/pivot-playbooks/username-to-identity.md`](../knowledge/pivot-playbooks/username-to-identity.md)
**Output template:** [`../templates/reports/intelligence-report.md`](../templates/reports/intelligence-report.md) (specialized as `person-profile.md`)

## Objective

From the username `testuser` alone, enumerate cross-platform presence, extract profile metadata, cross-reference with breach databases, and infer what can be inferred about the real identity behind the username — strictly within the bounds of public OSINT and without contacting any target.

## Agent reasoning (Phase 1 — Planning and Direction)

> Subject: the operator of username `testuser`.
> Objective: enumerate cross-platform presence and infer identity from public data.
> Scope: public profile data on social platforms. No contact with the target. No facial recognition without explicit authorization. No breach-credential retrieval beyond breach participation.
> Pivots authorized: free tools only.
> Success criteria: a person-profile report with cross-platform enumeration, profile metadata, breach cross-references, and an explicit limitations section acknowledging that no real identity link may be recoverable.

## Agent actions (Phase 2 — Collection)

### Step 1 — sherlock for cross-platform enumeration

```bash
sherlock testuser --timeout 15 --print-found --output /tmp/sherlock-testuser.txt
```

**Raw output (excerpt):**

```
[+] About.me: https://about.me/testuser
[+] GitHub: https://github.com/testuser
[+] GitLab: https://gitlab.com/testuser
[+] Reddit: https://reddit.com/user/testuser
[+] Twitter: https://twitter.com/testuser
[+] Keybase: https://keybase.io/testuser
[-] Instagram: not found
[-] TikTok: not found
[-] Facebook: not found
```

Six platforms return positive hits. The agent records each URL in the evidence log with the HTTP status and timestamp.

### Step 2 — maigret for additional platforms and metadata extraction

```bash
maigret testuser --timeout 15 --html /tmp/maigret-report.html
```

**Raw output (excerpt):**

```
[*] Checking username, 300+ sites...
[+] Mastodon (mastodon.social): @testuser@mastodon.social
[+] PyPI: https://pypi.org/user/testuser/
[+] npm: https://www.npmjs.com/~testuser
[+] Steam: https://steamcommunity.com/id/testuser
[-] LinkedIn: not found
[-] Telegram: not found (private)
[*] Extracted metadata:
    - GitHub: avatar URL, bio "PHP developer", location "Earth", 5 public repos
    - Reddit: 1.2k karma, account age 4 years, subreddits: r/php, r/sysadmin
    - Twitter: 87 followers, bio "PHP dev, coffee, sysadmin stuff"
```

maigret recovers three additional platforms (Mastodon, PyPI, npm, Steam) and extracts profile metadata from GitHub, Reddit, and Twitter.

### Step 3 — Reverse image search on profile pictures

The agent downloads the avatar from each platform that exposes one:

```bash
curl -s -o /tmp/gh-avatar.jpg "https://avatars.githubusercontent.com/u/<id>?v=4"
curl -s -o /tmp/reddit-avatar.png "https://www.reddit.com/user/testuser/about.json"
# (extract avatar_url from JSON)
```

For each avatar, the agent runs reverse image search via Yandex (preferred for facial and small-image searches) and TinEye (preferred for prior-circulation detection):

```
Yandex Image Search: https://yandex.com/images/search?rpt=imageview&url=<uploaded URL>
TinEye: https://tineye.com/search?url=<uploaded URL>
```

**Raw output (synthetic target — hypothetical):**

```
GitHub avatar: no Yandex hits; TinEye reports zero prior circulation.
Reddit avatar: default Reddit snoo avatar (stock image) — false positive,
  ignore.
Twitter avatar: no Yandex hits; TinEye reports zero prior circulation.
```

For `testuser`, the avatars do not produce a face match or prior-circulation hit. The agent does not invoke facial-recognition services (PimEyes, FaceCheck.ID) because those are flagged for human review per `../ethics/code-of-conduct.md`.

### Step 4 — Cross-reference with breach databases

The agent has no email to look up in HIBP directly, but maigret may have extracted email addresses from GitHub profile pages (if the user has chosen to display a public email). For `testuser`, no public email is displayed on GitHub.

The agent attempts a secondary pivot: query DeHashed (paid API) for any breach record matching the username. **The agent pauses and asks for user authorization before consuming paid API quota:**

> The username-to-identity pivot playbook suggests cross-referencing the username with breach databases via DeHashed (paid API). Do you authorize this lookup? It may yield email addresses, password hashes, and other breach-credential metadata associated with the username.

For this walkthrough, the user declines, and the agent stops at Step 3.

### Step 5 — Cross-platform convergence analysis

The agent analyzes the cross-platform data for convergence:

- **Username consistency.** All six platforms use the exact username `testuser`. No variant spellings.
- **Bio convergence.** GitHub, Twitter, and Reddit bios all describe "PHP developer" or "PHP dev" — consistent occupation signal.
- **Interest convergence.** Reddit subreddit activity (r/php, r/sysadmin) and Twitter bio ("sysadmin stuff") converge on a PHP-developer-with-sysadmin-duties profile.
- **Account-age convergence.** Reddit account is 4 years old; GitHub commit history (5 public repos) starts approximately 4 years ago — consistent with a single operator creating accounts in the same window.
- **Geographic signal.** GitHub location is "Earth" — no useful signal.

## Agent analysis (Phase 3 & 4 — Processing and Production)

The agent processes the raw output:
- Records each tool invocation in the evidence log.
- Labels cross-platform presence as "Confirmed" (each platform was probed and returned a profile).
- Labels profile metadata (bio, karma, account age) as "Confirmed" (primary-source extracted).
- Labels the cross-platform identity convergence as "Probable" (multiple independent signals converge, but no primary-source link between accounts — they could in principle be different people using the same username).
- Labels real-identity attribution as "Not reached" (no breach-credential link, no facial recognition, no real-name exposure within the constrained scope).

## Final report excerpt

```markdown
## CLASSIFICATION
UNCLASSIFIED

## REPORT METADATA
- Report ID: OSINT-2024-USER-001
- Date: 2024-06-15 (UTC)
- Analyst: OSINT Agent Skills
- Subject: operator of username "testuser"
- Confidence: Probable (cross-platform convergence); Unverified (identity)

## EXECUTIVE SUMMARY
The username "testuser" is a generic placeholder used in this walkthrough.
Cross-platform enumeration via sherlock and maigret confirmed presence on
six platforms (GitHub, GitLab, Reddit, Twitter, Keybase, About.me) and
four additional platforms (Mastodon, PyPI, npm, Steam). Profile metadata
extraction reveals a consistent PHP-developer profile across GitHub,
Twitter, and Reddit, with Reddit subreddit activity in r/php and
r/sysadmin. Account-age convergence (Reddit 4 years, GitHub commit history
4 years) is consistent with a single operator. Reverse image search on
profile avatars produced no face matches or prior-circulation hits.
Real-identity attribution was not reached within the constrained scope.
No breach-credential retrieval was authorized.

## METHODOLOGY
Five-phase Intelligence Cycle per knowledge/methodologies/intelligence-cycle.md.
Pivot playbook: knowledge/pivot-playbooks/username-to-identity.md. Tools:
sherlock (cross-platform enumeration), maigret (additional platforms +
metadata extraction), Yandex Image Search (reverse image search), TinEye
(prior-circulation detection). All tools free-tier; no paid API quota
consumed. No facial-recognition services invoked (flagged for human review
per ethics/code-of-conduct.md).

## FINDINGS

### Finding 1 — Cross-platform enumeration
**Confidence:** Confirmed
**Source:** sherlock + maigret, executed 2024-06-15T16:02:15Z
**Details:** Username "testuser" resolves to profiles on 10 platforms:
GitHub, GitLab, Reddit, Twitter, Keybase, About.me, Mastodon, PyPI, npm,
Steam. Not present on Instagram, TikTok, Facebook, LinkedIn, Telegram.
**Implications:** The username is in active use across developer-focused
and technical-adjacent platforms.

### Finding 2 — Profile metadata convergence
**Confidence:** Confirmed
**Source:** maigret metadata extraction, executed 2024-06-15T16:03:40Z
**Details:** GitHub bio "PHP developer", location "Earth", 5 public repos.
Twitter bio "PHP dev, coffee, sysadmin stuff", 87 followers. Reddit 1.2k
karma, 4-year account age, subreddits r/php and r/sysadmin.
**Implications:** Bios and subreddit activity converge on a
PHP-developer-with-sysadmin-duties profile. Account-age convergence is
consistent with a single operator.

### Finding 3 — Cross-platform identity convergence
**Confidence:** Probable
**Source:** synthesized from Finding 1 and Finding 2
**Details:** The same username, the same occupation description, and
overlapping account-creation windows across GitHub, Twitter, and Reddit
suggest a single operator across all three platforms. No primary-source
link between accounts was confirmed.
**Implications:** The convergence is consistent with a single operator
but not dispositive — multiple people could share the username and the
occupation. Do not promote to "Confirmed" without a primary-source link.

### Finding 4 — No avatar matches
**Confidence:** Confirmed (negative finding)
**Source:** Yandex Image Search + TinEye, executed 2024-06-15T16:05:20Z
**Details:** GitHub avatar: no Yandex hits; TinEye reports zero prior
circulation. Reddit avatar: default Reddit snoo (stock image) — false
positive, ignored. Twitter avatar: no Yandex hits; TinEye reports zero
prior circulation.
**Implications:** No facial-recognition pivot paths available from
profile avatars within the constrained scope.

## PIVOTS PERFORMED
1. Username → cross-platform enumeration (sherlock). Pivot: username-to-identity.
2. Username → additional platforms (maigret). Pivot: username-to-identity.
3. Profile avatar → reverse image search (Yandex, TinEye). Pivot:
   photo-to-identity (no matches found).
4. Username → breach databases (DeHashed). Pivot: paused pending user
   authorization; user declined.

## RECOMMENDED NEXT STEPS
1. If investigation expands to identity, authorize breach-credential
   retrieval (DeHashed lookup on username) to recover associated email
   addresses. From email, the email-to-username pivot playbook applies.
2. If investigation expands to facial recognition, authorize PimEyes or
   FaceCheck.ID searches on the GitHub avatar — flagged for human review
   per ethics/code-of-conduct.md.
3. Direct lookup on GitHub profile page for any commit emails in the
   public commit history — the `.gitconfig` may expose a real-name email.

## SOURCES
- sherlock: https://github.com/sherlock-project/sherlock
- maigret: https://github.com/soxoj/maigret
- Yandex Image Search: https://yandex.com/images/
- TinEye: https://tineye.com/

## LIMITATIONS
- The target username is generic. Real-world investigations on distinctive
  usernames will yield materially richer findings.
- Real-identity attribution was not reached within the constrained scope.
  Breach-credential retrieval and facial recognition were not authorized.
- Cross-platform identity convergence is labeled "Probable" rather than
  "Confirmed" because no primary-source link between accounts was
  established. The convergence is consistent with a single operator but
  not dispositive.
- Avatar reverse image search was performed via free services (Yandex,
  TinEye). Paid services (PimEyes, FaceCheck.ID) would yield more
  comprehensive facial-recognition coverage but are flagged for human
  review.
- This walkthrough used synthetic data for a generic username. Actual
  tool output for "testuser" on each platform may vary; the agent
  records what is observed and labels inferences accordingly.
```

## Notes for the agent

- The agent correctly distinguished "Confirmed" findings (cross-platform presence, profile metadata) from "Probable" findings (cross-platform identity convergence). The convergence is a synthesis, not a primary observation, and the system prompt requires synthesis-level findings to cap at "Probable" absent a primary-source link.
- The agent correctly declined to invoke facial-recognition services without explicit authorization, per `../ethics/code-of-conduct.md`.
- The agent correctly paused before consuming paid API quota (DeHashed) and accepted the user's refusal gracefully, documenting the refused pivot in the limitations section.
- The agent correctly noted that "the person-profile may be largely empty if no real identity links" — for synthetic or privacy-conscious targets, this is the expected outcome. An empty profile is itself an intelligence finding, not a failure.
