# Pivot Playbook: Cryptocurrency Wallet -> Fiat Offramp -> Identity

## Trigger

You have a cryptocurrency wallet address from any prior pivot — for example, an address pasted in a dark-web forum, an address listed in a ransom note, an address included in a breach-corpus `crypto` field, an address scraped from a Telegram channel, an address visible in a Twitter/X bio, or an address supplied directly by the user for due diligence. The wallet is the seed artifact; the goal of this playbook is to walk the on-chain transaction graph, identify counterparties (especially KYC'd exchanges that hold identity behind a legal process), document the on-chain trail as evidence, and surface any fiat offramp that ties the pseudonymous wallet to a real-world identity.

**Scope:** This playbook is investigative — it documents the on-chain trail, it does not break it. Chainhopping, mixers (Tornado Cash, Wasabi), and privacy coins (Monero) are described as obfuscation patterns to recognize, not techniques to defeat. If the trail goes cold at a mixer, that is the finding.

**Legal note:** Identifying the person behind a KYC'd exchange wallet requires legal process (subpoena, court order, MLAT request). The agent can identify which exchange holds the identity; the agent cannot retrieve the identity itself. Documenting the trail to the exchange's doorstep is the OSINT deliverable; obtaining the identity is a law-enforcement action outside OSINT scope.

## Inputs

- A cryptocurrency wallet address.
- The chain identifier (Bitcoin mainnet, Ethereum mainnet, Litecoin, etc.) — necessary because the same address format can exist on multiple chains.
- Optional: timestamp of the on-chain observation (affects which historical sources are most relevant).
- Optional: prior context — ransomware family, dark-web market, scam typology — informs which counterparty wallets to flag as malicious.
- API keys for: Etherscan (free tier sufficient), Blockchair (free tier), Blockchain.com (free), Chainalysis (paid, enterprise) if available.

## Step 1: Identify the chain and the wallet type

- **Tool:** Blockchair (multi-chain) — https://blockchair.com/api
- **Command:**
  ```bash
  curl -s "https://api.blockchair.com/{chain}/dashboards/address/{address}?transaction_details=true" \
    | jq '.data.{address} | {type, balance, received, spent, transaction_count, first_seen, last_seen}'
  ```
  Replace `{chain}` with `bitcoin`, `ethereum`, `litecoin`, `bitcoin-cash`, etc., as appropriate. The wallet type (P2PKH, P2SH, Bech32 for Bitcoin; EOA, contract for Ethereum) is auto-detected.
- **Expected output:** Wallet summary with type, total received, total spent, current balance, transaction count, and first/last seen timestamps.
- **Pivot point:** The transaction count and balance drive the next-step depth. A wallet with 50,000 transactions is likely an exchange hot wallet; a wallet with 5 transactions is likely a personal wallet. High-balance low-transaction wallets are typical ransomware payment addresses.

## Step 2: Pull the full transaction history

- **Tool:** Etherscan API (Ethereum) — https://docs.etherscan.io/, Blockchain.com API (Bitcoin) — https://www.blockchain.com/api
- **Command (Ethereum):**
  ```bash
  curl -s "https://api.etherscan.io/api?module=account&action=txlist&address=0xABC...&startblock=0&endblock=99999999&sort=asc&apikey=$ETHERSCAN_KEY" \
    | jq '.result[] | {blockNumber, timeStamp, from, to, value, hash, tokenName: .tokenName // "ETH"}'
  ```
  **Command (Bitcoin):**
  ```bash
  curl -s "https://blockchain.info/rawaddr/1ABC...?limit=200" \
    | jq '.txs[] | {time, inputs: [.inputs[].prev_out | {addr, value}], outputs: [.out[] | {addr, value}]}'
  ```
- **Expected output:** A list of transactions — inbound and outbound — with timestamps, counterparty addresses, and values.
- **Pivot point:** Each transaction has counterparties. Walk the graph: for each counterparty address, recursively apply Step 1 to determine whether it is a personal wallet, an exchange wallet, a mixer, or a known service. This graph-walk is the core of on-chain investigation.

## Step 3: Identify exchange and service wallets via known-address databases

- **Tool:** Etherscan Labels — https://etherscan.io/labels, Blockchain.com tags, Chainalysis Address Attribution (paid), OFAC Specially Designated Nationals (SDN) crypto-address list — https://sanctionssearch.ofac.treas.gov/.
- **Command:**
  ```bash
  # For Ethereum: query the Etherscan labels API for the address
  curl -s "https://api.etherscan.io/api?module=account&action=addresslabel&address=0xABC...&apikey=$ETHERSCAN_KEY" | jq .

  # For OFAC SDN crypto addresses (CSV download)
  curl -s "https://www.treasury.gov/ofac/downloads/sdn.csv" | grep -i "Digital Currency" | head -50
  ```
  Reference: the Etherscan Label Directory (`https://etherscan.io/labels`) lists known exchange hot wallets, bridge contracts, mixers, gambling services, and other categorized addresses.
- **Expected output:** A label (e.g., `Binance 14`, `Coinbase Deposit`, `Tornado Cash Router`, `Kraken Cold Wallet`) or a "no label" result.
- **Pivot point:** A labeled exchange wallet is the fiat-offramp pivot. When you find a transaction from the seed wallet to a `Coinbase Deposit` address, the trail reaches a KYC'd offramp — Coinbase knows who the seed-wallet owner is. Document this as the on-chain endpoint; do NOT attempt to obtain the identity from Coinbase (legal process required).

## Step 4: Walk the transaction graph to find counterparties

- **Tool:** None manual — graph traversal. Use Blockchair's `^` (correlations) endpoint or Chainalysis Reactor (paid) for visual graphing.
- **Command:**
  ```bash
  # For each counterparty in Step 2, recursively fetch their summary (Step 1)
  while read -r addr; do
    curl -s "https://api.blockchair.com/bitcoin/dashboards/address/${addr}" | jq '.data.${addr} | {type, balance, received, transaction_count}'
  done < counterparties.txt
  ```
- **Expected output:** A graph of wallet-to-wallet flows, each node annotated with wallet type, balance, and (if labeled) the service name.
- **Pivot point:** Identify the "sink" — the wallet that ultimately received the funds without further outbound transactions. This is often the cold-storage wallet of an exchange (KYC'd) or the final consolidation wallet of a malicious actor. Identify the "sources" — wallets that funded the seed wallet. Common source patterns: exchange-withdrawal wallets (KYC'd), mining-pool payout wallets (often labeled), and personal wallets (no label, low transaction count).

## Step 5: Recognize obfuscation patterns

- **Tool:** Pattern recognition on the transaction graph.
- **Command:** For each transaction, classify it as one of:
  - **Direct transfer:** seed -> counterparty (no obfuscation).
  - **Peeling chain:** large input split into many outputs over successive transactions (common Bitcoin money-laundering pattern).
  - **Mixer / CoinJoin:** transactions involving known mixers (Wasabi, Samourai Whirlpool, Tornado Cash). For Tornado Cash on Ethereum, the contract addresses are: `0x12D66f87A04A9E220743712cE6d9bB1B5616B8Fc` (100 ETH), `0x47CE0C6eD5B0Ce3d3A51fdb1C52DC66a7c3c2936` (10 ETH), `0x910Cbd523D972eb0a6f4cAe4618aD62622b39DbF` (1 ETH), `0xA160cdAB225685dA1d56aa342Ad8841c3b53f291` (0.1 ETH). Any funds routed through these contracts are obfuscated — the trail is effectively broken.
  - **Chainhopping:** BTC -> ETH via a cross-chain bridge (e.g., Thorchain, RenVM), then ETH -> XMR via a Monero swap. Chainhopping breaks the trail because the destination chain has no on-chain link to the source chain.
  - **Privacy coin:** any XMR (Monero) transaction is opaque by design — on-chain data does not reveal sender, receiver, or amount.
- **Expected output:** Each transaction tagged with its obfuscation status. The seed wallet's overall obfuscation profile: "direct transfers only", "routed through Tornado Cash on 2023-04-15", "chainhopped BTC->ETH->XMR", etc.
- **Pivot point:** The obfuscation pattern determines how far the trail can be walked. If the trail terminates at a mixer, the agent documents the termination point. The agent does NOT attempt to break the mixer (impossible without intelligence-grade capabilities that are out of OSINT scope).

## Step 6: Document the on-chain trail as evidence

- **Tool:** None — documentation step.
- **Command:** For each transaction in the trail, record:
  - Transaction hash
  - Block number and timestamp
  - From address, to address, value
  - Counterparty label (if known)
  - Source URL (Etherscan / Blockchain.com / Blockchair) for human verification
- **Expected output:** A structured on-chain evidence log, suitable for inclusion in an intelligence report or for handover to law enforcement.
- **Pivot point:** The evidence log is the deliverable. If the trail reaches a KYC'd exchange, the log entry should explicitly state: "Funds transferred to {exchange} at {timestamp}. {Exchange} holds subscriber identity behind legal process; identity recovery requires subpoena."

## Step 7: Compose the on-chain attribution narrative

- **Tool:** None — analysis step.
- **Command:** Build a structured narrative:
  - **Wallet characterization:** type, balance, transaction volume, first/last seen.
  - **Counterparty graph:** key counterparties with labels.
  - **Obfuscation profile:** direct, mixed, chainhopped, privacy-coin terminal.
  - **Fiat offramp identification:** if reached, name the exchange and date.
  - **OFAC / sanctions check:** is the wallet or any counterparty on the SDN list?
  - **Attribution:** name the actor if known from public threat-intel reports (ransomware groups often have known wallets cataloged by Chainalysis, TRM Labs, Elliptic).
  - **Confidence:** low/medium/high with reasoning.
- **Expected output:** A single-paragraph on-chain attribution narrative.
- **Pivot point:** The narrative is the deliverable. If the trail reaches a KYC'd exchange, the OSINT deliverable is complete — further identity recovery requires law-enforcement action.

## Anti-Patterns (what NOT to do)

- **Do not attempt to break a mixer.** Tornado Cash, Wasabi, Samourai Whirlpool, and similar mixers are designed to break transaction-graph analysis. The OSINT deliverable is documenting the mixer use; defeating the mixer is out of scope and may itself violate sanctions (Tornado Cash is OFAC-sanctioned as of 2022 — interacting with the contract is a sanctions violation for US persons).
- **Do not interact with the seed wallet or any counterparty wallet.** Sending test transactions to "see what happens" or to "provoke a response" is itself an on-chain action that may constitute tipping off the target. Observe only.
- **Do not assume that the wallet holder is the same person as the entity that funded the wallet.** Wallets change hands; addresses are reused; exchanges batch customer withdrawals into shared addresses. Attribution must follow the chain, not infer from co-occurrence.
- **Do not assume that an exchange-deposit address is the customer's wallet.** Exchange deposit addresses are often shared or cycled — multiple customers may use the same address. The exchange's internal ledger ties the address to the customer; on-chain data alone cannot.
- **Do not treat the OFAC SDN list as comprehensive.** Many malicious wallets are not yet sanctioned. A wallet not appearing on the SDN list is not "clear" — it is "not yet sanctioned."
- **Do not publish wallet addresses without context.** Wallet addresses are themselves personal data when tied to a known individual (GDPR applies to wallet-to-name mappings). Redact in any non-internal deliverable.
- **Do not rely on a single block explorer.** Etherscan, Blockchain.com, and Blockchair occasionally disagree on transaction attribution. Cross-reference at least two sources for any claim.
- **Do not attempt to identify the person behind a KYC'd exchange wallet by hacking the exchange or by social engineering exchange support.** Both are criminal. The exchange holds identity behind legal process; obtaining it without legal process is intrusion.
- **Do not conflate the seed wallet with the entity that controls it.** A single human may control many wallets; a single wallet may be co-controlled by many humans (multi-sig). Wallet-to-person attribution requires off-chain corroborating evidence, never on-chain data alone.
- **Do not publish unredacted transaction graphs that reveal victim payment addresses.** In ransomware cases, victim wallet addresses are themselves sensitive data — publishing them can tip off other criminals and embarrass the victim.

## Output Format

When you complete this pivot, report:

- **Seed wallet:** address, chain, wallet type, balance, transaction count, first/last seen
- **Transaction graph:** structured list of transactions with counterparties, values, timestamps
- **Counterparty labels:** each labeled counterparty with the labeling source
- **Obfuscation profile:** direct / mixed / chainhopped / privacy-coin-terminal, with the specific mixer or bridge if applicable
- **Fiat offramp reached:** exchange name, transaction hash, date — or "not reached"
- **OFAC / sanctions status:** each wallet and counterparty checked against SDN list
- **Public threat-intel attribution:** if the wallet is cited in any public Chainalysis / TRM Labs / Elliptic / Mandiant report
- **On-chain evidence log:** pointer to the structured transaction log
- **Attribution narrative:** 1-paragraph summary
- **Confidence:** low/medium/high with reasoning
- **Limitations:** mixer-termination, chainhopping gaps, exchange-internal-ledger invisibility

## Cross-references

- Related playbooks: [`ip-to-attribution.md`](ip-to-attribution.md) (when exchange IP is known), [`breach-to-credentials.md`](breach-to-credentials.md) (when breach-corpus contains crypto addresses), [`email-to-username.md`](email-to-username.md) (when exchange email is known)
- Tools used: [`../../tools/free-tools.yaml`](../../tools/free-tools.yaml) (Etherscan free tier, Blockchain.com, Blockchair free tier, OFAC SDN list), [`../../tools/apis.yaml`](../../tools/apis.yaml) (Chainalysis, TRM Labs, Elliptic — paid)
- Ethics: [`../../ethics/legal-frameworks.md`](../../ethics/legal-frameworks.md) (OFAC sanctions, GDPR wallet-to-name mapping), [`../../ethics/privacy-guidelines.md`](../../ethics/privacy-guidelines.md), [`../../ethics/anti-hallucination.md`](../../ethics/anti-hallucination.md)
