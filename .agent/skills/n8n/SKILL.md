---
name: n8n
description: Manage n8n workflows, credentials and deployments via the n8n API — CI Triage Router, Reviewer Aggregator, and Active Handover orchestration
version: 1.0.0
category: automation
owner: "@infrastructure"
platforms: ["windows", "linux", "macos"]
requires: ["doppler", "coolify-deploy"]
---

# 🔁 n8n Skill

n8n is the **orchestration hub** for IronForge CI Doctor v4. All CI failures are routed through n8n via webhooks before reaching specialist doctors.

## Architecture

```
ci-cd.yml (failure) → n8n CI Triage Router → repository_dispatch → active-handover.yml → doctor-*
```

## Key Workflows

| Workflow | ID | Purpose |
|:---|:---|:---|
| CI Triage Router | `LLWLOkXohXpMxoPR` | Routes CI failures to specialist doctors |
| Reviewer Aggregator | `AD8oaoJQFMPQm6JO` | Aggregates CodeRabbit/DeepSource reviews → auto-fix |

## Credentials

| Credential | ID | Secret |
|:---|:---|:---|
| GitHub PAT | `6BhE9M39PCG9q2Ob` | `GH_PAT` from Doppler |

## API Access (via Doppler)

```powershell
# All n8n API calls require doppler run --
doppler run -- pwsh scripts/coolify-status-n8n.ps1

# List workflows
doppler run -- pwsh -c "
  Invoke-RestMethod https://ironforge-coolify.tailafb692.ts.net/api/v1/workflows `
    -Headers @{'X-N8N-API-KEY'=(doppler secrets get N8N_API_KEY --plain)}
"
```

## Import / Update Workflows

```powershell
# Import from file
doppler run -- pwsh scripts/n8n-update-workflows.ps1

# Create credential from Doppler
doppler run -- pwsh scripts/n8n-create-credential.ps1
```

## Coolify Integration

n8n runs in Coolify as service type `n8n`:

- **Service UUID**: `dskgo80w0sw80o8s8k04go84`
- **n8n container UUID**: `s0cskwgs8ok8sokc8scwkcoo` (image: n8nio/n8n:2.1.5)
- **Host**: `https://ironforge-coolify.tailafb692.ts.net`

```powershell
# Start n8n
doppler run -- pwsh scripts/coolify-start-n8n.ps1

# Check status
doppler run -- pwsh scripts/coolify-status-n8n.ps1

# Restart (use start after restart — restart causes exit)
doppler run -- pwsh scripts/coolify-start-n8n.ps1
```

## Activate Workflows

After import, workflows are inactive by default. To activate:

1. Open `https://ironforge-coolify.tailafb692.ts.net`
2. Go to **CI Triage Router** → toggle **Active**
3. Copy the webhook URL → set in Doppler: `doppler secrets set N8N_CI_TRIAGE_WEBHOOK_URL="<url>"`

## CI Doctor v4 Webhook Setup

1. Activate CI Triage Router in n8n UI
2. Copy the generated webhook URL from the Webhook node
3. `doppler secrets set N8N_CI_TRIAGE_WEBHOOK_URL="https://ironforge-coolify.tailafb692.ts.net/webhook/ci-triage"`
4. Verify: trigger a test CI failure and watch n8n route to doctor-code
