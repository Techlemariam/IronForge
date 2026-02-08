---
name: requirements-extractor
description: Translate business goals to technical specs and user stories
version: 1.0.0
category: analysis
owner: "@analyst"
platforms: ["windows", "linux", "macos"]
requires: []
context:
  primarySources:
    - docs/CONTEXT.md
    - roadmap.md
  references:
    - specs/
  patterns: []
rules:
  - "Use INVEST criteria for user stories"
  - "Define acceptance criteria clearly"
  - "Identify edge cases early"
  - "Link stories to roadmap items"
---

# 📋 Requirements Extractor

Translate vague requests into actionable specifications.

## Capabilities

- **User Story Generator**: Create INVEST-compliant stories
- **Acceptance Criteria**: Define clear pass/fail conditions
- **Edge Case Finder**: Identify potential issues early
- **Estimation Support**: Break down for sizing

## User Story Template

```markdown
## [Feature Name]

**As a** [user type]
**I want to** [action]
**So that** [benefit]

### Acceptance Criteria
- [ ] Given [context], when [action], then [result]
- [ ] Edge case: [scenario]

### Technical Notes
- Dependencies: [list]
- Risks: [list]
```

## Usage

```
@analyst Create user stories for "streak freeze" feature
@analyst What are the edge cases for loot drops?
@analyst Define acceptance criteria for boss battles
```

## Integration

- **`analyst.md`**: Primary workflow
- **`spec.md`**: Specification generation
- **`feature.md`**: Feature development
