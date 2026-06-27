# Examples

The `examples/` directory contains walkthroughs of common OSINT investigation types, performed end-to-end against **safe, synthetic targets** (`example.com`, `test@example.com`, `testuser`). Agents can run these walkthroughs in full without risk of causing harm, tipping off a real subject, or producing real-world intelligence on a real person.

## Purpose

Examples serve two purposes:

1. **Validation.** When you set up an integration (see [`../integrations/`](../integrations/)), you should immediately run the relevant example walkthrough to confirm the agent loads the system prompt, consults the methodology, invokes the tools, and produces a structured report. If the agent's output materially diverges from the example, your integration is broken.

2. **Calibration.** Agents consult examples to understand the expected depth of an investigation — how many sources to consult, how many pivots to perform, how to structure the final report. The examples show what "done" looks like for each investigation type.

## How to use these files

- **After integration setup:** run the example that matches your test target. Compare the agent's actual output to the example output.
- **Before a real investigation:** skim the example most analogous to your target to calibrate expected pivot depth and source count.
- **When the agent under-performs:** compare its output to the example. The gap is your remediation checklist.

## Why synthetic targets?

Real investigations involve real people and real infrastructure. Agents-in-training should not cut their teeth on real targets — the risk of producing harm, of triggering defensive alerts on real systems, or of accidentally attributing an investigation to a real person is too high. The synthetic targets used here (`example.com`, `test@example.com`, `testuser`) are either reserved-by-RFC domains or generic placeholder identifiers that no real person owns. The agent can run the full methodology against them, and the methodology is the same as it would be against any real target — only the data is different.

The OSINT Agent Skills methodology is **target-agnostic.** The pivot playbooks, the source-citation discipline, the ethics rules, and the report templates are the same whether the target is `example.com` or `acme-corp.example`. The agent that produces a clean report on `example.com` will produce a clean report on any target — provided it follows the same discipline.

## Examples in this directory

| File | Target | Walkthrough |
|---|---|---|
| [`investigate-email.md`](investigate-email.md) | `test@example.com` | holehe → HIBP → Gravatar → Google dorks → username extraction → sherlock → intelligence-report.md. |
| [`investigate-domain.md`](investigate-domain.md) | `example.com` | DNS → RDAP/WHOIS → crt.sh → httpx → Shodan InternetDB → Wayback CDX → domain-profile.md. |
| [`investigate-username.md`](investigate-username.md) | `testuser` | sherlock → maigret → reverse image search → breach cross-reference → person-profile.md. |

## A note on output

Each example shows the agent's reasoning, the actual tool invocations, the raw findings, and the final report excerpt. The final report follows the template in [`../templates/reports/intelligence-report.md`](../templates/reports/intelligence-report.md) — classification, metadata, executive summary, methodology, findings, pivots performed, recommended next steps, sources, limitations.

When running an example, the agent should produce output that is materially similar in structure and depth. If the agent's output is shorter, less sourced, or lacks the limitations section, the integration is incomplete.

## Related

- Methodology references: [`../knowledge/methodologies/`](../knowledge/methodologies/)
- Pivot playbooks: [`../knowledge/pivot-playbooks/`](../knowledge/pivot-playbooks/)
- Worked case studies on real investigations: [`../case-studies/`](../case-studies/)
- Report templates: [`../templates/reports/`](../templates/reports/)
