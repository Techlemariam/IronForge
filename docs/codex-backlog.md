# Codex Backlog

Small, prioritized tasks for making IronForge easier to evolve safely with Codex.

## 1. [first PR candidate] Align Playwright web server command with pnpm

- Scope: Change `playwright.config.ts` webServer command from `npm run dev` to the repo's pnpm-equivalent command.
- Risk: Low; E2E startup behavior may differ slightly if npm-specific behavior was relied on.
- Test command: `pnpm test:smoke -- --project=smoke`
- Acceptance criteria: Playwright starts the local app with pnpm and smoke tests still run against `127.0.0.1:3001`.

## 2. [first PR candidate] Make env validation friendlier for local static checks

- Scope: Review whether `GH_PAT` should be required in `src/env.mjs` for build/dev, or only for GitHub-backed features.
- Risk: Medium; auth and CI assumptions may depend on current validation.
- Test command: `pnpm lint && pnpm check-types && pnpm build`
- Acceptance criteria: Static checks can run with documented placeholder/local env behavior, and GitHub-dependent routes still fail closed when credentials are missing.

## 3. [first PR candidate] Document safe local command tiers

- Scope: Add a short docs page or README section that classifies commands as safe static checks, local-only app checks, database-backed checks, and external-service checks.
- Risk: Low; docs-only.
- Test command: `git diff --check`
- Acceptance criteria: A new contributor can tell which commands are safe to run without production credentials or live services.

## 4. Audit package scripts for npm/npx drift

- Scope: Identify scripts in `package.json` that use `npm run` or `npx` and decide whether to convert to pnpm equivalents.
- Risk: Medium; script behavior can differ in CI or Windows shells.
- Test command: `pnpm lint && pnpm check-types`
- Acceptance criteria: Each npm/npx usage is either converted or documented with a reason to keep it.

## 5. Reduce root-level generated artifact noise

- Scope: Inventory committed logs, build outputs, coverage outputs, reports, and generated status JSON files at repo root.
- Risk: Medium; some artifacts may be intentionally used for diagnostics or docs.
- Test command: `git status --short && git diff --check`
- Acceptance criteria: A cleanup proposal lists keep/remove/ignore decisions without deleting anything uncertain.

## 6. Add a local validation checklist

- Scope: Add a concise checklist for docs-only PRs, app-code PRs, DB PRs, and CI PRs.
- Risk: Low; docs-only.
- Test command: `git diff --check`
- Acceptance criteria: PR authors can pick the smallest responsible validation set for their change type.

## 7. Clarify database setup modes

- Scope: Document how to use hosted Supabase, local Supabase, or a plain local PostgreSQL database for development and tests.
- Risk: Low for docs; medium if scripts are changed.
- Test command: `git diff --check`
- Acceptance criteria: Docs explain required env vars and which commands mutate local databases.

## 8. Review .env.example coverage against code usage

- Scope: Compare env vars used in `src`, `scripts`, `tests`, and Prisma config against `.env.example`.
- Risk: Low if docs-only; medium if validation changes.
- Test command: `pnpm lint`
- Acceptance criteria: Missing placeholders are added or intentionally documented as internal/test-only.

## 9. Split CI workflow map into a maintained docs index

- Scope: Summarize `.github/workflows` responsibilities, triggers, and secret expectations in docs.
- Risk: Low; docs-only.
- Test command: `git diff --check`
- Acceptance criteria: Contributors can identify which workflow owns lint, tests, build, deploy, security, and maintenance.

## 10. Add a minimal smoke route or health check test plan

- Scope: Define a tiny app-level smoke check that avoids real external integrations and production state.
- Risk: Medium; touching app routes/tests can affect CI.
- Test command: `pnpm test:unit`
- Acceptance criteria: Smoke coverage confirms the app shell or a safe route renders without requiring production credentials.
