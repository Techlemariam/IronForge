---
name: env-validator
description: Validates environment variables against schema
version: 1.0.0
category: guard
owner: "@infrastructure"
platforms: ["windows", "linux", "macos"]
requires: []
---

# 🔐 Env Validator

Validates required environment variables exist and match expected format.

## When to Use

- At application startup
- During CI pipeline
- Before deployment

## Execute

```powershell
pwsh .agent/skills/env-validator/scripts/validate.ps1
```

```bash
bash .agent/skills/env-validator/scripts/validate.sh
```

## Required Variables

| Variable | Required | Format |
|:---------|:--------:|:-------|
| `DATABASE_URL` | ✅ | PostgreSQL URL |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | HTTPS URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | JWT string |
| `CRON_SECRET` | ✅ | 32+ chars |

## Expected Output

✅ **Success**: All required env vars present
❌ **Failure**: List of missing/invalid variables
