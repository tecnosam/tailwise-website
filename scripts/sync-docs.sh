#!/bin/sh
# Copies the engine's CHANGELOG into the site, which renders it as /changelog.
# The docs (/docs, /docs/architecture) are read from the latest GitHub release
# instead; see src/lib/docs-source.ts.
set -eu
src=${1:-../tailwise}
cp "$src/CHANGELOG.md" src/content/CHANGELOG.md
echo "synced changelog from $src"
