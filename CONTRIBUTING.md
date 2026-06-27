# Contributing to OSINT Agent Skills

Thank you for your interest in improving OSINT Agent Skills. This document explains how to contribute effectively.

## What we accept

We welcome contributions that:

1. **Add new pivot playbooks** — see `knowledge/pivot-playbooks/` for format. The format is strict: Trigger, Steps (with tool + command + expected output), Anti-Patterns, Output Format.
2. **Add new free tools** — to `tools/free-tools.yaml`. Must be truly free (no API key, no credit card required) and operational as of submission.
3. **Add new paid APIs** — to `tools/apis.yaml`. Must include accurate pricing, rate limits, and authentication details. Verify against the provider's current documentation.
4. **Add new jurisdiction rules** — to `ethics/jurisdiction-rules.md`. Must cite the specific statute or regulation.
5. **Improve existing methodologies** — clearer steps, more worked examples, better cross-references.
6. **Fix factual errors** — wrong pricing, dead links, deprecated tools. Include the source you used to verify the fix.
7. **Add new case studies** — based on publicly documented investigations only. Cite primary sources.
8. **Add new integration guides** — for agent frameworks not yet covered. Follow the format of `integrations/claude-code.md`.

## What we do NOT accept

- Tools whose primary purpose is intrusion (exploit frameworks, credential stuffers, social engineering templates).
- Techniques that require unauthorized access to non-public information.
- Code that bypasses authentication or rate limits.
- Playbooks that involve contacting the target under false identity ("pretexting") without explicit legal authorization.
- Facial recognition techniques applied to minors.
- Any contribution whose stated purpose is doxxing, harassment, stalking, or political repression.

## Submission format

- Use the existing file structure. Do not introduce new top-level directories without opening an issue first.
- Markdown files: hard-wrap at 100 characters where possible. No emojis in titles.
- YAML files: validate before submitting (`yamllint` or equivalent).
- JSON files: validate before submitting (`jq . file.json` should produce no errors).
- Citations: every factual claim about a tool's behavior, pricing, or rate limit must cite the source URL in a comment or footnote.
- Worked examples: include the exact command, the expected output, and a note on how to interpret it.

## Pull request process

1. Open an issue describing the proposed change before opening a PR for any non-trivial contribution. This avoids wasted effort if the change is out of scope.
2. Fork the repository and create a feature branch (`git checkout -b add-new-playbook`).
3. Make your changes. Test any new YAML/JSON for validity.
4. Update `CHANGELOG.md` with a one-line entry under "Unreleased".
5. Submit the PR. Reference the issue number in the PR description.
6. Respond to review feedback within 7 days, or the PR may be closed.

## Code of conduct

Be professional. Disagreements about methodology are expected and welcome; personal attacks are not. Discussions of legally gray techniques should be grounded in statute, not rhetoric. If you are unsure whether a technique is in scope for this repository, ask before submitting.

## Attribution

Contributors will be credited in the commit history and (for substantial contributions) in the README. By submitting a PR you agree to release your contribution under the same MIT license as the rest of the repository.
