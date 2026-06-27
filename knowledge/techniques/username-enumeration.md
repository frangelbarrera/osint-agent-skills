# Technique: Username Enumeration

## What this technique does

Username enumeration takes a single known handle (or a person's name) and maps it across as many online platforms as possible to identify accounts belonging to the same individual. It exploits the fact that most users reuse handles across services, and that most platforms expose public profile URLs with predictable patterns (`twitter.com/<handle>`, `instagram.com/<handle>`, `github.com/<handle>`). The output is a list of profile URLs, each with a confidence score, that can seed further pivots (profile photos for reverse image search, bios for employer pivots, post history for behavioural pattern analysis).

## When to use it

Trigger this technique when you have a username from any source — a forum post, a leaked database, a social-media mention, an email local-part — and need to know where else the same person has a presence. It is also the standard first step after deriving a username from an email (`jane.doe@example.com` → try `jane.doe`, `janedoe`, `jdoe` across platforms). Use it before more invasive techniques: enumeration is passive (no login attempts, no rate-limit stress) and surfaces leads quickly.

## Tools

- Sherlock (free, open source, 300+ sites): <https://github.com/sherlock-project/sherlock>
- Maigret (free, open source, 2500+ sites, auto-tags): <https://github.com/soxoj/maigret>
- Blackbird (free, open source, GUI + CLI): <https://github.com/p1ngul1n0/blackbird>
- WhatsMyName (free, web + JSON list): <https://whatsmyname.app/>
- Namechk (free, web, marketing-focused but useful): <https://namechk.com/>
- Instant Username Search (free, web): <https://instantusername.com/>
- Breach databases (often list usernames — HIBP, DeHashed, IntelX): see `email-pivoting.md`
- Social Searcher (freemium): <https://www.social-searcher.com/>

## Procedure

### Step 1: Normalise the candidate handle

Strip whitespace, lower-case it, replace punctuation variants. If you only have a real name, generate candidate handles: `firstlast`, `first.last`, `firstlast`+NN, `flast`, `firstinitial+lastname`, `lastname.first`, common leetspeak (`s4rah`).

### Step 2: Run Maigret as the primary sweep

```
maigret jane.doe --html --pdf --timeout 15 --no-color \
    --tags gender=female,finance --verbose
```

Maigret produces per-site HTML snapshots and a JSON results file. Filter the output by `status=claim` (site reports the username exists) versus `status=available` (site reports it does not).

### Step 3: Cross-check with Sherlock for breadth

```
sherlock jane.doe --timeout 15 --print-found --output sherlock-results.txt
```

Sherlock and Maigret use different site lists; running both maximises coverage.

### Step 4: Manually verify top platforms

Sweep results include false positives (some sites return 200 for any username). Manually load the profile pages on Twitter/X, Instagram, TikTok, Reddit, GitHub, Twitch, Mastodon, YouTube, and LinkedIn. Confirm each page actually shows a profile with content rather than an empty stub.

### Step 5: Dork for username mentions

```
"jane.doe" -site:linkedin.com
"jane.doe" site:reddit.com
"jane.doe" (site:github.com OR site:gitlab.com)
"jane.doe" "@" (site:twitter.com OR site:x.com OR site:threads.net)
```

### Step 6: Pivot through breach databases

Query HIBP, DeHashed, and IntelX for the username. Breaches frequently list usernames alongside emails and IPs, allowing pivot to `email-pivoting.md`.

### Step 7: Document handle provenance

For each confirmed account, record: platform, URL, account creation date (if visible), display name, bio, follower count, profile photo URL, and last activity date. Provenance is critical because the next pivot depends on it.

## Interpreting results

A *confirmed match* is a profile whose display name, photo, bio, or posting pattern links it back to the target. A *probable match* shares the handle but has no disambiguating evidence — note it as a lead, not a finding. An *orphan hit* is a handle that resolves to a profile but the profile is clearly a different person (different country, different language, different age) — exclude it explicitly in the report so reviewers understand why it was discarded. A *dead hit* is a profile that exists but has been dormant for years; useful for timeline reconstruction but not for current-state analysis.

## Common false positives

- Sites that return HTTP 200 for any URL regardless of whether the profile exists (Badoo, MeetMe, several dating platforms).
- Automated bot accounts that register handles defensively across platforms — they look real but are squatting.
- Common handles (`jdoe`, `smith`) return many unrelated people on large platforms.
- Handle reuse by different individuals over time (a handle released by one person and re-registered by another).
- Deleted-but-indexed profiles — the search engine has the URL, the platform returns 404.

## Anti-patterns

- Do not assume identical handles imply the same person. Confirm with at least one independent attribute (avatar, bio phrase, linked website, posting style) before treating a hit as belonging to the target.
- Do not log into enumerated accounts to "look around" — that crosses from passive enumeration into active engagement and changes the legal posture.
- Do not run Sherlock or Maigret at maximum concurrency against a single platform; respect the tool's rate limits and use `--timeout` to fail fast.
- Do not publish raw enumeration dumps; redact platforms that imply sensitive attributes (dating sites, mental-health forums, political forums).
- Do not run enumeration against minors. If the target is plausibly under 18, terminate the enumeration and consult `../../ethics/`.

## Cross-references

- Related playbooks: `../pivot-playbooks/email-to-username.md`, `../pivot-playbooks/username-to-profile.md`
- Tools used: `../../tools/cli-tools.md`, `../../tools/free-tools.md`
- Domain guides: `../domains/social-media.md`, `../domains/forums.md`
