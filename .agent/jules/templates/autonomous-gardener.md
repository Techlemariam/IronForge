---
template_id: "AUTONOMOUS-GARDENER"
workflow: "/autonomous-gardener"
tier: 1
scope_guard: "passes"
auto_dispatch: true
estimated_files: "3-8 (docs only)"
branch_prefix: "docs/garden"
schedule: "saturdays 08:00"
---

# Jules Template: /autonomous-gardener

## Task

Perform a documentation gardening pass on the IronForge codebase. Scan source files and update documentation to reflect the current state of the codebase.

## Context

IronForge is a Next.js 15 + TypeScript gamification platform. Documentation lives in:

- `ARCHITECTURE.md` — system architecture overview
- `docs/` — feature documentation
- `README.md` — project overview
- JSDoc comments in source files
- `.agent/` — agent workflows and specifications

## Gardening Rules

### Rule 1: Dead Reference Removal

Scan all `.md` files in `docs/` and `ARCHITECTURE.md` for:

- References to files/paths that no longer exist in `src/`
- References to npm packages not in `package.json`
- References to environment variables not in `.env.example`

Action: Mark as `~~[dead reference]~~` with comment `<!-- gardener: file removed, verify and delete -->`

### Rule 2: Missing Module Documentation

Scan `src/lib/`, `src/services/`, `src/components/` for:

- Files > 50 lines with NO JSDoc on their exported functions
- New features created since last garden pass (check `git log --since="7 days ago"`)

Action: Add minimal JSDoc stubs:

```typescript
/**
 * [Brief description from function name + implementation]
 * @param paramName - [inferred from usage]
 * @returns [inferred from return type]
 */
```

### Rule 3: ARCHITECTURE.md Drift Check

Compare `ARCHITECTURE.md` sections against actual codebase:

- Are described module boundaries still accurate?
- Are listed tech stack items still in `package.json`?
- Do described data flows match current Prisma schema relations?

Action: Add `<!-- gardener: verify [YYYY-MM-DD] — [description of potential drift] -->` comment near outdated sections. Do NOT delete or rewrite architecture sections autonomously.

### Rule 4: README Freshness

Check `README.md`:

- Is the Getting Started / local setup section accurate?
- Do listed npm scripts still exist in `package.json`?

Action: Update only factually incorrect script names or commands. Do NOT rewrite prose.

## Acceptance Criteria

- [ ] All dead references in docs flagged with `<!-- gardener: ... -->` markers
- [ ] New exported functions in `src/lib/` and `src/services/` have JSDoc stubs
- [ ] `ARCHITECTURE.md` has drift comments where applicable
- [ ] `README.md` script references verified and corrected if wrong
- [ ] No source code (`.ts`, `.tsx`) modified — docs and JSDoc only
- [ ] `pnpm lint` exits 0
- [ ] `pnpm typecheck` exits 0

## Constraints

- **DO NOT** delete any documentation sections — only mark as stale
- **DO NOT** rewrite architecture decisions or prose explanations
- **DO NOT** modify `.github/workflows`, `prisma/`, or `src/lib/auth`
- **DO NOT** generate fake information — if unsure, use `<!-- gardener: verify -->` marker
- Max scope: `docs/`, `ARCHITECTURE.md`, `README.md`, JSDoc in `src/lib/` and `src/services/`

## Branch Naming

```text
docs/garden-[YYYY-MM-DD]
```

## PR Template

```text
docs: autonomous gardening pass [YYYY-MM-DD]

Documentation maintenance:
- Dead references flagged: [N]
- JSDoc stubs added: [N] functions
- ARCHITECTURE.md drift markers: [N]
- README corrections: [list or "none"]

🤖 Dispatched by Jules via /autonomous-gardener template (scheduled)
```
