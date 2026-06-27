# Investigating Dark-Web Presence

## Scope
This guide covers the investigation of subjects, content, and infrastructure on dark-web networks — primarily Tor onion services, with secondary coverage of I2P eepsites and ZeroNet. It applies to threat-intelligence analysts tracking ransomware groups, journalists investigating dark-web markets, fraud analysts tracking stolen-data listings, and law-enforcement liaisons. It covers dark-web search engines, paste sites, forums, markets, and the OSINT techniques for working in these environments safely. It does **not** cover installation instructions for Tor, I2P, or any dark-web access tool — the investigator must arrive with a working, hardened environment. It does **not** cover purchasing illicit goods, communicating with targets, or any technique requiring active engagement with criminal actors. The single most important rule: **dark-web OSINT requires OPSEC. Browse only through Tor (plus VPN in some threat models), never engage with targets, never download suspicious files outside a sandbox, and never assume that the absence of law-enforcement attention means your activity is unobserved.**

## Key questions to answer
- What dark-web networks are relevant to the investigation — Tor, I2P, ZeroNet, Freenet, Lokinet?
- What dark-web search engines index the relevant content, and what are their coverage limits?
- Which dark-web forums, markets, paste sites, and leak sites are relevant to the subject (person, company, breach, threat actor)?
- Has the subject's data, infrastructure, or persona appeared on dark-web sources, and in what context?
- What is the temporal pattern of dark-web activity related to the subject?
- Who are the relevant dark-web actors — group names, handles, reputations, prior takedowns?
- What is the provenance and reliability of dark-web content — original source, repost, fabrication?
- What are the OPSEC requirements for this investigation, and have they been satisfied?
- What jurisdiction rules apply to accessing, viewing, and storing the discovered content?
- What are the limits of dark-web OSINT — what cannot be learned without active engagement, and where does active engagement cross into criminal liability?

## Data categories
### Category 1: Network basics
This guide treats the networks as known entities, not as installation targets:
- **Tor** — onion-routed network. Hidden services use `.onion` addresses (v3 is the current standard; v2 is deprecated and defunct). Access requires the Tor Browser or equivalent. Most dark-web OSINT is on Tor.
- **I2P** — garlic-routed network. Eepsites use `.i2p` addresses. Smaller user base; some specialised communities. Access requires the I2P router.
- **ZeroNet** — decentralised, peer-to-peer web hosting. Addresses are Bitcoin addresses (e.g., `1HeLLo4uzjaLetx6nh3prW1iq4gLhKwJ3`). Largely deprecated but historically significant for some content categories.
- **Freenet / Hyphanet** — peer-to-peer data store. Content addressed by keys, not URLs. Smaller user base.
- **Lokinet** — newer onion-routed network using LLMQ-based routing.

The investigator must understand which network hosts the content of interest before designing the collection approach.

### Category 2: Dark-web search engines
Dark-web search is far less comprehensive than clear-web search. The principal engines:
- **Ahmia** (ahmia.fi) — indexes Tor hidden services; accessible both via Tor and via clear-web (clear-web access returns .onion results that then require Tor to view). Curated, with abuse-content filtering.
- **Torch** — older Tor search engine; broad coverage but high noise.
- **Haystak** — Tor search; paid tier for advanced features.
- **Recon** (by the IntelX team) — multi-source dark-web search; strong for handle/keyword pivots.
- **DarkSearch** — smaller index; useful as a secondary source.
- **IntelX** — clear-web-accessible index of dark-web sources; the single most useful tool for dark-web OSINT without direct Tor browsing. Freemium.

None of these is comprehensive. The dark web is not fully indexed; expect to need direct browsing of known sites in addition to search-engine queries.

### Category 3: Forums and communities
Forum landscape is volatile. As of the most recent cycle of takedowns and reconstitutions:
- **BreachForums** and its successors — primary English-language cybercrime forum, repeatedly takedowns and reconstitutions. Track via clear-web monitoring sites (e.g., Flashpoint, Recorded Future public briefings) for the current iteration.
- **Exploit.in** — long-running Russian-language cybercrime forum.
- **XSS.is** — Russian-language forum, formerly Mazafaka.
- **Cracked.io / Nulled.to** — English-language forums focused on account-cracking and account-trading.
- **HackForums** — long-running English-language forum; lower-tier but historically significant for some threat-actor origins.

Forum handle, reputation, post count, join date, and last-active date are the primary OSINT targets. Profile pages often reveal contact information, PGP keys, monikers used on other platforms, and historical activity.

### Category 4: Markets
Market landscape is extremely volatile — markets are taken down (law enforcement) or exit-scam (operators) on a roughly annual cycle. Names change constantly. As of the most recent cycle: Bohemia, Tor2Door, Mega, Kraken, and others. Track current market status via:
- **DarkOwl** (paid) — dark-web intelligence provider with market monitoring.
- **Flashpoint** (paid) — same.
- **Recorded Future** (paid) — same.
- **r/DarkNetMarkets** Reddit successor communities — community-maintained status reports (unverified; treat with caution).
- **DeepDotWeb's successor blogs and clear-web monitoring sites** — community-maintained.

Market OSINT targets: vendor names, feedback patterns, listing categories, PGP keys, Monero/BTC addresses, and operational signatures (PGP signing patterns, escrow behaviour).

### Category 5: Paste sites and leak sites
- **Pastebin-style clear-web sites** (Pastebin, Ghostbin, hastebin, rentry.co, controlc.com, etc.) — often used for leak announcements and doxxing. IntelX indexes these comprehensively.
- **Dark-web paste sites** (e.g., DarkNetPastebin and equivalents) — smaller volume, monitored by commercial intel providers.
- **Leak sites operated by ransomware groups** — Tor-hosted sites listing victim companies and exfiltrated data. Track via clear-web monitoring (ransomware tracking sites like ransomwatch,ransomware.live).
- **Doxxing sites** — clear-web and dark-web sites that publish PII of targeted individuals. Often in breach of multiple laws; document but do not redistribute.

### Category 6: Subject presence
For each subject (person, company, brand, threat actor):
- Has the subject's name, email, phone, or address appeared on dark-web forums, pastes, or markets?
- Has the subject's data been listed for sale on a market?
- Has the subject been mentioned in a ransomware leak-site post?
- Has the subject's credentials appeared in a dark-web credential dump?
- Is the subject (if a threat actor) attributed to a dark-web handle, and what is the handle's reputation and history?

### Category 7: Provenance and reliability
Dark-web content is unreliable:
- **Reposts and fakes** — content is reposted across forums with attribution lost or fabricated.
- **Impersonation** — handles are spoofed. Verify via PGP signatures where the actor has a known PGP key.
- **Law-enforcement honeypots** — some forums and markets have been operated or compromised by law enforcement (e.g., Hansa, Wall Street Market). Historical content from these may be tainted.
- **AI-generated content** — increasingly, forum posts and leak claims are AI-generated for disruption or influence. Apply plausibility checks.

For each piece of dark-web content, document: where it was found, when, who posted it, what the post's reputation/feedback is, whether the actor PGP-signed it, and what independent corroboration exists.

## Canonical tools
| Tool | Use case | Free/Paid |
|---|---|---|
| Tor Browser | Safe Tor access | Free |
| Tails / Whonix | Hardened operating environments | Free |
| Ahmia | Tor search engine | Free |
| Torch | Tor search engine | Free |
| IntelX (Recon) | Multi-source dark-web search | Freemium |
| DarkOwl | Dark-web intelligence | Paid |
| Flashpoint | Dark-web intelligence | Paid |
| Recorded Future | Dark-web intelligence | Paid |
| ransomwatch / ransomware.live | Ransomware leak-site monitoring | Free |
| Ahmia clear-web | Surface access to .onion results | Free |
| Maltego | Graph analysis of dark-web entities | Freemium |
| PGP (GnuPG) | Verifying actor signatures | Free |

## Methodology
1. **Establish OPSEC.** Confirm Tor Browser or hardened environment (Tails or Whonix). Confirm no clear-web leakage. Consider a dedicated VPN in front of Tor for additional layering (debated; some threat models prefer Tor-only).
2. **Define scope and stop conditions.** What is the question? What will you do if you encounter CSAM, terrorism content, or active plotting? (Answer: stop, document, and route to legal/law-enforcement — do not continue.)
3. **Start with clear-web-indexed sources.** IntelX, Ahmia clear-web, ransomware.live. These cover much of the dark-web surface area without requiring direct Tor browsing.
4. **Move to direct Tor browsing** for content not indexed. Use the Ahmia and Torch engines to find known sites.
5. **Survey the relevant forums and markets.** Identify the current iteration of each (forums cycle through takedowns). Document each site's URL, registration requirements, and access restrictions.
6. **Search for the subject.** Name, email, phone, company, brand, threat-actor handle. Use the site's internal search where available; fall back to Google site-search (which may not index .onion content directly but may surface cached or reposted clear-web versions).
7. **Document findings.** For each hit: URL, timestamp, post author, post content (redacting any PII of victims), screenshots (with metadata stripped), and PGP signature status if applicable.
8. **Assess provenance.** Where did the content originate? Is it an original post, a repost, or a fabrication? Is the author who they claim to be?
9. **Build the timeline.** When did dark-web activity related to the subject begin, peak, and stop? Correlate with known events (breach disclosures, ransomware attacks, takedowns).
10. **Pivot.** Threat-actor handles → ../../knowledge/domains/social-media.md (many dark-web actors have clear-web personas). BTC/XMR addresses → ../../knowledge/domains/cryptocurrency.md. Breach data → ../../knowledge/domains/breach-data.md.
11. **Exit cleanly.** Close Tor Browser, clear Tails persistent volume if used, document the session.
12. **Capture and timestamp** every artefact per the report template. Strip metadata from screenshots (camera/model data is irrelevant here, but EXIF from any photos you took of the screen should be stripped; the screenshots themselves are the artefact and should be retained with full context).

## Common pitfalls
- **OPSEC failure.** Browsing the dark web from your real IP, with a non-hardened browser, with JavaScript enabled, leaves you exposed. Threat actors and law enforcement both monitor dark-web activity. Default to Tor Browser with JavaScript disabled.
- **Forum-iteration confusion.** BreachForums, RaidForums, and similar forums have been taken down and reconstituted multiple times. Each iteration has a different URL and a partially different user base. Verify you are on the current iteration.
- **Impersonation handles.** Forum handles are spoofed regularly. Verify via PGP signature where the actor has a known key.
- **Honeypot suspicion.** Any forum or market you discover may be a law-enforcement honeypot or a compromised operation. Behave as if every site is monitored — because many are.
- **Malware exposure.** Dark-web sites frequently host malware. Click nothing, download nothing outside a sandbox, and treat every file as hostile.
- **CSAM exposure.** Some dark-web content is child sexual abuse material. If you encounter CSAM, **stop immediately**, do not screenshot, do not download, do not continue browsing, and route to legal/law-enforcement per your jurisdiction's reporting obligations. Possession of CSAM is a strict-liability offence in many jurisdictions; even inadvertent possession is a serious legal problem.
- **Trust erosion.** Long dark-web exposure erodes trust in sources. Periodically re-verify your sources.
- **Linguistic and cultural misreading.** Russian-language forums have norms and slang that are easy to misread. Use native-speaker review for high-stakes work.
- **Reputational laundering.** Some dark-web content is planted by actors to launder reputation or implicate rivals. Apply plausibility checks.
- **Lawful access illusion.** The fact that you can access content does not mean it is lawful to access in your jurisdiction. Some content categories (terrorism, CSAM, certain hate-speech categories in EU jurisdictions) are unlawful to access regardless of intent.
- **AI-generated content.** Increasingly, dark-web posts, leak claims, and "exclusive" data drops are AI-generated. Apply plausibility checks; verify against known actor patterns.

## Ethical considerations
- **OPSEC is a duty, not a preference.** Sloppy OPSEC endangers the investigator, the investigation, the organisation, and any subjects whose data may be exposed if the investigator's store is compromised. Maintain OPSEC at all times.
- **No engagement with targets.** Do not contact, message, trade with, or otherwise engage dark-web actors. Engagement crosses from OSINT into participation in many jurisdictions and exposes the investigator to criminal liability.
- **No purchases.** Purchasing stolen data or illicit goods, even for "research purposes", is itself a criminal offence in most jurisdictions and taints the entire investigation.
- **No downloading of suspicious files outside a sandbox.** Malware exposure is a risk to the investigator, the investigation, and the organisation's network. Use an isolated sandbox (ideally a separate physical machine, or a hardened VM with no shared folders and no network access beyond Tor).
- **Jurisdictional awareness.** Accessing some content categories is itself a crime in some jurisdictions. UK Terrorism Act 2006 (accessing terrorism content), US 18 USC § 1030 (accessing protected computers), various EU member-state hate-speech laws — know the rules in your jurisdiction.
- **CSAM protocol.** Pre-establish a written CSAM protocol: if encountered, stop, do not screenshot, do not download, document the URL and approximate time, and route to the National Center for Missing and Exploited Children (US), the Internet Watch Foundation (UK), or the equivalent in your jurisdiction. Possession is strict-liability; the protocol exists to protect you.
- **Source protection.** If a confidential source provided dark-web intelligence, protect the source. Do not publish information that could identify the source.
- **Victim privacy.** Dark-web content often features victims (leak-site victims, doxxing victims, fraud victims). Treat victim data with care. Do not republish, do not contact victims without authorisation.
- **Law-enforcement cooperation.** Discovery of dark-web content implicating active serious crime (CSAM, terrorism, human trafficking) may trigger reporting obligations. Route to legal counsel.
- **Mental-health awareness.** Sustained dark-web exposure is psychologically corrosive. Use rotation, debriefing, and counselling resources as your organisation provides. Do not dark-web-binge.
- **Transparency in reporting.** When publishing or sharing findings, disclose the source type (dark-web forum, market, paste site), the access conditions (registration required, public), and the provenance confidence. Do not present dark-web intelligence as equivalent to clear-web intelligence without confidence calibration.
- **Pivot responsibility.** Identifying a clear-web persona from a dark-web handle is a serious attribution. Require multiple independent matching signals (PGP key reuse, linguistic analysis, posting time correlation, breach data overlap) before reporting.

## Output
Produce a dark-web presence report using the template at ../../templates/reports/dark-web-presence.md. The report must include: subject presence summary (platforms where the subject was found, with URLs redacted to the extent necessary to prevent casual access), forum/market survey, timeline of dark-web activity, provenance assessment, threat-actor attribution analysis (if applicable), victim-impact summary (with victim PII redacted), OPSEC documentation (anonymised), confidence-scored assertions, and a sources appendix.

## Cross-references
- Pivot playbooks: ../pivot-playbooks/handle-to-identity.md, ../pivot-playbooks/leak-to-breach.md, ../pivot-playbooks/dark-web-to-clear-web.md
- Tools: ../../tools/free-tools.yaml, ../../tools/apis.yaml, ../../tools/cli-tools.yaml
- Ethics: ../../ethics/dark-web-opsec.md, ../../ethics/attribution-responsibility.md, ../../ethics/victim-protection.md, ../../ethics/csam-protocol.md
- Case studies: ../../case-studies/ransomware-leak-site-attribution.md, ../../case-studies/threat-actor-pivot.md
