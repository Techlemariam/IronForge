---
description: "Comprehensive CI failure prevention and resolution (v2.0)"
command: "/ci-doctor"
category: "maintenance"
trigger: "manual"
version: "2.2.0"
telemetry: "enabled"
primary_agent: "@infrastructure"
domain: "ci"
skills: ["error-analyzer", "gatekeeper", "dependabot-manager", "env-validator", "linter-fixer", "schema-guard", "qodana-linter", "performance-profiler", "zod-schema-validator", "api-mocker", "bio-validator", "prisma-migrator", "a11y-auditor", "coverage-check", "bundle-analyzer", "git-guard", "supabase-inspector", "storybook-bridge", "coolify-deploy"]
---

# 🩺 CI Doctor (Protocol v2.0)

**Role:** CI Health Specialist
**Goal:** Prevent and cure CI failures with minimal iterations.
**Rating:** 11/10 (Automated Surgical Strikes, Time Dilation Checks, Recursive Quarantine)

---

## Phase 0: System Diagnostics (Pre-Flight)

### 0.0 Permission Hygiene

// turbo

```bash
if [ ! -f ".agent/config.json" ]; then
  echo "⚠️ Warning: .agent/config.json missing. Permission prompts expected."
else
  echo "✅ Permissions: Configured"
fi

# Use env-validator skill to ensure secrets match schemas
/env-validator
```

### 0.1 Dependency Check

// turbo

```bash
echo "🔍 Checking dependency integrity..."
if ! git diff --quiet pnpm-lock.yaml; then
  echo "⚠️ pnpm-lock.yaml is dirty. Attempting self-healing..."
  pnpm install
  if ! git diff --quiet pnpm-lock.yaml; then
     echo "⛔ Still dirty after auto-fix. Please commit the `pnpm-lock.yaml` file."
     exit 1
  else
     echo "✅ Dependencies: Healed"
  fi
else
  echo "✅ Dependencies: Clean"
fi
```

### 0.2 The Time Dilator (Staleness Check)

// turbo

```bash
echo "🔍 Checking temporal drift..."
git fetch origin main > /dev/null 2>&1
behind_count=$(git rev-list --count HEAD..origin/main)
if [ "$behind_count" -gt 0 ]; then
  echo "⚠️ WARNING: Branch is $behind_count commits behind main."
  echo "👉 Suggested: git merge origin/main"
else
  echo "✅ Temporal Sync: Optimal"
fi
```

### 0.3 The Triple Gate

// turbo

```bash
echo "🚀 Running Triple Gate (Parallel)..."
# Uses Turbo to run check-types, lint, and test concurrently
pnpm exec turbo run check-types lint test || exit 1

echo "✅ Triple Gate Passed"
```

### 0.4 Mock Validation

// turbo

```bash
npx tsx scripts/validate-mocks.ts
```

### 0.5 UI Health Audit

// turbo

```bash
echo "🔍 Checking UI Health..."
/monitor-ui
# Note: Monitor-UI logs critical issues to DEBT.md
# Fail if critical accessibility issues are found that block release
if [ -f .agent/reports/ui/latest.json ] && grep -q '"status": "CRITICAL"' .agent/reports/ui/latest.json; then
  echo "⛔ UI HEALTH CRITICAL: Release blocked by A11y/Consistency violations."
  exit 1
fi
echo "✅ UI Health: Verified"
```

### 0.6 Dependency Health Audit

// turbo

```bash
echo "🔍 Checking dependency health..."
# Run pnpm audit to find vulnerabilities
pnpm audit --audit-level high || exit 1
# Check for outdated critical packages
# Note: Handled by dependabot-manager skill
echo "✅ Dependencies: Healthy"
```

### 0.8 Git Hygiene (Branch & Commit)

// turbo

```bash
echo "🔍 Checking Git health..."
/git-guard
```

### 0.9 Database Integrity

// turbo

```bash
echo "🔍 Checking DB Schema Integrity..."
/supabase-inspector
/prisma-migrator
```

---

## Phase 1: Surgical Strike (Failure Isolation)

### 1.0 Automated Target Acquisition

// turbo

```bash
# Fetch last failed CI run details
RUN_ID=$(gh run list --limit 1 --json databaseId -q '.[0].databaseId')
echo "🎯 Analyzing Run: $RUN_ID"

# 1. Automated Diagnosis (Classifier)
echo "🔮 Running CI Classifier..."
gh run view $RUN_ID --log | npx tsx scripts/ci-classifier.ts --stdin

# 2. Automated Target Acquisition
FAILED_TESTS=$(gh run view $RUN_ID --log-failed | grep "Error:" | grep -oE "tests/[^[:space:]]+\.spec\.ts" | sort | uniq | tr '\n' ' ')

# 3. External Intelligence Acquisition (GitHub Apps)
echo "📡 Syncing with PR Assistants (CodeRabbit, Snyk, CodeFactor)..."
PR_NUM=$(gh pr view --json number -q '.number')
INTELLIGENCE=$(gh pr view $PR_NUM --json comments,statusCheckRollup | npx tsx scripts/app-intelligence.ts)
echo "🧠 Intelligence Received:"
echo "$INTELLIGENCE"

if [ -z "$FAILED_TESTS" ] && [ "$INTELLIGENCE" == '{"targets":[],"protocols":[]}' ]; then
    echo "✅ No specific failure artifacts or App feedback found. Proceeding to standard classification."
else
    echo "🚨 TARGETS ACQUIRED:"
    echo "$FAILED_TESTS"
    echo "$INTELLIGENCE"
fi
```

### 1.1 Classification Matrix

| Symptom                        | Protocol                                          |
| :----------------------------- | :------------------------------------------------ |
| `Timeout waiting for selector` | **SELECTOR_TIMEOUT** (Check `data-testid`)        |
| `Expected X, received Y`       | **ASSERTION_MISMATCH** (Check `tests/mocks`)      |
| `net::ERR_`                    | **NETWORK_HANG** (Mock missing)                   |
| `Pass Locally / Fail Remote`   | **RACE_CONDITION** (Move mock to `addInitScript`) |
| `Qodana: Hardcoded password`   | **SECURITY_BREACH** (See Phase 1.2)               |
| `Qodana: Duplicated code`      | **DRY_VIOLATION** (See Phase 1.2)                 |
| `Axe: violations`              | **A11Y_FAIL** (Run `/monitor-ui` & fix markup)    |
| `Join-Path` / `\` paths       | **PLATFORM_COMPATIBILITY** (Use `/` separators)   |
| `Prisma: Migration failed`    | **DB_MIGRATION_FAIL** (Use `/schema-guard`)       |
| `Lighthouse: Performance`     | **PERF_DEGRADATION** (Use `/perf-profiler`)       |
| `Qodana: Critical issues`     | **STATIC_ANALYSIS_FAIL** (Use `/qodana-linter`)   |
| `Zod: Validation error`       | **SCHEMA_MISMATCH** (Use `/zod-schema-validator`) |
| `Mock: Data outdated`         | **STALE_MOCK** (Use `/api-mocker`)                |
| `Bio: Data sync fail`         | **BIO_SYNC_FAIL** (Use `/bio-validator`)          |
| `Database: Schema out of sync` | **DB_OUT_OF_SYNC** (Use `/prisma-migrator`)       |
| `A11y: Contrast/ARIA`         | **ACCESSIBILITY_FAIL** (Use `/a11y-auditor`)      |
| `Coolify: Deployment failed`  | **COOLIFY_DOWN** (Use `/coolify-deploy`)          |
| `Merge conflicts detected`    | **MERGE_CONFLICT_PROTOCOL** (Use `git rebase`)    |
| `Patch coverage missing`      | **COVERAGE_DROP** (Use `/unit-tests`)             |
| `Insufficent docstrings`      | **DOCSTRING_FAIL** (Use `/librarian`)             |

### 1.5 External Vital Signs (Coolify)

// turbo

```bash
echo "🔍 Checking Coolify Infrastructure..."
# Uses coolify-deploy scripts to verify instance health
/coolify-deploy
npx tsx scripts/check-infra.ts
```

### 1.2 The Qodana Ward (Static Analysis)

**Protocol: SECURITY_BREACH**

- **Detection:** `grep -r "password" .github/workflows` or check `cypress.env.json`.
- **Fix:** Replace hardcoded strings with `${{ secrets.MY_KEY }}` or environment variables.
- **Verify:** `git grep "my-secret-value"` should return nothing.

**Protocol: DRY_VIOLATION (Duplication)**

- **Threshold:** Qodana flags >10 duplicate lines.
- **Fix:** Extract logic to `src/lib/utils.ts` or a shared component.
- **Exemption:** If intentional (e.g. seed scripts), add `// noinspection DuplicatedCode` to the file header.

**Protocol: REGEX_REDUNDANCY**

- **Fix:** Simplify Regex patterns (e.g., remove unnecessary groups).

**Protocol: PLATFORM_COMPATIBILITY (Linux/Windows)**

- **Context:** PowerShell scripts running on GitHub Actions (`ubuntu-latest`).
- **Detection:** `Join-Path` errors or "File not found" due to backslashes (`\`).
- **Fix:** Always use forward slashes (`/`) in relative paths. PowerShell handles `/` on Windows fine, but Linux fails on `\`.
- **Rule:** `Join-Path "folder/file.ext"` >>> `Join-Path "folder\file.ext"`.

### 1.3 Performance & Size (Bloat Check)

**Protocol: BUNDLE_BLOAT**

- **Detection:** `/bundle-analyzer` reports gzip size increase > 5%.
- **Fix:** Analyzes `next build` output. Look for large dependencies (e.g., `lodash` vs `lodash-es`, heavy icons).
- **Tool:** Run `/bundle-analyzer` to visualize and verify.

### 1.4 Coverage & Visuals

**Protocol: COVERAGE_DROP**

- **Detection:** `/coverage-check` reports coverage below threshold (e.g. 80%).
- **Fix:** Write unit tests for new logic.
- **Tool:** `/unit-tests` to scaffold missing tests.

**Protocol: VISUAL_REGRESSION**

- **Detection:** Chromatic or Storybook build failure.
- **Fix:** Run `/storybook-bridge` to validate stories match components.

---

## Phase 2: The Repair Loop

**ITERATION LIMIT: 3**

```bash
# Set Target (Paste from Phase 1.0 output)
# export TARGETS="tests/e2e/example.spec.ts" 

if [ -z "$TARGETS" ]; then
  echo "⛔ No TARGETS defined. Please set export TARGETS='...'"
  exit 1
fi

echo "🔫 Locked on: $TARGETS"

 ITERATION=0
 MAX_ITERATIONS=3

 while [ $ITERATION -lt $MAX_ITERATIONS ]; do
   echo "🔧 Iteration $((ITERATION + 1))"

   # STRATEGY A: Native Surgical Strike
   npx playwright test $TARGETS --workers=1 --retries=0

   if [ $? -eq 0 ]; then
     echo "✅ Tests pass locally. Verifying in Docker..."

     # STRATEGY B: Docker Simulation (The Truth)
     docker run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.40.0-jammy \
       npx playwright test $TARGETS --workers=1

     if [ $? -eq 0 ]; then
        echo "✅ Docker verification passed. Push authorized."
        break
     else
        echo "⚠️ Failed in Docker. Environment mismatch detected."
     fi
   fi

   ITERATION=$((ITERATION + 1))
 done
```

---

## Phase 3: The Quarantine Zone (Flakiness Protocol)

If a test fails reliably in CI but passes 100% locally (even in Docker):

1. **Isolate:** Create `tests/e2e/quarantine/<test>.spec.ts`
2. **Tag:** Add `@flaky` annotation.
3. **Track:** Add to `tests/flaky-tests.json`.
4. **Bypass:** Push with ticket reference to fix later. Do not block deployment.

---

## Phase 4: After Action Report (Post-Mortem)

1. **Decontaminate:** Remove `console.log`.
2. **Record:** Update `DEBT.md`.
3. **Evolve:** Update this protocol if a new failure mode was discovered.
