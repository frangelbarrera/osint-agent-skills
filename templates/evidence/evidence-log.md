# Evidence Log

[This is an append-only log. Every artifact collected during an investigation
must be recorded here at the moment of collection. Do not edit or delete rows
after they are written — if an artifact is later determined to be irrelevant or
mistaken, add a new row noting the retraction and reference the original row
ID. Delete this instruction paragraph once the template is filled in.]

## Hashing requirement

Hash every artifact at collection time and record the hash in the table below.
This proves the artifact was not tampered with between collection and
reporting. Use SHA-256, computed against the exact bytes stored on disk, not
against a re-rendered version. Record the hash in lowercase hexadecimal.

To compute the hash:

```bash
sha256sum /path/to/artifact
```

If the artifact is a directory, tar it first and hash the tarball:

```bash
tar -cf - /path/to/dir | sha256sum
```

If a recomputed hash at any later point does not match the recorded hash, treat
the artifact as compromised and investigate the discrepancy before relying on
the artifact in a report.

## Log table

[Append one row per artifact collected. IDs are sequential and never reused.
Timestamps are UTC in ISO 8601. The artifact path is relative to the run's
working directory. Delete this instruction line.]

| ID | Timestamp (UTC) | Source (tool + URL) | Query | Result summary | Artifact hash (SHA-256) | Artifact path | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| E-0001 | 2025-01-15T09:14:22Z | whois CLI / rdap.org | `whois example.com` | Registration record for example.com; registrar ACME, created 2020-03-01 | `a1b2c3d4e5f6...` | `artifacts/whois_example_com_20250115.txt` | Registrant redacted |
| E-0002 | 2025-01-15T09:18:40Z | curl / https://example.com | `curl -sL https://example.com` | Landing page HTML, 14 KB, title "Example Domain" | `f7e6d5c4b3a2...` | `artifacts/example_com_index.html` | Captured with `-L` to follow redirects |
| E-0003 | 2025-01-15T09:25:11Z | dnsx CLI / authoritative NS | `dnsx -d example.com -a -resp` | A record 93.184.216.34, TTL 3600 | `09f8e7d6c5b4...` | `artifacts/dnsx_example_com_a.txt` | Resolved against 1.1.1.1 then authoritative |

[Continue appending rows as collection proceeds. Do not reorder existing rows.
Do not leave columns blank — use "n/a" where a field does not apply. Delete this
instruction line.]

## Retraction rows

[If an artifact is later retracted, append a new row whose ID continues the
sequence, whose Artifact path points to the retraction note, and whose Notes
column references the original row ID. Delete this instruction line.]

| ID | Timestamp (UTC) | Source | Query | Result summary | Artifact hash | Artifact path | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| E-NNNN | [timestamp] | [source] | [query] | Retraction of E-0007 | [hash] | `artifacts/retraction_E0007.txt` | Originally logged artifact was a misconfigured query; see note |

## Cross-references

[Reports cite evidence by row ID. When a report is delivered, verify that every
cited ID exists in this log and that no cited artifact has been retracted.
Delete this instruction line.]
