#!/usr/bin/env bash
# Check all tool registries for stale entries (last_verified > 6 months ago)
# Exit 0 = all fresh, Exit 1 = stale entries found

set -euo pipefail

REPO_PATH="${1:-$(dirname "$(dirname "$0")")}"
STALE_MONTHS=6
STALE_DATE=$(date -d "-${STALE_MONTHS} months" +%Y-%m-%d 2>/dev/null || date -v-${STALE_MONTHS}m +%Y-%m-%d)

STALE=0
FRESH=0
UNVERIFIED=0

echo "=== Tool Staleness Check ==="
echo "Stale threshold: $STALE_MONTHS months (before $STALE_DATE)"
echo ""

for file in tools/free-tools.yaml tools/apis.yaml tools/cli-tools.yaml; do
    [ -f "$REPO_PATH/$file" ] || continue

    CURRENT_TOOL=""
    CURRENT_DATE=""

    while IFS= read -r line; do
        if echo "$line" | grep -qE '^\s*-\s*name:'; then
            # New tool entry â€” process previous
            if [ -n "$CURRENT_TOOL" ]; then
                if [ -n "$CURRENT_DATE" ]; then
                    if [ "$CURRENT_DATE" \< "$STALE_DATE" ]; then
                        echo "  [STALE] $CURRENT_TOOL - last verified $CURRENT_DATE"
                        STALE=$((STALE + 1))
                    else
                        FRESH=$((FRESH + 1))
                    fi
                else
                    echo "  [UNVERIFIED] $CURRENT_TOOL - no last_verified field"
                    UNVERIFIED=$((UNVERIFIED + 1))
                fi
            fi
            CURRENT_TOOL=$(echo "$line" | sed 's/.*name:\s*"\?\([^"]*\)"\?\s*$/\1/')
            CURRENT_DATE=""
        fi
        if echo "$line" | grep -qE 'last_verified:'; then
            CURRENT_DATE=$(echo "$line" | sed 's/.*last_verified:\s*"\?\([0-9-]*\)"\?.*/\1/')
        fi
    done < "$REPO_PATH/$file"

    # Last tool in file
    if [ -n "$CURRENT_TOOL" ]; then
        if [ -n "$CURRENT_DATE" ]; then
            if [ "$CURRENT_DATE" \< "$STALE_DATE" ]; then
                echo "  [STALE] $CURRENT_TOOL - last verified $CURRENT_DATE"
                STALE=$((STALE + 1))
            else
                FRESH=$((FRESH + 1))
            fi
        else
            echo "  [UNVERIFIED] $CURRENT_TOOL - no last_verified field"
            UNVERIFIED=$((UNVERIFIED + 1))
        fi
    fi
done

echo ""
echo "=== Summary ==="
echo "Fresh:      $FRESH"
echo "Stale:      $STALE"
echo "Unverified: $UNVERIFIED"

if [ "$STALE" -gt 0 ] || [ "$UNVERIFIED" -gt 0 ]; then
    exit 1
else
    echo "All tools verified and fresh!"
    exit 0
fi
