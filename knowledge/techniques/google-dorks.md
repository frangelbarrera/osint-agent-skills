# Technique: Google Dorks

## What this technique does

Google dorking is the deliberate construction of advanced Google search queries using special operators (`site:`, `filetype:`, `intitle:`, `inurl:`, `intext:`, `cache:`, `related:`, etc.) combined with boolean logic, wildcards, proximity operators, and date filters. In an OSINT context, dorks surface indexed content that is technically public but not easily discoverable through ordinary keyword search: leaked files on government domains, exposed directory listings, archived credentials on pastebins, profile pages on platforms with weak on-site search, and historical copies of pages that have since been removed. Dorking scales human attention by letting the analyst describe the shape of the page they want rather than its topic.

## When to use it

Activate this technique whenever the analyst needs to find specific page types or file types associated with a target (person, organisation, domain, product) without crawling. Typical triggers: a target has mentioned an employer and you need their LinkedIn profile; a domain is in scope and you want every indexed document; you suspect a credential leak and want to scan pastebins; you need to confirm that a now-removed page once existed. Dorking is also a first-pass triage tool before resorting to paid or API-driven enumeration.

## Tools

- Google Search (free, web UI): <https://www.google.com/advanced_search>
- Google Programmable Search Engine (free, API-keyed): <https://developers.google.com/custom-search>
- Google Scholar (free, narrower corpus): <https://scholar.google.com>
- DeGoogle / SearXNG public instances (free, federated): <https://searx.be/>
- DorkSearch (free, dork cheat-sheet builder): <https://dorksearch.com/>
- Google Search APIs via SerpAPI or Bright Data (paid, programmatic): <https://serpapi.com/>
- GHDB — Google Hacking Database (free, dork library): <https://www.exploit-db.com/google-hacking-database>

## Procedure

### Step 1: Frame the question

Write down the *page shape* you want: which domain, which file type, which literal string must appear in the title or body. Vague queries return noise; specific queries return signal.

### Step 2: Pick the core operator

- `site:` restricts to a domain or subdomain.
- `filetype:` (alias `ext:`) restricts to an indexed extension.
- `intitle:` requires the term in the `<title>`.
- `inurl:` requires the term in the URL path.
- `intext:` requires the term in the body text.
- `cache:` returns Google's most recent cached copy of a URL.
- `related:` returns pages Google considers thematically linked.

### Step 3: Combine with boolean logic

- `OR` (uppercase) broadens: `"acme corp" OR "acme corporation"`.
- `-` excludes: `site:acme.com -www` lists non-www subdomains.
- `"..."` forces an exact phrase.
- `*` is a single-token wildcard inside a phrase: `"site:acme.com * benefits"`.
- `(..)` numeric range: `"salary" 70000..120000`.
- `AROUND(X)` proximity: `"jane" AROUND(3) "acme"` requires the two terms within X tokens of each other.
- `before:YYYY-MM-DD` and `after:YYYY-MM-DD` constrain by indexing date.

### Step 4: Run ten concrete dorks

1. `site:linkedin.com/in "Acme Corp"` — employee profiles.
2. `filetype:xls intext:"confidential" site:gov` — leaked spreadsheets on `.gov`.
3. `intitle:"index of" "parent directory"` — open directory listings.
4. `inurl:wp-content/uploads/ site:example.com` — files uploaded through WordPress.
5. `site:pastebin.com "BEGIN RSA PRIVATE KEY"` — leaked private keys.
6. `site:github.com "acme-corp" "password"` — secrets committed to repos.
7. `"jane doe" -site:facebook.com -site:twitter.com` — secondary-web mentions.
8. `site:acme.com filetype:pdf after:2023-01-01` — recent PDFs only.
9. `intitle:"Outlook Web App" inurl:owa` — exposed OWA login pages.
10. `"john.smith" AROUND(5) ("board" OR "director")` — board memberships.

### Step 5: Walk the result pages

Google artificially truncates results past roughly page 10. To expand coverage, add `&num=100` to the URL or progressively tighten the query (add `intext:` clauses) to surface different result slices.

### Step 6: Save evidence immediately

Use the `cache:` operator or Save Page Now on archive.org for any hit you intend to cite. Google re-crawls continuously; a hit present today may vanish tomorrow.

## Interpreting results

A *hit* is a URL whose title, snippet, and visible URL match the shape you specified. A *strong* hit has the target string in both title and snippet. A *weak* hit matches only the snippet (often a fragment Google extracted from a larger page). A *ghost* hit is one whose URL is listed but whose page returns 404 when clicked — fall back to `cache:` or the Wayback Machine.

## Common false positives

- `filetype:pdf` matches PDFs whose body never contains the search term; Google sometimes indexes link anchor text rather than document content.
- `intitle:"index of"` matches legitimate file repositories (academic preprint servers, open-data portals) that happen to use Apache directory listing.
- `site:pastebin.com "BEGIN RSA PRIVATE KEY"` matches security-research writeups, CTF challenges, and tutorials, not real leaks.
- `related:` results are topical, not infrastructural; they do not imply ownership.
- Date filters apply to *indexing* date, not *publication* date; an old document re-indexed last week will appear as recent.

## Anti-patterns

- Do not rely on `cache:` for legal preservation — Google drops caches after a few weeks.
- Do not chain more than roughly ten operators; Google silently ignores extras.
- Do not treat a dork hit as proof of *current* exposure; it reflects Google's last crawl.
- Do not run dorks against a target you do not have authorisation to investigate, even though dorking itself uses only Google's public index.
- Do not assume operators that worked in 2018 still work; Google has progressively crippled `+`, exact-phrase strictness, `cache:` reliability, and stem suppression. Always re-test operator behaviour on a known target before relying on it in a real investigation.

## Cross-references

- Related playbooks: `../pivot-playbooks/email-to-username.md`, `../pivot-playbooks/username-to-profile.md`
- Tools used: `../../tools/free-tools.md`, `../../tools/apis.md`
- Domain guides: `../domains/social-media.md`, `../domains/web-infra.md`
