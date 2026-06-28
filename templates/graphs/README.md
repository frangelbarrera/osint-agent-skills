# Investigation Graph Templates

This directory contains templates for generating visual graphs during OSINT investigations. Graphs are mandatory components of any intelligence report — they allow the reader to see the relationships between entities at a glance, which text alone cannot convey.

## Available templates

| Template | Format | Use case |
|---|---|---|
| `mermaid-graph.md` | Mermaid (Markdown inline) | Default — renders in GitHub, Cursor, VS Code, Obsidian, most MD viewers |
| `dot-template.dot` | Graphviz DOT | High-quality rendered images via `dot -Tpng` |
| `graph-schema.json` | JSON | Machine-readable graph data for programmatic processing or Neo4j import |
| `timeline.md` | Markdown | Chronological timeline of findings (complements the graph) |

## When to generate a graph

Every investigation that produces two or more linked findings must include a graph. The system prompt's reporting standard requires it. The graph is placed in the **Findings** section of the intelligence report, after the executive summary and before the detailed findings list.

## How to choose the format

1. **Mermaid** — default choice. Renders inline in Markdown, no external tools needed. Best for graphs under 50 nodes.
2. **DOT/Graphviz** — use when the graph is complex (>50 nodes) or when you need pixel-perfect rendering. Requires Graphviz installed (`dot` command).
3. **JSON schema** — use when the graph data needs to be consumed by another tool (Neo4j, D3.js, custom dashboard). The agent should produce JSON alongside Mermaid or DOT.

## Entity types

The graph uses these entity types (node shapes in DOT, colors in Mermaid):

| Entity type | Mermaid style | DOT shape | Color |
|---|---|---|---|
| Person | `person1([Name])` | `ellipse` | `#FF6B6B` (red) |
| Domain | `domain1[domain.com]` | `box` | `#4ECDC4` (teal) |
| IP address | `ip1((1.2.3.4))` | `diamond` | `#FFE66D` (yellow) |
| Email | `email1>user@mail.com]` | `note` | `#95E1D3` (green) |
| Username | `user1{{username}}` | `hexagon` | `#C9B1FF` (purple) |
| Phone | `phone1[/+15551234567/]` | `parallelogram` | `#FFB347` (orange) |
| Crypto wallet | `wallet1[/bc1.../]` | `parallelogram` | `#F0E68C` (khaki) |
| Organization | `org1[[Company Inc.]]` | `box3d` | `#87CEEB` (sky blue) |
| ASN | `asn1((AS12345))` | `doubleoctagon` | `#DDA0DD` (plum) |
| Document | `doc1[(file.pdf)]` | `cylinder` | `#B0C4DE` (light steel) |
| Location | `loc1((City, Country))` | `circle` | `#98FB98` (pale green) |

## Relationship types

| Relationship | Label | Direction |
|---|---|---|
| resolves_to | resolves to | Domain → IP |
| registered_by | registered by | Domain → Person/Org |
| found_in_breach | found in | Email → Breach |
| same_identity | same as | Username → Person |
| communicates_with | communicates with | IP → IP |
| hosts | hosts | IP → Domain |
| uses_email | uses | Person → Email |
| uses_username | uses | Person → Username |
| owns_wallet | owns | Person → Crypto wallet |
| employed_at | employed at | Person → Organization |
| located_in | located in | Person/Org → Location |
| signed_cert | signed cert for | IP/Domain → Certificate |
| links_to | links to | Domain → Domain |
| phoned_from | called from | Phone → Person |

## Rules

1. Every node must have a label that includes the actual value (domain name, IP, email, etc.), not just an abstract identifier.
2. Every edge must have a label describing the relationship and a confidence level in parentheses: `resolves to (Confirmed)`.
3. Nodes with `Unverified` confidence should have a dashed border in DOT or a `:::unverified` class in Mermaid.
4. The graph title must be the investigation subject and date.
5. A legend must accompany the graph if more than 3 entity types are present.
