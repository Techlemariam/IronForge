---
description: "Workflow for gatekeeper"
command: "/gatekeeper"
category: "verification"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@qa"
domain: "core"
---
# 🛡️ The Gatekeeper

**Role:** Quality Enforcer.
**Goal:** Prevent imperfect code from leaving the local environment.

## Protocol

### ⚠️ The Golden Rule

**"There is no such thing as a small fix."**
Never skip validation for "micro-fixes", "lint tweaks", or "typo corrections". These often break builds due to missing types or strict checks.

Run this **before** every `git push`. If it fails, **DO NOT PUSH**.

### 0.0 Branch Validation

// turbo

```bash
## Verify branch
current_branch=$(git rev-parse --abbrev-ref HEAD)

if [ "$current_branch" = "main" ]; then
  echo "⛔ INVALID BRANCH: You are on 'main'"
  echo "   Create a feature branch first via /claim-task"
  exit 1
fi

echo "🔍 Gatekeeper running on branch: $current_branch"
```

### 0.1 The Local Loop (Iteration)

The core of the Gatekeeper is the **Local Loop**. You must loop through these steps until **all** are green.

```bash
## 1. Type Safety (Fastest Check)
npm run check-types

## 2. Linting & Static Analysis
npm run lint

## 3. Build Verification
npm run build

## 4. Unit Tests
npm run test
```

**RULE:** If any step fails, fix it and **restart the loop from step 1**. Do not proceed to the next step until the previous one passes.

### 1. Logic Scan (The Deep Gate)

```bash
/monitor-logic
```

- **Fail Calculation:**
  - New `any`: **FATAL**
  - New `TODO` without issue tracking: **WARNING**
  - TypeScript errors: **FATAL**

### 2. Test Integrity (The Trust Gate)

```bash
/monitor-tests
```

- **Fail Calculation:**
  - Failed tests: **FATAL**
  - Skipped tests (without reason): **WARNING**

### 3. Bio-Integrity (The Domain Gate)

```bash
/monitor-bio
```

- **Fail Calculation:**
  - Breaking Garmin/Strava contracts: **FATAL**
  - Invalid mocking of bio-data: **FATAL**

### 4. Config Check

- **Instruction**: If any monitoring command fails due to permission, update `.agent/config.json`.

## 🛑 Verdict

Score calculation:

- **FATAL** = Score 0 (STOP)
- **WARNING** = Score 90 (Proceed with Caution)
- **CLEAN** = Score 100 (Pass)

**Output:**

```
╔══════════════════════════════╗
║ 🛡️ GATEKEEPER VERDICT: [XXX] ║
╚══════════════════════════════╝
```

- [100] ✅ **APPROVED:** Safe to **Push to Feature Branch** and **Create PR**.
- [<100] ❌ **REJECTED:** Fix FATAL issues locally. **DO NOT PUSH**.

## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
