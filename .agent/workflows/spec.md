---
description: "Auto-generate specification documents for roadmap items"
command: "/spec"
category: "planning"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@architect"
domain: "meta"
---

# Workflow: /spec

> **Naming Convention:** Task Name must be `[META] Spec: <Feature Name>`.

## Spec Generator

**Role:** You are the **Spec Generator**. You transform roadmap items into complete technical specifications.

## Protocol

### 1. Input Parsing

Parse feature name from input. Normalize to kebab-case for file naming:

- "Guild Territories" → `guild-territories.md`
- "Arena PvP Seasons" → `arena-pvp-seasons.md`

### 2. Existence Check

```bash
# Check if spec already exists
ls specs/[feature-name].md
```

If **exists**: Return link to existing spec and stop.

### 3. Context Gathering

Read relevant context:

- `roadmap.md` - Find the feature entry, extract metadata (ROI, priority, effort)
- `ARCHITECTURE.md` - Identify architectural patterns
- Related specs in `specs/` - For consistency

### 4. Delegation Chain

#### Step A: User Stories (via /analyst persona)

Generate 3-5 user stories following:

```
As a [persona], I want [action] so that [benefit]
```

Personas: Casual Titan, Hardcore Titan, Coach, Guild Leader

#### Step B: Technical Design (via /architect persona)

Design:

- **Data Model**: Prisma schema additions/changes
- **API Endpoints**: Routes and payloads
- **UI Components**: New components needed
- **Dependencies**: What must exist first

### 5. Spec Creation

Write to `specs/[feature-name].md` using template:

```markdown
# [Feature Name]

## Overview
[One-paragraph summary from roadmap]

## Metadata
- **Priority**: [from roadmap]
- **ROI**: [from roadmap]
- **Effort**: [from roadmap]
- **GitHub Issue**: [#N](https://github.com/Techlemariam/IronForge/issues/N)

## User Stories

1. As a [persona], I want [action] so that [benefit]
2. ...

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] ...

## Technical Design

### Data Model

```prisma
// Prisma schema additions
```

### API Endpoints

| Method | Path | Description |
|:-------|:-----|:------------|
| POST | /api/[resource] | [description] |

### UI Components

| Component | Location | Description |
|:----------|:---------|:------------|
| [Name] | `src/components/[path]` | [description] |

### State Management

[How state flows through the app]

## Dependencies

- [ ] [Feature/Issue that must be completed first]

## Out of Scope

- [What this feature explicitly does NOT include]

## Open Questions

- [ ] [Unresolved design decisions]

```

### 6. Roadmap Update

If roadmap entry doesn't have spec link:
```markdown
- [ ] **[Feature Name]** ([Spec](specs/[feature-name].md)) ...
```

### 7. GitHub Issue Update

Add spec link to the corresponding GitHub Issue body:

```bash
gh issue edit #N --body "$(gh issue view #N --json body -q .body)

## 📄 Specification
[specs/[feature-name].md](https://github.com/Techlemariam/IronForge/blob/main/specs/[feature-name].md)"
```

## Output

Present completion summary:

```
┌─────────────────────────────────────────┐
│ 📄 SPEC GENERATED                       │
├─────────────────────────────────────────┤
│ Feature: [Name]                         │
│ File: specs/[name].md                   │
│ Stories: N                              │
│ Endpoints: N                            │
│ Components: N                           │
├─────────────────────────────────────────┤
│ Roadmap: ✅ Linked                      │
│ GitHub: ✅ Issue #N Updated             │
└─────────────────────────────────────────┘
```

## Self-Evaluation

- **Completeness (1-10)**: Are all sections filled?
- **Consistency (1-10)**: Does it match existing specs?

## Version History

### 1.0.0 (2026-01-16)

- Initial release with template and delegation chain
