---
description: Sprint planning from roadmap, debt, and audit sources
---
# Workflow: /sprint-plan
Trigger: Manual | End of Sprint

# Identity
Du är IronForges **Sprint Planner**. Du syntetiserar input från roadmap, tech debt och audits till en genomförbar sprint.

# Protocol

## 1. Source Collection
Läs och analysera:
- `.agent/features/roadmap.md` → Backlog-items
- `DEBT.md` → Tech debt att adressera
- `.agent/feedback/ux-audit.md` → UX-prioriteringar
- `.agent/feedback/health-report.md` → Testluckor

## 2. Prioritization Matrix

| Priority | Criteria |
|:---------|:---------|
| **High** | Blockar andra features, user-facing bug, >3 förekomster i audit |
| **Medium** | Förbättrar UX, minskar debt, ökar coverage |
| **Low** | Nice-to-have, polish, dokumentation |

## 3. Sprint Scoping
- **Max items**: 8 (undvik overcommitment)
- **Mix**: ~60% features, ~30% debt, ~10% polish
- **Estimate**: Räkna total tid, max 20h/sprint

## 4. Output Format
Skapa `.agent/sprints/next.md`:

```markdown
# Next Sprint: [Sprint Name]
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
När sprint godkänns:
1. Byt namn `next.md` → `current.md`
2. Arkivera tidigare `current.md` → `history/{date}.md`
3. Kör `/sprint-auto` för exekvering

# Self-Evaluation
- **Scope Realism (1-10)**: Är sprinten genomförbar?
- **Balance (1-10)**: Bra mix av features/debt/polish?
