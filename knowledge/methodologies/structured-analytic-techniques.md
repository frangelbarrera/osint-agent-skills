# Methodology: Structured Analytic Techniques (SATs)

## What this methodology does

Structured Analytic Techniques are systematic methods developed by the US Intelligence Community (originally at the CIA's Kent School) to counteract cognitive biases that distort intelligence analysis. They force the analyst to externalize their reasoning, examine competing explanations, and challenge their own assumptions before producing a final assessment.

For autonomous agents, SATs are essential. LLMs are prone to:
- **Anchoring bias** — over-weighting the first piece of evidence found.
- **Confirmation bias** — seeking evidence that supports an initial hypothesis and ignoring evidence that contradicts it.
- **Availability bias** — treating recently retrieved information as more significant than older but more reliable data.
- **Premature closure** — settling on a conclusion before exhausting the collection plan.

This document defines three SATs that an OSINT Agent Skills agent must apply during Phase 4 (Analysis and Production) of the Intelligence Cycle. Each technique has a trigger condition, a procedure, and an output format that goes into the evidence log.

---

## Technique 1: Analysis of Competing Hypotheses (ACH)

### What it does

ACH forces the analyst to consider multiple competing explanations for a set of evidence simultaneously, rather than sequentially evaluating each hypothesis. It was developed by Richards J. Heuer Jr. at the CIA and is the single most important debiasing technique in intelligence analysis.

The core principle: **evidence is evaluated against hypotheses, not hypotheses against evidence.** You do not ask "does this evidence support my hypothesis?" You ask "how consistent is this evidence with each hypothesis?" — including the ones you disagree with. The hypothesis that is least inconsistent with the evidence wins, not the one that is most consistent.

### When to apply

- **Any investigation with multiple plausible explanations for the same evidence.** Example: a domain resolves to an IP that hosts both a legitimate business website and a known phishing page. Is the domain compromised? Is the business a front? Is it shared hosting coincidence?
- **Attribution questions.** Who is behind an infrastructure cluster, a social media campaign, or a breach?
- **Any time the agent's confidence level would be "Probable" or "Inferred" based on a single hypothesis.** ACH must be applied before promoting to "Confirmed."

### Procedure

#### Step 1: Generate hypotheses

List all plausible explanations for the evidence. Include the hypothesis you think is most likely — and at least two alternatives. If you cannot generate at least three hypotheses, you have not thought broadly enough.

Rules:
- Hypotheses must be mutually exclusive (if two can be true simultaneously, they are not competing).
- Hypotheses must be falsifiable (there must be evidence that could disprove each one).
- Include the "null hypothesis" — the explanation that nothing unusual is happening (coincidence, misconfiguration, shared infrastructure).

#### Step 2: List all evidence

Catalog every piece of evidence collected during the investigation. Each item must be a concrete observation (tool output, archived page, registration record), not an inference.

#### Step 3: Build the consistency matrix

Create a matrix with hypotheses as columns and evidence as rows. For each cell, rate the consistency of the evidence with the hypothesis:

| Rating | Meaning |
|---|---|
| **+** | Consistent — the evidence is what you would expect if this hypothesis were true |
| **-** | Inconsistent — the evidence contradicts this hypothesis |
| **0** | Neutral — the evidence is equally consistent with this and other hypotheses |
| **?** | Unknown — insufficient information to judge |

#### Step 4: Evaluate diagnosticity

The most valuable evidence is **diagnostic** — it distinguishes between hypotheses. Evidence that is consistent with all hypotheses is not diagnostic; it does not help you choose between them.

Focus on the **-** ratings. A single piece of evidence that is inconsistent with a hypothesis is more informative than ten pieces that are consistent. The hypothesis with the most **-** ratings is the weakest.

#### Step 5: Eliminate, don't confirm

Eliminate hypotheses that are most inconsistent with the evidence. The surviving hypothesis is your assessment — but it is not "confirmed." It is "the least inconsistent hypothesis."

#### Step 6: Sensitivity check

For each key piece of diagnostic evidence, ask: if this evidence were wrong, stale, or fabricated, would my conclusion change? If yes, the evidence's reliability is the weak point in the analysis and must be flagged in the report's Limitations section.

#### Step 7: Document

Produce the ACH matrix as part of the evidence log. The report's executive summary references the ACH result: "Of five competing hypotheses, H3 (shared hosting coincidence) was least inconsistent with the evidence. H1 (domain compromise) was eliminated due to inconsistency with the SSL certificate timeline."

### Output format

```markdown
## ACH Matrix: [Investigation Question]

**Question:** [The question the ACH is trying to answer]

### Hypotheses

| ID | Hypothesis | Source |
|---|---|---|
| H1 | [Hypothesis 1] | [Agent-generated] |
| H2 | [Hypothesis 2] | [Agent-generated] |
| H3 | [Hypothesis 3 — null] | [Agent-generated] |

### Evidence

| ID | Evidence | Source | Timestamp | Confidence |
|---|---|---|---|---|
| E1 | [Evidence 1] | [Tool/URL] | [UTC] | [Confirmed/Probable] |
| E2 | [Evidence 2] | [Tool/URL] | [UTC] | [Confirmed/Probable] |

### Consistency Matrix

| Evidence | H1 | H2 | H3 |
|---|---|---|---|
| E1 | + | - | 0 |
| E2 | 0 | + | - |
| E3 | - | 0 | + |

### Diagnosticity Assessment

- E2 is the most diagnostic evidence: it distinguishes H2 from H1 and H3.
- E1 eliminates H2 (inconsistent with the hypothesis).
- E3 eliminates H1 (inconsistent with the hypothesis).

### Conclusion

- **Eliminated:** H1 (inconsistent with E3), H2 (inconsistent with E1)
- **Surviving:** H3 — least inconsistent with the evidence
- **Confidence:** Probable (single diagnostic evidence item; recommend further collection to reach Confirmed)

### Sensitivity

- If E2 were unreliable, H2 could not be eliminated. E2's source ([tool]) should be cross-verified before promoting to Confirmed.
```

---

## Technique 2: Key Assumptions Check

### What it does

The Key Assumptions Check forces the analyst to explicitly list every assumption underlying their analysis, then challenge each one. It prevents the situation where an entire intelligence product rests on an unexamined premise that, if wrong, collapses the conclusion.

### When to apply

- **Before finalizing any report.** The check is mandatory in Phase 4 before producing the intelligence product.
- **When the analysis depends on data from a single source.** If that source is wrong, the entire conclusion falls.
- **When the analysis involves temporal reasoning** (e.g., "this domain was registered before the attack, therefore it was pre-positioned"). Temporal assumptions are the most common source of intelligence failures.

### Procedure

#### Step 1: List all assumptions

Go through your findings and identify every implicit assumption. Common categories:

- **Source reliability assumptions** — "SecurityTrails passive DNS is accurate and complete."
- **Temporal assumptions** — "The registration date in RDAP reflects the original registration, not a transfer."
- **Attribution assumptions** — "The email address in the WHOIS record belongs to the domain's operator, not a privacy proxy."
- **Technical assumptions** — "The DNS response from Google DoH reflects the authoritative answer, not a cached or filtered response."
- **Behavioral assumptions** — "The target would not deliberately leave false trails."
- **Jurisdictional assumptions** — "The legal framework of [country] permits this technique."

#### Step 2: Rate each assumption

For each assumption, rate:

| Rating | Meaning |
|---|---|
| **Well-grounded** | Supported by multiple independent sources or by the nature of the data (e.g., "RDAP returns authoritative registration data" is well-grounded). |
| **Plausible** | Reasonable but not verified. The assumption could be wrong, but you have no evidence that it is. |
| **Speculative** | An assumption of convenience. You assume it because without it, the analysis cannot proceed — not because you have evidence for it. |

#### Step 3: Challenge each assumption

For each assumption, ask:
1. What evidence would disprove this assumption?
2. Have I looked for that evidence?
3. If the assumption is wrong, how does my conclusion change?

#### Step 4: Flag in report

Assumptions rated **Speculative** must be explicitly stated in the report's Limitations section. Assumptions rated **Plausible** should be noted. Assumptions rated **Well-grounded** can stand without flagging but should be documented in the evidence log.

### Output format

```markdown
## Key Assumptions Check: [Investigation Subject]

| # | Assumption | Rating | Disproof Evidence | Impact if Wrong | Searched? |
|---|---|---|---|---|---|
| A1 | [Assumption] | Well-grounded | [What would disprove it] | [Impact on conclusion] | Yes/No |
| A2 | [Assumption] | Plausible | [What would disprove it] | [Impact on conclusion] | Yes/No |
| A3 | [Assumption] | Speculative | [What would disprove it] | [Impact on conclusion] | Yes/No |

### Flagged for Limitations section

- A3: [Assumption text] — speculative; without this assumption, the conclusion [X] cannot be reached.
```

---

## Technique 3: Devil's Advocacy

### What it does

Devil's Advocacy requires the analyst to construct the strongest possible case against their own conclusion. It is the cognitive equivalent of a red team exercise. The analyst adopts the role of a skeptic who believes the conclusion is wrong and argues the alternative.

### When to apply

- **When the conclusion is high-stakes.** Attribution to a nation-state, identification of a person, or any finding that could lead to legal action.
- **When the conclusion is based on a single diagnostic piece of evidence** (identified during ACH).
- **When the agent's confidence level is "Probable" but the user is likely to treat it as "Confirmed."**
- **Mandatory for any report that includes an attribution claim.**

### Procedure

#### Step 1: Restate the conclusion

State the conclusion in a single sentence. Example: "The domain example.com is operated by Acme Corp."

#### Step 2: Argue against it

Construct the strongest case against the conclusion. Use the following framework:

1. **Alternative explanation.** What is the most plausible alternative explanation for the same evidence? (This should come from the ACH — the second-best surviving hypothesis.)
2. **Evidence weakness.** Which pieces of evidence are single-source, stale, or from tools with known limitations?
3. **Procedural gaps.** What pivots were authorized but not executed? What tools were available but not used?
4. **Confounding factors.** What external factors (CDN behavior, shared hosting, domain parking, privacy proxies) could produce the same evidence pattern without the conclusion being true?
5. **Motivation to deceive.** Could the target have deliberately planted the evidence? Is this a false flag?

#### Step 3: Assess the counter-argument

Rate the strength of the counter-argument:
- **Strong** — the counter-argument is at least as plausible as the conclusion. The confidence level must be downgraded.
- **Moderate** — the counter-argument raises legitimate doubts that should be reflected in the Limitations section.
- **Weak** — the counter-argument is technically possible but not plausible given the weight of evidence.

#### Step 4: Adjust the product

If the counter-argument is **Strong**, downgrade confidence by one level (Confirmed → Probable, Probable → Unverified). If **Moderate**, add to Limitations. If **Weak**, note it but do not adjust.

### Output format

```markdown
## Devil's Advocacy: [Investigation Subject]

### Conclusion under challenge

[Single-sentence restatement of the conclusion]

### Counter-argument

1. **Alternative explanation:** [Text]
2. **Evidence weakness:** [Text]
3. **Procedural gaps:** [Text]
4. **Confounding factors:** [Text]
5. **Motivation to deceive:** [Text]

### Assessment

- Counter-argument strength: [Strong/Moderate/Weak]
- Confidence adjustment: [None/Downgraded from X to Y]
- Added to Limitations: [Yes/No, with text]

### Final confidence: [Confirmed/Probable/Unverified/Inferred]
```

---

## Integration with the Intelligence Cycle

These three SATs are applied during **Phase 4 — Analysis and Production**, in this order:

1. **Key Assumptions Check** — first, to surface hidden premises before analysis.
2. **Analysis of Competing Hypotheses** — second, to evaluate competing explanations systematically.
3. **Devil's Advocacy** — third, to challenge the ACH survivor before finalizing.

All three outputs go into the evidence log. The report's **Limitations** section incorporates flagged assumptions and counter-arguments. The report's **Executive Summary** references the ACH conclusion and the Devil's Advocacy assessment.

### When to skip SATs

SATs are not required for:
- Pure factual lookups with a single, verifiable answer (e.g., "What IP does example.com resolve to?").
- Investigations that produce no competing hypotheses (rare, but possible for well-corroborated infrastructure lookups).
- Evidence log entries and raw tool output documentation.

When in doubt, apply them. The cost of a 10-minute ACH matrix is negligible compared to the cost of a wrong attribution.

---

## Cross-references

- Methodology: `intelligence-cycle.md` (Phase 4 integration)
- Ethics: `anti-hallucination.md` (confidence vocabulary and anti-fabrication rules)
- Reporting: `../../templates/reports/intelligence-report.md` (Limitations section)
- Source: Heuer, Richards J. Jr. *Psychology of Intelligence Analysis.* CIA Center for the Study of Intelligence, 1999. <https://www.ialeia.org/docs/Psychology_of_Intelligence_Analysis.pdf>
