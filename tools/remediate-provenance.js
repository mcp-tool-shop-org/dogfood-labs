/**
 * REMEDIATION: Mark all accepted records as having unverified (stub) provenance.
 *
 * Context: Prior to the provenance fix, all production ingestions used stubProvenance
 * which always returned confirmed=true without checking GitHub API. These records
 * have provenance_confirmed: true but it was never actually verified.
 *
 * This script:
 * 1. Scans all accepted records
 * 2. Adds a provenance_remediation field marking them as stub-verified
 * 3. Does NOT change the verdict (records may still be valid, just unverified provenance)
 * 4. Rebuilds indexes after remediation
 *
 * Run: node tools/remediate-provenance.js
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { rebuildIndexes } from './ingest/rebuild-indexes.js';

const repoRoot = resolve(import.meta.dirname, '..');
const recordsDir = join(repoRoot, 'records');

function walkRecords(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkRecords(full));
    } else if (entry.name.startsWith('run-') && entry.name.endsWith('.json')) {
      files.push(full);
    }
  }
  return files;
}

const records = walkRecords(recordsDir);
let remediated = 0;

for (const filePath of records) {
  // Skip rejected records
  if (filePath.includes('_rejected')) continue;

  const raw = readFileSync(filePath, 'utf-8');
  const record = JSON.parse(raw);

  // Check if already remediated
  if (record.verification?.provenance_remediation) continue;

  // Mark as stub-verified
  if (!record.verification) record.verification = {};
  record.verification.provenance_remediation = {
    status: 'stub_verified',
    note: 'This record was ingested with stub provenance (always confirms). GitHub API provenance was NOT checked at ingestion time. Record may still be valid but provenance was not independently verified.',
    remediated_at: new Date().toISOString(),
    original_provenance_confirmed: record.verification.provenance_confirmed ?? null
  };

  writeFileSync(filePath, JSON.stringify(record, null, 2) + '\n');
  remediated++;
  console.log(`Remediated: ${filePath}`);
}

console.log(`\nRemediated ${remediated} records.`);

// Rebuild indexes
console.log('Rebuilding indexes...');
rebuildIndexes(repoRoot);
console.log('Done.');
