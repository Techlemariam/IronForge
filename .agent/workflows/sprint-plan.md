---
description: "Workflow for sprint-plan"
command: "/sprint-plan"
category: "planning"
trigger: "manual"
version: "2.0.0"
telemetry: "enabled"
primary_agent: "@manager"
domain: "meta"
---

# Workflow: /sprint-plan

Trigger: Manual | End of Sprint

> **Naming Convention:** Task Name must be `[SPRINT] Planning: <Period>`.

## Identity

You are IronForge's **Sprint Planner**. You synthesize input from the roadmap, tech debt, and audits into an actionable sprint.

## Protocol

## 1. Source Collection

Read and analyze:

- `.agent/features/roadmap.md` → Backlog items
- `DEBT.md` → Tech debt to address
- `.agent/feedback/ux-audit.md` → UX priorities
- `.agent/feedback/health-report.md` → Testing gaps
- **Run `/triage`** to synthesize and score all gaps from the above sources.

## 2. Prioritization Matrix

| Priority   | Criteria                                                        |
| :--------- | :-------------------------------------------------------------- |
| **High**   | Blocks other features, user-facing bug, >3 occurrences in audit |
| **Medium** | Improves UX, reduces debt, increases coverage                   |
| **Low**    | Nice-to-have, polish, documentation                             |

## 3. Sprint Scoping

- **Max items**: 8 (avoid overcommitment)
- **Mix**: ~60% features, ~30% debt, ~10% polish
- **Estimate**: Calculate total time, max 20h/sprint
- **PR Batches**: Group items into 2-3 task batches for frequent PRs

> [!TIP]
> **Target 3-4 PRs per sprint.** Group related tasks together (e.g., "Oracle 3.0" items in one PR, "Infrastructure" items in another).

## 4. Output Format

Create `.agent/sprints/next.md`:

```markdown
## Next Sprint: [Sprint Name]

**Period**: [Start] - [End]
**Goal**: [One-liner]

## Backlog

### Priority: High

- [ ] [Task] <!-- agent: X | estimate: Yh | source: Z -->

### Priority: Medium

- [ ] [Task] <!-- agent: X | estimate: Yh | source: Z -->

### Priority: Low

- [ ] [Task] <!-- agent: X | estimate: Yh | source: Z -->

---

## Sprint Stats

- **Total Items**: N
- **Estimated Hours**: Xh
- **Debt Ratio**: Y%

## Dependencies

- [List any blockers or external dependencies]
```

## 5. Activation

When sprint is approved:

1. Rename `next.md` → `current.md`
2. Archive previous `current.md` → `history/{date}.md`
3. Run `/sprint-auto` for execution

## Self-Evaluation

- **Scope Realism (1-10)**: Is the sprint feasible?
- **Balance (1-10)**: Good mix of features/debt/polish?

## Version History

### 2.0.0 (2026-01-14)

- Added PR batching guidance (3-4 PRs per sprint)
- Improved scoping with PR frequency recommendations

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
