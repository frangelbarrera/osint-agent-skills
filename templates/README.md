# Templates

This directory contains the mandatory structural templates for every deliverable
produced by an OSINT Agent Skills agent. Templates exist so that output is consistent,
auditable, and reviewable regardless of which agent run produced it.

## Mandatory use

Agents must use these templates verbatim. Do not invent a parallel structure,
rename sections, or omit sections because no data was found — instead write
"None identified" or "Not in scope" so that the reviewer can confirm the section
was considered. The bracketed `[PLACEHOLDER]` syntax is the contract: every
placeholder must be replaced with concrete content (or an explicit null
statement) before the deliverable is considered complete.

If a template does not fit the task, the agent must open an issue proposing a
new template rather than silently improvising. Templates evolve through pull
requests, not through ad hoc divergence.

## Directory layout

- `reports/` — final deliverables delivered to the requestor.
  - `intelligence-report.md` — default ICD-203 inspired intelligence report.
    Use this when no narrower template applies.
  - `threat-assessment.md` — focused on a threat actor, campaign, or
    vulnerability.
  - `person-profile.md` — focused on a single individual.
  - `domain-profile.md` — focused on a single domain and its infrastructure.
  - `investigation-summary.md` — short executive summary deliverable.

- `investigation-plan/` — documents created BEFORE collection begins.
  - `plan-template.md` — the investigation plan, signed off before action.
  - `scope-definition.md` — narrower scope statement used to align with the
    requestor on in-bounds and out-of-bounds activity.

- `evidence/` — supporting artifacts that accompany reports.
  - `evidence-log.md` — append-only log of every artifact collected.
  - `source-citation.md` — guide for how to cite sources inside reports.
  - `chain-of-custody.md` — used when artifacts may be introduced in legal
    proceedings.

## How to use a template

1. Copy the template into the run's working directory.
2. Replace every `[PLACEHOLDER]` with concrete content.
3. Delete instructions in brackets once the section is filled in.
4. Where a section genuinely does not apply, state why rather than removing it.
5. Validate that every source cited in a report appears in the evidence log.
