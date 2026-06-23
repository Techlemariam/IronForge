# Repo Health Report - 2026-05-22

Branch: `chore/repo-health-report-20260522`

Scope: read-only repository health review plus this report. No application, infra, deploy, secret, host, or production-access changes were made.

## Summary

IronForge is a private TypeScript/React application centered on a Next.js App Router frontend, with supporting MCP servers, a Discord bot, Prisma/Postgres data layer, Supabase integration, Storybook, Vitest, Playwright, Capacitor Android assets, Remotion, and GitHub Actions automation.

The local baseline is mostly healthy for type safety and unit tests:

- `pnpm check-types` passes.
- `pnpm test` passes when run outside the sandbox because Vitest/esbuild needs child-process spawn access.
- `pnpm lint` currently fails on existing Biome formatting issues in source files.
- README setup instructions are stale in a few visible places: it says `npm install` / `npm run dev` and "Next.js 15", while `package.json` declares `pnpm@10.30.3` and `next@16.2.3`.

## Stack Inventory

### Languages

- TypeScript and TSX for the main app, tests, actions, services, MCP servers, and Storybook stories.
- JavaScript/MJS/CJS for scripts and some app support files.
- PowerShell and shell scripts for agent/workflow/developer automation.
- SQL and Prisma schema/migrations for data.
- Java/Kotlin-adjacent Android project files via Capacitor-generated Android structure.
- Markdown-heavy documentation and agent workflow content.

### Frameworks and Libraries

- Web app: Next.js App Router, React 19, Tailwind CSS/PostCSS, Radix UI, lucide-react, framer-motion.
- Data/auth/integrations: Prisma 7, PostgreSQL adapters, Supabase SSR/client packages, Zod.
- AI/media: Google AI SDK / Gemini packages, MediaPipe vision tasks, Remotion.
- PWA/observability: Serwist is present but disabled in `next.config.mjs`; Sentry Next.js integration is active.
- Testing: Vitest, Testing Library, Playwright, Cypress files, Storybook.
- Mobile: Capacitor Android.
- Monorepo/tasking: pnpm workspace plus Turbo task definitions.

### Package Manager

- Declared package manager: `pnpm@10.30.3` in `package.json`.
- Workspace packages are defined in `pnpm-workspace.yaml`:
  - `.`
  - `mcp/*`
  - `apps/*`
- Additional lockfiles exist in subprojects (`apps/discord-bot/package-lock.json`, `apps/mcp-n8n/package-lock.json`, `mcp/factory-server/package-lock.json`), which may confuse install expectations unless intentionally retained.

### Main Entrypoints

- Main Next app:
  - `src/app/(marketing)/page.tsx`
  - `src/app/(authenticated)/dashboard/page.tsx`
  - API routes under `src/app/api/**/route.ts`
  - `src/middleware.ts`
  - `src/instrumentation.ts` and `src/instrumentation-client.ts`
- App configuration:
  - `next.config.mjs`
  - `tsconfig.json`
  - `biome.json`
  - `vitest.config.ts`
  - `playwright.config.ts`
  - `cypress.config.ts`
  - `prisma/schema.prisma`
- Supporting packages:
  - `apps/discord-bot/index.js`
  - `apps/mcp-n8n/src/index.ts`
  - `mcp/factory-server/src/index.ts`
- Mobile:
  - `capacitor.config.ts`
  - `android/app/src/main/java/com/ironforge/app/MainActivity.java`

## Commands Discovered

### Install and Local Dev

- Install: `pnpm install` should be the canonical command based on `packageManager`.
- Dev server: `pnpm dev`
- Start built app: `pnpm start`
- Postinstall: `prisma generate`

### Quality and Validation

- Lint/format check: `pnpm lint` (`biome check .`)
- Typecheck: `pnpm check-types` (`tsc --noEmit`)
- Unit tests: `pnpm test` or `pnpm test:unit` (`vitest run`)
- Coverage: `pnpm test:coverage`
- E2E: `pnpm test:e2e`
- Smoke E2E: `pnpm test:smoke`
- Security audit wrapper: `pnpm security`
- Docs generation: `pnpm docs:generate`
- Storybook: `pnpm storybook`, `pnpm build-storybook`
- Build: `pnpm build` (`next build --webpack`)
- Turbo aggregates:
  - `pnpm agent:verify`
  - `pnpm ci:l1`
  - `pnpm ci:l2`
  - `pnpm ci:l3`

Commands not run in this report:

- `pnpm build`: skipped because it writes build artifacts and runs `prebuild`/log cleanup, which is broader than a read-only health report.
- E2E/smoke tests: skipped because they typically require a running browser/app and may depend on environment state.
- Docker/Supabase/deploy/infra commands: skipped by safety rules.

## Validation Results

Run date: 2026-05-22

| Command | Result | Notes |
| --- | --- | --- |
| `git fetch origin` | Passed | Required branch hygiene. |
| `git checkout main` | Passed | Main was up to date after pull. |
| `git pull --ff-only origin main` | Passed | Already up to date. |
| `git checkout -b chore/repo-health-report-20260522` | Passed | Created report branch. |
| `pnpm lint` | Failed | Biome found 12 existing formatting errors. Representative files include `src/app/api/factory/render-video/route.ts`, `src/app/api/intervals/history/route.ts`, `src/app/api/podcast/route.ts`, `src/features/settings/components/IntegrationsPanel.tsx`, and `src/services/api.ts`. |
| `pnpm check-types` | Passed | `tsc --noEmit` completed successfully. |
| `pnpm test` | Passed after sandbox escalation | Sandbox run failed with `spawn EPERM` while loading Vitest config through esbuild. Outside sandbox: 82 test files passed, 1 skipped; 441 tests passed, 6 skipped. |

## TODO/FIXME Scan

Command:

```powershell
rg -n "TODO|FIXME|HACK|XXX" -g "!*node_modules*" -g "!*dist*" -g "!*storybook-static*" -g "!*coverage*"
```

Result: no matches found in the scanned non-generated/non-dependency paths.

## Dev Friction Observed

- README drift: setup examples use npm while the repo declares pnpm, and the README tech stack says Next.js 15 while dependencies use Next.js 16.2.3.
- Biome formatting baseline is not clean, so `pnpm lint` cannot currently be used as a green pre-PR gate without first formatting existing files.
- Unit tests need child-process spawn access for esbuild/Vite config loading; sandboxed execution failed with `spawn EPERM`, but the same command passed outside sandbox.
- Multiple package-manager lockfiles exist across workspace packages. This may be intentional for standalone subprojects, but it increases onboarding ambiguity.
- Build command runs `prebuild` via npm-style script naming and performs log cleanup before `next build`; that makes build less attractive as a low-impact health-check command.
- Turbo config includes `.eslintrc.json` as a lint input, but the repo appears to use Biome as the active lint command.
- Several generated/runtime-looking artifacts and logs are tracked at repo root, which makes repository scans noisy and can obscure the active source surface.

## Top 5 Recommended Next Tasks

1. Fix the Biome formatting baseline in a dedicated `chore/biome-format-baseline` PR.
2. Update README setup docs to use pnpm, current Next.js version, and safe local validation commands.
3. Decide whether subproject `package-lock.json` files are intentional; document or remove them in a repo hygiene PR.
4. Split a lightweight `pnpm verify:local` script from broader build/deploy-ish checks so agents and contributors have one safe command for local PR validation.
5. Review tracked root logs/generated artifacts and add ignore/cleanup rules where they are not meant to be source-controlled.

## Security Boundaries

- No secrets were added to this report.
- No private IP addresses, host output, or local override files were added.
- No deploy, production access, live host access, Docker, Supabase, or infra commands were run.
- No application code was changed.
- Only `docs/reports/2026-05-22-repo-health.md` is intended for this branch.

## Rollback

Revert the documentation-only PR, or delete `docs/reports/2026-05-22-repo-health.md`.
