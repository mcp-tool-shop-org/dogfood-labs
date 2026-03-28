# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.2.0] - 2026-03-28

### Changed
- Swarm Protocol upgraded from v1.0 (8-phase) to v2.0 (9-phase play)
- Health Pass now has 3 stages: A (bug/security), B (proactive), C (humanization)
- Feature Pass: audit → review → execution → repeat (user approves before code)
- 12 Laws replaced with 10 Key Principles
- Domain assignments formalized (backend, bridge, tests, CI/docs, frontend)

### Added
- Humanization stage: UX polish treated with same rigor as bug fixes
- Audit record for claude-collaborate v1.1.0 (35→129 tests, full 9-phase completion)

### Proven
- claude-collaborate: Health A (2 waves) + B (1) + C (1) + Feature P0/P1 (2) + Re-audit (1) + Final (1) = v1.1.0

## [1.1.0] - 2026-03-28

### Added
- Swarm Protocol v1.0: 8-phase lifecycle for 10+ parallel Claude agents
- PROTOCOL.md operator guide with 12 Laws and coordinator checklist
- Agent prompt templates: explore, audit, remediate (swarms/templates/)
- Manifest schema for swarm checkpoints (swarms/manifest-schema.json)
- Dual persistence bridge: dogfood records + repo-knowledge audit DB (tools/swarm/persist-results.js)
- Swarm-audit dogfood scenario (dogfood/scenarios/swarm-audit.yaml)
- 24 new tests for swarm persistence layer (93 total)

## [1.0.1] - 2026-03-28

### Security
- Fix critical: null/undefined proposed verdict no longer defaults to "pass" (verdict.js)
- Fix high: unrecognized verdict strings now fail-closed instead of defaulting to "pass"
- Fix high: unrecognized scenario verdicts treated as fail, not silently skipped
- Anchor provenance run_url regex to prevent URL prefix injection
- Add repo/SHA binding checks in GitHub provenance verification
- Path injection guards on repo slug, run_id, and scenario IDs (persist, context loader)
- Wrap fetch in try/catch for GitHub provenance (fail-closed on network error)

### Fixed
- Verifier: wrap all validator calls in try/catch (no more raw stack traces)
- Verifier: hardcode schema_version on persisted records (don't trust submission)
- Verifier: fix double provenance rejection reason on exceptions
- Verifier: guard against null/undefined submission input
- Policy: deep merge for surface policy resolution (nested objects no longer clobbered)
- Policy: CI checks evaluated once per unique surface (no duplicate errors)
- Policy: missing coverage data now flagged when coverage_min is set
- Steps: validate step structure (must be object with string step_id)
- Steps: validate step status against known enum (pass/fail/blocked/skip)
- Ingest: JSON parse errors produce exit code 2, not 1
- Ingest: top-level error boundary with correct exit codes
- Ingest: rebuildIndexes failure logged as warning, not crash
- Ingest: broaden CI detection for stub provenance guard
- Persistence: guard against NaN date segments in record paths
- Indexes: atomic writes via temp-file-then-rename
- Indexes: precise _rejected path filter (no false positives on repo names)
- Report: buildSubmission enforces overallVerdict must be string
- Report: validate required params, guard NaN/negative duration
- Portfolio: computeFreshnessDays returns Infinity for invalid dates
- Portfolio: total_repos now counts unique repos, not entries
- Schema loading wrapped in try/catch (structured error on failure)
- Context loader: YAML parse errors caught and returned as null

### Changed
- Schema: added provenance_remediation to record schema (remediated records now valid)
- Schema: added propertyNames constraint to policy surfaces (typo protection)
- Deleted redundant ci.yml (dogfood.yml is canonical CI)
- verify.sh uses subshells to prevent directory state leakage
- README test count updated to 76+

## [1.0.0] - 2026-03-20

### Added

- Evidence spine: schemas, ingestion pipeline, verifier, records, indexes
- Three contracts: Record, Scenario, Policy (with JSON Schema)
- Central ingestion via `repository_dispatch` with atomic persistence
- Verifier with schema validation, provenance checks, policy evaluation, verdict computation
- Reusable reporting workflow for source repos
- Self-dogfood scenario (Pilot 0: record-ingest-roundtrip)
- Per-repo policy system with enforcement tiers (required, warn-only, exempt)
- Generated indexes: latest-by-repo.json, failing.json, stale.json
- Full surface coverage: 13 repos across 8 product surfaces
- Portfolio JSON generator with freshness and stale detection
- Rollout doctrine (10 rules from real failures)
- Operating cadence documentation
- Integration with shipcheck (Gate F), repo-knowledge (SQLite mirror), org audit
- 76+ tests across verifier, ingestion, reporting, and portfolio tools
