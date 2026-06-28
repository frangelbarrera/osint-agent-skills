# Source Citation Guide

[This guide defines how to cite sources in OSINT Agent Skills deliverables. Every
factual claim in a report must point to a source. A source without an access
date is not a citation. A citation without an archive is fragile. Delete this
instruction paragraph once the template is read.]

## Principles

1. Every claim has a citation. If you cannot cite it, do not write it.
2. Every citation has an access date. The web changes; the date tells the
   reader what you saw and when.
3. Ephemeral content is archived at collection time. Social media posts,
   forum threads, and news articles can be edited or deleted. Capture an
   archive snapshot the same day you read the source.
4. Binary artifacts are hashed. Screenshots, downloaded files, and captured
   responses are recorded with a SHA-256 hash in the evidence log.
5. The primary source is preferred over a secondary summary. Cite the court
   filing, not the news article that summarizes it.

## Required fields

A complete citation has the following fields. Where a field does not apply,
state "n/a" rather than omitting it.

- Source title
- Author or publisher (if available)
- URL
- Access date (ISO 8601)
- Archive URL (Wayback Machine, archive.today, or equivalent)
- SHA-256 hash (for binary artifacts and screenshots)
- Evidence log ID (the row in evidence-log.md where the artifact is recorded)

## Example citations

[Follow the format of the example that matches your source type. Delete the
examples once the template is filled in for a real report.]

### Web article

1. Jane Doe. "Company discloses breach affecting 2 million users."
   URL: https://example.com/news/breach-disclosure. Accessed: 2025-01-15.
   Archive: https://web.archive.org/web/20250115/https://example.com/news/breach-disclosure.
   Evidence log: E-0004.

### Social media post

2. @example_handle (Twitter/X). "Statement on the incident." Posted
   2025-01-14. URL: https://x.com/example_handle/status/1234567890.
   Accessed: 2025-01-15. Archive: https://archive.today/abcd1234.
   Evidence log: E-0005. Hash: `b2c3d4e5f6a7...`.

### Court filing or government record

3. District Court of [jurisdiction], Case No. [number], filing dated
   [YYYY-MM-DD]. URL: [court records portal URL]. Accessed: [YYYY-MM-DD].
   Archive: [Wayback URL]. Evidence log: E-0006.

### Technical record (WHOIS, DNS, certificate)

4. RDAP record for example.com, retrieved via rdap.org. Queried:
   2025-01-15T09:14:22Z. URL: https://rdap.org/domain/example.com.
   Accessed: 2025-01-15. Hash: `a1b2c3d4e5f6...`. Evidence log: E-0001.

### Captured screenshot

5. Screenshot of https://example.com landing page, captured 2025-01-15.
   Original URL: https://example.com. Accessed: 2025-01-15. Archive:
   https://web.archive.org/web/20250115/https://example.com. Hash:
   `f7e6d5c4b3a2...`. Evidence log: E-0008.

## Archiving tools

- Wayback Machine — `https://web.archive.org/save/<URL>`. Best for general web
  content. Returns a snapshot URL that should be recorded.
- archive.today — `https://archive.ph/<URL>`. Best for social media and
  JavaScript-heavy pages that the Wayback Machine renders poorly.
- Local screenshot — capture with the agent's screenshot tool, store under
  `artifacts/`, and record the hash in the evidence log.

## When not to cite

- Do not cite a source you have not personally read. If a secondary source
  describes a primary source, find and cite the primary source.
- Do not cite search engine result pages as the source. Cite the page the
  search engine returned.
- Do not cite private conversations unless they are on the record and the
  speaker has consented to attribution.
