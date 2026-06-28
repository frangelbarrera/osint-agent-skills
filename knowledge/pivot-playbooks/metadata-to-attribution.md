# Pivot Playbook: Document Metadata -> Author Identity

## Trigger

You have a document file — PDF, DOCX, XLSX, PPTX, RTF, ODT, JPG, MP3, MP4 — that was published or leaked by a target organization, scraped from a target website, attached to a phishing email, or recovered from a breach corpus. The document is the seed artifact; the goal of this playbook is to extract every metadata field that could identify the author or last-modifier, run FOCA-style corpus analysis to cross-reference authors across documents from the same domain, extract Microsoft Office revision IDs (which can be GUIDs and therefore globally trackable), recover prior unredacted versions from the Wayback Machine, and produce a corroborated author-identity attribution.

This is the FOCA methodology (https://github.com/ElevenPaths/FOCA) adapted for headless / agent-driven workflows. The agent uses ExifTool and Metagoofil in place of FOCA's GUI; the analysis principles are identical.

## Inputs

- The document file (unmodified — do not open and re-save it through any application, which would overwrite metadata).
- Optional: a corpus of related documents (multiple PDFs from the same domain, multiple DOCX from the same breach).
- Optional: target domain (for corpus analysis via Metagoofil).
- Local installs of: ExifTool (`apt install libimage-exiftool-perl`), Metagoofil (`pipx install metagoofil`), Python with `olefile` (for OLE documents) and `pdfminer` / `pypdf` (for PDF internals).
- Web access to: Wayback Machine CDX API, Google search (for `filetype:` dorks).

## Step 1: Full metadata extraction with ExifTool

- **Tool:** ExifTool — https://exiftool.org/
- **Command:**
  ```bash
  exiftool -j -a -u -g1 -ee document.docx > document_metadata.json
  jq '.[0] | {EXIF, IPTC, XMP, PDF, DOC, Composite, File}' document_metadata.json
  ```
  For PDFs, also extract the raw document info dictionary:
  ```bash
  exiftool -a -u -g1 document.pdf
  # Equivalent low-level probe:
  python3 -c "from pypdf import PdfReader; r=PdfReader('document.pdf'); print(r.metadata)"
  ```
- **Expected output:** A complete metadata dump. For DOCX, expect `Author`, `LastModifiedBy`, `Title`, `Subject`, `Keywords`, `Comments`, `Creator`, `Producer`, `RevisionNumber`, `TotalEditTime`, `Created`, `Modified`, `Application`, `AppVersion`, `Company`, `Manager`. For PDF, expect `Author`, `Title`, `Subject`, `Keywords`, `Creator`, `Producer`, `CreationDate`, `ModDate`. For images, expect `Make`, `Model`, `LensModel`, `SerialNumber`, `GPSLatitude`, `GPSLongitude`, `DateTimeOriginal`, `Software`.
- **Pivot point:** The `Author` and `LastModifiedBy` fields are the highest-value identifiers — they often contain real names ("John Doe"), email addresses ("john.doe@acme.com"), or active-directory-style handles ("ACME\\jdoe"). The `Creator` field often names the authoring application plus version ("Microsoft Office Word" with version); the `Producer` field names the PDF generation tool. The `Company` and `Manager` fields, when present in DOCX, are corporate org-chart leaks.

## Step 2: Extract Microsoft Office revision IDs and GUIDs

- **Tool:** `olefile` Python library — https://www.python-olefile.readthedocs.io/, plus manual binary inspection.
- **Command:**
  ```python
  import olefile
  ole = olefile.OleFileIO('document.docx')
  # The DocSummaryInformation and SummaryInformation streams hold the metadata
  for stream in ['\x05SummaryInformation', '\x05DocumentSummaryInformation']:
      if ole.exists(stream):
          data = ole.openstream(stream).read()
          print(f"--- {stream} ---")
          print(data.hex())
  ole.close()
  ```
  Also examine the `docProps/custom.xml` part inside the DOCX ZIP:
  ```bash
  mkdir -p docx_extract
  cd docx_extract
  unzip ../document.docx
  cat docProps/custom.xml
  cat docProps/app.xml
  cat docProps/core.xml
  ```
- **Expected output:** The `core.xml` contains the standard Dublin Core fields (`creator`, `lastModifiedBy`, `created`, `modified`). The `app.xml` contains `Application`, `AppVersion`, `Company`, `Manager`, `Template`, `TotalTime`, `Pages`, `Words`, `Characters`, `PresentationFormat`, `Lines`, `Paragraphs`, `Slides`, `Notes`, `HiddenSlides`, `TitlesOfParts`. The `custom.xml` may contain organization-specific custom properties — sometimes internal project codes, employee IDs, or workflow stages.
- **Pivot point:** Microsoft Office embeds a `_GUID` property in some documents (particularly older `.doc`/`.xls`/`.ppt` files via OLE structured storage). The GUID can be globally unique and is sometimes trackable across documents — if two documents share the same GUID, they were authored on the same Office installation. The `TitlesOfParts` field in Excel sheets reveals internal worksheet names, which sometimes contain project codenames or department names.

## Step 3: FOCA-style corpus analysis with Metagoofil

- **Tool:** Metagoofil — https://github.com/opsdisk/metagoofil
- **Command:**
  ```bash
  metagoofil -d example.com -t pdf,doc,xls,ppt,docx,xlsx,pptx -l 50 -n 10 -o corpus_output/
  # -l 50: download up to 50 results per filetype
  # -n 10: download first 10 files of each type
  # Then extract metadata across the corpus:
  for f in corpus_output/*.pdf corpus_output/*.doc* corpus_output/*.xls* corpus_output/*.ppt*; do
    exiftool -j -a -u "$f" 2>/dev/null
  done | jq -s 'map(.[0]) | group_by(.Author) | map({author: .[0].Author, count: length, files: [.[].FileName]})' > corpus_by_author.json
  ```
- **Expected output:** A directory of downloaded documents plus a JSON summary grouping documents by `Author` field, with each group listing the file names.
- **Pivot point:** The author-grouping reveals the org's document authors. Each author name is a candidate identity; cross-reference with LinkedIn, the org's website team page, and breach corpora. Authors who appear across many documents are likely established staff; authors who appear once may be contractors or short-term employees.

## Step 4: Cross-reference authors across the corpus

- **Tool:** None — analysis step.
- **Command:** For each unique `Author` value extracted in Steps 1 and 3, build a profile:
  - Documents authored
  - Earliest and latest document dates
  - File types used (DOCX, PPTX, XLSX) — implies role
  - `Company` and `Manager` fields (corporate hierarchy)
  - `Application` and `AppVersion` (which Office version, which platform — Mac vs Windows)
  - Co-occurrence with other authors in the corpus (which suggests collaboration)
- **Expected output:** A per-author structured profile.
- **Pivot point:** Each profile is the seed for `email-to-username.md` (search the author name plus the org domain for the email pattern — `john.doe@`, `jdoe@`, `j.doe@`) and `username-to-identity.md` (the author name is often a username on professional networks).

## Step 5: Examine the PDF internals for hidden authorship

- **Tool:** `pypdf` (Python) — https://pypdf.readthedocs.io/, or `qpdf` — https://github.com/qpdf/qpdf
- **Command:**
  ```bash
  # Inspect the PDF object dictionary directly
  python3 <<'EOF'
  from pypdf import PdfReader
  r = PdfReader('document.pdf')
  print("=== Document Info ===")
  print(r.metadata)
  print("=== XMP Metadata ===")
  print(r.xmp_metadata)
  print("=== Number of pages ===")
  print(len(r.pages))
  EOF

  # qpdf for object-level inspection
  qpdf --qdf --object-streams=disable document.pdf document_qdf.pdf
  # Now grep the decompressed PDF for /Author, /Creator, /Producer, /Title
  rg -a '/(Author|Creator|Producer|Title|Subject|Keywords|CreationDate|ModDate)' document_qdf.pdf
  ```
- **Expected output:** The PDF `/Info` dictionary plus any embedded XMP metadata block. The `qpdf` decompression reveals hidden objects that some PDF "scrubbers" miss.
- **Pivot point:** Many PDF redaction tools remove the top-level `/Author` field but leave XMP metadata intact. XMP can contain `xmp:CreatorTool`, `xmpMM:DocumentID`, `xmpMM:InstanceID`, `dc:creator`, `pdf:Producer`, `pdf:Keywords`. The `DocumentID` is sometimes a GUID and is unique per source document — finding the same `DocumentID` across two PDFs implies they were generated from the same source file (e.g., same InDesign project).

## Step 6: Check Wayback for prior versions of the document

- **Tool:** Wayback Machine CDX API — https://web.archive.org/cdx/search/cdx, `twayback` — https://github.com/anthonyharrison/twayback
- **Command:**
  ```bash
  # Find all snapshots of the document's URL
  curl -s "https://web.archive.org/cdx/search/cdx?url=example.com/documents/report.pdf&output=json&collapse=digest&fl=timestamp,original,statuscode,digest" | jq .

  # Download each snapshot
  twayback -u "https://example.com/documents/report.pdf" -o wayback_versions/
  ```
- **Expected output:** A timestamped list of archived snapshots of the document, downloaded as separate PDFs.
- **Pivot point:** Compare metadata across snapshots. A common pattern: the organization publishes the PDF with full metadata (real author name, internal AD username), then redacts it after a public-records request or media inquiry — but the Wayback Machine retains the original. The redacted 2024 version says "Author: redacted"; the 2018 snapshot says "Author: john.doe@acme.com". This is a high-value pivot.

## Step 7: Examine image and audio metadata embedded in the document

- **Tool:** ExifTool (recursive), `binwalk` for embedded-file discovery.
- **Command:**
  ```bash
  # ExifTool can recurse into embedded images in DOCX/PDF
  exiftool -a -u -g1 -ee document.docx

  # binwalk finds embedded files
  binwalk document.docx
  binwalk -e document.docx  # extract embedded files to _document.docx.extracted/

  # Then exiftool each extracted image
  for img in _document.docx.extracted/*.jpg _document.docx.extracted/*.png; do
    [ -f "$img" ] && exiftool -j -a -u "$img"
  done
  ```
- **Expected output:** Embedded images extracted, each with their own EXIF metadata. Camera make, model, serial number, GPS coordinates, original-capture timestamp.
- **Pivot point:** A DOCX containing a screenshot taken by the author on their phone may retain the phone's GPS coordinates — direct location attribution. A camera serial number is globally unique and can be cross-referenced across other photos on Flickr, public image galleries, and stock-photo sites.

## Step 8: Compose the author-identity attribution

- **Tool:** None — analysis step.
- **Command:** Aggregate all findings:
  - Author name (from `Author` field)
  - Last-modifier name (from `LastModifiedBy`)
  - Email pattern (inferred from author name + organization domain)
  - GUID / DocumentID (cross-document tracking)
  - Co-authors (from corpus analysis)
  - Authoring platform (Office version, OS)
  - Historical metadata (from Wayback)
  - Embedded-image attribution (camera, GPS)
- **Expected output:** A structured author-identity record.
- **Pivot point:** The record is the deliverable. If a real name has been recovered, the next playbook is typically `email-to-username.md` (search the name + org domain for the email pattern) or `username-to-identity.md` (the author name itself is often a username on professional networks).

## Anti-Patterns (what NOT to do)

- **Do not open and re-save the document in any application.** Microsoft Word, Adobe Acrobat, and even Google Docs overwrite metadata on save. Always work on a copy of the original file, and use ExifTool / `olefile` for read-only inspection.
- **Do not assume the `Author` field is the actual author.** Many documents are created from templates that retain the template author's name. Cross-corroborate via corpus analysis: if the same `Author` appears on 500 documents across 5 years, it is likely the template's author, not the document's author. The `LastModifiedBy` field is often more reliable for the actual recent editor.
- **Do not treat GUIDs as definitive cross-document links.** Microsoft Office GUIDs are sometimes per-installation, sometimes per-document, and the behavior has changed across Office versions. Two documents with the same GUID were likely authored on the same Office installation; two documents with different GUIDs may still have the same author on a different machine.
- **Do not assume redacted metadata is fully removed.** PDF "scrubber" tools vary widely in thoroughness. Always check both `/Info` and XMP, and always run `qpdf --qdf` to decompress and search the raw PDF.
- **Do not publish embedded-image EXIF without considering bystander privacy.** A photo embedded in a corporate report may contain GPS coordinates of a private residence. Apply harm-minimization rules in `ethics/privacy-guidelines.md` before publishing.
- **Do not assume the document's filename is its original filename.** Filenames are often changed when documents are uploaded, emailed, or re-shared. The metadata timestamps are more reliable than the filename.
- **Do not treat `CreationDate` and `ModDate` as authoritative.** These can be manipulated. Cross-reference with the document's content (does the body reference events that postdate the stated creation date?).
- **Do not omit the file hash.** Always record the SHA-256 of the document at the start of analysis. If the document is later modified (e.g., the org publishes a redacted version), the hash difference proves they are different files.
- **Do not infer identity from a single metadata field.** `Author: John Smith` on one document is a hypothesis. `Author: John Smith`, `LastModifiedBy: jsmith`, `Company: Acme Corp`, embedded image GPS near Acme HQ, and the same `DocumentID` on 30 other Acme documents — that is corroborated identity attribution.
- **Do not download documents from suspicious sources without sandboxing.** Some documents contain macro malware (especially `.doc` and `.xls` legacy formats). ExifTool reads metadata without executing macros, but unzipping a DOCX or opening it in Office does execute code. Use a sandboxed environment for any document whose provenance is uncertain.

## Output Format

When you complete this pivot, report:

- **Seed document:** filename, file type, file size, SHA-256 hash, source URL
- **Author and LastModifiedBy:** raw values from metadata
- **Microsoft Office metadata:** Application, AppVersion, Company, Manager, Template, RevisionNumber, TotalEditTime, Created, Modified, TitlesOfParts
- **PDF metadata:** /Author, /Creator, /Producer, /Title, /Subject, /Keywords, /CreationDate, /ModDate, XMP block summary
- **Embedded image metadata:** per-image EXIF (Make, Model, SerialNumber, GPS, DateTimeOriginal)
- **GUIDs and DocumentIDs:** values that can be cross-referenced across documents
- **Corpus analysis (if applicable):** per-author profile aggregating multiple documents
- **Wayback recoveries:** snapshot dates and metadata values recovered from each snapshot
- **Author-identity attribution:** name, email pattern, role, organizational context
- **Confidence:** low / medium / high with explicit reasoning
- **Limitations:** redacted fields, missing data, template-author confusion, application-version ambiguity

## Cross-references

- Related playbooks: [`email-to-username.md`](email-to-username.md), [`username-to-identity.md`](username-to-identity.md), [`photo-to-location.md`](photo-to-location.md) (for embedded-image EXIF analysis), [`domain-to-infrastructure.md`](domain-to-infrastructure.md) (Metagoofil uses the domain as input)
- Tools used: [`../../tools/cli-tools.yaml`](../../tools/cli-tools.yaml) (ExifTool, Metagoofil, twayback), [`../../tools/free-tools.yaml`](../../tools/free-tools.yaml) (Wayback CDX)
- Ethics: [`../../ethics/privacy-guidelines.md`](../../ethics/privacy-guidelines.md) (PII in metadata, embedded-image EXIF), [`../../ethics/anti-hallucination.md`](../../ethics/anti-hallucination.md) (do not invent metadata values), [`../../ethics/legal-frameworks.md`](../../ethics/legal-frameworks.md) (document handling for legal admissibility)
