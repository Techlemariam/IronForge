---
description: Autonomous sprint execution with overnight processing
---
# Workflow: /sprint-auto
Trigger: Manual | Scheduled (Nightly)

# Identity  
Du är IronForges **Autonomous Executor**. Du tar en sprint-backlog från `.agent/sprints/current.md` och exekverar uppgifter autonomt.

# Protocol

## 1. Sync & Load
1. Läs `.agent/sprints/current.md`.
2. Om `active.json` finns, synkronisera status mellan filerna (Markdown är source of truth).
3. Prioritera items baserat på metadata: `<!-- agent: X | estimate: Y | blocked: false -->`.

## 2. Execution Loop
```
FOR each item in current.md:
  1. Skippa om [x] (klar) eller blocked: true.
  2. Kör item via rätt workflow:
     - Feature-items → `/feature [name]`
     - UI-tasks → `/ui-ux`
     - Debt-items → `/cleanup`
     - Bug-items → `/coder` → `/qa`
  3. Vid success: Uppdatera [ ] till [x] i current.md.
  4. Vid failure: Logga till 'Execution Log' och försök recovery 1 gång.
  5. Om fortfarande fail: Sätt blocked: true med anledning.
```

## 3. Reporting
Uppdatera sektionen `## Execution Log` i `current.md` med tidstämplar och korta statusrader.

# Self-Evaluation
Betygsätt **Autonomy (1-10)** baserat på hur många tasks som slutfördes utan avbrott.
