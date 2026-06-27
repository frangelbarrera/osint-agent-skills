# Pivot Playbook: Photo -> Location

## Trigger

You have a photograph — typically a frame extracted from a video, an image posted on social media, an image attached to a leaked document, an image scraped from a forum, or an image supplied directly by the user — and the goal is to determine where it was taken. The photo is the seed artifact; this playbook walks the Bellingcat-style open-source geolocation methodology: extract embedded metadata first, then reverse-image-search, then visually identify landmarks, signage, vegetation, and architectural cues, then chronolocate via shadow analysis, then verify candidate locations against ground-truth imagery (Google Street View), and finally geocode the result.

This playbook is environmental. **Facial recognition is the wrong tool here** — the goal is to locate the place, not identify the people in the frame. Faces are redacted from working copies before any reverse-image-search step to avoid accidental identification of bystanders. See the Anti-Patterns section for the ethical boundary.

## Inputs

- The original image file (unmodified — do not strip metadata before processing).
- Optional: contextual information — where was the image posted, by whom, with what caption, in what thread.
- Optional: rough region of interest ("probably somewhere in Brazil", "definitely not the US") to narrow the search space.
- Local installs of: ExifTool (`apt install libimage-exiftool-perl`), ImageMagick (for crop/resize/recompress), Python with `suncalc` or similar for shadow analysis.
- Web access to: Yandex Images, Google Lens, Bing Visual Search, Google Maps, Google Street View, Mapillary, KartaView, Nominatim.

## Step 1: Extract EXIF and XMP metadata with ExifTool

- **Tool:** ExifTool — https://exiftool.org/
- **Command:**
  ```bash
  exiftool -j -a -u -g1 -ee photo.jpg > photo_metadata.json
  jq '.[0] | {EXIF: .EXIF, GPS: .GPS, XMP: .XMP, IPTC: .IPTC, Composite: .Composite}' photo_metadata.json
  ```
- **Expected output:** A JSON document with all metadata. The `GPS` block, when present, contains `GPSLatitude`, `GPSLongitude`, `GPSAltitude`, and `GPSDateTime`. The `EXIF` block contains `DateTimeOriginal`, `Make`, `Model`, `LensModel`, `Software`. The `XMP` block may contain `Location`, `Country`, `City`, `State`.
- **Pivot point:** If GPS coordinates are present, the location problem is solved (subject to verifying the coordinates are not spoofed — many image-editing tools allow manual override). Feed coordinates to Step 8 (Nominatim) and skip Steps 2-7. If GPS is absent (the common case for social-media images, which strip EXIF on upload), proceed to Step 2.

## Step 2: Reverse image search with Yandex (best for objects and landmarks)

- **Tool:** Yandex Images — https://yandex.com/images/
- **Command:** Open the Yandex Images search page in a browser, click the camera icon, and upload the image. Yandex's algorithm is widely regarded as the strongest reverse-image-search for landmarks, buildings, and outdoor scenes — particularly in Russia, Eastern Europe, and Asia where Google's coverage is weaker.
  For programmatic access (subject to TOS): use a third-party Yandex reverse-image API or scrape results pages with caution.
- **Expected output:** A grid of visually similar images with source URLs. Pages where the same image (or visually similar images) have appeared.
- **Pivot point:** If the original image is a known landmark, Yandex will often return pages naming the landmark directly. If the image is unique, the visually-similar images may still reveal the location — same building from a different angle, same vegetation, same architectural style.

## Step 3: Reverse image search with Google Lens (best for objects)

- **Tool:** Google Lens — https://lens.google.com/
- **Command:** Upload the image to Google Lens. Use the "Search" option for general matching; use the "Text" option to OCR any visible text in the image (signage, license plates, business names).
- **Expected output:** A list of visually similar images, plus OCR-extracted text from the image.
- **Pivot point:** OCR'd text is gold — a business name, a street sign, a license plate, a brand logo, all narrow the search dramatically. Any text in a non-Latin script (Cyrillic, Arabic, CJK) further narrows the region.

## Step 4: Reverse image search with Bing Visual Search (cross-validation)

- **Tool:** Bing Visual Search — https://www.bing.com/visualsearch
- **Command:** Upload the image to Bing Visual Search. Bing occasionally finds matches that neither Yandex nor Google surfaces, particularly for North American content.
- **Expected output:** Similar to Yandex / Google Lens — visually similar images plus pages containing them.
- **Pivot point:** Cross-validate. If all three engines agree on a candidate location, confidence is high. If they disagree, treat each candidate as a hypothesis to verify in Steps 5-7.

## Step 5: Identify visible environmental clues

- **Tool:** Visual inspection by the agent (or a vision-capable LLM).
- **Command:** Systematically scan the image for:
  - **Signage:** street signs (style varies by country — US uses green or blue rectangular signs; most of Europe uses directional arrows on white-background signs; Japan uses a distinctive green-on-white), business signs (often with the local language and a brand identifier), road markings (yellow vs white center lines, dashed vs solid).
  - **Vegetation:** palm trees (tropical / Mediterranean), cacti (desert), conifers (boreal / mountainous), deciduous (temperate). The species mix narrows the climate zone.
  - **Architecture:** building materials (concrete, brick, timber, adobe), roof style (flat, pitched, thatched, tiled), window style, balcony style. Architectural styles are often region-specific (Soviet-era block housing, Spanish-colonial, mid-century American ranch, Brazilian favela).
  - **Vehicles:** license plate format (EU plates have a blue strip with country code on the left; US plates vary by state; Chinese plates are blue with white characters; Japanese plates are green/yellow/white depending on vehicle type), steering wheel side (left-hand drive vs right-hand drive), vehicle makes common in the region.
  - **Infrastructure:** utility pole style, traffic light style, pedestrian crossing markings (zebra, pelican, puffin), manhole cover design (some cities have distinctive covers).
  - **Weather and sky:** sun angle (chronolocator), cloud types, snow cover, foliage season (cherry blossom, autumn leaves).
- **Expected output:** A structured clue list mapping each observation to a candidate region.
- **Pivot point:** The clue list drives a candidate-region shortlist (e.g., "Mediterranean coast, Spanish-speaking, hilly terrain"). The shortlist narrows the Step 7 (Street View) search.

## Step 6: Chronolocate via shadow analysis

- **Tool:** Sun position calculator — `suncalc` Python library, or SunCalc.net — https://www.suncalc.net/
- **Command:**
  ```python
  from suncalc import get_position
  from datetime import datetime
  # If image timestamp is known (from EXIF DateTimeOriginal)
  dt = datetime(2024, 6, 15, 14, 30, tzinfo=ZoneInfo("UTC"))
  pos = get_position(dt, longitude=-0.1276, latitude=51.5074)  # candidate location
  print(f"Sun altitude: {pos['altitude']}, azimuth: {pos['azimuth']}")
  ```
  Measure the shadow direction and length in the image (relative to the object casting it). Compare against the sun azimuth (direction) and altitude (angle) for the candidate location and timestamp.
- **Expected output:** The sun's azimuth and altitude at the candidate location and time. The shadow's azimuth is opposite the sun's azimuth (object shadow points away from the sun).
- **Pivot point:** Shadow analysis confirms or rules out candidate locations. If the shadow direction in the image is incompatible with the sun azimuth at the candidate location and time, the candidate is wrong. If the shadow length implies a sun altitude of 30 degrees but the candidate location has the sun at 60 degrees at the stated time, the candidate is wrong or the time is wrong.

## Step 7: Cross-reference candidate locations with Google Street View

- **Tool:** Google Street View — https://www.google.com/maps, Mapillary — https://www.mapillary.com, KartaView — https://kartaview.org
- **Command:** For each candidate location from Steps 4-6, virtually "walk" the streets in Street View looking for a match to the photo's framing. Use distinctive features (a uniquely-shaped building, a particular bridge, a notable sign) as anchors.
  Mapillary and KartaView provide street-level imagery in regions Google does not cover (much of rural Latin America, parts of Africa, rural Asia).
- **Expected output:** A confirmed match — a Street View frame whose visible features align with the photo. Record the lat/long, the Street View panorama ID, and the capture date.
- **Pivot point:** A Street View match is the strongest possible open-source confirmation. If no Street View coverage exists for the candidate region, fall back to satellite imagery (Google Earth, Sentinel-2) and confirm via building footprints and roof shapes.

## Step 8: Geocode the resolved location with Nominatim

- **Tool:** Nominatim (OpenStreetMap) — https://nominatim.openstreetmap.org/
- **Command:**
  ```bash
  # Reverse geocode (coordinates -> address)
  curl -s -A "osint-agent-skills/1.0" \
       "https://nominatim.openstreetmap.org/reverse?lat=51.5074&lon=-0.1276&format=json&addressdetails=1" \
    | jq '{display_name, address: .address | {road, city, state, country, postcode}}'

  # Forward geocode (place name -> coordinates), useful for Step 7 candidate verification
  curl -s -A "osint-agent-skills/1.0" \
       "https://nominatim.openstreetmap.org/search?q=Trafalgar+Square+London&format=json&addressdetails=1" \
    | jq '.[0]'
  ```
- **Expected output:** A structured address with road, city, state, country, and postcode.
- **Pivot point:** The geocoded address is the deliverable. Use the full address in the intelligence report, with the underlying coordinates for machine-readable use. Nominatim's usage policy requires a valid HTTP User-Agent and a maximum of 1 request per second — observe this.

## Step 9: Document the chronolocation and confidence

- **Tool:** None — analysis step.
- **Command:** Aggregate all evidence:
  - EXIF timestamp (if present) or estimated date range from contextual clues
  - Coordinates and address (resolved via Step 8)
  - Shadow-analysis confirmation
  - Street View panorama ID and capture date
  - List of distinctive features matched
  - Sources cited per finding
- **Expected output:** A structured geolocation record.
- **Pivot point:** The record is the deliverable. If a precise location cannot be determined, report the bounding region (e.g., "somewhere in coastal Andalusia, Spain, within 50km of Malaga") with explicit confidence bounds.

## Anti-Patterns (what NOT to do)

- **Do not use facial recognition to identify bystanders in the photo.** Tools like PimEyes, FindClone, and Clearview can identify faces, but using them in geolocation work is ethically wrong (the bystanders did not consent) and frequently illegal (Illinois BIPA, EU GDPR). Faces are redacted from working copies before any reverse-image-search step.
- **Do not assume EXIF GPS is accurate.** EXIF can be spoofed in any image editor. If the GPS claims a sensitive location (military base, embassy, private residence), cross-verify the location via Steps 5-7 before treating the coordinates as confirmed.
- **Do not rely on a single reverse-image-search engine.** Yandex, Google, and Bing have complementary coverage. Using only one will miss matches the others find.
- **Do not assume that visually similar images are of the same place.** Reverse image search returns similarity, not identity. Many city skylines, beaches, and forests look alike. Confirm via Street View.
- **Do not infer location from the social-media platform alone.** A photo posted on a Russian-language Telegram channel is not necessarily taken in Russia; the poster may be a diaspora member, may be reposting an old image, or may be a disinformation operator using stock footage.
- **Do not omit the chronolocation.** Knowing the photo was taken at 14:30 UTC in summer in the Northern Hemisphere is as important as knowing the location. Time-of-day and time-of-year constrain the candidate set.
- **Do not publish unredacted geolocated imagery without considering the harm to bystanders.** If the photo shows protesters in a repressive regime, publishing their location can lead to their arrest. Apply the harm-minimization rules in `ethics/privacy-guidelines.md` before publishing.
- **Do not treat Mapillary / KartaView imagery as a single point in time.** These services aggregate user-contributed imagery over years. A 2018 Mapillary frame may show different infrastructure than the 2024 photo you are investigating. Always check the imagery date.
- **Do not guess a location if no candidate survives verification.** Report "location not determined" rather than speculating. The anti-hallucination rule in `ethics/anti-hallucination.md` is absolute.
- **Do not skip the EXIF extraction step.** Even social-media-downloaded images occasionally retain metadata (some platforms strip EXIF inconsistently). Always run ExifTool first; the cost is seconds, the upside is a solved case.

## Output Format

When you complete this pivot, report:

- **Seed image:** filename, dimensions, file size, source URL
- **EXIF / XMP / IPTC metadata:** all fields present, with GPS coordinates (if present)
- **Reverse image search results:** Yandex / Google Lens / Bing hit URLs and source-page URLs
- **Environmental clue inventory:** signage, vegetation, architecture, vehicles, infrastructure
- **Candidate locations:** list with reasoning per candidate
- **Shadow analysis:** sun azimuth and altitude for the timestamp, shadow direction in image
- **Street View match:** panorama ID, lat/long, capture date, distinctive-feature list
- **Geocoded location:** full address from Nominatim, with coordinates
- **Chronolocation:** date and time (precise or range)
- **Confidence:** low / medium / high with explicit reasoning
- **Limitations:** metadata absence, image quality, candidate-region ambiguity, Street View coverage gaps

## Cross-references

- Related playbooks: [`metadata-to-attribution.md`](metadata-to-attribution.md) (overlap with EXIF analysis), [`username-to-identity.md`](username-to-identity.md) (avatar reverse-image search), [`phone-to-person.md`](phone-to-person.md) (WhatsApp/Telegram profile picture analysis)
- Tools used: [`../../tools/cli-tools.yaml`](../../tools/cli-tools.yaml) (ExifTool), [`../../tools/free-tools.yaml`](../../tools/free-tools.yaml) (Nominatim, Google Maps, Mapillary, KartaView)
- Ethics: [`../../ethics/privacy-guidelines.md`](../../ethics/privacy-guidelines.md) (facial recognition, bystander harm), [`../../ethics/anti-hallucination.md`](../../ethics/anti-hallucination.md), [`../../ethics/legal-frameworks.md`](../../ethics/legal-frameworks.md) (BIPA, GDPR for biometric data)
