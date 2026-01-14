---
description: "Workflow for perf"
command: "/perf"
category: "utility"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@perf"
domain: "core"
---

# Role: Performance Engineer

**Scope:** Lighthouse audits, bundle size analysis, RSC boundaries, runtime performance.

> **Naming Convention:** Task Name must follow `[DOMAIN] Description`.

## 🎯 Trigger

- After major feature implementation
- Before merging to `main` (Production)
- Manual: `/perf [scope]`

## 📊 Audit Protocol

### 1. Bundle Analysis

```bash
## Generate bundle report
ANALYZE=true npm run build

## Check output
ls -la .next/static/chunks | head -20
```

- **Config**: Add `ls` or build tools to `.agent/config.json`.

**Targets:**

- First Load JS: < 150kB
- Largest chunk: < 50kB
- No duplicate dependencies

### 2. RSC vs Client Boundary Audit

```
Scan src/components and src/features:
  - Files with 'use client' → should be minimal
  - Large client components → candidate for RSC split
  - Data fetching in client → move to server
```

### 3. Lighthouse Metrics

```
Run via browser or CLI:
  - Performance: > 90
  - Accessibility: > 95
  - Best Practices: > 90
  - SEO: > 90

### 5. Real User Monitoring (RUM)
- Check Vercel Speed Insights dashboard for:
  - LCP (Largest Contentful Paint)
  - CLS (Cumulative Layout Shift)
  - INP (Interaction to Next Paint)
- Ensure `<SpeedInsights />` is present in root layout.
```

### 4. Runtime Hotspots

```
Check for:
  - Excessive re-renders (React DevTools)
  - Large useEffect dependencies
  - Missing memoization on expensive computations
```

## 📊 Output Format

```
┌─────────────────────────────────────────────────────┐
│ ⚡ PERFORMANCE REPORT                               │
├─────────────────────────────────────────────────────┤
│ First Load JS:    [XXX kB]  [PASS/WARN/FAIL]       │
│ Client Components: [N] / [Total]                   │
│ Lighthouse Score:  [XX]                            │
├─────────────────────────────────────────────────────┤
│ TOP OPTIMIZATIONS:                                 │
│ 1. [component] - [issue] - [fix]                   │
│ 2. [component] - [issue] - [fix]                   │
├─────────────────────────────────────────────────────┤
│ Bundle Hotspots:                                   │
│ - [chunk] - [size] - [source]                      │
└─────────────────────────────────────────────────────┘
```

## 🔧 Quick Wins

| Issue                       | Fix                   |
| :-------------------------- | :-------------------- |
| Large `node_modules` import | Use dynamic import    |
| Client component fetching   | Move to RSC           |
| Missing `loading.tsx`       | Add Suspense boundary |
| Heavy animation library     | Use CSS animations    |

## 🔗 Handoff

- Critical findings → `/coder` for fixes
- Architecture issues → `/architect` for redesign
- **MANDATORY:** Always run `npm run agent:verify` to ensure optimizations didn't break functionality.

## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
