# IronForge Development Backlog

This backlog is groomed for small, AI-agent-friendly pull requests. Each item should be
implemented on its own branch unless several tasks explicitly share the same touched files.

Static baseline for documentation-only backlog work:

- `pnpm lint`
- `pnpm check-types`
- `pnpm test:unit`
- `git diff --check`

## Quick Wins

### Clarify README package manager commands

- **Scope:** Align local setup commands with the repository package manager declared in
  `package.json` (`pnpm@10.30.3`).
- **Touched files/modules:** `README.md`, optionally `docs/setup/*`.
- **Acceptance criteria:**
  - README install, dev, test, and Prisma examples use `pnpm` / `pnpm exec`.
  - No secrets or environment-specific values are added.
  - Existing setup flow remains readable for a new contributor.
- **Test command:** `pnpm lint && git diff --check`.
- **Risk level:** Low.
- **Codex prompt:** "Create a docs-only PR that updates IronForge README setup commands to use
  pnpm consistently. Do not change code. Run pnpm lint and git diff --check."

### Add a focused test command reference

- **Scope:** Document the common validation commands and when to use each level.
- **Touched files/modules:** `docs/repo-readiness.md` or `docs/testing.md`, `README.md` link only if
  useful.
- **Acceptance criteria:**
  - Lists `pnpm lint`, `pnpm check-types`, `pnpm test:unit`, `pnpm test:smoke`,
    `pnpm test:e2e`, and `pnpm build`.
  - Notes that integration/E2E may need local services and sanitized test data.
  - Does not introduce new scripts or CI behavior.
- **Test command:** `pnpm lint && git diff --check`.
- **Risk level:** Low.
- **Codex prompt:** "Add a concise validation command reference for IronForge contributors using
  existing package.json scripts only. Keep it docs-only and run pnpm lint plus git diff --check."

### Inventory active specs and roadmap links

- **Scope:** Create a short index of planned specs so agents can pick the right source of truth.
- **Touched files/modules:** `docs/backlog.md`, `roadmap.md`, `specs/*`.
- **Acceptance criteria:**
  - Backlog links to planned specs for Guild Territories, Arena PvP Seasons, World Events,
    Campaign Mode, Territory Conquest, Housing/Citadel, and Premium Cosmetics.
  - Shipped items are not duplicated as active implementation tasks.
  - Each link points to an existing file.
- **Test command:** `pnpm lint && git diff --check`.
- **Risk level:** Low.
- **Codex prompt:** "Update the backlog with an index of existing active specs and roadmap links.
  Do not edit application code. Verify links point to files that exist."

## Bugs/Stability

### Triage Iron Mines E2E flakiness

- **Scope:** Investigate the failing session-list visibility check and make the smallest stable fix.
- **Touched files/modules:** `tests/e2e/iron_mines.cy.ts` or matching Playwright/Cypress test file,
  related `src/features/*` only if the test exposes a real product bug.
- **Acceptance criteria:**
  - Root cause is documented in the PR body.
  - Test waits on stable UI state or accessible selectors instead of timing assumptions.
  - No broad skips are added unless an issue is linked and the skip is narrowly scoped.
- **Test command:** `pnpm test:e2e -- --grep "Iron Mines"` or the matching targeted E2E command.
- **Risk level:** Medium.
- **Codex prompt:** "Triage Iron Mines E2E flakiness from local test output and existing logs only.
  Make the smallest test or UI fix, avoid broad skips, and run the targeted E2E test plus
  pnpm lint."

### Audit silent catch blocks

- **Scope:** Find silent catch blocks in critical app, action, service, and integration paths, then add
  explicit logging or safe error handling in a narrow first pass.
- **Touched files/modules:** `src/actions/**`, `src/services/**`, `src/lib/logger.ts`,
  `src/lib/with-logger.ts`.
- **Acceptance criteria:**
  - A small documented subset is improved, preferably one module family.
  - User-facing behavior does not leak secrets or raw provider payloads.
  - Tests cover changed behavior where practical.
- **Test command:** `pnpm lint && pnpm check-types && pnpm test:unit`.
- **Risk level:** Medium.
- **Codex prompt:** "Audit one small area of IronForge for silent catch blocks and replace them
  with safe logging or explicit fallback behavior. Keep scope narrow, add/update tests, and avoid
  logging secrets or provider payloads."

### Harden external API response validation

- **Scope:** Add or tighten Zod schemas around one integration response path.
- **Touched files/modules:** `src/actions/integrations/*`, `src/services/bio/*`,
  `src/lib/hevy.ts`, `src/lib/strava.ts`, `src/types/*`.
- **Acceptance criteria:**
  - One API boundary validates unknown input before business logic consumes it.
  - Invalid responses produce a typed, sanitized error path.
  - Unit tests cover valid and invalid payload examples.
- **Test command:** `pnpm lint && pnpm check-types && pnpm test:unit`.
- **Risk level:** Medium.
- **Codex prompt:** "Choose one external integration boundary in IronForge and add focused Zod
  validation for its response payload. Add unit tests for valid and invalid responses, and avoid
  changing unrelated integration behavior."

## Tests/Quality

### Add coverage for bio services

- **Scope:** Increase unit coverage for recovery and Garmin-related service logic without hitting live
  APIs.
- **Touched files/modules:** `src/services/bio/RecoveryService.ts`,
  `src/services/bio/GarminService.ts`, `tests/unit/services/bio/*`.
- **Acceptance criteria:**
  - Tests use mocks/fixtures only and do not call live provider endpoints.
  - Recovery baseline TODO behavior is captured as current behavior or a small fix.
  - Edge cases for missing/partial wellness data are covered.
- **Test command:** `pnpm test:unit -- tests/unit/services/bio`.
- **Risk level:** Low.
- **Codex prompt:** "Add focused unit tests for IronForge bio services using local mocks only.
  Do not call live APIs. Cover missing and partial wellness data, then run the targeted Vitest
  command plus pnpm lint."

### Reduce `any` usage in one module family

- **Scope:** Replace unsafe `any` in one cohesive area with typed DTOs, generics, or `unknown` plus
  narrowing.
- **Touched files/modules:** Candidate areas include `src/lib/prisma.ts`,
  `src/lib/intervals.ts`, `src/lib/hevy.ts`, or one `src/services/**` family.
- **Acceptance criteria:**
  - The PR removes a measurable number of `any` usages in one area.
  - No broad type suppressions are added.
  - Runtime behavior stays unchanged.
- **Test command:** `pnpm check-types && pnpm test:unit`.
- **Risk level:** Medium.
- **Codex prompt:** "Pick one cohesive IronForge module family and reduce explicit any usage with
  real types or unknown-plus-narrowing. Keep behavior unchanged, avoid broad suppressions, and run
  pnpm check-types plus relevant unit tests."

### Add action-layer tests for sync endpoints

- **Scope:** Expand unit tests around sync routes/actions that transform user or training data.
- **Touched files/modules:** `src/app/api/sync/**`, `src/actions/training/**`,
  `tests/unit/app/api/sync/**`.
- **Acceptance criteria:**
  - Tests cover happy path, validation failure, and unauthorized/missing-user behavior.
  - External dependencies are mocked.
  - Fixtures contain no real user data.
- **Test command:** `pnpm test:unit -- tests/unit/app/api/sync`.
- **Risk level:** Medium.
- **Codex prompt:** "Add focused unit tests for IronForge sync API behavior using sanitized local
  fixtures and mocks. Cover happy path, validation failure, and missing-user behavior."

## Product Improvements

### Tighten first-session onboarding

- **Scope:** Make the first user session less overwhelming by reviewing the current onboarding route
  and quest flow, then implementing one small improvement.
- **Touched files/modules:** `src/app/welcome/*`, `src/actions/user/onboarding.ts`,
  `src/features/dashboard/components/*`, onboarding tests.
- **Acceptance criteria:**
  - First-session UI presents one primary next action.
  - Existing onboarding completion state continues to work.
  - A unit or component test covers the changed state.
- **Test command:** `pnpm lint && pnpm test:unit -- tests/unit`.
- **Risk level:** Medium.
- **Codex prompt:** "Improve the first-session onboarding flow with one small, testable UX change.
  Keep scope narrow, preserve completion state, and add/update a relevant test."

### Add serious/lite mode copy pass

- **Scope:** Review non-gamer mode surfaces for overly heavy RPG terminology and add calmer copy
  where mode context exists.
- **Touched files/modules:** `src/features/dashboard/**`, `src/app/settings/**`,
  `src/components/**`.
- **Acceptance criteria:**
  - Serious/lite mode surfaces use practical training language where appropriate.
  - RPG mode copy is not removed from explicit game surfaces.
  - Component tests or snapshots are updated if text assertions exist.
- **Test command:** `pnpm lint && pnpm test:unit`.
- **Risk level:** Low.
- **Codex prompt:** "Make a narrow copy pass for IronForge serious/lite mode surfaces. Preserve RPG
  copy in game mode, update tests if text assertions change, and run pnpm lint plus unit tests."

### Improve marketing value proposition

- **Scope:** Clarify the marketing page so a new visitor immediately understands the product.
- **Touched files/modules:** `src/app/(marketing)/page.tsx`, `src/components/marketing/*`,
  `tests/unit/components/marketing/*`.
- **Acceptance criteria:**
  - Hero headline/category and supporting copy explain fitness tracking plus RPG progression.
  - Existing component structure and tests remain stable.
  - No pricing or payment claims are introduced.
- **Test command:** `pnpm lint && pnpm test:unit -- tests/unit/components/marketing`.
- **Risk level:** Low.
- **Codex prompt:** "Refine the IronForge marketing hero/value proposition so new visitors
  understand the app quickly. Do not add pricing claims. Update marketing component tests as
  needed."

## Larger Later

### Guild Territories weekly resolution

- **Scope:** Implement the weekly territory resolution loop and territory bonus cap from the planned
  spec.
- **Touched files/modules:** `specs/guild-territories.md`, `src/services/game/*`,
  `src/actions/guild-territories.ts`, `src/app/api/cron/*`, Prisma schema/migrations if needed.
- **Acceptance criteria:**
  - Weekly settlement is deterministic and idempotent.
  - Territory bonus capping is enforced server-side.
  - Unit tests cover resolution, cap behavior, and repeated cron execution.
- **Test command:** `pnpm lint && pnpm check-types && pnpm test:unit`.
- **Risk level:** High.
- **Codex prompt:** "Implement the smallest safe slice of Guild Territories weekly resolution from
  the existing spec. Keep settlement idempotent, enforce bonus caps server-side, and add unit
  tests before considering any cron/deploy changes."

### Partykit multiplayer migration spike

- **Scope:** Produce a technical spike or prototype plan for migrating co-op realtime sessions from
  current infrastructure to Partykit.
- **Touched files/modules:** `docs/analysis/*`, `src/services/coop/CoOpService.ts`,
  `tests/unit/services/*` if a tiny adapter prototype is included.
- **Acceptance criteria:**
  - Documents current realtime responsibilities and migration risks.
  - Identifies the smallest adapter boundary.
  - Does not replace production realtime behavior in the first PR unless explicitly approved.
- **Test command:** `pnpm lint && git diff --check`.
- **Risk level:** High.
- **Codex prompt:** "Create a technical spike for moving IronForge co-op realtime sessions toward
  Partykit. Prefer docs and adapter-boundary analysis only; do not replace production behavior."

### Upstash Redis edge caching pilot

- **Scope:** Add a small cache abstraction and pilot it on one read-heavy, non-sensitive query after
  deciding cache keys and invalidation.
- **Touched files/modules:** `src/lib/*`, leaderboard or Oracle read paths, tests, environment docs.
- **Acceptance criteria:**
  - Cache keys do not include secrets or private raw payloads.
  - Missing Redis configuration falls back safely.
  - Tests cover hit, miss, and disabled-cache behavior.
- **Test command:** `pnpm lint && pnpm check-types && pnpm test:unit`.
- **Risk level:** High.
- **Codex prompt:** "Design and implement a minimal Upstash Redis cache pilot for one safe
  read-heavy IronForge path. Include disabled-cache fallback, tests for hit/miss behavior, and no
  secret-bearing cache keys."

### React Native/Expo feasibility decision

- **Scope:** Decide whether and when a React Native/Expo migration should start, based on scale
  triggers and current Capacitor limitations.
- **Touched files/modules:** `docs/analysis/*`, `roadmap.md`, `capacitor.config.ts` only if noting
  current state.
- **Acceptance criteria:**
  - Lists objective trigger metrics such as DAU, app-store requirements, WatchKit needs, or offline
    reliability complaints.
  - Recommends defer/build/migrate with rationale.
  - No mobile code migration is started in this task.
- **Test command:** `pnpm lint && git diff --check`.
- **Risk level:** Low.
- **Codex prompt:** "Write a feasibility decision memo for React Native/Expo versus current
  Capacitor in IronForge. Use objective triggers, recommend defer/build/migrate, and do not change
  mobile app code."
