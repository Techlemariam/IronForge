---
name: prisma-migrator
description: Handles Prisma schema changes with safe migrations
version: 1.0.0
category: domain
owner: "@infrastructure"
platforms: ["windows", "linux", "macos"]
requires: ["schema-guard", "env-validator"]
context:
  primarySources:
    - prisma/schema.prisma
    - prisma/migrations/
  references:
    - docs/ARCHITECTURE.md
  exclude:
    - node_modules
rules:
  - "Always create migration file for schema changes"
  - "Test migrations on development database first"
  - "Never run migrate deploy without backup"
  - "Use descriptive migration names"
edgeCases:
  - "Migration conflicts with production"
  - "Data loss from column removal"
  - "Foreign key constraint violations"
---

# 🗄️ Prisma Migrator

Handles database schema changes with safe migration workflows.

## Context

| Source | Purpose |
|:-------|:--------|
| `prisma/schema.prisma` | Schema definition |
| `prisma/migrations/` | Migration history |
| `DATABASE_URL` | Target database |

## When to Use

- After modifying `schema.prisma`
- Before deployment
- During `/schema` workflow

## Execute

### Create Migration

```powershell
pwsh .agent/skills/prisma-migrator/scripts/migrate.ps1 -Name "add_user_avatar"
```

### Apply Migrations

```powershell
pwsh .agent/skills/prisma-migrator/scripts/migrate.ps1 -Deploy
```

### Reset Database

```powershell
pwsh .agent/skills/prisma-migrator/scripts/migrate.ps1 -Reset
```

## Rules

1. **Always create migration** - Never push schema without migration
2. **Test first** - Run on dev before staging/production
3. **Backup before deploy** - Critical for production
4. **Descriptive names** - `add_user_avatar` not `migration_1`

## Edge Cases

- **Migration conflicts**: Use `prisma migrate resolve`
- **Data loss**: Add default values or nullable first
- **FK violations**: Migrate in correct order
