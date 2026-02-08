---
name: qodana-linter
description: Analyze Qodana reports and auto-fix code quality issues
version: 1.0.0
category: code-quality
owner: "@qa"
platforms: ["windows", "linux", "macos"]
context:
  primarySources:
    - .github/workflows/qodana_code_quality.yml
  references:
    - qodana.yaml
---

# 🔎 Qodana Linter

Integrates JetBrains Qodana static analysis.

## Reports

Qodana generates reports at:

- CI: GitHub Actions artifacts
- Local: `qodana-report/`

## Common Issues

| Issue Type | Auto-fix |
|:-----------|:---------|
| Unused imports | ✅ |
| Dead code | ✅ |
| Type safety | ⚠️ Manual |
| Security vulns | ⚠️ Manual |

## Commands

```powershell
# Run locally
docker run --rm -v ${PWD}:/data/project jetbrains/qodana-js

# View report
start qodana-report/index.html
```

## Integration

- `qa.md`: Quality gates
- `monitor-ci.md`: CI failure analysis
