# Investigating a Phone Number

## Scope
This guide covers the investigation of a telephone number — typically E.164-format, but also national-format inputs. It applies to fraud analysts, due-diligence teams, journalists verifying a contact, and incident responders handling a phone-as-indicator. It covers line-type identification, carrier lookup, geographic inference, breach-data exposure, social-media profile linkage, and reverse-search services. It does **not** cover pretext calls, SS7 exploitation, SIM-swap attacks, lawful intercept, or any technique requiring access to telecom signalling infrastructure. Under GDPR and most national data-protection regimes, a phone number is personal data; the entire investigation is personal-data processing and is subject to the constraints in the Ethical considerations section.

## Key questions to answer
- What is the number in canonical E.164 format, and what is its country code and national destination code?
- Is the line a mobile, landline, VoIP, toll-free, or premium-rate number?
- Who is the current carrier, and has the number been ported?
- What is the original geographic area (NDC) and does it match the current subscriber's apparent location?
- Is there a subscriber name associated with the number, and is that attribution lawful to obtain in the operating jurisdiction?
- Does the number appear in breach data, and what data classes were exposed alongside it?
- Which messaging and social platforms accept this number as a registered account (WhatsApp, Telegram, Signal, Viber)?
- What does reverse-search aggregator data show (Truecaller, Sync.me, NumLookup)?
- Is the number associated with spam, scam, or fraud calls in community databases?
- Is the number a virtual number (Google Voice, Skype, Twilio, Burner, Hushed) suggesting a burner or operational persona?

## Data categories
### Category 1: Canonicalisation and structure
Convert the input to E.164 (country code + national significant number). Use `libphonenumber` (Google's library, available in many languages) for parsing, validation, and to derive: country code, national destination code (area code), subscriber number, line-type guess (based on number range), and possible/expected formats. This step is non-optional — the rest of the investigation depends on correct canonicalisation.

### Category 2: Line type and carrier
Twilio Lookup API is the canonical paid source: returns line type (landline, mobile, VoIP), carrier name, and (for US numbers) caller-name information where lawfully available. Numverify is a cheaper alternative. For US/Canada, the free FCC area-code search gives the original geographic assignment of the area code. For mobile numbers in most jurisdictions, number portability means the original carrier assignment may not match the current carrier — Twilio's "carrier" field returns the current serving carrier where portability data is available.

### Category 3: Geographic inference
The national destination code (NDC, the "area code" in NANP) gives a geographic hint for landline numbers — this is the original assignment and may not reflect the current subscriber. For mobile numbers, the NDC in most countries is not geographic (it identifies the original carrier). For VoIP numbers, the NDC may be a virtual assignment with no geographic meaning. Record the NDC-implied geography as a weak signal and label it as such.

### Category 4: Subscriber name (where lawful)
In some jurisdictions, caller-name databases (CNAM in the US) are accessible to commercial lookup services. In the EU/UK, subscriber-name lookup by third parties is restricted under GDPR; reverse directories generally do not exist as lawful public services. In jurisdictions where reverse lookup is offered (some Eastern European countries, parts of Asia), the lawfulness of using the result depends on the investigator's jurisdiction and purpose. **Default assumption: do not assume subscriber-name lookup is lawful; document the legal basis before using it.**

### Category 5: Breach data exposure
Several major breaches include phone numbers: Collection #1–5 (aggregated), LinkedIn 2021 (scraped, phone field), Facebook 2021 (533M records, phone field), Twitter 2022 (phone on verified accounts), and many regional breaches. HaveIBeenPwned now includes phone-number search for a subset of breaches. DeHashed, IntelX, and LeakCheck all index phone-containing records. Record: breach name, breach date, data classes exposed alongside the phone (email, name, DOB, address, password), and the confidence that this phone belongs to the subject.

### Category 6: Messaging and social-platform linkage
Many messaging platforms expose account existence given a phone number, and some expose profile metadata:
- **WhatsApp**: adding the number to your contacts (using a clean, sandboxed device) and refreshing WhatsApp's contact list will reveal whether the number has a WhatsApp account, the profile name, and the profile picture. This is observation, not unauthorised access, but it is still personal-data processing under GDPR.
- **Telegram**: similar — adding the contact reveals account existence, profile name, and profile picture.
- **Signal**: by design does not reveal profile information to non-contacts; you will only see account existence if you have a shared group.
- **Viber, Snapchat, etc.**: similar contact-sync mechanisms.
Profile pictures obtained this way are PII; they may also be facial images (special-category data under GDPR if biometric processing is applied). See ../../ethics/facial-recognition.md.

### Category 7: Reverse-search aggregators
Truecaller, Sync.me, NumLookup, Whitepages, CallerID services — these crowdsource contact-book uploads and may carry a subscriber name even when lawfully-obtained CNAM does not. Their accuracy is highly variable, the data is often stale, and the subject may have removed their entry. Treat as a hint, never as a confirmed attribution.

### Category 8: Spam and scam reputation
Community-report databases: Truecaller spam score, Hiya, ShouldIAnswer, CallApp, WhoCallsMe, 800notes (US-centric). Record the report volume, recency, and the categories of complaint (debt collector, scam, political, robocall). A number with hundreds of recent "scam" reports is a strong signal; a single report is noise.

### Category 9: Virtual-number identification
Several services sell or give virtual numbers: Google Voice, Skype, Twilio, Burner, Hushed, MySudo, TextNow, Textfree. Twilio Lookup returns "VoIP" for many of these. The presence of a VoIP designation suggests an operational or burner persona — useful signal, but not in itself indicative of malice (legitimate businesses and privacy-conscious individuals also use VoIP numbers).

## Canonical tools
| Tool | Use case | Free/Paid |
|---|---|---|
| `libphonenumber` | Canonicalisation, validation, line-type guess | Free |
| Twilio Lookup API | Line type, carrier, caller name (US) | Paid |
| Numverify | Carrier and line type | Freemium |
| FCC area-code search (US) | Original geographic assignment | Free |
| HaveIBeenPwned | Breach participation (phone) | Free |
| DeHashed / IntelX / LeakCheck | Breach record retrieval | Paid |
| Truecaller | Crowdsource reverse lookup | Freemium |
| Sync.me | Reverse lookup with social linkage | Freemium |
| Hiya / ShouldIAnswer | Spam and scam reputation | Freemium |
| WhatsApp / Telegram (sandboxed) | Account existence + profile metadata | Free |
| Google Voice / Twilio lookup (carrier-of-record) | VoIP identification | Paid |

## Methodology
1. **Canonicalise.** E.164 with libphonenumber; record country code, NDC, subscriber number, and the libphonenumber line-type guess.
2. **Line-type and carrier lookup.** Twilio Lookup (or equivalent). Record current carrier, original carrier if ported, line type, and any caller-name data.
3. **Geographic inference.** Derive from NDC for landlines; flag mobile NDCs as non-geographic; flag VoIP as virtual.
4. **Breach-data check.** HIBP for participation, then DeHashed/IntelX for record retrieval where lawful and authorised. Record data classes exposed alongside the phone.
5. **Platform linkage.** Add the number to a clean, sandboxed device contact list; refresh WhatsApp, Telegram, Signal, Snapchat, Viber. Record account existence, profile name, and (separately, as PII) profile picture.
6. **Reverse-search check.** Truecaller, Sync.me, NumLookup. Treat all results as hints.
7. **Reputation check.** Truecaller spam score, Hiya, ShouldIAnswer, 800notes. Require volume and recency before treating as signal.
8. **Virtual-number check.** If line type is VoIP, attempt to identify the virtual-number provider (Twilio, Google Voice, etc.) from carrier-field text. This informs whether the number is a likely burner.
9. **Pivot.** Email addresses co-exposed in breach data → person investigation (../../knowledge/domains/person-investigation.md). Profile pictures → reverse-image search (../../knowledge/technologies/reverse-image.md if present, otherwise note for later). Linked social profiles → ../../knowledge/domains/social-media.md.
10. **Capture and timestamp** every artefact. Phone investigations are particularly prone to "I'll just check one more source" creep; enforce a documented scope.

## Common pitfalls
- **Number portability.** The carrier returned by an old lookup is not the current carrier. Always use a current source.
- **NDC geographic assumptions.** Mobile NDCs in most countries are not geographic. A UK mobile starting `07700 900...` is a fictitious/test range; a `+1 (281) 555-0100` is a reserved NANP fictitious number. Know your reserved ranges.
- **Truecaller staleness.** Truecaller data is crowdsourced from contact books; a name recorded years ago may no longer belong to the subscriber.
- **WhatsApp/Telegram false negatives.** If the subject has disabled "find by phone number" in privacy settings, the contact-sync check will return no account even if one exists. Absence is not absence.
- **Profile picture reuse.** A WhatsApp profile picture is often not the subscriber — it may be a pet, a meme, or a stock image. Reverse-image search before any identification claim.
- **VoIP conflation.** "VoIP" line type does not mean "burner". Many businesses and privacy-conscious users have legitimate VoIP numbers.
- **International number confusion.** `+1` covers US, Canada, and 18 Caribbean nations. `+44` covers UK and several Crown Dependencies. Do not infer country from country code alone — confirm via the NDC.
- **Premium-rate and shared-cost numbers.** A call to a `+44 09...` number bills the caller at premium rate. Investigating a number that called the subject may itself incur charges — use the libphonenumber `number_type` field to flag premium-rate before any callback.
- **Burner reuse.** Burner numbers are reused. The number that sent a threat last week may be in the hands of an unrelated person this week. Always establish recency.

## Ethical considerations
- **GDPR applies.** A phone number is personal data. The investigation is processing of personal data; the lawful-basis, data-minimisation, and purpose-limitation principles apply.
- **Contact-sync surveillance caveat.** Uploading a phone number to your WhatsApp contacts to check for an account is functionally surveillance of account existence. It is legal in most jurisdictions but is processing of personal data; do it for authorised investigative purposes only, with the purpose documented.
- **No pretext calls.** Calling the number under false pretences is illegal in many jurisdictions (UK GDPR s.170, US GLBA for financial institutions, FTC Telemarketing Sales Rule for certain sectors) and outside scope.
- **No SS7 interception.** Accessing SS7 to locate or intercept a subscriber's calls/messages is illegal everywhere except for lawful intercept by authorised telecommunications carriers under court order. Do not attempt.
- **Profile pictures as PII.** A profile picture is a facial image. If you intend to run it through facial-recognition software, that becomes biometric processing — special-category data under GDPR with elevated requirements. See ../../ethics/facial-recognition.md.
- **Reverse-lookup legality.** Lawful access to subscriber-name databases varies by jurisdiction. The fact that a service is available online does not make its use lawful for your purpose in your jurisdiction. Document the legal basis.
- **Children.** A phone number belonging to a minor invokes heightened protections. Halt and escalate if you suspect the subscriber is a minor.
- **Data retention.** Phone-number investigations tend to accumulate screenshots and contact-list entries. Define a retention period and delete at the end; do not let phone-profile data live indefinitely in your investigation store.
- **Sharing.** Sharing a phone number with another investigator is itself processing. Use case-appropriate secure channels and document the recipient.

## Output
Produce a phone-number profile using the template at ../../templates/reports/phone-profile.md. The profile must include: canonical E.164 number, line type and carrier table, geographic inference with confidence, breach-exposure table, platform-linkage table (account existence, profile name, profile picture reference), reverse-search findings, reputation summary, virtual-number assessment, confidence-scored assertions, and a sources appendix.

## Cross-references
- Pivot playbooks: ../pivot-playbooks/phone-to-person.md, ../pivot-playbooks/phone-to-social.md, ../pivot-playbooks/breach-to-credentials.md
- Tools: ../../tools/free-tools.yaml, ../../tools/apis.yaml, ../../tools/cli-tools.yaml
- Ethics: ../../ethics/personal-data.md, ../../ethics/gdpr-uk.md, ../../ethics/facial-recognition.md
- Case studies: ../../case-studies/burner-phone-attribution.md
