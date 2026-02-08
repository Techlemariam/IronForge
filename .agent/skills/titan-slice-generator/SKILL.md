---
name: titan-slice-generator
description: Generates complete vertical slices from DB to UI
version: 1.0.0
category: domain
owner: "@coder"
platforms: ["windows", "linux", "macos"]
requires: ["schema-guard"]
context:
  primarySources:
    - prisma/schema.prisma
    - src/lib/types.ts
  references:
    - docs/ARCHITECTURE.md
    - .antigravityrules
  patterns:
    - src/actions/
    - src/features/
    - src/components/ui/
  exclude:
    - node_modules
    - .next
rules:
  - "Use Server Actions for all mutations"
  - "Implement Optimistic Updates via useOptimistic"
  - "Zod validation for all inputs"
  - "Result pattern with ActionResponse"
  - "Follow existing component patterns"
edgeCases:
  - "Circular dependencies between features"
  - "Schema not synced with types"
  - "Missing Prisma client generation"
---

# 🏗️ Titan Slice Generator

Generates complete vertical slices (DB → API → Hook → UI) following IronForge architecture.

## Context

| Source | Purpose |
|:-------|:--------|
| `prisma/schema.prisma` | Entity definitions |
| `src/actions/` | Server Action patterns |
| `src/features/` | Feature structure reference |
| `ARCHITECTURE.md` | Architecture guidelines |

## When to Use

- Creating a new feature from scratch
- Adding CRUD operations for an entity
- During `/domain-session` feature work

## Execute

```powershell
pwsh .agent/skills/titan-slice-generator/scripts/generate.ps1 -Entity "Workout"
```

## Rules

1. **Server Actions** - All mutations via `src/actions/`
2. **Optimistic Updates** - Use `useOptimistic` for instant feedback
3. **Zod Validation** - Schema for all inputs
4. **Result Pattern** - Return `ActionResponse<T>` type
5. **Pattern Matching** - Follow existing `/src/features/` structure

## Generated Files

For entity `Workout`:

```
src/
├── actions/workout.ts        # Server Actions
├── features/workout/
│   ├── components/
│   │   └── WorkoutCard.tsx
│   ├── hooks/
│   │   └── useWorkout.ts
│   └── index.ts
└── lib/schemas/workout.ts    # Zod schema
```

## Edge Cases

- **Circular deps**: Generate in correct order
- **Schema drift**: Run `prisma generate` first
