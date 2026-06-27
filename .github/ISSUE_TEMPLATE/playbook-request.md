---
name: Playbook Request
about: Request adding a new pivot playbook to knowledge/pivot-playbooks/
title: "[PLAYBOOK] Add <playbook name>"
labels: playbook-request
assignees: ''
---

## Playbook name

[Short name, e.g., "photo-to-location" or "crypto-to-fiat"]

## Trigger

[What finding activates this playbook? e.g., "You found a photograph that may contain geolocation clues"]

## Why this playbook is needed

[Explain the investigative gap. What can an agent not do today that this playbook would enable?]

## Proposed steps

[Outline the ordered collection actions. For each step: tool, command/query, expected output.]

1. [Step 1: extract EXIF metadata using ExifTool]
2. [Step 2: reverse image search using TinEye]
3. [Step 3: identify visible landmarks]
4. ...

## Anti-patterns

[What NOT to do. Common false positives. Misleading signals.]

## Output format

[How should the pivot's results be reported?]

## Tools used

[List tools from the existing registries that this playbook would use, or new tools that would need to be added]

## Existing references

[Links to methodology documents, case studies, or external references that informed this playbook]

## Verification

- [ ] The trigger condition is distinct from existing playbooks
- [ ] The steps are ordered by cost (free first, paid second)
- [ ] Anti-patterns are documented
- [ ] The output format is compatible with the intelligence-report.md template
