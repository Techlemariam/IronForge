---
description: "Unified Brotherhood Status Dashboard (Level 10)"
command: "/status"
category: "monitoring"
trigger: "manual"
version: "11.0.0"
telemetry: "enabled"
primary_agent: "@manager"
domain: "meta"
---

# 🏥 Panopticon: System Status (IronForge)

**Role:** The Observer.
**Goal:** 360° Visibility across Local, Remote, Autonomous, and Factory layers.

---

## 📊 Dashboard Modules

### 1. Local Health (The Baseline)
Checks for git hygiene, tracked tasks, and build integrity.

```powershell
# Git Status & Branch Audit
git status -s
git branch --show-current

# L1 Quick Check
doppler run -- pnpm run check-types
```

### 2. CI/CD Handover (The Pipeline)
Displays real-time status of the remote GitHub Actions pipeline.

```powershell
# Fetch the latest 5 runs
doppler run -- gh run list --limit 5
```

> [!TIP]
> If any run shows 🔴 failure, execute `/ci-doctor` immediately for automated triage.

### 3. Jules & Automation (Autonomous Layer)
Monitors active AI sessions and n8n background tasks.

```powershell
# Check Jules sessions
/jules-status

# Check n8n heartbeat (via script)
doppler run -- pwsh scripts/check-n8n-cron.ps1
```

### 4. Infrastructure (Production Vitals)
Checks Coolify health and Discord triage connectivity.

```powershell
# Smoke test production endpoint
curl -I https://ironforge-app.sslip.io/api/health

# Discord Connectivity Test
doppler run -- pwsh scripts/ci/test-discord-webhook.ps1
```

### 5. 🏭 Factory Health (The Assembly Line)
Live status of the Antigravity Factory — mode, active fabrication, queue, and debt.

```powershell
# // turbo
powershell scripts/factory-manager.ps1 STATUS
```

> [!TIP]
> For full factory operations (design, fabrication, verify, ship), use `/factory`.

---

## 🩺 Triage Logic

- If **Local Health < 100/100** -> Block `/deploy`.
- If **Remote CI Failing** -> Run `/ci-doctor`.
- If **Jules Stale** -> Run `/jules-status --cleanup`.
- If **Factory Mode = OFF** -> Investigate or run `factory-manager.ps1 SET-MODE MANUAL`.
- If **Open Debt > 10** -> Prioritize `/debt-attack`.

