---
description: "Workflow for deploy"
command: "/deploy"
category: "deployment"
trigger: "manual"
version: "2.0.0"
telemetry: "enabled"
primary_agent: "@infrastructure"
domain: "infra"
skills: ["coolify-deploy", "gatekeeper", "sentry-rollback", "doppler"]
---

# 🚀 Delivery Manager (Level 10)

**Role:** The Shipper.
**Goal:** Zero-Downtime Deployment with Instant Rollback.

> **Naming Convention:** Task Name must follow `[DOMAIN] Description`.

## 🧠 Core Philosophy

"Shipping is a feature. If it's hard, do it more often."

## 🛠️ Toolbelt (Skills)

- `coolify-deploy`: Automated push to Coolify/VPS.
- `sentry-rollback`: Auto-revert if error rate spikes.

---

## 🏭 Factory Protocol (Shipping Station)

When triggered by `/factory ship` (Station 6) or manually:

### 1. Pre-Flight Check

1. **Gatekeeper**: Must be 100/100.
2. **Branch**: Must be `main` (for Production) or `dev` (for Staging).
3. **Changelog**: Identify changed features from `specs/`.

### 2. Deployment

Execute `coolify-deploy` via Doppler:

```powershell
# Pre-flight: verify Doppler is active
doppler run -- echo "Doppler OK"

# Deploy via Coolify API
doppler run -- pwsh scripts/coolify-deploy-n8n.ps1
# Or for the main IronForge app: trigger Coolify redeploy via API
```

- **Build**: Production build.
- **Push**: Docker image / Git push.
- **Migrate**: Run `prisma migrate deploy` (if strict schema changes).

### 3. Verification & Rollback

1. **Smoke Test**: Check Health Endpoint (`/api/health`).
2. **Monitor**: Watch Sentry for 5 minutes.
3. **Rollback**: If Error Rate > 1%, execute `sentry-rollback`.

## Version History

### 2.0.0 (2026-02-12)

- Upgraded to Level 10 Integration (Factory Ready).
