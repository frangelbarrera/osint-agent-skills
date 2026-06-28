# Investigating a Person

## Scope
This guide covers the structured investigation of an individual human subject using open sources. It applies to investigators verifying identity, journalists mapping a public figure's footprint, fraud analysts, due-diligence teams, and authorized skip-tracers. It does **not** cover covert human intelligence, pretexting, pretext calls, surveillance, or any technique that requires deception of the subject or third parties. It also does not cover protected classes of subjects (minors, jurors, witnesses under protective order, law enforcement officers under shield statutes) without explicit additional authorization. Where the subject is a resident or citizen of the European Union, the United Kingdom, California, or any jurisdiction with comprehensive data-protection law, the investigator must treat the entire investigation as personal-data processing under that regime and apply the constraints described in the Ethical considerations section.

## Key questions to answer
- What is the subject's full legal name and any aliases, maiden names, or known pseudonyms?
- What are the date of birth, place of birth, and current physical location(s)?
- What email addresses, phone numbers, and usernames are attributable to the subject?
- What social media accounts does the subject maintain, active and abandoned?
- What is the subject's professional history — employers, titles, dates, and education?
- What public records exist (court filings, property records, business filings, professional licenses) in jurisdictions where the subject has lived?
- What breach data exposes the subject's credentials or PII?
- Who are the subject's family members, associates, and co-travellers?
- What is the subject's inferred network and which entities recur across multiple data categories?
- What is the provenance and confidence level of each attribution?

## Data categories
### Category 1: Core identity
Legal name, aliases, date of birth, place of birth, nationality. Sources: government registries where public (UK Electoral Roll, US voter files where available under state law), birth and marriage indexes (UK GRO, US state indices), passport-style metadata only where lawfully published. Document every alias variant — nicknames, middle names, transliterations of non-Latin scripts, married names.

### Category 2: Location history
Current and historical addresses. Sources: property records (county recorder offices in the US, Land Registry in the UK), voter registration, court filings, professional licensing bodies, corporate filings listing the subject as officer, breach data with address fields, social media geotags. Build a chronological address timeline — it is the spine of the person profile.

### Category 3: Digital footprint
Email addresses, phone numbers, usernames. Sources: breach databases (see ../../knowledge/domains/breach-data.md), username enumeration tools (sherlock, maigret — see ../../knowledge/domains/social-media.md), search engines with site-specific operators, people-search aggregators (these have varying legality — see Ethical considerations). Phone numbers should be enriched via line-type lookup (see ../../knowledge/domains/phone-investigation.md).

### Category 4: Social media presence
Platform-by-platform enumeration with capture of profile metadata, post history, and connections. See ../../knowledge/domains/social-media.md for the full platform matrix.

### Category 5: Professional history
LinkedIn is the primary source for the past ~15 years. Cross-reference with SEC filings naming officers, UK Companies House filings, OpenCorporates, professional licensing bodies (state bar, medical board, FCA register, etc.), conference speaker bios, university alumni pages, patent filings (USPTO, EPO, WIPO), and academic publication databases (Google Scholar, ORCID, ResearchGate). Company registries are covered in ../../knowledge/domains/company-investigation.md.

### Category 6: Public records
Court records (PACER in the US, UK court judgments on FindCaseLaw, BAILII for judgments), property records, vehicle and vessel registrations where public, bankruptcy filings, professional disciplinary records, sex offender registries (US), sanctions lists (OFAC, UK OFSI, EU consolidated, UN). Always confirm that the record pertains to the subject and not a same-name individual — name collisions are the single most common error in person investigations.

### Category 7: Breach exposure
Which breaches included the subject, what data classes were exposed, and what patterns (password reuse, consistent usernames, address drift) are visible. See ../../knowledge/domains/breach-data.md.

### Category 8: Network and associates
Family members (from marriage indexes, obituaries, social media), co-directors (Companies House, OpenCorporates), co-authors, co-defendants, neighbours, social-media mutuals. The network is built by extracting recurring entities across categories 1–7 and triangulating.

## Canonical tools
| Tool | Use case | Free/Paid |
|---|---|---|
| Sherlock / Maigret | Username enumeration across platforms | Free |
| HaveIBeenPwned | Breach participation check | Free |
| DeHashed | Breach record retrieval (paid API) | Paid |
| IntelX | Leak and paste-site search | Freemium |
| OpenCorporates | Company affiliations, officer history | Freemium |
| UK Companies House | Directorships, filings (UK subjects) | Free |
| PACER | US federal court records | Paid per page |
| Google Scholar / ORCID | Academic history | Free |
| LinkedIn (manual) | Professional history | Free |
| Wayback Machine | Historical profile capture | Free |
| Blackbird / Iris | Username-to-identity correlation | Paid |
| Maltego | Graphical link analysis | Freemium |

## Methodology
1. **Scope the investigation.** Write down the question, the authorized purpose, the jurisdiction of the subject, and the data minimisation boundary. If you cannot articulate the lawful basis, stop.
2. **Establish identity.** Confirm full legal name, DOB, and one corroborating identifier before any further enrichment. Treat the subject as not-yet-identified until two independent sources agree.
3. **Build the address timeline.** Property and registration records anchor every later step.
4. **Enumerate the digital footprint.** Run username enumeration and breach queries in parallel; cross-correlate results.
5. **Map professional history.** LinkedIn plus corporate registries plus any licensing body.
6. **Pull public records.** Court, property, sanctions, professional discipline — in every jurisdiction where the subject has lived.
7. **Build the network.** Extract recurring associates; rank by frequency and recency.
8. **Capture and timestamp everything.** Use the report template at ../../templates/reports/person-profile.md.
9. **Confidence-score every assertion.** Use the convention in ../../knowledge/methodologies/attribution-confidence.md.

## Common pitfalls
- **Same-name collisions.** A surprisingly large fraction of "matches" in breach data and public records are different people. Require at least two independent corroborating identifiers.
- **Stale data.** People-search aggregators routinely surface addresses 10+ years old. Treat every address as historical unless a primary source confirms recency.
- **Aggregator hallucinations.** Commercial people-search sites frequently merge records of distinct individuals. Never cite an aggregator; always trace back to the primary source.
- **LinkedIn drift.** LinkedIn profiles are self-reported and frequently aspirational or backdated. Confirm employment with corporate filings or press releases.
- **GDPR scope creep.** Investigating an EU data subject from a US IP address does not exempt you from GDPR. The processing is governed by the subject's location.
- **Forgotten breach reuse.** Old breach passwords are sometimes still in use on low-value accounts; this is a finding, not an invitation — see Ethical considerations.
- **Alias chains.** One pseudonym may link to another pseudonym that links to a real identity. Document the chain with evidence at each hop.

## Ethical considerations
- **Lawful basis.** In GDPR/UK-GDPR jurisdictions, processing personal data requires a lawful basis (consent, contract, legal obligation, vital interests, public task, or legitimate interests). Journalistic and research investigations usually rely on legitimate interests, which requires a balancing test against the subject's rights.
- **Data minimisation.** Collect only what is necessary for the question. Do not pull a full breach dump "in case it is useful later."
- **No credential use.** Possession of a leaked password does not authorise logging in. Unauthorised access to an account is a criminal offence in virtually every jurisdiction (US CFAA, UK CMA, EU equivalents).
- **Special category data.** Race, religion, sexual orientation, health, trade-union membership, and biometric data receive heightened protection. Treat inferred special-category data with the same care as declared.
- **Minors.** Do not investigate minors without explicit authorisation and a documented safeguarding review.
- **Right to erasure.** Subjects may have exercised deletion rights; absence of data is not evidence of absence.
- **Doxxing prohibition.** The output of this investigation is for the authorised requester only. Publishing personal data exposes the investigator to civil and criminal liability.
- **Pretexting.** Do not impersonate the subject, a relative, a government official, or any third party to obtain information. Pretext calls are illegal in many jurisdictions (e.g., UK GDPR s.170, US GLBA for financial institutions).

## Output
Produce a person profile using the template at ../../templates/reports/person-profile.md. The profile must include: identity summary, address timeline, digital footprint table, professional history table, public records table, breach exposure table, network graph (or table), confidence-scored assertions, and a sources appendix with URLs and capture timestamps.

## Cross-references
- Pivot playbooks: ../pivot-playbooks/username-to-identity.md, ../pivot-playbooks/email-to-person.md, ../pivot-playbooks/breach-to-credentials.md
- Tools: ../../tools/free-tools.yaml, ../../tools/apis.yaml, ../../tools/cli-tools.yaml
- Ethics: ../../ethics/personal-data.md, ../../ethics/gdpr-uk.md, ../../ethics/data-minimisation.md
- Case studies: ../../case-studies/person-identity-resolution.md
