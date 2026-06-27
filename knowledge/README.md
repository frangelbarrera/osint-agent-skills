# Knowledge Base Index

This directory is the operational core of `osint-agent-skills`. It holds the methodology, domain knowledge, techniques, and pivot playbooks that an autonomous agent consults while running an investigation. The `system-prompt.md` at the repository root tells the agent *how to behave*; this directory tells the agent *what to do*.

## Subdirectories

### `methodologies/`
Framework-level guidance. These files define the analytical models an agent applies to raw findings: the five-phase Intelligence Cycle, the Cyber Kill Chain, MITRE ATT&CK mapping, the Bellingcat open-source investigation methodology, target triangulation, and source verification. Consult these when planning an investigation, when deciding how to characterize findings, and when resolving conflicting signals.

### `domains/`
Subject-specific deep dives. One file per investigative domain — person, domain, IP, company, phone, cryptocurrency, social media, breach data, dark web, and GEOINT. Each file lists the canonical sources for that domain, the expected data shapes, and the cross-domain pivots that frequently pay off. Consult the relevant domain file before collecting on a new subject type.

### `techniques/`
Single-purpose techniques — Google dorks, username enumeration, email pivoting, metadata extraction, Wayback lookups, Certificate Transparency log analysis, DNS reconnaissance, Shodan queries, facial recognition, and reverse image search. Each technique file documents the trigger, the procedure, the tool, and the failure modes. Consult these when a playbook step references a technique by name.

### `pivot-playbooks/`
The canonical chains that turn one finding into a network. Each playbook specifies a trigger, ordered steps, anti-patterns, and output format. The agent follows these by default unless the user constrains scope. Consult these whenever a new artifact is discovered — the playbook tells the agent what to do next.

## How an agent should consult this directory

Treat the four subdirectories as different layers of abstraction. `methodologies/` answers "how do I think about this problem?" `domains/` answers "what does this subject class look like?" `techniques/` answers "how do I execute this one step?" `pivot-playbooks/` answers "given finding X, what should I do next?" When in doubt, the system prompt's KNOWLEDGE BASE REFERENCES section routes each question type to the correct subdirectory.

## Suggested reading order for a new agent

1. `methodologies/intelligence-cycle.md` — the operating rhythm.
2. `methodologies/source-verification.md` and `methodologies/target-triangulation.md` — how to weigh evidence.
3. `methodologies/bellingcat-methodology.md` — verification-first mindset for attribution work.
4. `methodologies/cyber-kill-chain.md` and `methodologies/mitre-attack-mapping.md` — for threat-intelligence products.
5. Skim every file in `pivot-playbooks/` to know the canonical chains by name.
6. Skim every file in `domains/` to know what each subject class yields.
7. Consult `techniques/` on demand when a playbook step references one.

After this pass, an agent has the conceptual map. The directories are then consulted selectively during each investigation, not reread in full.
