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

Read and analyze from **both** `roadmap.md` AND GitHub Project:

> [!TIP]
> **Automated Mode**: Sprint planning runs automatically every Monday at 09:00 UTC via GitHub Actions (`.github/workflows/sprint-planning.yml`). The workflow creates a PR with the generated plan for review.
>
> **Manual Mode**: Use the commands below for ad-hoc planning or to customize the automated plan.

**Local Sources:**

- `roadmap.md` → Backlog items with ROI metadata
- `DEBT.md` → Tech debt to address
- `.agent/feedback/ux-audit.md` → UX priorities
- `.agent/feedback/health-report.md` → Testing gaps

**GitHub Project (Project #4):**

```bash
# Get Project ID and Owner from config
PROJECT_ID=$(jq -r '.projectNumber' .agent/config/github-project.json)
OWNER=$(jq -r '.owner' .agent/config/github-project.json)

# Get prioritized backlog
gh project item-list $PROJECT_ID --owner $OWNER --format json | \
  jq '.items[] | select(.status == "Backlog") | {title, priority, roi, effort}'
```

**Automated Generation:**

```bash
# Generate sprint plan from Project backlog
.agent/scripts/generate-sprint-plan.ps1 -SprintName "Oracle 3.0" -MaxItems 8 -MaxHours 20
```

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

## 4. Automation Workflow

> [!NOTE]
> **GitHub Actions Integration**: Sprint planning and activation are fully automated.

### Automated Planning (Weekly)

**Trigger**: Every Monday at 09:00 UTC  
**Workflow**: `.github/workflows/sprint-planning.yml`

**Process**:

1. Queries GitHub Project #4 for Backlog items
2. Runs `generate-sprint-plan.ps1` to create `next.md`
3. Creates PR with generated plan
4. Awaits agent/user review

**Manual Trigger**:

```bash
# Via GitHub UI: Actions → Sprint Planning Automation → Run workflow
# Or via CLI:
gh workflow run sprint-planning.yml -f sprint_name="Oracle 3.0" -f max_items=8
```

### Automated Activation (On PR Merge)

**Trigger**: When sprint plan PR is merged  
**Workflow**: `.github/workflows/sprint-activation.yml`

**Process**:

1. Archives `current.md` → `history/{date}.md`
2. Renames `next.md` → `current.md`
3. Runs `create-sprint-issues.ps1` to create GitHub Issues
4. Links issues to Project #4 with status "In Progress"
5. Commits changes and comments on PR

### Continuous Sync (Hourly)

**Trigger**: Every hour during business hours (Mon-Fri, 09:00-17:00 CET)  
**Workflow**: `.github/workflows/sprint-sync.yml`

**Process**:

1. Queries Project #4 for sprint issue statuses
2. Runs `sync-project-to-sprint.ps1` to update `current.md`
3. Commits changes if tasks marked as done in Project

## 5. Activation

> [!IMPORTANT]
> **Automated**: Sprint activation happens automatically when the sprint plan PR is merged. See section 4 for details.

**Manual Activation** (if needed):

When sprint is approved:

1. Rename `next.md` → `current.md`
2. Archive previous `current.md` → `history/{date}.md`
3. Run `/sprint-auto` for execution OR merge sprint plan PR to trigger automation

## Self-Evaluation

- **Scope Realism (1-10)**: Is the sprint feasible?
- **Balance (1-10)**: Good mix of features/debt/polish?

## Version History

### 2.0.0 (2026-01-14)

- Added PR batching guidance (3-4 PRs per sprint)
- Improved scoping with PR frequency recommendations

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
