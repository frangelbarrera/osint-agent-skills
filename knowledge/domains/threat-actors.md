# Domain Guide: Threat Actor Profiling

## What this domain covers

Threat actor profiling is the systematic characterization of an adversary — whether a nation-state group, cybercriminal organization, hacktivist collective, or individual operator — based on observable behaviors, infrastructure, capabilities, and objectives. The goal is not to name a person (that is attribution, a higher-bar claim) but to build a behavioral fingerprint that distinguishes this actor from others, predicts future activity, and maps to existing threat intelligence frameworks.

For an autonomous agent, threat actor profiling means: given a set of indicators (IOCs, TTPs, infrastructure), produce a structured profile that an analyst can use to make decisions. The profile must be evidence-based, confidence-labeled, and mapped to MITRE ATT&CK where applicable.

## When to use this guide

- An investigation has produced indicators that suggest coordinated, deliberate activity (not opportunistic scanning or random compromise).
- The user requests attribution or actor characterization.
- A set of TTPs has been observed and needs to be mapped to known threat groups.
- An investigation needs to determine whether activity is from a known group or a new actor.

## What a threat actor profile contains

A complete profile has six sections:

### 1. Identity

| Field | Description |
|---|---|
| Designation | The name or alias used to reference this actor (e.g., "APT29", "Sandworm", "Unnamed Group X") |
| Aliases | Other names used by different vendors for the same actor |
| First observed | Date of earliest known activity attributable to this actor |
| Active period | Date range of confirmed activity (may be "ongoing") |
| Origin | Assessed country or region of origin (with confidence level) |
| Sponsoring organization | Assessed parent organization (e.g., "GRU Unit 26165") if attribution supports it |
| Type | Nation-state / cybercriminal / hacktivist / insider / unknown |

### 2. Capabilities

Capabilities describe what the actor can do, organized by MITRE ATT&CK tactic:

| Tactic | Techniques | Evidence | Confidence |
|---|---|---|---|
| Initial Access | T1566.001 (Spearphishing Attachment) | [Evidence ref] | Confirmed |
| Execution | T1059.001 (PowerShell) | [Evidence ref] | Probable |
| Persistence | T1547.001 (Registry Run Keys) | [Evidence ref] | Confirmed |
| ... | ... | ... | ... |

Include:
- **Zero-day usage.** Has the actor used previously unknown vulnerabilities? List CVEs.
- **Custom malware.** Does the actor develop bespoke tooling, or repurpose commodity malware?
- **Operational sophistication.** Anti-forensics, OPSEC discipline, infrastructure rotation frequency.
- **Resource indicators.** Team size estimates (from malware complexity, working hours, language patterns), budget indicators (infrastructure quality, zero-day acquisition).

### 3. Infrastructure

| Indicator | Type | First seen | Last seen | Source |
|---|---|---|---|---|
| evil.com | Domain | 2024-01-01 | 2024-06-01 | [Tool] |
| 1.2.3.4 | IP | 2024-01-15 | 2024-06-01 | [Tool] |
| cert-hash | TLS cert fingerprint | 2024-02-01 | 2024-05-15 | [Tool] |

Infrastructure patterns to document:
- **Hosting preferences.** Bulletproof hosting? Compromised infrastructure? Cloud providers? Which ASNs?
- **Domain registration patterns.** Registrar preference, TLD preference, registration-to-use lag, privacy proxy usage.
- **TLS certificate patterns.** Issuer preference, certificate lifetime, SAN patterns.
- **C2 protocols.** HTTP/HTTPS, DNS tunneling, custom protocols, legitimate-service abuse (Telegram, Discord, GitHub).
- **Infrastructure rotation.** How frequently does the actor rotate domains/IPs? This indicates OPSEC discipline.

### 4. Objectives and targeting

| Aspect | Assessment | Evidence | Confidence |
|---|---|---|---|
| Primary targets | [Sectors, countries, org types] | [Evidence] | [Confidence] |
| Secondary targets | [Sectors, countries] | [Evidence] | [Confidence] |
| Strategic intent | [Espionage / disruption / financial / sabotage / influence] | [Evidence] | [Confidence] |
| Target selection pattern | [Opportunistic / targeted / supply-chain] | [Evidence] | [Confidence] |

### 5. TTP summary

A condensed narrative of the actor's modus operandi:

> [Actor] typically gains initial access via spearphishing campaigns delivering [malware family] in [file format] attachments. The lures are [language/cultural reference], suggesting [target demographic]. Once established, the actor uses [living-off-the-land technique] for [duration] before deploying [implant]. C2 communication occurs over [protocol] to [infrastructure pattern]. The actor demonstrates [OPSEC level] discipline, including [specific behaviors], but makes consistent mistakes in [specific area].

### 6. Gaps and unknowns

Explicitly state what is not known:
- Unclassified indicators that could not be mapped to ATT&CK.
- Activity clusters that may or may not be the same actor.
- Attribution claims by vendors that could not be independently verified.
- Temporal gaps in the activity timeline.

## Profiling procedure

### Step 1: Collect and cluster indicators

Gather all IOCs (domains, IPs, hashes, URLs, email addresses, certificates) from the investigation. Cluster them by:
- Shared infrastructure (same IP, same ASN, same cert)
- Shared tooling (same malware hash, same C2 protocol)
- Shared TTPs (same initial access method, same persistence mechanism)
- Temporal co-occurrence (indicators active during the same time window)

### Step 2: Map to MITRE ATT&CK

For each observed behavior, map to the appropriate ATT&CK technique. Use the technique ID, tactic, and sub-technique where applicable. Reference `knowledge/methodologies/mitre-attack-mapping.md` for the mapping procedure.

### Step 3: Compare to known threat groups

Cross-reference the TTP set and infrastructure patterns against:
- MITRE ATT&CK Group pages (<https://attack.mitre.org/groups/>)
- Public threat reports from vendors (Mandiant, CrowdStrike, ESET, Kaspersky, Microsoft, Cisco Talos)
- Community threat intel platforms (AlienVault OTX, VirusTotal, Pulsedive)

If the TTP overlap is significant (>70% of observed techniques match a known group), assess as "Probable match to [Group]" and flag for ACH analysis (see `knowledge/methodologies/structured-analytic-techniques.md`).

If the TTP overlap is partial (30-70%), assess as "Possible link to [Group] or related actor."

If no significant overlap, assess as "Unknown actor — new cluster."

### Step 4: Apply ACH

Threat actor attribution is inherently a multi-hypothesis problem. Apply Analysis of Competing Hypotheses:

- **H1:** The activity is from [Known Group A].
- **H2:** The activity is from [Known Group B].
- **H3:** The activity is from a new, unnamed actor.
- **H4 (null):** The indicators are coincidental and do not represent coordinated activity.

Score each piece of evidence against each hypothesis. The surviving hypothesis becomes the profile's identity assessment.

### Step 5: Apply Devil's Advocacy

Challenge the ACH survivor:
- Could the TTP overlap be due to shared tooling (commodity malware used by multiple groups)?
- Could the infrastructure overlap be due to shared hosting?
- Could the timing be coincidental?
- Could this be a false flag — an actor deliberately using another group's TTPs?

### Step 6: Produce the profile

Use `templates/reports/threat-actor-profile.md` to produce the structured profile. Include:
- The ACH matrix in the evidence log.
- The Devil's Advocacy assessment in the Limitations section.
- The full indicator list in the Sources section.
- The ATT&CK mapping table in the Capabilities section.

## Anti-patterns

- **Do not equate malware with actor.** Multiple actors use Cobalt Strike. Malware family overlap is not attribution.
- **Do not equate infrastructure with actor.** Shared hosting, compromised infrastructure, and bulletproof hosting providers serve multiple actors.
- **Do not attribute based on targeting profile alone.** Multiple actors target the same sectors.
- **Do not promote vendor attribution to "Confirmed" without independent verification.** Vendor reports are secondary sources. A vendor saying "we attribute this to APT29" is a claim, not evidence. You need the underlying evidence.
- **Do not assume nation-state sponsorship from capability alone.** Sophisticated criminals exist. State capability does not prove state sponsorship.
- **Do not profile based on a single indicator.** One domain matching a known actor's pattern is a lead, not a profile.
- **Do not ignore temporal gaps.** An actor active 2018-2020 and then silent for four years may have reorganized, been disrupted, or may have been absorbed into another group. Stale profiles are misleading.
- **Do not conflate "cannot attribute" with "new actor."** The absence of a match to known groups may mean the actor is new, or it may mean your collection is incomplete.

## Cross-references

- Methodology: `mitre-attack-mapping.md`, `structured-analytic-techniques.md`, `intelligence-cycle.md`
- Techniques: `certificate-transparency.md`, `dns-recon.md`, `shodan-techniques.md`
- Domains: `domain-investigation.md`, `ip-investigation.md`, `dark-web.md`
- Templates: `../../templates/reports/threat-actor-profile.md`
- Ethics: `legal-frameworks.md` (attribution claims have legal consequences)
- Case studies: `stuxnet-investigation.md`, `ukraine-power-grid-2015.md`, `colonial-pipeline.md`
