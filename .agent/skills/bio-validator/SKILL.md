---
name: bio-validator
description: Validates bio integration health (Intervals/Hevy)
version: 1.0.0
category: analysis
owner: "@titan-coach"
platforms: ["windows", "linux", "macos"]
requires: []
---

# 🧬 Bio Validator

Validates external bio integration health and data quality.

## Execute

```powershell
pwsh .agent/skills/bio-validator/scripts/validate.ps1
```

## Integrations Checked

| Integration | Checks |
|:------------|:-------|
| Intervals.icu | API health, data freshness |
| Hevy | Workout sync status |
| Garmin | Connection status |

## Expected Output

Health status for each integration.
