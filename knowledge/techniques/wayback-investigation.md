# Technique: Wayback Investigation

## What this technique does

Wayback investigation uses the Internet Archive's Wayback Machine (and complementary archives such as archive.today and the UK Web Archive) to retrieve, enumerate, and diff historical snapshots of web pages that are no longer live, or to track how a live page has changed over time. The technique converts the web from a single-state view into a time-series: each snapshot is a data point, and the sequence of snapshots reconstructs the page's evolution. This is essential for recovering deleted content, proving that a statement was once published, identifying when infrastructure changes occurred, and reconstructing timelines that the target may have intentionally obscured.

## When to use it

Trigger this technique when: a target URL returns 404 but the analyst suspects prior content; a page has been silently edited and the analyst needs the previous version; a target has scrubbed a press release, executive bio, or product page and the analyst needs the original wording; a domain's content has shifted dramatically and the analyst wants to know when; or a phishing infrastructure investigation needs to correlate certificate issuance dates with content changes. Wayback is also the canonical preservation step for any URL the analyst intends to cite in a report.

## Tools

- Wayback Machine (free, web UI): <https://web.archive.org/>
- Wayback CDX API (free, JSON, no key): <https://github.com/internetarchive/wayback/tree/master/wayback-cdx-server>
- Wayback Availability API (free): <https://archive.org/wayback/available>
- Save Page Now (free, rate-limited): <https://web.archive.org/save>
- archive.today / archive.ph (free, independent snapshot pool): <https://archive.ph/>
- UK Web Archive (free, UK-focused): <https://www.webarchive.org.uk/>
- Wayback Machine Downloader (free, Ruby gem): <https://github.com/hartator/wayback-machine-downloader>
- Memento Time Travel (free, multi-archive aggregator): <http://timetravel.mementoweb.org/>
- SpySe (paid): <https://spyse.com/>
- Waybackpack (free, Python): <https://github.com/jsvine/waybackpack>

## Procedure

### Step 1: Enumerate snapshots via CDX

The CDX API is the workhorse — it returns a flat list of every snapshot the Wayback Machine holds for a URL. Query it directly:

```
curl "http://web.archive.org/cdx/search/cdx?url=acme.com/*&output=json&limit=10000&fl=timestamp,original,statuscode,mimetype,digest&filter=statuscode:200&collapse=digest"
```

Flags: `url=acme.com/*` matches the entire domain (use `/*`); `output=json` for parsing; `fl=` selects fields (timestamp is YYYYMMDDHHMMSS); `filter=statuscode:200` drops redirects and errors; `collapse=digest` deduplicates consecutive identical-content snapshots. To match a single URL, drop the `*`.

### Step 2: Find the snapshot closest to a date

```
curl "https://archive.org/wayback/available?url=acme.com/about&timestamp=20190515"
```

The response JSON contains the closest snapshot URL. Use this when the analyst has a specific date (e.g., a press release publication date) and wants the nearest archived copy.

### Step 3: Recover a deleted page

Construct the URL pattern directly:

```
https://web.archive.org/web/2019*/acme.com/about
```

This calendar view shows all snapshots for that year. Click through to read the content; if a snapshot was excluded by robots.txt, the page will display "This URL has been excluded from the Wayback Machine." See Common false positives for the robots.txt gap.

### Step 4: Archive a current URL for preservation

```
curl -X POST "https://web.archive.org/save/https://acme.com/about"
```

Or use the web UI at `https://web.archive.org/save`. Save Page Now is rate-limited; for batch preservation use waybackpack or the Internet Archive's S3-style API with credentials.

### Step 5: Diff two snapshots

Download both snapshots as raw HTML and diff:

```
waybackpack acme.com/about -d ./wb-out/ --from 20180101 --to 20190101
diff -u ./wb-out/20180101000000*/about ./wb-out/20190101000000*/about
```

For visual diffs, load each snapshot in a browser and use a tool like VisualDiff or Pretty Diff. Track added, removed, and modified text spans separately — each is a finding.

### Step 6: Cross-check with archive.today

```
https://archive.ph/acme.com/about
https://archive.ph/newest/https://acme.com/about
```

archive.today maintains a separate snapshot pool that often captures pages the Wayback Machine missed (it ignores most robots.txt rules and snapshots pages with full JavaScript rendering). It also provides side-by-side diff of any two of its snapshots.

### Step 7: Pivot through snapshot content

Each snapshot is a frozen page — extract every link, image, embedded script, and metadata field as you would a live page. Snapshot pages frequently contain references to now-defunct subdomains, employee names, and product screenshots that themselves become pivots.

### Step 8: Correlate snapshot timestamps with external events

Map snapshot timestamps against breach dates, certificate issuance dates (see `certificate-transparency.md`), domain registration dates (WHOIS history), and known press release dates. Coincidences in timing are often significant.

## Interpreting results

A *clean snapshot* returns HTTP 200 with the original content and a capture timestamp. A *redirect snapshot* shows the Wayback's redirect resolution — useful but reflects the capture-time behaviour, not necessarily the original. A *partial snapshot* is missing images, CSS, or JavaScript because the Archive's crawler did not follow those resources; the HTML text is still usable. A *robots-blocked* snapshot is one where the site's `robots.txt` at capture time disallowed archiving, and the Wayback honors it retroactively — a significant gap discussed below.

## Common false positives

- **Robots.txt exclusion**: Wayback honors current `robots.txt`, not the one in force at capture time. If a site adds a disallow later, all earlier snapshots become inaccessible. Always cross-check with archive.today, which ignores most `robots.txt` rules.
- Wayback's `*` wildcard in CDX matches the entire URL space, but a domain's `*` does NOT match its parent or sibling subdomains — query each separately.
- Status code 200 in CDX does not guarantee useful content; many sites return 200 with a soft-404 page. Inspect `mimetype` and `digest` to filter out cookie-wall and "page not found" templates.
- archive.today snapshot dates are timezone-naive and may appear shifted by a day relative to Wayback.
- "Save Page Now" captures are tagged `addthis` and may be excluded from public listing if the requester marks them as private.
- Wayback re-writes URLs in archived pages to point to other Wayback snapshots; the rewritten URL may differ from the original by trailing slashes, query parameter order, or case.

## Anti-patterns

- Do not assume Wayback has captured a page just because it is popular — coverage is patchy for low-traffic domains and for sites that block crawlers.
- Do not rely on a single snapshot to prove a statement; capture at least two snapshots spanning the period of interest.
- Do not cite Wayback URLs without including the full timestamp (`/web/YYYYMMDDHHMMSS/`); the `/web/*/` form redirects to "latest", which changes.
- Do not use "Save Page Now" on target-controlled URLs without anonymising your IP; the Internet Archive logs requester IPs and may expose them in disclosure.
- Do not treat Wayback as a forensic chain-of-custody; snapshots can be removed by request of the site owner, and the Archive occasionally purges content.
- Do not forget the UK Web Archive, Archive-It collections, and country-specific archives (Russian, Icelandic, Singaporean) — they often cover regions where Wayback is blocked or thin.

## Cross-references

- Related playbooks: `../pivot-playbooks/url-to-history.md`, `../pivot-playbooks/page-diff.md`
- Tools used: `../../tools/free-tools.md`, `../../tools/apis.md`
- Domain guides: `../domains/web-infra.md`, `../domains/social-media.md`
