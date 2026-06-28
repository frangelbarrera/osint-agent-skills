# Threat Assessment

## Classification

[Choose one: UNCLASSIFIED // CONFIDENTIAL // SECRET. Delete this instruction
line.]

Classification: [CLASSIFICATION]

## Metadata

- Report ID: [YYYYMMDD-THREAT-SLUG]
- Date: [YYYY-MM-DD]
- Analyst: [Analyst name or agent identifier]
- Threat subject: [Actor name, campaign ID, or CVE identifier]
- Threat type: [Actor / Campaign / Vulnerability / Other]
- Confidence: [High / Moderate / Low]
- Linked investigation plan: [path or reference]

## Threat Overview

[One to two paragraphs describing the threat at a high level. State who or what
the threat is, what it does, who it targets, and over what time period it has
been active. Delete this instruction line.]

[Paragraph 1 — what the threat is.]

[Paragraph 2 — who it targets and observed scope.]

## Indicator Analysis

[List the indicators of compromise (IOCs) observed. Use a table when there are
multiple indicators of the same type. Distinguish between hard indicators
(unique to this threat) and soft indicators (could belong to many threats).
Delete this instruction line.]

| Indicator type | Value | First observed | Confidence | Source |
| --- | --- | --- | --- | --- |
| [IP / domain / hash / email / other] | [value] | [YYYY-MM-DD] | [Confirmed/Probable/Unverified/Inferred/Speculative] | [citation] |
| [type] | [value] | [YYYY-MM-DD] | [confidence] | [citation] |

## TTP Mapping (MITRE ATT&CK)

[Map observed behaviors to MITRE ATT&CK techniques. Cite the source for each
mapping — do not infer a technique from a single weak indicator. Delete this
instruction line.]

| Tactic | Technique | ID | Observed behavior | Source |
| --- | --- | --- | --- | --- |
| [Tactic] | [Technique name] | [TXXXX] | [behavior] | [citation] |
| [Tactic] | [Technique name] | [TXXXX] | [behavior] | [citation] |

## Attribution Assessment

[State the attribution claim and the confidence in it. Distinguish between
technical attribution (the infrastructure / malware is the same) and actor
attribution (the same group of people is behind it). Be explicit about what
would change the assessment. Delete this instruction line.]

- Attribution claim: [named actor or "unattributed"]
- Confidence: [High / Moderate / Low]
- Technical basis: [what links this activity to the attributed actor]
- Alternative hypotheses considered: [list]
- What would change the assessment: [list]

## Impact Assessment

[Describe the potential impact if the threat is realized against the requestor's
environment or constituency. Distinguish likelihood from impact. Delete this
instruction line.]

- Likelihood: [High / Moderate / Low]
- Impact if realized: [description]
- Affected assets or population: [description]

## Recommended Mitigations

[Concrete, prioritized mitigations. Each must map to a specific indicator or
TTP identified above. Delete this instruction line.]

1. [Mitigation — maps to [indicator/TTP].]
2. [Mitigation — maps to [indicator/TTP].]
3. [Mitigation — maps to [indicator/TTP].]

## Sources

[List every source cited above with URL and access date. Include archive
snapshots for ephemeral content. Delete this instruction line.]

1. [Source title]. URL: [URL]. Accessed: [YYYY-MM-DD]. Archive: [snapshot URL].
2. [Source title]. URL: [URL]. Accessed: [YYYY-MM-DD]. Archive: [snapshot URL].

## Limitations

[State what could not be verified and where confidence is constrained. Mandatory
section. Delete this instruction line.]

[Limitation 1.]

[Limitation 2.]
