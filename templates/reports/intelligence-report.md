# Intelligence Report

## Classification

[Choose one: UNCLASSIFIED // CONFIDENTIAL // SECRET. State the compartment and
declassification date if applicable. Example: UNCLASSIFIED // FOR OFFICIAL USE
ONLY. Delete this instruction line.]

Classification: [CLASSIFICATION]

## Report Metadata

[Fill in every field. Dates are ISO 8601 (YYYY-MM-DD). Confidence uses the
standard scale: Confirmed / Probable / Unverified / Inferred / Speculative. Delete this instruction line.]

- Report ID: [YYYYMMDD-SUBJECT-SLUG]
- Date: [YYYY-MM-DD]
- Analyst: [Analyst name or agent identifier]
- Subject: [One-line description of the subject investigated]
- Confidence: [Confirmed / Probable / Unverified / Inferred / Speculative]
- Requestor: [Who asked for this investigation]
- Linked investigation plan: [path or reference to plan-template.md]

## Executive Summary

[Two to three paragraphs. Bottom line up front: state the single most important
conclusion in the first sentence, then the supporting evidence in brief, then
the implication for the requestor. Do not bury the conclusion. Avoid jargon the
requestor will not understand. Delete this instruction line.]

[Paragraph 1 — the bottom line.]

[Paragraph 2 — the supporting evidence in summary.]

[Paragraph 3 — the implication and what the requestor should do about it.]

## Methodology

[Briefly describe the investigative approach. List the playbooks invoked, the
tools used, and the source classes consulted (public records, social media,
breach data, DNS history, etc.). Do not list every command — that belongs in the
evidence log. Delete this instruction line.]

[Investigation approach narrative.]

- Playbooks invoked: [list]
- Tools used: [list]
- Source classes consulted: [list]

## Findings

[Repeat the finding block below for each finding. Findings are statements the
analyst is willing to defend with cited evidence. Each finding must carry its
own confidence rating, not the report-level rating. Delete this instruction
line.]

### Finding [N]: [Finding title]

- Confidence: [Confirmed / Probable / Unverified / Inferred / Speculative]
- Source(s): [Evidence log IDs or short citations]
- Details: [What was observed, written as a defensible statement.]
- Implications: [What this means for the requestor. Why it matters.]

### Finding [N+1]: [Finding title]

[Continue as needed.]

## Pivots Performed

[List each pivot performed, the rationale for it, and the outcome. Pivots must
trace back to an authorized playbook in the investigation plan. Delete this
instruction line.]

1. Pivot: [name of pivot] — Rationale: [why this pivot was justified] —
   Outcome: [what was learned].
2. Pivot: [name] — Rationale: [why] — Outcome: [what].

## Recommended Next Steps

[Specific, actionable recommendations addressed to the requestor. Each
recommendation must be something the requestor can act on without further
analysis. Delete this instruction line.]

1. [Recommendation — concrete action.]
2. [Recommendation.]
3. [Recommendation.]

## Sources

[Complete list. Each source must include the URL, the access date, and where
relevant an archive snapshot. Sources cited here must appear in the evidence
log. Delete this instruction line.]

1. [Source title]. URL: [URL]. Accessed: [YYYY-MM-DD]. Archive: [snapshot URL].
2. [Source title]. URL: [URL]. Accessed: [YYYY-MM-DD]. Archive: [snapshot URL].

## Limitations

[State plainly what could not be verified, what data was unavailable, and where
the analyst's confidence is constrained by gaps. This section is mandatory and
must not be omitted even when the report is high confidence. Delete this
instruction line.]

[Limitation 1.]

[Limitation 2.]

[Limitation 3.]
