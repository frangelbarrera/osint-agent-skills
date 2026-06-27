# Technique: Metadata Extraction

## What this technique does

Metadata extraction pulls hidden structured information out of files — EXIF from images, document properties from Office files, PDF producer strings, audio/video container tags, and revision identifiers — and turns each field into an OSINT pivot. A single photograph can reveal GPS coordinates, camera model, serial number, original timestamp, and the software that last edited it. A single Word document can reveal the author's Windows username, the company's Office version, the template path (often including a corporate server name), and the last-modified-by identity. This technique extracts those fields reliably and interprets them in the context of the broader investigation.

## When to use it

Trigger this technique whenever the analyst obtains a downloadable file linked to the target: a press photo, a PDF report, an Excel attachment on a corporate site, a video clip posted to YouTube (downloaded at original quality), an image from a personal blog, an archived slide deck. It is also valuable when re-examining material already collected but never meta-tagged. The earlier in an investigation this is applied, the richer the pivot pool becomes.

## Tools

- ExifTool (free, universal, the reference implementation): <https://exiftool.org/>
- FOCA (free, Windows-only, Office/PDF focus): <https://github.com/ElevenPaths/FOCA>
- Metagoofil (free, Python, bulk from domains): <https://github.com/opsdisk/metagoofil>
- pdfinfo (free, part of poppler-utils): <https://poppler.freedesktop.org/>
- `identify` from ImageMagick (free): <https://imagemagick.org/>
- ffprobe from FFmpeg (free, audio/video): <https://ffmpeg.org/ffprobe.html>
- PDF Forensic Analyser (pdf Forensics Garfinkel): <https://www.afflib.org/>
- PDFStreamDumper (free, Windows): <http://sandsprite.com/blogs/index.php?uid=7&pid=152>
- Online EXIF viewers (free, but uploads your file): <https://exifdata.com/>, <https://jimpl.com/>

## Procedure

### Step 1: Inventory the file

Record the source URL, the download timestamp, and the SHA-256 hash of the file before any further processing. Hash the file again after processing to confirm you did not modify it.

### Step 2: Run ExifTool with full recursion

```
exiftool -a -G -s -struct -ee -api RequestAll=3 target.jpg > target.exif.txt
```

Flags: `-a` shows duplicate tags, `-G` shows group names, `-s` shows tag names, `-struct` preserves structured fields, `-ee` extracts embedded metadata in videos, `-api RequestAll=3` forces extraction of tags ExifTool would otherwise suppress.

### Step 3: Extract PDF metadata separately

```
pdfinfo -meta target.pdf
pdfinfo -custom target.pdf
exiftool -a -G -s target.pdf
```

PDF metadata lives in the Info dictionary and the XMP packet; both must be checked. Look for `Producer`, `Creator`, `CreationDate`, `ModDate`, `Author`, `Title`, and any custom XMP fields such as `xmpMM:DocumentID` (which can reveal the original Adobe product version).

### Step 4: Examine Office documents

For `.docx`, `.xlsx`, `.pptx`, unzip the file (they are ZIP archives) and inspect `docProps/core.xml` and `docProps/app.xml`. Key fields: `creator`, `lastModifiedBy`, `Company`, `Template` (often a UNC path like `\\corp-fs01\templates\report.dotx`), `TotalTime` (edit time in minutes), `Revision`, and `AppVersion`.

```
unzip -l target.docx
unzip -p target.docx docProps/core.xml
unzip -p target.docx docProps/app.xml
```

### Step 5: Image-specific deep dive

For images, prioritise: `GPSLatitude` / `GPSLongitude` / `GPSAltitude` (decimal coordinates — convert with `exiftool -n` or `https://maps.google.com/?q=LAT,LON`), `Make` and `Model` (camera identification), `SerialNumber` (unique device identifier), `LensSerialNumber`, `Software` (editor signature), `OwnerName`, `Copyright`, `DateTimeOriginal` versus `ModifyDate` (mismatches indicate post-processing), and `ThumbnailImage` (sometimes a pre-edit copy of the picture is embedded).

### Step 6: Audio and video container analysis

```
ffprobe -v quiet -print_format json -show_format -show_streams target.mp4
```

Look for `creation_time`, `software`, `com.apple.quicktime.make` / `model` (iOS device identifiers), `com.apple.quicktime.location.ISO6709` (GPS as ISO string), `encoder`, and stream-level metadata that may include original frame rate and bit-depth.

### Step 7: Bulk metadata collection with Metagoofil

```
metagoofil -d acme.com -t pdf,doc,xls -l 50 -n 20 -o metagoofil_out/
```

This downloads up to 50 documents of each type from `acme.com` via Google dorks and extracts metadata in batch, useful for corporate footprinting.

### Step 8: Pivot on each extracted field

Treat every extracted field as a potential lead: GPS coordinates feed `reverse-image-search.md` and `photo-to-location.md` playbooks; author names feed `email-pivoting.md`; camera serial numbers allow tracking the same photographer across multiple published images via services like StolenCameraFinder; corporate server names in template paths feed `dns-recon.md` and `certificate-transparency.md`.

## Interpreting results

A *high-confidence field* is one that the file format stores verbatim and that ExifTool tags as native (no `[Writable: false]` or `[Unsafe]` markers). A *medium-confidence field* is software-inferred (e.g., MIME-type-based guesses about file type). A *low-confidence field* is any value that appears in a custom namespace you do not recognise — investigate before trusting. GPS coordinates with `GPSLatitudeRef` and `GPSLongitudeRef` set are high confidence; coordinates without the hemisphere reference may be misinterpreted.

## Common false positives

- Camera clocks that were not synchronised to NTP — `DateTimeOriginal` may be off by hours, days, or years.
- Office documents whose `lastModifiedBy` reflects an IT administrator who ran a migration tool, not the document's actual author.
- Images whose GPS was set manually to a fake location (rare, but documented in fraud cases).
- PDFs whose `Producer` field is set by a re-distiller and does not reflect the original authoring tool.
- Office documents whose core.xml `creator` is a generic service account (`SharePoint System Account`).
- EXIF preserved through reposts: the file you downloaded may have been re-saved by a different author without changing embedded metadata.

## Anti-patterns

- Do not upload sensitive files to online EXIF viewers; they keep copies. Use local tools for any file that is case-sensitive or contains personal information.
- Do not strip metadata from evidence copies — preserve the original bit-for-bit and extract metadata from the copy.
- Do not assume modern social media platforms preserve EXIF; Twitter, Facebook, Instagram, and WhatsApp strip EXIF on upload. The metadata will only be present in the original file before upload, or in downloads from platforms that preserve it (Flickr at original resolution, some blog engines, direct file shares).
- Do not treat `DateTimeOriginal` as authoritative without cross-checking against another timestamp source.
- Do not modify the file with image editors during analysis; even "Save As" rewrites metadata.

## Cross-references

- Related playbooks: `../pivot-playbooks/photo-to-location.md`, `../pivot-playbooks/file-to-author.md`
- Tools used: `../../tools/cli-tools.md`, `../../tools/free-tools.md`
- Domain guides: `../domains/corporate.md`, `../domains/web-infra.md`
