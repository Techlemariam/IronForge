---
template_id: "POLISH"
workflow: "/polish"
tier: 1
scope_guard: "passes"
auto_dispatch: true
estimated_files: "many (read-only linter)"
branch_prefix: "chore/polish"
---

# Jules Template: /polish

## Task

Run a polish pass on the IronForge codebase: fix all auto-fixable ESLint violations, apply Prettier formatting, and organize imports.

## Context

IronForge is a Next.js 15 + TypeScript project using:

- **Linter**: ESLint (config in `.eslintrc.json` or `eslint.config.mjs`)
- **Formatter**: Prettier (config in `.prettierrc` or `prettier.config.js`)
- **Package manager**: pnpm
- **Import sorting**: ESLint import plugin (auto-fixable)

This is a **pure formatting/linting pass** — no logical changes are made.

## Steps

### Step 1: ESLint Auto-Fix

```bash
pnpm lint -- --fix
```

### Step 2: Prettier Format

```bash
pnpm dlx prettier --write "src/**/*.{ts,tsx}" "tests/**/*.{ts,tsx}"
```

### Step 3: Verify No Errors Remain

```bash
pnpm lint
```

If any non-auto-fixable lint errors remain after Step 1, **do NOT attempt to fix logic** — list them in the PR description under "Remaining Manual Fixes".

### Step 4: TypeScript Check (Sanity)

```bash
pnpm typecheck
```

If typecheck fails after auto-fix, **STOP** and revert auto-fix changes for the failing file only. List in PR description.

## Acceptance Criteria

- [ ] `pnpm lint` exits 0 (or only reports pre-existing non-auto-fixable errors)
- [ ] `pnpm typecheck` exits 0
- [ ] No import ordering violations
- [ ] Consistent Prettier formatting across all modified files
- [ ] No logic changes — only formatting and import sorting

## Constraints

- **DO NOT** manually edit any business logic
- **DO NOT** modify `prisma/migrations`, `prisma/schema.prisma`
- **DO NOT** touch `.github/workflows`
- **DO NOT** try to fix complex type errors that aren't auto-fixable
- If Prettier reformats a file that then fails typecheck → revert that file

## Branch Naming

```text
chore/polish-[YYYY-MM-DD]
```

Example: `chore/polish-2026-03-05`

## PR Template

```text
chore: polish pass — lint + prettier [YYYY-MM-DD]

Auto-fix run across codebase:
- ESLint auto-fix applied
- Prettier formatting normalized
- Import ordering corrected

Files changed: [N] files
Remaining manual lint issues: [list or "none"]

🤖 Dispatched by Jules via /polish template
```
