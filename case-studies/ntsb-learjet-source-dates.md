# Learjet 60 case chronology and source dates

This example uses two updates in the National Transportation Safety Board's public
investigation record for the November 1, 2026 Learjet 60 crash near Greenacres, Florida.
The exercise records what the NTSB had confirmed by each update. The source describes
its information as preliminary.

## OSINT methodology applied

1. Open the [NTSB investigation page](https://www.ntsb.gov/Investigations/Pages/ERA27MA026.aspx)
   and locate the November 8 and November 9 updates.
2. Record the date of each update and identify the event or status it describes.
3. For each event, record the most precise time supported by the source. Leave the
   exact event time unknown if the source gives only the date of public confirmation.
4. Preserve both updates. A later status can supersede an earlier status while the
   earlier update remains useful for reconstructing what was known at the time.

The following command prints the same sample in a form you can paste into a spreadsheet.

```sh
python3 - <<'PYTHON'
import csv
import sys

writer = csv.writer(sys.stdout, lineterminator="\n")
writer.writerow(["event_or_status", "source_update", "time_supported_by_source"])
writer.writerow(["Excavation remained underway", "2026-11-08", "As of the Nov. 8 update"])
writer.writerow(["Recorder recovery confirmed", "2026-11-09", "By the Nov. 9 update"])
writer.writerow(["Excavation completion confirmed", "2026-11-09", "By the Nov. 9 update"])
PYTHON
```

Expected output

```csv
event_or_status,source_update,time_supported_by_source
Excavation remained underway,2026-11-08,As of the Nov. 8 update
Recorder recovery confirmed,2026-11-09,By the Nov. 9 update
Excavation completion confirmed,2026-11-09,By the Nov. 9 update
```

## Lessons

- Preserve the difference between a status update, a dated event and a confirmation
  that establishes an upper bound.
- State the bounds separately for each event. The November 8 update documents that
  excavation was still underway. Its silence about recorder recovery gives no
  reliable lower bound for recovery.
- Keep the exact recovery time unknown unless another source supplies it. Preserve the
  preliminary status when citing these updates.

## Attribution

- [NTSB investigation ERA27MA026](https://www.ntsb.gov/Investigations/Pages/ERA27MA026.aspx),
  November 8 and 9, 2026 updates. Primary source.
- [H1DR4 worksheet and answer key](https://gist.github.com/nativ3ai/15f9e3fe2d680c0ebc875fd0636df74f).
  Companion exercise and public case chronology prepared by the contributor.
