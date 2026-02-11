---
description: "Workflow for architect"
command: "/architect"
category: "persona"
trigger: "manual"
version: "1.0.0"
telemetry: "enabled"
primary_agent: "@architect"
domain: "core"
skills: ["nextjs-route-visualizer"]
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
   - Tech Stack (Next3. **System Design & Context**
   - Review `src/app` structure
   - Run `nextjs-route-visualizer` to map current architecture
   - Create component diagram
   - Data Flow (Server Actions + Zod).
2. Read `task.md` & `ARCHITECTURE.md`.
3. **C4 System Context**:
   - Create/Update `docs/c4-system-context.mermaid` using Mermaid.js.
   - Visualize: User -> [IronForge System] -> External Systems (Supabase, OpenAI, etc).
4. **ADR (Architecture Decision Records)**:
   - For significant changes, create `docs/adr/XXXX-[title].md`.
   - Format: Context, Decision, Consequences.
5. **Config**: Suggest adding new safe CLI tools to `terminalAllowList` in `.agent/config.json`.
6. **Feature Cohesion**: Enforce `src/features/[name]` structure. Generic UI goes to `src/components`.
7. Validate Scope (Feature vs Refactor).
8. Update `implementation_plan.md`.
9. **Platform Scope**: Reference `docs/PLATFORM_MATRIX.md` for cross-device considerations.

## CVP Compliance

- Context Verification Protocol required.
- Log decisions in `DEBT.md`.

## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
