---
description: "Monitor Coolify deployments — inspect service health, logs, and trigger restarts via API"
command: "/monitor-deploy"
category: "monitoring"
trigger: "manual"
version: "2.0.0"
telemetry: "enabled"
primary_agent: "@infrastructure"
domain: "infra"
skills: ["coolify-deploy", "doppler", "n8n"]
---

# Deployment Monitoring Workflow

Monitor, inspect, and manage IronForge services on Coolify.

## 1. Pre-flight Check

// turbo

```powershell
doppler run -- echo "Doppler active"
```

## 2. Check n8n Service Health

// turbo

```powershell
doppler run -- pwsh scripts/coolify-status-n8n.ps1
```

Expected output:

- `n8n: n8nio/n8n:* [running:healthy]` ✅
- `task-runners: [running:unhealthy]` ⚠️ — known issue, non-blocking

## 3. Inspect All Coolify Services

// turbo

```powershell
doppler run -- pwsh scripts/coolify-inspect.ps1
```

## 4. Check n8n Workflow Status

```powershell
doppler run -- pwsh scripts/n8n-update-workflows.ps1
```

## 5. Restart n8n if Unhealthy

```powershell
doppler run -- pwsh scripts/coolify-start-n8n.ps1
```

> **Note:** Never use the Coolify `restart` endpoint alone — it causes both containers to exit. Always follow with `start`.

## 6. Verify CI Triage Router Webhook

After confirming n8n is healthy, verify the CI Doctor v4 pipeline is end-to-end:

1. Open `https://ironforge-coolify.tailafb692.ts.net`
2. Check **CI Triage Router** is Active (green toggle)
3. Confirm `N8N_CI_TRIAGE_WEBHOOK_URL` in Doppler matches the webhook URL

```powershell
doppler secrets get N8N_CI_TRIAGE_WEBHOOK_URL --plain
```

## Version History

### 2.0.0 (2026-02-27)

- Migrated from Vercel CLI to Coolify API
- Added n8n health monitoring steps
- Added CI Triage Router verification

### 1.0.0 (2026-01-08)

- Initial stable release
