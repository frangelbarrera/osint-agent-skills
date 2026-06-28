# Technique: Facial Recognition

## What this technique does

Facial recognition for OSINT takes a single face image as input and searches external databases and web indexes for additional images of the same person, returning candidate matches ranked by similarity. The technique bridges disconnected accounts when a target uses different usernames, emails, and aliases but shows the same face on multiple platforms. It can identify a person from a single photograph, locate their presence on platforms that do not surface via traditional dorking (small regional social networks, dating sites, news photographs), and confirm that two nominally different online identities belong to the same human being. The technique is powerful, fast, and subject to the most stringent legal and ethical constraints of any OSINT method.

## When to use it

Trigger this technique only when: the analyst has a clear, front-facing photograph of an adult subject; conventional pivoting (username, email, name) has been exhausted or returned ambiguous results; the investigation has a documented justification (missing-person case, fraud investigation, journalist verification of a public figure); and the jurisdiction permits facial recognition use for the investigation's purpose. Do not trigger this technique for casual identity resolution, do not trigger it without consulting the ethics references, and never trigger it for any subject who is plausibly a minor.

## Tools

- PimEyes (paid, reverse face search across the open web): <https://pimeyes.com/>
- FaceCheck.ID (freemium, reverse face search): <https://facecheck.id/>
- Yandex Images (free, face mode, often best for Eastern European and Russian social-media coverage): <https://yandex.com/images/>
- Google Lens (free, face mode is weaker but unmatched for general reverse image): <https://lens.google.com/>
- Bing Visual Search (free): <https://www.bing.com/visualsearch>
- Search4faces (freemium, VK and OK-focused): <https://search4faces.com/>
- FindClone (paid, Russian-platform focus): <https://findclone.ru/>
- TinEye (free, exact-image only — does NOT do face matching): <https://tineye.com/>
- Amazon Rekognition (paid, build-your-own database): <https://aws.amazon.com/rekognition/>
- Microsoft Azure Face API (paid, with restricted use policy): <https://azure.microsoft.com/en-us/products/ai-services/ai-vision>

## Procedure

### Step 1: Document the justification

Before uploading any face image, record: the investigative purpose, the source of the image (with provenance), the legal basis in the operating jurisdiction, the expected scope of the search, and the retention plan for results. Store this documentation with the case file. If you cannot articulate a clear justification, stop.

### Step 2: Prepare the query image

Crop the image tightly to the face (square or 4:3 aspect ratio depending on the tool's preference). Remove distractions: watermarks, other faces, motion blur. If multiple faces are present, crop to a single face. Save a copy with a case-relevant filename; never overwrite the original.

### Step 3: Run PimEyes first

PimEyes is the most aggressive open-web face search available to civilians. Upload the cropped image; review the top 10 results. PimEyes returns thumbnail previews and source URLs only behind the paid tier. Each result includes a similarity score (higher is more confident) and a link to the source page. Save each source URL and screenshot both the result card and the destination page.

### Step 4: Cross-check with FaceCheck.ID

FaceCheck.ID uses a different index and returns different matches. Run the same cropped image and compare results. Matches appearing in both PimEyes and FaceCheck.ID have substantially higher confidence than matches appearing in only one.

### Step 5: Run Yandex Images face search

Yandex is uniquely strong for faces because its index covers Russian social networks (VK, Odnoklassniki), Eastern European news sites, and smaller regional platforms that Western engines do not crawl. Upload the image at <https://yandex.com/images/> and select the face mode. Yandex often surfaces matches that no Western tool finds, particularly for targets with Eastern European, Central Asian, or Russian Federation connections.

### Step 6: Run Google Lens as a free baseline

Google Lens's face mode is intentionally weaker than its object mode, and Google restricts explicit face search in some regions. Use Lens primarily to find the original publication source of a known image — useful when the same photo was reposted across many sites.

### Step 7: Validate each match

For every candidate match, before treating it as the same person: confirm the face geometry (ear shape, nose profile, jawline, distinctive marks), confirm a secondary attribute (location, employer, name, posting style), and document the basis for the link. A high similarity score alone is not validation; biometric systems have false-positive rates that compound across millions of indexed faces.

### Step 8: Pivot from confirmed matches

Each confirmed face match yields a new account on a new platform. Pivot to `username-enumeration.md` and `email-pivoting.md` from the new account. Treat the new account's profile photo as a fresh query image — running face search on it may surface additional matches the first query missed.

### Step 9: Securely retain or destroy the query image

If the case is ongoing, store the query image in an encrypted container with access logs. If the case is closed, destroy the query image and all uploaded copies. Most face-search services retain uploaded images for their own training and indexing; assume any image you upload is permanently stored by the provider.

## Interpreting results

A *high-confidence match* has a similarity score in the tool's top tier, the candidate image is clearly the same person on visual inspection, and at least one secondary attribute (name, location, employer, account creation timing) corroborates. A *probable match* has a high score and visual similarity but no corroborating attribute — investigate further before treating as confirmed. A *lookalike* is a high-scoring result that visual inspection rules out (different ear shape, different eye color). A *false positive* is a high-scoring result that is definitively a different person — record it so reviewers understand why it was excluded.

## Common false positives

- **Doppelgangers**: unrelated individuals who happen to share facial geometry, especially common in large populations (China, India) and within ethnic subgroups with limited facial-feature variation.
- Identical twins and triplets cannot be distinguished by face search.
- Photoshopped or AI-generated faces match the source identity, not the synthetic identity.
- Children's faces change significantly with age; a query image from 2010 may match a current photo only weakly.
- Cosplay, makeup, and prosthetics reduce match accuracy dramatically.
- Index contamination: face-search services sometimes index the same person multiple times under different source URLs, inflating the apparent match count.

## Anti-patterns

- **Do not use facial recognition on minors.** This is an absolute rule, not a guideline. If the target is plausibly under 18, terminate the technique immediately.
- **Do not use facial recognition without a documented legal basis.** Illinois BIPA (740 ILCS 14) imposes statutory damages per scan; EU GDPR Article 9 classifies biometric data as a special category requiring explicit consent or another Article 9 exception; Texas CUBI, Washington HB 1493, and a growing list of US states impose similar restrictions. Several EU member states require a Data Protection Impact Assessment before any biometric processing.
- Do not use facial recognition to identify participants in protests, religious gatherings, medical facilities, or other constitutionally protected activities.
- Do not run face searches against a database you compiled yourself without lawful basis — that converts OSINT into biometric database construction, which most jurisdictions regulate separately.
- Do not treat any face-search result as confirmed identity; always require a secondary corroborating attribute.
- Do not upload images of bystanders captured incidentally in the query image. Crop them out before upload.
- Do not use PimEyes or similar services to stalk, harass, or surveil a domestic partner, ex-partner, or romantic interest. This is illegal in most jurisdictions and unethical everywhere.
- Do not publish the names of non-public individuals identified through facial recognition without their consent, except in cases of overriding public interest documented in the report.
- Do not retain face-search results longer than the investigation requires; set a destruction date at the start of the case.

## Cross-references

- Related playbooks: `../pivot-playbooks/face-to-identity.md`, `../pivot-playbooks/photo-to-location.md`
- Tools used: `../../tools/free-tools.md`, `../../tools/apis.md`
- Domain guides: `../domains/social-media.md`
- Ethics references: `../../ethics/biometric-data.md`, `../../ethics/jurisdictional-rules.md`, `../../ethics/consent-and-public-interest.md`
