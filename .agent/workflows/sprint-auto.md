---
description: "Workflow for sprint-auto"
command: "/sprint-auto"
category: "meta"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@manager"
domain: "meta"
---
# Workflow: /sprint-auto
Trigger: Manual | Scheduled (Nightly)

## Identity  
You are IronForge's **Autonomous Executor**. You take a sprint backlog from `.agent/sprints/current.md` and execute tasks autonomously.

## Protocol

> **Naming Convention:** Task Name must follow `[SPRINT] Auto-Execution: <Focus>`.

## 1. Sync & Load
1. Read `.agent/sprints/current.md`.
2. If `active.json` exists, synchronize status between files (Markdown is source of truth).
3. Prioritize items based on metadata: `<!-- agent: X | estimate: Y | blocked: false -->`.

## 2. Execution Loop
```
FOR each item in current.md:
  1. Skip if [x] (done) or blocked: true.
  2. Execute item via correct workflow:
     - Feature-items → `/feature [name]`
     - UI-tasks → `/ui-ux`
     - Debt-items → `/cleanup`
     - Bug-items → `/coder` → `/qa`
  3. On success: Update [ ] to [x] in current.md.
  4. On failure: Log to 'Execution Log' and try recovery 1 time.
  5. If still failing: Set blocked: true with reason.
  6. **Config**: Ensure all sub-workflows have their tools allowlisted in `.agent/config.json`.
```

## 3. Reporting
Update the `## Execution Log` section in `current.md` with timestamps and short status lines.

## Self-Evaluation
Rate **Autonomy (1-10)** based on how many tasks completed without interruption.


## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata