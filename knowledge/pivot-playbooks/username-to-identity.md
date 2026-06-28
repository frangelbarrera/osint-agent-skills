# Pivot Playbook: Username -> Identity

## Trigger

You have a username (a single handle such as `jdoe88`) recovered from any prior pivot — most commonly from the email-to-username playbook, but also from a forum scrape, a breach corpus, a social media mention, or a document metadata field. The username is the seed artifact; the goal of this playbook is to enumerate every platform where that handle is in use, extract profile metadata, recover images for reverse-search, and assemble corroborated identity claims (real name, location, affiliations, alternate handles).

This playbook must produce corroboration, not assertion. A single hit on one platform is a hypothesis; multiple hits with consistent metadata (same avatar, same bio phrasing, overlapping follow graphs) constitute identity linkage.

## Inputs

- A username string (exact, case-sensitive in the original).
- Optional: the source platform where the username was first observed (helps prioritize verification).
- Optional: a list of alternate usernames already gathered from other pivots (enables cross-platform handle-diff analysis).
- A working local install of `sherlock` and `maigret` (`pipx install sherlock-project maigret`).
- Browser automation if scraping is required (Playwright or `agent-browser` skill).
- Access to breach-corpus search (HIBP, DeHashed, IntelX) for username-mode queries.

## Step 1: Broad enumeration with sherlock

- **Tool:** sherlock — https://github.com/sherlock-project/sherlock
- **Command:**
  ```bash
  sherlock jdoe88 --timeout 10 --print-found --output sherlock_jdoe88.txt
  ```
- **Expected output:** A list of URLs where the username appears to be registered across ~400 platforms. Each line is the platform profile URL.
- **Pivot point:** Each URL is a candidate profile. Note the platform and URL for the next step. sherlock returns positives based on HTTP status and page-shape heuristics; expect a ~5-15% false-positive rate.

## Step 2: Deep enumeration with maigret

- **Tool:** maigret — https://github.com/soxoj/maigret
- **Command:**
  ```bash
  maigret jdoe88 --html maigret_jdoe88.html --pdf maigret_jdoe88.pdf --json maigret_jdoe88.json --timeout 15
  ```
- **Expected output:** An HTML/PDF report plus JSON listing ~2500 platform probes. For each positive hit, maigret extracts additional metadata: profile pic URL, bio text, links to other profiles, tags, follower counts when exposed.
- **Pivot point:** The `extracted_data` block in the JSON is the highest-value output — it includes profile picture URLs (for reverse image search), declared name fields, location fields, and explicit cross-links to other social platforms. These cross-links are gold: they are explicit identity claims by the user themselves.

## Step 3: Targeted Google dorks for high-value platforms

- **Tool:** Google search — https://www.google.com/
- **Command:** Run a series of dork queries that constrain the username to specific platforms:
  ```
  "jdoe88" site:reddit.com
  "jdoe88" site:twitter.com OR site:x.com
  "jdoe88" site:github.com
  "jdoe88" site:instagram.com
  "jdoe88" site:tiktok.com
  "jdoe88" site:youtube.com
  "jdoe88" site:twitch.tv
  "jdoe88" site:steamcommunity.com
  "jdoe88" site:keybase.io
  "jdoe88" inurl:user OR inurl:profile OR inurl:u
  ```
- **Expected output:** Indexed profile pages and mentions. Many platforms (Reddit, GitHub) are well-indexed; Instagram and TikTok are poorly indexed but sometimes appear via aggregator sites.
- **Pivot point:** Each hit should be cross-checked against the platform directly. Mentions of the username by other users (e.g., a Reddit thread referencing `/u/jdoe88`) can reveal associated context — subreddits they frequent, topics they discuss — that contributes to behavioral fingerprinting.

## Step 4: Per-platform direct lookup and metadata extraction

- **Tool:** Platform-native APIs and pages.
- **Command:** For each high-value platform, perform a direct lookup:

  **GitHub:**
  ```bash
  curl -s "https://api.github.com/users/jdoe88" | jq '{login,name,bio,location,company,blog,email,created_at,avatar_url}'
  curl -s "https://api.github.com/users/jdoe88/repos?sort=updated&per_page=100" | jq '.[] | {name,description,language,fork,html_url}'
  ```

  **Reddit (read-only JSON via old.reddit.com or reddit.com/r/.../user/...):**
  ```bash
  curl -s -A "osint-agent-skills/1.0" "https://www.reddit.com/user/jdoe88/about.json" | jq '.data | {name,created_utc,subreddit.title,subreddit.public_description,icon_img}'
  curl -s -A "osint-agent-skills/1.0" "https://www.reddit.com/user/jdoe88/comments/.json?limit=100" | jq '.data.children[].data | {subreddit,created_utc,body}'
  ```

  **Keybase:** browse to `https://keybase.io/jdoe88` — Keybase profiles are gold because they cryptographically prove ownership of linked identities (Twitter, GitHub, Reddit, PGP, websites). The proofs are verifiable and high-confidence.

  **Steam:** browse to `https://steamcommunity.com/id/jdoe88` — exposes profile name, location, join date, friends list (public by default), game library.

- **Expected output:** Per-platform profile JSON or HTML. Bio fields, location fields, and avatar URLs are the highest-value fields.
- **Pivot point:** Aggregate all `avatar_url` values into a list for Step 5. Aggregate `location`, `bio`, and `name` fields for corroboration analysis. Note each platform's `created_at`/`join_date` — accounts created within hours of each other are stronger evidence of common ownership.

## Step 5: Reverse image search on all recovered profile pictures

- **Tool:** Yandex Images — https://yandex.com/images/ (best for faces), Google Lens — https://lens.google.com/ (best for objects and landmarks), Bing Visual Search — https://www.bing.com/visualsearch, PimEyes — https://pimeyes.com/ (paid, faces only).
- **Command:** Download each avatar to local disk:
  ```bash
  mkdir -p avatars
  curl -sL "https://avatars.githubusercontent.com/u/12345?v=4" -o avatars/github_jdoe88.jpg
  curl -sL "https://reddit.com/.../icon.jpg" -o avatars/reddit_jdoe88.jpg
  # ... etc
  ```
  Then submit each image to Yandex Images and Google Lens (both via browser UI; for automation, third-party reverse-image APIs exist but evaluate their TOS).
- **Expected output:** Pages of visually similar images and the URLs where they appear.
- **Pivot point:** Hits on unrelated websites (a conference speaker page, a LinkedIn headshot, an academic department page) tie the avatar to a real-world identity. Document the source URL and the contextual identity claim (caption, alt text, surrounding text).

## Step 6: Check the Wayback Machine for deleted or changed accounts

- **Tool:** Wayback Machine CDX API — https://web.archive.org/cdx/search/cdx
- **Command:**
  ```bash
  curl -s "https://web.archive.org/cdx/search/cdx?url=reddit.com/user/jdoe88*&output=json&collapse=digest&fl=timestamp,original,statuscode,digest" | jq .
  curl -s "https://web.archive.org/cdx/search/cdx?url=twitter.com/jdoe88&output=json&from=20100101&to=20240101" | jq .
  ```
  Use `twayback` for bulk download: `twayback -u "https://reddit.com/user/jdoe88" -o wayback_jdoe88/`
- **Expected output:** A timestamped list of snapshots. For each snapshot, fetch the archived HTML.
- **Pivot point:** Compare historical bios, locations, and avatars against current values. Many users edit out sensitive details after a controversy; the Wayback Machine often retains the prior version. A 2015 bio that says "Senior Engineer at Acme Corp, San Francisco" is a high-confidence identity claim even if the 2024 bio is blank.

## Step 7: Search breach databases by username

- **Tool:** DeHashed — https://dehashed.com (paid), IntelX — https://intelx.io (free + paid), HIBP (does not support username search, only email — so use DeHashed or IntelX).
- **Command (DeHashed):**
  ```bash
  curl -s -H "Authorization: Bearer $DEHASHED_KEY" \
       "https://api.dehashed.com/search?query=username:jdoe88" | jq .
  ```
- **Expected output:** Records from breach corpora where the username field equals the target. Each record includes the breach name, the email associated with that username in the breach, and any other fields exposed (IP, name, phone, password hash).
- **Pivot point:** Each breach record is a high-confidence cross-link between the username and another identifier (email, phone, real name). This is often the strongest available evidence of identity linkage.

## Step 8: Assemble the corroborated identity claim

- **Tool:** None — analysis step.
- **Command:** Build an identity matrix:

  | Platform | Username | Display Name | Bio | Location | Joined | Avatar Hash | Confidence |
  |---|---|---|---|---|---|---|---|
  | GitHub | jdoe88 | John Doe | "Backend @ Acme" | San Francisco | 2014-03-12 | sha256:abc... | high |
  | Reddit | jdoe88 | (none) | (none) | (none) | 2014-03-15 | sha256:abc... | high |
  | Twitter | j_doe_88 | John D. | "tweets about rust" | SF Bay | 2015-08-22 | sha256:def... | medium |

  Compute avatar perceptual hashes (pHash) and compare — identical pHashes across platforms strongly suggest common ownership.

- **Expected output:** A single corroborated identity record with explicit confidence ratings and source citations.
- **Pivot point:** The identity record is the deliverable. If a real name has been recovered, the next playbook depends on the user's request — could pivot into domain ownership, public records, corporate filings, etc.

## Anti-Patterns (what NOT to do)

- **Do not assume that identical usernames on two platforms indicate the same person.** "jdoe88" is a common pattern; many unrelated people share it. Corroboration requires at least two of: identical avatar image (verified by pHash, not eyeball), overlapping bio phrasing, account creation dates within a short window, mutual follow relationships, or shared breach records.
- **Do not run maigret at full scope without throttling.** The tool probes 2500+ sites and will saturate a residential connection and trip abuse-detection on multiple CDNs. Use `--tag` to limit platforms if you only need social-media coverage.
- **Do not log in to a platform using your own account to view a profile.** This exposes your investigation account to the target (some platforms show "who viewed your profile" notifications) and creates a digital footprint. Use unauthenticated browsing where possible.
- **Do not scrape Instagram, TikTok, or LinkedIn aggressively.** These platforms have aggressive bot detection and will rate-limit or ban your IP within minutes. Use sparse, human-paced requests.
- **Do not treat Keybase proofs as absolute.** Keybase proofs are cryptographically sound but only prove that the same entity controlled both accounts at proof time. They do not prove current ownership, and Keybase has been somewhat dormant since Zoom's acquisition.
- **Do not use facial recognition services (PimEyes, FindClone, Clearview) without explicit user authorization.** These tools raise serious privacy and ethical concerns and are restricted or illegal in some jurisdictions (Illinois BIPA, EU GDPR). See `ethics/legal-frameworks.md` and `ethics/privacy-guidelines.md`.
- **Do not infer real identity from a username containing a common name pattern.** "jsmith" appearing on a forum does not make John Smith the user. Reach for the username-to-identity chain only when you have at least one corroborating data point.
- **Do not visit profile URLs from your investigation machine without OPSEC controls.** Some platforms log referring URLs and embed tracking pixels. Use a clean browser profile or, ideally, the Wayback Machine for non-urgent lookups.

## Output Format

When you complete this pivot, report:

- **Seed username:** (input)
- **sherlock hits:** list of platform + URL, flagged with false-positive risk
- **maigret hits:** list of platform + URL + extracted metadata (avatar, bio, links)
- **Google dork hits:** list of query + URL + extracted handle / mention context
- **Per-platform verified profiles:** GitHub, Reddit, Twitter/X, Keybase, Steam, etc., with field-by-field metadata
- **Avatar inventory:** list of avatar URLs, pHash values, reverse-image-search hit URLs
- **Wayback recoveries:** list of snapshot timestamps with the historical metadata they reveal
- **Breach matches by username:** list of breach + associated email / phone / name fields
- **Corroborated identity claim:** name, location, employer, alternate handles, each with citation
- **Confidence assessment:** low / medium / high, with explicit reasoning
- **Limitations:** platform access failures, false-positive risks, data gaps

## Cross-references

- Related playbooks: [`email-to-username.md`](email-to-username.md), [`breach-to-credentials.md`](breach-to-credentials.md), [`photo-to-location.md`](photo-to-location.md), [`metadata-to-attribution.md`](metadata-to-attribution.md)
- Tools used: [`../../tools/cli-tools.yaml`](../../tools/cli-tools.yaml) (sherlock, maigret, twayback), [`../../tools/apis.yaml`](../../tools/apis.yaml) (DeHashed, IntelX, PimEyes), [`../../tools/free-tools.yaml`](../../tools/free-tools.yaml) (Wayback CDX, GitHub API, Keybase)
- Ethics: [`../../ethics/legal-frameworks.md`](../../ethics/legal-frameworks.md), [`../../ethics/privacy-guidelines.md`](../../ethics/privacy-guidelines.md), [`../../ethics/anti-hallucination.md`](../../ethics/anti-hallucination.md)
