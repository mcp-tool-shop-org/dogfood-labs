---
title: Architecture
description: How dogfood-labs ingests, verifies, and persists dogfood evidence
sidebar:
  order: 1
---

## Data Flow

```
Source repo workflow
  → Builds structured submission (JSON)
  → Emits via repository_dispatch to dogfood-labs

dogfood-labs ingestion pipeline
  → Schema validation (AJV against JSON Schema)
  → Provenance check (GitHub API — verify run actually happened)
  → Policy evaluation (enforcement tier, required scenarios, freshness)
  → Verdict computation (source proposes, verifier confirms or downgrades)

  → Accepted: records/<org>/<repo>/YYYY/MM/DD/<run-id>.json
  → Rejected: records/_rejected/<org>/<repo>/YYYY/MM/DD/<run-id>.json

  → Index rebuild: indexes/latest-by-repo.json, failing.json, stale.json
```

## Key Design Decisions

### Central Ingestion

Source repos never write records directly. They emit structured payloads via `repository_dispatch`, and only the dogfood-labs bot writes to the records directory. This prevents source repos from fabricating evidence.

### Verdict Ownership

The source repo proposes a verdict (`overall_verdict` in the submission). The verifier can confirm or downgrade — never upgrade. A source claiming "pass" that fails schema or policy validation becomes "fail."

### Sharded Persistence

Records are stored at `records/<org>/<repo>/YYYY/MM/DD/<run-id>.json`. This provides natural time-sharding, easy browsing, and clean git history without merge conflicts.

### Generated Indexes

`latest-by-repo.json` is rebuilt from accepted records after every ingestion. Consumers read indexes, not the raw record tree. This keeps reads fast without scanning git history.

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Verifier | `tools/verify/` | Schema, provenance, policy, verdict validation |
| Ingestion | `tools/ingest/` | Pipeline orchestration, atomic persistence, index rebuild |
| Report builder | `tools/report/` | Submission assembly for source repos |
| Portfolio | `tools/portfolio/` | Org-level summary generation |

## Enforcement Tiers

| Mode | Behavior | Default |
|------|----------|---------|
| `required` | Blocks on violation | Yes — all repos start here |
| `warn-only` | Warns but doesn't block | Must have documented reason + review date |
| `exempt` | Skips evaluation entirely | Must have documented reason + review date |

Missing policy defaults to `required` — the safe default.
