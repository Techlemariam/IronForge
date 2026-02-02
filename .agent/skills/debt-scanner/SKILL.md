---
name: debt-scanner
description: Scans codebase for technical debt patterns
version: 1.0.0
category: analysis
owner: "@cleanup"
platforms: ["windows", "linux", "macos"]
requires: []
---

# 🔍 Debt Scanner

Scans the codebase for technical debt indicators and reports findings.

## When to Use

- During `/monitor-debt` workflow
- Before sprint planning
- As part of `/night-shift`

## Execute

### Full Scan

```powershell
pwsh .agent/skills/debt-scanner/scripts/scan.ps1
```

### Specific Pattern

```powershell
pwsh .agent/skills/debt-scanner/scripts/scan.ps1 -Pattern "any"
```

### Bash

```bash
bash .agent/skills/debt-scanner/scripts/scan.sh
```

## Patterns Detected

| Pattern | Severity | Example |
|:--------|:--------:|:--------|
| `TODO` | Medium | `// TODO: fix later` |
| `FIXME` | High | `// FIXME: critical` |
| `any` type | Medium | `: any` or `as any` |
| `@ts-ignore` | High | `// @ts-ignore` |
| Empty catch | High | `catch {}` |
| `console.log` | Low | Debug statements |

## Expected Output

JSON report with counts per pattern and file locations.
