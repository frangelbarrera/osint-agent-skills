# Pivot Playbook: Email -> Username

## Trigger

You have found an email address during collection — for example, scraped from a web page, exposed in a breach corpus, present in document metadata, recovered from a DNS TXT record (`SPF`/`DMARC` reporting address), or supplied directly by the requesting user. The email is the seed artifact; the goal of this playbook is to enumerate every platform where that email is registered, extract any associated username, and prepare that username set for the next-stage identity pivot.

Activate this playbook only when you have at least one validated email (RFC 5322 compliant and confirmed to have an MX-capable domain). Do not run this playbook against emails that appear only in honeytokens or known-fake placeholder addresses without flagging the low confidence.

## Inputs

- A single email address (e.g., `target@example.com`).
- Optional context: where the email was found (URL, document filename, breach name, sender header).
- A working network egress that allows outbound HTTPS to standard OSINT endpoints. Some tools (holehe) require direct connections to the target sites' password-reset endpoints and will fail behind restrictive egress proxies.
- Local install of `holehe` (via `pipx`) for registered-site enumeration.
- API key for Have I Been Pwned (HIBP) if breach enrichment is desired.
- Optional: an `EPIEOS`/`epieos.com` session for Skype/Microsoft account lookups.

## Step 1: Confirm the email is deliverable and enumerate registered sites with holehe

- **Tool:** holehe — https://github.com/megadose/holehe (CLI install via `pipx install holehe`)
- **Command:**
  ```bash
  holehe target@example.com --only-used --timeout 30
  ```
- **Expected output:** A list of 120+ websites checked, with `[+]` markers next to sites where the email is registered (determined by examining password-reset endpoints). Sites that responded with non-committal codes are filtered out by `--only-used`.
- **Pivot point:** Each `[+]` line typically exposes the platform name (e.g., `github.com`, `adobe.com`, `spotify.com`). Some entries include the on-platform username, account creation date, or partial profile data. Capture all of these as candidate usernames.

## Step 2: Confirm breach participation and extract breached usernames with HIBP

- **Tool:** Have I Been Pwned API — https://haveibeenpwned.com/API/v3
- **Command:**
  ```bash
  curl -s -H "hibp-api-key: $HIBP_KEY" \
       -H "user-agent: osint-agent-skills" \
       "https://haveibeenpwned.com/api/v3/breachedaccount/target@example.com?truncateResponse=false"
  ```
- **Expected output:** JSON array of breach objects. Each breach includes `Name`, `BreachDate`, `DataClasses` (e.g., `Emails`, `Usernames`, `Passwords`, `IP addresses`), and the verified `Username` associated with the email in that breach.
- **Pivot point:** The `Username` field is the single most valuable artifact — it is the on-platform handle the target chose for that breached service. Collect the unique set across all breaches; these are high-confidence usernames because they were confirmed at breach time.

## Step 3: Resolve Gravatar profile from the email hash

- **Tool:** Gravatar API — https://gravatar.com/site/implement/
- **Command:**
  ```bash
  EMAIL="target@example.com"
  HASH=$(printf "%s" "$EMAIL" | tr '[:upper:]' '[:lower:]' | sha256sum | cut -d' ' -f1)
  curl -s "https://gravatar.com/${HASH}.json" | jq .
  ```
  Note: older Gravatar profiles use MD5; if SHA256 returns nothing, retry with `printf "%s" "$EMAIL" | tr '[:upper:]' '[:lower:]' | md5sum | cut -d' ' -f1`.
- **Expected output:** A JSON `entry` array containing `displayName`, `preferredUsername`, `name`, `aboutMe`, `currentLocation`, `thumbnailUrl`, and any linked accounts (`accounts` array with `url` and `username`).
- **Pivot point:** `preferredUsername` and the `accounts[].username` array frequently surface handles that the target has explicitly linked to their primary identity — these are high-confidence pivots.

## Step 4: Run Google dorks for the email in quotes

- **Tool:** Google web search — https://www.google.com/
- **Command (search operators, run as separate queries):**
  ```
  "target@example.com"
  "target@example.com" site:linkedin.com
  "target@example.com" site:github.com
  "target@example.com" site:reddit.com
  "target@example.com" site:twitter.com OR site:x.com
  "target@example.com" filetype:pdf OR filetype:docx OR filetype:xlsx
  ```
- **Expected output:** Indexed pages where the email appears verbatim. Common sources: conference speaker bios, academic paper author bylines, GitHub commit metadata, leaked paste sites, GitHub `*.rst`/`*.md` files, and forum profile pages.
- **Pivot point:** Each hit may expose a contextual username (forum handle, GitHub login, Reddit user). Capture the URL plus the surrounding text snippet for evidence.

## Step 5: Search GitHub commit history for the email

- **Tool:** GitHub code search — https://github.com/search
- **Command:** In the GitHub web UI, run `"%target@example.com%"` (with the quotes) under the "Commits" tab. Equivalent API call:
  ```bash
  curl -s -H "Accept: application/vnd.github+json" \
       "https://api.github.com/search/commits?q=target%40example.com" \
       | jq '.items[] | {repo: .repository.full_name, author: .commit.author.name, sha: .sha}'
  ```
- **Expected output:** Commits whose author or committer email is the target. Each commit reveals the git author name (often a real name or pseudonym) and the repository slug, which gives you a GitHub username.
- **Pivot point:** The `repository.owner.login` is the GitHub username controlling the repo. Even if the target was only a contributor, the repo owner's identity can be cross-pivoted.

## Step 6: Probe Microsoft / Skype presence with EPIEOS

- **Tool:** EPIEOS — https://epieos.com/ (web UI) or `epieos` CLI
- **Command (web):** Submit the email at `https://epieos.com/?q=target@example.com` and review the Microsoft account section. Equivalent API (subject to change — verify endpoint before use):
  ```bash
  curl -s "https://epieos.com/api/query/epieos-email?key=$EPIEOS_KEY&email=target@example.com" | jq .
  ```
- **Expected output:** A structured report indicating whether the email is linked to a Microsoft account, the Skype username, Skype avatar URL, and any linked Microsoft services (Xbox, OneDrive, Office 365).
- **Pivot point:** The Skype username is the highest-value artifact here; Skype handles are frequently reused on other Microsoft properties and on third-party platforms. The avatar URL feeds the reverse-image-search pivot in `username-to-identity.md`.

## Step 7: Aggregate, deduplicate, and prioritize the username set

- **Tool:** None — analysis step.
- **Command:** Manual aggregation. Build a table:

  | Source | Username | Confidence | Evidence URL |
  |---|---|---|---|
  | HIBP breach `Adobe` | jdoe88 | high | breach record |
  | Gravatar `accounts[]` | johndoe | high | gravatar profile JSON |
  | GitHub commits | j-doe | high | commit SHA `abc123` |
  | holehe `spotify.com` | jdoe88 | medium | holehe `[+]` line |

- **Expected output:** A deduplicated username list with confidence ratings.
- **Pivot point:** This set is the input to the next playbook (`username-to-identity.md`). Group usernames by string similarity (Levenshtein distance, common numeric suffixes) — clusters of similar usernames usually indicate one human.

## Anti-Patterns (what NOT to do)

- **Do not assume that a `[+]` from holehe is 100% accurate.** Holehe relies on differential responses from password-reset endpoints; some sites return ambiguous responses that the tool classifies as registered. Cross-verify any high-stakes claim by visiting the site's password-reset page manually.
- **Do not run holehe at high concurrency without rate limiting.** Many sites will block your IP and you will lose data. Use the default throttling.
- **Do not test-login to any site using the email and guessed passwords.** That crosses from OSINT into intrusion (CFAA in the US, CMA in the UK, and equivalents elsewhere). See `ethics/legal-frameworks.md`.
- **Do not infer identity from a username string alone.** "jdoe88" appears on many platforms owned by many different John Does. Identical strings are a hypothesis, not a finding. See the anti-patterns section of `username-to-identity.md`.
- **Do not rely solely on HIBP's `truncateResponse=true`.** The truncated response only returns breach names; the full response is required to extract the per-breach `Username` field that powers this playbook.
- **Do not skip the Gravatar step.** Even when Gravatar returns nothing, the negative result is informative — the target has not linked a Gravatar to that email, which narrows the profile.
- **Do not paste the email into random "email lookup" websites.** Many such sites are themselves data-harvesting operations that will add the email to spam lists or sell it. Stick to the tools listed in `tools/free-tools.yaml` and `tools/apis.yaml`.

## Output Format

When you complete this pivot, report:

- **Seed email:** (the input email)
- **Validated deliverable:** yes/no (MX lookup result)
- **Registered sites (holehe):** list of `domain`, `username_if_exposed`, `confidence`
- **Breach participation (HIBP):** list of `breach_name`, `breach_date`, `username_in_breach`, `data_classes_exposed`
- **Gravatar profile:** `preferred_username`, `display_name`, `current_location`, linked accounts, avatar URL
- **Google dork hits:** list of `url`, `context_snippet`, `extracted_username`
- **GitHub commits:** list of `repo`, `commit_sha`, `author_name`, `author_email`, `committer_login`
- **EPIEOS / Microsoft:** `skype_username`, `microsoft_account_present`, `avatar_url`
- **Aggregated username set:** deduplicated list with confidence ratings and source citations
- **Limitations:** tool failures, false-positive risk, missing API keys, jurisdictional notes

## Cross-references

- Related playbooks: [`username-to-identity.md`](username-to-identity.md), [`breach-to-credentials.md`](breach-to-credentials.md), [`domain-to-infrastructure.md`](domain-to-infrastructure.md)
- Tools used: [`../../tools/cli-tools.yaml`](../../tools/cli-tools.yaml) (holehe), [`../../tools/apis.yaml`](../../tools/apis.yaml) (HIBP, EPIEOS), [`../../tools/free-tools.yaml`](../../tools/free-tools.yaml) (Gravatar, Google DoH for MX)
- Ethics: [`../../ethics/legal-frameworks.md`](../../ethics/legal-frameworks.md) (CFAA, CMA, GDPR), [`../../ethics/anti-hallucination.md`](../../ethics/anti-hallucination.md)
