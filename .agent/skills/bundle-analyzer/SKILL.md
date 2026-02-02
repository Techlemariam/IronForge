---
name: bundle-analyzer
description: Analyzes Next.js bundle size
version: 1.0.0
category: analysis
owner: "@perf"
platforms: ["windows", "linux", "macos"]
requires: []
---

# 📦 Bundle Analyzer

Analyzes Next.js bundle size and identifies optimization opportunities.

## Execute

```powershell
pwsh .agent/skills/bundle-analyzer/scripts/analyze.ps1
```

## Metrics Tracked

| Metric | Threshold |
|:-------|----------:|
| First Load JS | < 100kB |
| Largest Page | < 200kB |
| Shared Chunks | < 80kB |

## Expected Output

Bundle size report with recommendations.
