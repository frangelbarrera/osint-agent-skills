# Investigating Dark-Web Presence

## What this domain covers

This guide covers the investigation of subjects, content, and infrastructure on dark-web networks — primarily Tor onion services, with secondary coverage of I2P eepsites. It encompasses dark-web search engines, marketplaces, forums, paste sites, ransomware leak sites, and the OSINT techniques for operating safely in these environments. The domain includes: Tor network basics (onion routing, .onion v3 addresses, hidden services), dark-web marketplaces (vendor profiles, listings, escrow, exit scams), forums (cybercrime communities, handle attribution, reputation systems), and paste sites (leak announcements, doxxing, credential dumps). It does **not** cover installing Tor, purchasing illicit goods, communicating with targets, or any active engagement with criminal actors. The cardinal rule: **dark-web OSINT is read-only and OPSEC-hardened. Browse through Tor (plus VPN in some threat models), never engage, never download outside a sandbox, and never assume you are unobserved.**

## When to use

- A breach or leak has been claimed on a ransomware leak site and you need to verify.
- A threat-actor handle has surfaced and you need to profile its dark-web persona.
- Stolen data (credentials, PII, proprietary data) is suspected of being offered for sale.
- A company or individual needs a dark-web exposure assessment.
- You are tracing cryptocurrency addresses that have dark-web market associations.
- You need to correlate clear-web identities with dark-web handles for attribution.

## Tools

| Tool | Use case | Cost |
|---|---|---|
| Tor Browser | Safe access to .onion services | Free |
| Tails / Whonix | Hardened OS environments for dark-web work | Free |
| Ahmia (ahmia.fi) | Tor search engine; clear-web accessible for initial queries | Free |
| Torch | Tor search engine; broad coverage, high noise | Free |
| OnionScan | Onion-service scanning and fingerprinting | Free |
| IntelX (Recon) | Multi-source dark-web search; indexes paste sites and forums | Freemium |
| DarkSearch | Secondary Tor search index | Free |
| ransomware.live / ransomwatch | Ransomware leak-site monitoring | Free |
| Maltego | Graph analysis with dark-web transforms | Freemium |
| GnuPG (PGP) | Verifying actor PGP signatures | Free |
| DarkOwl / Flashpoint / Recorded Future | Commercial dark-web intelligence platforms | Paid |

## Procedure

1. **Establish OPSEC.** Boot into Tails or Whonix. Confirm Tor connectivity. Disable JavaScript in Tor Browser. Consider a VPN layer in front of Tor if your threat model includes ISP-level surveillance. Document your OPSEC setup for the report.
2. **Define scope and stop conditions.** Specify what you are looking for. Pre-establish a CSAM protocol: if encountered, stop immediately, do not screenshot, document URL and time, route to NCMEC (US) or IWF (UK) or local equivalent.
3. **Start with clear-web-indexed sources.** Query IntelX, Ahmia clear-web, and ransomware.live before direct Tor browsing. These cover significant dark-web surface area without requiring direct access.
4. **Move to direct Tor browsing.** Use Ahmia and Torch to locate known forums, markets, and paste sites. Bookmark verified .onion addresses — phishing mirrors are rampant.
5. **Enumerate relevant forums and markets.** Identify the current iteration of each (BreachForums and successors cycle through takedowns). Document URLs, registration requirements, and access restrictions. Note PGP keys advertised by administrators.
6. **Search for the subject.** Query name, email, phone, company, brand, threat-actor handle, and any known cryptocurrency addresses. Use site-internal search where available; supplement with IntelX and Google cached results.
7. **Document findings.** For each hit: capture the .onion URL, timestamp, post author, post content (redacting victim PII), screenshots (metadata stripped), and PGP signature status. Never download files outside an isolated sandbox.
8. **Assess provenance.** Determine whether content is original, reposted, or fabricated. Verify actor identity via PGP signatures where possible. Check for impersonation (spoofed handles are common).
9. **Build a timeline.** Map when dark-web activity related to the subject began, peaked, and stopped. Correlate with known events (breach disclosures, ransomware attacks, law-enforcement takedowns).
10. **Pivot.** Threat-actor handles → social-media investigation. BTC/XMR addresses → cryptocurrency tracing. Breach data → breach-data correlation. PGP keys → cross-platform identity linking.
11. **Exit cleanly.** Close Tor Browser, clear persistent volumes if using Tails, and document the session log.

## Interpreting results

- **Forum posts and listings** indicate subject presence but not necessarily subject control — handles are spoofed, data is reposted, and claims are exaggerated.
- **Leak-site entries** on ransomware sites are strong indicators of a breach but verify independently — some groups list companies that were not actually breached to inflate their reputation.
- **Credential dumps** should be validated against breach databases; dark-web data is often stale, repackaged, or fabricated from older breaches.
- **Marketplace listings** for stolen data should be assessed for freshness, volume, and price — high-price exclusive listings suggest recent theft; bulk cheap listings suggest aged data.
- **PGP-signed content** provides the strongest attribution signal. A PGP key reused across platforms links dark-web and clear-web identities with high confidence.
- **Temporal patterns** (posting times, activity gaps) can correlate with time zones and cross-reference with clear-web activity patterns.

## Common false positives

- **Reposted data** presented as fresh. Old breach data is routinely repackaged and offered as new. Cross-reference dates against known breach disclosures.
- **Impersonation handles.** Forum handles are not authenticated by default; anyone can register a similar name. Require PGP key match or administrator confirmation.
- **Honeypot content.** Law-enforcement-operated or compromised sites may contain fabricated content designed to identify visitors. Behave as if every site is monitored.
- **AI-generated posts.** Increasingly, dark-web posts and leak claims are AI-generated for disruption or influence operations. Apply plausibility checks against known actor patterns.
- **Phishing mirrors.** Fake .onion addresses mimicking real forums and markets are common. Verify via PGP-signed URLs from trusted directories (e.g., Dread, dark.fail).
- **Reputational laundering.** Content planted by actors to implicate rivals or inflate their own reputation. Require independent corroboration.

## Anti-patterns

- **Browsing the dark web without Tor or with a non-hardened browser.** This exposes your real IP and browser fingerprint. Always use Tor Browser with JavaScript disabled.
- **Engaging with targets.** Contacting, messaging, or trading with dark-web actors crosses from OSINT into participation and creates criminal liability. Observe only.
- **Downloading files outside a sandbox.** Dark-web sites frequently host malware. Use an isolated VM with no shared folders and no network access beyond Tor.
- **Assuming absence of law-enforcement presence.** Many dark-web sites are monitored, compromised, or operated by law enforcement. Behave accordingly.
- **Treating dark-web intelligence as equivalent to clear-web intelligence.** Dark-web sources have lower reliability due to anonymity, reposting, and fabrication. Calibrate confidence accordingly.
- **Purchasing stolen data "for research."** This is a criminal offence in most jurisdictions and taints the entire investigation.
- **Ignoring CSAM protocol.** If you encounter child sexual abuse material, stop immediately. Do not screenshot. Possession is strict-liability in many jurisdictions. Follow your pre-established reporting protocol.
- **Publishing .onion URLs in reports without redaction.** Prevent casual access by redacting or replacing with descriptors (e.g., "a Tor-hosted cybercrime forum").

## Cross-references

- Ethics and OPSEC: ../../ethics/agent-opsec.md, ../../ethics/dark-web-opsec.md
- Pivot playbooks: ../pivot-playbooks/dark-web-to-clear-web.md, ../pivot-playbooks/handle-to-identity.md, ../pivot-playbooks/leak-to-breach.md
- Related domains: cryptocurrency.md, breach-data.md, social-media.md, threat-actors.md
- Tools: ../../tools/free-tools.yaml, ../../tools/apis.yaml, ../../tools/cli-tools.yaml
- Case studies: ../../case-studies/ransomware-leak-site-attribution.md, ../../case-studies/threat-actor-pivot.md