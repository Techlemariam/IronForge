---
name: schema-guard
description: Validates Prisma schema and detects drift
version: 1.0.0
category: guard
owner: "@infrastructure"
platforms: ["windows", "linux", "macos"]
requires: []
---

# 🗄️ Schema Guard

Validates Prisma schema integrity and detects database drift.

## When to Use

- After modifying `prisma/schema.prisma`
- Before deployment
- During `/schema` workflow

## Execute

### Validate Schema

```powershell
pwsh .agent/skills/schema-guard/scripts/validate.ps1
```

### Check Drift

```powershell
pwsh .agent/skills/schema-guard/scripts/check-drift.ps1
```

### Generate Types

```powershell
pwsh .agent/skills/schema-guard/scripts/generate-types.ps1
```

## Checks Performed

| Check | Command |
|:------|:--------|
| Schema syntax | `prisma validate` |
| Format | `prisma format` |
| Drift detection | `prisma migrate diff` |
| Type generation | `prisma generate` |

## Expected Output

✅ **Success**: Schema valid, no drift
❌ **Failure**: Lists issues to resolve
