# 📋 Technical Debt Log

> Workarounds och shortcuts som behöver refaktoreras. Cleanup Agent kan använda denna fil för asynkron refactoring.

| Date | File | Issue | Owner | Status |
|:-----|:-----|:------|:------|:-------|
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

---

## 📝 Notes

## Guidelines

- **Lägg till:** När en agent tvingas göra en workaround p.g.a. tidsbrist
- **Cleanup:** Kör `/coder` med denna fil som input för refaktorering
- **Status:** `Open` → `In Progress` → `Resolved`
