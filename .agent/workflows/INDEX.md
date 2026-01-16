---
description: "Workflow for INDEX"
command: "/INDEX"
category: "meta"
trigger: "manual"
version: "1.2.0"
telemetry: "enabled"
primary_agent: "@manager"
domain: "meta"
---

# 📚 Workflow Index

The central hub for all project workflows and agent capabilities.

---

## ⚡ Quick Start (Copy-Paste Ready)

| Need | Command |
| :--- | :--- |
| **Morning Routine** | `/startup` |
| **Pick a Task** | `/claim-task` |
| **Create PR** | `/pre-pr` |
| **Switch Branch** | `/switch-branch` |
| **Night Shift** | `/night-shift` |

---

## 🚦 Decision Tree

Not sure where to start? Follow the path:

```mermaid
graph TD
    A[Start] --> B{What's the goal?}
    B -->|Fix Broken Thing| C[/debug]
    B -->|Build Feature| D[/domain-session]
    B -->|Maintenance| E{Type?}
    B -->|Process/Meta| F{Type?}
    
    D --> G[/feature]
    G --> H[/qa]
    
    E -->|Code Purity| I[/polish]
    E -->|Tech Debt| J[/debt-attack]
    E -->|Performance| K[/perf]
    
    F -->|Architecture| L[/architect]
    F -->|Requirements| M[/analyst]
    F -->|Sprint Plan| N[/sprint-plan]
```

---

## 🛠️ Maintenance Toolbelt

Tools for keeping the codebase healthy and clean.

| Script          | Purpose              | When to use                                            |
| :-------------- | :------------------- | :----------------------------------------------------- |
| `/git-hygiene`  | **Git Doctor**       | Diagnose merge-loops, stale branches, phantom commits. |
| `/polish`       | **Code Cleanup**     | After writing code, before PR. Fixes lint/formatting.  |
| `/perf`         | **Performance**      | When optimizing bundle size or vitals.                 |
| `/monitor-debt` | **Debt Scanner**     | To identify areas needing refactoring in `DEBT.md`.    |
| `/debt-attack`  | **Debt Destroyer**   | Autonomous loop to fix one targeted debt item.         |
| `/cleanup`      | **Housekeeping**     | General project hygiene (logs, tmp files).             |
| `/night-shift`  | **Nightly Job**      | **(Auto)** Runs /triage, /perf, /evolve while asleep.  |
| `/evolve`       | **System Evolve**    | Optimizes tokens and archives unused workflows.        |
| `/switch-branch`| **Context Switch**   | Safely switch branches without losing context.         |

---

## 👥 Agent Personas

### 🏗️ Engineering & Product

| Agent | Focus | Key Workflows |
| :--- | :--- | :--- |
| **`/coder`** | Implementation | `/feature`, `/refactor` |
| **`/architect`** | System Design | `/domain-session`, `/schema`, `/spec` |
| **`/qa`** | Verification | `/test`, `/e2e`, `/gatekeeper` |
| **`/ui-ux`** | Frontend/Design | `/design-system`, `/polish` |
| **`/analyst`** | Requirements | `/user-story`, `/roadmap` |
| **`/security`** | Auth & Safety | `/audit`, `/permissions` |

### 🧠 Specialists

| Agent | Focus | Key Workflows |
| :--- | :--- | :--- |
| **`/titan-coach`** | Bio-Data | `/training-metrics` |
| **`/game-designer`** | Mechanics | `/balance`, `/economy` |
| **`/librarian`** | Knowledge | `/docs`, `/search` |
| **`/infrastructure`**| DevOps | `/deploy`, `/ci-doctor` |

---

## 🔄 Common Chains

**The Feature Path:**
`/idea` → `/analyst` → `/architect` → `/domain-session` → `/coder` → `/qa` → `/pre-pr`

**The Fix Path:**
`/debug` → `/coder` → `/unit-tests` → `/pre-pr`

**The "Clean Up" Path:**
`/monitor-debt` → `/debt-attack` → `/polish` → `/gatekeeper`

---

## 🗺️ Domain Quick Reference

| Domain | Command | Use This For... |
| :--- | :--- | :--- |
| `meta` | `/domain-session meta` | Workflow edits, documentation, housekeeping |
| `game` | `/domain-session game` | Combat logic, XP, looting, game loops |
| `ui` | `/domain-session ui` | React components, Tailwind, styling |
| `api` | `/domain-session api` | Next.js API routes, server actions, DB |
| `infra` | `/domain-session infra` | Docker, Vercel, CI/CD, Prisma |

---

## 🛡️ Shared Guards

Reusable validation modules for workflow protection. Located in `.agent/workflows/_guards/`.

| Guard             | Purpose                                            |
| :---------------- | :------------------------------------------------- |
| `branch-guard.md` | Ensures workflow runs on a feature branch, not `main` |

**Usage:** Workflows include guards at Phase 0 for automatic validation.

---

## Version History

### 1.2.0 (2026-01-15)

- Added **Quick Start** section for speed.
- Added `/switch-branch`, `/evolve`, and `/night-shift` details.
- Introduced Visual Decision Tree.
- Consolidated Maintenance Tools.

### 1.1.0 (2026-01-14)

- Added `/pre-pr` integration.

### 1.0.0 (2026-01-08)

- Initial stable release.
