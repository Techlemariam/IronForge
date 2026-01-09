# IronForge Workflow Manual

> Your complete guide to the agent workflow ecosystem.

---

## Quick Start

```text
/startup              # Begin any session
/domain-session game  # Start focused work
/gatekeeper           # Verify before pushing
```

---

## Core Concepts

### 1. Slash Commands

Every workflow is invoked via a slash command (e.g., `/coder`, `/qa`). Commands are defined in `.agent/workflows/*.md`.

### 2. Personas vs Actions

| Type | Purpose | Examples |
| :--- | :--- | :--- |
| **Persona** | Adopt a specialized role | `/coder`, `/architect`, `/qa` |
| **Action** | Execute a specific task | `/cleanup`, `/polish`, `/deploy` |
| **Meta** | Manage the system itself | `/startup`, `/evolve`, `/health-check` |

### 3. Domain Sessions

Focus your work on a specific area of the codebase:

```text
/domain-session [domain]
```

Available domains: `auth`, `game`, `bio`, `core`, `ui`, `api`, `database`.

---

## Workflow Categories

### 🧑‍💻 Engineering Personas

| Command | Role | When to Use |
| :--- | :--- | :--- |
| `/architect` | System Designer | Before major features, for design docs |
| `/coder` | Senior Engineer | Implementation work |
| `/qa` | QA Engineer | Testing and verification |
| `/debug` | Error Analyst | Build failures, runtime errors |

### 🎨 Product & Design

| Command | Role | When to Use |
| :--- | :--- | :--- |
| `/analyst` | Business Analyst | Requirements gathering |
| `/ui-ux` | Frontend Specialist | UI polish, accessibility |
| `/game-designer` | Game Mechanics | Balancing, progression |
| `/titan-coach` | Bio-Game Bridge | Exercise ↔ game mechanics |

### 🔧 Infrastructure & Quality

| Command | Role | When to Use |
| :--- | :--- | :--- |
| `/infrastructure` | DevOps | Docker, CI/CD, migrations |
| `/security` | Red Team | Auth audits, vulnerability scans |
| `/schema` | Database Architect | Prisma migrations |
| `/gatekeeper` | Quality Gate | Pre-push verification |

### 📊 Monitoring & Maintenance

| Command | Purpose |
| :--- | :--- |
| `/monitor-ci` | Check GitHub Actions status |
| `/monitor-db` | Database health and migrations |
| `/monitor-debt` | Scan for TODO/FIXME markers |
| `/health-check` | Full system audit |
| `/triage` | Prioritize discovered gaps |

---

## Standard Workflows

### Starting a Session

```text
/startup
```

- Restores context from last session
- Shows daily briefing dashboard
- Suggests next actions

### Feature Development

```text
/feature [name]
```

Pipeline: Discovery → Architecture → Implementation → Polish → Delivery

### Bug Fixing

```text
/debug → /coder → /qa → /gatekeeper
```

### Technical Debt

```text
/cleanup          # Identify debt
/debt-attack [n]  # Fix n items autonomously
/polish           # Format and clean
```

---

## Branch Management

### Claiming Tasks

```text
/claim-task [description]  # Create branch & claim
/claim-task list           # See available tasks
/claim-task status         # View active claims
```

### Switching Branches

```text
/switch-branch [branch-name]
```

- Stashes uncommitted work
- Validates clean state
- Restores context for new branch

---

## Quality Gates

### Pre-Push Verification

```text
/gatekeeper
```

Runs: `lint` → `types` → `test` → `build` → `security`

Produces a verdict:

```text
┌─────────────────────────────────────────────┐
│ 🛡️ GATEKEEPER VERDICT: PASS               │
└─────────────────────────────────────────────┘
```

### Pre-Deploy Checks

```text
/pre-deploy
```

Verifies PR is ready for production deployment.

---

## Automation

### Scheduled Workflows

| Workflow | Trigger | Purpose |
| :--- | :--- | :--- |
| `/night-shift` | Nightly | Maintenance tasks |
| `/health-check` | Weekly | System audit |
| `/evolve` | Weekly | Self-optimization |

### Sprint Management

```text
/sprint-plan    # Plan from roadmap
/sprint-auto    # Autonomous execution
```

---

## Configuration

### Allow List

Trusted commands are auto-approved in `.agent/config.json`:

```json
{
  "terminalAllowList": ["npm run lint", "npm run test", ...]
}
```

### Telemetry

Workflow execution logs are written to `.agent/metrics/`.

---

## Metadata Schema

All workflows follow the standard frontmatter:

```yaml
---
description: "Short description"
command: "/command-name"
category: "persona|execution|monitoring|meta|..."
trigger: "manual|auto|scheduled"
version: "1.0.0"
telemetry: "enabled|disabled"
primary_agent: "@agent-name"
domain: "auth|game|bio|core|..."
---
```

See [METADATA.md](./METADATA.md) for full schema reference.

---

## Troubleshooting

| Symptom | Solution |
| :--- | :--- |
| Command not recognized | Check `.agent/workflows/` for the file |
| Build fails after changes | Run `/debug` then `/gatekeeper` |
| Tests timeout | Check `/monitor-ci` for CI status |
| Merge conflicts | Run `/switch-branch main` then rebase |

---

## Reference Documents

- [INDEX.md](./INDEX.md) - Scenario-based routing guide
- [GRAPH.md](./GRAPH.md) - Workflow dependency diagram
- [METADATA.md](./METADATA.md) - Frontmatter schema

---

*Last updated: 2026-01-08*
