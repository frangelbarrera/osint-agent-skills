# OSINT-BIBLE → osint-agent-skills Mapping

The [OSINT-BIBLE](https://github.com/frangelbarrera/OSINT-BIBLE) is a curated resource index — a directory of 426+ links to OSINT tools, websites, and services organized across 33 sections. The **osint-agent-skills** knowledge base is an operational layer: it doesn't just list tools, it documents *how* to use them, when to use them, and how to chain them into investigative workflows. This mapping traces the adaptation lineage, showing which OSINT-BIBLE sections informed each knowledge-base file and where coverage gaps remain.

## Mapping Table

| # | OSINT-BIBLE Section | Resource Count | osint-agent-skills File(s) | Adaptation Notes |
|---|---------------------|---------------|---------------------------|------------------|
| 1 | Search Engines | ~25 | `knowledge/techniques/google-dorks.md` | OSINT-BIBLE lists general search engines; agent-skills operationalizes Google dorking, advanced operators, and search automation patterns. |
| 2 | People Search | ~15 | `knowledge/domains/person-investigation.md` | OSINT-BIBLE links to people-finder sites; agent-skills wraps them into a structured person-investigation workflow with pivot points. |
| 3 | Username Search | ~20 | `knowledge/techniques/username-enumeration.md`, `knowledge/pivot-playbooks/username-to-identity.md` | OSINT-BIBLE lists username lookup tools; agent-skills adds enumeration methodology and pivot playbook for turning usernames into real identities. |
| 4 | Email Search | ~18 | `knowledge/techniques/email-pivoting.md`, `knowledge/pivot-playbooks/email-to-username.md` | OSINT-BIBLE links email search services; agent-skills covers email-to-username pivoting and breach-based email correlation. |
| 5 | Phone Number Lookup | ~12 | `knowledge/domains/phone-investigation.md` | OSINT-BIBLE lists reverse phone lookup sites; agent-skills provides structured phone investigation workflow with carrier lookup and social media cross-referencing. |
| 6 | Domain/IP Investigation | ~30 | `knowledge/domains/domain-investigation.md`, `knowledge/domains/ip-investigation.md`, `knowledge/techniques/dns-recon.md`, `knowledge/techniques/certificate-transparency.md` | OSINT-BIBLE lists WHOIS/DNS tools; agent-skills splits into domain and IP tracks, adds DNS recon techniques and CT log pivoting. |
| 7 | Social Media — Twitter/X | ~20 | `knowledge/domains/social-media.md` (Twitter subsection) | OSINT-BIBLE lists Twitter search tools; agent-skills covers advanced search operators, geolocation, and timeline analysis. |
| 8 | Social Media — Facebook | ~15 | `knowledge/domains/social-media.md` (Facebook subsection) | OSINT-BIBLE links Facebook lookup tools; agent-skills covers graph search alternatives and profile analysis. |
| 9 | Social Media — Instagram | ~12 | `knowledge/domains/social-media.md` (Instagram subsection) | OSINT-BIBLE links Instagram tools; agent-skills covers location-based searches, hashtag pivoting, and metadata clues. |
| 10 | Social Media — LinkedIn | ~10 | `knowledge/domains/social-media.md` (LinkedIn subsection) | OSINT-BIBLE lists LinkedIn scrapers; agent-skills covers employee enumeration and company-to-person pivoting. |
| 11 | Social Media — Other (Reddit, TikTok, Telegram, Discord) | ~25 | `knowledge/domains/social-media.md` (Other subsections) | OSINT-BIBLE links platform-specific tools; agent-skills provides cross-platform social media investigation patterns. |
| 12 | Geographic | ~20 | `knowledge/domains/geoint.md`, `knowledge/domains/satellite-imagery.md` | OSINT-BIBLE lists mapping/geo tools; agent-skills splits into GEOINT methodology and satellite imagery sources. |
| 13 | Image Search | ~18 | `knowledge/techniques/reverse-image-search.md`, `knowledge/techniques/facial-recognition.md` | OSINT-BIBLE lists reverse image search engines; agent-skills adds reverse-image methodology and facial recognition workflows. |
| 14 | Documents | ~15 | `knowledge/techniques/metadata-extraction.md` | OSINT-BIBLE links document search engines (Scribd, DocDroid); agent-skills focuses on metadata extraction from downloaded documents. Gap: document search engine usage not fully covered. |
| 15 | Breaches | ~12 | `knowledge/domains/breach-data.md` | OSINT-BIBLE lists breach databases; agent-skills covers breach querying, data interpretation, and ethical use in investigations. |
| 16 | Dark Web | ~15 | `knowledge/domains/dark-web.md` | OSINT-BIBLE links Tor services and dark web search engines; agent-skills covers safe access, marketplaces, and forum investigation. |
| 17 | Cryptocurrency | ~20 | `knowledge/domains/cryptocurrency.md` | OSINT-BIBLE lists blockchain explorers and wallet tools; agent-skills covers wallet clustering, transaction tracing, and exchange attribution. |
| 18 | Transportation | ~15 | `knowledge/domains/vehicle.md` | OSINT-BIBLE lists flight/ship/vehicle tracking; agent-skills covers vehicle investigation (plates, VIN). Gap: flight and ship tracking not covered. |
| 19 | Business Records | ~12 | `knowledge/domains/company-investigation.md` | OSINT-BIBLE links business registry sites; agent-skills covers corporate structure analysis, filings, and beneficial ownership tracing. |
| 20 | Government Records | ~10 | `knowledge/domains/company-investigation.md` (partial) | OSINT-BIBLE links government databases; agent-skills partially covers via company investigation. Gap: government records (court, property, licenses) lack dedicated coverage. |
| 21 | Public Records | ~15 | `knowledge/domains/person-investigation.md` (partial) | OSINT-BIBLE lists public records aggregators; agent-skills partially covers in person-investigation. Gap: no dedicated public records file (court records, property, marriage/divorce). |
| 22 | Academic | ~8 | — | Gap — candidate for future addition. OSINT-BIBLE lists academic search tools (Google Scholar, university directories). No corresponding file in agent-skills. |
| 23 | News | ~15 | — | Gap — candidate for future addition. OSINT-BIBLE lists news aggregators and archives. No dedicated news investigation file in agent-skills. |
| 24 | Archives | ~10 | `knowledge/techniques/wayback-investigation.md` | OSINT-BIBLE lists web archives; agent-skills covers Wayback Machine investigation methodology and cached page analysis. |
| 25 | Threat Intelligence | ~20 | `knowledge/domains/threat-actors.md`, `knowledge/methodologies/mitre-attack-mapping.md`, `knowledge/methodologies/cyber-kill-chain.md` | OSINT-BIBLE links threat intel feeds and platforms; agent-skills covers threat actor profiling, MITRE ATT&CK mapping, and kill chain analysis. |
| 26 | Vulnerability | ~15 | `knowledge/techniques/shodan-techniques.md` (partial) | OSINT-BIBLE lists vulnerability scanners and CVE databases; agent-skills partially covers via Shodan techniques. Gap: no dedicated vulnerability research file. |
| 27 | Malware | ~12 | `knowledge/domains/threat-actors.md` (partial) | OSINT-BIBLE lists malware analysis tools; agent-skills partially covers within threat actor profiles. Gap: no dedicated malware analysis file. |
| 28 | Network | ~18 | `knowledge/techniques/dns-recon.md`, `knowledge/techniques/certificate-transparency.md`, `tools/free-tools.yaml` | OSINT-BIBLE lists network scanning tools; agent-skills covers DNS recon and CT logs. Gap: no dedicated network scanning (nmap, traceroute, BGP) file. |
| 29 | Wireless | ~8 | — | Gap — candidate for future addition. OSINT-BIBLE lists WiFi/Bluetooth tools (wigle.net, etc.). No corresponding file in agent-skills. |
| 30 | IoT | ~8 | `knowledge/techniques/shodan-techniques.md` (partial) | OSINT-BIBLE lists IoT discovery tools; agent-skills partially covers via Shodan techniques. Gap: no dedicated IoT investigation file. |
| 31 | Cloud | ~10 | — | Gap — candidate for future addition. OSINT-BIBLE lists cloud storage discovery tools (S3 buckets, etc.). No corresponding file in agent-skills. |
| 32 | Physical Security | ~8 | `ethics/agent-opsec.md` (partial) | OSINT-BIBLE lists physical security tools; agent-skills partially touches OPSEC. Gap: no dedicated physical security OSINT file. |
| 33 | Forensics | ~12 | `knowledge/techniques/metadata-extraction.md` (partial) | OSINT-BIBLE lists digital forensics tools; agent-skills partially covers via metadata extraction. Gap: no dedicated forensics file (memory, disk, network forensics). |
| 34 | OSINT Tools (General) | ~20 | `tools/free-tools.yaml`, `tools/apis.yaml`, `tools/cli-tools.yaml` | OSINT-BIBLE lists general-purpose OSINT tools; agent-skills categorizes into free tools, APIs, and CLI tools with structured metadata. |
| 35 | OSINT Frameworks | ~10 | `knowledge/methodologies/intelligence-cycle.md`, `knowledge/methodologies/bellingcat-methodology.md` | OSINT-BIBLE links OSINT frameworks (OSINT Framework, IntelTechniques); agent-skills operationalizes the intelligence cycle and Bellingcat methodology. |
| 36 | OPSEC | ~8 | `ethics/agent-opsec.md` | OSINT-BIBLE lists OPSEC tools (VPNs, secure browsers); agent-skills covers operational security for agents conducting investigations. |
| 37 | Legal | ~8 | `ethics/legal-frameworks.md` | OSINT-BIBLE links legal resources; agent-skills covers legal frameworks governing OSINT collection and responsible disclosure. |

## Gaps Identified

The following OSINT-BIBLE sections have **no corresponding file** in osint-agent-skills and are candidates for future development:

1. **Academic** — Academic search tools (Google Scholar, university directories, citation databases) have no coverage. A `knowledge/domains/academic-investigation.md` file could cover academic attribution, citation tracing, and university affiliation lookups.

2. **News** — News aggregators, fact-checking tools, and real-time news monitoring have no dedicated file. A `knowledge/domains/news-intelligence.md` could cover source verification, news monitoring workflows, and fact-checking methodology.

3. **Wireless** — WiFi and Bluetooth reconnaissance (wigle.net, WiFi mapping) has no coverage. A `knowledge/domains/wireless-recon.md` could cover wireless network discovery, geolocation via WiFi, and Bluetooth device tracking.

4. **Cloud** — Cloud storage discovery (open S3 buckets, Azure blobs, GCS) has no coverage. A `knowledge/domains/cloud-investigation.md` could cover cloud bucket enumeration, misconfigured storage discovery, and cloud infrastructure mapping.

5. **Vulnerability** — While Shodan techniques partially overlap, there is no dedicated vulnerability research file covering CVE databases, exploit databases, and vulnerability scanning methodology. A `knowledge/domains/vulnerability-research.md` could fill this gap.

---

_Last updated: 2026-06-28_
