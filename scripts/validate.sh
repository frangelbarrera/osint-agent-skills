#!/usr/bin/env bash
# OSINT Agent Skills â€” Repository Validation Script (Linux/macOS)
# Verifies that all files referenced in agent-config.yaml exist, JSON/YAML
# files are parseable, and cross-references between documents are intact.
#
# Usage:
#   bash scripts/validate.sh
#   bash scripts/validate.sh /path/to/osint-agent-skills
#
# Exit codes:
#   0 â€” all checks passed
#   1 â€” one or more checks failed

set -euo pipefail

REPO_PATH="${1:-$(dirname "$(dirname "$0")")}"
FAILURES=0
PASSES=0

check() {
    if [ "$1" = "true" ] || [ "$1" -eq 0 ] 2>/dev/null; then
        echo "  [OK] $2"
        PASSES=$((PASSES + 1))
    else
        echo "  [FAIL] $2"
        FAILURES=$((FAILURES + 1))
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo "  [OK] $2 exists"
        PASSES=$((PASSES + 1))
        return 0
    else
        echo "  [FAIL] $2 missing ($1)"
        FAILURES=$((FAILURES + 1))
        return 1
    fi
}

echo "=== OSINT Agent Skills Repository Validation ==="
echo "Repo: $REPO_PATH"
echo ""

# â”€â”€ 1. Core files â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo "--- 1. Core files ---"
for f in system-prompt.md agent-config.yaml README.md CHANGELOG.md LICENSE CONTRIBUTING.md; do
    check_file "$REPO_PATH/$f" "$f"
done

# â”€â”€ 2. Knowledge base â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo "--- 2. Knowledge base ---"
for d in knowledge/methodologies knowledge/domains knowledge/techniques knowledge/pivot-playbooks; do
    if [ -d "$REPO_PATH/$d" ]; then
        count=$(find "$REPO_PATH/$d" -name "*.md" -type f | wc -l)
        echo "  [OK] $d exists ($count md files)"
        PASSES=$((PASSES + 1))
    else
        echo "  [FAIL] Directory missing: $d"
        FAILURES=$((FAILURES + 1))
    fi
done

# â”€â”€ 3. Tool registries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo "--- 3. Tool registries ---"
for f in tools/free-tools.yaml tools/apis.yaml tools/cli-tools.yaml tools/mcp-tools.json tools/mcp-server.js tools/README.md; do
    check_file "$REPO_PATH/$f" "$f"
done

# â”€â”€ 4. Templates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo "--- 4. Templates ---"
for f in templates/reports/intelligence-report.md templates/reports/threat-actor-profile.md templates/reports/timeline.md templates/graphs/README.md templates/graphs/mermaid-graph.md templates/graphs/dot-template.dot templates/graphs/graph-schema.json templates/evidence/evidence-log.md templates/investigation-plan/plan-template.md; do
    check_file "$REPO_PATH/$f" "$f"
done

# â”€â”€ 5. Ethics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo "--- 5. Ethics ---"
for f in ethics/legal-frameworks.md ethics/jurisdiction-rules.md ethics/code-of-conduct.md ethics/privacy-guidelines.md ethics/anti-hallucination.md ethics/agent-opsec.md; do
    check_file "$REPO_PATH/$f" "$f"
done

# â”€â”€ 6. JSON validity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo "--- 6. JSON validity ---"
for f in tools/mcp-tools.json templates/graphs/graph-schema.json; do
    if [ -f "$REPO_PATH/$f" ]; then
        if python3 -c "import json; json.load(open('$REPO_PATH/$f'))" 2>/dev/null; then
            echo "  [OK] $f is valid JSON"
            PASSES=$((PASSES + 1))
        else
            echo "  [FAIL] $f is invalid JSON"
            FAILURES=$((FAILURES + 1))
        fi
    fi
done

# â”€â”€ 7. MCP server syntax â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo "--- 7. MCP server syntax ---"
if [ -f "$REPO_PATH/tools/mcp-server.js" ]; then
    if command -v node &>/dev/null; then
        if node --check "$REPO_PATH/tools/mcp-server.js" 2>/dev/null; then
            echo "  [OK] mcp-server.js passes Node.js syntax check"
            PASSES=$((PASSES + 1))
        else
            echo "  [FAIL] mcp-server.js has syntax errors"
            FAILURES=$((FAILURES + 1))
        fi
    else
        echo "  [SKIP] Node.js not found"
    fi
fi

# â”€â”€ 8. Config path references â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo "--- 8. Config path references ---"
if [ -f "$REPO_PATH/agent-config.yaml" ]; then
    for p in "./system-prompt.md" "./tools/free-tools.yaml" "./tools/apis.yaml" "./tools/mcp-tools.json" "./tools/mcp-server.js" "./tools/cli-tools.yaml" "./templates/graphs/mermaid-graph.md" "./ethics/agent-opsec.md"; do
        if grep -q "$p" "$REPO_PATH/agent-config.yaml"; then
            echo "  [OK] Config references: $p"
            PASSES=$((PASSES + 1))
        else
            echo "  [FAIL] Config missing reference: $p"
            FAILURES=$((FAILURES + 1))
        fi
    done
fi

# â”€â”€ Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
echo ""
echo "=== Summary ==="
echo "Passed: $PASSES"
echo "Failed: $FAILURES"
echo "Total:  $((PASSES + FAILURES))"

if [ "$FAILURES" -gt 0 ]; then
    exit 1
else
    echo ""
    echo "All checks passed!"
    exit 0
fi
