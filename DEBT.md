# 📋 Technical Debt Log

> Workarounds och shortcuts som behöver refaktoreras. Cleanup Agent kan använda denna fil för asynkron refactoring.

| Date | File | Issue | Owner | Status |
| :--- | :--- | :--- | :--- | :--- |
| 2025-12-23 | `src/services/*` | Legacy adapters → Server Actions migration complete (Hevy, Intervals) | @cleanup | ✅ Resolved |
| 2025-12-25 | `src/services/hevy.ts` | Legacy Hevy adapter removed (Moved to Server Actions) | @cleanup | ✅ Resolved |
| 2025-12-23 | `src/actions/combat.ts` | Prisma Monster type mismatch - fixed with PrismaMonster type | @coder | ✅ Resolved |
| 2025-12-23 | `src/features/game/CombatArena.tsx` | `Equipment` type missing `rarity`/`image` props for `LootReveal` | @coder | ✅ Resolved (was false positive) |
| 2025-12-27 | `src/actions/__tests__/hevy.test.ts` | Prisma mock failure (`findMany`) in challenge service integration | @qa | ✅ Resolved |
| 2025-12-27 | `docs/api-reference.md` | Missing docs for `challenges.ts` and `strava.ts` | @librarian | ✅ Resolved |
| 2025-12-28 | `src/components/SessionRunner.tsx` | Renamed to `IronMines.tsx` for thematic consistency | @coder | ✅ Resolved |
| 2025-12-28 | `src/features/training/IronMines.tsx` | 375 lines - extract hooks (`useSetLogging`, `useJokerSets`) | @cleanup | ✅ Resolved |
| 2025-12-28 | `src/features/strength/` | Move `IronMines.tsx` from `/training` to `/strength` for cohesion | @cleanup | ✅ Resolved |
| 2025-12-28 | `src/features/strength/hooks/` | Create `useVolumeTracking.ts` for Enhanced Volume Calculator | @coder | ✅ Resolved |
| 2025-12-28 | `src/features/training/IronMines.tsx` | Add real-time volume feedback ("Chest: 8/12 sets") | @coder | ✅ Resolved |
| 2025-12-29 | `src/features/strength/` | Implemented real-time volume tracking with MRV guidelines | @coder | ✅ Resolved |
| 2025-12-29 | `src/actions/analytics-dashboard.ts` | Schema mismatch: uses non-existent fields (weight, reps) on ExerciseLog | @cleanup | ✅ Resolved |
| 2025-12-29 | `src/services/titan-state-schema.ts` | Fixed: Titan stat fields added | @cleanup | ✅ Resolved |
| 2025-12-29 | `src/services/titan-mutations.ts` | Fixed: User.totalXp→totalExperience | @infrastructure | ✅ Resolved |
| 2025-12-29 | `src/actions/data-backup.ts` | Fixed: Titan stat fields added | @cleanup | ✅ Resolved |
| 2025-12-29 | `src/actions/titan-comparison.ts` | Fixed: Titan stat fields added | @cleanup | ✅ Resolved |
| 2025-12-29 | `src/actions/duel-leaderboard.ts` | Fixed: Missing getSession import | @infrastructure | ✅ Resolved |
| 2025-12-29 | `src/actions/duel.ts` | Fixed: User model has no image field | @infrastructure | ✅ Resolved |
| 2025-12-29 | `src/actions/guild-creation.ts` | Fixed: Guild model fields added | @cleanup | ✅ Resolved |
| 2025-12-29 | `src/actions/guild-quests.ts` | Fixed: Titan.currentXp→xp | @cleanup | ✅ Resolved |
| 2025-12-29 | `src/actions/stat-overrides.ts` | Fixed: Titan.currentXp→xp | @cleanup | ✅ Resolved |
| 2025-12-29 | `src/actions/streak.ts` | Fixed: Titan.currentXp→xp | @cleanup | ✅ Resolved |
| 2025-12-29 | `src/actions/overtraining.ts` | Fixed: Titan.currentXp→xp | @cleanup | ✅ Resolved |
| 2025-12-29 | `src/actions/workout-export.ts` | Fixed: Titan.currentXp→xp | @cleanup | ✅ Resolved |
| 2025-12-29 | `src/actions/xp-multiplier.ts` | Fixed: Titan.currentXp→xp | @cleanup | ✅ Resolved |
| 2025-12-29 | `src/actions/iron-leagues.ts` | Fixed: Titan.currentXp→xp | @cleanup | ✅ Resolved |
| 2025-12-29 | `src/actions/guild-rewards.ts` | Fixed: Titan.currentXp→xp | @cleanup | ✅ Resolved |
| 2025-12-29 | `src/actions/login-rewards.ts` | Fixed: User fields added | @cleanup | ✅ Resolved |
| 2025-12-29 | `src/actions/notification-preferences.ts` | Fixed: User fields added | @cleanup | ✅ Resolved |
| 2025-12-29 | `src/actions/coach-subscription.ts` | Fixed typo: subscriptionExpiresAt→subscriptionExpiry | @infrastructure | ✅ Resolved |
| 2025-12-29 | `src/app/iron-arena/page.tsx` | Fixed ESLint: escaped apostrophe in JSX text | @infrastructure | ✅ Resolved |
| 2025-12-29 | `src/actions/program.ts` | Missing real auth implementation (`TODO: Add real auth`) | @security | ✅ Resolved |
| 2025-12-29 | `src/utils/supabase/*.ts` | Excessive use of `any` in cookie handling | @security | ✅ Resolved (ResponseCookie type) |
| 2025-12-29 | `src/services/storage.ts` | Unsafe `any` usage in storage payload/retrieval | @architect | ✅ Resolved (already uses `unknown`) |
| 2025-12-29 | `src/actions/analytics-dashboard.ts` | Logic incompatible with ExerciseLog schema | @architect | ✅ Resolved (fallback handling) |
| 2025-12-29 | `src/types/global.d.ts` | Missing types for Three.js elements (using `any`) | @ui-ux | ⚠️ Deferred (R3F requires flexible types) |
| 2025-12-29 | `src/components/UltrathinkDashboard.tsx` | Fixed syntax error (missing closing div) | @cleanup | ✅ Resolved |
| 2025-12-29 | `src/components/ui/progress.tsx` | Missing shadcn component added | @cleanup | ✅ Resolved |
| 2025-12-29 | `src/app/globals.css` | Fixed corrupted file/syntax error | @cleanup | ✅ Resolved |
| 2025-12-29 | `tailwind.config.js` | Fixed quoting syntax error | @cleanup | ✅ Resolved |
| 2025-12-31 | `src/actions/forge.ts` | Uses mock inventory (DB schema blocker: no stackable items support) | @architect | ⚠️ Deferred |
| 2026-01-01 | `src/**/*` | Fix `check-types` failures to enable strict CI gate | @cleanup | ✅ Resolved |
| 2026-01-01 | `src/app/api/sync/user/route.ts` | Missing authentication in Sync API (`// TODO: proper auth`) | @security | ✅ Resolved |
| 2026-01-01 | `src/app/api/cron/daily-oracle/route.ts` | Missing Sentry Monitoring | @infrastructure | ✅ Resolved |
| 2026-01-03 | `src/services/game/PowerRatingService.ts` | Hardcoded adherence (MVP). Link to WeeklyPlan required for V2. | @architect | ✅ Resolved |
| 2026-01-03 | `src/actions/training.ts` | Hardcoded 5 XP for Battle Pass. Needs dynamic calculation. | @game-designer | ✅ Resolved |
| 2026-01-04 | `src/app/api/webhooks/strava/route.ts` | Missing comprehensive test coverage for webhook logic. | @qa | ✅ Resolved |
| 2026-01-04 | `src/**/*` | Resolved 50+ `any` usages in `OracleService`, `PlannerService`, `GameContextService`, `PowerRatingService`, and `Prisma` client. Improved overall project type safety. | @cleanup | ✅ Resolved |
| 2026-01-04 | `src/actions/training.ts` | `logTitanSet` has high complexity (Level, BP, Challenge, Log). Extract to services. | @architect | ✅ Resolved |
| 2026-01-05 | `tests/e2e/cardio-duels.spec.ts` | SKIPPED: 3 tests require seeded mock opponents. Add E2E DB seeding step to CI. | @infrastructure | ✅ Resolved (e2e-seed.ts) |
| 2026-01-05 | `tests/e2e/battle-pass.spec.ts` | SKIPPED: Premium upgrade test requires seeded BattlePassSeason in CI. | @infrastructure | ✅ Resolved (e2e-seed.ts) |
| 2026-01-05 | `src/features/dashboard/CitadelHub.tsx` | 17 nav items (5.6×) exceed cognitive load target (<3 decisions/view). Needs progressive disclosure. | @ui-ux | ✅ Resolved |
| 2026-01-05 | `src/components/ui/LoadingSpinner.tsx` | Already has `role="status"`, `aria-live="polite"`, `aria-busy="true"`. | @ui-ux | ✅ Resolved |
| 2026-01-05 | `src/features/dashboard/DashboardClient.tsx` | 685 lines → 432 lines. Extracted `ViewRouter.tsx` component. | @cleanup | ✅ Resolved |
| 2026-01-05 | `src/components/ui/TvHud.tsx` | 7532 bytes may exceed TV Mode data density guidelines (max 3 data points). | @ui-ux | ✅ Resolved |
| 2026-01-05 | `src/**/*` | Only 3 files use `aria-label`. Add accessibility labels to all interactive elements. | @ui-ux | ⚠️ Open |
| 2026-01-06 | `src/features/oracle/OracleChat.tsx` | Improved `context` prop from `any` to `Record<string, unknown>`. @ts-ignore and `as any` casts remain due to @ai-sdk/react type limitations. | @cleanup | ⚠️ Deferred (Lib) |
| 2026-01-06 | `package.json` | PR #31 (Dependencies) deferred (Zod 4, ESLint 9) | @infrastructure | ⚠️ Deferred |
| 2026-01-06 | `src/services/analytics/GrowthMetricsService.ts` | `getSocialEngagement` is a placeholder. Requires 'Friendship' model implementation. | @architect | ✅ Resolved (Verified, added tests) |
| 2026-01-06 | `src/features/game/TheForge.tsx` | Mock inventory state and 'optimistic update' logic needs proper hook/server-sync. | @coder | ⚠️ Open |
| 2026-01-06 | `src/actions/economy/forge.ts` | `getInventory` uses mock data. DB schema update needed for stackable resources. | @architect | ⚠️ Deferred (Schema) |
| 2026-01-06 | `src/features/game/hooks/useSkillEffects.ts` | Keystone selection logic only supports first keystone. Needs multi-keystone/switching support. | @game-designer | ✅ Resolved |
| 2026-01-06 | `src/actions/guild/raids.ts` | `startRaidAction` missing admin permission check (`// TODO: Verify user is admin`). | @security | ✅ Resolved |
| 2026-01-06 | `src/actions/combat/emotes.ts` | `sendBattleEmoteAction` missing Supabase Realtime broadcast to opponent. | @infrastructure | ✅ Resolved |
| 2026-01-06 | `src/services/oracle.ts` | Deprecate LLM-based logic in favor of deterministic `GoalPriorityEngine`. | @architect | ✅ Resolved |
| 2026-01-07 | `src/data/workouts.ts` | Only contains cardio (RUN/BIKE/SWIM). Strength workouts need dynamic generation from `exerciseDb.ts`. | @game-designer | ⚠️ Open |
| 2026-01-07 | `src/lib/intervals.ts` | `rampRate`, `zone_times`, `icu_training_load` verified AS USED. Field analysis: rampRate used in planner.ts & intervals actions; zone_times used in HeartRateZoneChart; icu_training_load used in planner.ts & oracle.ts. | @titan-coach | ✅ Resolved (Verified In Use) |
| 2026-01-10 | `src/actions/training/cardio.ts` | Mock HR values (140/170) not found in current codebase. Likely already fixed or debt item refers to different location. | @titan-coach | ✅ Resolved (Not Found) |
| 2026-01-11 | `tests/e2e/iron-mines.spec.ts` | Co-Op E2E tests use mocked Realtime events. Full multi-user testing requires integration tests with Supabase. | @qa | ⚠️ Deferred (Integration) |
| 2026-01-12 | `src/features/dashboard/CitadelHub.tsx` | "Cardio Paradox": Training Center (tabs) only accessible via Cardio -> Training Path. "Strength Focus" is a dead end. | @ui-ux | ✅ Resolved |
| 2026-01-14 | `src/services/coop/CoOpService.ts` | Fixed type-unsafe casting by implementing manual snake_case to camelCase mapping for DB results. | @infrastructure | ✅ Resolved |
| 2026-01-14 | `prisma/schema.prisma` | DB Drift: `active_sessions` table exists in DB but not in migration history. Requires reset. | @infrastructure | ✅ Resolved |

---

## 📝 Notes

| Date | File | Issue | Owner | Status |
| :--- | :--- | :--- | :--- | :--- |
| 2026-01-03 | `.lighthouserc.json` | Lighthouse thresholds already at 0.9 for all categories. | @perf | ✅ Resolved |
| 2026-01-05 | `src/services/progression.ts:135` | TODO: Add gender to User model for accurate Wilks score calculation | @architect | ⚠️ Deferred (DB schema) |
| 2026-01-05 | `src/services/bio/GarminService.ts:33` | TODO: Implement direct Garmin Health API (awaiting API approval) | @infrastructure | ⚠️ Deferred (External) |
| 2026-01-05 | `src/services/bio/RecoveryService.ts:40` | TODO: Implement proper baseline tracking in Phase 2 | @titan-coach | ⚠️ Deferred (Phase 2) |

## Guidelines

- **Lägg till:** När en agent tvingas göra en workaround p.g.a. tidsbrist
- **Cleanup:** Kör `/coder` med denna fil som input för refaktorering
- **Status:** `Open` → `In Progress` → `Resolved`
