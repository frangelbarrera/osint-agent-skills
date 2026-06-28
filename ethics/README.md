# Ethics

This directory contains the ethics, legality, privacy, and truthfulness rules that govern
the OSINT Agent Skills agent. Ethics in this repository is not a separate compliance overlay
applied at the end of an investigation. It is integrated throughout the agent's workflow:
every technique in `tools/`, every prompt in `system-prompt.md`, and every report the
agent produces is shaped by the files in this directory. The agent consults these files
continuously during an investigation rather than treating them as a checklist to satisfy
before publishing.

## Why ethics is integrated, not bolted on

A compliance overlay that is applied after an investigation is finished cannot prevent
harm. By the time a report is drafted, identifiers may have been collected unlawfully,
third parties may have been incidentally exposed, and fabricated inferences may have
already crept into the reasoning chain. The OSINT Agent Skills design therefore embeds
ethical constraints at each operational phase: planning, collection, analysis, and
reporting. The agent is required to confirm a legal basis before running a technique,
to refuse techniques that demand human review, to redact incidental personal data in
real time, and to audit every factual sentence before finalizing a report.

## How the agent uses these files

The agent consults each file at a specific point in the investigation lifecycle:

- `legal-frameworks.md` — Consulted at the **planning phase** to determine which
  jurisdiction's laws apply to the target and to the investigator. The agent must
  identify the jurisdiction before selecting techniques, because a technique that is
  lawful in one country may be a criminal offence in another.
- `jurisdiction-rules.md` — Consulted **per technique**, immediately before the agent
  runs a collection step. The agent checks the per-country table for the relevant
  jurisdiction and refuses the technique if the rule column is negative.
- `code-of-conduct.md` — The investigator's **standing rules**. These apply at all
  times, regardless of jurisdiction or objective. They include the public-information
  only rule, the no-deception rule, the no-harassment rule, and the human-review
  requirements.
- `privacy-guidelines.md` — Governs **PII handling in reports** and in intermediate
  artifacts. This file defines what counts as personal data, how to minimize collection,
  how to redact incidental third parties, and how long to retain evidence.
- `anti-hallucination.md` — Governs **truthfulness**. This is the most operationally
  critical ethics file because it directly prevents the agent from fabricating
  identifiers, tool output, or inferences. The agent applies the rules in this file
  during analysis and again as a self-audit before finalizing any report.

## File index

| File | Phase | Purpose |
| --- | --- | --- |
| `legal-frameworks.md` | Planning | Per-jurisdiction statute map |
| `jurisdiction-rules.md` | Per-technique | Per-country do/don't table |
| `code-of-conduct.md` | Standing | Ten investigator principles |
| `privacy-guidelines.md` | Collection, reporting | PII minimization and redaction |
| `anti-hallucination.md` | Analysis, audit | Truthfulness and source discipline |

Investigators and operators reviewing the agent's behaviour should treat any deviation
from the rules in this directory as a defect to be reported, not as a stylistic choice.
