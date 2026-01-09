---
description: "Workflow for debug"
command: "/debug"
category: "utility"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@debug"
domain: "core"
---
# Systematic Debugging

**Role:** Error Analyst & Fixer.
**Trigger:** Build failure | Test failure | Runtime error

---

## Step 1: Error Classification

Identify error type:

| Type | Indicators | Next Action |
|------|------------|-------------|
| **Build** | `npm run build` fails, type errors | Step 2A |
| **Test** | `npm test` or `playwright` fails | Step 2B |
| **Runtime** | Console errors, API 500s | Step 2C |
| **Lint** | ESLint/TypeScript warnings | `/polish` |

---

## Step 2A: Build Error Analysis

// turbo
```bash
npm run build 2>&1 | head -100
```

1. Parse error output for file paths and line numbers
2. Categorize: Type error | Import error | Config error | Syntax error
3. Check recent git changes: `git diff HEAD~3 --name-only`

**Resolution Chain:**
- Type error → Fix types, run `npm run check-types`
- Import error → Check barrel exports, circular deps
- Config error → Review `next.config.ts`, `tsconfig.json`

---

## Step 2B: Test Failure Analysis

// turbo
```bash
npm test -- --reporter=verbose 2>&1 | tail -50
```

1. Identify failing test file and assertion
2. Check if test is flaky (run 3x)
3. Compare expected vs actual

**Resolution Chain:**
- Assertion fail → Fix logic or update test
- Timeout → Increase timeout or fix async issue
- Setup fail → Check test fixtures and mocks

---

## Step 2C: Runtime Error Analysis

1. Check browser console for client errors
2. Check server logs: `npm run dev` output
3. Check API responses with `curl` or browser network tab

**Common Patterns:**
- `undefined is not a function` → Missing null check
- `Failed to fetch` → API route error or CORS
- `Hydration mismatch` → Server/client content differs

---

## Step 3: Root Cause Isolation

```bash
## Find recent changes to affected files
git log --oneline -5 -- <affected-file>

## Check if error existed before
git stash && npm run build && git stash pop
```

---

## Step 4: Fix Implementation

1. Apply minimal fix
2. Verify locally:
   // turbo
   ```bash
   npm run build && npm test
   ```
3. If fix touches core logic → `/qa` for regression test

---

## Step 5: Prevention

After successful fix:

1. Add test case if missing
2. Update `DEBT.md` if systemic issue found

3. Consider adding to `/pre-deploy` checks
4. **Config**: Add missing debug tools to `.agent/config.json`.

---

## Self-Evaluation

- **Root Cause Found (Y/N)**: Did we fix the symptom or the cause?
- **Test Added (Y/N)**: Will this break again silently?
- **Time to Fix**: Log for process improvement

---

## Emergency Mode

If stuck > 30 min:
1. `git stash` all changes
2. `git bisect` to find breaking commit
3. Escalate to `/architect` if architectural issue


## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata