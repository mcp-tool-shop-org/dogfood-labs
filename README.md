# dogfood-labs

Centralized dogfood evidence system for mcp-tool-shop-org.

Proves, with auditable evidence, that each repo was actually exercised in a dogfood-worthy way. Makes that status queryable across the org.

## Architecture

- **Source repos** define scenarios (`dogfood/scenarios/*.yaml`) and run dogfood workflows
- **Source workflows** emit structured payloads via `repository_dispatch`
- **Central verifier** validates schema, provenance (GitHub API), and policy compliance
- **Accepted records** land in `records/<org>/<repo>/YYYY/MM/DD/`
- **Rejected records** land in `records/_rejected/` with machine-readable reasons
- **Generated indexes** provide fast reads without scanning history

## Contracts

The product is defined by three contracts:

| Contract | What it defines | Schema |
|----------|----------------|--------|
| [Record](docs/record-contract.md) | What a dogfood run looks like | `schemas/dogfood-record.schema.json` (persisted) / `schemas/dogfood-record-submission.schema.json` (source-authored) |
| [Scenario](docs/scenario-contract.md) | What constitutes a real dogfood exercise | `schemas/scenario.schema.json` |
| [Policy](docs/policy-contract.md) | What rules the verifier enforces | `schemas/policy.schema.json` |

## Integration

| System | Role |
|--------|------|
| dogfood-labs | Authoritative write store |
| shipcheck | Enforcement consumer (Gate F) |
| repo-knowledge | Query/index mirror (SQLite) |
| org audit | Portfolio consumer |

## Repo Layout

```
dogfood-labs/
├─ schemas/                          # JSON Schema contracts
│  ├─ dogfood-record-submission.schema.json
│  ├─ dogfood-record.schema.json
│  ├─ scenario.schema.json
│  └─ policy.schema.json
├─ records/                          # Accepted records (sharded)
│  └─ _rejected/                     # Rejected records
├─ indexes/                          # Generated read indexes
├─ policies/
│  ├─ global-policy.yaml
│  └─ repos/<org>/<repo>.yaml        # Per-repo policies
├─ tools/
│  ├─ ingest/                        # Central ingestion workflow
│  ├─ verify/                        # Verifier
│  └─ cli/                           # Query CLI
├─ reports/                          # Generated reports
└─ docs/                             # Contract documentation
```

## Phase Plan

1. **Evidence Spine** — schemas, ingestion, verifier, records, indexes, CLI, 3 pilots
2. **Policy + Enforcement** — repo-specific policies, required scenarios, blocking verdicts, Gate F
3. **Reporting Surface** — dashboard, badges, summaries
4. **Org Rollout** — more repos, per-surface policies, retention automation

## Pilots

| Pilot | Repo | Scenario | Mode | What it proves |
|-------|------|----------|------|----------------|
| 0 | dogfood-labs | `record-ingest-roundtrip` | bot | System can dogfood itself |
| 1 | shipcheck | `self-gate-real-repo` | bot | CLI product surface works |
| 2 | GlyphStudio | `export-roundtrip-16x16` | mixed | Human/desktop path works |
