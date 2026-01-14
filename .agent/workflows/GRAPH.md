# Workflow Dependency Graph

This document maps workflow dependencies and lifecycle paths through the IronForge development process.

## Workflow Lifecycle

```mermaid
graph TD
    %% Entry Points
    startup([/startup]) --> context{Review Context}
    context --> |New Work| idea[/idea]
    context --> |Continue Task| resume[Resume from Roadmap]
    context --> |Maintenance| maintenance[Maintenance Workflows]

    %% New Feature Path
    idea --> analyst[/analyst]
    analyst --> architect[/architect]
    architect --> feature[/feature]
    feature --> coder[/coder]

    %% Bugfix Path
    context --> |Bug Found| debug[/debug]
    debug --> coder

    %% Debt Path
    context --> |Debt Work| cleanup[/cleanup]
    cleanup --> coder

    %% Implementation to Verification
    coder --> build{Build Success?}
    build --> |No| debug
    build --> |Yes| qa[/qa]

    qa --> tests{Tests Pass?}
    tests --> |No| debug
    tests --> |Yes| gatekeeper[/gatekeeper]

    %% Quality Gate
    gatekeeper --> gate{All Checks Pass?}
    gate --> |No| polish[/polish]
    polish --> coder
    gate --> |Yes| predeploy[/pre-deploy]

    %% Deployment
    predeploy --> cipass{CI Pass?}
    cipass --> |No| debug
    cipass --> |Yes| deploy[/deploy]
    deploy --> shipped([✅ Shipped])

    %% Maintenance Workflows
    maintenance --> monitor{Monitor Type}
    monitor --> |CI| monitorci[/monitor-ci]
    monitor --> |Tests| monitortests[/monitor-tests]
    monitor --> |DB| monitordb[/monitor-db]
    monitor --> |Bio| monitorbio[/monitor-bio]
    monitor --> |Logic| monitorlogic[/monitor-logic]
    monitor --> |Game| monitorgame[/monitor-game]

    monitorci --> triage[/triage]
    monitortests --> triage
    monitordb --> triage
    monitorbio --> triage
    monitorlogic --> triage
    monitorgame --> triage

    triage --> roadmap([Update Roadmap])

    %% Self-Improvement
    context --> |Workflow Issues| evolve[/evolve]
    evolve --> improved([Improved Workflows])

    %% Domain Sessions
    context --> |Domain Focus| domainsession[/domain-session]
    domainsession --> domainwork{Work Type}
    domainwork --> |Feature| feature
    domainwork --> |Bugfix| debug
    domainwork --> |Triage| triage
    domainwork --> |Research| librarian[/librarian]

    %% Styling
    classDef entryPoint fill:#4CAF50,stroke:#2E7D32,color:#fff
    classDef planning fill:#2196F3,stroke:#1565C0,color:#fff
    classDef execution fill:#FF9800,stroke:#E65100,color:#fff
    classDef verification fill:#9C27B0,stroke:#6A1B9A,color:#fff
    classDef deployment fill:#F44336,stroke:#C62828,color:#fff
    classDef maintenance fill:#607D8B,stroke:#37474F,color:#fff

    class startup,context,resume entryPoint
    class idea,analyst,architect,feature,domainsession planning
    class coder,cleanup,polish execution
    class qa,gatekeeper,predeploy verification
    class deploy,shipped deployment
    class monitor,monitorci,monitortests,monitordb,monitorbio,monitorlogic,monitorgame,triage,evolve maintenance
```

## Workflow Categories

### 🚀 Entry Points

- **`/startup`** - Session initialization and context restoration
- **`/manager`** - Strategic federated orchestrator
- **`/domain-session`** - Domain-focused work session

### 📋 Planning & Analysis

| Workflow     | Purpose                      | Next Steps               |
| ------------ | ---------------------------- | ------------------------ |
| `/idea`      | Idea intake and ROI analysis | → `/analyst`             |
| `/analyst`   | Requirements gathering       | → `/architect`           |
| `/architect` | System design                | → `/feature` or `/coder` |
| `/feature`   | End-to-end feature pipeline  | → `/coder`               |

### 🔨 Execution

| Workflow          | Purpose         | Next Steps         |
| ----------------- | --------------- | ------------------ |
| `/coder`          | Implementation  | → `/qa`            |
| `/cleanup`        | Debt resolution | → `/coder` → `/qa` |
| `/infrastructure` | DevOps work     | → `/qa`            |
| `/ui-ux`          | Frontend design | → `/coder`         |

### ✅ Verification

| Workflow      | Purpose               | Next Steps      |
| ------------- | --------------------- | --------------- |
| `/qa`         | Quality assurance     | → `/gatekeeper` |
| `/unit-tests` | Generate unit tests   | → `/qa`         |
| `/gatekeeper` | Quality gate          | → `/pre-deploy` |
| `/pre-deploy` | Pre-deployment checks | → `/deploy`     |

### 🚢 Deployment

| Workflow  | Purpose               | Next Steps  |
| --------- | --------------------- | ----------- |
| `/deploy` | Production deployment | → Shipped   |
| `/schema` | Database migrations   | → `/deploy` |

### 🔍 Monitoring

| Workflow          | Purpose            | Triggers        |
| ----------------- | ------------------ | --------------- |
| `/monitor-ci`     | CI/CD health       | → `/triage`     |
| `/monitor-tests`  | Test execution     | → `/triage`     |
| `/monitor-db`     | Database health    | → `/triage`     |
| `/monitor-bio`    | Bio integration    | → `/triage`     |
| `/monitor-logic`  | Type safety & debt | → `/triage`     |
| `/monitor-game`   | Game balance       | → `/triage`     |
| `/monitor-deploy` | Vercel deployments | → `/triage`     |
| `/monitor-growth` | Growth metrics     | → `/strategist` |

### 🛠️ Utilities

| Workflow         | Purpose           | When to Use           |
| ---------------- | ----------------- | --------------------- |
| `/debug`         | Error analysis    | Build/test failures   |
| `/polish`        | Code cleanup      | Lint/format issues    |
| `/perf`          | Performance       | Bundle/lighthouse     |
| `/security`      | Security audit    | Before deploy         |
| `/triage`        | Prioritization    | After monitors        |
| `/evolve`        | Self-improvement  | Workflow optimization |
| `/claim-task`    | Task coordination | Parallel work         |
| `/switch-branch` | Branch switching  | Multi-task sessions   |

## Workflow Dependencies

### Critical Path (New Feature)

```
/claim-task → /domain-session → /architect → /coder → /qa → /gatekeeper → /pre-deploy → /deploy
```

### Bug Fix Path

```
/debug → /coder → /qa → /gatekeeper → /deploy
```

### Maintenance Path

```
/monitor-* → /triage → /cleanup → /coder → /qa → /gatekeeper
```

### Self-Improvement Loop

```
/evolve → [Update Workflows] → /startup → [Validate Changes]
```

## Workflow Metadata Reference

Each workflow should include:

```yaml
---
description: Brief description
command: /workflow-name
category: planning|execution|verification|deployment|monitoring|utility|meta
trigger: manual|scheduled|auto
version: X.Y.Z
dependencies: [/other-workflow]
avg_duration_seconds: 120
success_rate_target: 95
rollback_strategy: git_reset|none|custom
telemetry: enabled|disabled
---
```

## Common Workflow Patterns

### Pattern 1: Feature Development

1. `/claim-task [feature-id]` - Reserve work
2. `/domain-session [domain]` - Enter domain
3. `/architect` - Design approach
4. `/coder` - Implement
5. `/qa` - Verify
6. `/gatekeeper` - Quality gate
7. `/pre-deploy` - CI validation
8. `/deploy` - Ship to production

### Pattern 2: Quick Fix

1. `/debug` - Analyze error
2. `/coder` - Apply fix
3. `/qa` - Verify fix
4. `/gatekeeper` - Validate
5. Push to open PR

### Pattern 3: Debt Resolution

1. `/monitor-debt` - Scan codebase
2. `/triage` - Prioritize items
3. `/cleanup` - Auto-fix low-risk
4. `/coder` - Manual fixes
5. `/qa` - Verify improvements

### Pattern 4: Nightly Maintenance

1. `/night-shift` - Orchestrator
   - `/triage` - Update roadmap
   - `/perf` - Performance scan
   - `/evolve` - Optimize workflows
   - `/debt-attack` - Fix one item
2. Generate `DAILY_BRIEF.md`

## Error Recovery Patterns

### Build Failure

```
Error → /debug → Analyze → /coder → Fix → npm run build → Success
```

### Test Failure

```
Error → /qa → Review → /coder → Fix → /unit-tests → /qa → Success
```

### Lint/Type Error

```
Error → /polish → Auto-fix → /coder → Manual fixes → /gatekeeper → Success
```

### Deployment Failure

```
Error → /monitor-deploy → Analyze → /debug → Rollback → /coder → Fix → /pre-deploy
```

## Integration Points

- **GitHub Actions**: `/monitor-ci`, `/pre-deploy`, `/deploy`
- **Prisma**: `/schema`, `/monitor-db`
- **Sentry**: `/debug`, `/monitor-logic`
- **Vercel**: `/deploy`, `/monitor-deploy`
- **Bio APIs**: `/monitor-bio`, `/titan-coach`

## Best Practices

1. **Always start with `/startup`** to restore context
2. **Use `/claim-task`** before starting new work
3. **Run `/gatekeeper`** before every push
4. **Monitor workflows nightly** via `/night-shift`
5. **Triage findings weekly** via `/triage`
6. **Evolve workflows monthly** via `/evolve`
7. **Use domain sessions** for focused work
