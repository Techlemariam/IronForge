---
description: Scenario-based workflow routing guide
---
# Workflow Index

Quick reference for choosing the right workflow based on your situation.

---

## 🚀 Scenario Router

| Situation | Workflow Chain | Notes |
|-----------|----------------|-------|
| **Morning Start** | `/startup` → `/domain-session` | Daily briefing + focus area |
| **Build Broken** | `/debug` → `/coder` → `/qa` | Systematic error recovery |
| **New Feature** | `/domain-session` → `/feature` → `/qa` | Full feature pipeline |
| **Quick Fix** | `/coder` → `/qa` | Small, isolated changes |
| **Debt Attack** | `/cleanup` → `/qa` → `/polish` | Scheduled maintenance |
| **Pre-Release** | `PR Checks (CI)` → `Merge` | Merge into `main` after CI passes |
| **Emergency Fix** | `/debug` → `/coder` → `/pre-deploy` | Hotfix path |
| **New Idea** | `/idea` → `/analyst` → `/architect` | Intake to design |
| **Sprint Planning** | `/sprint-plan` → `/triage` → `/manager` | Backlog grooming & prioritization |
| **Gaps Found** | `/triage` → `ROADMAP.md` → `/feature` | Gap resolution pipeline |
| **Overnight Work** | `/sprint-auto` | Autonomous execution |

---

## 🎭 Agent Personas

### Engineering
| Agent | Focus | When to Use |
|-------|-------|-------------|
| `/architect` | System design, patterns | Major changes, new systems |
| `/coder` | Implementation | Writing code |
| `/qa` | Testing, verification | After any change |
| `/infrastructure` | DevOps, CI/CD | Deployment, infra |
| `/security` | Auth, validation | Before release, audits |
| `/debug` | Error analysis | When things break |

### Product & Design
| Agent | Focus | When to Use |
|-------|-------|-------------|
| `/analyst` | Requirements | New features, user stories |
| `/ui-ux` | Frontend design | UI work, animations |
| `/game-designer` | Game mechanics | Progression, balance |
| `/writer` | Narrative | Story, dialogue |
| `/strategist` | Business | Pricing, growth |

### Specialist
| Agent | Focus | When to Use |
|-------|-------|-------------|
| `/titan-coach` | Bio ↔ Game bridge | Training metrics, buffs |
| `/librarian` | Documentation | Research, history |
| `/platform` | Cross-device | Mobile, TV, Desktop |

### Meta & Maintenance
| Agent | Focus | When to Use |
|-------|-------|-------------|
| `/polish` | Code cleanup | Formatting, dead code |
| `/perf` | Performance | Bundle, Lighthouse |
| `/cleanup` | Debt resolution | DEBT.md items |
| `/evolve` | Workflow improvement | Meta-optimization |
| `/triage` | Gap prioritization | Resolving gaps from monitors |

---

## 🗺️ Domain Quick Reference

| Domain | Entry Point | Primary Workflows |
|--------|-------------|-------------------|
| `infra` | `/domain-session infra` | `/infrastructure`, `/pre-deploy`, `/triage` |
| `game` | `/domain-session game` | `/game-designer`, `/architect`, `/triage` |
| `sprint` | `/domain-session sprint` | `/manager`, `/sprint-plan`, `/triage` |
| `qa` | `/domain-session qa` | `/qa`, `/unit-tests`, `/triage` |
| `bio` | `/domain-session bio` | `/titan-coach`, `/triage` |
| `business` | `/domain-session business` | `/analyst`, `/strategist`, `/triage` |
| `api` | `/domain-session api` | `/architect`, `/security`, `/triage` |
| `meta` | `/domain-session meta` | `/evolve`, `/librarian`, `/triage` |

---

## 🔄 Common Chains

```
Feature Development (Full):
/idea → /analyst → /architect → /coder → /qa → /polish → /pre-deploy

Bug Fix (Standard):
/debug → /coder → /qa

Performance Issue:
/perf → /architect → /coder → /perf

Security Audit:
/security → /coder → /qa → /security

Gap Resolution:
/monitor-x → /triage → ROADMAP.md → /feature or /cleanup
```

---

## 🔍 Monitoring & Audits

| Focus | Workflow | Description |
|-------|----------|-------------|
| **Strategy & Market** | `/monitor-strategy` | Alignment with personas & market gaps |
| **Game Balance** | `/monitor-game` | Loot rates, XP, combat constants |
| **Logic & Debt** | `/monitor-logic` | Type safety, TODOs, debt scan |
| **CI/CD Health** | `/monitor-ci` | Workflow runs, build status |
| **Infrastructure** | `/monitor-db`, `/monitor-deploy` | Database & Deployment health |
| **Performance** | `/perf` | Lighthouse & bundle analysis |
| **Gap Triage** | `/triage` | Prioritize all found gaps into ROADMAP.md |

---

## 📋 Decision Tree

```
Start
  │
  ├─ Something broken? ────────→ /debug
  │
  ├─ Need to ship? ────────────→ /pre-deploy
  │
  ├─ Know what to build? ──────→ /domain-session → /feature
  │
  ├─ Have an idea? ────────────→ /idea
  │
  ├─ Audit/Gap found? ─────────→ /triage
  │
  ├─ Routine maintenance? ─────→ /cleanup or /polish
  │
  └─ Just starting day? ───────→ /startup
```
