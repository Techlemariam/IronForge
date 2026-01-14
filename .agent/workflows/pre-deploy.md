---
description: "Workflow for pre-deploy"
command: "/pre-deploy"
category: "verification"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@qa"
domain: "infra"
---

# Role: Pre-Release Verifier

**Scope:** Verifying that the automated CI/CD pipeline has passed for the release Pull Request.

## 🎯 Trigger

- You have created a Pull Request to `main`.
- You want to ensure it is safe to merge.

## ✅ Verification Checklist

### 1. Check CI Status (GitHub)

Instead of running tests locally, check the status of the checks at the bottom of the Pull Request page.

- **Verify**: `✅ Lint` passes
- **Verify**: `✅ Type Check` passes
- **Verify**: `✅ Unit Tests` pass
- **Verify**: `✅ E2E Tests` pass
- **Verify**: `✅ Build` passes

### 2. Deployment Preview

- **Check**: Vercel bot comment with the **Preview URL**.
- **Action**: Click the link and verify the critical paths manually if needed.
  - Login/Auth flow
  - Payment flow (if touched)
  - Critical new features

### 3. Breaking Changes

- **Review**: Did you modify the database schema?
  - [ ] If yes, ensure a migration is included in the PR.
- **Review**: Did you change public API contracts?
  - [ ] Update documentation/changelog if necessary.

## 🔴 Blocking Criteria

- ❌ Any red/failing check in the PR.
- ❌ Missing Vercel Preview deployment.
- ❌ Merge conflicts.

> [!TIP]
> Do not merge if tests are failing. Fix the code and push again; CI will run automatically.

## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
