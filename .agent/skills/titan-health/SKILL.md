---
name: titan-health
description: Titan bio-data integration status
version: 1.0.0
category: analysis
owner: "@titan-coach"
platforms: ["windows", "linux", "macos"]
requires: ["bio-validator"]
---

# 🏋️ Titan Health

Monitors Titan bio-data integration and recovery metrics.

## Execute

```powershell
pwsh .agent/skills/titan-health/scripts/check.ps1
```

## Metrics

| Metric | Source |
|:-------|:-------|
| HRV Baseline | Intervals.icu |
| Training Load | ACWR calculation |
| Recovery Score | Oracle verdict |
| Streak Status | streak.ts |

## Expected Output

Titan health dashboard summary.
