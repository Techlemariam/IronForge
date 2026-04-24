---
template_id: "SPEC"
workflow: "/spec"
tier: 1
scope_guard: "passes"
auto_dispatch: true
estimated_files: "2"
branch_prefix: "docs/spec"
---

# Jules Template: /spec

## Task

Generate a complete specification document for a new IronForge feature and link it in `roadmap.md`.

## Context

IronForge is a Next.js 15 + TypeScript gamification platform bridging real-world fitness (Intervals.icu / Hevy) with RPG game mechanics. The project roadmap is in `roadmap.md`, and feature specs live in `specs/`.

## Feature to Specify

> **FILL IN** before dispatching:

- **Feature Name**: `[FEATURE_NAME]` (e.g., "Guild Leaderboard")
- **Feature ID**: `[FEATURE_ID]` (e.g., "R-07") — find the next available ID in `roadmap.md`
- **Milestone**: `[MILESTONE]` (default: "Backlog" if not specified)
- **One-line description**: `[DESCRIPTION]`

## Pre-Task: Read Context Files

1. Read `roadmap.md` to understand existing features and conventions
2. Read `ARCHITECTURE.md` to understand system boundaries
3. Read 1-2 existing specs in `specs/` for template reference
4. Read `prisma/schema.prisma` to understand data model

## Output: Spec File

Create `specs/[feature-id]-[kebab-case-name].md` using this template:

```markdown
---
id: [FEATURE_ID]
title: [FEATURE_NAME]
status: Backlog
milestone: [MILESTONE]
created: [YYYY-MM-DD]
author: Jules (autonomous)
---

# [FEATURE_NAME]

## Overview

[2-3 sentences describing what this feature does and why it matters to IronForge players]

## User Stories

- As a **[role]**, I want to **[action]** so that **[benefit]**
- As a **[role]**, I want to **[action]** so that **[benefit]**

## Acceptance Criteria

- [ ] [Specific, testable criterion]
- [ ] [Specific, testable criterion]
- [ ] [Specific, testable criterion]

## Technical Design

### Data Model (Prisma)

```prisma
// [Proposed new models or fields — use ??? for uncertain parts]
model [ModelName] {
  id        String   @id @default(cuid())
  // ...
}
```

### API Surface

| Method | Endpoint     | Description   |
|:-------|:-------------|:--------------|
| GET    | `/api/[route]` | [description] |
| POST   | `/api/[route]` | [description] |

### Component Tree

```text
[PageComponent]
  └── [ContainerComponent]
        ├── [ChildComponent]
        └── [ChildComponent]
```

### Game Mechanics Integration

[How this feature connects to XP, levels, guilds, or other game systems]

## Out of Scope

- [What this spec explicitly does NOT cover]

## Open Questions

- [ ] [Decision needed: ...]
- [ ] [Research needed: ...]

## Dependencies

- [Other features or systems this depends on]

```markdown

## Output: roadmap.md Update

Add a link to the new spec in `roadmap.md` under the appropriate milestone section:

```diff
+ - [ ] [[FEATURE_ID]] [FEATURE_NAME](specs/[filename].md) — [one-line description]
```

## Acceptance Criteria

- [ ] Spec file created at `specs/[id]-[name].md`
- [ ] Spec contains all template sections (may have `???` for unknowns)
- [ ] `roadmap.md` updated with link to spec
- [ ] `pnpm lint` exits 0 (markdown linting if configured)
- [ ] Spec is internally consistent (no references to non-existent systems)

## Constraints

- Write spec based on existing codebase patterns — do not invent new architectural patterns
- Use `???` placeholders for genuinely unknown decisions rather than guessing
- The spec is a **starting point** — it will be refined by humans before implementation
- Do NOT create any source code, migrations, or test files
- Max 2 files: the spec file + roadmap.md update

## Branch Naming

```text
docs/spec-[FEATURE_ID]-[kebab-name]
```

Example: `docs/spec-R-07-guild-leaderboard`

## PR Template

```text
docs: spec for [FEATURE_NAME] ([FEATURE_ID])

New feature specification:
- Spec: specs/[filename].md
- Milestone: [MILESTONE]
- Open questions: [N] items marked for human decision

roadmap.md updated with spec link.

🤖 Dispatched by Jules via /spec template
```
