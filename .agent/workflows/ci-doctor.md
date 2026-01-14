---
description: "Comprehensive CI failure prevention and resolution (v2.0)"
command: "/ci-doctor"
category: "maintenance"
trigger: "manual"
version: "2.1.0"
telemetry: "enabled"
primary_agent: "@infrastructure"
domain: "ci"
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
```

### 0.1 Dependency Check

// turbo

```bash
echo "🔍 Checking dependency integrity..."
if ! git diff --quiet package-lock.json; then
  echo "⛔ ERROR: package-lock.json is dirty. Run 'npm ci' immediately."
  exit 1
fi
echo "✅ Dependencies: Clean"
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
echo "🔍 Gate 1: Type Safety"
npm run check-types || exit 1

echo "🔍 Gate 2: Linting"
npm run lint -- --fix || exit 1

echo "🔍 Gate 3: Unit Tests"
npm test || exit 1

echo "✅ Triple Gate Passed"
```

### 0.4 Mock Validation

// turbo

```bash
npx ts-node scripts/validate-mocks.ts
```

---

## Phase 1: Surgical Strike (Failure Isolation)

### 1.0 Automated Target Acquisition

// turbo

```bash
# Fetch last failed CI run details
RUN_ID=$(gh run list --limit 1 --json databaseId -q '.[0].databaseId')
echo "🎯 Analyzing Run: $RUN_ID"

# Extract failed test names
FAILED_TESTS=$(gh run view $RUN_ID --log-failed | grep "Error:" | grep ".spec.ts" | uniq)

if [ -z "$FAILED_TESTS" ]; then
    echo "✅ No obvious patterns found. Proceeding to standard classification."
else
    echo "🚨 TARGETS ACQUIRED:"
    echo "$FAILED_TESTS"
    echo "👉 Run Phase 2 specifically on these targets."
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

---

## Phase 2: The Repair Loop

**ITERATION LIMIT: 3**

```bash
# Set Target
TARGET="tests/e2e/example.spec.ts" # <-- REPLACE THIS

 ITERATION=0
 MAX_ITERATIONS=3

 while [ $ITERATION -lt $MAX_ITERATIONS ]; do
   echo "🔧 Iteration $((ITERATION + 1))"

   # STRATEGY A: Native Surgical Strike
   npx playwright test $TARGET --workers=1 --retries=0

   if [ $? -eq 0 ]; then
     echo "✅ Tests pass locally. Verifying in Docker..."

     # STRATEGY B: Docker Simulation (The Truth)
     docker run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.40.0-jammy \
       npx playwright test $TARGET --workers=1

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
