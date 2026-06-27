# The Intelligence Cycle Applied to Autonomous OSINT

The classical Intelligence Cycle — Planning, Collection, Processing, Analysis, Dissemination — was designed for human analysts working inside national intelligence agencies. This file adapts it to autonomous OSINT work, where the analyst is an AI agent operating on publicly available information under a system prompt that forbids fabrication and mandates citation. Each phase below specifies what the agent does, what sources it typically consults, what artifacts it produces, and what commonly goes wrong.

The cycle is iterative, not linear. Findings from Phase 4 (Analysis) frequently send the agent back to Phase 2 (Collection) with refined priorities. Treat the five phases as a rhythm, not a checklist.

## Phase 1 — Planning and Direction

### What the agent does
The agent converts the user's request into a written investigation plan. It defines the subject as a precise noun phrase, the objective as a single question ending in a question mark, the scope (time range, jurisdictions, data types, platforms in and out of bounds), the pivots authorized for autonomous execution versus those requiring user approval, the success criteria (confidence thresholds, required findings, deliverable format), and the legal basis under which the work proceeds. If any element is ambiguous, the agent asks one clarifying question before collecting.

### Tools and sources consulted
None directly. The agent reads `../methodologies/source-verification.md` and `../methodologies/target-triangulation.md` to anticipate evidentiary needs, and scans `../../pivot-playbooks/` to identify which chains will likely be triggered. It consults `../../ethics/jurisdiction-rules.md` for the legal basis.

### Artifacts produced
An investigation plan, typically written to `../../templates/investigation-plan/` and committed to the evidence log. The plan is the contract between the agent and the user for the duration of the investigation.

### What could go wrong
Scope creep — the agent begins investigating adjacent entities without authorization. Mitigation: every out-of-scope pivot is logged but paused pending user approval. Over-broad objectives — "investigate this person" is not a question. Mitigation: the agent refuses to collect until the objective is re-expressed as a question. Missing legal basis — the agent proceeds under the wrong jurisdiction's rules. Mitigation: jurisdiction is an explicit field in the plan, defaulted to the user's stated jurisdiction or paused for clarification.

## Phase 2 — Collection

### What the agent does
The agent executes ordered lookups against the sources cataloged in `../../tools/free-tools.yaml`, `../../tools/apis.yaml`, and `../../tools/cli-tools.yaml`. Collection is ordered by cost (free first, paid second, manual third) and by signal density (sources likely to produce pivot-worthy data first). For each lookup the agent records the tool name, query parameters, UTC timestamp, HTTP status or exit code, and a hash of the raw response.

### Tools and sources consulted
DNS-over-HTTPS (Google, Cloudflare, Quad9), RDAP, `crt.sh`, Wayback CDX, Shodan InternetDB, ipinfo, RIPEstat, BGPview, urlscan.io, AlienVault OTX, HaveIBeenPwned, GitHub REST API, Blockchain.com and Etherscan for crypto, Nominatim and Overpass for GEOINT. Full registry in `../../tools/`.

### Artifacts produced
Raw tool outputs, each timestamped and hashed, appended to the evidence log at `../../templates/evidence/evidence-log.md`. No finding appears in the final report that does not have a corresponding evidence-log entry.

### What could go wrong
The agent fabricates tool output under pressure to deliver. Mitigation: the anti-hallucination rules in `../../system-prompt.md` are absolute; a tool that returned nothing is reported as "no results." Rate limits are silently exceeded. Mitigation: when a free tier is exhausted, the agent says so and pauses rather than degrading to lower-quality data. The agent consults a single source for a critical claim. Mitigation: the 2-source rule for Confirmed findings (see `target-triangulation.md`) is enforced at Phase 4.

## Phase 3 — Processing

### What the agent does
Raw collection output is rarely reportable. The agent normalizes (timestamps to ISO 8601 UTC, domains to lowercase punycode, IPs to canonical form), dedupes (merging on stable identifiers such as URL, hash, or normalized value), enriches (adds ASN for IPs, registrar for domains, breach year for credentials, jurisdiction for companies), and triages by relevance — a function of signal-to-noise ratio, recency, source credibility, and pivot potential.

### Tools and sources consulted
Local processing — the agent does not typically invoke external tools here, though it may consult `../../tools/cli-tools.yaml` for normalizers (e.g., `jq`, `urlview`) and the source-credibility weights in `target-triangulation.md`.

### Artifacts produced
A processed findings table: each row is one normalized finding with enriched context, a relevance score, and a back-reference to the evidence-log entry.

### What could go wrong
Normalization errors — a domain with trailing whitespace survives deduplication. Mitigation: normalize on a known canonical form and re-key the table after normalization. Over-enrichment — the agent spends Phase 3 budget adding context that does not bear on the objective. Mitigation: enrich only fields that change the relevance ranking or enable a downstream pivot.

## Phase 4 — Analysis and Production

### What the agent does
The agent corroborates findings, assigns confidence labels per the vocabulary in `../../system-prompt.md` (Confirmed, Probable, Unverified, Inferred, Speculative), maps findings to MITRE ATT&CK techniques where the investigation is threat-intel flavored (see `mitre-attack-mapping.md`) or to Bellingcat phases where it is attribution-flavored (see `bellingcat-methodology.md`), triangulates conflicting signals (see `target-triangulation.md`), and produces the report using the appropriate template in `../../templates/reports/`.

### Tools and sources consulted
The processed findings table from Phase 3. ATT&CK Navigator or the MITRE website for technique IDs. The system prompt's confidence vocabulary for labeling. The case studies in `../../case-studies/` for worked analogues.

### Artifacts produced
A draft intelligence report and a confidence-labeled findings list. Each finding carries a confidence level, a primary source, and at minimum one corroborating source if labeled Confirmed.

### What could go wrong
Confirmation bias — the agent weights evidence that supports the hypothesis it has formed. Mitigation: the agent actively seeks disconfirming evidence, per `bellingcat-methodology.md`. Forced ATT&CK mapping — the agent attaches a technique ID to a finding that does not actually fit. Mitigation: when a finding does not map cleanly, it is left unmapped with a note; see the limitations section of `mitre-attack-mapping.md`. Single-source findings reported as Confirmed. Mitigation: the 2-source rule.

## Phase 5 — Dissemination

### What the agent does
The agent delivers the report in the format the user requested (or the default structured Markdown report), along with the evidence log, a list of recommended next pivots not authorized for this run, and a statement of limitations — what could not be verified, what is stale, what is jurisdiction-dependent. The agent then solicits feedback that may trigger a new iteration of the cycle.

### Tools and sources consulted
The report templates in `../../templates/reports/`. The evidence log assembled in Phase 2 and Phase 3.

### Artifacts produced
The final intelligence product. The evidence log. A recommended-next-pivots list. A limitations section.

### What could go wrong
The report is delivered without a limitations section, giving the user false confidence. Mitigation: limitations are mandatory and may not be omitted. Raw tool output is dumped into the report body. Mitigation: raw output goes in the evidence log; the report contains processed findings only. The agent accepts the report as final without inviting iteration. Mitigation: the cycle is iterative — the agent explicitly invites the user to authorize next pivots or refine the objective.
