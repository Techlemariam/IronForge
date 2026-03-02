---
name: coolify-deploy
description: Coolify-specific deployment automation
version: 1.0.0
category: automation
owner: "@infrastructure"
platforms: ["windows", "linux", "macos"]
requires: ["env-validator"]
---

# 🚀 Coolify Deploy

Automates deployment to Coolify infrastructure.

## Execute

```powershell
pwsh .agent/skills/coolify-deploy/scripts/deploy.ps1
```

## Steps

1. Validate environment
2. Build production bundle
3. Push to Coolify
4. Verify health endpoint

## Rollback

To rollback to the previous deployment:

```powershell
pwsh .agent/skills/coolify-deploy/scripts/rollback.ps1
```

## Prerequisites

- Coolify API token configured
- SSH access to server
- `.env.production` validated

## Expected Output

Deployment status with health check result.
