---
description: "Comprehensive CI failure prevention and resolution (v4.0)"
command: "/ci-doctor"
category: "maintenance"
trigger: "manual"
version: "4.0.0"
telemetry: "enabled"
primary_agent: "@infrastructure"
domain: "ci"
skills: ["error-analyzer", "gatekeeper", "dependabot-manager", "env-validator", "linter-fixer", "schema-guard", "qodana-linter", "performance-profiler", "zod-schema-validator", "api-mocker", "bio-validator", "prisma-migrator", "a11y-auditor", "coverage-check", "bundle-analyzer", "git-guard", "supabase-inspector", "storybook-bridge", "coolify-deploy", "doc-generator", "red-team", "clean-code-pro"]
---

# 🩺 CI Doctor (Orchestrator v4.0)

**Role:** Medical Board Chair / Triage Dispatch Central
**Goal:** Orchestrate specialized diagnostics via n8n webhooks and decentralized specialist doctors across the full PR lifecycle.

---

## Architecture

```
ci-cd.yml (failure) → n8n CI Triage Router → repository_dispatch → active-handover.yml → Specialist Doctor
                                            → reviewer-aggregator → CodeRabbit/DeepSource → Auto-fix commit
```

## Phase 0: Triage (Dispatch Router)

CI Doctor v4 no longer runs diagnostics directly. Instead, it serves as the **dispatch central** that routes failures to the correct specialist.

### Automatic (via n8n)

When `ci-cd.yml` detects a failure via `if: failure()`, it POSTs to the n8n `ci-triage-router` webhook. The n8n workflow:

1. Receives the payload `{ job_name, run_id, branch, pr_number, conclusion }`
2. Routes via Switch Node to the correct specialist
3. Dispatches via GitHub `repository_dispatch` to `active-handover.yml`

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
echo "🩺 CI Doctor v4: Manual Triage"

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

## Phase 2: Reviewer Aggregation

The n8n `reviewer-aggregator` workflow periodically:

1. Fetches open PR reviews from CodeRabbit, DeepSource, and humans
2. Parses actionable code suggestions (```suggestion blocks)
3. If auto-fixable → dispatches `doctor-code` to apply diffs
4. Posts a summary comment on the PR

## n8n Workflows

| Workflow | Trigger | Purpose |
| :--- | :--- | :--- |
| `ci-triage-router` | Webhook from ci-cd.yml | Routes failures to specialists |
| `reviewer-aggregator` | Cron (hourly) / Webhook | Aggregates and auto-applies reviewer feedback |

Workflow JSON files are stored in `n8n/` directory for import into the Coolify n8n instance.
