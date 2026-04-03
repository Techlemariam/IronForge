---
template_id: "DEBT-ATTACK"
workflow: "/debt-attack"
tier: 1
scope_guard: "passes"
auto_dispatch: true
estimated_files: "1-5"
branch_prefix: "fix/debt"
---

# Jules Template: /debt-attack

## Task

Resolve a specific technical debt item from `DEBT.md` in the IronForge codebase.

## Context

IronForge is a Next.js 15 + TypeScript gamification platform. DEBT.md tracks technical debt items with IDs, priority levels, and file references.

Coding conventions:

- TypeScript strict mode — no `any` types
- Zod for all validation
- Vitest for tests
- Named exports preferred
- Composition over inheritance
- pnpm as package manager

## Pre-Task: Read DEBT.md

1. Open `DEBT.md`
2. Find the item with ID: **`[DEBT_ID]`** (fill in before dispatch)
3. Extract: description, affected files, priority level

## Files to Modify

> Determined by reading the debt item. Max 5 files across max 2 directories.

- Files referenced in debt item `[DEBT_ID]`

## Acceptance Criteria

- [ ] The specific debt item `[DEBT_ID]` is resolved
- [ ] `DEBT.md` item updated: `- [ ]` → `- [x]` with fix date and PR reference
- [ ] All existing tests pass: `pnpm test`
- [ ] TypeScript compiles cleanly: `pnpm typecheck`
- [ ] ESLint passes: `pnpm lint`
- [ ] No new debt introduced (no new `any`, no new TODOs without tracking)

## Constraints

- **SCOPE GUARD**: If the debt item affects > 5 files or touches:
  - `prisma/migrations` → STOP, do not proceed
  - `src/lib/auth` → STOP, do not proceed
  - `.github/workflows` → STOP, do not proceed
  - `docker-compose` → STOP, do not proceed
  
  Instead, add a comment to DEBT.md: `<!-- scope-too-large: requires human review -->`

- Fix only the specified debt item — do not opportunistically fix adjacent issues
- If the fix requires a new database migration: STOP and add note to DEBT.md
- Prefer minimal, surgical changes

## Conflict Check

Before starting, verify no open PR already touches the same files:

```bash
gh pr list --state open --json headRefName --jq '.[].headRefName'
```

If a branch `fix/debt-[DEBT_ID]*` already exists: STOP and report.

## Branch Naming

```text
fix/debt-[DEBT_ID]-[short-description]
```

Example: `fix/debt-D-12-remove-deprecated-hevy-methods`

## Verification Steps

```bash
pnpm lint
pnpm typecheck
pnpm test
```

All must exit 0 before committing.

## PR Template

```text
fix: resolve [DEBT_ID] — [debt description]

Resolves technical debt item [DEBT_ID] from DEBT.md.

Changes:
- [List actual changes made]

Verification:
- ✅ pnpm lint
- ✅ pnpm typecheck  
- ✅ pnpm test

🤖 Dispatched by Jules via /debt-attack template
```
