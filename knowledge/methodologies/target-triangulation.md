# Target Triangulation Across Independent Sources

Triangulation is the practice of resolving a single factual claim by consulting multiple independent sources and weighing their agreement or disagreement. The metaphor is from navigation: a position is fixed not by one bearing but by the intersection of bearings from two or more known points. In OSINT, a finding is fixed not by one source but by the intersection of two or more independent sources. This file defines what counts as independent, the rule for upgrading a finding to Confirmed, how to handle conflicts, how to weight sources by credibility, and when to abandon a finding as unresolvable.

This file is the operational companion to `source-verification.md`, which defines how to evaluate a single source. Triangulation is what you do after you have evaluated each source individually.

## What counts as an independent source

Two sources are independent only if neither derives its data from the other. Many apparent "second sources" are not independent at all:

- Two scrape sites that both pull from the same underlying registry (e.g., two different WHOIS frontends querying the same registrar) are not independent. They will agree because they are reading the same database.
- A news article that quotes a press release, and the press release itself, are not independent. The article's claim derives from the release.
- Two breach-lookup services that both license the same underlying breach dataset are not independent for the purpose of confirming breach participation.
- A social media post and a screenshot of that post are not independent.

Genuine independence looks like: a government corporate registry entry and a separate corporate filing on the company's own website; a domain's WHOIS record and the same domain's certificate transparency log entry (different operators, different collection mechanisms); a photograph on a personal social media account and a separate photograph of the same scene posted by an unconnected bystander.

When in doubt, ask: if I deleted source A, would source B still exist with the same data? If yes, they are independent. If no, they are not.

## The 2-source rule for Confirmed findings

The system prompt's confidence vocabulary defines **Confirmed** as "corroborated by two or more independent primary sources." The 2-source rule is the operational expression of that definition. A single-source finding, however credible the source, is at most **Probable**. To upgrade to Confirmed, the investigator must produce a second source that is both independent of the first and of comparable or higher credibility.

A subtlety: the two sources must corroborate the *same specific claim*. A government registry confirming that a company exists at a stated address, plus a social media post by the company's founder mentioning the city, do not together confirm the address. They confirm that the company exists and that the founder has mentioned the city. The address is confirmed only by a second source that independently attests to the address — for example, a utility filing, a court document, or the company's own website.

## Handling conflicting sources

Sources disagree. The investigator must resolve, not average, the disagreement.

- **Older vs. newer.** When two sources report different values for a mutable attribute (address, ownership, IP resolution), the more recent source generally wins for current-state claims, and the older source wins for historical claims. Cite both, and explain the divergence.
- **Primary vs. secondary.** A primary source (the original artifact or its issuing authority) outweighs a secondary source (a report about the artifact). A corporate registry entry outweighs a news article that summarizes it.
- **Higher credibility vs. lower.** Use the credibility weights in the next section. When a low-credibility source contradicts a high-credibility source, the high-credibility source wins, and the contradiction is noted as a limitation.
- **Two equally credible sources disagree.** The finding cannot be upgraded past Probable. Report both values, label the conflict, and recommend a tie-breaking collection step.

## Source credibility weights

As a working rule, weight sources in the following descending order:

1. **Government registries** — corporate registries, court records, sanctions lists, securities filings. Highest credibility; primary by definition.
2. **Corporate registries and self-published corporate disclosures** — company websites, SEC/EDGAR filings, official press releases. Primary for the entity's own statements; treat with skepticism for claims about others.
3. **Reputable news organizations with editorial standards** — established outlets with correction policies. Secondary but generally credible.
4. **Social media posts by verified accounts** — credibility varies with account history and verification status; treat as primary for what the account said, secondary for any factual claims.
5. **Forum posts, paste sites, anonymous tips** — lowest default credibility; useful only as leads, never as the sole basis for a finding.

These are defaults. A government registry can be wrong (stale data, data-entry error). A forum post can be authoritative (an anonymous whistleblower with corroborating documents). The weight is a starting point, not a verdict. The investigator documents any deviation from the default weighting in the report.

## When to abandon a finding as unresolvable

Not every finding can be triangulated. Some claims have only one source, and no second independent source can be located despite reasonable effort. In that case:

- The finding is reported at the highest confidence the single source supports — typically **Probable** if the source is primary or **Unverified** if secondary.
- The report's limitations section explicitly states: "Finding X could not be triangulated; only one independent source was located."
- The recommended-next-steps section names the specific collection action that would, if executed, enable triangulation.

Abandonment is not failure. A finding labeled "Probable, single source, triangulation not achieved" is more honest than a finding force-upgraded to Confirmed. The reader knows what is known, what is not, and what would resolve the gap.
