---
name: balance-checker
description: Combat and loot balance validation
version: 1.0.0
category: analysis
owner: "@game-designer"
platforms: ["windows", "linux", "macos"]
requires: ["xp-calculator"]
---

# ⚖️ Balance Checker

Validates combat, loot, and stat balance.

## Execute

```powershell
pwsh .agent/skills/balance-checker/scripts/check.ps1
```

## Areas Checked

| Area | Metrics |
|:-----|:--------|
| Combat | Boss HP vs Player DPS |
| Loot | Drop rate fairness |
| Stats | Attribute scaling |
| Economy | Gold inflation |

## Expected Output

Balance report with warnings for outliers.
