# Source Verification for OSINT

Every claim in an OSINT product is only as strong as the source it rests on. This file defines the procedures an agent uses to verify the authenticity and credibility of a source before citing it. It is the per-source companion to `target-triangulation.md`, which defines how multiple sources are combined. The discipline here is applied to each source individually before triangulation begins.

The file covers five practical frameworks: the CRAAP test adapted for OSINT, lateral reading, the SIFT method, verification of user-generated content, and detection of manipulated media. It closes with a list of red flags that should immediately downgrade a source's credibility.

## The CRAAP test adapted for OSINT

CRAAP was developed for evaluating research sources in academic libraries. Adapted for OSINT:

- **Currency.** When was the source published or last updated? Is the information still current, or has the underlying situation changed? A 2019 corporate registry entry may be the most recent available but still be stale for a 2024 investigation. Record the source's date and the date of the underlying data separately; they are often different.
- **Relevance.** Does the source actually address the claim being made? A news article about a company's revenue does not support a claim about its ownership structure, even if both appear in the same article.
- **Authority.** Who is the publisher? What is their track record? A government registry has authority by virtue of being the issuing body; a personal blog does not, regardless of how confident the blogger sounds.
- **Accuracy.** Can the source's claims be verified against other sources? Does the source cite its own sources? Are there obvious factual errors that would undermine the whole?
- **Purpose.** Why does this source exist? Is it informing, persuading, selling, or deceiving? A press release has a different purpose than a regulatory filing; an activist blog has a different purpose than a court record. Purpose shapes what the source is likely to omit.

Each axis is scored mentally, not numerically. The output is a qualitative credibility weight that feeds into `target-triangulation.md`.

## Lateral reading

Lateral reading is the practice of verifying a source by checking *other* sources, not by inspecting the source itself. Professional fact-checkers do this; novices tend to stay on the source's own page, looking for "About" sections and author bios. Those can be fabricated. Lateral reading asks: what do *other* reputable sources say about this source, its author, and its claims?

Procedure:

1. Leave the source's page.
2. Search for the source's name or domain on reputable third-party sites: Wikipedia, established news outlets, Media Bias/Fact Check, academic databases, government registries.
3. Search for the specific claim on other independent sources.
4. If the source has no third-party footprint, treat it as low-credibility by default.

## The SIFT method

SIFT, developed by Mike Caulfield, is a four-step lateral reading protocol:

- **Stop.** Before engaging deeply with a source, pause. Ask whether you trust the publisher. If not, do not engage further until you have investigated.
- **Investigate the source.** Use lateral reading to establish what others say about the source. Wikipedia is often the fastest first stop for organizations and publishers.
- **Find better coverage.** Look for the same claim on higher-credibility sources. If you find it, cite the better source instead.
- **Trace claims to the original context.** A claim quoted out of context can mean the opposite of what the source intended. Trace the quote to its original publication and read the surrounding text.

SIFT is fast. It is the default reflex when a source is encountered for the first time.

## Verifying user-generated content (UGC)

User-generated content — photographs, videos, posts from social media — requires verification of provenance, originality, and context.

- **Provenance.** Who first posted the content? When? From what account? Use the platform's API or web archive to find the earliest known upload. Reverse image search (`../techniques/reverse-image-search.md`) identifies earlier appearances.
- **Originality.** Is the post the original upload, or a re-share of older content? Re-shares lose metadata and often strip context. The original upload is the authoritative artifact.
- **Context.** Does the depicted scene match the caption's claim? Geolocate (`../pivot-playbooks/photo-to-location.md` and `../domains/geoint.md`) and chronolocate (shadow analysis, weather, event correlation — see `bellingcat-methodology.md`) the content independently of the caption.

A UGC artifact that passes all three checks is a verified primary source for what it depicts. A UGC artifact that fails any check is downgraded and treated as a lead, not as evidence.

## Detecting manipulated media

Basic manipulation checks the agent can perform without specialized forensic tools:

- **EXIF metadata.** Extract with `exiftool` or equivalent. Look for software signatures (Photoshop, GIMP), timestamps that do not match the claimed event, GPS coordinates consistent with the claimed location. Absent EXIF is itself a signal — many platforms strip EXIF on upload, but its presence is informative.
- **Reverse image search.** Look for earlier or variant versions of the image. An image that appears in multiple variants with different captions is likely being circulated deceptively.
- **Frame-by-frame review (for video).** Scrub through the video looking for splices, frame drops, or abrupt changes in lighting and background that suggest editing.
- **Lighting and shadow consistency.** Do the shadows fall in a direction consistent with a single light source (the sun)? Inconsistent shadows are a manipulation tell.
- **Edge artifacts.** Zoom into boundaries between subjects and backgrounds. Compositing often leaves subtle artifacts at edges.

For high-stakes verification (e.g., content that will be cited in a legal or journalistic context), these basic checks are necessary but not sufficient. Recommend engagement of a specialized forensic service.

## Red flags

Source credibility is downgraded immediately when any of the following appear:

- **Brand-new accounts.** An account created days or hours before posting the relevant content, with no posting history. Default: Unverified, lead only.
- **No archival history.** A site or page that has no captures in the Wayback Machine prior to the relevant event, but claims to be long-established. Default: Unverified.
- **Stock photo avatars.** Reverse image search on the avatar returns stock photo sites. Default: account identity is suspect; treat all claims as Unverified.
- **Inconsistent metadata.** EXIF timestamps that predate the camera model's release date, or GPS coordinates in a different country than the claimed location. Default: manipulated.
- **Coordinated posting patterns.** Multiple accounts posting the same content within minutes, with no organic engagement history. Default: coordinated inauthentic behavior; treat the cluster as a single low-credibility source.
- **Anonymous authorship on contested claims.** An anonymous source making a contested factual claim carries no default credibility; require corroboration from a named, authoritative source.

When a red flag is present, the agent documents the flag, downgrades the source, and proceeds with the lower confidence. The flag is preserved in the report so the reader can see why a source was treated as it was.
