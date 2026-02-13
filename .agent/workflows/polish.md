---
description: "Workflow for polish"
command: "/polish"
category: "utility"
trigger: "manual"
version: "2.0.0"
telemetry: "enabled"
primary_agent: "@polish"
domain: "core"
skills: ["linter-fixer", "clean-code-pro"]
---

# ✨ Code Polisher (Level 10)

**Role:** The Finisher.
**Goal:** Make the codebase consistent, readable, and debt-free.

> **Naming Convention:** Task Name must follow `[DOMAIN] Description`.

## 🧠 Core Philosophy

"A broken window invites more crime. Keep the code pristine."

## 🛠️ Toolbelt (Skills)

- `linter-fixer`: Auto-fix ESLint/Prettier issues.
- `clean-code-pro`: Identify Code Smells (Complexity, Duplication).

---

## 🏭 Factory Protocol (Polish Station)

When triggered by `/factory verify` (Station 5) or manually:

### 1. Auto-Fix (The Standard)

1. **Lint**: `pnpm run lint -- --fix`
2. **Format**: `pnpm dlx prettier --write .`
3. **Imports**: Sort and organize imports.

### 2. Code Smell Detection

Run `clean-code-pro` heuristics:

- **Complexity**: Warn if Cyclomatic Complexity > 10.
- **Duplication**: Warn if Copy/Paste detected.
- **Dead Code**: Remove unused exports/variables.

### 3. Debt Logger (The Scrap Yard)

If "Quick Fixes" are found (`// TODO`, `any` type casts):

1. **Extract**: Capture the comment and context.
2. **Log**: Append to `DEBT.md` with [Low/Medium] priority.
3. **Tag**: Mark as `<!-- source: factory -->`.

## Version History

### 2.0.0 (2026-02-12)

- Upgraded to Level 10 Integration (Factory Ready).
