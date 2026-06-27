# Investigating a Company

## Scope
This guide covers the structured investigation of a legal entity — typically a corporation, LLC, partnership, or non-profit. It applies to due-diligence teams, M&A researchers, journalists investigating corporate malfeasance, fraud analysts, and supply-chain risk assessors. It covers legal registration, officer and director identification, filings, web presence, technology stack, owned infrastructure, employee enumeration, and breach history. It does **not** cover covert infiltration of the company, social engineering of employees, insider access, or any technique that requires misrepresentation of the investigator's identity. Pretext calls to a company's front desk are illegal in many jurisdictions (UK GDPR s.170, US GLBA for financial institutions) and outside scope.

## Key questions to answer
- What is the company's legal name, registration number, jurisdiction, and current registration status?
- When was it incorporated, where, and by whom?
- Who are the current officers, directors, and beneficial owners (to the extent disclosed)?
- What is the registered office address, and does it match the operating address?
- What filings exist (annual reports, financial statements, regulatory filings) and what do they reveal?
- What is the corporate structure — parents, subsidiaries, branches, sister companies?
- What is the company's web presence, technology stack, and owned infrastructure?
- Who are the employees (in aggregate, not by individually-pulled name unless authorised)?
- What is the company's breach history?
- What is the company's litigation, regulatory-action, and sanctions history?
- What is the beneficial-ownership chain up to the ultimate beneficial owner (UBO)?

## Data categories
### Category 1: Legal registration
The canonical source depends on jurisdiction:
- **US**: state Secretary of State business-entity search (Delaware, Nevada, Wyoming are commonly used; each state portal differs). No federal corporate register exists.
- **UK**: Companies House (free, comprehensive, includes filing history, officer history, person-with-significant-control register).
- **EU**: each member state maintains a national business register accessible via e-Justice portal; beneficial ownership is in each state's central register (with access restrictions).
- **Offshore**: offshoreLeaks (ICIJ), Open Corporates Offshore, the Pandora/Panama/Paradise Papers databases.
- **Aggregator**: OpenCorporates — the most comprehensive cross-jurisdictional aggregator, with officer and address pivoting.

Record: legal name, registration number, registration date, status (active, dissolved, struck-off), registered office, company type (Ltd, PLC, LLC, GmbH, etc.), and SIC/NAICS industry codes where assigned.

### Category 2: Officers, directors, and beneficial owners
Companies House PSC register (UK), SEC filings naming executive officers (US public), Datalogia/Q4 for officer networks, OpenCorporates officer relationships. For private companies in opaque jurisdictions, beneficial ownership may be invisible — flag this. The Corporate Transparency Act (US, phased implementation) and the EU UBO register (post-2023 reforms) are changing the visibility landscape; data freshness matters.

### Category 3: Filings
- **US public companies**: SEC EDGAR (10-K annual, 10-Q quarterly, 8-K current, DEF 14A proxy, S-1 IPO, Form 4 insider trades). Free and authoritative.
- **UK**: Companies House annual returns (CS01), confirmation statements, accounts (micro-entity, small, medium, full), charges.
- **EU**: equivalent national filings.
- **Private US companies**: no public filing requirement beyond state-level basics; if venture-backed, Crunchbase, PitchBook, and press releases provide funding data.

### Category 4: Corporate structure
Build a tree of parents, subsidiaries, and sister companies. Sources: company's own "about us" page, annual reports (group structure is usually disclosed for audited groups), OpenCorporates corporate-group feature, SEC Exhibit 21 (subsidiary list for US public filers). A complex structure across multiple offshore jurisdictions is not in itself suspicious; it is a flag worth investigating.

### Category 5: Web presence
Primary domain(s), social media (LinkedIn company page, Twitter/X, Facebook, Instagram, YouTube), Crunchbase profile, Glassdoor reviews (employee-sentiment signal), Wikipedia (if any). Capture the technology stack per ../../knowledge/domains/domain-investigation.md (BuiltWith, Wappalyzer, httpx). Identify analytics IDs (Google Analytics, Tag Manager) — these are pivots to other sites operated by the same group.

### Category 6: Owned infrastructure
IP ranges and ASNs owned or operated by the company. Sources: RDAP (operator field), RIPE Stat, BGP.he.net, Shodan searches filtered by organisation field, ASN enumeration. Large enterprises may have many ASNs across regions; smaller companies typically operate from cloud-provider IPs and own no infrastructure.

### Category 7: Employee enumeration
LinkedIn is the primary source. The legitimate investigation target is aggregate headcount, growth/decline, geographic distribution, role mix, and tenure patterns — not individually-pulled employee names unless specifically authorised and lawful. Tools: LinkedIn company-page employee count, LinkedIn search (with rate-limit awareness), TheHarvester (email-pattern enumeration), Hunter.io (email pattern and verification), GitHub employee enumeration (commits with company email, organisation membership). Do not scrape LinkedIn at volume; this violates LinkedIn's ToS and may attract cease-and-desist.

### Category 8: Breach history
Has the company publicly disclosed a breach? Sources: company press releases, regulator enforcement actions (ICO, FTC, state AGs, CNIL, Garante), Wikipedia (for high-profile breaches), HaveIBeenPwned (for breach-included domains), Verizon DBIR for sector context, LeakIX and IntelX for unindexed leaks. Record breach date, disclosure date, data classes affected, regulatory penalty, and remediation.

### Category 9: Litigation, regulatory, and sanctions history
- **US**: PACER (federal), state court dockets, SEC enforcement actions, FTC cases, OFAC sanctions list, Specially Designated Nationals (SDN).
- **UK**: Companies House filing history (charges, court orders), BAILII (judgments), Insolvency Service, FCA register and enforcement actions, UK OFSI sanctions.
- **EU**: national registers, EUR-Lex for sanctions, ESMA enforcement.
- **International**: UN Security Council Consolidated List, World-Check (paid), Sayari/Risk Ledger (paid).

## Canonical tools
| Tool | Use case | Free/Paid |
|---|---|---|
| OpenCorporates | Cross-jurisdictional registration + officers | Freemium |
| UK Companies House | UK entity filings, officers, PSC | Free |
| SEC EDGAR | US public-company filings | Free |
| state SoS portals | US private-company registrations | Free |
| Sayari / RDC | Beneficial-ownership and risk screening | Paid |
| World-Check | Sanctions and PEP screening | Paid |
| Crunchbase | Funding, investors, acquisitions | Freemium |
| LinkedIn | Employee enumeration | Freemium |
| Hunter.io | Email pattern and verification | Freemium |
| BuiltWith / Wappalyzer | Technology stack | Freemium / Free |
| Shodan | Infrastructure correlation | Freemium |
| BGP.he.net | ASN and prefix ownership | Free |
| PACER | US federal court records | Paid per page |
| OFAC / UK OFSI / EU sanctions lists | Sanctions screening | Free |

## Methodology
1. **Establish the legal entity.** Confirm full legal name, registration number, jurisdiction, and current status from the primary registry, not an aggregator.
2. **Pull the filing history.** All available filings in chronological order. Note any filing gaps, address changes, or status changes (dissolution, restoration, name change).
3. **Identify officers and beneficial owners.** Current and historical. Build a person-of-control list, then pivot each officer to other companies they control (see ../../knowledge/domains/person-investigation.md).
4. **Map the corporate structure.** Parent, subsidiaries, sister companies. Identify the ultimate beneficial owner.
5. **Pull litigation, regulatory, and sanctions.** Multi-jurisdictional; do not assume a single jurisdiction search is sufficient.
6. **Assess web presence.** Domain, technology stack, analytics IDs, social media, public reviews.
7. **Map infrastructure.** Owned IP ranges and ASNs, if any. Pivot to ../../knowledge/domains/ip-investigation.md for host-level detail.
8. **Enumerate employees in aggregate.** Headcount, growth, geographic distribution, role mix. Do not pull individual names unless authorised.
9. **Check breach history.** Public disclosures, regulator actions, leak-site evidence.
10. **Synthesise risk indicators.** Sanctions matches, opaque ownership, shell-company indicators, high-risk jurisdiction exposure, recent officer turnover, breach history, regulatory actions.
11. **Capture and timestamp** every artefact per the report template.

## Common pitfalls
- **Name collisions.** "Acme Holdings Ltd" exists in dozens of jurisdictions. Always tie identity to registration number and jurisdiction, never to name alone.
- **Dissolved-entity ambiguity.** A dissolved company may have been re-registered under a similar name by a different party. Always check the registration date and officer history of the active entity.
- **Front companies.** A company with one employee, one address, and a generic name may be a legitimate special-purpose vehicle or a shell. The corporate record alone cannot distinguish; you need transactional or operational context.
- **PSC register gaps.** UK PSC data is self-reported and frequently incomplete or outdated. Absence of a PSC means "none reported", not "no UBO".
- **Offshore-jurisdiction opacity.** BVI, Cayman, Panama, Seychelles, Mauritius — most filings are not public. Use ICIJ offshore leaks datasets and beneficial-ownership commitments under FATF recommendations; flag what you cannot see.
- **LinkedIn headcount inflation.** LinkedIn's employee-count widget rounds and includes former employees who haven't updated. Treat as approximate.
- **Subsidiary depth.** Exhibit 21 of a 10-K lists first-tier subsidiaries only. Deeper structures require additional research.
- **Filing-language barriers.** Non-English filings are often machine-translated and lose nuance. Use native-speaker review for high-stakes work.
- **Sanctions list lag.** A company sanctioned yesterday may not yet appear in commercial aggregators. Always check the primary sanctions lists (OFAC, UK OFSI, EU, UN) directly.

## Ethical considerations
- **Beneficial ownership and PII.** Beneficial-ownership registers contain personal data of natural persons. Processing is subject to GDPR/UK-GDPR legitimate-interest provisions; publication of UBO names requires a documented public-interest test (e.g., journalism of public concern).
- **Employee privacy.** Enumerating employees in aggregate is one thing; building a named roster is another. Do not produce named-employee lists without authorisation. Job titles, role distributions, and aggregate headcount are typically fine; named individuals are typically not.
- **Sanctions screening — confirmation, not condemnation.** A sanctions list match is an indicator, not a conclusion. Same-name matches are common. Confirm identifiers (date of birth, nationality, address) before any consequential action.
- **Vendor risk communication.** A finding that a vendor's parent company is in a sanctioned jurisdiction is a finding to communicate privately to your procurement/security team, not to publish.
- **Adverse-media balance.** Adverse media is often recycled, wrong, or politically motivated. Require primary-source corroboration before treating adverse media as a finding.
- **Offshore-jurisdiction fairness.** Use of an offshore jurisdiction is legal and common; do not imply wrongdoing without specific evidence.
- **PEP identification.** Identifying a politically exposed person in the ownership chain is a regulatory signal, not a finding of corruption. Treat as a risk indicator that requires enhanced due diligence, not as a public accusation.

## Output
Produce a company profile using the template at ../../templates/reports/company-profile.md. The profile must include: registration summary, officer and UBO table, corporate-structure diagram, filing-history timeline, litigation/regulatory/sanctions table, web presence and technology stack, infrastructure summary, aggregate employee profile, breach history, risk-indicator summary, confidence-scored assertions, and a sources appendix.

## Cross-references
- Pivot playbooks: ../pivot-playbooks/company-to-officers.md, ../pivot-playbooks/company-to-infrastructure.md, ../pivot-playbooks/analytics-id-pivot.md
- Tools: ../../tools/free-tools.yaml, ../../tools/apis.yaml, ../../tools/cli-tools.yaml
- Ethics: ../../ethics/corporate-due-diligence.md, ../../ethics/sanctions-screening.md, ../../ethics/employee-privacy.md
- Case studies: ../../case-studies/shell-company-unwinding.md, ../../case-studies/vendor-risk-assessment.md
