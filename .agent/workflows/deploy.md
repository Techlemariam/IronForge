---
description: "Workflow for deploy"
command: "/deploy"
category: "deployment"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@infrastructure"
domain: "infra"
---
# Production Deployment (Solo Speed Run)

**Strategy:** Trunk-Based Development (Direct to `main` via PR).
**Goal:** Ship code to production swiftly and safely with automated gates.

## 🚀 The Pipeline

1. **Feature/Fix:** Work in `feature/*` or `fix/*`.
2. **Local Quality Gate:** Run `/gatekeeper` before pushing.
    - 🛑 **STOP** if score < 100.
    - ✅ **PUSH** to *feature branch* and **Create PR**.
3. **Cloud Verification:** GitHub Actions runs `Verify`, `E2E`, `DB Guard`, and `Perf Audit`.
4. **Preview (Automated):** PR triggers **Vercel Preview**.
    - 🤖 Bot comments Preview URL on PR.
5. **Release (Automated):** Merge PR to `main`.
    - 🤖 CI deploys immediately to **Production**.
    - 🏷️ Creates GitHub Release + Release Notes.

## 📋 Pre-Merge Checklist

1. **CI Green:** All checks (⚡ Verify, 🎭 E2E, 🗄️ DB Guard) must be green.
2. **Preview Verified:** Check the Vercel Preview URL for UI/UX regressions.
3. **Lighthouse:** Ensure performance scores are within budget.

## 🚨 Rollback

1. **Revert PR:** GitHub Revert on `main` triggers an auto-deploy of the previous state.
2. **Manual Override:** Vercel Dashboard -> Rollback to previous deployment for instant recovery.

## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
