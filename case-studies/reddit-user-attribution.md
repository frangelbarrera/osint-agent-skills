# Case Study: Anonymous Reddit User Attribution (Pedagogical)

> **Note on sourcing.** This case study is **pedagogical and composite.** It is not based on a specific real investigation. It synthesizes techniques that OSINT analysts apply routinely when investigating anonymous social media accounts. The username, subreddits, and findings described here are illustrative. Treat this as a methodology template, not a factual record. The pedagogical goal is to demonstrate the pivot chain from "we have an anonymous account" to "we have a probable real identity."

## Background

The pedagogical scenario: an OSINT investigator is asked to attribute an anonymous Reddit account, `u/anon_poster_2024`, that has been posting in a regional subreddit under scrutiny for coordinated inauthentic behavior. The account has a six-month posting history, no profile picture, no real-name linkage, and a username that does not appear on any other platform on a first-pass search. The investigator has only the public Reddit activity to work with — no breach data, no facial recognition, no dark-web sources, no contact with the account.

The objective is narrow: from the public Reddit activity alone, infer what can be inferred about the real identity behind the account. The investigator will not attempt to contact the account, will not breach any platform's terms of service, and will not consult breach-credential databases without a documented legal basis. The methodology applied is the standard social-media attribution pivot chain, applied strictly within the bounds of public data.

## OSINT methodology applied

The investigator applied the Intelligence Cycle (see `../knowledge/methodologies/intelligence-cycle.md`) with the pivot playbooks from `../knowledge/pivot-playbooks/`:

- **Planning and Direction.** Subject: the operator of Reddit account `u/anon_poster_2024`. Objective: infer real identity from public Reddit activity alone. Scope: the account's public posting history and metadata; no breach data, no contact, no facial recognition. Legal basis: public-data analysis under US First Amendment protections for public-interest research; no jurisdiction-specific privacy statute is engaged by reading public posts.
- **Collection.** The investigator archived the account's full posting history using the Reddit public API (and the Pushshift-style archives where available), the comment history, the subreddit subscriptions, the trophy case, and the account creation date.
- **Processing.** Timestamps were normalized to UTC. Subreddits were categorized by topic. Vocabulary was tokenized. Image attachments were hashed and metadata extracted.
- **Analysis and Production.** The analysis proceeded through four pivots, each documented below.
- **Dissemination.** The findings were reported as "Probable" or "Inferred" — never as "Confirmed" — because no primary source (the operator's own admission, a breach-credential link, a confirmed cross-platform account) was available within the constrained scope.

## Key OSINT findings

- **Timezone inference from posting-time patterns.** The account's 200+ posts and comments showed a clear bimodal distribution: peak activity from 13:00 to 17:00 UTC, with a secondary peak from 23:00 to 02:00 UTC, and a complete absence of activity from 06:00 to 11:00 UTC on weekdays. Converting to candidate timezones, the pattern is consistent with a US Central Time (UTC-6) or US Mountain Time (UTC-7) sleeper (the secondary peak is late evening local time; the daytime peak is afternoon local time). The pattern is inconsistent with European or East Asian residence.
- **Subreddit activity → interests and probable occupation.** The account posted and commented predominantly in r/sysadmin, r/PowerShell, r/ExperiencedDevs, and a regional subreddit for a metropolitan area in Texas. The technical subreddits indicate a systems-administration or DevOps occupation. The regional subreddit indicates residence in or near that metropolitan area. Cross-correlated with the timezone inference (US Central Time is consistent with Texas residence), this narrows the candidate population substantially.
- **Rare vocabulary → cross-platform pivot.** The account used several non-standard phrasings repeatedly: a particular way of denigrating "tier-1 helpdesk" staff, a specific misspelling of "PowerShell" as "PowerShall," and a specific idiomatic phrase ("y'all'd've") that is regionally marked. A Google exact-match search for these phrases returned a single non-Reddit hit: a Stack Overflow answer from 2022 with the same phrasings. The Stack Overflow profile linked to a GitHub account, which used a real-name handle. The pivot chain: rare vocabulary → Google exact match → Stack Overflow answer → GitHub account → real-name handle. **Confidence: Probable.** The vocabulary match is strong but not dispositive — multiple people could share regional idioms.
- **Posted images → EXIF and reverse image search.** The account posted two photographs of a server rack (in r/sysadmin) and one photograph of a regional landmark (in the regional subreddit). EXIF metadata had been stripped (Reddit strips EXIF on upload), so no GPS or camera data was recoverable. Reverse image search (Yandex, TinEye, Google) returned no prior circulation for the server-rack images, suggesting they were original. The landmark photograph was geolocated by terrain matching to a specific park in the Texas metropolitan area, consistent with the subreddit. **Confidence for residence: Probable.**
- **Username pattern → cross-platform enumeration.** The username `anon_poster_2024` was searched via sherlock (see `../tools/cli-tools.yaml`) across 300+ platforms. No hits were returned on major platforms. A variant search for `anon_poster` returned hits on a GitHub Gist (the same GitHub account identified via the vocabulary pivot) and on a single Discord server (read-only archive). The cross-platform convergence of the vocabulary pivot and the username-pattern pivot elevated the GitHub attribution from "Probable" to "Probable, corroborated."
- **Final identity attribution.** The GitHub account's commit history included a `.gitconfig` with a real name and an employer-issued email domain. The employer-issued domain was a technology company headquartered in the Texas metropolitan area identified via the landmark photograph. The full pivot chain — Reddit posts → vocabulary → Stack Overflow → GitHub → real name and employer — produced a "Probable, corroborated" attribution. **It was not promoted to "Confirmed"** because the investigator did not have the operator's acknowledgment, a breach-credential link, or facial recognition verification, all of which would have required techniques outside the constrained scope.

## Tools and sources used

- **Reddit public API** — `https://www.reddit.com/dev/api/` — posting-history collection.
- **Google exact-match search** — `https://www.google.com/` — rare-vocabulary pivot.
- **sherlock** — `https://github.com/sherlock-project/sherlock` — cross-platform username enumeration.
- **Yandex Image Search** — `https://yandex.com/images/` — reverse image search (superior to Google for non-English and small-image searches).
- **TinEye** — `https://tineye.com/` — reverse image search for prior-circulation detection.
- **Google Earth Pro** — `https://www.google.com/earth/` — landmark geolocation.
- **GitHub public profile and commit history** — `https://github.com/` — real-name pivot.

## Lessons for the agent

This pedagogical case teaches an autonomous agent that **identity attribution is a chain of pivots, not a single search.** The chain in this case moved from one weak signal (timezone pattern) to a corroborating signal (subreddit geography) to a strong pivot (rare vocabulary) to a converging identity (GitHub real name). At no single pivot was the attribution dispositive; only the convergence produced "Probable, corroborated." An agent that stops at the first pivot — timezone alone, or subreddit alone — produces thin and easily falsified intelligence. The agent should hold multiple pivots in suspension and report the convergence.

The case also teaches the **false-positive discipline of cross-platform attribution.** The rare-vocabulary pivot could have been a coincidence — multiple people share idioms, and "y'all'd've" is common in the southern US. The agent correctly treated the Stack Overflow match as a lead, not a conclusion, and sought corroboration through the username-pattern pivot. The convergence of two independent pivots (vocabulary + username pattern) on the same GitHub account elevated the attribution from "Unverified" to "Probable, corroborated." An agent that attributes on the basis of a single weak pivot is producing unreliable product. The system prompt's anti-hallucination rule (see `../system-prompt.md`, section "Anti-Hallucination Rules") applies here directly: inferences must be labeled as "Inferred," and attributions must reach the two-source threshold for "Confirmed."

Finally, the agent should learn the **ethics of identity attribution.** This case deliberately excluded breach-credential retrieval, facial recognition, and contact-with-target — all of which would have produced stronger attribution but at the cost of crossing the line from OSINT into intrusion or into techniques flagged for human review (see `../ethics/legal-frameworks.md` and `../ethics/code-of-conduct.md`). The agent should treat the constrained-scope version of an investigation as the default and should require explicit user authorization before expanding scope into flagged techniques. The investigator in this case produced useful, defensible intelligence without crossing those lines — and an autonomous agent should be able to do the same.

This is a methodology template — adapt for your investigation. The specific pivots will vary by platform and target; the discipline of convergent, conservative, source-cited attribution is universal.

## Attribution

- Methodology references in this repository: [`../knowledge/methodologies/`](../knowledge/methodologies/), [`../knowledge/pivot-playbooks/`](../knowledge/pivot-playbooks/).
- Tool references: [`../tools/cli-tools.yaml`](../tools/cli-tools.yaml), [`../tools/free-tools.yaml`](../tools/free-tools.yaml).
- Ethics framework: [`../ethics/code-of-conduct.md`](../ethics/code-of-conduct.md), [`../ethics/legal-frameworks.md`](../ethics/legal-frameworks.md).
- This case study is pedagogical and does not cite a real investigation. The techniques described are standard OSINT methodology as documented in the OSINT-BIBLE project: `https://github.com/frangelbarrera/OSINT-BIBLE`.
