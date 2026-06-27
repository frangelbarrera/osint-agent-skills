# Investigation Graph Template (Mermaid)

> Copy this template into your intelligence report. Replace the placeholder
> nodes and edges with actual findings from your investigation. Delete this
> comment block before publishing.

## Entity Relationship Graph

```mermaid
graph TB
    %% ── Styles ──────────────────────────────────────────────────────────
    classDef person fill:#FF6B6B,stroke:#333,stroke-width:2px,color:#fff
    classDef domain fill:#4ECDC4,stroke:#333,stroke-width:2px,color:#fff
    classDef ip fill:#FFE66D,stroke:#333,stroke-width:2px,color:#333
    classDef email fill:#95E1D3,stroke:#333,stroke-width:2px,color:#333
    classDef username fill:#C9B1FF,stroke:#333,stroke-width:2px,color:#fff
    classDef phone fill:#FFB347,stroke:#333,stroke-width:2px,color:#fff
    classDef wallet fill:#F0E68C,stroke:#333,stroke-width:2px,color:#333
    classDef org fill:#87CEEB,stroke:#333,stroke-width:2px,color:#333
    classDef asn fill:#DDA0DD,stroke:#333,stroke-width:2px,color:#fff
    classDef doc fill:#B0C4DE,stroke:#333,stroke-width:2px,color:#333
    classDef location fill:#98FB98,stroke:#333,stroke-width:2px,color:#333
    classDef unverified stroke-dasharray: 5 5,fill:#f9f9f9,stroke:#999

    %% ── Nodes ───────────────────────────────────────────────────────────
    %% Replace these with your actual findings. Each node ID must be unique.
    %% Use the entity type class from the styles above.

    person1([John Doe]):::person
    domain1[example.com]:::domain
    ip1((93.184.216.34)):::ip
    email1>johndoe@example.com]:::email
    user1{{johndoe1337}}:::username
    org1[[Acme Corp]]:::org
    asn1((AS15169)):::asn
    loc1((Boston, US)):::location

    %% Unverified node example (dashed border)
    user2{{jdoe99}}:::unverified

    %% ── Edges ───────────────────────────────────────────────────────────
    %% Label format: "relationship (Confidence)"
    %% Confidence: Confirmed, Probable, Unverified, Inferred

    domain1 -->|resolves to (Confirmed)| ip1
    domain1 -->|registered by (Probable)| org1
    person1 -->|uses email (Confirmed)| email1
    person1 -->|uses username (Probable)| user1
    person1 -->|employed at (Confirmed)| org1
    ip1 -->|belongs to (Confirmed)| asn1
    person1 -->|located in (Probable)| loc1
    user2 -->|same identity as (Unverified)| user1

    %% ── Legend (optional, include if >3 entity types) ────────────────────
    %% subgraph Legend
    %%   lp([Person]):::person
    %%   ld[Domain]:::domain
    %%   li((IP)):::ip
    %%   le>Email]:::email
    %%   lu{{Username}}:::username
    %%   lo[[Org]]:::org
    %%   las((ASN)):::asn
    %%   ll((Location)):::location
    %% end
```

## Graph Notes

- **Total entities:** [N]
- **Total relationships:** [N]
- **Confirmed:** [N] — corroborated by 2+ independent primary sources
- **Probable:** [N] — supported by 1 primary source or multiple secondary sources
- **Unverified:** [N] — single secondary source, pending corroboration
- **Inferred:** [N] — logically derived, not directly observed

## Notes

- Nodes with dashed borders are **Unverified** — treat as leads, not findings.
- All edges labeled with confidence per `ethics/anti-hallucination.md`.
- This graph was generated on [YYYY-MM-DD] and reflects data available at that time.
- For the raw graph data in JSON format, see the evidence log.
