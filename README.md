> ## ⚠ This repo has moved
>
> **`dogfood-labs` was renamed and folded into [`dogfood-lab/testing-os`](https://github.com/dogfood-lab/testing-os)** — the flagship monorepo of the new [Dogfood Lab](https://github.com/dogfood-lab) GitHub org.
>
> All seven tools (`verify`, `findings`, `ingest`, `report`, `portfolio`, `dogfood-swarm`, plus the JSON `schemas`) now live under `packages/*` in the new repo, scoped as `@dogfood-lab/*` (the trailing `s` is gone). All runtime data dirs (`policies/`, `indexes/`, `records/`, `swarms/`, etc.) are preserved at the same paths inside the new repo.
>
> **Consumers updated as of 2026-04-25:** `shipcheck` Gate F, `repo-knowledge` sync, `role-os` persist-bridge, and the `dogfood.yml` workflows in `ai-loadout`, `claude-guardian`, `glyphstudio`, and `site-theme` all point at the new repo.
>
> This repo is preserved read-only for historical evidence. New evidence should go to https://github.com/dogfood-lab/testing-os.

---

<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/dogfood-labs/readme.png" width="500" alt="dogfood-labs" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/dogfood-labs/actions/workflows/dogfood.yml"><img src="https://github.com/mcp-tool-shop-org/dogfood-labs/actions/workflows/dogfood.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/dogfood-labs/"><img src="https://img.shields.io/badge/Landing_Page-live-brightgreen" alt="Landing Page" /></a>
</p>

Centralized dogfood evidence system for mcp-tool-shop-org.

Proves, with auditable evidence, that each repo was actually exercised in a dogfood-worthy way. Makes that status queryable across the org.

## Coverage

13 repos across 8 product surfaces, all verified pass, all enforcement: required.

| Surface | Repos |
|---------|-------|
| cli | shipcheck, ai-loadout, tool-scan, zip-meta-map, code-batch |
| desktop | glyphstudio |
| mcp-server | claude-guardian, repo-crawler-mcp |
| api | vocal-synth-engine |
| npm-package | site-theme |
| library | voice-soundboard |
| web | a11y-demo-site |
| plugin | polyglot-vscode |

## Architecture

- **Source repos** define scenarios (`dogfood/scenarios/*.yaml`) and run dogfood workflows
- **Source workflows** emit structured payloads via `repository_dispatch`
- **Central verifier** validates schema, provenance (GitHub API), and policy compliance
- **Accepted records** land in `records/<org>/<repo>/YYYY/MM/DD/`
- **Rejected records** land in `records/_rejected/` with machine-readable reasons
- **Generated indexes** provide fast reads without scanning history

## Contracts

The system is defined by seven contracts:

| Contract | What it defines | Schema |
|----------|----------------|--------|
| [Record](docs/record-contract.md) | What a dogfood run looks like | `schemas/dogfood-record.schema.json` |
| [Scenario](docs/scenario-contract.md) | What constitutes a real dogfood exercise | `schemas/scenario.schema.json` |
| [Policy](docs/policy-contract.md) | What rules the verifier enforces | `schemas/policy.schema.json` |
| Finding | Evidence-bound lesson from a dogfood run | `schemas/dogfood-finding.schema.json` |
| Pattern | Repeated lesson cluster (2+ accepted findings) | `schemas/dogfood-pattern.schema.json` |
| Recommendation | Actionable guidance for future repos | `schemas/dogfood-recommendation.schema.json` |
| Doctrine | Hardened portfolio rule earned from repetition | `schemas/dogfood-doctrine.schema.json` |

## Enforcement Tiers

| Mode | Behavior | When to use |
|------|----------|-------------|
| `required` | Fail on violation | Default for all repos |
| `warn-only` | Warn but don't block | New repos with documented reason + review date |
| `exempt` | Skip evaluation | Repos with reason + review date |

See [enforcement-tiers.md](docs/enforcement-tiers.md) for details.

## Intelligence Layer

Turns dogfood evidence into reusable portfolio memory:

```
record → finding → reviewed memory → pattern/doctrine → future guidance
```

- **8 derivation rules** extract candidate findings from verified records deterministically
- **Review workflow** with state machine, merge, invalidation, and append-only event log
- **Pattern clustering** groups 2+ accepted findings by shared dimensions
- **Recommendations** generate actionable guidance from accepted patterns
- **Doctrine** promotes strong patterns into hardened portfolio rules
- **Advice bundles** answer "what should this project inherit?" by surface/mode/repo

```bash
# Get advice for a new MCP server repo
node tools/findings/cli.js advise --surface mcp-server

# Derive candidate findings from all records
node tools/findings/cli.js derive --all --dry-run

# Review a candidate finding
node tools/findings/cli.js accept dfind-example --actor mike --reason "Strong evidence"

# Export for repo-knowledge consumption
node tools/findings/cli.js sync-export --json
```

## Integration

| System | Role |
|--------|------|
| dogfood-labs | Authoritative write store + policy authority + learning engine |
| shipcheck | Enforcement consumer (Gate F) |
| repo-knowledge | Query/index mirror (SQLite read model + dogfood sync) |
| role-os | Advice consumer for bootstrap/review contexts |
| org audit | Portfolio consumer |

## Verify

```bash
bash verify.sh
```

Runs all tests across verifier, ingestion, reporting, portfolio, and findings tools (290 tests).

## Repo Layout

```
dogfood-labs/
├─ schemas/                          # JSON Schema contracts (7 schemas)
├─ records/                          # Accepted records (sharded)
│  └─ _rejected/                     # Rejected records
├─ findings/                         # Evidence-bound lessons (YAML)
├─ patterns/                         # Repeated lesson clusters (YAML)
├─ recommendations/                  # Actionable guidance (YAML)
├─ doctrine/                         # Hardened portfolio rules (YAML)
├─ reviews/                          # Append-only review event log
├─ fixtures/findings/                # Test fixtures (valid + invalid)
├─ indexes/                          # Generated read indexes
├─ policies/
│  ├─ global-policy.yaml
│  └─ repos/<org>/<repo>.yaml        # Per-repo policies
├─ tools/
│  ├─ findings/                      # Intelligence layer (221 tests)
│  │  ├─ derive/                     # Derivation engine (8 rules)
│  │  ├─ review/                     # Review workflow + state machine
│  │  ├─ synthesis/                  # Pattern/recommendation/doctrine
│  │  └─ advise/                     # Query, ranking, advice bundles
│  ├─ ingest/                        # Central ingestion pipeline
│  ├─ verify/                        # Verifier
│  ├─ report/                        # Submission builder
│  └─ portfolio/                     # Portfolio generator
├─ reports/                          # Generated reports
├─ docs/                             # Contract + operating docs
└─ dogfood/                          # Self-dogfood scenario
```

## Trust Model

**Data touched:** Dogfood submission payloads from source repos (JSON), policy YAML files, generated record and index files. All data is Git-persisted — no external databases.

**Data NOT touched:** User credentials, authentication tokens (beyond CI secrets managed by GitHub), external APIs (beyond GitHub Actions API for `repository_dispatch`), personal data, telemetry, analytics.

**Permissions:** GitHub Actions workflows require `contents: write` for the ingestion bot to commit accepted records. Source repos require a `DOGFOOD_TOKEN` secret for dispatch. No other elevated permissions.

**No telemetry.** No analytics. No network calls beyond GitHub API.

## Operating Cadence

- **Weekly:** Freshness review — flag repos >14d stale, violation at >30d
- **Monthly:** Policy calibration — review warn-only/exempt for promotion
- **On failure:** Investigate root cause, update doctrine only from real seams
- **New repos:** Default to required, document reason for any weaker tier

See [operating-cadence.md](docs/operating-cadence.md) for full details.

## Rollout Doctrine

Rollout doctrine captures 10 rules learned from real failures during expansion. See [rollout-doctrine.md](docs/rollout-doctrine.md).

The intelligence layer extends this with machine-derived doctrine from accepted patterns. See the [Intelligence Layer handbook page](https://mcp-tool-shop-org.github.io/dogfood-labs/handbook/intelligence-layer/) for details.

---

Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>
