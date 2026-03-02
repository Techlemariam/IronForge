---
name: coolify-deploy
description: Coolify-specific deployment automation — deploy services, manage Docker Compose, inspect and restart services via the Coolify API
version: 2.0.0
category: automation
owner: "@infrastructure"
platforms: ["windows", "linux", "macos"]
requires: ["doppler"]
---

# 🚀 Coolify Deploy Skill

Coolify manages all IronForge production services. The API runs on **port 8000**.

## Connection Details

| Parameter | Value |
|:---|:---|
| **API Base** | `http://ironforge-coolify.tailafb692.ts.net:8000/api/v1` |
| **Token Secret** | `COOLIFY_API_TOKEN` (Doppler) |
| **Server UUID** | `swwk0owc8sokwo80w48k48w0` |

## Pre-flight

```powershell
# All Coolify scripts require doppler run --
doppler run -- pwsh scripts/coolify-status-n8n.ps1
```

## Key Services

| Service | UUID | Type | Status Script |
|:---|:---|:---|:---|
| **n8n** | `dskgo80w0sw80o8s8k04go84` | n8n | `scripts/coolify-status-n8n.ps1` |
| **IronForge App** | `n4w4sk0sok0s040w0w0koc8c` | dockerfile | — |

## Projects

| Project | UUID |
|:---|:---|
| IronForge | `n4w4sk0sok0s040w0w0koc8c` |
| n8n | `y4sck8c40g4cockw48sg0sok` |

## Common Operations

### Start a Service

```powershell
doppler run -- pwsh scripts/coolify-start-n8n.ps1
```

### Check Service Status

```powershell
doppler run -- pwsh scripts/coolify-status-n8n.ps1
```

### Inspect All Services

```powershell
doppler run -- pwsh scripts/coolify-inspect.ps1
```

### Deploy a new Docker Compose service

```powershell
# Generic pattern — create a PS1 script similar to coolify-deploy-n8n.ps1
doppler run -- pwsh scripts/coolify-deploy-n8n.ps1
```

## API Patterns (via PS1 scripts)

Always use dedicated PS1 scripts rather than inline `pwsh -c` with `doppler run` to avoid quoting issues:

```powershell
# Pattern for any Coolify API call:
$coolifyHost = "http://ironforge-coolify.tailafb692.ts.net:8000"
$token = $env:COOLIFY_API_TOKEN  # injected by doppler run --
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept"        = "application/json"
    "Content-Type"  = "application/json"
}
$result = Invoke-RestMethod -Uri "$coolifyHost/api/v1/services" -Headers $headers
```

## Update / Rollback

Updates are handled by Coolify's built-in deployment pipeline. Trigger via Coolify UI or API redeploy endpoint. The `task-runners` container (n8nio/runners) tends to restart unexpectedly — use `coolify-start-n8n.ps1` to recover.

## Known Issues

- Calling `restart` on n8n service causes both containers to exit; always follow with `start`
- Coolify HTTPS cert is self-signed (Tailscale) — use `-SkipCertificateCheck` in pwsh or `-k` with curl
