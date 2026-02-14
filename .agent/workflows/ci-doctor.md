---
description: "Comprehensive CI failure prevention and resolution (v2.0)"
command: "/ci-doctor"
category: "maintenance"
trigger: "manual"
version: "3.0.0"
telemetry: "enabled"
primary_agent: "@infrastructure"
domain: "ci"
skills: ["error-analyzer", "gatekeeper", "dependabot-manager", "env-validator", "linter-fixer", "schema-guard", "qodana-linter", "performance-profiler", "zod-schema-validator", "api-mocker", "bio-validator", "prisma-migrator", "a11y-auditor", "coverage-check", "bundle-analyzer", "git-guard", "supabase-inspector", "storybook-bridge", "coolify-deploy", "doc-generator", "red-team", "clean-code-pro"]
---

# 🩺 CI Doctor (Protocol v3.0)

**Role:** CI Health Specialist
**Goal:** Prevent and cure CI failures with minimal iterations using incremental analysis.

---

## Phase 0: Incremental Diagnostics (Pre-Flight)

High-performance checks that only run if relevant files have changed.

### 0.1 Environment & Temporal Sync (Always Run)

// turbo

```bash
# 1. Env Check
/env-validator

# 2. Dependency Integrity
if ! git diff --quiet pnpm-lock.yaml; then
  pnpm install
fi

# 3. Temporal Sync
git fetch origin main > /dev/null 2>&1
behind_count=$(git rev-list --count HEAD..origin/main)
[ "$behind_count" -gt 0 ] && echo "⚠️ Branch is $behind_count commits behind main."
```

### 0.2 Incremental Triple Gate (Parallel)

// turbo

```bash
echo "🚀 Running Triple Gate..."
# Uses Turbo to run check-types, lint, and test concurrently with caching
pnpm exec turbo run check-types lint test
```

### 0.3 Domain-Specific Gating

// turbo

```bash
# Check diff for specific domains
CHANGED_FILES=$(git diff --name-only origin/main...HEAD)

# UI Audit (only for src/features/ or src/components/)
if echo "$CHANGED_FILES" | grep -qE "src/(features|components)/"; then
  echo "🔍 UI changes detected. Running UI Health Audit..."
  /monitor-ui
fi

# DB Audit (only for prisma/ or schema.prisma)
if echo "$CHANGED_FILES" | grep -qE "prisma/|schema\.prisma"; then
  echo "🔍 DB changes detected. Running DB Integrity Audit..."
  /supabase-inspector
  /prisma-migrator
fi

# Bio Audit (only for src/services/bio/)
if echo "$CHANGED_FILES" | grep -qE "src/services/bio/"; then
  echo "🔍 Bio changes detected. Running Bio Validator..."
  /bio-validator
fi
```

---

## Phase 1: Surgical Strike (Failure Isolation)

### 1.0 Automated Intelligence Gathering

// turbo

```bash
RUN_ID=$(gh run list --limit 1 --json databaseId,status -q '.[] | select(.status=="completed") | .databaseId')
echo "🎯 Analyzing Run: $RUN_ID"

# 1. Machine-Readable Diagnosis
gh run view $RUN_ID --log | npx tsx scripts/ci-classifier.ts --stdin --json > .agent/reports/ci-diagnosis.json

# 2. External Intelligence
PR_NUM=$(gh pr view --json number -q '.number')
gh pr view $PR_NUM --json comments,statusCheckRollup | npx tsx scripts/app-intelligence.ts > .agent/reports/app-intelligence.json

# 3. Target Acquisition
FAILED_TESTS=$(gh run view $RUN_ID --log-failed | grep -oE "tests/[^[:space:]]+\.spec\.ts" | sort | uniq)

# 👼 GOD MODE: Annotation Injection
npx tsx scripts/post-annotations.ts
```

### 1.1 LLM Surgical Plan

If failures are identified, feed `.agent/reports/ci-diagnosis.json` and `.agent/reports/app-intelligence.json` (including `aiAgentPrompts`) to Antigravity:

> **Execute Activity:** "Generate a surgical fix for the identified CI failures. Focus on the matched error categories, proposed solutions, and especially any direct instructions in the `aiAgentPrompts` from GitHub Apps."

---

## Phase 2: The Repair Loop (Max 3 Iterations)

// turbo

```bash
# 👼 GOD MODE: Auto-Remediation (Snyk Patches)
npx tsx scripts/auto-patcher.ts

# Run isolated tests based on acquired targets
if [ ! -z "$FAILED_TESTS" ]; then
  npx playwright test $FAILED_TESTS --workers=1
else
  pnpm test
fi
```

---

## Phase 3: Post-Mortem & Documentation

1. **Cleanup:** Remove debug logs.
2. **Knowledge:** Update `DEBT.md` if the fix is a workaround.
3. **Guardrails:** Add new regex patterns to `scripts/ci-classifier.ts` if this failure mode was new.
4. **👼 GOD MODE: Quarantine & Debt Sync**
   If a test failed reliably in CI but passes locally (or is marked as `@flaky`):

   ```bash
   npx tsx scripts/quarantine-test.ts "tests/e2e/failed-test.spec.ts"
   ```

5. **👼 GOD MODE: Bi-directional Chat**

   ```bash
   npx tsx scripts/gh-commenter.ts "🩺 CI Doctor has applied a surgical fix based on the latest diagnostics. Flaky tests have been quarantined and logged to DEBT.md."
   ```
