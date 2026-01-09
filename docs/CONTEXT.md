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

| Path | Key Files | Purpose |
|:-----|:----------|:--------|
| `src/actions/combat/` | `core.ts`, `boss.ts` | Turn-based combat & boss logic |
| `src/actions/economy/` | `forge.ts`, `shop.ts`, `crafting.ts` | Crafting, trading, and inventory |
| `src/actions/training/`| `strength.ts`, `program.ts` | Training logging and AI Planning |
| `src/actions/guild/` | `core.ts`, `raids.ts` | Guild management and raiding |
| `src/actions/user/` | `account.ts`, `profile.ts` | User settings and data |
| `src/actions/social/` | `friends.ts`, `leaderboard.ts` | Social features |
| `src/actions/pvp/` | `duels.ts`, `matchmaking.ts` | PvP logic |

---

## 🎮 Game Services

| Service | Purpose |
|:--------|:--------|
| `GoalPriorityEngine`| **Core Brain.** Deterministic periodization & goals |
| `CombatEngine` | Turn-based combat logic |
| `LootSystem` | Item drop calculations |
| `ProgressionService` | XP/leveling calculations |
| `OracleService` | Daily decrees & bio-feedback interpretation |
| `WardensService` | Gap resolution & corrective exercises |
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
