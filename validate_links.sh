#!/bin/bash
find . -name "*.md" -not -path "./.git/*" -print0 | while IFS= read -r -d '' mdfile; do
  grep -oP '\[[^\]]*\]\((?!http)(?!#)([^)]*)\)' "$mdfile" | while IFS= read -r match; do
    file=$(echo "$match" | grep -oP '(?<=\()[^)]*(?=\))')
    target=$(realpath -m "$(dirname "$mdfile")/$file")
    if [ ! -f "$target" ] && [ ! -d "$target" ]; then
      echo "BROKEN: $file in $mdfile"
    fi
  done
done
