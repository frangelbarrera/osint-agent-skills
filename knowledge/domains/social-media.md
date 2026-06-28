# Investigating Social Media Presence

## Scope
This guide covers the structured investigation of an individual or entity's social media presence across the major platforms. It applies to journalists profiling a public figure, due-diligence teams, fraud analysts, HR background-check teams (where lawful), and threat-intelligence analysts mapping an actor's online persona. It covers username enumeration, platform-specific collection techniques, profile metadata extraction, post-history analysis, network mapping, and archived-version recovery. It does **not** cover social-engineering outreach, friend-request infiltration of private accounts, credential use to access locked content, or any technique that requires misrepresentation of the investigator's identity. Automated scraping that violates platform terms of service is also out of scope; the guide distinguishes between manual observation (in scope) and high-volume scraping (not).

## Key questions to answer
- What platforms does the subject maintain a presence on, active and abandoned?
- What usernames, handles, and display names are used across platforms, and which recur (cross-platform username correlation)?
- What profile metadata is exposed — bio, location, link-in-bio, profile picture, banner image, account creation date?
- What is the posting history — volume, temporal pattern, content themes, languages used, geographic signals?
- Who is in the subject's network — followers, following, mutuals, tagged accounts, replied-to accounts?
- What archived versions of the profile and posts exist, and what do they show that the current profile does not?
- Has the subject's account been compromised, suspended, renamed, or sold?
- Does the subject maintain multiple personas — personal, professional, pseudonymous — and can they be linked?
- What third-party integrations are visible (link-in-bio, Spotify connected, GitHub connected, cross-posting to other platforms)?
- What are the operational-security tells — posting pattern, device fingerprints (where exposed), language drift, time-zone signals?

## Data categories
### Category 1: Username enumeration
Run the subject's known usernames (and known name variants) through sherlock and maigret — both are open-source username-enumeration tools that query 100+ platforms for account existence. Sherlock is simpler and faster; maigret produces richer reports and includes additional Dork-based pivots. Treat the output as a candidate list, not a confirmed list — false positives occur (platforms that return 200 for any username, parked accounts, name collision). Manually verify each candidate on the platform itself before including in the report.

### Category 2: Platform-specific collection (Twitter/X)
Profile metadata: handle, display name, bio, location, URL, account-creation date (visible via Twitter API or via tools like TweetBeaver's account-age lookup), profile and banner images. Posting history: use the Twitter advanced-search operators (`from:handle since:YYYY-MM-DD until:YYYY-MM-DD`), or export via the Twitter API (now X API, paid tiers). Network: followers and following lists (limited in the modern X UI; use the API where available). Time-zone inference from posting-time distribution. Geotag recovery: pre-2015 tweets often carried precise geotags; modern tweets rarely do.

### Category 3: Platform-specific collection (Facebook)
Profile visibility is highly dependent on the subject's privacy settings. A public-profile view typically shows: profile picture, cover photo, name, bio, work, education, places lived, contact info (where set public), friends count, followers count. Posting history is often limited to public posts. Network enumeration is restricted — Facebook does not show friends lists of private accounts. Use the Wayback Machine for historical profile captures. Facebook's graph search was deprecated in 2019; modern pivots rely on email/phone reverse lookup (now severely restricted) and breach-data correlation.

### Category 4: Platform-specific collection (Instagram)
Profile metadata: handle, name, bio, link-in-bio, profile picture, follower/following counts, post count. Business and creator accounts expose a "category" field. Posting history: images, captions, geotags (when set), tagged accounts. Story highlights are persistent; live stories expire in 24 hours unless archived. Use the Wayback Machine and archive.today for historical capture — Instagram has aggressive rate-limiting and bot detection; manual capture is more reliable than automated. Network: followers and following lists are restricted to authenticated users with mutual connections; use breach-data and username-correlation instead.

### Category 5: Platform-specific collection (LinkedIn)
Profile metadata: name, headline, location, about, experience (with dates), education, skills, recommendations, activity. LinkedIn is the single richest source for professional history. LinkedIn's terms of service prohibit automated scraping; the 2017 hiQ v. LinkedIn litigation established some protections for public-data scraping in the US but the situation remains jurisdiction-dependent. Manual capture only. Cross-reference experience dates with corporate filings and press releases — LinkedIn is self-reported and may be aspirational or backdated. Mutual-connections view is restricted to authenticated users; use breach data and corporate registry cross-referencing instead.

### Category 6: Platform-specific collection (TikTok)
Profile metadata: handle, display name, bio, profile picture, follower/following/like counts, post count. Posting history: short videos (with audio), captions, hashtags, sounds used (a pivot to other creators), geotags (rare). TikTok's "For You" algorithm is not directly observable; manual capture of the subject's public posts is the baseline. Hashtag and sound co-occurrence can identify related accounts. The Wayback Machine does not capture TikTok videos reliably; use yt-dlp for video archiving (manual, single-account, terms-of-service-aware).

### Category 7: Platform-specific collection (Snapchat)
Profile metadata: handle, display name, bitmoji, snapcode, snapstreak with mutuals (if you are a connection). Public-facing content is limited unless the subject maintains a Public Profile (Creator) — then a public profile and story are visible. Snap Map (if shared publicly or with friends) shows current location; this is sensitive PII — handle with care. Adding the subject as a contact (where lawful and authorised) reveals more, but adding a subject under a false identity is outside scope.

### Category 8: Platform-specific collection (Reddit)
Profile metadata: handle (u/name), account creation date, karma, verified email flag, premium flag, moderator status. Posting history: full comment and submission history is public via the user profile (e.g., reddit.com/user/name). Subreddit participation patterns are strong interest/community signals. Use PullPush (successor to Pushshift) for historical Reddit data including deleted content (within archival coverage). Removeddit and Unddit have largely ceased functioning; PullPush is the current archive source.

### Category 9: Platform-specific collection (YouTube)
Channel metadata: name, handle, description, location, joined date, total views, subscriber count (public for thresholds), links. Video metadata: title, description, tags (visible in page source for some videos), upload date, view count, like count, comments. Comment history is accessible via the channel page; use YouTube Data API v3 (free quota) for structured access. Video content itself is a GEOINT source — see ../../knowledge/domains/geoint.md. The Wayback Machine captures YouTube channel pages but not video files; use yt-dlp for video archiving.

### Category 10: Platform-specific collection (Twitch)
Channel metadata: name, bio, profile picture, banner, follower count, total views, account creation date, partner/affiliate status. Stream history: past broadcasts (VODs) are retained for 14–60 days depending on partner status; clips are retained indefinitely unless deleted. Chat logs are not retained by Twitch but are often captured by third-party tools (e.g., SullyGnome, TwitchTracker) and by chat-log overlays (Logviewer). Stream schedule and game/category participation are strong interest signals.

### Category 11: Platform-specific collection (Mastodon)
Mastodon is federated — there is no single instance. Identify the subject's home instance from their handle (`@name@instance.tld`). Each instance has its own API; the Mastodon API is well-documented. Profile metadata: name, bio, fields (key-value, often used for identity verification via rel=me links), profile picture, header, follower/following counts, account creation date. Posting history: full public toots are accessible via the API and via the web UI. Network: followers and following lists are public on most instances unless the user has opted to hide them. The federated nature means content is replicated; deleted toots may persist on other instances.

### Category 12: Platform-specific collection (Telegram)
Public channels and groups are searchable via Telegram's built-in search and via third-party indexes (TGStat, Telemetr). Profile metadata (for public accounts): name, bio, profile picture, username, last-seen (visible to mutuals only on modern Telegram). Public-channel post history is fully accessible. Private channels and groups require an invite link — obtaining one under a false identity is outside scope. Telegram's @username is a strong pivot — it resolves across multiple platforms via username-correlation tools.

### Category 13: Platform-specific collection (Discord)
Discord is server-based; there is no global user search. If you have the subject's username (with discriminator or new system username), you can request their profile via mutual servers or DMs. Public Discord servers indexed by Disboard and DiscordMe may surface the subject's participation. Server content requires joining the server — joining under a false identity is outside scope. Discord's API can be used to query user IDs (Snowflake — encodes account creation timestamp, a useful pivot) via a bot account, with appropriate ToS-compliant use.

### Category 14: Platform-specific collection (Pinterest)
Profile metadata: name, handle, bio, location, website, follower/following counts, board count, pin count. Boards and pins are public unless set to secret. Pin patterns are strong interest signals. Pinterest's visual search can be used to identify other accounts pinning the same images.

### Category 15: Platform-specific collection (GitHub)
Profile metadata: name, bio, location, blog, company, email (if set public), Twitter handle, follower/following counts, account creation date. Commit history: commits may carry an email address (often the user's `noreply.github.com` or a personal email); this is a strong pivot. Repository list (public), starred repositories, organisation membership. Gists are also public. GitHub's event API exposes recent public activity (pushes, comments, PRs). Use GitHub Advanced Search for email-pattern queries (`@company.com` in commits) to enumerate employees of a target company.

## Canonical tools
| Tool | Use case | Free/Paid |
|---|---|---|
| Sherlock | Username enumeration (100+ platforms) | Free |
| Maigret | Username enumeration with richer reports | Free |
| Wayback Machine | Historical profile capture | Free |
| archive.today (archive.ph) | Snapshot capture | Free |
| yt-dlp | Video archiving (YouTube, TikTok, Twitch VODs) | Free |
| PullPush | Historical Reddit data including deletions | Free |
| TGStat / Telemetr | Telegram channel analytics | Freemium |
| Twitter Advanced Search | Date and operator-based search | Free |
| TweetBeaver | Account-age and other lookups | Freemium |
| SullyGnome / TwitchTracker | Twitch channel analytics | Free |
| GitHub Advanced Search | Email-pattern queries, org enumeration | Free |
| Maltego | Network graphing and pivot | Freemium |
| Google reverse image search / TinEye / Yandex | Profile-picture pivot | Free |

## Methodology
1. **Establish the seed username.** From the subject's email, breach data, or known accounts. If multiple seed usernames, run all.
2. **Run sherlock and maigret.** Treat output as candidate list; manually verify each hit.
3. **For each confirmed account, capture profile metadata.** Handle, display name, bio, location, link-in-bio, profile and banner images, account creation date, follower/following counts. Use archive.today for timestamped capture.
4. **Pull post history.** Capture at minimum a representative sample; for active investigations, full capture. Use platform-appropriate tools (Twitter Advanced Search, PullPush, yt-dlp for videos).
5. **Build the network.** For each platform, identify the top mutuals, frequent replies, tagged accounts. Note that some platforms (Facebook, Instagram) restrict network visibility — use breach-data and username correlation.
6. **Recover archived versions.** Wayback Machine and archive.today for historical capture of deleted or changed content.
7. **Cross-platform correlation.** Recurring usernames, profile pictures (reverse-image search), bios, link-in-bio targets, language patterns, time-zone signals. Build the cross-platform identity graph.
8. **Identify multiple personas.** Subject may maintain personal, professional, and pseudonymous accounts. Cross-correlate via bio phrases, profile pictures, posting time patterns, link-in-bio targets.
9. **Analyse posting patterns.** Volume, time-of-day distribution (time-zone signal), language(s), content themes, device fingerprints where exposed (Twitter used to expose client; modern platforms rarely do).
10. **Pivot.** To person investigation (../../knowledge/domains/person-investigation.md), breach data (../../knowledge/domains/breach-data.md), GEOINT (../../knowledge/domains/geoint.md) for photos.
11. **Capture and timestamp** every artefact per the report template.

## Common pitfalls
- **Impersonation accounts.** A "verified-looking" account may be a fan, a parodist, or an imposter. Verify via cross-platform identity claims, link-in-bio chain, and external corroboration.
- **Username recycling.** Platforms release inactive usernames. The current holder of `@subject` may not be the original. Check account creation date and posting history.
- **Profile-picture false positives.** Reverse-image search hits on a profile picture often return stock images, memes, or other unrelated accounts. Require multiple matching signals.
- **Archive gaps.** Wayback Machine coverage is uneven; an absence of archived versions is not evidence of absence of past content.
- **Scraping ToS violations.** Automated scraping of LinkedIn, Facebook, Instagram, and others violates their terms of service and may attract cease-and-desist or legal action. Manual capture is the safe default.
- **Rate-limit-induced false negatives.** Sherlock and maigret may return false negatives when rate-limited. Re-run with delays if a hit was expected.
- **Federated-platform misunderstanding.** Mastodon and other federated platforms have multiple instances; the same handle on different instances is a different user. Always include the instance.
- **Telegram private channels.** A channel appearing in a third-party index may be private — the index entry reflects historical public visibility. Confirm before reporting as currently accessible.
- **Time-zone overconfidence.** Posting-time distribution gives a likely time zone, not a confirmed one. Subject may deliberately post at unusual hours, travel, or use scheduling tools.
- **Compromised accounts.** An account's posts may not reflect the original owner. Look for sudden changes in posting pattern, language, or content themes that suggest a takeover.
- **Deleted-content persistence.** Posts deleted on the platform may persist in archives, screenshots, and third-party caches. Document the deletion and the persistence.

## Ethical considerations
- **Observation, not infiltration.** Viewing public content is one thing; sending friend requests, joining private groups under a false identity, or otherwise obtaining access through misrepresentation is another. The line is bright — do not cross it.
- **Profile pictures as biometric data.** Running a profile picture through facial-recognition software is biometric processing — special-category data under GDPR. Do not do this without explicit lawful basis. Reverse-image search (matching the image, not the face) is less restricted.
- **Subject's privacy expectations.** A public account has reduced privacy expectations; a private account does not. Do not publish content from a private account you accessed through authorised connection without a documented public-interest test.
- **Children.** Investigating a minor's social media is high-risk. Halt and escalate to a safeguarding lead if you discover the subject is a minor.
- **Victims and witnesses.** Social-media investigation of victims or witnesses requires heightened sensitivity. Do not re-publish identifying content.
- **Mental-health context.** Posts may reveal mental-health crisis. The investigator's duty of care may require an intervention pathway; consult your organisation's safeguarding policy.
- **Scraping proportionality.** If you scrape, scrape minimally. High-volume scraping degrades the platform for all users and is increasingly the subject of platform litigation.
- **Cross-platform attribution responsibility.** Linking two accounts to the same natural person is an attribution. Require multiple independent matching signals before reporting.
- **ToS-aware capture.** Manual single-account capture is generally tolerated. Automated mass capture is generally not. Match your capture method to the platform's tolerance and your jurisdiction's law.
- **Right to be forgotten.** EU/UK subjects may have requested delisting from search engines. The platform itself retains the content; the search-engine delisting is a separate matter.

## Output
Produce a social-media profile report using the template at ../../templates/reports/social-media-profile.md. The report must include: platform-by-platform account table (handle, URL, creation date, last activity, follower count, capture date), cross-platform identity-correlation matrix, profile-metadata table, posting-pattern analysis, network summary, archived-versions table, multiple-persona analysis, confidence-scored assertions, and a sources appendix with archived URLs.

## Cross-references
- Pivot playbooks: ../pivot-playbooks/username-to-identity.md, ../pivot-playbooks/profile-picture-pivot.md, ../pivot-playbooks/link-in-bio-pivot.md
- Tools: ../../tools/free-tools.yaml, ../../tools/apis.yaml, ../../tools/cli-tools.yaml
- Ethics: ../../ethics/personal-data.md, ../../ethics/facial-recognition.md, ../../ethics/platform-tos.md
- Case studies: ../../case-studies/cross-platform-identity.md, ../../case-studies/social-media-attribution.md
