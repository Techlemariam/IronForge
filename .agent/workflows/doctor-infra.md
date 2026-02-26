---
description: "Infrastructure Health Specialist (IronForge CI Doctor Branch)"
command: "/doctor-infra"
category: "maintenance"
trigger: "manual"
version: "1.0.0"
primary_agent: "@infrastructure"
domain: "infra"
skills: ["env-validator", "prisma-migrator", "supabase-inspector", "coolify-deploy", "remote-trigger"]
---

# 🩺 doctor-infra

**Role:** Infrastructure Sentinel
**Focus:** Ground-level health (Docker, Databases, Environment Variables, Runner connectivity)

## Diagnostic Protocol

### 1. Sovereign Service Health

Check if the local persistent services (DBs) are healthy.

// turbo

```bash
echo "🛡️ Checking Sovereign Service Health..."
SERVICES=("ironforge-pg-l1" "ironforge-pg-e2e" "ironforge-pg-guard")
for service in "${SERVICES[@]}"; do
  if ! docker ps --filter "name=$service" --filter "status=running" --format "{{.Names}}" | grep -q "$service"; then
    echo "⛔ ERROR: Sovereign service '$service' is down or unhealthy."
    exit 1
  fi
done
echo "✅ Sovereign Services: Healthy"
```

### 2. Schema & Migration Integrity

Check if the DB matches the schema and if migrations are pending.

// turbo

```bash
doppler run -- /supabase-inspector
doppler run -- /prisma-migrator
```

### 3. Environment Sanitization

Validate that secrets match the required Zod schemas.

// turbo

```bash
doppler run -- /env-validator
```

## Remediation Pipeline

- If Docker is down -> Restart Docker Desktop/Daemon.
- If DB is out of sync -> Run `prisma db push` or apply migrations.
- If Env is missing -> Report to user via `DEBT.md`.
