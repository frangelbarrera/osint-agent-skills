# Investigating Cryptocurrency

## What this domain covers

This guide covers the investigation of cryptocurrency addresses, transactions, and on-chain activity across major public-ledger blockchains — primarily Bitcoin (BTC), Ethereum (ETH), and Monero (XMR). It encompasses address identification and chain determination, balance and transaction-history analysis, transaction-graph mapping with clustering heuristics, exchange and service attribution, mixer/tumbler identification, chain-hopping analysis, and OSINT around cryptocurrency addresses. Key concepts include: Bitcoin's UTXO model (legacy P2PKH `1…`, P2SH `3…`, Bech32 `bc1…` addresses; common-input-ownership heuristic; change-address detection; address reuse), Ethereum's account model (smart contracts, ERC-20 tokens, gas mechanics, ENS names, Tornado Cash), Monero's privacy model (stealth addresses, ring signatures, RingCT), stablecoins (USDT, USDC, DAI), and advanced obfuscation techniques (CoinJoin via Wasabi/Samourai, peel chains, chainhopping BTC→XMR→BTC, cross-chain bridges). It does **not** cover de-anonymisation attacks against privacy protocols, exchange compromise, or any technique requiring private keys.

## When to use

- Tracing ransomware payments or stolen funds to a cash-out point.
- Identifying the exchange where a subject converted cryptocurrency to fiat (the KYC chokepoint).
- Screening a counterparty address for sanctions exposure (OFAC SDN).
- Profiling a threat actor's financial infrastructure from a known address.
- Verifying whether an address appears in breach data, dark-web markets, or public posts.
- Investigating a scam or fraud where cryptocurrency was the payment vector.

## Tools

| Tool | Use case | Cost |
|---|---|---|
| Blockchain.com Explorer | BTC address and transaction lookup | Free |
| Blockchair | Multi-chain explorer and API | Freemium |
| Etherscan | ETH address, contract, and transaction lookup | Freemium |
| Blockscout | EVM-compatible chain explorer | Free |
| OXT Research | BTC address clustering and analytics | Free |
| Chainabuse | Community illicit-activity reports | Free |
| Bitcoin Abuse | Community illicit-activity reports | Free |
| Maltego + Blockchain transforms | Graph-based address and cluster analysis | Freemium |
| GraphSense | Open-source blockchain analytics | Free |
| Chainalysis Reactor | Professional attribution and tracing | Paid |
| Elliptic Investigator | Professional attribution and tracing | Paid |
| TRM Labs | Professional attribution with DeFi coverage | Paid |
| OFAC SDN list | Sanctions screening (includes crypto addresses) | Free |
| IntelX | Paste-site and dark-web address search | Freemium |

## Procedure

1. **Address discovery.** Identify the cryptocurrency address from the source material: ransom note, dark-web market listing, forum post, breach data, transaction record, or OSINT. Record the exact address string and the source context.
2. **Chain and format determination.** Use format heuristics: BTC starts `1`, `3`, or `bc1`; ETH starts `0x` (42 hex chars); Monero starts `4` or `8` (95 chars); Litecoin starts `L`, `M`, or `ltc1`; Tron starts `T` (34 chars). Confirm with a multi-chain explorer (Blockchair) if ambiguous.
3. **Balance check.** Query the chain-specific explorer for current balance, total received, total sent, first-seen date, and last-active date. Record all values with their query timestamps.
4. **Transaction-graph mapping.** Pull the full transaction history. For UTXO chains (BTC), map inputs and outputs for each transaction. For account chains (ETH), map counterparty addresses, internal transactions, and token transfers. Note gas patterns and contract interactions on ETH.
5. **Cluster identification.** On UTXO chains, apply the common-input-ownership heuristic: addresses that appear as inputs in the same transaction are presumed co-controlled. Supplement with address-reuse detection and change-address heuristics. Flag CoinJoin transactions — they intentionally violate this heuristic and must not be clustered. Tools: OXT, Maltego, GraphSense.
6. **Counterparty attribution.** Label each significant counterparty using attribution databases: exchanges (Binance, Coinbase, Kraken, OKX), payment processors, gambling services, mixers (Tornado Cash contract `0x12D66f87A04A9E220743712cE6d9bB1B5616B8Fc`, ChipMixer, Wasabi CoinJoin), dark-net markets, ransomware wallets, scam addresses. Free sources: Chainabuse, Bitcoin Abuse, Etherscan labels, OFAC SDN. Paid: Chainalysis, Elliptic, TRM.
7. **Exchange and KYC-chokepoint identification.** Identify the exchange or regulated service where funds were cashed out to fiat or where they originated from fiat. This is the point where legal process (subpoena, MLAT) can identify the user. Document the transaction hash, timestamp, counterparty address, and exchange name. Do not attempt to obtain KYC data through non-legal channels.
8. **Mixer and chain-hopping analysis.** Flag any interaction with: Tornado Cash (ETH), Wasabi CoinJoin (BTC), Samourai Whirlpool (BTC), ChipMixer (BTC, seized 2023), or cross-chain bridges (RenVM, Thorchain, LayerZero). Document entry and exit points, amounts, and timing. After a mixer, deterministic attribution is generally not possible from the chain alone — pivot to OSINT.
9. **OSINT around the address.** Search for the address in: Google (quoted: `"bc1q…"` or `"0x…"`), Reddit, Twitter/X, Telegram public channels, paste sites (via IntelX), dark-web indexes (Ahmia, Torch), GitHub code search, breach data, and social-media tip jars. Check for ENS names, NFT collections, and on-chain identity (Lens Protocol, Unstoppable Domains).
10. **Sanctions screening.** Check the address against OFAC SDN (including the SDN digital currency addresses list), EU consolidated sanctions, and UK OFSI. A match is a hard legal finding — transacting with a sanctioned address is itself a violation in US jurisdiction.
11. **Document traceability limits.** If funds enter Monero, a shielded Zcash pool, or a mixer with no observable exit, state this explicitly. The chain-analysis investigation has reached its limit.
12. **Report and handoff.** Package evidence (transaction hashes, timestamps, exchange identification, attribution labels) for legal counsel or law enforcement where a KYC chokepoint has been identified.

## Interpreting results

- **Clustering results** represent probabilistic, not deterministic, attribution. The common-input-ownership heuristic holds for most transactions but fails for CoinJoin and some multi-signature setups. State confidence levels.
- **Exchange labels** indicate the funds moved to/from an exchange but do not identify the individual user. The exchange holds KYC records accessible only via legal process.
- **Mixer interaction** is a strong obfuscation flag but is not proof of illicit activity. Mixers have legitimate privacy uses. Treat as a flag requiring further investigation, not as conclusive evidence.
- **Dormant addresses** suddenly activating may indicate a hack, a long-term holder moving funds, or an operational security failure. Correlate with external events.
- **Temporal patterns** (burst activity, regular intervals, time-of-day patterns) can suggest automation, geographic time zones, or correlation with specific events.
- **Small test transactions** ("dusting") before a large transfer may indicate wallet software checks or, in some cases, intentional dusting attacks designed to de-anonymize.

## Common false positives

- **Address reuse by multiple parties.** Donation addresses and exchange deposit addresses are used by many people. Do not assume an address maps to one actor without clustering.
- **Exchange deposit-address confusion.** Per-user deposit addresses flow into exchange hot wallets. A deposit to a Coinbase deposit address is a user depositing, not a transaction with Coinbase itself.
- **CoinJoin misattribution.** CoinJoin transactions have many participants; the common-input-ownership heuristic deliberately fails. Do not cluster CoinJoin inputs together.
- **Stale attribution labels.** Exchange addresses are sometimes rotated; old labels may be wrong. Cross-reference multiple attribution sources and check recency.
- **Monero "traceability" claims.** Some commercial tools claim partial Monero traceability via heuristics (e.g., output guessing, ring-member elimination). These are probabilistic and contested — do not present them as deterministic.
- **Bridge and swap conflation.** Cross-chain bridges aggregate funds from many users. A bridge transaction does not mean the counterparty is the bridge operator; it means funds moved across chains.
- **Dusting transactions.** Tiny unsolicited deposits to an address (dusting attacks) are designed to link addresses in clustering. Do not treat dust outputs as evidence of common control.

## Anti-patterns

- **Sending test transactions to investigated addresses.** If the address is sanctioned, this is a sanctions violation. Never interact with investigated addresses.
- **Treating mixer use as proof of crime.** Mixers have legitimate privacy uses. Document the interaction; investigate further; do not conclude illicit intent from mixing alone.
- **Presenting Monero trace results as deterministic.** Monero's privacy model defeats standard chain analysis. Be honest about traceability limits.
- **Assuming address = identity.** A single address may be controlled by multiple people (shared wallet, exchange) or one person may control many addresses (HD wallet). Cluster before attributing.
- **Ignoring time zones in block timestamps.** Block timestamps are epoch time; explorer displays use browser-local time. Always record epoch time alongside displayed times.
- **Publishing a person's name as the controller of an address without multiple independent evidence sources.** Clustering evidence + OSINT corroboration + legal review are required before external attribution.
- **Querying a sanctioned address via a paid API without checking terms of service.** Some commercial tools may flag your account for querying SDN-listed addresses. Be aware of your tool's policies.

## Cross-references

- Pivot playbooks: ../pivot-playbooks/crypto-to-fiat.md, ../pivot-playbooks/address-to-exchange.md, ../pivot-playbooks/breach-to-credentials.md
- Related domains: dark-web.md, breach-data.md, threat-actors.md
- Ethics: ../../ethics/sanctions-screening.md, ../../ethics/attribution-responsibility.md, ../../ethics/personal-data.md
- Tools: ../../tools/free-tools.yaml, ../../tools/apis.yaml, ../../tools/cli-tools.yaml
- Case studies: ../../case-studies/ransomware-trace.md, ../../case-studies/exchange-chokepoint-attribution.md