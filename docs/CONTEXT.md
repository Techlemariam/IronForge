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

| Action | File | Purpose |
|:-------|:-----|:--------|
| `startBossFight` | `actions/combat.ts` | Initialize combat session |
| `performCombatAction` | `actions/combat.ts` | Process combat turn |
| `craftItem` | `actions/inventory.ts` | Craft equipment |
| `getInventory` | `actions/inventory.ts` | Fetch user items |

---

## 🎮 Game Services

| Service | Purpose |
|:--------|:--------|
| `CombatEngine` | Turn-based combat logic |
| `LootSystem` | Item drop calculations |
| `ProgressionService` | XP/leveling calculations |
| `OracleService` | AI coaching recommendations |

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
