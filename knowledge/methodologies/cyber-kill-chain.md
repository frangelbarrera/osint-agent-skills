# The Cyber Kill Chain as a Defensive OSINT Framework

Lockheed Martin's Cyber Kill Chain describes the stages of a network intrusion from the adversary's perspective: Reconnaissance, Weaponization, Delivery, Exploitation, Installation, Command and Control (C2), and Actions on Objectives. The model was published in 2011 as a way to structure intrusion detection and response. For the OSINT investigator, the value of the kill chain is defensive and retrospective — it provides a vocabulary for mapping externally observable adversary artifacts to a phase of the attack lifecycle, which in turn suggests where to look for additional indicators and what mitigations to recommend.

This file is not a primer on incident response. It is a guide to using the kill chain as a structuring device for OSINT findings about adversary infrastructure, tooling, and behavior.

## Phase-by-phase OSINT indicators

### Reconnaissance
The adversary is selecting a target and gathering information. Externally observable indicators an OSINT investigator might find:
- Subdomain enumeration traffic against the target's domain visible in passive DNS (e.g., VirusTotal passive DNS, SecurityTrails).
- Google dorks cached in search-engine query logs or attacker-tool user agents appearing in the target's web server logs after disclosure.
- LinkedIn or GitHub scraping patterns — sudden bursts of profile views from a single ASN, or a brand-new GitHub account cloning the target's repositories in the days before a phishing run.

### Weaponization
The adversary couples an exploit to a delivery vehicle. This phase is largely internal to the adversary and produces few externally observable artifacts, but OSINT investigators sometimes find:
- Weaponized document templates sold on criminal forums and recovered through dark-web monitoring.
- Build artifacts of phishing kits appearing on GitHub or Paste sites before deployment.
- Compiled loaders or droppers with compile timestamps and PDB paths visible in the binary metadata, leaked to VirusTotal by a third party.

### Delivery
The adversary transmits the weapon to the target. OSINT indicators:
- Phishing domains registered days or hours before the campaign, discoverable through WHOIS history and certificate transparency logs (see `../techniques/ct-logs.md`).
- URLs submitted to urlscan.io by victims or researchers, with the full DOM and screenshot captured.
- Bulk email sending infrastructure — newly created SPF/DKIM records, or compromise of an existing ESP.

### Exploitation
The weapon executes on the target's system. Externally observable:
- Exploit attempts visible in the target's web server logs (e.g., CVE-specific URI patterns).
- Public vulnerability disclosures (CVE records, CISA advisories) that, when correlated with delivery timing, explain how exploitation succeeded.
- Posts on criminal forums offering "logs" or access to a specific organization, time-stamped to shortly after exploitation.

### Installation
The adversary establishes persistence. OSINT indicators:
- Backdoor binaries uploaded to VirusTotal with the target organization's name in the filename or compile path.
- New scheduled tasks or services documented in incident reports published by the victim or by a researcher.
- Modified web shells appearing under the target's domain in Wayback Machine snapshots (see `../techniques/wayback.md`).

### Command and Control
The adversary establishes a channel to control the compromised system. OSINT indicators:
- C2 domains with suspicious registration patterns (recently registered, privacy-proxied WHOIS, hosting on bulletproof providers).
- C2 infrastructure fingerprinted through Shodan banners, JA3/JA3S hashes, or HTTP response headers (see `../techniques/shodan.md`).
- Shared C2 infrastructure across multiple intrusions — same IP or domain appearing in published threat reports from multiple vendors.

### Actions on Objectives
The adversary achieves their goal — data theft, extortion, disruption. OSINT indicators:
- Stolen data advertised on leak sites or data-theft forums.
- Ransom notes published to the victim's domain or to attacker-controlled press outlets.
- Public statements by the victim acknowledging the incident, time-stamped and citable.

## Using the kill chain in an OSINT report

When reporting on adversary infrastructure, structure findings by kill-chain phase. This serves two purposes: it forces the investigator to ask "what phase does this artifact illuminate?" rather than dumping indicators, and it gives the reader a mental map for predicting where additional indicators might exist. A finding labeled "Delivery" suggests the reader should look for "Exploitation" artifacts next; a finding labeled "C2" suggests hunting for "Installation" artifacts in endpoint telemetry the OSINT investigator cannot see but the reader can.

## Limitations and criticisms

The kill chain has been criticized on several grounds, and OSINT investigators should know the criticisms before adopting the model uncritically.

- **It models network intrusion, not cloud-native attack.** The model assumes an endpoint-centric adversary. In cloud environments, exploitation and C2 can collapse into a single API call using stolen credentials. Phases blur, and forcing cloud incidents into the seven-stage template misleads readers.
- **It is linear.** Real adversaries loop — they re-reconnoiter after initial access, they pivot through multiple delivery vectors, they return to earlier phases when detection forces re-tooling. The kill chain's linearity underrepresents this.
- **It is adversary-centric and inward-looking.** MITRE ATT&CK (see `mitre-attack-mapping.md`) and the Unified Kill Chain address several of these weaknesses by modeling adversary behavior as tactics and techniques that can repeat and interleave.
- **It under-models non-technical objectives.** "Actions on Objectives" is a single phase, but the objective itself — influence operations, financial fraud, harassment — often has its own multi-stage structure that the kill chain does not capture.

The pragmatic stance: use the kill chain as a presentation scaffold when the investigation is clearly a network intrusion with a traditional perimeter, and reach for ATT&CK when the adversary's behavior is better described as interleaved tactics. When the investigation is not a cyber intrusion at all (e.g., attribution of a disinformation campaign), use Bellingcat's methodology (`bellingcat-methodology.md`) instead.
