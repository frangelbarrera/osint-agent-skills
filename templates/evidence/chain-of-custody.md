# Chain of Custody

[Use this template when collected artifacts may be introduced in legal
proceedings. Chain of custody documents who touched an artifact, when, why, and
where it was stored at every point in its lifecycle. A gap in the chain can
render an artifact inadmissible. Complete one chain-of-custody record per
artifact. Delete this instruction paragraph once the template is filled in.]

## Artifact identification

[Identify the artifact unambiguously. The hash is the authoritative identifier
— filenames can collide, hashes cannot. Delete this instruction line.]

- Artifact ID: [evidence log ID, e.g., E-0007]
- Description: [one-line description of the artifact]
- Filename: [original or assigned filename]
- SHA-256 hash at collection: [lowercase hexadecimal]
- File size at collection: [bytes]
- MIME type: [if known]

## Collector identity

[The person or agent process that collected the artifact from its original
source. Delete this instruction line.]

- Collector name: [name or agent identifier]
- Collector role: [analyst / automated agent / contracted investigator]
- Organization: [name]
- Contact: [email or phone]

## Collection event

[The circumstances of collection. The method must be specific enough that a
third party could repeat the collection and obtain a comparable artifact.
Delete this instruction line.]

- Collection timestamp (UTC): [YYYY-MM-DDTHH:MM:SSZ]
- Source: [URL, system, or physical location]
- Collection method: [exact command, tool, or procedure used]
- Tool version: [version string of the collection tool]
- Network used: [description — e.g., analyst workstation on corporate LAN]
- Legal basis at time of collection: [reference to investigation plan section]
- Witness (if any): [name, or "none"]

## Transfer log

[Append a row every time the artifact changes hands, changes storage location,
or is converted to a new format. Every transfer must be timestamped and signed
by both the transferring and receiving party. Delete this instruction line.]

| Step | Timestamp (UTC) | From | To | Reason | New hash (if changed) | New location |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [timestamp] | [collector] | [analyst] | Initial intake | [hash or "unchanged"] | [path] |
| 2 | [timestamp] | [analyst] | [evidence vault] | Transfer to long-term storage | [hash or "unchanged"] | [path] |
| 3 | [timestamp] | [vault custodian] | [reviewer] | Review for inclusion in report | [hash or "unchanged"] | [path] |

## Storage

[Where the artifact is held between transfers. State the physical and logical
location, the access controls, and who has the ability to read or modify.
Delete this instruction line.]

- Current storage location: [path or system]
- Storage medium: [description — disk, object store, etc.]
- Access controls: [description]
- Authorized readers: [list of names or roles]
- Authorized writers: [list — should be minimal]
- Backup status: [backed up / not backed up, with date of last backup]

## Retention and destruction

[How long the artifact will be kept and how it will be destroyed at end of
life. Destruction must be verifiable. Delete this instruction line.]

- Retention period: [duration]
- Scheduled destruction date: [YYYY-MM-DD]
- Destruction method: [secure delete / cryptographic erasure / physical destruction]
- Destruction witness: [name — to be filled in at destruction time]
- Destruction certificate path: [path to the signed destruction record]

## Integrity verification

[Periodic re-hashing of the artifact to confirm it has not changed in storage.
Run a verification at minimum on intake, on every transfer, and on delivery of
the final report. Delete this instruction line.]

| Verification timestamp (UTC) | Performed by | Computed hash | Matches collection hash? |
| --- | --- | --- | --- |
| [timestamp] | [name] | [hash] | [yes / no] |
| [timestamp] | [name] | [hash] | [yes / no] |

## Notes

[Anything that does not fit the structured fields above. Include anomalies,
discrepancies, and the resolution of each. Delete this instruction line.]

[Note 1.]

[Note 2.]
