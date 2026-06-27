# Jurisdiction Rules

This file provides a per-country quick-reference table for the OSINT Agent Skills agent.
The agent consults this file immediately before running any collection technique to
confirm that the technique is permitted in both the investigator's jurisdiction and
the target's jurisdiction.

## How to read the tables

- **Public Info OK** — Whether collecting publicly accessible information (no
  authentication, no bypass of any access control) is permitted.
- **Private Info via Auth Forbidden** — Whether accessing private or authenticated
  content without the account holder's consent is prohibited. A "Yes" in this column
  means such access is forbidden.
- **Pretexting Allowed?** — Whether impersonating another person or entity to obtain
  information is permitted. A "No" means it is forbidden.
- **Facial Recognition** — Whether biometric facial matching against any third-party
  or self-built gallery is permitted without the subject's written consent.
- **Breach Data Retrieval** — Whether retrieving records from stolen-credential
  databases (e.g. HaveIBeenPwned-style queries are typically permitted; full dump
  retrieval is not) is permitted.
- **Notes** — Jurisdiction-specific caveats and statute citations.

Where a cell contains "Restricted," the technique is conditionally permitted and the
conditions are described in the Notes column. Where a cell contains "Refuse," the
agent declines the technique without human review.

## Default rules

The agent applies two default rules in addition to the per-country rules:

1. **Stricter jurisdiction wins.** When the investigator and the target are in
   different jurisdictions, the agent obeys the stricter of the two regimes.
2. **Default to refuse.** When the agent cannot determine the jurisdiction, it
   refuses the technique until a human reviewer identifies the applicable law.

## Per-country tables

### Americas

| Country | Public Info OK | Private Info via Auth Forbidden | Pretexting Allowed? | Facial Recognition | Breach Data Retrieval | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| United States (federal) | Yes | Yes (CFAA, ECPA) | No | Restricted | Restricted (query only) | First Amendment protects collection; CFAA 18 U.S.C. § 1030 forbids unauthorized access. |
| United States — California | Yes | Yes | No | Restricted (consent required) | Restricted (query only) | CCPA/CPRA Cal. Civ. Code § 1798.100; deletion rights apply. |
| United States — Illinois | Yes | Yes | No | Refuse (BIPA) | Restricted (query only) | 740 ILCS 14 requires written consent for biometric collection; private right of action. |
| Brazil | Yes | Yes (LGPD) | No | Restricted (Art. 11) | Restricted (query only) | LGPD Art. 7 lawful basis required; sensitive data Art. 11 needs stricter basis. |
| Mexico | Yes | Yes (LFPDPPP) | No | Restricted | Restricted (query only) | ARCO rights; INAI enforcement. |
| Argentina | Yes | Yes (Ley 25.326) | No | Restricted | Restricted (query only) | Sensitive data Art. 7; AAIP enforcement. |
| Canada | Yes | Yes (PIPEDA) | No | Restricted (PIPEDA + provincial) | Restricted (query only) | PIPEDA S.C. 2000, c. 5; Quebec Law 25 adds consent requirements. |

### Europe

| Country | Public Info OK | Private Info via Auth Forbidden | Pretexting Allowed? | Facial Recognition | Breach Data Retrieval | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| United Kingdom | Yes | Yes (CMA 1990, DPA 2018) | No | Restricted (Art. 9 UK GDPR) | Restricted (query only) | Computer Misuse Act 1990 broader than US CFAA; IPA 2016 governs interception. |
| Germany | Yes | Yes (§ 202a StGB) | No | Refuse without consent | Restricted (query only) | § 202a StGB (Ausspähen von Daten) criminalizes obtaining access-protected data; § 33 BDG restricts automated face matching. |
| France | Yes | Yes (Art. 323-1 CP) | No | Restricted (CNIL) | Restricted (query only) | Code pénal Art. 323-1 unauthorized access; CNIL guidance on biometrics. |
| Netherlands | Yes | Yes (Art. 138ab Sr) | No | Restricted | Restricted (query only) | Wetboek van Strafrecht Art. 138ab computerbreuk; AP enforcement of GDPR. |
| Spain | Yes | Yes (Art. 197 CP) | No | Restricted (AEPD) | Restricted (query only) | Código Penal Art. 197; LOPDGDD implements GDPR. |
| Sweden | Yes | Yes (Brottsbalken 4 kap. 9c §) | No | Restricted (IMY) | Restricted (query only) | Dataintrång offence; IMY enforcement. |
| Italy | Yes | Yes (Art. 615-ter CP) | No | Restricted (Garante) | Restricted (query only) | Codice Penale Art. 615-ter; Garante privacy enforcement. |

### Asia-Pacific

| Country | Public Info OK | Private Info via Auth Forbidden | Pretexting Allowed? | Facial Recognition | Breach Data Retrieval | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Australia | Yes | Yes (Criminal Code 477.2–477.3) | No | Restricted (Privacy Act) | Restricted (query only) | Criminal Code Div. 477 unauthorised access; Privacy Act 1988 (APPs). |
| Japan | Yes | Yes (不正アクセス行為の禁止等に関する法律) | No | Restricted (APPI) | Restricted (query only) | Act on Prohibition of Unauthorized Computer Access (1999); APPI personal data. |
| China (PRC) | Yes | Yes (PIPL, Criminal Law § 285) | No | Refuse | Refuse | PIPL (个人信息保护法) applies extraterritorially; OSINT targeting Chinese infrastructure may breach PIPL Art. 3 and Criminal Law § 285. |
| India | Yes | Yes (IT Act 2000 § 43, 66) | No | Restricted (DPDP Act 2023) | Restricted (query only) | Information Technology Act 2000; Digital Personal Data Protection Act 2023. |
| Singapore | Yes | Yes (CMA § 3) | No | Restricted (PDPA) | Restricted (query only) | Computer Misuse Act 1993; PDPA personal data. |
| South Korea | Yes | Yes (정보통신망법 § 48) | No | Refuse without consent | Restricted (query only) | Act on Promotion of Information and Communications Network Utilization; PIPA biometrics strict. |

### Russia and CIS

| Country | Public Info OK | Private Info via Auth Forbidden | Pretexting Allowed? | Facial Recognition | Breach Data Retrieval | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Russia | Yes | Yes (§ 272 UK RF) | No | Restricted | Restricted (query only) | Criminal Code § 272 unauthorized access. **2022 discrediting laws**: publishing findings that discredit Russian armed forces or officials (Federal Laws 32-FZ, 138-FZ, 266-FZ) carries severe criminal liability; agent refuses investigations whose findings could trigger these provisions. |
| Ukraine | Yes | Yes (Art. 361 CC) | No | Restricted | Restricted (query only) | Criminal Code Art. 361; data protection under Law 2297-VI. |

## Cross-jurisdiction investigations

When the investigator and the target are in different jurisdictions, the agent
cannot pick the more permissive regime. Two bodies of law apply simultaneously:

1. **The law of the investigator's jurisdiction** governs the conduct of collection
   — what the investigator is permitted to do from where they sit. A technique
   performed from Germany is governed by German law even if the data sits on a
   server in the United States.
2. **The law of the target's jurisdiction** governs the data itself and its
   downstream use. Publishing information about an EU data subject is governed by
   the GDPR even if the investigator is in the United States, because the GDPR
   applies extraterritorially to controllers offering services to or monitoring
   data subjects in the EU (Art. 3(2)).

The agent's default rule is therefore **both jurisdictions apply, conservatively**.
The agent identifies both jurisdictions at the planning phase, consults both rows in
the tables above, and obeys the stricter rule on every contested column. Where a
technique is permitted in one jurisdiction but refused in the other, the agent
refuses.

### Special cases

- **Cloud-hosted data with unknown location.** Where the target's data is hosted on
  a global cloud provider and the data subject's location is unknown, the agent
  assumes the most restrictive plausible jurisdiction (typically the EU for personal
  data, China for infrastructure targeting).
- **State actors and political targets.** Where the target is a state actor, the
  agent applies additional caution because publication of findings may attract
  prosecution under national-security statutes (e.g. UK Official Secrets Act 1989,
  US Espionage Act 18 U.S.C. § 793, Russia's 2022 discrediting laws).
- **Targets in conflict zones.** Where the target is located in an active conflict
  zone, the agent refuses techniques that could expose the target to physical harm,
  including geolocation of individuals and publication of identifying material.
