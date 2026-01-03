---
description: Monitor Database & Migrations
command: /monitor-db
category: monitor
trigger: manual
---
# Database Monitoring Workflow

This workflow describes how to monitor the health, schema state, and content of the database using Prisma.

## 1. Check Migration Status
Verify if your database schema is in sync with your Prisma schema (useful for catching drift).

```bash
npx prisma migrate status
```

## 2. Visually Inspect Data (Studio)
Launch the Prisma Studio GUI to browse and edit database records manually.

```bash
npx prisma studio
```

## 3. Validate Schema
Check the `schema.prisma` file for syntax errors or invalid references before generating the client.

```bash
npx prisma validate
```

## 4. Debug Migrations
If a migration fails, mark it as resolved or reset the database (local only).

```bash
# Mark a failed migration as applied (use with caution)
npx prisma migrate resolve --applied <MIGRATION_NAME>

# Rollback a failed migration
npx prisma migrate resolve --rolled-back <MIGRATION_NAME>
```
