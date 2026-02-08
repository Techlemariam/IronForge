---
name: supabase-inspector
description: Database schema inspection, RLS policy validation, and performance analysis
version: 1.0.0
category: database
owner: "@infrastructure"
platforms: ["windows", "linux", "macos"]
requires: ["supabase-mcp-server"]
context:
  primarySources:
    - supabase/migrations/
    - supabase/seed.sql
  references:
    - docs/ARCHITECTURE.md
  patterns:
    - src/lib/supabase/
rules:
  - "Always check RLS policies before querying sensitive data"
  - "Verify index usage for complex joins"
  - "Use pg_stat_statements for query performance analysis"
edgeCases:
  - "Remote database connection limits"
  - "Complex recursive RLS policies"
---

# 🕵️ Supabase Inspector

Deep inspection and validation tool for Supabase Postgres databases.

## Capabilities

- **Schema Analysis**: visualize table relationships and constraints
- **RLS Validator**: audit Row Level Security policies for leaks
- **Query Performance**: identify slow queries and missing indexes
- **Migration Drift**: compare local migrations vs remote schema

## Usage

```powershell
# Analyze table structure
@supabase Inspect the 'profiles' table relationships

# Validation RLS
@supabase Check if 'posts' table is secure for anonymous users

# Performance check
@supabase Analyze query performance for 'get_user_stats'
```

## Integration

This skill integrates with:

- **`monitor-db` workflow**: Automates daily schema and policy checks
- **`infrastructure` agent**: Used during migration planning
