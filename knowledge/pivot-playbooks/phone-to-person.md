# Pivot Playbook: Phone -> Person

## Trigger

You have a phone number from any prior pivot — for example, a breach-corpus `phone` field, a WHOIS registrant record (pre-GDPR), a vCard extracted from a document, a phone number visible in a Telegram bio, a phone number printed on a business card or in a PDF, or a number supplied directly by the user. The phone is the seed artifact; the goal of this playbook is to identify the line type (mobile, landline, VoIP), the carrier, the registered name where legally available, the platform presence (WhatsApp, Telegram, Signal), and the breach-corpus context that links the phone to other identifiers.

**Jurisdictional notice:** Phone number lookups are tightly regulated. In the EU/EEA, phone numbers are personal data under GDPR; the controller-processor rules apply to any record you retain. In the US, the Telephone Consumer Protection Act (TCPA) and state-level laws (California's CCPA/CPRA, Illinois BIPA if biometric data is involved) restrict use. In China, Russia, Brazil, and India, SIM registration databases exist but are not publicly queryable. The agent MUST apply the jurisdictional rules in `ethics/jurisdiction-rules.md` before performing lookups against numbers from these regions.

## Inputs

- A phone number in E.164 format (`+<country_code><national_number>`, e.g., `+15551234567`). Normalize first — see Step 1.
- The jurisdiction of the number (country code) and of the operator (data subject).
- Optional: prior context — where the number was found, what other identifiers co-occurred.
- API keys for: Twilio Lookup (free tier available), NumLookupAPI (free tier), ipinfo.io (not used here).
- Optional: Truecaller/Sync.me web access (subject to TOS — see Anti-Patterns).
- Optional: WhatsApp/Telegram client installed with consent for profile-pic extraction.

## Step 1: Normalize to E.164

- **Tool:** `libphonenumber` (Google's reference library) — https://github.com/google/libphonenumber
- **Command (Python):**
  ```python
  from phonenumbers import parse, format_number, PhoneNumberFormat, is_valid_number
  parsed = parse("+1 (555) 123-4567", None)
  assert is_valid_number(parsed)
  e164 = format_number(parsed, PhoneNumberFormat.E164)
  international = format_number(parsed, PhoneNumberFormat.INTERNATIONAL)
  national = format_number(parsed, PhoneNumberFormat.NATIONAL)
  ```
- **Expected output:** Three normalized forms: E.164 (`+15551234567`), international (`+1 555-123-4567`), national (`(555) 123-4567`).
- **Pivot point:** Use E.164 for all API calls; use national and international for Google dorks (different sites index phone numbers in different formats). Validate the number — invalid numbers should be discarded, not investigated further.

## Step 2: Line type and carrier via Twilio Lookup

- **Tool:** Twilio Lookup API — https://www.twilio.com/docs/lookup/api
- **Command:**
  ```bash
  curl -s -u "$TWILIO_SID:$TWILIO_TOKEN" \
       "https://lookups.twilio.com/v2/PhoneNumbers/+15551234567?Fields=line_type_intelligence" \
    | jq '{phone_number, country_code, line_type_intelligence: .line_type_intelligence | {type, carrier, mobile_country_code, mobile_network_code, error_code}}'
  ```
- **Expected output:** JSON with `type` (`landline`, `mobile`, `voip`, `unknown`), `carrier` name, MCC/MNC codes, and `error_code` if the lookup failed.
- **Pivot point:** The line type determines the next-step playbook. `landline` numbers are tied to a physical address (often findable via directory services in jurisdictions with public directories — UK, France, Germany). `mobile` numbers are tied to a SIM registered to a person (registry access varies by country). `voip` numbers are often virtual and may be tied to a service (Google Voice, Skype, Twilio itself) rather than a person — flag these as low-confidence for identity attribution.

## Step 3: Carrier and (where available) subscriber name via NumLookupAPI

- **Tool:** NumLookupAPI — https://numlookupapi.com/
- **Command:**
  ```bash
  curl -s "https://api.numlookupapi.com/v2/validate/+15551234567?apikey=$NUMLOOKUP_KEY" \
    | jq '{valid, number, local_format, international_format, country_name, country_code, carrier, line_type, location, registered_name: .subscriber_name}'
  ```
- **Expected output:** JSON with carrier, line type, country, and — in jurisdictions where caller-name (CNAM) data is available — the registered subscriber name. CNAM is most often available for US/Canada landlines and some mobile lines; it is rarely available outside North America.
- **Pivot point:** The `registered_name` field, when present, is high-confidence identity attribution — it is the name on the carrier's billing record. Treat the absence of this field as expected (not failure) — most jurisdictions do not expose CNAM.

## Step 4: Google dorks across multiple formats

- **Tool:** Google search — https://www.google.com/
- **Command:** Run one query per phone format, all in quotes:
  ```
  "+15551234567"
  "+1 555 123 4567"
  "+1.555.123.4567"
  "(555) 123-4567"
  "555-123-4567"
  "555.123.4567"
  "5551234567"
  ```
  Constrain to specific sites:
  ```
  "5551234567" site:linkedin.com
  "5551234567" site:facebook.com
  "5551234567" site:telegram.org
  "(555) 123-4567" filetype:pdf
  ```
- **Expected output:** Indexed pages where the phone number appears verbatim. Common sources: business listings, conference speaker bios, resumes (PDFs), government filings, public Telegram channel forwards, classified-ad sites.
- **Pivot point:** Each hit is a contextual identity claim. A resume PDF listing this phone number alongside a name and address is a high-confidence attribution. A classified-ad listing is medium-confidence (the operator may have used a burner phone).

## Step 5: Truecaller / Sync.me crowd-sourced caller-ID lookup

- **Tool:** Truecaller web search — https://www.truecaller.com/, Sync.me — https://sync.me/
- **Command (web):** Navigate to `https://www.truecaller.com/search/us/5551234567` (sign-in required; free tier limited). For Sync.me, search the E.164 number directly.
- **Expected output:** The crowd-suggested name and profile photo associated with the number, when any Truecaller/Sync.me user has saved the contact.
- **Pivot point:** The name and photo are crowd-sourced — they reflect what other Truecaller users have labeled the number. This is medium-confidence identity attribution: high precision (the labels are usually accurate) but variable recall (many numbers have no label). Profile photos can be reverse-image-searched using the `photo-to-location.md` and `username-to-identity.md` reverse-image-search steps.

## Step 6: Phone number in breach data

> **Note:** HaveIBeenPwned (HIBP) does not support native phone number
> searches via its API — the `breachstats?phone=` endpoint does not
> exist. HIBP only supports email-based queries.
>
> To search for phone numbers in breach data, use alternative services:
> - **DeHashed** — supports phone-number queries (paid API key required)
> - **IntelX** — supports phone-number queries (free tier available)
>
> Use the E.164 normalized phone number (from Step 1) as the search
> query. Record any breaches or associated identities discovered, and
> pivot to `breach-to-credentials.md` for credential-based follow-up.

## Step 7: Telegram presence

- **Tool:** Telegram client (subject to consent framework), Telegram search via t.me URLs.
- **Command:** Add the number to your Telegram contacts under a synthetic name. Telegram will display the user's Telegram handle, profile name, and profile picture if the user has set their privacy setting to "Everybody" (or to "My Contacts" and you are now a contact).
  ```bash
  # Equivalent: try the public profile URL pattern
  curl -s "https://t.me/+15551234567" | head -20  # Often returns 404 unless number is registered and public
  ```
- **Expected output:** Telegram handle, display name, bio, profile picture (if privacy settings permit).
- **Pivot point:** The Telegram handle is a username — feed into `username-to-identity.md`. The profile picture feeds `photo-to-location.md` and the reverse-image-search step. **Consent framework:** Before adding any contact to a real Telegram account, ensure the operator's investigation framework permits it. Adding contacts to Telegram exposes your own account identity to the target if they have notification settings enabled. Use a dedicated sock-puppet account, never a personal account.

## Step 8: WhatsApp profile extraction (with consent framework)

- **Tool:** WhatsApp client (subject to consent framework), or `whatsapp-scraper`/Baileys library for programmatic access.
- **Command:** Save the number to a sock-puppet phone's contacts, open WhatsApp, and look at the contact's profile. Available fields: profile picture, "about" text, "last seen" timestamp (if privacy permits), business name (if WhatsApp Business).
- **Expected output:** Profile metadata, where available.
- **Pivot point:** The profile picture and about-text feed reverse-image and text-analysis pivots. **Consent framework:** WhatsApp's TOS prohibit automated scraping. Manual lookups via a sock-puppet account are widely used in OSINT practice but are technically against WhatsApp's TOS — flag this in the report. Do not message the target.

## Step 9: Compose the identity record

- **Tool:** None — analysis step.
- **Command:** Aggregate all findings:
  - Line type, carrier, country
  - Registered name (if CNAM available)
  - Crowd-sourced name (Truecaller/Sync.me)
  - Breach-corpus associated identifiers (emails, usernames, names)
  - Telegram/WhatsApp profile metadata
  - Google-dork contextual hits
- **Expected output:** A structured phone-attribution record.
- **Pivot point:** The phone record is the deliverable. If a real name has been recovered via breach-corpus or CNAM, the next playbook depends on the user's request — typically `email-to-username.md` or further `username-to-identity.md` pivots via the breached username.

## Anti-Patterns (what NOT to do)

- **Do not assume the registered SIM holder is the current user.** Phones are lost, stolen, sold, and re-registered. A breach record from 2018 may have a different owner than the current subscriber. Always include the timestamp of the underlying data.
- **Do not use SMS-lookup or "caller ID reveal" services that themselves violate TOS.** Many "free phone lookup" sites are data-harvesting operations. Stick to Twilio, NumLookupAPI, Truecaller, and Sync.me — and even then, review their TOS.
- **Do not call or SMS the phone number.** This is direct contact with the target and crosses from OSINT into harassment (or worse) in most jurisdictions. The agent should NEVER place a call or send a message.
- **Do not add the phone number to your personal Telegram or WhatsApp contacts.** Use a sock-puppet account. Adding a number to your personal account exposes your own identity to the target if they receive the "X is now on Telegram" notification.
- **Do not treat VoIP numbers as personal numbers.** Twilio, Vonage, Google Voice, Skype, and Burner numbers are virtual and often registered via fake identities. Attribution from these numbers is low-confidence — flag as "VoIP, likely burner."
- **Do not assume that all jurisdictions expose CNAM data.** The US and Canada expose some; the EU, UK, and most of Asia do not. A null result from a CNAM lookup is normal, not failure.
- **Do not perform phone lookups on numbers from jurisdictions where it is illegal.** China, Russia, and several Middle Eastern countries criminalize unauthorized phone-number database queries. See `ethics/jurisdiction-rules.md`.
- **Do not include the raw phone number in the final report without redaction considerations.** Phone numbers are personal data under GDPR and similar frameworks. If the report will be shared, consider redacting to `+1 ••• ••3 45•7` with the last 4 digits as needed for unambiguous identification.
- **Do not use phone number to triangulate physical location via SS7 or similar.** Those techniques are intrusion-grade and illegal for civilian use.
- **Do not assume phone numbers in breach corpora are accurate.** Users mistype their phone numbers at signup. A breach record's `phone` field is a candidate, not a confirmed identifier.

## Output Format

When you complete this pivot, report:

- **Seed phone number:** (input, normalized to E.164)
- **Line type / carrier:** type, carrier name, MCC/MNC, country
- **Registered name (CNAM):** if available, with the source
- **Crowd-sourced name:** Truecaller/Sync.me label, with confidence note
- **Google dork hits:** list of URL + format matched + contextual snippet
- **Breach-corpus records:** list of breach + associated email/username/name in that breach
- **Telegram presence:** handle, display name, bio, profile-picture URL (if privacy permitted)
- **WhatsApp presence:** profile metadata (if privacy permitted)
- **Aggregated identity record:** name candidates, alternate identifiers, confidence ratings
- **Jurisdictional notes:** which lookups were permitted, which were skipped
- **Limitations:** data gaps, TOS-restricted lookups, SIM-transfer caveats

## Cross-references

- Related playbooks: [`breach-to-credentials.md`](breach-to-credentials.md), [`email-to-username.md`](email-to-username.md), [`username-to-identity.md`](username-to-identity.md), [`photo-to-location.md`](photo-to-location.md)
- Tools used: [`../../tools/apis.yaml`](../../tools/apis.yaml) (Twilio Lookup, NumLookupAPI, HIBP), [`../../tools/free-tools.yaml`](../../tools/free-tools.yaml) (Google DoH — not used here, but `libphonenumber` is referenced)
- Ethics: [`../../ethics/legal-frameworks.md`](../../ethics/legal-frameworks.md) (GDPR, TCPA, CCPA), [`../../ethics/jurisdiction-rules.md`](../../ethics/jurisdiction-rules.md) (per-country rules), [`../../ethics/privacy-guidelines.md`](../../ethics/privacy-guidelines.md) (PII handling for phone numbers), [`../../ethics/anti-hallucination.md`](../../ethics/anti-hallucination.md)
