---
description: "Workflow for resolving persistent CI failures"
command: "/ci-rescue"
category: "maintenance"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@infrastructure"
domain: "ci"
---
# CI Rescue Protocol

**Role:** CI Stabilizer.
**Trigger:** Persistent (>2) CI failures on the same branch.

---

## Phase 1: Diagnostics (The "Black Box" Check)

1. **Fetch Status**:

   ```bash
   gh run list --branch <branch_name> --limit 1
   ```

2. **Retrieve Failure Logs**:

   ```bash
   gh run view <RUN_ID> --log-failed
   ```

3. **Check for "Silent Failures"**:
   If logs are empty or generic "timeout", checking browser logs is mandatory.
   - *Action*: Enable console forwarding in Playwright tests.

   ```typescript
   // In test.beforeEach
   page.on('console', msg => console.log(`[Browser]: ${msg.text()}`));
   ```

---

## Phase 2: Race Condition Hunting

Common in E2E tests.

1. **Verify Mocks**:
   - Are `page.addInitScript` calls occurring *before* `page.goto`?
   - Are hooks using `useEffect` (async) or `useState(() => ...)` (sync) to read mocks?

2. **Add Instrumentation**:
   - Add temporary `console.log` in suspect React components (`useEffect`, render body).
   - Add `await page.evaluate(() => console.log(...))` in tests after navigation.

---

## Phase 3: The Fix Loop

1. **Apply Patch**:
   - Convert async mock checks to synchronous lazy state.
   - Increase timeouts (temporarily) if resource contention is suspected (`workers: 1`).

2. **Commit & Monitor**:
   - Commit with `chore: debug ...` to trigger run.
   - Monitor aggressively:

   ```bash
   gh run watch <RUN_ID> --interval 30
   ```

3. **Analysis**:
   - If `[Browser]` logs are missing → Test setup issue.
   - If `[Browser]` logs show mocks missing → Navigation/Persistence issue.
   - If `[Browser]` logs show mocks present but UI missing → Rendering/Logic issue.

---

## Phase 4: Clean Up

1. **Remove Instrumentation**:
   - Delete temporary console logs.
   - Revert valid timeouts to standard values.

2. **Squash Commits**:
   - Ensure history is clean before merge.
