# Legal Frameworks

This file is the primary legal reference for the OSINT Agent Skills agent. It maps the
statutes and case law that govern open-source intelligence collection in each major
jurisdiction. The agent consults this file at the planning phase of every investigation
to determine which laws apply to the target, which laws apply to the investigator, and
which techniques are therefore available.

The guiding principle is conservative: when two jurisdictions' laws could apply, the
agent obeys the stricter of the two. When a technique is ambiguous, the agent treats
it as prohibited until a human reviewer confirms a lawful basis.

## General principles that apply in every jurisdiction

Open-source intelligence, properly defined, is the collection and analysis of
information that is already publicly accessible. Across every jurisdiction surveyed
below, the following activities are generally lawful:

- Viewing public profiles on social media platforms without logging in.
- Searching public databases (corporate registries, court records, property records,
  domain WHOIS where published).
- Reading news articles, press releases, and government publications.
- Collecting information visible on the open web without authentication.

The following activities are generally unlawful or carry serious legal risk in every
jurisdiction surveyed:

- Accessing a system without authorization, including using another person's
  credentials.
- Bypassing authentication, paywalls, rate limits, or access controls.
- Interception of electronic communications in transit.
- Pretexting — impersonating another person to obtain information.
- Retrieving and re-publishing stolen breach data beyond what is necessary for
  verification.

## United States

### Computer Fraud and Abuse Act (18 U.S.C. § 1030)

The CFAA is the primary federal statute governing access to computers. It criminalizes
intentionally accessing a computer "without authorization" or "exceeding authorized
access" and obtaining information. For OSINT purposes the CFAA is the bright line: any
technique that bypasses a technical access control (login, paywall, rate limit, IP
allowlist) risks CFAA liability. The 2021 Supreme Court decision in *Van Buren v.
United States* (593 U.S. 374) narrowed the "exceeds authorized access" prong to
situations where the user accesses a specific area of a system they are not entitled
to, but the statute still prohibits circumventing authentication entirely.

### Electronic Communications Privacy Act (18 U.S.C. § 2510 et seq., § 2701 et seq.)

ECPA has two titles relevant to OSINT. Title I (the Wiretap Act) prohibits interception
of electronic communications in transit; this captures packet sniffing, man-in-the-
middle collection, and any technique that captures a session between two other
parties. Title II (the Stored Communications Act, 18 U.S.C. § 2701) prohibits
unauthorized access to stored electronic communications. OSINT that operates strictly
on publicly visible web pages does not implicate ECPA, but any technique that reads a
private message, email, or stored communication without the account holder's consent
does.

### First Amendment

The First Amendment protects the collection and publication of lawfully obtained
public information. This protection is broad but not absolute: it does not protect
publication of stolen intimate images, does not protect true threats, and does not
override privacy statutes such as the Video Privacy Protection Act (18 U.S.C. § 2710)
or state biometric laws.

### State-level statutes

- **California Consumer Privacy Act / California Privacy Rights Act (Cal. Civ. Code
  § 1798.100 et seq.)** — Grants California residents rights of access, deletion, and
  opt-out of sale over their personal information. Investigators collecting data on
  California residents must be prepared to honour deletion requests and must not
  "sell" covered data.
- **Illinois Biometric Information Privacy Act (740 ILCS 14/)** — Requires written
  consent before collecting biometric identifiers, including faceprint templates. BIPA
  is the strictest biometric law in the United States and is the principal reason the
  agent must refuse facial recognition on Illinois subjects without authorization.
- **New York SHIELD Act (N.Y. Gen. Bus. Law § 899-bb)** — Requires reasonable
  safeguards for the private information of New York residents. Relevant to retention
  and storage practices.

## European Union

### General Data Protection Regulation (Regulation (EU) 2016/679)

The GDPR applies to any processing of personal data of data subjects in the European
Union, regardless of where the controller is located. Three articles are central:

- **Article 6 — Lawful basis.** Every act of processing must rest on one of six lawful
  bases: consent, contract, legal obligation, vital interests, public task, or
  legitimate interests. OSINT investigations typically rely on legitimate interests
  (Art. 6(1)(f)), which requires a balancing test against the data subject's rights.
- **Article 9 — Special categories.** Processing of data revealing racial or ethnic
  origin, political opinions, religious or philosophical beliefs, trade union
  membership, genetic data, biometric data for unique identification, health data, or
  data concerning sex life or sexual orientation is prohibited unless an Art. 9(2)
  exception applies. Journalistic purposes are exempted under Art. 85, but the
  exemption is narrow and member-state-specific.
- **Article 17 — Right to erasure.** Data subjects can require erasure of personal
  data where processing is no longer necessary or was unlawful. The agent's evidence
  log must be able to locate and delete data on request.

### ePrivacy Directive (Directive 2002/58/EC, as amended)

The ePrivacy Directive governs electronic communications, cookies, and tracking
technologies. Placing cookies or similar identifiers on a data subject's device
requires consent unless strictly necessary for the service requested. OSINT collection
that relies on persistent tracking cookies implicates ePrivacy.

### Digital Services Act (Regulation (EU) 2022/2065)

The DSA imposes obligations on online platforms regarding content moderation,
transparency, and data access. For OSINT, the DSA is relevant because it creates a
regulated pathway for researcher access to platform data; data obtained outside this
pathway may be subject to platform terms that restrict downstream use.

## United Kingdom

### Data Protection Act 2018 / UK GDPR

The UK GDPR is the retained version of the EU GDPR, with the same lawful-basis
structure and special-category regime. The Information Commissioner's Office publishes
specific guidance on journalism (Section 32 of the Act) that investigators should
consult before publishing identifying material.

### Investigatory Powers Act 2016

The IPA regulates interception and bulk powers. It is relevant to OSINT because
interception of communications in the UK without lawful authority is a criminal
offence under the IPA, regardless of the investigator's motive.

### Computer Misuse Act 1990

The CMA criminalizes unauthorized access to computers (s. 1), unauthorized access with
intent to commit further offences (s. 2), and unauthorized acts impairing the operation
of a computer (s. 3). The CMA is broader than the US CFAA in some respects: it does
not require the accessed system to be "protected," and it has been read to cover
exceeding the scope of authorized access on a system the user is permitted to use.

## Brazil

### Lei Geral de Proteção de Dados (Lei nº 13.709/2018)

The LGPD is modeled on the GDPR and applies to any processing of personal data
carried out by a natural or legal person in Brazil, regardless of where the data
subject is located. Article 7 lists the lawful bases, including the exercise of
rights and legitimate interests. Sensitive personal data (Art. 11) — including
biometric, genetic, health, sexual orientation, and political opinion data — requires
a more restrictive basis. The ANPD (Autoridade Nacional de Proteção de Dados) enforces
the LGPD with fines up to 2 percent of revenue.

## Mexico

### Ley Federal de Protección de Datos Personales en Posesión de los Particulares

The LFPDPPP applies to private parties processing personal data in Mexico. It requires
a lawful basis (consent or one of the Art. 10 exceptions), notice to the data subject,
and ARCO rights (access, rectification, cancellation, opposition). INAI enforces the
statute and may impose significant fines.

## Argentina

### Ley 25.326 de Protección de Datos Personales

Argentina's data protection law applies to files, registers, banks, or databases in
Argentina or intended to provide services in Argentina. The law is GDPR-aligned in
spirit, with consent as the default basis and a sensitive-data regime (Art. 7). The
AAIP (now part of the Agencia de Acceso a la Información Pública) regulates
enforcement.

## International frameworks

### INTERPOL guidelines

INTERPOL publishes guidelines on the lawful use of open-source information in criminal
investigations, including the *INTERPOL Guidelines on the Use of Open Source
Information* and the BSI framework. These guidelines are not binding on private
investigators but are a useful benchmark for what law-enforcement-aligned practice
looks like.

### Budapest Convention on Cybercrime (ETS No. 185)

The Budapest Convention is the principal international treaty on cybercrime. Articles
2 through 6 require parties to criminalize unauthorized access, interception,
interference, and misuse of devices. The Convention is the legal basis for cross-
border cooperation between signatory states. Investigators should consult the Chart of
Ratifications to confirm whether their jurisdiction and the target jurisdiction are
both parties; where they are not, mutual legal assistance is significantly slower.

### European Convention on Human Rights, Article 8

Article 8 ECHR protects the right to private and family life. The European Court of
Human Rights has held in cases including *Satakunnan Markkinapórssi Oy and Satamedia
Oy v. Finland* (2017) that publication of lawfully obtained personal data can still
violate Article 8 where it is not in the public interest. The ECtHR jurisprudence is
binding on Council of Europe member states and persuasive elsewhere.

## The jurisdictional trap

The most important operational lesson in this file is that legality is not
transitive. Data that is lawfully collected in one jurisdiction may be unlawful to
publish, transfer, or store in another. Three common traps illustrate this:

1. **Collection legal, publication illegal.** An investigator in the United States
   may lawfully collect public social media posts under the First Amendment. Publishing
   those same posts in a report read in Germany, where the subject has a right to
   control their image under the Kunsturhebergesetz § 22, can be unlawful.
2. **Breach data legal to view, illegal to redistribute.** Some jurisdictions permit
   security researchers to query breach databases to verify credential exposure;
   redistributing the underlying data is a criminal offence in most jurisdictions.
3. **Facial recognition legal for one purpose, illegal for another.** A faceprint
   collected for verification of a public figure may be lawful; using the same faceprint
   to identify a private bystander captured incidentally is a BIPA violation in
   Illinois and an Art. 9 violation across the EU.

The agent resolves each of these traps conservatively: where any plausible
jurisdiction would criminalize an action, the agent declines the action and asks for
human review.
