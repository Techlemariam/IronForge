---
name: nextjs-route-visualizer
description: Visualizes Next.js App Router structure and API endpoints
version: 1.0.0
category: architecture
owner: "@architect"
platforms: ["windows", "linux", "macos"]
requires: []
context:
  primarySources:
    - src/app/
  references:
    - next.config.js
  patterns:
    - page.tsx
    - layout.tsx
    - route.ts
rules:
  - "Map both UI routes and API routes"
  - "Identify protected vs public routes"
  - "Highlight caching strategies (static/dynamic/isr)"
edgeCases:
  - "Parallel routes (@folder)"
  - "Intercepting routes ((.))"
---

# 🗺️ Next.js Route Visualizer

Generates a structural map of your Next.js application to understand flow and architecture.

## Capabilities

- **Route Tree**: Visual hierarchy of pages and layouts
- **API Catalog**: List of all backend endpoints in `src/app/api`
- **Middleware Analysis**: visualize where middleware.ts applies
- **Access Control**: Tag routes based on auth requirements

## Usage

```powershell
# Generate full route map
pwsh .agent/skills/nextjs-route-visualizer/scripts/map-routes.ps1

# List all public API endpoints
pwsh .agent/skills/nextjs-route-visualizer/scripts/list-api.ps1 --public
```

## Integration

- **`architect` workflow**: Used to validate structure before new features
- **`security` agent**: Audits route protection levels
