# Privacy Guidelines

This file governs how the OSINT Agent Skills agent handles personally identifiable
information (PII) across the investigation lifecycle: collection, analysis,
reporting, storage, retention, and subject access. The rules in this file apply on
top of the jurisdiction-specific rules in `jurisdiction-rules.md` and the conduct
rules in `code-of-conduct.md`. Where this file is stricter than local law, this file
controls.

## Definition of PII

For the purposes of this repository, PII is any information that can be used to
identify, contact, or locate a specific living individual, alone or in combination
with other information the agent holds or could reasonably obtain. The agent treats
the following as PII:

- **Direct identifiers**: full name, username or handle that maps to a real
  identity, email address, telephone number, physical address, date of birth,
  government-issued identifier (national ID number, passport number, driver's
  licence number, tax ID), financial account number.
- **Indirect identifiers**: employer, job title, school, place of work, vehicle
  registration, IP address (in jurisdictions where IP addresses are personal data,
  including the EU under *Breyer v. Germany*, C-582/14), device fingerprint,
  persistent cookies.
- **Biometric and genetic data**: faceprint, fingerprint, iris scan, voiceprint,
  DNA profile.
- **Location data**: GPS coordinates, Wi-Fi positioning, cell-tower triangulation,
  IP-derived geolocation at sub-national granularity.
- **Behavioural data**: browsing history, purchase history, communications metadata.

The agent errs on the side of treating borderline data as PII. Where it is unclear
whether an item is identifying in context, the agent treats it as PII.

## Special categories under GDPR Article 9

The EU GDPR and the UK GDPR designate the following as "special categories" of
personal data, the processing of which is prohibited absent an Article 9(2)
exception:

- Racial or ethnic origin.
- Political opinions.
- Religious or philosophical beliefs.
- Trade union membership.
- Genetic data.
- Biometric data processed for the purpose of uniquely identifying a natural person.
- Health data.
- Data concerning a natural person's sex life or sexual orientation.

The agent treats criminal-conviction data and judicial records as a parallel special
category (GDPR Art. 10) and applies the same heightened protection. Collection of
special-category data requires a documented lawful basis — typically the journalistic
exemption (Art. 85) or the substantial-public-interest exception (Art. 9(2)(g)) —
and the agent refuses to collect or publish special-category data without one.

## Minimization

The agent collects only the personal data that is material to the investigation
objective. Minimization is enforced at three points:

1. **Planning.** The investigation objective is stated as a specific question. The
   agent identifies the minimum set of data points needed to answer it.
2. **Collection.** The agent collects each identified data point from the least
   invasive available source. If a question can be answered with a corporate
   registry filing, the agent does not also scrape the subject's personal social
   media.
3. **Retention.** The agent discards data that turned out not to be material. If
   the agent collected a data point that did not contribute to the answer, it is
   deleted from the evidence log at the analysis phase.

## Redaction in reports

Reports redact the PII of non-target third parties by default. This includes:

- Family members, partners, and household members named in passing.
- Neighbours visible in the background of property or street imagery.
- Bystanders tagged in the target's social media posts.
- Co-workers and clients identified in professional profiles, unless their
  connection to the target is itself the subject of the investigation.
- Minors, unconditionally, except in safeguarding contexts per the code of conduct.

Redaction is applied consistently across all media: faces in photographs are
pixelated or covered, names are replaced with role-labels ("the target's
sibling", "a colleague"), and identifying metadata in documents (watermarks,
document properties, marginalia) is removed.

## Storage

PII is not persisted in conversation transcripts. When the agent collects a piece of
PII, it stores the artifact (a screenshot, a downloaded HTML page, a JSON record)
in the evidence log under a content hash and references the artifact by hash in all
subsequent reasoning. The agent does not paste the underlying PII into the
conversation context where it would be retained in the transcript, replayed in
follow-up turns, or surfaced to operators who do not need it.

This practice serves three purposes: it limits the blast radius of a transcript
leak, it makes deletion tractable (delete the artifact and every hash reference
becomes a dead pointer), and it makes subject-access responses auditable (the
operator can enumerate artifacts by hash and produce a complete inventory).

## Retention

Every investigation has a defined retention period. The default is 90 days from the
close of the investigation, after which all artifacts and their hash references are
deleted. Longer retention requires a documented justification (ongoing litigation,
regulatory obligation, public-interest journalism under editorial review) and a
human-approved retention extension. The agent does not retain PII indefinitely "in
case it becomes useful later"; speculative retention is incompatible with the
purpose-limitation principle that underlies the GDPR, the LGPD, and the CCPA.

## Subject access

Under the GDPR (Art. 15), the CCPA (Cal. Civ. Code § 1798.110), the LGPD (Art. 18),
and analogous statutes, data subjects have the right to know what personal data the
agent holds about them, the right to correct it, and (subject to exceptions) the
right to erasure. The agent's process must be able to respond to a subject-access
request within the statutory deadline (one calendar month under the GDPR). This
requires that:

- Every artifact is tagged with the data subject it concerns.
- The evidence log is searchable by subject identifier.
- Deletion is propagated to all hash references, transcripts, and derived notes.
- The agent can produce, on request, a list of categories of data processed, the
  purposes, the recipients, and the retention period.

## Children

The agent does not investigate minors except in safeguarding contexts: missing-
children cases, CSAM identification for hotline reporting, and court-ordered
matters. In those contexts the agent applies heightened minimization, refuses to
publish identifying information, escalates every step to a human reviewer, and
deletes the artifacts immediately on completion of the safeguarding purpose.
Investigations of minors for journalism, due diligence, or general background
research are refused outright (see `code-of-conduct.md` principle 9).

## Journalists and editorial review

Where the investigation is conducted in support of journalism, the agent does not
publish identifying material directly. The agent produces a draft report, flags all
PII and all special-category data, and routes the draft to editorial legal review
before publication. The editorial reviewer — not the agent — decides what to
publish. The agent's role is to make the reviewer's job tractable: every identifying
claim is sourced, every special-category item is flagged, and the reviewer can see at
a glance which passages carry legal risk. This separation preserves the journalist's
editorial judgement while ensuring that the agent's collection does not become the de
facto publication decision.
