---
description: "Workflow for INDEX"
command: "/INDEX"
category: "meta"
trigger: "manual"
version: "1.1.0"
telemetry: "enabled"
primary_agent: "@manager"
domain: "meta"
---

# Workflow Index

Quick reference for choosing the right workflow based on your situation.

---

## 🚀 Scenario Router

| Situation                   | Workflow Chain                          | Notes                               |
| --------------------------- | --------------------------------------- | ----------------------------------- |
| **Morning Start**           | `/startup` → `/domain-session`          | Daily briefing + focus area         |
| **Build Broken**            | `/debug` → `/coder` → `/qa`             | Systematic error recovery           |
| **CI/CD Failing**           | `/ci-doctor`                            | Comprehensive CI failure resolution |
| **New Feature**             | `/domain-session` → `/feature` → `/qa`  | Full feature pipeline               |
| **Quick Fix**               | `/coder` → `/qa`                        | Small, isolated changes             |
| **Debt Attack**             | `/debt-attack`                          | Scheduled maintenance               |
| **Ready to PR**             | `/pre-pr`                               | Verify + push + create PR           |
| **Pre-Release**             | `PR Checks (CI)` → `Merge`              | Merge into `main` after CI passes   |
| **Emergency Fix**           | `/debug` → `/coder` → `/pre-pr`         | Hotfix path                         |
| **New Idea**                | `/idea` → `/analyst` → `/architect`     | Intake to design                    |
| **Gatekeeper**              | `/gatekeeper`                           | Run before push (or use `/pre-pr`)  |
| **Night Shift**             | `/night-shift`                          | Overnight maintenance               |
| **Sprint Planning**         | `/sprint-plan` → `/triage` → `/manager` | Backlog grooming & prioritization   |
| **Gaps Found**              | `/triage` → `ROADMAP.md` → `/feature`   | Gap resolution pipeline             |
| **Overnight Work**          | `/sprint-auto`                          | Autonomous execution                |
| **Multi-Chat Coordination** | `/claim-task` → `/domain-session`       | Prevent parallel conflicts          |

---

## 🎭 Agent Personas

### Engineering

| Agent             | Focus                   | When to Use                |
| ----------------- | ----------------------- | -------------------------- |
| `/architect`      | System design, patterns | Major changes, new systems |
| `/coder`          | Implementation          | Writing code               |
| `/qa`             | Testing, verification   | After any change           |
| `/infrastructure` | DevOps, CI/CD           | Deployment, infra          |
| `/security`       | Auth, validation        | Before release, audits     |
| `/debug`          | Error analysis          | When things break          |

### Product & Design

| Agent            | Focus           | When to Use                |
| ---------------- | --------------- | -------------------------- |
| `/analyst`       | Requirements    | New features, user stories |
| `/ui-ux`         | Frontend design | UI work, animations        |
| `/game-designer` | Game mechanics  | Progression, balance       |
| `/writer`        | Narrative       | Story, dialogue            |
| `/strategist`    | Business        | Pricing, growth            |

### Specialist

| Agent          | Focus             | When to Use             |
| -------------- | ----------------- | ----------------------- |
| `/titan-coach` | Bio ↔ Game bridge | Training metrics, buffs |
| `/librarian`   | Documentation     | Research, history       |
| `/platform`    | Cross-device      | Mobile, TV, Desktop     |

### Meta & Maintenance

| Agent     | Focus        | When to Use           |
| --------- | ------------ | --------------------- |
| `/polish` | Code cleanup | Formatting, dead code |
| `/perf`   | Performance  | Bundle, Lighthouse    |

| `/triage` | Gap prioritization | Resolving gaps from monitors |
| `/gatekeeper` | Qualification | Strict pre-push checks |
| `/claim-task` | Task coordination | Multi-chat conflict prevention |
| `/night-shift` | Async Maintenance | Overnight optimizations |
| `/monitor-debt` | Debt Scanning | Finding technical debt |
| `/debt-attack` | Debt Execution | Autonomous cleanup loop |

---

## 🗺️ Domain Quick Reference

| Domain     | Entry Point                | Primary Workflows                           |
| ---------- | -------------------------- | ------------------------------------------- |
| `infra`    | `/domain-session infra`    | `/infrastructure`, `/pre-deploy`, `/triage` |
| `game`     | `/domain-session game`     | `/game-designer`, `/architect`, `/triage`   |
| `sprint`   | `/domain-session sprint`   | `/manager`, `/sprint-plan`, `/triage`       |
| `qa`       | `/domain-session qa`       | `/qa`, `/unit-tests`, `/triage`             |
| `bio`      | `/domain-session bio`      | `/titan-coach`, `/triage`                   |
| `business` | `/domain-session business` | `/analyst`, `/strategist`, `/triage`        |
| `api`      | `/domain-session api`      | `/architect`, `/security`, `/triage`        |
| `meta`     | `/domain-session meta`     | `/evolve`, `/librarian`, `/triage`          |

---

## 🔄 Common Chains

```
Feature Development (Full):
/idea → /analyst → /architect → /coder → /qa → /polish → /pre-pr

Bug Fix (Standard):
/debug → /coder → /qa → /pre-pr

Performance Issue:
/perf → /architect → /coder → /perf → /pre-pr

Security Audit:
/security → /coder → /qa → /security → /pre-pr

Gap Resolution:
/monitor-x → /triage → ROADMAP.md → /feature or /cleanup → /pre-pr
```

---

## 🔍 Monitoring & Audits

| Focus                 | Workflow            | Description                           |
| --------------------- | ------------------- | ------------------------------------- |
| **Strategy & Market** | `/monitor-strategy` | Alignment with personas & market gaps |
| **Game Balance**      | `/monitor-game`     | Loot rates, XP, combat constants      |
| **Logic & Debt**      | `/monitor-logic`    | Type safety, TODOs, debt scan         |
| **CI/CD Health**      | `/monitor-ci`       | Workflow runs, build status           |

| **Gap Triage** | `/triage` | Prioritize all found gaps into ROADMAP.md |
| **Debt Scanner** | `/monitor-debt` | Scan codebase for debt markers |
| **Quality Gate** | `/gatekeeper` | Pre-push integrity checks |
| **CI Doctor** | `/ci-doctor` | Comprehensive CI failure prevention/resolution |

---

## 🔀 Multi-Chat Coordination

> [!IMPORTANT]
> When running multiple parallel chat sessions, follow this pattern to prevent race conditions and duplicate work.

### Chat Roles

| Role        | Count           | Responsibility                    | Workflows                                    |
| ----------- | --------------- | --------------------------------- | -------------------------------------------- |
| **Manager** | 1 (long-lived)  | Planning, sprint mgmt, roadmap    | `/startup`, `/sprint-plan`, `/triage`        |
| **Worker**  | N (short-lived) | Execute ONE task, close when done | `/claim-task`, `/domain-session`, `/feature` |

### Golden Rules

1. **One task per chat** — Never claim multiple tasks in a single chat session
2. **Branch = Claim** — Creating a feature branch claims the task; other chats see this
3. **Short-lived workers** — Complete and close worker chats within 1-2 sessions
4. **Manager owns state** — Only manager chat updates `roadmap.md`, `DEBT.md`, `sprint/`

### Workflow Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│  MANAGER CHAT (long-lived)                                       │
│  /startup → /sprint-plan → monitors claims via /claim-task status│
└──────────────────────────────┬──────────────────────────────────┘
                               │ delegates tasks
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ WORKER CHAT A │    │ WORKER CHAT B │    │ WORKER CHAT C │
│ /claim-task   │    │ /claim-task   │    │ /claim-task   │
│ R-03          │    │ D-12          │    │ S-01          │
│ feat/R-03-... │    │ chore/D-12-...│    │ fix/S-01-...  │
│ /gatekeeper   │    │ /gatekeeper   │    │ /gatekeeper   │
│ → PR → close  │    │ → PR → close  │    │ → PR → close  │
└───────────────┘    └───────────────┘    └───────────────┘
```

### Conflict Prevention

Before starting work in any chat:

```bash
## See what others are working on
git branch -r --list 'origin/feat/*' 'origin/fix/*'

## See open PRs and their files
gh pr list --state open
```

### Quick Commands

| Need                | Command                 |
| ------------------- | ----------------------- |
| See claimable tasks | `/claim-task list`      |
| Claim a task        | `/claim-task [task-id]` |
| See active claims   | `/claim-task status`    |
| Finish and verify   | `/gatekeeper`           |

---

## 📋 Decision Tree

```
Start
  │
  ├─ Something broken? ────────→ /debug
  │
  ├─ CI failing repeatedly? ──→ /ci-doctor
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

## Version History

### 1.1.0 (2026-01-14)

- Added `/pre-pr` to scenario router and common chains
- Updated emergency fix path

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
