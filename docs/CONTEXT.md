# 📚 IronForge Context Manifest

> For AI agents: Read this file to understand the project structure before generating code.

---

## 🏗️ Architecture Summary

**Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS + Prisma + Supabase

**Pattern:** Server-First. Use RSC for data fetching, Server Actions for mutations.

---

## 📁 Key Directories

| Path | Purpose |
|:-----|:--------|
| `src/app/` | Next.js App Router (pages, layouts, API routes) |
| `src/app/api/` | REST endpoints (Hevy, Intervals, AI Chat) |
| `src/actions/` | Server Actions (combat, inventory, progression) |
| `src/components/` | Reusable UI components |
| `src/features/game/` | Game-specific components (CombatArena, TheForge) |
| `src/services/game/` | Game logic (CombatEngine, LootSystem) |
| `src/lib/` | Shared utilities (Prisma client, Supabase client) |
| `src/types/` | TypeScript interfaces |
| `prisma/schema.prisma` | Database schema (Source of Truth) |

---

## 🔌 API Routes

| Route | Method | Purpose |
|:------|:-------|:--------|
| `/api/hevy/*` | GET | Hevy workout sync |
| `/api/intervals/*` | GET | Intervals.icu data |
| `/api/chat` | POST | Gemini AI Oracle |
| `/api/webhooks/*` | POST | Real-time data ingestion |
| `/api/sync/*` | POST | Manual sync triggers |

---

## ⚡ Server Actions

| File | Key Functions | Purpose |
|:-----|:--------------|:--------|
| `account.ts` | `deleteAccountAction`, `signOutAction` | Account management |
| `achievements.ts` | `checkAchievementsAction`, `claimAchievementAction` | Achievement system |
| `armory.ts` | `getArmoryData` | Equipment catalog |
| `bestiary.ts` | `getBestiaryData` | Monster catalog |
| `challenges.ts` | `getActiveChallengesAction`, `claimChallengeRewardAction` | Weekly challenges |
| `combat.ts` | `startBossFight`, `performCombatAction` | Turn-based combat |
| `demo.ts` | `toggleDemoModeAction`, `getDemoModeStatus` | Demo mode |
| `forge.ts` | `craftItem` | Crafting system |
| `gameplay.ts` | `simulateLootDrop` | Loot generation |
| `gauntlet.ts` | `logGauntletRunAction`, `getGauntletStatsAction` | Gauntlet arena |
| `guild.ts` | `sendChatAction`, `getUserStatsAction` | Guild chat |
| `guild-raids.ts` | `createGuildAction`, `contributeToRaidAction` | Guild raids |
| `hevy.ts` | `connectHevy`, `getHevyWorkoutHistoryAction` | Hevy integration |
| `integrations.ts` | `validateHevyApiKey` | API key validation |
| `intervals.ts` | `connectIntervals`, `getWellnessAction` | Intervals.icu integration |
| `notifications.ts` | `subscribeUserAction`, `sendNotificationAction` | Push notifications |
| `onboarding.ts` | `completeOnboardingAction` | Onboarding flow |
| `oracle.ts` | `generateDailyDecreeAction` | Oracle decrees |
| `program.ts` | `generateProgramAction`, `saveProgramAction` | AI training plans |
| `progression.ts` | `getProgressionAction`, `awardGoldAction` | XP/Gold/Level |
| `pvp.ts` | `createSegmentBattleAction` | Segment battles |
| `social.ts` | `followUser`, `getLeaderboard` | Social features |
| `strava.ts` | `getStravaAuthUrlAction`, `disconnectStravaAction` | Strava integration |
| `strength.ts` | `logSetAction`, `getExerciseHistoryAction` | Strength logging |
| `titan.ts` | `getTitanAction`, `awardTitanXpAction` | Titan state |
| `training.ts` | `logTitanSet`, `updateActivePathAction` | Training hub |
| `user.ts` | `updateFactionAction` | User settings |
| `world.ts` | `getWorldStateAction`, `getRegionBossAction` | World map |

---

## 🎮 Game Services

| Service | Purpose |
|:--------|:--------|
| `CombatEngine` | Turn-based combat logic |
| `LootSystem` | Item drop calculations |
| `ProgressionService` | XP/leveling calculations |
| `OracleService` | Daily focus and decree generation |
| `GoalPriorityEngine`| Deterministic periodization & goals |
| `GeminiService` | Conversational FAQ/Narrative flavor |
| `ValhallaService` | Cloud persistence & save states |
| `VisionService` | MediaPipe pose detection engine |
| `NeuroService` | Binaural beat audio engine |
| `BluetoothService` | FTMS/HRM hardware integration |
| `AnalyticsService` | Telemetry & session tracking |

---

## 🪝 Client Hooks

| Hook | Purpose |
|:-----|:--------|
| `useBluetoothPower` | Connects to Smart Trainers (FTMS) |
| `useBluetoothHeartRate` | Connects to HR Monitors (BLE) |
| `useTitanReaction` | Generates innovative Titan dialogue |
| `useLiveCombat` | Manages real-time combat loop |
| `useVoiceCommand` | Voice control (Speech Synthesis/Rec) |
| `useAmbientSound` | Background audio & SFX manager |
| `useSkillEffects` | Visual particle effects system |

---

## 🔐 Auth Flow

1. User lands on `/login`
2. Supabase Auth handles OAuth/Email
3. Callback to `/auth/callback`
4. Session stored in cookies via `@supabase/ssr`
5. Server components read session with `createClient()`

---

## 📊 Key Database Tables

| Table | Purpose |
|:------|:--------|
| `User` | Core user data, stats, settings |
| `Monster` | Boss/enemy definitions |
| `Item` | Equipment definitions |
| `UserEquipment` | User's inventory |
| `PvpProfile` | Competitive rankings |

---

## 🤖 Agent Commands

Run `npm run agent:verify` before marking work complete.
Log workarounds in `DEBT.md`.
