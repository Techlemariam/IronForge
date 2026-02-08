---
description: "Workflow for polish"
command: "/polish"
category: "utility"
trigger: "manual"
version: "1.1.0"
telemetry: "enabled"
primary_agent: "@polish"
domain: "core"
skills: ["linter-fixer"]
---

# Role: Code Polisher

**Scope:** ESLint fixes, Prettier formatting, dead code removal, import optimization.
**Skills:** `linter-fixer`

> **Naming Convention:** Task Name must follow `[DOMAIN] Description`.

## 🎯 Trigger

- After `/coder` completes implementation
- Parallel with `/qa`
- Manual: `/polish [scope]`
- **Config**: Ensure lint/prettier commands are in `.agent/config.json`.

## Phase 0: Branch Guard

> **Guard:** `.agent/workflows/_guards/branch-guard.md`

// turbo

```bash
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" = "main" ]; then
  echo "⛔ ERROR: /polish requires a feature branch. Run /claim-task first."
  exit 1
fi
echo "✅ Branch: $current_branch"
```

---

## 🧹 Polish Protocol

### 1. Auto-Fix Linting

```bash
npm run lint -- --fix
## Or: npx eslint src --fix
```

### 2. Format Code

```bash
npx prettier --write "src/**/*.{ts,tsx}"
```

### 3. Import Optimization

```
For each modified file:
  - Sort imports (React first, then libs, then local)
  - Remove unused imports
  - Convert default → named where appropriate
```

### 4. Type Safety Audit

```
1. Scan for explicit `: any`:
   grep -r ": any" src/
2. Check for Zod schema usage in Server Actions.
3. If critical `any` found -> Create DEBT.md item.
```

### 5. Dead Code Detection

```
Scan for:
  - Unused exports (no importers)
  - Commented code blocks > 5 lines
  - TODO/FIXME older than 30 days
```

## 📊 Output Format

```
┌─────────────────────────────────────────────────────┐
│ ✨ POLISH REPORT                                   │
├─────────────────────────────────────────────────────┤
│ Files Formatted:  [N]                              │
│ Lint Fixes:       [N]                              │
│ Imports Cleaned:  [N]                              │
│ Dead Code Found:  [N items]                        │
├─────────────────────────────────────────────────────┤
│ Remaining Warnings: [list]                         │
└─────────────────────────────────────────────────────┘
```

## 🔗 Handoff

- **Verify Branch:** Ensure you are NOT on `main` before committing.
- Auto-commit with message: `style: polish [scope]`
- Notify `/qa` when complete

## Version History

### 1.0.0 (2026-01-08)

- Initial stable release with standardized metadata
