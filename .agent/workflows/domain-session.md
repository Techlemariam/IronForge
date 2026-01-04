---
description: Initialize a focused domain session for a specific app area
command: /domain-session
category: meta
trigger: manual
---

# Domain Session Workflow

Start a focused development session for a specific domain of IronForge.

## Usage

```
/domain-session [domain]
```

**Domains:** `infra` | `game` | `sprint` | `qa` | `bio` | `business` | `api` | `meta`

---

## Step 1: Parse Domain & Load Context

Based on the domain argument, load relevant context:

| Domain | Emoji | Primary Files | Workflows |
|--------|-------|--------------|-----------|
| `infra` | 🔧 | `.github/workflows/*`, `docker-compose.yml`, `next.config.ts`, `prisma/` | `/infrastructure`, `/pre-deploy`, `/deploy`, `/monitor-db`, `/triage` |
| `game` | 🎮 | `src/services/progression*`, `src/actions/titan.ts`, `src/lib/game/*` | `/game-designer`, `/architect`, `/coder`, `/writer`, `/monitor-game`, `/triage` |
| `sprint` | 📋 | `.agent/sprints/current.md`, `roadmap.md`, `DEBT.md` | `/manager`, `/startup`, `/sprint-auto`, `/idea`, `/feature`, `/triage` |
| `qa` | 🧪 | `tests/*`, `e2e/*`, `playwright.config.ts` | `/qa`, `/unit-tests`, `/stresstests`, `/monitor-tests`, `/monitor-logic`, `/triage` |
| `bio` | 🧬 | `src/services/intervals*`, `src/services/hevy*`, `src/lib/bio-buffs*` | `/titan-coach`, `/monitor-bio`, `/triage` |
| `business` | 💰 | `src/app/api/stripe/*`, `src/services/subscription*`, pricing configs | `/analyst`, `/architect`, `/security`, `/idea`, `/strategist`, `/triage` |
| `api` | 🔌 | `src/app/api/*`, `src/services/*`, external integrations | `/architect`, `/coder`, `/security`, `/platform`, `/triage` |
| `meta` | 🧠 | `.agent/workflows/*`, `GEMINI.md`, `.antigravityrules` | `/evolve`, `/librarian`, `/health-check`, `/triage` |

// turbo
Run: `rg -l "" src/ --max-depth 2` to get a file overview if needed.

---

## Step 2: Load Domain-Specific Knowledge

1. Read `ARCHITECTURE.md` sections relevant to the domain
2. Check `knowledge/` for domain-specific nodes
3. Review `roadmap.md` for active items in this domain
4. Check `DEBT.md` for related technical debt

---

## Step 3: Domain Status Brief

Present a brief summary:

```markdown
## [EMOJI] Domain Session: [DOMAIN_NAME]

### Active Roadmap Items
- [ ] Item 1
- [ ] Item 2

### Related Debt
- [ ] Debt item if any

### Unresolved Gaps (Domain Health)
- [ ] List any high-priority gaps found in recent monitor runs for this domain.
- **Tip:** Run `/triage [domain]` to check health for this domain specifically.

### Recent Changes
- Last 3 commits touching this domain

### Recommended Focus
Based on priority and dependencies, suggest what to work on.
```

---

## Step 4: Session Mode Selection

Ask the user:

> **What do you want to focus on in this session?**
> 1. 🆕 **New Feature** - Plan and implement something new
> 2. 🐛 **Bugfix/Debt** - Fix existing issues
> 3. 🎯 **Triage & Roadmap** - Audit gaps and update domain roadmap
> 4. 🔍 **Research** - Explore and understand the domain better
> 5. 📋 **Review** - Review and improve existing code

Based on selection, trigger appropriate sub-workflow.
**CRITICAL:** When starting the new workflow/task, the Task Name MUST be: `[DOMAIN] <Description>`

- Ny feature → `/feature [feature-name]`
- Bugfix → `/cleanup` → `/qa`
- Triage → `/triage` (filtered for this domain)
- Research → `/librarian`
- Review → `/qa` → `/polish`

---

## Step 5: Session Wrap-Up

Before ending the session:

1. Update `knowledge/` with any new insights
2. Update `DEBT.md` if new debt was discovered
3. Update `roadmap.md` if priorities changed
4. Commit changes with domain-prefixed message: `[domain] description`

---


