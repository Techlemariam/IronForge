---
name: gatekeeper
description: Pre-commit quality gate (types, lint, tests)
version: 1.1.0
category: guard
owner: "@qa"
platforms: ["windows", "linux", "macos"]
requires: []
context:
  primarySources:
    - tsconfig.json
    - .eslintrc.js
    - prisma/schema.prisma
  references:
    - docs/ARCHITECTURE.md
    - .antigravityrules
  patterns:
    - src/
  exclude:
    - node_modules
    - .next
    - coverage
rules:
  - "Zero TypeScript errors"
  - "Zero ESLint errors (warnings allowed)"
  - "100% test pass rate"
  - "Prisma schema must be valid"
edgeCases:
  - "Test timeouts on slow machines"
  - "Prisma client not generated"
  - "Lock file conflicts"
---

# 🚦 Gatekeeper

Comprehensive pre-commit/pre-push quality gate enforcing IronForge standards.

## Context

| Source | Purpose |
|:-------|:--------|
| `tsconfig.json` | TypeScript configuration |
| `.eslintrc.js` | Linting rules |
| `prisma/schema.prisma` | Database schema |
| `.antigravityrules` | Project coding standards |

## When to Use

- Before every commit
- Before every push
- Before creating a PR
- As part of `/pre-pr` workflow

## Execute

### Quick Check (Types + Lint)

```powershell
pwsh .agent/skills/gatekeeper/scripts/verify.ps1 -Quick
```

### Full Check (Types + Lint + Tests)

```powershell
pwsh .agent/skills/gatekeeper/scripts/verify.ps1
```

### Bash

```bash
bash .agent/skills/gatekeeper/scripts/verify.sh
```

## Rules

1. **Zero TypeScript errors** - `npm run check-types`
2. **Zero ESLint errors** - `npm run lint`
3. **Tests pass** - `npm test`
4. **Schema valid** - `prisma validate`

## Checks Performed

| Check | Command | Threshold |
|:------|:--------|:----------|
| TypeScript | `npm run check-types` | 0 errors |
| ESLint | `npm run lint` | 0 errors |
| Unit Tests | `npm test` | 100% pass |
| Prisma | `prisma validate` | Valid schema |

## Edge Cases

- **Test timeouts**: Increase Jest timeout or use `--quick`
- **Prisma not generated**: Run `npx prisma generate` first
- **Lock file conflicts**: Delete and reinstall `pnpm install`

## Expected Output

✅ **Success**: All checks pass
❌ **Failure**: Details of failing check with fix suggestions
