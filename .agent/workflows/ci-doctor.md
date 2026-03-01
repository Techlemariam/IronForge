---
description: "Comprehensive CI failure prevention and resolution (v5.0)"
command: "/ci-doctor"
category: "maintenance"
trigger: "manual"
version: "5.0.0"
telemetry: "enabled"
primary_agent: "@infrastructure"
domain: "ci"
skills: ["error-analyzer", "gatekeeper", "dependabot-manager", "env-validator", "linter-fixer", "schema-guard", "qodana-linter", "performance-profiler", "zod-schema-validator", "api-mocker", "bio-validator", "prisma-migrator", "a11y-auditor", "coverage-check", "bundle-analyzer", "git-guard", "supabase-inspector", "storybook-bridge", "coolify-deploy", "doc-generator", "red-team", "clean-code-pro", "doppler", "n8n"]
---

# 🩺 CI Doctor (Orchestrator v5.0)

**Role:** Medical Board Chair / Triage Dispatch Central
**Goal:** Full-lifecycle CI health — from prevention to self-healing, with observability at every layer.

---

## Architecture

```
Phase -1: Prevention
  └─ Husky pre-push → check-types + lint (blocks bad pushes)
  └─ predict-failures.ts → GHA annotations for high-risk areas

Phase 0: Triage
  └─ ci-cd.yml (failure) → n8n CI Triage Router → repository_dispatch → active-handover.yml

Phase 1: Specialist Consultation
  └─ active-handover.yml → doctor-code / doctor-infra / doctor-qa / doctor-security / doctor-ui-ux / doctor-meta

Phase 2: Auto-Remediation
  └─ doctor-code: lint --fix → auto-commit → push back to PR
  └─ reviewer-aggregator (n8n cron) → parse CodeRabbit/DeepSource → auto-apply patches

Phase 3: Self-Healing Infrastructure
  └─ runner-heartbeat.yml (cron 15min) → detect dead runners → Discord alert
  └─ restart-runners.ps1 → docker compose restart

Phase 4: Observability
  └─ PR Comment: structured diagnostic report posted on every specialist run
  └─ Discord #ci-alerts: real-time failure/recovery notifications
  └─ ci-metrics.ts → MTTR, success rate, auto-fix count
  └─ track-flaky-tests.ts → test stability tracking
```

## Phase -1: Prevention

### Pre-Push Gatekeeper (Husky)

`.husky/pre-push` blocks pushes with type or lint errors locally, preventing ~40% of CI failures before they reach the pipeline.

### Predictive Failure Analysis

`scripts/predict-failures.ts` runs as an early step in `l1-verify` and maps changed files to risk areas:

| Pattern | Specialist | Risk |
| :--- | :--- | :--- |
| `prisma/schema.prisma` | doctor-infra | 🔴 High |
| `.github/workflows/` | doctor-meta | 🔴 High |
| `Dockerfile` | doctor-infra | 🔴 High |
| `tests/e2e/` | doctor-qa | 🟡 Medium |
| `src/components/` | doctor-ui-ux | 🟡 Medium |
| `package.json` | doctor-code | 🟡 Medium |

## Phase 0: Triage (Dispatch Router)

CI Doctor v5 no longer runs diagnostics directly. Instead, it serves as the **dispatch central** that routes failures to the correct specialist.

### Automatic (via n8n)

When `ci-cd.yml` detects a failure via `if: failure()`, it POSTs to the n8n `ci-triage-router` webhook. The n8n workflow:

1. Receives the payload `{ job_name, run_id, branch, pr_number, conclusion }`
2. Routes via Switch Node to the correct specialist
3. Dispatches via GitHub `repository_dispatch` to `active-handover.yml`

**Coverage:** All 8 CI jobs now have failure hooks: `l1-verify`, `l2-verification`, `l2-db-guard`, `e2e`, `l2-e2e-smoke`, `l2-perf-audit`, `docker-verify`, `publish-image`.

### Manual (via CLI)

### 0. Doppler Pre-flight Check

Ensure the environment is secured and Doppler is active.

// turbo

```bash
doppler run -- echo "🔐 Doppler Protected Execution Active"
```

### 1. Identify the latest failed run

// turbo

```bash
echo "🩺 CI Doctor v5: Manual Triage"

# 1. Identify the latest failed run
FAILED_RUN=$(doppler run -- gh run list --limit 5 --json conclusion,databaseId,name --jq '[.[] | select(.conclusion == "failure")] | .[0]')
RUN_ID=$(echo $FAILED_RUN | jq -r '.databaseId')

if [ -z "$RUN_ID" ]; then
  echo "✅ No recent failures found. Switching to Optimizer mode..."
  /doctor-code --mode=optimize
  exit 0
fi

echo "🚨 Failed run found: $RUN_ID"
gh run view $RUN_ID

# 2. Fetch failed job name
FAILED_JOB=$(doppler run -- gh run view $RUN_ID --json jobs --jq '[.jobs[] | select(.conclusion == "failure")] | .[0].name')
echo "📋 Failed job: $FAILED_JOB"

# 3. Route to specialist
case "$FAILED_JOB" in
  *"L1"*|*"Verify"*)
    echo "🔧 Routing to /doctor-code..."
    /doctor-code
    ;;
  *"DB Guard"*|*"Prisma"*)
    echo "🗄️ Routing to /doctor-infra..."
    /doctor-infra
    ;;
  *"E2E"*|*"Smoke"*|*"Playwright"*)
    echo "🎭 Routing to /doctor-qa..."
    /doctor-qa
    ;;
  *"Security"*|*"Snyk"*)
    echo "🛡️ Routing to /doctor-security..."
    /doctor-security
    ;;
  *"Docker"*)
    echo "🐳 Routing to /doctor-infra..."
    /doctor-infra
    ;;
  *"Perf"*|*"Lighthouse"*)
    echo "📊 Routing to /doctor-code..."
    /doctor-code
    ;;
  *)
    echo "🔧 Unknown failure type. Defaulting to /doctor-code..."
    /doctor-code
    ;;
esac
```

## Phase 1: Specialist Consultation

The decentralized doctor team handles all actual diagnostics:

| Specialist | Trigger | Focus |
| :--- | :--- | :--- |
| `/doctor-code` | L1 lint/type/test failures | ESLint, TypeScript, Vitest, CodeRabbit Autopilot |
| `/doctor-infra` | DB Guard, Docker failures | Prisma drift, container health, env vars |
| `/doctor-qa` | E2E/Smoke test failures | Playwright, test flakiness, seed data |
| `/doctor-security` | Security alerts | pnpm audit, Snyk, GitGuardian |
| `/doctor-ui-ux` | Visual/a11y regressions | Storybook, axe-core, responsive testing |
| `/doctor-meta` | Governance/workflow failures | Label, Release Drafter, workflow YAML |

## Phase 2: Auto-Remediation

### Auto-Commit Lint Fixes

When `active-handover.yml` runs `doctor-code` and successfully auto-fixes lint errors, it:

1. Commits: `fix(ci): auto-fix lint/type errors [ci-doctor]`
2. Pushes back to the PR branch
3. Posts a PR comment summarizing the fix

### Reviewer Aggregation

The n8n `reviewer-aggregator` workflow periodically:

1. Fetches open PR reviews from CodeRabbit, DeepSource, and humans
2. Parses actionable code suggestions (```suggestion blocks)
3. If auto-fixable → dispatches `doctor-code` to apply diffs
4. Posts a summary comment on the PR

Health check: `scripts/check-n8n-cron.ps1` (alerts if last execution > 2h ago)

## Phase 3: Self-Healing Infrastructure

### Runner Heartbeat

`.github/workflows/runner-heartbeat.yml` runs every 15 minutes:

1. Queries GitHub API for self-hosted runner status
2. If runners are offline → Discord alert with recovery instructions
3. Recovery script: `scripts/restart-runners.ps1`

## Phase 4: Observability

### PR Comment Feedback

Every specialist run posts a structured report on the PR with diagnostic logs.

### Discord #ci-alerts

Real-time notifications for:

- CI failures and specialist dispatch
- Auto-fix success/failure
- Runner health degradation

### Metrics Dashboard

`scripts/ci-metrics.ts` tracks:

- MTTR (Mean Time To Recovery)
- Auto-fix success rate
- Failure frequency per job

### Flakiness Detection

`scripts/track-flaky-tests.ts` maintains per-test stability history and flags tests with >20% fail rate.

## n8n Workflows

| Workflow | Trigger | Purpose |
| :--- | :--- | :--- |
| `ci-triage-router` | Webhook from ci-cd.yml | Routes failures to specialists |
| `reviewer-aggregator` | Cron (hourly) / Webhook | Aggregates and auto-applies reviewer feedback |

Workflow JSON files are stored in `n8n/` directory for import into the Coolify n8n instance.
