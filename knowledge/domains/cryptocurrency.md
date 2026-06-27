# Investigating Cryptocurrency

## Scope
This guide covers the investigation of cryptocurrency wallets, addresses, and transactions for the major public-chain cryptocurrencies — primarily Bitcoin (BTC), Ethereum (ETH), and other UTXO or account-based chains with public ledgers. It applies to fraud investigators tracing stolen funds, ransomware analysts, journalists following money, and compliance teams screening counterparties. It covers blockchain-explorer analysis, transaction-graph mapping, exchange and service identification, OSINT around the address, and the limits of traceability for privacy coins (notably Monero). It does **not** cover de-anonymisation attacks against privacy protocols, exploitation of exchange vulnerabilities, Sybil attacks, or any technique requiring access to private keys or compromise of custodial systems. Where the investigation may identify a natural person, GDPR and equivalent regimes apply to the output even though the blockchain itself is public.

## Key questions to answer
- What is the address's native chain, format, and derivation path (where relevant)?
- What is the address's balance and transaction history?
- What entities has the address transacted with — other private wallets, exchanges, mixers, gambling services, dark-net markets?
- Can the address be clustered with other addresses under common control (UTXO chains)?
- What is the exchange or service at the cash-out chokepoint, where a legal process could identify the user?
- Is the address associated with known illicit activity — ransomware, scam, hack, dark-net market, terrorist financing?
- What OSINT exists around the address — was it posted on a forum, a ransom note, a dark-web market listing, a GitHub commit, a Twitter tip jar, a Patreon-style support page?
- Is the address associated with a named NFT collection, ENS name, or on-chain identity?
- What is the temporal pattern — long-dormant, active daily, burst pattern consistent with a specific event?
- What are the limits of traceability — has the funds flow entered a privacy chain, a mixer, or a chain-hopping bridge?

## Data categories
### Category 1: Address identification and chain determination
First, determine the chain. Address-format heuristics:
- **Bitcoin**: starts `1`, `3`, or `bc1` (legacy P2PKH, P2SH, or Bech32 SegWit).
- **Ethereum**: 42 hex characters starting `0x`.
- **Monero**: starts `4` or `8`, 95 characters.
- **Litecoin**: starts `L`, `M`, or `ltc1`.
- **Solana**: base58, 32–44 characters.
- **Tron**: starts `T`, 34 characters.
Where ambiguous, query a multi-chain explorer (Blockchair, Chainalysis, or the chain-specific explorer). Record the chain, the address, and the address type (e.g., BTC SegWit vs Taproot).

### Category 2: Balance and transaction history
Chain-specific explorers: Blockchain.com (BTC), Etherscan (ETH), Blockchair (multi-chain), Blockscout (EVM-compatible), Solscan (Solana), Tronscan (Tron). For a complete transaction history including mempool and internal transactions, Etherscan is the canonical ETH source; for BTC, the OXT research platform and Glassnode provide deeper analytics. Record: first-seen date, last-seen date, total received, total sent, current balance, and a chronological transaction list.

### Category 3: Transaction-graph analysis
For UTXO chains (BTC, LTC), common-input-ownership heuristic: when two or more inputs are spent in the same transaction, they are presumed controlled by the same entity. Apply with caution — coinjoin transactions intentionally violate this heuristic. For account-based chains (ETH), there is no input-clustering analogue; you trace by direct counterparty. Visualisation tools: Maltego (with chain-abuse transforms), GraphSense, OXT, Chainalysis Reactor (paid), Elliptic Investigator (paid), TRM Labs (paid). For free/open work, Maltego CE with the Blockchain transform pack and GraphSense's public deployment are the entry points.

### Category 4: Exchange and service identification
Address attribution databases label known service addresses: exchanges (Binance, Coinbase, Kraken, OKX, etc.), payment processors (BitPay, MoonPay), gambling services, mixers (Tornado Cash, ChipMixer, Wasabi CoinJoin), dark-net markets, ransomware affiliate wallets, scam-collections. Free sources: Chainabuse (community reports), Bitcoin Abuse (community), Etherscan's labels, OFAC SDN cryptocurrency addresses. Paid: Chainalysis, Elliptic, TRM. The label is the pivot to the legal chokepoint — an exchange with KYC records is the point at which a subpoena or MLAT can identify the user.

### Category 5: KYC chokepoints
You can identify the exchange that holds the user's KYC records. You cannot identify the user without legal process served on that exchange. The investigator's job here is to (a) identify the chokepoint, (b) document the transaction hash and timestamp of the cash-out, and (c) hand the package to counsel or law enforcement for legal process. Do not attempt to obtain KYC data yourself through any non-legal channel.

### Category 6: Chain-hopping and mixers
Chain-hopping — moving funds across chains via bridges (e.g., BTC → ETH via RenVM or Thorchain, ETH → XMR via a swap service) — is a common obfuscation technique. Mixer use — Tornado Cash (ETH), ChipMixer (BTC, seized 2023), Wasabi CoinJoin (BTC), Samourai Whirlpool (BTC, indicted 2024) — further obscures trace. Document the entry and exit points of each mixer interaction. After a mixer, deterministic attribution is generally not possible from the chain alone; OSINT around the actor becomes essential.

### Category 7: OSINT around the address
This is often the most productive category. The address was likely posted somewhere by the actor: a ransom note, a dark-web market listing, a forum signature, a Twitter tip-jar, a GitHub donation line, a Patreon-style support page, a YouTube video description, a Telegram channel, a paste site, a leak site. Search:
- Google with quoted address: `"bc1q..."` or `"0x..."`.
- Reddit, Twitter/X, Telegram public channels.
- Paste sites (Pastebin, Ghostbin, hastebin) — search via IntelX or Google site search.
- Dark-web indexes (Ahmia, Torch) for onion-service mentions.
- GitHub code search for the address (a developer may have committed a donation address).
- Breach data and leak forums for the address.

### Category 8: NFT and on-chain identity
On Ethereum, ENS names resolve to addresses and are public. A `vitalik.eth` ENS name publicly maps to an address. Reverse-resolution may also be set. NFT collections and on-chain identity systems (Lens Protocol, ENS, Unstoppable Domains) may link an address to a handle. Use Etherscan's "More Info" panel and the ENS reverse-records contract.

### Category 9: Privacy-coin limitations
Monero (XMR) is private by default. Transaction graph analysis is not possible from the public chain. The only OSINT avenues for Monero are (a) the address posted somewhere, (b) exchange KYC records at the on/off-ramp, (c) any operational-security failure by the actor (reused address, timestamped disclosure). Zcash shielded transactions similarly defeat chain analysis; only the unshielded pool is observable. Document privacy-coin exposure as a hard limit on traceability.

## Canonical tools
| Tool | Use case | Free/Paid |
|---|---|---|
| Blockchain.com Explorer | BTC address and transaction lookup | Free |
| Etherscan | ETH address and transaction lookup | Freemium |
| Blockchair | Multi-chain explorer + API | Freemium |
| OXT Research | BTC address clustering | Free |
| Chainabuse | Community illicit-activity reports | Free |
| Bitcoin Abuse | Community illicit-activity reports | Free |
| Maltego + Blockchain transforms | Graph analysis | Freemium |
| GraphSense | Open-source analytics platform | Free |
| Chainalysis Reactor | Professional attribution | Paid |
| Elliptic Investigator | Professional attribution | Paid |
| TRM Labs | Professional attribution + DeFi | Paid |
| ENS / Unstoppable Domains lookup | On-chain identity | Free |
| OFAC SDN list | Sanctions screening (includes crypto addresses) | Free |
| IntelX | Paste-site and dark-web address search | Freemium |

## Methodology
1. **Identify the chain and address format.** Use the format heuristics; confirm with a multi-chain explorer.
2. **Pull balance and transaction history.** Record first-seen, last-seen, totals, and the full chronological transaction list.
3. **Apply clustering** (UTXO chains). Identify the cluster of co-controlled addresses; treat the cluster as the unit of investigation, not the single address.
4. **Identify counterparties.** For each significant transaction, identify the counterparty: exchange, mixer, market, another cluster. Use attribution databases.
5. **Map to the chokepoint.** Identify the exchange or KYC'd service that holds the user's identity. Document the transaction hash, timestamp, and counterparty address.
6. **Check for chain-hopping and mixing.** Flag any bridge, swap, or mixer interaction. Document entry and exit points.
7. **OSINT around the address.** Search engines, paste sites, dark-web indexes, GitHub, social media, breach data.
8. **Check on-chain identity.** ENS, NFT collections, on-chain identity protocols.
9. **Sanctions screening.** OFAC SDN (including the SDN digital currency addresses list), EU consolidated, UK OFSI. A match is a hard legal finding.
10. **Document the traceability limit.** If the funds flow enters Monero, a shielded Zcash pool, or a mixer with no observable exit, document this explicitly. The investigation has reached its chain-analysis limit.
11. **Hand off for legal process.** Where a KYC chokepoint has been identified, package the evidence (transaction hashes, timestamps, exchange name, abuse contact) for counsel or law enforcement.
12. **Capture and timestamp** every artefact per the report template.

## Common pitfalls
- **Address reuse conflation.** A single Bitcoin address can be used by many people over time (donation addresses, exchange deposit addresses). Do not assume an address maps to one actor without clustering.
- **Exchange deposit-address confusion.** Exchanges use per-user deposit addresses that flow into hot wallets. A deposit to a Coinbase deposit address is not a transaction with Coinbase's main wallet; it is a user depositing to Coinbase.
- **Coinjoin misattribution.** Coinjoin transactions have many participants; the common-input-ownership heuristic fails. Do not cluster coinjoin inputs.
- **Mixer exit timing.** Mixers may delay outputs by hours, days, or weeks. The exit transaction is not temporally adjacent to the entry.
- **Chain-hopping fee burn.** Bridging across chains burns value in fees and slippage. Track the actual value flow, not just the address trail.
- **Stale labels.** Exchange addresses are sometimes rotated; old attribution labels may be wrong. Cross-reference multiple attribution sources.
- **Privacy-coin overconfidence.** Some commercial tools claim partial Monero traceability via heuristics; these are probabilistic and contested. Do not present Monero trace results as deterministic.
- **OFAC SDN address scope.** SDN-listed addresses are blocked-property; transacting with them is itself a sanctions violation in US jurisdiction. Confirm a match before any further interaction with the address.
- **Tornado Cash sanction aftermath.** Tornado Cash was sanctioned by OFAC (2022) and delisted by a court (2024). The legal status of historical Tornado Cash interaction remains complex; consult counsel before characterising.
- **Time-zone confusion.** Block timestamps are in epoch time; explorer displays are in your browser's time zone. Always record epoch time alongside any displayed time.

## Ethical considerations
- **Public chain, private user.** The blockchain is public; the user's identity is not. Inferring identity from on-chain data combined with OSINT produces personal data subject to GDPR/equivalent regimes.
- **Sanctions exposure.** Investigating a sanctioned address — even by querying public explorers — does not violate sanctions. Transacting with one does. Be aware of the line; consult counsel for grey areas.
- **No "test" transactions.** Sending a micro-transaction to an address to confirm receipt is a transaction. If the address is sanctioned or otherwise restricted, this is a violation. Do not interact with investigated addresses.
- **Exchange KYC limits.** You can identify the exchange; you cannot obtain KYC data without legal process. Any non-legal-channel attempt to obtain KYC data is a criminal offence in most jurisdictions.
- **Attribution responsibility.** Naming a natural person as the controller of an address is a serious attribution. Require (a) clustering evidence, (b) OSINT corroboration, (c) a clear evidence chain, and (d) legal review before any external communication.
- **Ransomware payment ethics.** If investigating a ransomware payment, be aware that some jurisdictions (OFAC, NCSC guidance) prohibit or discourage payment to sanctioned actors. The investigator's role is to document, not to facilitate.
- **Privacy-coin respect.** Use of a privacy coin is legal and is a legitimate choice. Do not imply wrongdoing from privacy-coin use alone.
- **Scam-victim identification.** Tracing a scam may identify victims. Victim identity is sensitive; handle with care and avoid re-traumatising through outreach.
- **Mixer legitimate use.** Coinjoin and mixers have legitimate privacy uses. Do not treat mixer interaction as proof of illicit activity; treat as a flag requiring further investigation.

## Output
Produce a cryptocurrency trace report using the template at ../../templates/reports/crypto-trace.md. The report must include: address identification, balance and transaction-history summary, clustering results (UTXO chains), counterparty attribution table, chokepoint identification, chain-hopping/mixer table, OSINT findings, on-chain-identity findings, sanctions-screening result, traceability-limit statement, confidence-scored assertions, evidence package for legal handoff (where applicable), and a sources appendix.

## Cross-references
- Pivot playbooks: ../pivot-playbooks/address-to-exchange.md, ../pivot-playbooks/address-to-osint.md, ../pivot-playbooks/breach-to-crypto.md
- Tools: ../../tools/free-tools.yaml, ../../tools/apis.yaml, ../../tools/cli-tools.yaml
- Ethics: ../../ethics/sanctions-screening.md, ../../ethics/attribution-responsibility.md, ../../ethics/personal-data.md
- Case studies: ../../case-studies/ransomware-trace.md, ../../case-studies/exchange-chokepoint-attribution.md
