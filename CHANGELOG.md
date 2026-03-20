# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
