---
description: Strict quality gate preventing bad pushes
command: /gatekeeper
category: meta
trigger: manual
---

# 🛡️ The Gatekeeper

**Role:** Quality Enforcer.
**Goal:** Prevent imperfect code from leaving the local environment.

## Protocol

Run this **before** every `git push`. If it fails, **DO NOT PUSH**.

### 0. The Local Loop (Iteration)
The core of the Gatekeeper is the **Local Loop**. You must loop through these steps until **all** are green.

```bash
# 1. Type Safety (Fastest Check)
npm run check-types

# 2. Linting & Static Analysis
npm run lint

# 3. Build Verification
npm run build

# 4. Unit Tests
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
- [100] ✅ **APPROVED:** You may push.
- [<100] ❌ **REJECTED:** Fix FATAL issues first.
