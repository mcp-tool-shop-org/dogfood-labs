---
title: Contracts
description: The three contracts that define dogfood-labs
sidebar:
  order: 2
---

dogfood-labs is defined by three contracts. Each has a JSON Schema and documentation.

## Record Contract

Defines what a dogfood run looks like as a structured JSON document.

**Two variants:**
- **Submission schema** (`dogfood-record-submission.schema.json`) — what source repos author
- **Persisted schema** (`dogfood-record.schema.json`) — what the verifier writes after validation

Key fields:
- `schema_version` — contract version
- `run_id` — unique identifier for this run
- `repo` — the source repo slug
- `product_surface` — the surface being dogfooded (cli, desktop, web, etc.)
- `overall_verdict` — pass/fail/skip
- `scenario_results` — array of scenario outcomes with steps and evidence
- `ci_metadata` — GitHub Actions context (workflow, run URL, actor)

The verifier enriches submissions with `verification_status`, `verified_at`, and policy evaluation results.

## Scenario Contract

Defines what constitutes a real dogfood exercise in a source repo.

Location: `dogfood/scenarios/<scenario-id>.yaml` in the source repo.

Key fields:
- `scenario_id` — unique identifier
- `product_surface` — which surface this exercises
- `execution_mode` — bot (fully automated) or mixed (human + bot)
- `steps` — ordered list of actions the scenario performs
- `success_criteria` — what must pass for the scenario to succeed
- `preconditions` — what must be true before the scenario runs

Scenarios must exercise the real product interface — not a test harness or mock.

## Policy Contract

Defines what rules the verifier enforces for each repo.

Location: `policies/repos/<org>/<repo>.yaml` in dogfood-labs.

Key fields:
- `enforcement.mode` — required, warn-only, or exempt
- `enforcement.reason` — why non-required (mandatory for warn-only/exempt)
- `enforcement.review_after` — when to re-evaluate (mandatory for warn-only/exempt)
- `surfaces.<surface>.scenario` — the scenario name for this surface
- `surfaces.<surface>.max_age_days` — freshness threshold

Global policy at `policies/global-policy.yaml` sets org-wide defaults.
