---
name: Pull Request
about: Submit changes to the OSINT Agent Skills knowledge base
title: "[PR] <brief description>"
assignees: ''
---

## Summary

[1-2 sentences describing what this PR changes]

## Type of change

- [ ] New tool added to a registry
- [ ] New pivot playbook
- [ ] New technique guide
- [ ] New domain guide
- [ ] New template
- [ ] New case study
- [ ] Bug fix / correction
- [ ] Documentation improvement
- [ ] Other: [describe]

## Files changed

[List the files modified or added]

## Validation

- [ ] Ran `bash scripts/validate.sh` (or `pwsh scripts/validate.ps1` on Windows) â€” all checks passed
- [ ] All new files are referenced in `agent-config.yaml` (if applicable)
- [ ] Cross-references in `system-prompt.md` updated (if applicable)
- [ ] `CHANGELOG.md` updated with an entry under `[Unreleased]`
- [ ] No hardcoded API keys, tokens, or credentials in any file
- [ ] No tab characters in YAML files (spaces only)

## Reviewer notes

[Anything the reviewer should pay special attention to, or context that isn't obvious from the diff]

## Attribution

[If this PR adapts material from an external source, cite the source here]
