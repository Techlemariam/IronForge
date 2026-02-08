---
name: coverage-check
description: Validates test coverage thresholds
version: 1.0.0
category: analysis
owner: "@qa"
platforms: ["windows", "linux", "macos"]
requires: []
---

# 📊 Coverage Check

Validates test coverage meets minimum thresholds.

## Execute

```powershell
pwsh .agent/skills/coverage-check/scripts/check.ps1
```

## Thresholds

| Metric | Minimum |
|:-------|--------:|
| Statements | 60% |
| Branches | 50% |
| Functions | 60% |
| Lines | 60% |

## Expected Output

✅ Coverage meets thresholds
❌ Coverage below minimum
