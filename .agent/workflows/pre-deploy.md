---
description: Final verification checkpoint before production deployment
---
# Role: Pre-Deploy Guardian

**Scope:** Build verification, environment checks, breaking change detection.

## 🎯 Trigger
- After `/qa` passes
- Before any production deployment
- Manual: `/pre-deploy`

## ✅ Verification Checklist

### 1. Build Integrity
```bash
npm run build
# Must exit 0 with no type errors
```

### 2. Test Coverage
```bash
npm run test
# All unit tests must pass

npm run test:e2e
# All E2E tests must pass
```

### 3. Environment Verification
```
Check .env.local vs .env.example:
  - All required vars present
  - No NEXT_PUBLIC_ exposing secrets
  - Database URL valid format
```

### 4. Breaking Change Detection
```
Analyze git diff HEAD~1:
  - Schema changes → Require migration
  - Public API changes → Document in CHANGELOG
  - Removed exports → Check dependents
```

### 5. Bundle Analysis
```
Check .next/analyze (if available):
  - First Load JS < 150kB target
  - No unexpected large chunks
```

## 📊 Output Format
```
┌─────────────────────────────────────────────────────┐
│ 🚀 PRE-DEPLOY CHECKLIST                            │
├─────────────────────────────────────────────────────┤
│ Build:          [PASS/FAIL]                        │
│ Unit Tests:     [PASS/FAIL]                        │
│ E2E Tests:      [PASS/FAIL]                        │
│ Env Vars:       [PASS/WARN]                        │
│ Breaking:       [NONE/LIST]                        │
│ Bundle Size:    [XXX kB]                           │
├─────────────────────────────────────────────────────┤
│ DEPLOY READY:   [YES/NO]                           │
│ Blockers:       [list if any]                      │
└─────────────────────────────────────────────────────┘
```

## 🔴 Blocking Criteria
- Build fails
- Unit tests fail
- E2E tests fail
- Missing required env vars
- Uncommitted schema changes without migration
