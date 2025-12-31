---
description: Initialize a focused domain session for a specific app area
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
| `infra` | 🔧 | `.github/workflows/*`, `docker-compose.yml`, `next.config.ts`, `prisma/` | `/infrastructure`, `/pre-deploy`, `/schema` |
| `game` | 🎮 | `src/services/progression*`, `src/actions/titan.ts`, `src/lib/game/*` | `/game-designer`, `/architect`, `/coder`, `/writer` |
| `sprint` | 📋 | `.agent/sprints/current.md`, `roadmap.md`, `DEBT.md` | `/manager`, `/startup`, `/sprint-auto`, `/idea`, `/feature` |
| `qa` | 🧪 | `tests/*`, `e2e/*`, `playwright.config.ts` | `/qa`, `/unit-tests`, `/stresstests` |
| `bio` | 🧬 | `src/services/intervals*`, `src/services/hevy*`, `src/lib/bio-buffs*` | `/titan-coach`, `/performance-coach` |
| `business` | 💰 | `src/app/api/stripe/*`, `src/services/subscription*`, pricing configs | `/analyst`, `/architect`, `/security`, `/idea`, `/strategist` |
| `api` | 🔌 | `src/app/api/*`, `src/services/*`, external integrations | `/architect`, `/coder`, `/security`, `/platform` |
| `meta` | 🧠 | `.agent/workflows/*`, `GEMINI.md`, `.antigravityrules` | `/evolve`, `/librarian`, `/health-check` |

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

### Recent Changes
- Last 3 commits touching this domain

### Recommended Focus
Based on priority and dependencies, suggest what to work on.
```

---

## Step 4: Session Mode Selection

Ask the user:

> **Vad vill du fokusera på i denna session?**
> 1. 🆕 **Ny feature** - Planera och implementera något nytt
> 2. 🐛 **Bugfix/Debt** - Fixa existerande problem
> 3. 🔍 **Research** - Utforska och förstå domänen bättre
> 4. 📋 **Review** - Granska och förbättra existerande kod

Based on selection, trigger appropriate sub-workflow:
- Ny feature → `/feature [feature-name]`
- Bugfix → `/cleanup` → `/qa`
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


