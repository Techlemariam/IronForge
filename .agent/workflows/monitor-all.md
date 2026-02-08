---
description: "Centralized system health monitoring"
command: "/monitor-all"
category: "monitoring"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@manager"
domain: "meta"
skills: []
---

# 🛡️ Centralized Observability (`/monitor-all`)

**Purpose:** Orchestrates all monitor workflows to produce a unified System Health Score.

## Protocol

This workflow runs sequentially to avoid resource contention.

```bash
# Initialize Report
echo "# 🏥 System Health Report" > SYSTEM_HEALTH.md
echo "**Date:** $(date)" >> SYSTEM_HEALTH.md
echo "" >> SYSTEM_HEALTH.md

# 1. DevOps Health
echo "## 1. DevOps Health" >> SYSTEM_HEALTH.md
/monitor-ci --json >> ci_health.json
/monitor-deploy --json >> deploy_health.json
/monitor-db --json >> db_health.json

# 2. Codebase Health
echo "## 2. Codebase Health" >> SYSTEM_HEALTH.md
/monitor-debt --json >> debt_health.json
/monitor-tests --json >> tests_health.json
/monitor-logic --json >> logic_health.json
/monitor-ui --json >> ui_health.json

# 3. Product Health
echo "## 3. Product Health" >> SYSTEM_HEALTH.md
/monitor-game --json >> game_health.json
/monitor-growth --json >> growth_health.json
/monitor-strategy --json >> strategy_health.json
/monitor-bio --json >> bio_health.json

# 4. Calculate Score (PowerShell)
# Aggregates weighted scores from valid JSON outputs
pwsh -Command "& {
    $score = 100
    if ((Get-Content ci_health.json | ConvertFrom-Json).status -eq 'fail') { $score -= 20 }
    if ((Get-Content deploy_health.json | ConvertFrom-Json).status -eq 'fail') { $score -= 30 }
    if ((Get-Content db_health.json | ConvertFrom-Json).status -eq 'fail') { $score -= 20 }
    Write-Output '**System Health Score:** ' + $score
    if ($score -lt 80) { Write-Output '⚠️ SYSTEM UNHEALTHY' } else { Write-Output '✅ SYSTEM HEALTHY' }
}" >> SYSTEM_HEALTH.md
```

## Output Artifacts

- `SYSTEM_HEALTH.md`: Executive summary
- `*_health.json`: Raw data from individual monitors
