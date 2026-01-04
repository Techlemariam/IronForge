---
description: Prioritize and triage gaps found by monitor workflows
---

# 🎯 Triage Workflow
**Purpose:** Systematically prioritize gaps, issues, and technical debt discovered by `/monitor-x` workflows.

## Overview
This workflow helps you:
1. Collect findings from multiple monitor workflows
2. Assess severity and impact of each gap
3. Prioritize items for immediate action vs. backlog
4. Route high-priority items to appropriate workflows

---

## Step 1: Trigger All Monitors
// turbo
Run all monitor workflows to gather the current state of the system into a single triage context:
/triage [optional-domain]
```

## Step 1: Trigger Monitors
// turbo
Run relevant monitor workflows based on the provided domain (or all if no domain is specified).

### Domain Mapping
| Domain | Monitors to Run |
|--------|-----------------|
| `infra` | `/monitor-db`, `/monitor-deploy`, `/monitor-ci` |
| `game` | `/monitor-game`, `/monitor-logic`, `/monitor-tests` |
| `sprint`| `/monitor-strategy` |
| `qa` | `/monitor-tests`, `/monitor-logic` |
| `bio` | `/monitor-bio` |
| `business`| `/monitor-strategy`, `/monitor-growth` |
| `api` | `/monitor-logic`, `/security` |
| `meta` | `/health-check`, `/monitor-tests`, `/monitor-growth` |

**Instruction:** 
- If a `[domain]` is provided, run **ONLY** the monitors listed above for that domain.
- If NO domain is provided (or domain is unknown), run **ALL** monitors below:

```bash
/monitor-logic    # Logic gaps, debt, type safety
/monitor-game     # Game balance, data integrity
/monitor-bio      # Bio-integration health
/monitor-tests    # Test coverage and failures
/monitor-ci       # CI/CD pipeline health
/monitor-db       # Database and migrations
/monitor-deploy   # Vercel deployment status
/monitor-deploy   # Vercel deployment status
/monitor-strategy # Market alignment and personas
/monitor-growth   # Passive income triggers and acquisition
```

**Instruction:** The agent MUST run all the above commands and aggregate the findings before proceeding to the next step.

---

## Step 2: Categorize Each Finding

For each gap/issue found, determine its **Category**:

| Category | Description | Examples |
|----------|-------------|----------|
| **🔴 Critical** | Blocks production, security risk, data loss | Auth bypass, DB corruption, build failure |
| **🟠 High** | Degrades UX, breaks feature, performance issue | Broken leaderboard, slow queries, failed tests |
| **🟡 Medium** | Technical debt, missing tests, minor bugs | Magic numbers, missing types, incomplete docs |
| **🟢 Low** | Nice-to-have, optimization, polish | Code formatting, minor refactors, TODOs |

---

## Step 3: Assess Impact Dimensions

For each finding, score these dimensions (1-5 scale):

### 🎯 User Impact
- **5:** Breaks core user journey (login, workout sync, progression)
- **4:** Degrades major feature (PvP, leaderboards, Oracle)
- **3:** Affects secondary feature (tooltips, animations)
- **2:** Minor UX issue (styling, copy)
- **1:** No user-facing impact

### 🏗️ Technical Impact
- **5:** Blocks other work, cascading failures
- **4:** High coupling, affects multiple domains
- **3:** Isolated to one domain/feature
- **2:** Localized to single file/function
- **1:** Cosmetic code issue

### ⚡ Urgency
- **5:** Must fix before next deploy (blocker)
- **4:** Should fix this sprint
- **3:** Plan for next sprint
- **2:** Backlog for future sprint
- **1:** Someday/maybe

### 🔧 Effort
- **5:** Multi-day, requires design/research
- **4:** Full day, complex refactor
- **3:** Few hours, moderate complexity
- **2:** 1 hour, straightforward fix
- **1:** Minutes, trivial change

---

## Step 4: Calculate Priority Score

**Formula:**
```
Priority Score = (User Impact × 3) + (Technical Impact × 2) + (Urgency × 2) - (Effort × 0.5)
```

**Rationale:**
- User Impact weighted highest (×3)
- Technical Impact and Urgency are important (×2)
- Effort is a penalty (×0.5) — quick wins score higher

**Priority Tiers:**
- **P0 (≥25):** Drop everything, fix now
- **P1 (20-24):** This sprint, high priority
- **P2 (15-19):** Next sprint or current backlog
- **P3 (10-14):** Future sprint
- **P4 (<10):** Backlog, low priority

---

## Step 5: Route to Action

Based on priority and category, route items to appropriate workflows:

### 🔴 P0/P1 Critical Items
```bash
/debug          # For build/runtime errors
/security       # For auth/validation issues
/qa             # For test failures blocking deploy
/infrastructure # For CI/CD or deployment issues
```

### 🟠 P1/P2 Feature/Logic Gaps
```bash
/feature        # For new functionality needed
/coder          # For implementation fixes
/architect      # For design/pattern issues
/game-designer  # For balance/mechanics issues
```

### 🟡 P2/P3 Technical Debt
```bash
/cleanup        # For automated debt resolution
/polish         # For code formatting/style
/perf           # For performance optimization
```

### 🟢 P3/P4 Backlog Items
```bash
/idea           # Add to roadmap for future consideration
/librarian      # Document for knowledge base
```

---

## Step 6: Document in ROADMAP.md

All triaged items MUST be added to `ROADMAP.md` in the appropriate section based on their **category** and **priority**.

### 🎯 Mapping: Category → ROADMAP.md Section

| Finding Category | ROADMAP.md Section | Line Reference |
|------------------|-------------------|----------------|
| **Game Balance** | `🎮 Game Balance Gaps` | ~Line 49 |
| **Logic/Type Safety** | `🔧 Logic & Type Safety Gaps` | ~Line 60 |
| **Bio Integration** | `🧬 Bio Integration Gaps` | ~Line 71 |
| **Market/UX** | `🚨 Market & UX Gaps` → Product/Marketing | ~Line 17 |
| **Infrastructure** | `🔧 Infrastructure Backlog` | ~Line 164 |
| **Feature Request** | `📋 Backlog` or `🆕 Season 2 Backlog` | ~Line 84 or 131 |

### 📝 Documentation Format

Use the existing ROADMAP.md format with HTML comments for metadata:

```markdown
- [ ] **[Item Name]** ([Spec](specs/item-name.md)) <!-- status: planned | priority: [high/medium/low] | roi: [score] | effort: [S/M/L/XL] | source: monitor-[x] | date: YYYY-MM-DD -->
```

**Example:**
```markdown
- [ ] **Missing Zod validation on training endpoints** <!-- status: planned | priority: high | roi: 4.5 | effort: S | source: monitor-logic | date: 2026-01-04 -->
```

### 🎯 Priority → ROADMAP.md Placement

| Priority Tier | ROADMAP.md Placement | Action |
|---------------|---------------------|--------|
| **P0** | Add to `🚀 Active Development` | Immediate work, move to top |
| **P1** | Add to relevant `Critical Priority` or `High Priority` section | This sprint |
| **P2** | Add to `Medium Priority` section | Next sprint |
| **P3/P4** | Add to `Low Priority` or appropriate backlog | Future consideration |

### ✅ Step-by-Step Documentation

1. **Identify the correct section** in `ROADMAP.md` based on category (see table above)
2. **Add the item** using the format above with all metadata
3. **Set status** to `planned` (or `in-progress` if immediately starting work)
4. **Include source** as `monitor-[workflow-name]` (e.g., `monitor-logic`, `monitor-game`)
5. **Add date** as current date in `YYYY-MM-DD` format
6. **Link spec** if creating a detailed spec document (optional for small items)

### 📊 Additional Tracking

For **P0/P1 items** that are technical debt:
- Also add to `DEBT.md` with priority tag and link to ROADMAP.md entry
- Example: `- [ ] [P1] Missing Zod validation (see ROADMAP.md line 67)`

For **P0 blockers**:
- Add to current sprint plan or `current.md` if using sprint automation
- Create GitHub issue if external dependency or requires team coordination

---

## Step 7: Execute Top 3

**Focus Rule:** Never work on more than 3 high-priority items simultaneously.

1. Select top 3 items by Priority Score
2. Route each to appropriate workflow (Step 5)
3. Execute fixes/implementations
4. Verify with relevant `/monitor-x` workflow
5. Mark as complete and move to next item

---

## Example Triage Session

### Finding: Missing Zod validation on `/api/training/log`
- **Category:** 🟠 High (security risk)
- **User Impact:** 4 (could corrupt training data)
- **Technical Impact:** 3 (isolated to one endpoint)
- **Urgency:** 4 (should fix before next deploy)
- **Effort:** 2 (straightforward Zod schema)
- **Priority Score:** (4×3) + (3×2) + (4×2) - (2×0.5) = 12 + 6 + 8 - 1 = **25 (P0)**
- **Action:** Route to `/security` → implement Zod validation → verify with `/monitor-logic`

### Finding: Magic number in XP calculation
- **Category:** 🟡 Medium (technical debt)
- **User Impact:** 1 (no user-facing issue)
- **Technical Impact:** 2 (localized to XP service)
- **Urgency:** 2 (backlog)
- **Effort:** 1 (extract to constant)
- **Priority Score:** (1×3) + (2×2) + (2×2) - (1×0.5) = 3 + 4 + 4 - 0.5 = **10.5 (P3)**
- **Action:** Add to `DEBT.md` → route to `/cleanup` when capacity allows

---

## Tips for Effective Triage

✅ **Do:**
- Run monitors regularly (weekly or before each sprint)
- Be honest about impact scores — don't inflate urgency
- Focus on user-facing issues first
- Batch similar low-priority items for efficiency
- Re-triage after major changes or deploys

❌ **Don't:**
- Try to fix everything at once
- Ignore P0 items in favor of "interesting" P3 work
- Let technical debt accumulate without tracking
- Skip verification after fixes
- Forget to update DEBT.md or roadmap

---

## Integration with Other Workflows

- **Before `/sprint-plan`:** Run triage to inform sprint priorities
- **After `/deploy`:** Run monitors and triage any new issues
- **During `/health-check`:** Use triage to assess system health
- **With `/manager`:** Escalate P0 items for immediate orchestration

---

## Output Artifacts

After triage, you should have:
1. ✅ Prioritized list of gaps with scores
2. ✅ Routed items to appropriate workflows
3. ✅ Updated DEBT.md, ROADMAP.md, or sprint plan
4. ✅ Top 3 items identified for immediate action
5. ✅ Clear next steps for each priority tier
