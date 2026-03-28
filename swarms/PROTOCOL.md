# Swarm Protocol v1.0

## Overview

The Swarm Protocol orchestrates 10+ parallel Claude Code agents to audit and remediate a single repository. A human coordinator reads this document and executes it step by step. Each swarm produces structured audit findings, remediation commits, and a persisted evidence record in both `dogfood-labs` and the `repo-knowledge` database. All artifacts live under `F:\AI\dogfood-labs\swarms\<org>--<repo>\`.

## Prerequisites

- Target repo exists in `mcp-tool-shop-org` (or `mcp-tool-shop` for marketing repos)
- Local clone at `F:\AI\<repo-name>` with `origin` pointing to the correct remote
- `repo-knowledge` MCP server running (provides `audit_submit`, `audit_controls_list`, `audit_posture`)
- `dogfood-labs` cloned at `F:\AI\dogfood-labs`
- Control registry available: `F:\AI\repo-knowledge\data\control-registry.json`
- Git working tree clean on the target repo (no uncommitted changes)

---

## Phase 1: CLAIM

Create the swarm workspace and lock the target.

1. Generate a swarm ID: `swarm-<unix-timestamp>-<4-random-hex>` (e.g. `swarm-1711500000-a3f1`)
2. Create directory: `F:\AI\dogfood-labs\swarms\<org>--<repo>\`
3. Write `manifest.json`:

```json
{
  "swarm_id": "swarm-1711500000-a3f1",
  "repo": "<org>/<repo>",
  "local_path": "F:\\AI\\<repo>",
  "commit_sha": "<HEAD commit>",
  "branch": "main",
  "started_at": "<ISO 8601>",
  "status": "claimed",
  "phases_completed": []
}
```

4. Check prior state:
   - Call `audit_posture` MCP tool for the repo
   - Read `F:\AI\dogfood-labs\indexes\latest-by-repo.json`
   - Note existing posture and last audit date in `manifest.json` as `prior_state`

5. Set `status: "claimed"` and commit the manifest.

---

## Phase 2: EXPLORE

Map the repo into auditable components.

1. Launch 1-3 Explore agents. Each agent reads the full directory tree, README, and entry points.
2. Agent task: identify logical components (modules, packages, services, subsystems).
3. Coordinator merges agent outputs into `components.json`:

```json
[
  {
    "id": "comp-01",
    "name": "core-engine",
    "type": "library",
    "paths": ["src/engine/", "src/types/"],
    "language": "typescript",
    "estimated_loc": 2400,
    "has_tests": true,
    "applicable_domains": ["SRC", "TST", "ERR", "DOC"]
  }
]
```

4. Rules:
   - Target ~10 components. Merge files under 200 LOC into their nearest neighbor. Split modules over 5000 LOC.
   - Every file in the repo must belong to exactly one component.
   - Root config files (`package.json`, `tsconfig.json`, `Cargo.toml`, etc.) go into a `root-config` component owned by the coordinator, not agents.
   - `applicable_domains` maps to the 19-domain control registry. Use `audit_controls_list` to get the domain list.

5. Write `components.json` to the swarm directory. Update manifest: `status: "explored"`.

---

## Phase 3: ASSIGN

Map components to agent slots with strict file ownership.

1. Read `components.json`. For each component, create an assignment:

```json
{
  "agent_slot": 1,
  "component_id": "comp-01",
  "component_name": "core-engine",
  "paths": ["src/engine/", "src/types/"],
  "controls": ["SRC-001", "SRC-002", "TST-001", "ERR-001", "DOC-001"],
  "wave": 1
}
```

2. HARD RULE: No two agents share a file path. Validate with:
   ```bash
   # Extract all paths, sort, check for duplicates
   jq -r '.[].paths[]' assignments.json | sort | uniq -d
   ```
   If any duplicates appear, reassign before proceeding.

3. Shared config files (`root-config` component) are coordinator-only. No agent touches them.

4. If more than 10 components exist, batch into waves. Wave 1 gets slots 1-10, Wave 2 gets 1-10 again after Wave 1 completes.

5. Write `assignments.json` to the swarm directory. Update manifest: `status: "assigned"`.

---

## Phase 4: AUDIT

Launch parallel audit agents.

1. For each assignment in the current wave, launch one agent (max 10 concurrent).
2. Each agent receives this context:
   - Component name, paths, and file list
   - Applicable controls from the control registry
   - Repo README and any component-level docs
   - Audit standard reference: all 19 domains, 80 controls, posture derivation rules

3. Agent prompt (fill variables from assignment):
   ```
   You are auditing component "{component_name}" of repo "{repo}".
   Your file scope: {paths}
   Applicable controls: {controls}

   For each control:
   - Evaluate: pass / fail / warn / not_applicable
   - Provide evidence (file path + line or explanation)
   - Record findings for any non-pass result

   Output JSON: { controls: [...], findings: [...], summary: string }
   ```

4. Coordinator collects all agent outputs into `audit-results/` directory, one file per component: `audit-results/<component-id>.json`.

5. Merge into `audit-summary.json`:
   - Total controls evaluated
   - Pass/fail/warn counts
   - All findings ranked by severity (critical > high > medium > low)
   - Derived posture per audit-standard rules

6. Update manifest: `status: "audited"`, record `audit_summary` stats.

---

## Phase 5: REMEDIATE

Fix findings with strict file ownership.

1. Read `audit-summary.json`. Sort findings: critical first, then high, medium, low.

2. Group findings by component. Each component's findings become a remediation packet:
   ```json
   {
     "agent_slot": 1,
     "component_id": "comp-01",
     "findings_to_fix": ["finding-001", "finding-003"],
     "exclusive_paths": ["src/engine/", "src/types/"]
   }
   ```

3. HARD RULE: agents only edit files within their `exclusive_paths`. No exceptions.

4. Launch up to 10 remediation agents in parallel. Each agent:
   - Reads findings assigned to it
   - Fixes what it can
   - Reports back: `{ fixed: [...], accepted_risk: [...], remaining: [...] }`

5. Coordinator collects results into `remediation-results/<component-id>.json`.

6. Update manifest: `status: "remediated"`.

---

## Phase 6: VERIFY

Confirm nothing is broken.

1. Run the repo's verification commands:
   ```bash
   # Node/TypeScript
   npm test && npm run build

   # Rust
   cargo test && cargo check

   # Python
   pytest && ruff check .
   ```

2. If failures occur:
   - Identify which files are involved (from error output)
   - Map files back to their component owner
   - Dispatch targeted fix agents for those specific components only
   - Re-run verification

3. Validate file ownership was respected:
   ```bash
   cd F:/AI/<repo>
   git diff --name-only HEAD~1 | sort > /tmp/changed-files.txt
   ```
   Cross-reference every changed file against `assignments.json`. If any file was edited by a non-owner, revert that file and reassign.

4. Loop until tests pass and ownership is clean.

5. Update manifest: `status: "verified"`.

---

## Phase 7: PERSIST

Write evidence to both dogfood-labs and repo-knowledge.

1. Run the persistence tool:
   ```bash
   node F:/AI/dogfood-labs/tools/swarm/persist-results.js F:/AI/dogfood-labs/swarms/<org>--<repo>/manifest.json
   ```
   This builds the dogfood submission record and ingests it locally.

2. Call `audit_submit` MCP tool with the structured payload:
   - repo, commit_sha, controls evaluated, findings, posture, evidence references
   - Format per `F:\AI\repo-knowledge\AUDIT-CONTRACT.md`

3. Both paths must succeed. If either fails, log the error in `manifest.json` under `persist_errors[]` and retry up to 3 times.

4. Update manifest: `status: "persisted"`.

---

## Phase 8: RELEASE

Ship the results.

1. Stage and commit remediation changes in the target repo:
   ```bash
   cd F:/AI/<repo>
   git add -A
   git commit -m "audit: swarm remediation <swarm_id>

   Findings: <N> total, <fixed> fixed, <accepted> accepted risk
   Posture: <posture>"
   ```

2. Push to remote:
   ```bash
   git push origin main
   ```

3. Verify CI passes:
   ```bash
   gh run list --repo <org>/<repo> --limit 1
   ```
   If CI fails, return to Phase 6.

4. Update manifest: `status: "complete"`, `completed_at: <ISO 8601>`.

5. Commit the final swarm directory to dogfood-labs.

---

## The 12 Laws

1. **Single Writer** -- Each file has exactly one agent owner. No shared writes, ever.
2. **Coordinator Owns Config** -- Root config files are coordinator-only territory.
3. **Wave Discipline** -- Max 10 agents per wave. Finish the wave before starting the next.
4. **Evidence or It Did Not Happen** -- Every control evaluation has a recorded evidence trail.
5. **Severity Order** -- Remediation follows critical > high > medium > low. No skipping.
6. **Scope Lock** -- Agents operate only on their assigned paths. Violations trigger revert.
7. **Green Before Ship** -- No release until tests pass and file ownership is validated.
8. **Dual Persist** -- Results go to both dogfood-labs and repo-knowledge. Both must succeed.
9. **Manifest Is Truth** -- The manifest.json is the single source of swarm state. Update it at every phase boundary.
10. **Resumable by Default** -- Every phase writes its outputs to disk so an interrupted swarm can resume.
11. **Coordinator Never Audits** -- The coordinator dispatches, collects, and validates. It does not author findings.
12. **Posture Derived, Not Declared** -- Repo posture comes from the audit-standard derivation rules, not coordinator opinion.

---

## Resuming an Interrupted Swarm

1. Read `manifest.json` from the swarm directory.
2. Check `status` to find the last completed phase.
3. Read all completed outputs from disk:
   - `components.json` (Phase 2)
   - `assignments.json` (Phase 3)
   - `audit-results/*.json` (Phase 4)
   - `remediation-results/*.json` (Phase 5)
4. Identify which agents in the current phase completed (have output files) vs. which are missing.
5. Re-dispatch only the missing work. Do not re-run completed agents.
6. Continue from the interrupted phase forward.

---

## Coordinator Checklist (Quick Reference)

```
 1. [ ] Generate swarm_id, create swarm directory
 2. [ ] Write manifest.json with repo, commit, branch
 3. [ ] Check prior audit state (audit_posture, latest-by-repo.json)
 4. [ ] Launch Explore agents, merge into components.json (~10 components)
 5. [ ] Validate every repo file belongs to exactly one component
 6. [ ] Write assignments.json, verify zero path overlap
 7. [ ] Launch audit agents (max 10), collect per-component results
 8. [ ] Merge into audit-summary.json, derive posture
 9. [ ] Build remediation packets sorted by severity
10. [ ] Launch remediation agents (max 10), collect fix reports
11. [ ] Run repo tests/build/lint until green
12. [ ] Validate no file edited outside its assigned component
13. [ ] Run persist-results.js
14. [ ] Call audit_submit MCP tool
15. [ ] Commit remediation to target repo, push, verify CI
16. [ ] Mark manifest complete, commit swarm directory to dogfood-labs
```
