---
description: "Workflow for factory"
command: "/factory"
category: "core"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@manager"
domain: "core"
skills: ["clean-code-pro", "git-guard", "project-linker", "remote-trigger"]
---

# 🏭 The Antigravity Factory

**Role:** The Orchestrator of the Feature Assembly Line.
**Goal:** Transform a "Factory Ready" Spec into Shipped Code with zero friction.

> **Philosophy:** "The Spec is the Source of Truth. The Factory is the Verification Engine."

## 🏭 Station 1: The Design Studio (Planning)

> [!IMPORTANT]
> **Operational Guard**: Before starting, run `powershell scripts/factory-manager.ps1 CHECK-GUARD`.

### Protocol: Lean Manufacturing (Token Efficiency)

1. **Context**: Use `nextjs-route-visualizer` to map context. DO NOT read entire codebase.
2. **Tools**: Use `prisma-migrator` for schema changes.
3. **One-Shot**: Specs must be complete. No "iterative guessing".

Before the line starts, the **Council of Roles** must sign off on the Spec.

**Command:** `/factory design [feature-name]`
**Context Source:** `/domain-session` (Optional but Recommended)

| Role | Responsibility | Output in Spec |
| :--- | :--- | :--- |
| **@analyst** | Requirements | `## User Stories` |
| **@architect** | System Design | `## System Design` (Schema/API) |
| **@ui-ux** | Visual Language | `## Visual Design` (Tokens/Mockups) |
| **@qa** | Acceptance Criteria | `## Test Plan` (Gherkin/Steps) |
| **@security** | Threat Model | `## Security` (Auth/Validation) |

**Exit Criteria:**

- All sections must be non-empty.
- Spec must be saved to `specs/[feature-name].md`.
- **Triage**: Check `/triage` for any related P0 items.

---

## 🏭 Station 2: Fabrication (Implementation)

> [!IMPORTANT]
> **Operational Guard**: Run `powershell scripts/factory-manager.ps1 CHECK-GUARD`.

The "Line" begins here. The Agent (@coder) enters "Factory Mode" - high focus, low chatter.

**Command:** `/factory start [feature-name]`

**Protocol:**

1. **Read Spec**: `specs/[feature-name].md`
2. **Read Debt**: `DEBT.md` (Check for blockers in target components).
3. **Implement**:
    - Generate DB Schema (if changed).
    - Generate Types/Zod Schemas.
    - Generate Server Actions.
    - Generate UI Components (using Design tokens).
4. **Unit Test**: Write tests defined in `## Test Plan`.

**Auto-Flow**: If mode is `ON`, automatically proceed to Station 3 after implementation.

---

## 🏭 Station 3: Quality Control (Verification)

**Command:** `/factory verify [feature-name]`

**Protocol:**

1. **Build**: `pnpm run build`
2. **Lint**: `pnpm run lint`
3. **Test**: `pnpm run test`
4. **Gatekeeper**: Run `/gatekeeper`.
5. **Remote Verification**: Trigger Cloud CI.
    - `gh workflow run ci-cd.yml -f ref=$(git rev-parse --abbrev-ref HEAD)`
    - *Wait for Green*: Factory halts until CI passes.

**Failure Protocol:**

- If QC fails:
  1. **Hire Maintenance**: Automatically trigger `powershell scripts/factory-manager.ps1 MAINTAIN`.
  2. This invokes `/ci-doctor` to perform surgical strikes on the failure.
  3. **Hire Librarian**: If fixed, run `powershell scripts/factory-manager.ps1 INDEX` to document the fix.
  4. If still failing after 3 iterations, Log to `DEBT.md` and alert User.

---

## 🏭 Station 4: The Scrap Yard (Debt Management)

**Trigger:** Automatic on failure or "Shortcut Taken".

- If a shortcut is taken (e.g. `// TODO: fix later`), it MUST be logged to `DEBT.md`.
- **Format**: `- [ ] [High] [Feature] shortcut description <!-- source: factory -->`

---

## 🏭 Station 5: Shipping (Delivery)

**Command:** `/factory ship [feature-name]`

**Protocol:**

1. **Docs**: Update `walkthrough.md`.
2. **Metadata**: Update `roadmap.md` status to `[x]`.
3. **PR**: Create Pull Request with:
    - Title: `feat: [feature-name]`
    - Body: Links to Spec, Test Results, and Screenshots.
4. **Project & Knowledge**:
    - Execute `project-linker` to move card to "In Review".
    - **Hire Librarian**: Trigger `/librarian` to index new Spec/Code automatically.
    - Run `powershell scripts/factory-manager.ps1 INDEX`.
5. **Remote Deployment**:
    - `gh workflow run coolify-deploy.yml`

---

## 📊 Status Dashboard

**Command:** `/factory status`

```text
┌─────────────────────────────────────────────┐
| 🏭 FACTORY STATUS                           |
├─────────────────────────────────────────────┤
| 🔴 BUSY: [Generic UI Components]            |
| Station: 2 (Fabrication)                    |
| Error Rate: 0%                              |
├─────────────────────────────────────────────┤
| 🟢 QUEUE:                                   |
| 1. [Guild Territories]                      |
| 2. [Combat Balance v2]                      |
└─────────────────────────────────────────────┘
```

## Version History

### 1.0.0 (2026-02-12)

- Initial release replacing Sprint System.
