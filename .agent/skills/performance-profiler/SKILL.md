---
name: performance-profiler
description: Lighthouse, Web Vitals, and bundle analysis
version: 1.0.0
category: performance
owner: "@perf"
platforms: ["windows", "linux", "macos"]
requires: ["bundle-analyzer"]
context:
  primarySources:
    - next.config.ts
    - src/app/
  references:
    - .next/analyze/
---

# ⚡ Performance Profiler

Web Vitals and Lighthouse automation.

## Metrics

| Metric | Target | Tool |
|:-------|:-------|:-----|
| **LCP** | < 2.5s | Lighthouse |
| **FID** | < 100ms | Web Vitals |
| **CLS** | < 0.1 | Lighthouse |
| **TTI** | < 3.8s | Lighthouse |

## Commands

```powershell
# Run Lighthouse
npx lighthouse https://localhost:3000 --output html

# Analyze bundle
npm run analyze
```

## Integration

- `perf.md`: Primary workflow
- `pre-deploy.md`: Required gate
