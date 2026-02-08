---
name: dependabot-manager
description: Strategic dependency update handling and auto-merge policies
version: 1.0.0
category: infrastructure
owner: "@infrastructure"
platforms: ["windows", "linux", "macos"]
context:
  primarySources:
    - .github/dependabot.yml
  references:
    - package.json
---

# 🤖 Dependabot Manager

Strategic handling of dependency updates.

## Auto-Merge Policy

| Update Type | Action |
|:------------|:-------|
| **Patch** (1.0.x) | Auto-merge if CI passes |
| **Minor** (1.x.0) | Auto-merge after 24h |
| **Major** (x.0.0) | Manual review required |

## Security Updates

Always prioritize:

1. `npm audit` critical/high
2. Dependabot security alerts
3. GitHub security advisories

## Commands

```powershell
# Check for vulnerabilities
npm audit

# Update specific package
npm update <package>

# Interactive update
npx npm-check-updates -i
```

## Integration

- `infrastructure.md`: Dependency management
- `night-shift.md`: Nightly security scan
