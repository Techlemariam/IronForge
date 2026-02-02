---
name: feature-flag-manager
description: Gradual rollouts and A/B testing configuration
version: 1.0.0
category: deployment
owner: "@coder"
platforms: ["windows", "linux", "macos"]
requires: []
context:
  primarySources:
    - src/lib/flags/
    - src/config/features.ts
  references:
    - .env.local
---

# 🚩 Feature Flag Manager

Control feature rollouts without deploys.

## Flag Types

| Type | Use Case |
|:-----|:---------|
| **Boolean** | On/Off toggle |
| **Percentage** | Gradual rollout (10% → 100%) |
| **User Segment** | Beta users, premium tier |

## Implementation

```typescript
// src/lib/flags/index.ts
export const flags = {
  NEW_DASHBOARD: process.env.FLAG_NEW_DASHBOARD === 'true',
  BOSS_BATTLES: 0.25, // 25% of users
};

// Usage
if (flags.NEW_DASHBOARD) {
  return <NewDashboard />;
}
```

## Integration

- `coder.md`: Wrap risky features
- `deploy.md`: Toggle for instant rollback
