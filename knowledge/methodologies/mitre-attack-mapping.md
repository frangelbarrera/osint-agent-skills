# Mapping OSINT Findings to MITRE ATT&CK

MITRE ATT&CK is a globally accessible knowledge base of adversary tactics and techniques based on real-world observations. For the OSINT investigator, it is the lingua franca of threat intelligence: a shared vocabulary that lets a finding about attacker infrastructure, tooling, or behavior be communicated to defenders, researchers, and policy-makers without ambiguity. This file explains how to map OSINT findings to ATT&CK techniques correctly, and when mapping is forced or unhelpful.

## What ATT&CK is and why it matters for OSINT product

ATT&CK is structured as a matrix. Columns are tactics — the adversary's tactical objectives, the "why" of an action (e.g., Initial Access, Execution, Persistence, Exfiltration). Rows within each column are techniques — the "how," the specific method used to accomplish the tactic (e.g., Phishing, Spearphishing Attachment). A technique may appear under multiple tactics because the same behavior can serve different objectives.

For OSINT product, ATT&CK matters for three reasons. First, it forces precision: a report that says "the adversary used phishing" is vague; a report that says "T1566.001 — Spearphishing Attachment" is precise and machine-parseable. Second, it enables correlation: a finding mapped to a technique ID can be joined against other datasets (vendor reports, ICS advisories, ISAC feeds) that also use ATT&CK IDs. Third, it gives the reader an actionable next step — "look for detection opportunities associated with this technique" — without the investigator having to enumerate them.

## How to map a finding to a technique ID

A worked example. Suppose the OSINT investigator finds, on a criminal forum, a post advertising a phishing kit that spoofs a major bank. The kit's HTML and the credential-exfiltration endpoint are visible. The mapping:

1. Identify the tactic. The kit is used to obtain credentials from victims. The tactic is **Credential Access** (TA0006).
2. Identify the technique. The kit harvests credentials by presenting a fake login page. The technique is **Phishing** (T1566) — but more specifically, since the kit is web-based and harvests entered credentials rather than delivering a malicious attachment, the sub-technique is **Spearphishing Link** (T1566.002) for the delivery, and **Credentials from Password Stores** or **Input Capture** for the harvesting. Be careful: a single artifact can map to multiple techniques.
3. Cite the evidence. The forum post URL, the kit's HTML, the exfiltration endpoint, and the timestamp all go into the evidence log; the technique ID is asserted with a back-reference.

When a finding does not fit a single technique, map to the closest technique and note the divergence in the report. Do not force a fit.

## Tactics vs. techniques

Tactics carry the prefix `TA` (e.g., TA0001 Initial Access, TA0040 Impact). They describe the adversary's objective at a stage of the operation. Techniques carry the prefix `T` (e.g., T1190 Exploit Public-Facing Application, T1566 Phishing). They describe the method.

A common error is to report a tactic where a technique is expected, or vice versa. Reports should cite techniques — they are the actionable unit. Tactics are organizational; they tell the reader where in the operation the technique sits.

## Sub-techniques and how to specify them

Sub-techniques carry a decimal suffix on the parent technique ID (e.g., T1566.001 Spearphishing Attachment, T1566.002 Spearphishing Link, T1566.003 Spearphishing via Service, T1566.004 Spearphishing Voice). When a sub-technique exists and the finding clearly fits it, cite the sub-technique ID and the parent in parentheses on first reference: "T1566.002 (Spearphishing Link)." When the finding fits the parent technique but not a documented sub-technique, cite the parent alone.

Sub-techniques are not always available. Many techniques have no sub-techniques. Do not invent decimal suffixes that do not exist in the ATT&CK catalog. When uncertain, consult the canonical ATT&CK website or the STIX bundles MITRE publishes.

## Mapping to ATT&CK for Cloud, Mobile, and ICS matrices

ATT&CK is not a single matrix. There are domain-specific matrices:

- **ATT&CK for Enterprise** — the default, covering Windows, Linux, macOS, network, and cloud (AWS, GCP, Azure) environments. Most OSINT threat-intel product uses this matrix.
- **ATT&CK for Cloud** — a sub-matrix of Enterprise focused on cloud-specific techniques (e.g., T1078.004 Valid Accounts: Cloud Accounts). Use this when the finding concerns cloud infrastructure.
- **ATT&CK for Mobile** — covers Android and iOS adversary behavior. Use this when the finding concerns mobile malware or mobile-targeted phishing.
- **ATT&CK for ICS** — covers industrial control systems. Use this when the finding concerns OT networks, SCADA, or critical infrastructure. The ICS matrix has its own tactic set that differs from Enterprise (e.g., `Inhibit Response Function`, `Impair Process Control`).

When mapping, name the matrix in the report. "T0890 (Exploitation for Privilege Escalation) in the ICS matrix" is clearer than "T0890" alone, because a reader scanning only the Enterprise matrix will not recognize the ID.

## Limitations — when ATT&CK mapping is forced or unhelpful

ATT&CK is not a universal taxonomy. It models adversary behavior that has been observed and documented; it does not cover every observable artifact an OSINT investigator might find.

- **Infrastructure-only findings often do not map.** A registered domain, a TLS certificate, a hosting provider relationship — these are pre-positioning artifacts that may support any of several techniques. Forcing them onto a specific technique (e.g., "T1071.001 Application Layer Protocol: Web Protocols" for every C2 domain) is technically defensible but analytically empty.
- **Pre-attack activity is under-covered.** ATT&CK's Pre-ATT&CK matrix exists but is less maintained. Findings about reconnaissance, infrastructure procurement, and capability development often fit awkwardly.
- **Disinformation and influence operations are out of scope.** ATT&CK does not model information operations. Use MITRE's separate DISARM framework or the Bellingcat methodology (`bellingcat-methodology.md`) for these.
- **Novel techniques are absent by definition.** ATT&CK catalogues observed behavior. A genuinely new technique will not have an ID until MITRE publishes one. Do not retrofit a novel finding onto an inapplicable technique.
- **Mapping is not analysis.** Citing a technique ID does not substitute for explaining what the adversary did and why it matters. The ID is a label, not an argument.

When a finding does not map cleanly, leave it unmapped and note "No clean ATT&CK mapping" in the report. That is more honest than a forced fit, and it preserves the value of the technique IDs that are cited elsewhere. For worked examples of mapping decisions, see the case studies in `../../case-studies/`.
