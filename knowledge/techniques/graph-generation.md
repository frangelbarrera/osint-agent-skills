# Technique: Investigation Graph Generation

## What this technique does

Investigation graph generation transforms a flat list of findings into a visual network of entities and relationships. The graph serves three purposes: (1) it lets the analyst see the investigation's scope and connections at a glance, (2) it reveals missing pivots — nodes with only one edge that may warrant further investigation, and (3) it provides the reader of the intelligence report with a navigable map of the evidence. This technique defines how an autonomous agent generates graphs during an investigation, which format to use, and how to embed the graph in the final report.

## When to use it

- **Every investigation producing 2+ linked findings.** The system prompt's reporting standard requires a graph in the Findings section.
- **Mid-investigation.** Generating a partial graph helps the agent identify unexplored pivots. A node with no outgoing edges is a pivot opportunity.
- **Post-investigation.** The final graph accompanies the intelligence report.

## Formats

### Mermaid (default)

Mermaid is the default format because it renders inline in Markdown — no external tools required. It works in GitHub, GitLab, Cursor, VS Code, Obsidian, Notion, and most modern Markdown viewers.

**When to use:** Graphs under 50 nodes. Most investigations.

**Syntax reference:**

```mermaid
graph TB
    classDef person fill:#FF6B6B,stroke:#333,color:#fff
    classDef domain fill:#4ECDC4,stroke:#333,color:#fff
    classDef ip fill:#FFE66D,stroke:#333,color:#333
    classDef unverified stroke-dasharray: 5 5,fill:#f9f9f9,stroke:#999

    person1([John Doe]):::person
    domain1[example.com]:::domain
    ip1((93.184.216.34)):::ip
    user1{{johndoe99}}:::unverified

    domain1 -->|resolves to (Confirmed)| ip1
    person1 -->|uses email (Confirmed)| email1
    user1 -->|same identity as (Unverified)| person1
```

**Rules:**
- Node IDs must be lowercase alphanumeric (Mermaid limitation): `person1`, `domain1`, `ip1`.
- Labels go in parentheses for persons `([Name])`, brackets for domains `[domain]`, double-parens for IPs `((IP))`, double-curly for usernames `{{username}}`.
- Confidence goes in parentheses in the edge label: `|resolves to (Confirmed)|`.
- Unverified nodes get the `:::unverified` class (dashed border).

### Graphviz DOT (complex graphs)

**When to use:** Graphs over 50 nodes, or when you need high-quality rendered images for PDF/print reports.

**Rendering:**
```bash
dot -Tpng graph.dot -o graph.png
dot -Tsvg graph.dot -o graph.svg
```

See `templates/graphs/dot-template.dot` for the full template with entity-type styling.

### JSON schema (machine-readable)

**When to use:** When the graph data needs to be consumed by another tool — Neo4j import, D3.js visualization, custom dashboard, or another agent.

The JSON schema at `templates/graphs/graph-schema.json` defines the structure. It is compatible with Neo4j's `LOAD CSV` import pipeline:

```cypher
// Neo4j import from JSON nodes
LOAD JSON FROM "file:///graph.json" AS graph
UNWIND graph.nodes AS node
MERGE (n:Entity {id: node.id})
SET n.type = node.type, n.label = node.label, n.confidence = node.confidence;

// Neo4j import from JSON edges
LOAD JSON FROM "file:///graph.json" AS graph
UNWIND graph.edges AS edge
MATCH (a:Entity {id: edge.source}), (b:Entity {id: edge.target})
MERGE (a)-[r:RELATES {type: edge.relationship, confidence: edge.confidence}]->(b);
```

## Procedure

### Step 1: Collect entities

During the investigation, maintain a running list of every entity discovered. Each entity gets:
- A unique ID (`domain_1`, `ip_1`, `person_1`, etc.)
- A type from the entity type vocabulary (see `templates/graphs/README.md`)
- The actual observed value (domain name, IP address, email, etc.)
- A confidence level (Confirmed, Probable, Unverified, Inferred)
- The source tool and timestamp

### Step 2: Collect relationships

For every pivot performed, record:
- Source entity ID
- Target entity ID
- Relationship type from the vocabulary
- Confidence level
- Source tool and timestamp

### Step 3: Generate the graph

At report generation time:

1. Count nodes and edges. If under 50 nodes, use Mermaid. If over 50, use DOT.
2. Apply entity-type styling (colors and shapes per `templates/graphs/README.md`).
3. Apply confidence styling — unverified nodes get dashed borders.
4. Add edge labels with relationship type and confidence.
5. Add a title: "Investigation Graph: [subject] — [date]".
6. If >3 entity types are present, add a legend.
7. Generate the JSON representation alongside the visual graph. The JSON goes in the evidence log; the visual graph goes in the report.

### Step 4: Analyze the graph

Before finalizing the report, inspect the graph for:
- **Isolated nodes** (no edges) — these are findings that didn't lead anywhere. Consider whether a pivot was missed.
- **Single-edge nodes** — these may warrant additional pivots. Document why no further pivots were performed (scope limitation, rate limit, etc.).
- **Clusters** — groups of tightly connected nodes may represent an infrastructure or identity cluster worth highlighting in the executive summary.
- **Contradictory edges** — two edges with conflicting relationships (e.g., same domain resolves to two different IPs) should be explained in the findings text.

### Step 5: Embed in report

Place the graph in the **Findings** section of the intelligence report, after the executive summary and before the detailed findings list. Add a "Graph Notes" subsection with:
- Entity and relationship counts
- Confidence breakdown
- Date of generation
- Note about unverified nodes

## Anti-patterns

- **Do not generate graphs with fabricated entities.** Every node must correspond to a real finding observed through a tool. If you are drawing a hypothetical connection, label it as "Inferred" or "Speculative."
- **Do not omit the confidence labels.** A graph without confidence labels is misleading — it presents all relationships as equally certain.
- **Do not use the graph as a substitute for the findings list.** The graph is a visual aid; the detailed findings with sources, timestamps, and tool output go in the text.
- **Do not let the graph grow unbounded.** If the graph exceeds 100 nodes, consider splitting it into sub-graphs by entity type or investigation phase. A 200-node graph is unreadable.
- **Do not use different relationship labels for the same relationship type.** Stick to the vocabulary in `templates/graphs/README.md`. "resolves_to" and "points_to" are the same thing — pick one.
- **Do not forget to update the graph if the investigation continues.** A stale graph is worse than no graph.

## Integration with evidence log

The JSON representation of the graph should be saved as an artifact in the evidence log. The evidence log entry should include:
- The JSON file path
- A SHA-256 hash of the file
- The generation timestamp
- The list of source tool invocations that produced the entities and edges

This allows downstream analysts to verify that every node and edge in the graph traces back to a real tool invocation.

## Cross-references

- Templates: `../../templates/graphs/mermaid-graph.md`, `../../templates/graphs/dot-template.dot`, `../../templates/graphs/graph-schema.json`
- Methodology: `../methodologies/intelligence-cycle.md` (Phase 4 — Analysis and Production)
- Ethics: `../../ethics/anti-hallucination.md` (confidence labeling requirements)
- Reporting: `../../templates/reports/intelligence-report.md` (graph placement in report)
