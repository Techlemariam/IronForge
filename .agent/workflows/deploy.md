---
description: Production deployment with zero-downtime and rollback support
command: /deploy
category: action
trigger: manual
---
# Production Deployment (Solo Speed Run)

**Strategy:** Trunk-Based Development.
**Goal:** Ship code to production swiftly and safely.

## 🚀 The Pipeline
1. **Feature Branch:** Work in `feature/*`.
2. **Preview (Automated):** Push triggers Vercel Preview + Tests.
   - 🤖 Bot comments Preview URL on PR.
3. **Release (Automated):** Merge to `main`.
   - 🤖 CI deploys immediately to **Production**.
   - 🏷️ Creates GitHub Release.

## 📋 Pre-Merge Checklist
Before merging to `main` (triggering deploy):
1. **CI Green:** All checks passed in PR.
2. **Preview Verified:** Check the Vercel Preview URL manually.
3. **No Drift:** `prisma migrate diff` passed.

## 🚨 Rollback
If Production breaks:
1. **Revert PR:** GitHub Revert on `main`.
2. **Auto-Deploy:** The revert commit triggers a new deploy.
3. **Manual Override:** Vercel Dashboard -> Rollback to previous deployment.
