# Threat Actor Profile Report

> Template for profiling a threat actor based on observed indicators, TTPs, and infrastructure. Use this template when the investigation has produced enough evidence to characterize an actor's identity, capabilities, infrastructure, and objectives. See `knowledge/domains/threat-actors.md` for the full profiling procedure.

---

## Classification

[UNCLASSIFIED]

## Report metadata

| Field | Value |
|---|---|
| Report ID | [YYYYMMDD-SUBJECT-HASH] |
| Date | [YYYY-MM-DD UTC] |
| Analyst | OSINT Agent Skills |
| Subject | [Threat actor designation or cluster name] |
| Confidence | [Confirmed / Probable / Unverified] |
| Classification | UNCLASSIFIED |

## 1. Identity

| Field | Value | Confidence | Source |
|---|---|---|---|
| Designation | [Actor name or "Unnamed Cluster X"] | [Confidence] | [Source] |
| Aliases | [Comma-separated alias list] | [Confidence] | [Source] |
| First observed | [YYYY-MM-DD] | [Confidence] | [Source] |
| Active period | [YYYY-MM-DD to YYYY-MM-DD / Ongoing] | [Confidence] | [Source] |
| Origin (assessed) | [Country/Region] | [Confidence] | [Source] |
| Sponsoring org | [Organization or "Unknown"] | [Confidence] | [Source] |
| Type | [Nation-state / Cybercriminal / Hacktivist / Insider / Unknown] | [Confidence] | [Source] |

### Attribution basis

[Brief narrative explaining the attribution assessment. Reference the ACH matrix from the evidence log. State which hypotheses were eliminated and why. State the Devil's Advocacy assessment.]

---

## 2. Capabilities (MITRE ATT&CK mapping)

| Tactic | Technique | Description | Evidence | Confidence |
|---|---|---|---|---|
| Initial Access | T1566.001 | Spearphishing Attachment | [Evidence ref] | [Confidence] |
| Execution | T1059.001 | PowerShell | [Evidence ref] | [Confidence] |
| Persistence | T1547.001 | Registry Run Keys | [Evidence ref] | [Confidence] |
| Credential Access | T1003 | OS Credential Dumping | [Evidence ref] | [Confidence] |
| Lateral Movement | T1021.001 | RDP | [Evidence ref] | [Confidence] |
| C2 | T1071.001 | Web Protocols | [Evidence ref] | [Confidence] |
| Exfiltration | T1041 | Exfiltration Over C2 Channel | [Evidence ref] | [Confidence] |
| Impact | T1485 | Data Destruction | [Evidence ref] | [Confidence] |

### Zero-day usage

| CVE | Product | Date observed | Evidence | Confidence |
|---|---|---|---|---|
| [CVE-YYYY-NNNN] | [Product] | [YYYY-MM-DD] | [Evidence ref] | [Confidence] |

### Custom malware

| Malware name | Type | First seen | Evidence | Confidence |
|---|---|---|---|---|
| [Name] | [Backdoor / Loader / Implant / Wiper / etc.] | [YYYY-MM-DD] | [Evidence ref] | [Confidence] |

### Operational sophistication assessment

- **OPSEC discipline:** [High / Medium / Low] — [Justification with evidence]
- **Infrastructure rotation frequency:** [Description with evidence]
- **Anti-forensics:** [Techniques observed with evidence]
- **Tooling complexity:** [Custom / Modified commodity / Off-the-shelf] — [Evidence]

---

## 3. Infrastructure

### Indicators

| Indicator | Type | First seen | Last seen | ASN/Registrar | Source | Confidence |
|---|---|---|---|---|---|---|
| [domain.com] | Domain | [YYYY-MM-DD] | [YYYY-MM-DD] | [Registrar] | [Tool/URL] | [Confidence] |
| [1.2.3.4] | IP | [YYYY-MM-DD] | [YYYY-MM-DD] | [ASNNNN] | [Tool/URL] | [Confidence] |
| [cert-hash] | TLS fingerprint | [YYYY-MM-DD] | [YYYY-MM-DD] | [Issuer] | [Tool/URL] | [Confidence] |
| [hash] | File hash | [YYYY-MM-DD] | [YYYY-MM-DD] | N/A | [Tool/URL] | [Confidence] |

### Infrastructure patterns

- **Hosting:** [Bulletproof / Compromised / Cloud / Mixed] — [Evidence]
- **Domain registration:** [Registrar patterns, TLD preferences, registration-to-use lag] — [Evidence]
- **TLS certificates:** [Issuer, lifetime, SAN patterns] — [Evidence]
- **C2 protocols:** [HTTP/HTTPS / DNS tunneling / Custom / Legitimate service abuse] — [Evidence]
- **Rotation:** [Frequency and pattern] — [Evidence]

### Infrastructure graph

[Insert Mermaid graph showing relationships between domains, IPs, certificates, and malware samples. Use templates/graphs/mermaid-graph.md as reference.]

---

## 4. Objectives and targeting

| Aspect | Assessment | Evidence | Confidence |
|---|---|---|---|
| Primary targets | [Sectors, countries, org types] | [Evidence] | [Confidence] |
| Secondary targets | [Sectors, countries] | [Evidence] | [Confidence] |
| Strategic intent | [Espionage / Disruption / Financial / Sabotage / Influence / Mixed] | [Evidence] | [Confidence] |
| Target selection | [Opportunistic / Targeted / Supply-chain / Watering hole] | [Evidence] | [Confidence] |
| Scale | [Number of confirmed victims / estimated campaign size] | [Evidence] | [Confidence] |

---

## 5. TTP summary

> [Actor designation] typically gains initial access via [method] delivering [malware/tool] in [format] [attachments/links]. The lures are [language/cultural reference], suggesting [target demographic]. Once established, the actor uses [living-off-the-land technique] for [duration] before deploying [implant]. C2 communication occurs over [protocol] to [infrastructure pattern]. The actor demonstrates [OPSEC level] discipline, including [specific behaviors], but makes consistent mistakes in [specific area].

[Expand as needed — 2-3 paragraphs maximum]

---

## 6. Gaps and unknowns

- [Indicator or behavior that could not be mapped to ATT&CK]
- [Activity cluster that may or may not be the same actor]
- [Vendor attribution claims that could not be independently verified]
- [Temporal gaps in the activity timeline]
- [Collection limitations (tools not available, rate limits, jurisdictional constraints)]

---

## Methodology

- **Framework:** MITRE ATT&CK + Intelligence Cycle (5 phases)
- **Analytic techniques applied:** [ACH / Key Assumptions Check / Devil's Advocacy — reference evidence log entries]
- **Tools used:** [List of tools invoked with timestamps — abbreviated; full log in evidence log]

---

## Recommended next steps

1. [Specific, actionable next pivot — with rationale]
2. [Specific collection gap to fill]
3. [Recommended cross-correlation with external threat intel platform]

---

## Sources

1. [Source name] — [URL] — [Accessed YYYY-MM-DD]
2. [Source name] — [URL] — [Accessed YYYY-MM-DD]

---

## Limitations

- [OPSEC constraints that affected collection]
- [Single-source findings and their impact]
- [Temporal freshness of data (e.g., "passive DNS data reflects disclosures through [date]")]
- [Speculative assumptions flagged during Key Assumptions Check]
- [Counter-arguments from Devil's Advocacy assessment]
- [Jurisdictional limitations]

---

## Evidence log reference

Full evidence log: [path or inline]
ACH matrix: [evidence log entry ID]
Key Assumptions Check: [evidence log entry ID]
Devil's Advocacy assessment: [evidence log entry ID]
Infrastructure graph (JSON): [evidence log entry ID]
