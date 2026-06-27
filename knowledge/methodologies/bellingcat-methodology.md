# The Bellingcat Open-Source Investigation Methodology

Bellingcat is an independent international collective of researchers, investigators, and citizen journalists that uses open-source and social media investigation to probe a variety of subjects — from Mexican drug lords and crimes against humanity, to chemical weapons use and conflicts worldwide. Their methodology, distilled from a decade of high-profile investigations, is the de facto reference for verification-first open-source work. This file adapts Bellingcat's methodology for autonomous OSINT agents.

The unifying thread of Bellingcat's work is verification-first: nothing is published until it has been independently verified, archived, and subjected to active disconfirmation. The agent that adopts this methodology is slower to publish than a journalist under deadline, but the product is defensible.

## Verification-first mindset

Every artifact is treated as unverified until proven otherwise. A photograph found on social media is not evidence of what it depicts; it is evidence that an image exists on a server. To upgrade it to evidence of the depicted event, the investigator must verify provenance (who first posted it, when, from where), originality (is it the original upload or a re-share of an older image?), and context (does the depicted scene match the claimed time, place, and participants?).

The agent's default confidence for any unverified artifact is Unverified. Upgrading requires the triangulation discipline documented in `target-triangulation.md`.

## Screenshot and archive everything

Source material on the internet disappears. Accounts are deleted, posts are edited, images are taken down. The investigator's first reflex on encountering a relevant artifact is to preserve it through three independent mechanisms:

- **Wayback Machine** — submit the URL via `https://web.archive.org/save/{url}` (see `../../tools/free-tools.yaml`) and record the resulting snapshot URL.
- **archive.today (archive.ph)** — a second archive service that, unlike Wayback, captures rendered pages including JavaScript-heavy social media. Use it as a cross-check on Wayback.
- **Local copy** — screenshot the page at full viewport, save the HTML, and record a SHA-256 hash of each file in the evidence log at `../../templates/evidence/evidence-log.md`.

Three archives is the minimum because each archive service has different failure modes. Wayback respects robots.txt and may skip some content; archive.today sometimes loses CSS; local copies capture what the investigator's browser rendered, which may differ from what another viewer would see. Together they constitute a defensible chain of preservation.

## Reverse image search as a default reflex

Any image encountered in an investigation is reverse-searched before it is used as evidence. The default tools:

- Google Images, Bing Images, Yandex Images (Yandex is particularly strong for faces and Eastern European content).
- TinEye for exact-match and oldest-known-upload detection.
- For faces specifically, PimEyes or FaceCheck.ID — but flag these as requiring human review per the system prompt, and label results "Probable match, requires human verification."

The reverse image search answers two questions: is this image original (first upload), and where else has it appeared (provenance and disinformation detection)? A photograph presented as "from today's protest" that reverse-searches to a 2017 upload is not what it claims to be. See `../techniques/reverse-image-search.md` for the technique file.

## Geolocation by triangulation of visual clues

Bellingcat's signature skill is geolocating a photograph or video to a precise point on Earth using visible clues. The procedure:

1. Extract every visible feature: signage (in any language), architecture, vegetation, road markings, utility poles, terrain, vehicles (make, model, license plate format), shadows, weather.
2. Cross-reference against satellite imagery (Google Earth, Sentinel Hub, Mapillary, Yandex Maps panoramas).
3. Triangulate: two or more features whose positions constrain the camera viewpoint to a small area.
4. Confirm with a Street View or ground-level photo from the candidate location.

A single clue is a hypothesis. Two clues that agree is a probable location. Three clues that agree, including at least one that uniquely identifies the spot (a sign with text, a distinctive building), is a confirmed location. Document each clue and the matching satellite or ground-level evidence in the report.

## Chronolocation by shadow analysis, weather, event correlation

Establishing *when* an image was captured is often as important as establishing *where*. Techniques:

- **Shadow analysis.** The direction and length of shadows, combined with the geolocated position, yield the solar azimuth and elevation, which constrain the date and time of day. SunCalc and similar tools compute sun position for a given location and time. Two photographs from different angles in the same scene can fix the time of day precisely.
- **Weather correlation.** Visible weather (cloud cover, precipitation, snow on the ground) cross-referenced against historical weather records (e.g., Weather Underground, NOAA archives) constrains the date.
- **Event correlation.** Visible events — a sporting match on a screen, a holiday decoration, a news headline — provide absolute timestamps if the event's date is known.
- **Metadata.** EXIF data, if present, gives a timestamp — but EXIF is trivially edited and must be cross-checked.

## Social media as primary source

Each social media post is treated as a potential lead, not as a fact. A post contains multiple artifacts: the text, the timestamp, the platform, the account metadata (creation date, follower count, posting history), the attached media, and the engagement pattern. Each artifact is extracted, archived, and evaluated separately. An account created two days before the post, with stock-photo avatar and no posting history, is a red flag (see `source-verification.md`). An account with years of organic activity that suddenly posts anomalous content is a different signal — possibly compromised, possibly coerced.

## Avoiding confirmation bias — actively seek disconfirming evidence

The single most important methodological discipline. The investigator forms a hypothesis from initial evidence and then, before publishing, attempts to falsify it. Specifically:

- For each claim, search for evidence that the claim is false. If the photograph is claimed to depict a 2024 event, search for earlier appearances of the same image. If the account is claimed to belong to a specific person, search for evidence that it does not.
- Give disconfirming evidence more weight than confirming evidence. A single disconfirming fact can falsify a hypothesis; a hundred confirming facts do not prove it.
- Document the disconfirmation attempts in the report, even when they fail. "We searched for earlier appearances of this image on Yandex, TinEye, and Google Images; none were found prior to the claimed date" is a stronger statement than "we could not find disconfirming evidence."

## Worked examples

Bellingcat's published investigations are the canonical references. The MH17 investigation (`../../case-studies/bellingcat-mh17.md`) is the touchstone — geolocation of launch site, identification of the Buk transport convoy, chronolocation of photographs, all from publicly available social media posts. The Skripal poisoning investigation demonstrates chronolocation through CCTV and social media cross-referencing. The Syrian Archive work demonstrates volume-scale verification of user-generated content from a conflict zone. Read these case studies before attempting attribution work; they show what verification-first looks like at full stretch.

The agent that adopts this methodology will be slower than one that publishes on first evidence. That is the point. The product is defensible because every claim has been archived, reverse-searched, geolocated, chronolocated, and subjected to active disconfirmation before it reaches the report.
