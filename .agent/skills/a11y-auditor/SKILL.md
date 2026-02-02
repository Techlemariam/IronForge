---
name: a11y-auditor
description: Accessibility audit using axe-core
version: 1.0.0
category: analysis
owner: "@ui-ux"
platforms: ["windows", "linux", "macos"]
requires: []
---

# ♿ A11y Auditor

Automated accessibility audit using axe-core.

## Execute

```powershell
pwsh .agent/skills/a11y-auditor/scripts/audit.ps1
```

## Checks

- Color contrast ratios
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader compatibility

## Expected Output

JSON report with WCAG violations and severity.
