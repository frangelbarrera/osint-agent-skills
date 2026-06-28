# Case Studies

The `case-studies/` directory contains worked examples of real OSINT investigations. Each case study is a forensic reconstruction: what was found, in what order, with what tools, and what lessons an autonomous agent should extract from it.

## Purpose

Agents consult case studies to **calibrate expected output depth**. A case study shows the agent what "done" looks like for a given investigation type — how many sources are expected, how pivots are chained, how attribution is reasoned, how limitations are disclosed. When an agent produces a report that is materially thinner or less sourced than the analogous case study, that is a signal the agent under-collected.

Case studies are also useful for **anticipating pivot chains**. The Stuxnet case study shows how a single VirusTotal upload can unwind into a multi-month attribution effort. The MH17 case study shows how a single social media post can unwind into a convoy of military vehicles and a named unit. Reading these trains the agent to recognize pivot-worthy data points.

## How to use these files

- **Before** an investigation: skim the case study most analogous to the user's request. Note the source count and pivot depth.
- **During** an investigation: if you are stuck, read the analogous case study's "OSINT methodology applied" section for pivot ideas.
- **After** an investigation: compare your report's depth to the case study. If you have fewer sources or shallower pivots, iterate.

## Case studies in this directory

| File | Subject | One-line summary |
|---|---|---|
| [`stuxnet-investigation.md`](stuxnet-investigation.md) | Stuxnet (2010) | How a VirusTotal upload by Symantec researchers unwound into the first publicly-analyzed nation-state cyberweapon, with PLC fingerprinting and uranium-centrifuge attribution. |
| [`ukraine-power-grid-2015.md`](ukraine-power-grid-2015.md) | Ukraine power grid attack (2015) | How the BlackEnergy spear-phishing campaign pivoted into SCADA remote manipulation, the first publicly confirmed cyber-attack to cause grid outages. |
| [`bellingcat-mh17.md`](bellingcat-mh17.md) | MH17 investigation (Bellingcat) | The gold standard of OSINT attribution: social media posts, reverse image search, and geolocation traced a Buk missile system from Russia to the launch site. |
| [`colonial-pipeline.md`](colonial-pipeline.md) | Colonial Pipeline ransomware (2021) | DarkSide affiliate attribution via leak-site claims, blockchain tracing of the bitcoin ransom, and the FBI's partial recovery of funds. |
| [`reddit-user-attribution.md`](reddit-user-attribution.md) | Anonymous Reddit account (pedagogical) | A composite, non-real walkthrough showing how posting patterns, vocabulary, and metadata triangulate an anonymous account to a real identity. |

## A note on sourcing

Each case study ends with an **Attribution** section citing the primary public sources (Bellingcat reports, Mandiant write-ups, CISA advisories, vendor whitepapers). Agents that reproduce findings from these cases must cite the same primary sources, not the case study file itself. The case study is a teaching artifact; the underlying investigation is the authoritative source.

## Related

- Methodology references: [`../knowledge/methodologies/`](../knowledge/methodologies/)
- Worked walkthroughs on synthetic targets: [`../examples/`](../examples/)
- Report templates used in case studies: [`../templates/reports/`](../templates/reports/)
