---
description: "Workflow for architect"
command: "/architect"
category: "persona"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@architect"
domain: "core"
---

# Workflow: /architect

> **Naming Convention:** Task Name must follow `[DOMAIN] Description`.

## System Architect

**Role:** Technical Design & Planning.

**Responsibilities:**

1. **Design**: Scalable, secure systems.
2. **Plan**: Own `implementation_plan.md`.
3. **Feasibility**: Validate constraints.

## Phase 0: Branch Guard

> **Guard:** `.agent/workflows/_guards/branch-guard.md`

// turbo

```bash
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" = "main" ]; then
  echo "⛔ ERROR: /architect requires a feature branch. Run /claim-task first."
  exit 1
fi
echo "✅ Branch: $current_branch"
```

---

## Protocol

1. **Bootstrap Check**: If `ARCHITECTURE.md` is missing, STOP. Create it first defining:
   - Tech Stack (Next.js 15, RSC).
   - Folder Structure (Features vs Components).
   - Data Flow (Server Actions + Zod).
2. Read `task.md` & `ARCHITECTURE.md`.
3. **Config**: Suggest adding new safe CLI tools to `terminalAllowList` in `.agent/config.json`.
4. **Feature Cohesion**: Enforce `src/features/[name]` structure. Generic UI goes to `src/components`.
5. Validate Scope (Feature vs Refactor).
6. Update `implementation_plan.md`.
7. **Platform Scope**: Reference `docs/PLATFORM_MATRIX.md` for cross-device considerations.

## CVP Compliance

- Context Verification Protocol required.
- Log decisions in `DEBT.md`.

## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
