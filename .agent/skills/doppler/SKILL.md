---
name: doppler
description: Manage secrets via Doppler CLI — run commands in secure environment, sync secrets to GitHub, and validate secret presence
version: 1.0.0
category: security
owner: "@security"
platforms: ["windows", "linux", "macos"]
---

# 🔐 Doppler Skill

Doppler is the **single source of truth** for all secrets in IronForge. `.env` files are strictly prohibited — they are a security violation.

## Pre-flight Check

Always verify Doppler is active before running secret-dependent commands:

```powershell
doppler me 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Error "Doppler session not active. Run: doppler login"
  exit 1
}
```

## Run Commands with Secrets

Prefix any command that needs secrets with `doppler run --`:

```powershell
# Correct
doppler run -- gh secret list --repo Techlemariam/IronForge

# Correct
doppler run -- pwsh scripts/my-script.ps1

# WRONG — never load .env manually
# Get-Content .env | ...  <-- VIOLATION
```

## Get a Single Secret

```powershell
$value = doppler secrets get MY_SECRET --plain
```

## List All Secrets

```powershell
doppler secrets --json
```

## Set a Secret

```powershell
doppler secrets set MY_SECRET="value"
```

## Sync to GitHub Secrets

Doppler syncs automatically to GitHub Secrets via the established integration. To trigger a manual sync:

```powershell
doppler run -- gh secret list --repo Techlemariam/IronForge
```

## Key Secrets Reference

| Secret Name | Purpose |
|:---|:---|
| `GH_PAT` | GitHub Fine-Grained PAT (replaces GITHUB_PERSONAL_ACCESS_TOKEN) |
| `N8N_API_KEY` | n8n API authentication |
| `COOLIFY_API_TOKEN` | Coolify API authentication |
| `DATABASE_URL` | Supabase pooler connection |
| `SUPABASE_ACCESS_TOKEN` | Supabase management API |
| `N8N_CI_TRIAGE_WEBHOOK_URL` | CI Doctor v4 webhook endpoint |

## Rules

1. **Never** create or load `.env` files
2. **Always** use `doppler run --` for commands needing secrets
3. Secrets in `mcp_config.json` must use `${env:SECRET_NAME}` syntax
4. CI/CD workflows get secrets from GitHub Secrets (synced by Doppler)
