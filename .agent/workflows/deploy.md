---
description: "Zero-Hell Deployment Orchestrator (v10.0)"
command: "/deploy"
category: "deployment"
trigger: "manual"
version: "10.0.0"
telemetry: "enabled"
primary_agent: "@infrastructure"
domain: "infra"
skills: ["coolify-deploy", "gatekeeper", "sentry-rollback", "doppler", "ci-doctor"]
---

# 🚀 Zero-Hell Deployer (IronForge Edition)

**Role:** The Closer.
**Goal:** 100% Success Rate via Mandatory Pre-flight Triage.

## 🧠 Core Philosophy

"If it's not verified, it doesn't exist. If it breaks, the Doctor fixes it."

---

## 🏭 Standard Protocol

### 1. Pre-flight Triage (The Doctor's Gate)
Before any push, we run the **CI Doctor** locally to predict failures and verify L1 gates.

```powershell
# 1. Prediction (What could go wrong?)
doppler run -- npx tsx scripts/predict-failures.ts

# 2. Local L1 Verification
doppler run -- pnpm run check-types
pnpm run lint
```

> [!IMPORTANT]
> If any L1 check fails, the deployment is **BLOCKED**. Run `/ci-doctor` to diagnose.

### 2. Branch Alignment
- **Staging**: Target `develop`.
- **Production**: Target `main` (requires PR from `develop`).

### 3. Shipping (The /factory-ship integration)
Execute the unified release script:

```powershell
# Interactive staging deploy
./scripts/ship.ps1 --stage

# Production release (Merges develop -> main)
./scripts/ship.ps1 --prod
```

### 4. Remote Verification
Immediately post-deploy, trigger a health audit:

1. **Smoke Test**: `curl https://ironforge-app.sslip.io/api/health`
2. **Sentry Check**: Verify no new issue spikes in the last 5 minutes.

---

## 🩺 Panic Protocol (Rollback)

If the **Success Rate < 100%** or Sentry alerts firing:
1. **Instant Revert**: `docker pull ghcr.io/techlemariam/ironforge:sha-<last_known_good>`
2. **Triage**: Discord notification sent to `#ironforge-triage` via `DISCORD_WEBHOOK_TRIAGE`.
