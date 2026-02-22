---
description: "Comprehensive CI failure prevention and resolution (v3.0)"
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

**Role:** CI Health Specialist & Self-Healing Engine
**Goal:** Prevent, diagnose, and **automatically repair** CI failures with minimal iterations.
**Rating:** 12/10 (Auto-Remediation, Pipeline Optimization, Perpetual Learning)

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

# Step 1: Validate pnpm overrides exist on registry
echo "🔍 Validating override versions..."
if [ -f package.json ]; then
  OVERRIDES=$(node -e "const pkg = require('./package.json'); const overrides = pkg.pnpm?.overrides || {}; Object.entries(overrides).forEach(([name, version]) => console.log(name + '@' + version));")
  for override in $OVERRIDES; do
    PKG_NAME=$(echo $override | cut -d'@' -f1)
    PKG_VERSION=$(echo $override | cut -d'@' -f2-)
    echo "  Checking $PKG_NAME@$PKG_VERSION..."
    if ! npm view "$PKG_NAME@$PKG_VERSION" version &>/dev/null; then
      echo "⛔ Override validation failed: $PKG_NAME@$PKG_VERSION does not exist on registry"
      echo "💡 Run: npm view $PKG_NAME versions --json"
      exit 1
    fi
  done
  echo "✅ Override versions: Valid"
fi

# Step 2: Lockfile integrity check (frozen-lockfile dry-run)
echo "🔍 Verifying lockfile consistency..."
if ! pnpm install --frozen-lockfile --dry-run &>/dev/null; then
  echo "⚠️ Lockfile out of sync with package.json. Attempting self-healing..."
  pnpm install
  if ! git diff --quiet pnpm-lock.yaml; then
     echo "⛔ Lockfile updated. Please commit the `pnpm-lock.yaml` file."
     exit 1
  else
     echo "✅ Dependencies: Healed"
  fi
else
  echo "✅ Lockfile: Consistent"
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

# Step 1: Snyk code scanning (first-party code)
echo "🔍 Running Snyk code scan..."
if command -v snyk &>/dev/null; then
  snyk code test --severity-threshold=high || {
    echo "⚠️ Snyk found high-severity issues in first-party code"
    echo "💡 Review findings and apply fixes before proceeding"
    exit 1
  }
  echo "✅ Snyk: No critical issues"
else
  echo "⚠️ Snyk CLI not installed. Skipping code scan."
  echo "💡 Install: npm install -g snyk && snyk auth"
fi

# Step 2: pnpm audit for dependency vulnerabilities
echo "🔍 Running pnpm audit..."
pnpm audit --audit-level high || exit 1

# Step 3: Check for outdated critical packages
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

# Hygiene Rule: Standardize DATABASE_URL to 127.0.0.1 and include ?schema=public
# Hygiene Rule: Health checks MUST use -U postgres to avoid 'root' role errors
/supabase-inspector
/prisma-migrator
```

### 0.10 Pipeline Efficiency Audit (NEW in v3.0)

// turbo

```bash
echo "🏎️ Analyzing CI Pipeline efficiency..."
npx tsx scripts/ci-pipeline-analyzer.ts .github/workflows/ci-cd.yml

# Also analyze other workflow files
for wf in .github/workflows/*.yml; do
  echo "📂 Scanning: $wf"
  npx tsx scripts/ci-pipeline-analyzer.ts "$wf" --json >> .agent/reports/ci-doctor/pipeline-all.json 2>/dev/null
done

echo "✅ Pipeline Analysis: Complete"
```

### 0.11 Sovereign Service Health

// turbo

```bash
echo "🛡️ Checking Sovereign Service Health..."

# Verify persistent CI services on host
SERVICES=("ironforge-pg-l1" "ironforge-pg-e2e" "ironforge-pg-guard")
MISSING=0

for service in "${SERVICES[@]}"; do
  if ! docker ps --filter "name=$service" --filter "status=running" --format "{{.Names}}" | grep -q "$service"; then
    echo "⛔ ERROR: Sovereign service '$service' is down or unhealthy."
    MISSING=$((MISSING + 1))
  fi
done

if [ "$MISSING" -gt 0 ]; then
  echo "💡 Suggestion: Run 'scripts/ci/manage-ci-services.ps1 -Action reset' on the runner host."
  exit 1
fi

echo "✅ Sovereign Services: Healthy"
```

---

## Phase 1: Surgical Strike (Failure Isolation)

### 1.0 Automated Target Acquisition

// turbo

```bash
# Fetch last failed CI run details
RUN_ID=$(gh run list --limit 1 --json databaseId -q '.[0].databaseId')
echo "🎯 Analyzing Run: $RUN_ID"

# 1. Automated Diagnosis (Classifier v3.0 — 27 patterns)
echo "🔮 Running CI Classifier v3.0..."
gh run view $RUN_ID --log-failed 2>/dev/null | npx tsx scripts/ci-classifier.ts --stdin --json > /tmp/ci-classifications.json
cat /tmp/ci-classifications.json | npx tsx scripts/ci-classifier.ts --stdin

# 2. Sovereign Ground Truth Extraction (NEW in v3.0)
# If DB connection failed, pull local Docker logs for deeper diagnostics
if grep -q "ECONNREFUSED\|ECONNRESET\|Prisma" /tmp/ci-classifications.json; then
  echo "🔍 DB Failure detected. Fetching Sovereign Ground Truth (Docker Logs)..."
  for service in "ironforge-pg-l1" "ironforge-pg-e2e" "ironforge-pg-guard"; do
    if docker ps --filter "name=$service" --format "{{.ID}}" | grep -q "."; then
      echo "📂 Logs for $service:"
      docker logs "$service" --tail 50
    fi
  done
fi

# 3. Automated Target Acquisition
FAILED_TESTS=$(gh run view $RUN_ID --log-failed 2>/dev/null | grep "Error:" | grep -oE "tests/[^[:space:]]+\.spec\.ts" | sort | uniq | tr '\n' ' ')

# 3. External Intelligence Acquisition (GitHub Apps — 6 sources)
echo "📡 Syncing with PR Assistants (CodeRabbit, Snyk, CodeFactor, Codecov, Dependabot, Chromatic)..."
PR_NUM=$(gh pr view --json number -q '.number' 2>/dev/null)
if [ -n "$PR_NUM" ]; then
  INTELLIGENCE=$(gh pr view $PR_NUM --json comments,statusCheckRollup | npx tsx scripts/app-intelligence.ts)
  echo "🧠 Intelligence Received:"
  echo "$INTELLIGENCE"
else
  echo "ℹ️ No PR context. Skipping intelligence acquisition."
  INTELLIGENCE='{"targets":[],"protocols":[],"suggestions":[]}'
fi

if [ -z "$FAILED_TESTS" ] && [ "$INTELLIGENCE" == '{"targets":[],"protocols":[],"suggestions":[]}' ]; then
    echo "✅ No specific failure artifacts or App feedback found. Proceeding to standard classification."
else
    echo "🚨 TARGETS ACQUIRED:"
    echo "$FAILED_TESTS"
    echo "$INTELLIGENCE"
fi
```

### 1.1 Classification Matrix (v3.0 — 27 Patterns)

| Symptom                        | Protocol                                          | Auto-Fix | Risk |
| :----------------------------- | :------------------------------------------------ | :------- | :--- |
| `Timeout waiting for selector` | **SELECTOR_TIMEOUT** (Check `data-testid`)        | ❌       | 🟡   |
| `Expected X, received Y`       | **ASSERTION_MISMATCH** (Check `tests/mocks`)      | ❌       | 🟡   |
| `net::ERR_`                    | **NETWORK_HANG** (Mock missing)                   | ❌       | 🟡   |
| `Pass Locally / Fail Remote`   | **RACE_CONDITION** (Move mock to `addInitScript`) | ❌       | 🟡   |
| `Qodana: Hardcoded password`   | **SECURITY_BREACH** (Rotate secrets)              | ❌       | 🔴   |
| `Qodana: Duplicated code`      | **DRY_VIOLATION** (Extract shared code)           | ❌       | 🟢   |
| `Axe: violations`              | **ACCESSIBILITY_FAIL** (Run `/a11y-auditor`)      | ❌       | 🟡   |
| `Join-Path` / `\` paths        | **PLATFORM_COMPATIBILITY** (Use `/` separators)   | ✅       | 🟢   |
| `Prisma: Migration failed`     | **DB_MIGRATION_FAIL** (Auto-migrate)              | ✅       | 🟡   |
| `Lighthouse: Performance`      | **PERF_DEGRADATION** (Use `/perf-profiler`)       | ❌       | 🟡   |
| `Qodana: Critical issues`      | **STATIC_ANALYSIS_FAIL** (Use `/qodana-linter`)   | ❌       | 🟡   |
| `Zod: Validation error`        | **SCHEMA_MISMATCH** (Use `/zod-schema-validator`) | ❌       | 🟡   |
| `Mock: Data outdated`          | **STALE_MOCK** (Update snapshots)                 | ✅       | 🟢   |
| `Bio: Data sync fail`          | **BIO_SYNC_FAIL** (Use `/bio-validator`)          | ❌       | 🟡   |
| `Database: Schema out of sync` | **DB_OUT_OF_SYNC** (Push schema)                  | ✅       | 🟡   |
| `A11y: Contrast/ARIA`          | **ACCESSIBILITY_FAIL** (Use `/a11y-auditor`)      | ❌       | 🟡   |
| `Coolify: Deployment failed`   | **COOLIFY_DOWN** (Check infrastructure)           | ❌       | 🔴   |
| `Docker daemon down`          | **DOCKER_SERVICE_RESTART** (Start Docker)         | ✅       | 🟡   |
| `Container unhealthy`         | **DOCKER_SERVICE_RESET** (Reset services)         | ✅       | 🟡   |
| `Container OOM/Disk Full`     | **DOCKER_RESOURCE_LIMIT** (Prune system)          | ❌       | 🔴   |
| `Merge conflicts detected`     | **MERGE_CONFLICT** (Use `git rebase`)             | ❌       | 🟡   |
| `Patch coverage missing`       | **COVERAGE_DROP** (Generate tests)                | ✅       | 🟢   |
| `Insufficient docstrings`      | **DOCSTRING_FAIL** (Use `/doc-generator`)         | ✅       | 🟢   |
| `Path traversal risk`          | **SECURE_INPUT_FAIL** (Use `/red-team`)           | ❌       | 🔴   |
| `pg_isready: role "root"...`   | **POSTGRES_USER_MISMATCH** (Apply `-U postgres`)  | ✅       | 🟢   |
| `relation "X" does not exist`  | **SCHEMA_SYNC_FAIL** (Add `?schema=public`)       | ✅       | 🟡   |
| `Connection timeout (Prisma)`  | **SERVICE_RACE_CONDITION** (Add wait loop)         | ✅       | 🟢   |
| `Storybook: Module not found`  | **ALIAS_MISSING** (Verify `@` alias in main.ts)   | ✅       | 🟢   |
| `TypeError / is not defined`   | **TYPE_ERROR** (Run type check)                    | ✅       | 🟢   |
| `SyntaxError / lint error`     | **SYNTAX_ERROR** (Run lint --fix)                  | ✅       | 🟢   |

### 1.2 The Qodana Ward (Static Analysis)

#### Protocol: SECURITY_BREACH

- **Detection:** `grep -r "password" .github/workflows` or check `cypress.env.json`.
- **Fix:** Replace hardcoded strings with `${{ secrets.MY_KEY }}` or environment variables.
- **Verify:** `git grep "my-secret-value"` should return nothing.

#### Protocol: DRY_VIOLATION (Duplication)

- **Threshold:** Qodana flags >10 duplicate lines.
- **Fix:** Extract logic to `src/lib/utils.ts` or a shared component.
- **Exemption:** If intentional (e.g. seed scripts), add `// noinspection DuplicatedCode` to the file header.

#### Protocol: REGEX_REDUNDANCY

- **Fix:** Simplify Regex patterns (e.g., remove unnecessary groups).

#### Protocol: PLATFORM_COMPATIBILITY (Linux/Windows)

- **Context:** PowerShell scripts running on GitHub Actions (`ubuntu-latest`).
- **Detection:** `Join-Path` errors or "File not found" due to backslashes (`\`).
- **Fix:** Always use forward slashes (`/`) in relative paths. PowerShell handles `/` on Windows fine, but Linux fails on `\`.
- **Rule:** `Join-Path "folder/file.ext"` >>> `Join-Path "folder\file.ext"`.

### 1.3 Performance & Size (Bloat Check)

#### Protocol: BUNDLE_BLOAT

- **Detection:** `/bundle-analyzer` reports gzip size increase > 5%.
- **Fix:** Analyzes `next build` output. Look for large dependencies (e.g., `lodash` vs `lodash-es`, heavy icons).
- **Tool:** Run `/bundle-analyzer` to visualize and verify.

### 1.4 Coverage & Visuals

#### Protocol: COVERAGE_DROP

- **Detection:** `/coverage-check` reports coverage below threshold (e.g. 80%).
- **Fix:** Write unit tests for new logic.
- **Tool:** `/unit-tests` to scaffold missing tests.

#### Protocol: VISUAL_REGRESSION

- **Detection:** Chromatic or Storybook build failure.
- **Fix:** Run `/storybook-bridge` to validate stories match components.

### 1.5 External Vital Signs (Coolify)

// turbo

```bash
echo "🔍 Checking Coolify Infrastructure..."
# Uses coolify-deploy scripts to verify instance health
/coolify-deploy
npx tsx scripts/check-infra.ts
```

---

## Phase 2: Auto-Remediation Pipeline (NEW in v3.0)

> **This is the core upgrade from v2.0.** CI Doctor now *executes* fixes, not just diagnoses.

### ITERATION LIMIT: 3

### RISK POLICY: Auto-fix LOW/MEDIUM. Flag HIGH for human review

```bash
echo "🔧 Phase 2: Auto-Remediation Engine"

# Check if classifications exist from Phase 1
if [ ! -f /tmp/ci-classifications.json ]; then
  echo "⛔ No classifications found. Run Phase 1 first."
  exit 1
fi

ITERATION=0
MAX_ITERATIONS=3

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  echo "🔧 Iteration $((ITERATION + 1))/$MAX_ITERATIONS"

  # Execute repair protocols (auto-fix LOW/MEDIUM risk only)
  cat /tmp/ci-classifications.json | npx tsx scripts/repair-protocols.ts --stdin --json > /tmp/ci-repairs.json
  
  # Check if any auto-fixes were applied
  FIXED=$(cat /tmp/ci-repairs.json | grep -c '"success": true' || echo "0")
  FAILED=$(cat /tmp/ci-repairs.json | grep -c '"success": false' || echo "0")
  
  echo "📊 Repairs: $FIXED fixed, $FAILED failed"

  # Re-run Triple Gate to verify fixes
  echo "🔄 Re-verifying with Triple Gate..."
  if pnpm exec turbo run check-types lint test 2>/dev/null; then
    echo "✅ Triple Gate passed after repairs!"
    break
  else
    echo "⚠️ Triple Gate still failing. Re-classifying..."
    # Re-classify the remaining errors
    pnpm exec turbo run check-types lint test 2>&1 | npx tsx scripts/ci-classifier.ts --stdin --json > /tmp/ci-classifications.json
  fi

  ITERATION=$((ITERATION + 1))
done

if [ $ITERATION -eq $MAX_ITERATIONS ]; then
  echo "⚠️ Max iterations reached. Remaining issues require human review."
fi

# Also run E2E if applicable
TARGETS=$(cat /tmp/ci-classifications.json | grep -oP '"matchedText":"[^"]*tests/[^"]*\.spec\.ts' | grep -oP 'tests/[^"]+' | sort | uniq | tr '\n' ' ')
if [ -n "$TARGETS" ]; then
  echo "🎭 Running targeted E2E tests: $TARGETS"
  npx playwright test $TARGETS --workers=1 --retries=1 || echo "⚠️ E2E failures remain."
fi
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

### 4.1 Decontaminate

1. **Clean:** Remove `console.log` debug statements.
2. **Record:** Update `DEBT.md` with new findings.

### 4.2 GitHub Integration (NEW in v3.0)

```bash
# Post report to PR (if on a PR branch)
PR_NUM=$(gh pr view --json number -q '.number' 2>/dev/null)
if [ -n "$PR_NUM" ] && [ -f /tmp/ci-repairs.json ]; then
  # Find latest repair report
  LATEST_REPORT=$(ls -t .agent/reports/ci-doctor/repair-*.json 2>/dev/null | head -1)
  if [ -n "$LATEST_REPORT" ]; then
    npx tsx scripts/ci-doctor-github.ts --report "$LATEST_REPORT" --pr "$PR_NUM"
  fi
fi
```

### 4.3 Trend Analysis (NEW in v3.0)

```bash
echo "📊 Analyzing failure trends..."
npx tsx scripts/ci-doctor-github.ts --trends

# Auto-create issues for recurring failures (3+ in last 10 runs)
```

### 4.4 Evolve

Proceed to Phase 5 if a new failure mode was discovered.

---

## Phase 5: Perpetual Learning & Immunity

**Goal:** Ensure the CI Doctor never fails the same way twice.

### 5.1 Failure Pattern Extraction

If a repair required a manual intervention or a "new" type of fix (e.g. adding a 30s sleep):

- **Classify:** Is this a **Logic Failure** (code bug) or a **Horizontal Failure** (infrastructure/environment)?
- **Extract:** What was the specific error string? (e.g. `pg_isready: role "root" does not exist`)
- **Fix:** What was the surgical patch? (e.g. `-U postgres`)

### 5.2 Protocol Injection

1. **Update `ci-classifier.ts`:** Add the new pattern to `ERROR_PATTERNS` with appropriate `autoFixable` and `risk` flags.
2. **Update `repair-protocols.ts`:** Add the executable fix to `PROTOCOLS` registry.
3. **Update Classification Matrix (Phase 1.1):** Add the new Symptom/Protocol row.
4. **Update System Diagnostics (Phase 0.x):** If the failure is "Horizontal", add a Hygiene Rule to prevent recurrence.
5. **Draft Workflow Update:** If the failure reveals a gap in local validation, update `.github/workflows/ci-cd.yml` parity.

### 5.3 Immunity Verification

- Run `/ci-doctor` again on the fixed branch.
- Ensure Phase 0.x now catches the potential failure before it hits the remote runner.

---

## Appendix: Script Reference

| Script | Purpose |
| :--- | :--- |
| `scripts/ci-classifier.ts` | Error classification (27 patterns, JSON output) |
| `scripts/repair-protocols.ts` | Auto-remediation engine (27 protocols) |
| `scripts/ci-pipeline-analyzer.ts` | Pipeline efficiency analyzer |
| `scripts/ci-doctor-github.ts` | GitHub PR comments, trends, auto-issues |
| `scripts/app-intelligence.ts` | External app intelligence (6 sources) |
| `scripts/validate-mocks.ts` | Mock data validation |
| `scripts/check-infra.ts` | Infrastructure health check |
