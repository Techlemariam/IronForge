---
description: "Workflow for e2e-safety"
command: "/e2e-safety"
category: "verification"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@qa"
domain: "core"
---

# 🛡️ E2E Safety Protocol

**Role:** Pre-Push Guardian.
**Goal:** Prevent CI failures by simulating CI constraints locally _before_ pushing code.
**Trigger:** After significant UI changes or "Evening Sessions".

---

## 🔬 Protocol

### 1. The "CI Simulation" (Build & Lint)

Don't trust the dev server alone. CI builds a production bundle.

```bash
# 1. Clean verify (Typecheck & Lint)
npm run check-types && npm run lint

# 2. Unit Logic Check (Vitest)
# Essential for catching regression errors (e.g., deleted components)
npm test

# 2. Production Build Check
# Triggers errors that only happen in 'next build' (e.g. static generation)
npm run build
```

---

### 2. The "Mock Audit"

Common Failure: Mocks falling out of sync with Schema.

```bash
# Check if recent schema changes affect mocks
git diff HEAD~5 -- prisma/schema.prisma src/types
```

_If types changed:_ Manually verify `window.__mockUser` in `tests/e2e/*.spec.ts` matches new types.

---

### 3. The "Stressed" Smoke Test

CI fails because it's slow and has 1 worker. Your local machine is fast.
**We must cripple your local run to match CI.**

```bash
# Run ONLY the tests relevant to your changes (e.g., 'coop')
# Force 1 worker to catch race conditions
# Run in headed mode to visually verify if it hangs
npx playwright test -g "Co-Op" --workers=1 --headed
```

**Verdict:**

- ✅ **Pass**: Safe to push.
- ❌ **Fail/Timeout**: The race condition is real.
  - **Action**: Use `/ci-doctor` workflow. Do NOT push.

---

### 4. The "Trace" Check

If tests fail, don't guess.

```bash
npx playwright show-trace test-results/
```

Look for:

- Console logs (captured via `page.on('console')`)
- Network 500s
- "Hydration failed" errors

---

## 🛑 Final Check

**Do not push until Step 3 passes with `--workers=1`.**

---

## Version History

### 1.0.0 (2026-01-11)

- Initial release to combat "Evening Session" fatigue.
