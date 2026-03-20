#!/usr/bin/env bash
set -euo pipefail

echo "=== dogfood-labs verify ==="

echo ""
echo "--- Verifier tests ---"
cd tools/verify && npm ci --silent && npm test
cd ../..

echo ""
echo "--- Ingest tests ---"
cd tools/ingest && npm ci --silent && npm test
cd ../..

echo ""
echo "--- Report tests ---"
cd tools/report && node --test report.test.js
cd ../..

echo ""
echo "--- Portfolio tests ---"
cd tools/portfolio && node --test generate.test.js
cd ../..

echo ""
echo "--- Schema validation ---"
for schema in schemas/*.json; do
  node -e "JSON.parse(require('fs').readFileSync('$schema','utf-8'))" && echo "OK: $schema"
done

echo ""
echo "=== All checks passed ==="
