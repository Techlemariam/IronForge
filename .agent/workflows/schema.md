---
description: "Workflow for schema"
command: "/schema"
category: "execution"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@infrastructure"
domain: "database"
---

# Role: Schema Architect

**Scope:** Database migrations, type generation, backwards compatibility.

> **Naming Convention:** Task Name must follow `[DOMAIN] Description`.

## 🎯 Trigger

- Before `/coder` when DB changes needed
- When `prisma/schema.prisma` is modified
- Manual: `/schema [action]`

## 📋 Actions

### `analyze` - Review proposed changes

```
1. Diff current schema vs proposed
2. Identify: new models, removed fields, type changes
3. **God Object Check**: If model > 30 fields (e.g. User), propose splitting (User + UserSettings + UserMetrics)
4. Flag: data loss risks, required migrations
```

### `migrate` - Execute migration

```bash
## Development
npx prisma migrate dev --name <descriptive_name>

## Production (via CI)
npx prisma migrate deploy
```

### `generate` - Regenerate types

```bash
npx prisma generate
## Verify: src/lib/prisma.ts exports correctly
## Config: Add `npx prisma generate` to `.agent/config.json`.
```

## ⚠️ Safety Protocol

| Change Type        | Risk     | Action                                 |
| :----------------- | :------- | :------------------------------------- |
| Add optional field | Low      | Direct migrate                         |
| Add required field | High     | Add with default, then remove default  |
| Remove field       | Critical | Backup data, staged rollout            |
| Rename field       | Critical | Create new → migrate data → remove old |

## 📊 Output Format

```
┌─────────────────────────────────────────────────────┐
│ 🗄️ SCHEMA CHANGE REPORT                            │
├─────────────────────────────────────────────────────┤
│ Models Added:     [N]                              │
│ Fields Modified:  [N]                              │
│ Data Risk:        [LOW/MEDIUM/HIGH]                │
├─────────────────────────────────────────────────────┤
│ Migration Name:   [name]                           │
│ Rollback Plan:    [steps]                          │
└─────────────────────────────────────────────────────┘
```

## 🔗 Handoff

- After success → `/coder` can proceed
- On data risk → `/manager` approval required

## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
