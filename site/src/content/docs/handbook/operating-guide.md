---
title: Operating Guide
description: Day-to-day operations for dogfood-labs governance
sidebar:
  order: 3
---

## Weekly: Freshness Review

1. Run the portfolio generator: `node tools/portfolio/generate.js`
2. Check `reports/dogfood-portfolio.json` — inspect the `stale` array
3. Repos with `freshness_days > 14` get a warning flag
4. Repos with `freshness_days > 30` are in violation — re-run the scenario or document the block

## Monthly: Policy Calibration

1. Review all `warn-only` and `exempt` repos for promotion to `required`
2. Check `review_after` dates — past-due repos must be evaluated
3. Promotion criteria: repo has passed dogfood at least twice on required-equivalent scenarios
4. If a repo can't promote, document why and set a new `review_after` date

## On Failure

1. Investigate root cause — is it the scenario, the repo, or the infrastructure?
2. Fix the scenario or repo, not the governance system
3. Update rollout doctrine only if the failure reveals a genuinely new seam
4. Never weaken enforcement to make a failure go away

## New Repo Onboarding

1. Create a policy YAML in `policies/repos/mcp-tool-shop-org/<repo>.yaml`
2. Default enforcement: `required`
3. Create a dogfood workflow in the source repo (`.github/workflows/dogfood.yml`)
4. Identify the correct surface type from the 8 defined surfaces
5. Write a scenario that exercises the real product interface
6. Run the workflow, verify ingestion, confirm Gate F passes

## CDN Cache Timing

`raw.githubusercontent.com` caches for 3-5 minutes. After a fresh ingestion, Gate F may read stale data. This is operational, not a product defect. Wait 3-5 minutes and retry.

## Rollout Doctrine

10 rules learned from real failures during expansion:

1. **Surface truth** — the scenario must match the real product surface
2. **Build output truth** — verify the actual build artifact, not just source
3. **Protocol truth** — use the real protocol the product exposes
4. **Runtime truth** — exercise in the real runtime environment
5. **Process truth** — test the actual process lifecycle
6. **Dispatch truth** — verify the dispatch mechanism works end-to-end
7. **Concurrency truth** — handle concurrent ingestion gracefully
8. **Verdict truth** — source proposes, verifier confirms or downgrades
9. **Evidence truth** — evidence must be machine-verifiable
10. **Entrypoint truth** — use the real CLI interface, not assumed flags
