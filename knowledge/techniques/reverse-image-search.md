# Technique: Reverse Image Search

## What this technique does

Reverse image search takes an image as input and returns other web pages, images, and metadata that are visually or perceptually similar to the query. Unlike facial recognition (which matches specific face geometry), reverse image search matches any visual content: objects, landmarks, documents, screenshots, logos, scenes, and edited variants of an original. For OSINT this is the foundational pivot for working with any image whose origin is unknown — establishing when it was first published, identifying the location at which it was taken, detecting manipulated or recycled imagery in disinformation campaigns, and finding higher-resolution or unredacted versions of a published photograph. Each search engine indexes a different slice of the web, so a disciplined reverse-image investigation always runs multiple engines and compares their results.

## When to use it

Trigger this technique whenever the analyst obtains an image and needs to answer any of: where did this image originate, has it been published before, has it been edited, is it being misattributed, where was it taken, what does it depict, or who else has republished it. Reverse image search is the standard first action on any image found in a social-media post, a news article, a leaked document, a phishing email, or a profile avatar. It is also the canonical verification step for any user-generated image whose authenticity is at issue.

## Tools

- Yandex Images (free, frequently best for source-discovery and faces): <https://yandex.com/images/>
- Google Lens (free, strong on objects and landmarks): <https://lens.google.com/>
- Google Images reverse search (free, via Lens): <https://images.google.com/>
- Bing Visual Search (free, sometimes returns unique results): <https://www.bing.com/visualsearch>
- TinEye (free tier paid tiers, exact-match specialist): <https://tineye.com/>
- PimEyes / FaceCheck.ID (free/paid, face-only — see `facial-recognition.md`): <https://pimeyes.com/>, <https://facecheck.id/>
- Baidu Image Search (free, China-focused): <https://image.baidu.com/>
- Sogou Image (free, China-focused): <https://pic.sogou.com/>
- Naver Image (free, Korea-focused): <https://search.naver.com/search.naver?where=image>
- Karma Decay (free, Reddit-focused): <https://karmadecay.com/>
- Image Identification Project (free, browser-based): <https://www.imageidentify.com/>
- Forensically (free, image-forensics伴随): <https://29a.ch/photo-forensics/>

## Procedure

### Step 1: Capture the source image with full provenance

Record the URL where the image was found, the page context, the timestamp, the page title, and the surrounding text. Save the image with a case-relevant filename and compute its SHA-256 hash. Never modify the original — work on a copy.

### Step 2: Strip or preserve metadata deliberately

Decide whether to query with the original (metadata-bearing) file or a stripped copy. Some engines index EXIF and may behave differently with metadata present. Run both variants and compare results.

### Step 3: Run Yandex Images first

Yandex's perceptual hashing is consistently the strongest among the free engines for finding visually related images and for identifying the original source of a widely-shared image. Upload the image at <https://yandex.com/images/> (the upload UI is in the search bar camera icon). Review "Similar images" and "Image sources" tabs separately.

### Step 4: Run Google Lens

Google Lens's strength is object recognition (landmarks, products, species, text via OCR). For each region of the image, Lens may produce a different identification. Use the "select" tool to crop within Lens to specific regions of interest.

### Step 5: Run Bing Visual Search

Bing occasionally returns matches neither Yandex nor Google find, particularly for imagesharing sites popular in Western Europe (Flickr, 500px). Always include Bing in the rotation.

### Step 6: Run TinEye for exact-match tracking

TinEye specialises in finding edited crops, resized variants, and recompressed copies of the *same* original image. It does not do similarity matching — it does perceptual hashing tuned to find derivatives of one source. Order TinEye results by "oldest" to identify the likely original publication date, and by "best match" to find the highest-resolution variant. Use TinEye's API for batch checks.

### Step 7: Crop and re-search

Different parts of an image may match different sources. A composite image (often used in disinformation) may have one face lifted from a stock photo site and another from a real news photo. Crop each region and run it through Yandex, Google, Bing, and TinEye separately. Treat each region as its own investigation.

### Step 8: Search by image URL, not just upload

If the image is hosted at a stable URL, query the engines with the URL directly rather than uploading. URL-based queries sometimes surface index entries that upload-based queries miss, because the engine has already crawled the URL.

### Step 9: Run regional engines

For region-specific investigations:
- Baidu and Sogou for Chinese-language sources
- Naver for Korean sources
- Yandex for Russian and Eastern European sources
- Karma Decay for Reddit repost history

### Step 10: Pivot to landmarks and objects

If the image contains a distinctive landmark, signage, or vehicle registration, pivot to Google Lens's landmark mode, Wikidata geographical queries, and Overpass Turbo for matching OSM features. See `photo-to-location.md` for the full location-identification workflow.

### Step 11: Diff against edited variants

When TinEye returns multiple variants, download the highest-resolution and the oldest-published variants. Overlay them in an image editor with difference blending; any region that differs is a manipulation candidate. Use Forensically (`https://29a.ch/photo-forensics/`) for error-level analysis and clone detection.

### Step 12: Pivot from each new source

Every reverse-image hit is a new URL — apply the full investigation stack: WHOIS lookup, Wayback Machine history, author identification, related-URL enumeration. Reverse image search is rarely the end of an investigation; it is the start of several new ones.

## Interpreting results

An *exact match* is a result whose image is bit-identical or perceptually identical (same scene, same camera, same time) to the query. A *derivative match* is a cropped, resized, recoloured, or recompressed version of the original. A *similar match* is a different image of the same scene, object, or person — useful for context but not for provenance. An *unrelated match* is a high-similarity-score result that depicts a different subject; record and exclude. The *oldest match* across all engines is a strong proxy for the original publication date; if engines disagree on the oldest date, prefer the date from the engine whose index covers the region most likely to be the source.

## Common false positives

- Stock photos returned for query images that happen to resemble stock subjects (smiling businesspeople, generic landscapes).
- AI-generated images that match a query because they were trained on the query image.
- Recoloured or filtered versions of the query image that defeat perceptual hashing on some engines but not others.
- Composite images where one region matches a real source and another matches a different real source — neither match alone proves the composite is authentic.
- Mosaic-tiled or thumbnail-stitched pages that match because the page contains many small versions of the query image (e.g., a Pinterest board).
- Different images of the same landmark returned as "matches" — visually similar but not the same photograph.
- Results from images that have been deliberately SEO-stuffed with unrelated keywords.

## Anti-patterns

- Do not rely on a single search engine. Yandex, Google, Bing, and TinEye have non-overlapping indexes; a negative result on one does not mean the image is unpublished.
- Do not treat "no results found" as proof of originality. The image may exist on platforms the engines do not crawl (private messaging apps, dark-web forums, regional platforms).
- Do not assume the oldest match is the original — older matches can be backdated archives, misattributed reposts, or earlier news coverage of an even older event.
- Do not modify the query image before searching (resize, re-encode, watermark) without running both the modified and original variants; modifications can suppress matches.
- Do not upload case-sensitive images (containing identifying information of bystanders or minors) to consumer search engines. Their retention policies vary and some use uploads for index expansion.
- Do not use reverse image search as the sole basis for a disinformation-attribution claim — corroborate with metadata extraction, publication-timeline analysis, and source verification.
- Do not forget to check the image's filename, URL, and alt text in the source page; these often contain the original caption or photographer credit.

## Cross-references

- Related playbooks: `../pivot-playbooks/photo-to-location.md`, `../pivot-playbooks/image-to-source.md`
- Tools used: `../../tools/free-tools.md`, `../../tools/apis.md`
- Domain guides: `../domains/social-media.md`, `../domains/disinformation.md`
