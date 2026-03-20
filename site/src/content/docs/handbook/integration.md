---
title: Integration
description: How other systems consume dogfood status from dogfood-labs
sidebar:
  order: 4
---

dogfood-labs is the sole write authority for dogfood evidence. Other systems consume this data as read models.

## Consumers

| System | How it reads | What it does |
|--------|-------------|--------------|
| **shipcheck** | GitHub raw URL (CDN) | Gate F enforcement — blocks or warns based on dogfood status |
| **repo-knowledge** | `rk sync-dogfood` (local or URL) | Mirrors facts into SQLite for portfolio queries |
| **org audit** | Portfolio JSON | Includes dogfood status in audit posture |

## shipcheck Gate F

shipcheck reads `indexes/latest-by-repo.json` from the GitHub raw CDN and evaluates:
- Is the repo in the index?
- Is the surface verified pass?
- Is the freshness within threshold?

Combined with the enforcement tier from the policy YAML:
- `required` — fail on violation
- `warn-only` — warn but exit 0
- `exempt` — skip evaluation, exit 0

## repo-knowledge Read Model

The `sync-dogfood` command reads the index and policy files, then upserts structured facts into the `repo_facts` table:

| Fact Key | Example Value |
|----------|--------------|
| `surface:cli:verified` | pass |
| `surface:cli:enforcement` | required |
| `surface:cli:freshness_days` | 2 |
| `surface:cli:run_id` | shipcheck-1-1 |
| `surface:cli:finished_at` | 2026-03-20T... |
| `status` | pass (worst-case rollup) |
| `surfaces` | cli |

Usage:
```bash
# From local checkout
rk sync-dogfood --local F:/AI/dogfood-labs

# From GitHub (default)
rk sync-dogfood
```

## Portfolio JSON

The portfolio generator reads the index and all policy files, producing a summary at `reports/dogfood-portfolio.json`:

```bash
node tools/portfolio/generate.js
```

Output includes coverage counts, per-repo entries with freshness, stale repos, and repos with policies but no index entry.

## Key Invariant

**dogfood-labs writes truth, consumers mirror truth.** No consumer should edit, reinterpret, or "fix" dogfood data. If the data is wrong, fix it in dogfood-labs.
