---
template_id: "CLEANUP"
workflow: "/cleanup"
tier: 1
scope_guard: "passes"
auto_dispatch: true
estimated_files: "1-3"
branch_prefix: "chore/cleanup"
---

# Jules Template: /cleanup

## Task

Perform a targeted code cleanup pass on a specific module or file in the IronForge codebase.

## Context

IronForge is a Next.js 15 + TypeScript gamification platform. The codebase uses:

- **Runtime**: Node.js 20, Next.js 15 App Router
- **Language**: TypeScript strict mode
- **Testing**: Vitest
- **Linting**: ESLint + Prettier
- **Package manager**: pnpm

Coding conventions:

- Composition over inheritance
- No `any` types — use `unknown` with type guards or proper types
- Zod for all validation schemas
- Named exports preferred over default exports

## Files to Modify

> **FILL IN** before dispatching:
> Replace `[TARGET_FILE]` with the actual file path to clean.

- `[TARGET_FILE]` — Apply cleanup rules listed below

## Acceptance Criteria

- [ ] No unused variables or imports in target file
- [ ] No `any` type casts (replace with proper types or `unknown`)
- [ ] No `// TODO` comments without associated DEBT.md entries
- [ ] No console.log statements in production code
- [ ] Cyclomatic complexity ≤ 10 per function
- [ ] All existing tests pass: `pnpm test`
- [ ] TypeScript compiles cleanly: `pnpm typecheck`
- [ ] ESLint passes: `pnpm lint`

## Cleanup Rules

Apply these specific fixes:

1. **Dead Code**: Remove unused exports, variables, functions, and imports
2. **Type Safety**: Replace `any` with proper types. If type is genuinely unknown, use `unknown` + type guard
3. **TODO Extraction**: For any `// TODO` found, do NOT delete — instead append to `DEBT.md`:

   ```markdown
   - [ ] [DEBT-AUTO] [description from TODO] — source: cleanup, file: [TARGET_FILE]
   ```

4. **Console Removal**: Replace `console.log` with `// [removed console.log]` comment if removal affects debugging intent
5. **Import Organization**: Sort imports: React → Next → Third-party → Internal (`@/`) → Types

## Constraints

- **MAX 3 files** — do not spread changes beyond the target file and optionally its test file
- Do NOT refactor logic — only surface-level cleanup
- Do NOT change function signatures or public APIs
- Do NOT touch `prisma/migrations`, `src/lib/auth`, or `.github/workflows`

## Verification Steps

```bash
pnpm lint
pnpm typecheck
pnpm test
```

All three must exit 0.
