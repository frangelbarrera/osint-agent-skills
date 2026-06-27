# Investigating Breach Data Exposure

## Scope
This guide covers the investigation of a subject's exposure in data breaches — both public breach disclosures and leaked credential databases. It applies to incident responders, fraud analysts, due-diligence teams, journalists verifying identity, and security researchers tracking credential-reuse campaigns. It covers breach-participation checks, credential-record retrieval, data-class identification, pivot patterns from breach data, and the limits of breach data as evidence. It does **not** cover the use of breach credentials to log in to any account, the redistribution of breach data, or the acquisition of breach data from criminal sources. The single most important ethical constraint: **breach credentials may never be used to authenticate to any account, even the account they were leaked from.** Doing so is unauthorised access under the US Computer Fraud and Abuse Act, the UK Computer Misuse Act, and equivalent statutes worldwide.

## Key questions to answer
- In which known breaches does the subject's email address, phone number, username, or other identifier appear?
- For each breach, what data classes were exposed — email, password (hashed or plaintext), phone, DOB, address, IP, user agent, password history, security questions, payment data?
- What is the breach date, disclosure date, and public-release date (these are different)?
- Are the exposed passwords hashed, salted, plaintext, or encrypted? If hashed, what algorithm and is the hash crackable?
- Do the breaches reveal a password-reuse pattern that allows cross-platform attribution?
- Do the breaches reveal a username pattern that allows cross-platform attribution?
- Do the breaches reveal an address or IP pattern that allows geographic inference?
- Is the breach data current, or is it stale (pre-subject's relocation, pre-subject's email change)?
- Has the subject been a victim of a breach that included financial data, requiring notification to regulators or the subject?
- What is the provenance and integrity of the breach data — is it the original leak, a derivative, or a fabrication?

## Data categories
### Category 1: Breach participation
HaveIBeenPwned (HIBP) is the canonical free source for breach-participation checks. Given an email address or phone number, HIBP returns the list of breaches in which the identifier appears. HIBP does not return the breached data itself — only the breach names and the data classes exposed in each. This is by design: HIBP is a notification service, not a credential database. The free tier covers the public breach corpus; the paid domain-monitoring tier covers continuous monitoring for an entire domain.

### Category 2: Breach record retrieval
For the actual breached records, the principal sources are:
- **DeHashed** — paid, returns full records (email, username, password, IP, DOB, address, phone) for breaches in its corpus. Strong coverage of US- and EU-leaked databases.
- **IntelX** — freemium, indexes leaks, pastes, dark-web sources, and breach databases. Particularly strong for non-English-language leaks and dark-web forum leaks.
- **LeakCheck** — paid, similar coverage to DeHashed.
- **Snusbase** — paid, long-running, strong on older breach corpora.
- **Breach Directory** — aggregator that pulls from multiple sources; free tier is limited.
- **Dehashed/HIBP alternatives** — various; assess each on coverage, freshness, and provenance documentation.

### Category 3: Data-class identification
For each breach, record which data classes were exposed:
- Email (often the primary key)
- Password (plaintext, MD5, SHA1, bcrypt, scrypt, argon2, etc.)
- Username
- Phone
- DOB
- Address (street, city, state, postcode, country)
- IP address (registration, last login)
- User agent (browser, OS)
- Security questions and answers
- Payment data (last 4 of card, card type, billing address)
- Profile data (bio, avatar, social links)
- Site-specific data (e.g., LinkedIn job title, Adobe password hint)

The data classes determine the pivot potential. Email + username is a strong cross-platform pivot. Email + password is a credential-reuse pivot (for analysis, not for use). Email + IP is a geographic pivot. Email + DOB is an identity-confirmation pivot.

### Category 4: Password hash analysis
If passwords are exposed as hashes, identify the algorithm:
- **Plaintext** — immediately usable as a credential-reuse signal (analysis only; never used for login).
- **MD5** — fast, easily cracked with hashcat on consumer GPU in seconds for unsalted; salted variants take longer.
- **SHA1** — fast, easily cracked; HIBP's Pwned Passwords API can be used to check if a SHA1 hash is in the breach corpus without revealing the password.
- **bcrypt / scrypt / argon2** — slow by design; cracking is feasible for common passwords but expensive for complex ones.
- **Encrypted (site-specific)** — depends on the site's encryption; often reversible when the key is also leaked.

Cracking hashes requires care: it is a legitimate defensive technique when conducted on breach data you have lawful access to, but it is offensive if conducted to enable unauthorised access. Document the legal basis for any cracking work.

### Category 5: Credential-reuse analysis
The analyst's pattern recognition across breaches:
- If `subject@email.com` uses `Password123!` in the LinkedIn 2012 breach and `Password123!` in the Adobe 2013 breach, the subject has a password-reuse pattern.
- If `subject@email.com` uses `Winter2012!` in a 2012 breach and `Winter2015!` in a 2015 breach, the subject has a seasonal-pattern password.
- If the subject uses different passwords across breaches, that itself is a finding — the subject practised password hygiene.

Credential-reuse analysis is for attribution and risk assessment. It is **never** a basis for attempting login. The output of this analysis is "the subject has a high password-reuse risk", not "we can log in to the subject's account".

### Category 6: Username and email-pattern pivots
Breach data is the single richest source for username-to-email and email-to-username correlation. If `jdoe2012` appears in a gaming-forum breach with email `john.doe@example.com`, and the same username appears in a torrent-tracker breach, you have a cross-platform attribution. Build a username-to-email matrix from all breach records and use it to drive further social-media enumeration (see ../../knowledge/domains/social-media.md).

### Category 7: Geographic and temporal pivots
IP addresses in breach data — particularly registration IPs and last-login IPs — provide geographic signals at the time of the breach. A subject whose 2010 breach IP is in Moscow and whose 2020 breach IP is in London has a relocation signal. Address fields (when present) provide a stronger geographic signal but are also more sensitive PII.

### Category 8: Stale-data identification
Breach data is aging. The "Collection #1" aggregation (2019) contained data going back to 2008. A breach disclosed in 2023 may contain data from 2015. Always record:
- The breach date (when the data was exfiltrated).
- The disclosure date (when the breach was publicly announced).
- The public release date (when the data appeared in the breach community).
- The data freshness date (the most recent timestamp in the breached data — often visible in user records).

Treat breach data older than the subject's last known identity change (email change, address change, name change) as historical context, not current identity.

### Category 9: Provenance and integrity
Breach data is often repackaged, rebranded, and contaminated:
- **Combos** — aggregated lists of email:password pairs from multiple breaches, often labelled with a single name. The provenance of each pair is lost.
- **Rebrands** — the same breach sold under multiple names by different actors.
- **Fabrications** — lists claiming to be from a breach that never occurred, or padded with random data.
- **Augmentations** — a real breach with additional fake records appended.

For each breach record, trace the provenance: where did the source obtain the data, when, and from whom? Prefer original leak sources over aggregations.

## Canonical tools
| Tool | Use case | Free/Paid |
|---|---|---|
| HaveIBeenPwned | Breach participation check | Free |
| DeHashed | Breach record retrieval | Paid |
| IntelX | Leak/paste/dark-web search | Freemium |
| LeakCheck | Breach record retrieval | Paid |
| Snusbase | Breach record retrieval | Paid |
| Breach Directory | Aggregator | Freemium |
| HIBP Pwned Passwords API | Password-in-breach check (k-anonymity) | Free |
| `hashcat` | Local password-hash cracking (defensive) | Free |
| `john the ripper` | Local password-hash cracking (defensive) | Free |
| Maltego | Cross-breach correlation and graphing | Freemium |

## Methodology
1. **Establish the seed identifier.** Email is the strongest; phone and username are secondary. Run all known identifiers.
2. **Run HIBP.** Get the list of breaches for each identifier. This is the participation map.
3. **Pull records from DeHashed / IntelX / LeakCheck.** For each breach in the HIBP list, retrieve the actual breached record where available.
4. **Document data classes.** For each breach, record which data classes are present in the retrieved record.
5. **Analyse password hashes.** If hashes are present, identify the algorithm. If plaintext is present, treat as a credential-reuse signal (analysis only). If hashes are crackable and you have lawful basis, crack for analysis only.
6. **Build the username-to-email matrix.** Cross-breach correlation. This drives social-media enumeration.
7. **Build the credential-reuse analysis.** Identify reuse patterns. Risk-assess the subject.
8. **Build the geographic-and-temporal timeline.** IPs and addresses across breaches, plotted over time.
9. **Identify stale data.** Flag breaches whose data predates the subject's last identity change.
10. **Verify provenance.** For each breach, trace the data path. Flag fabrications, augmentations, and contaminated aggregations.
11. **Pivot.** To person investigation (../../knowledge/domains/person-investigation.md) for the cross-breach identity graph, to social-media investigation (../../knowledge/domains/social-media.md) for username pivots, to phone investigation (../../knowledge/domains/phone-investigation.md) for phone-number exposure.
12. **Capture and timestamp** every artefact per the report template.

## Common pitfalls
- **Stale breach data treated as current.** A breach from 2016 may not reflect the subject's current email, address, or password. Always check data freshness.
- **Aggregator contamination.** Combos and aggregations may include data from unrelated breaches or fabricated records. Trace to the original source.
- **Hash-cracking overreach.** Cracking hashes "because you can" is not a legitimate basis. Cracking hashes to enable unauthorised access is a criminal offence.
- **Password-reuse assumption.** A subject using the same password across two breaches does not imply the same password is in use today. Subjects change passwords after breach notifications.
- **Email-as-identity assumption.** An email in a breach database means the email was registered at the breached service; it does not mean the email's owner is the breachee (shared emails, role accounts, mailing-list addresses).
- **Breach-date confusion.** The "breach date" may be years before the "disclosure date". The breach community may release data months or years after disclosure. All three dates matter.
- **HIBP false negatives.** HIBP only includes breaches that have been publicly disclosed and that Troy Hunt has judged legitimate. Breaches not yet public, or judged unverified, are absent. HIBP-negative does not mean breach-free.
- **DeHashed coverage gaps.** DeHashed has strong but not complete coverage of the breach corpus. Cross-reference with IntelX and LeakCheck for high-confidence work.
- **Phone-number breach coverage.** Phone-number-containing breaches are a smaller subset of the breach corpus. Phone-number HIBP coverage is limited.
- **GDPR scope.** Processing breach data is processing personal data. The lawful basis is typically legitimate interest (for security research) or compliance (for breach-notification obligations); document it.
- **Fabrication.** Some "breach" announcements are entirely fabricated for clout or to damage a company's reputation. Verify the breach is real before treating its data as evidence.

## Ethical considerations
- **No credential use.** Possession of a leaked password does not authorise login. Unauthorised access is a criminal offence under the US CFAA, the UK Computer Misuse Act, the EU equivalents, and equivalent statutes worldwide. This is the single most important ethical constraint in breach-data work.
- **No redistribution.** Redistributing breach data — even to other investigators — is itself a privacy harm and may be a criminal offence (e.g., UK s.170 GDPR, US state-level depending on data classes). Share findings (the fact of exposure), not data (the credentials themselves).
- **Subject notification.** If you discover your own organisation's customer data in a breach, you may have a regulatory obligation to notify (GDPR 72-hour rule, US state breach-notification laws). Route to legal/privacy lead.
- **Lawful basis.** Processing breach data for security research, due diligence, or journalism typically relies on legitimate-interest balancing. For investigations of named individuals, the balancing test must consider the subject's reasonable privacy expectations.
- **Data minimisation.** Pull only the records you need for the question. Do not pull entire breach databases "in case".
- **Retention.** Define a retention period for breach data in your investigation store. Delete at the end.
- **Hash-cracking proportionality.** Cracking is a legitimate defensive technique with lawful basis; it is offensive when conducted to enable unauthorised access. Document the basis.
- **Victim sensitivity.** Breach subjects are victims. Treat their data with care. Do not re-publish, do not contact to "let them know" without authorisation (this may itself cause harm; route through proper notification channels).
- **Child data.** Breaches involving services likely used by children (gaming forums, social platforms with under-18 user bases) invoke heightened protections.
- **Law-enforcement cooperation.** Discovery of breach data implicating active criminal activity (e.g., CSAM in a breach, evidence of trafficking) may trigger reporting obligations. Route to legal counsel immediately.
- **Source-protection.** If you received breach data from a confidential source, protect the source. Document chain of custody without exposing the source.

## Output
Produce a breach-exposure report using the template at ../../templates/reports/breach-exposure.md. The report must include: HIBP participation list, breach-record table (per breach: data classes, dates, freshness, record summary with credentials redacted), credential-reuse analysis, username-to-email matrix, geographic-and-temporal timeline, stale-data flags, provenance assessment, confidence-scored assertions, and a sources appendix.

## Cross-references
- Pivot playbooks: ../pivot-playbooks/breach-to-credentials.md, ../pivot-playbooks/email-to-person.md, ../pivot-playbooks/username-to-identity.md
- Tools: ../../tools/free-tools.yaml, ../../tools/apis.yaml, ../../tools/cli-tools.yaml
- Ethics: ../../ethics/personal-data.md, ../../ethics/credential-use-prohibition.md, ../../ethics/gdpr-uk.md
- Case studies: ../../case-studies/credential-reuse-attribution.md, ../../case-studies/breach-impact-assessment.md
