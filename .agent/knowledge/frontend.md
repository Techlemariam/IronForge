# Domain: Frontend 🎨

## Purpose

Owns all client-side UI, design system, components, pages, routing, animations, and user-facing interactions for the IronForge RPG.

---

## Stack

| Layer | Technology | Version | Notes |
|:---|:---|:---|:---|
| Framework | Next.js (App Router) | latest | RSC + Server Actions |
| Styling | Tailwind CSS | v4.1+ | `@import "tailwindcss"` / `@theme` syntax |
| Animation | Framer Motion | latest | `LazyMotion` (tree-shakes ~30 kb) |
| UI Primitives | Shadcn-style (`src/components/ui/`) | custom | `cn()` via clsx + tailwind-merge |
| Storybook | v10.2+ | `@storybook/nextjs-vite` | Port 6006 |
| Fonts | Inter (body), Cinzel (serif headings), JetBrains Mono (data) | Google Fonts | Loaded via `next/font/google` |
| Package Manager | pnpm | — | **Never npm/yarn** |

---

## Design System — "The Chromatic Lattice"

### Color Tokens (defined in `globals.css` `@theme`)

| Token | Hex | Semantic Use |
|:---|:---|:---|
| `void` | `#030712` | Deep space background |
| `armor` | `#111827` | Card / surface |
| `steel` | `#374151` | Borders / structural |
| `plasma` | `#f97316` | Primary action / Legendary |
| `pulse` | `#0ea5e9` | Data / Rare |
| `venom` | `#22c55e` | Restoration / Set Item |
| `crisis` | `#ef4444` | Failure / Cursed |
| `gold` | `#eab308` | Artifact / Warden |
| `cyan` | `#06b6d4` | Pathfinder |
| `clay` | `#c79c6e` | Classic UI / Parchment |
| `warp` | `#a335ee` | Epic (Purple) |
| `legend` | `#ff8000` | Solar / Legendary (Orange) |

### Item Rarity Protocol (WoW-Inspired)

- `uncommon` → `#1eff00` (Green)
- `rare` → `#0070dd` (Blue)
- `gold-bright` → `#ffd700` (Highlight)
- `gold-dark` → `#b8860b` (Muted)

### Typography

- Headings: `font-mono font-bold tracking-tighter uppercase` + text-shadow
- Data: `tabular-nums`, `-0.05em` letter-spacing
- Radius: `0rem` (hard corners — mechanical aesthetic)

### Utility Classes

| Class | Purpose |
|:---|:---|
| `.text-glow-emerald` | Emerald text glow |
| `.mechanical-panel` | Dark panel with noise overlay |
| `.carbon-fiber` | Carbon fiber background pattern |
| `.bg-noise` | SVG fractal noise overlay |
| `.scanline-overlay` | Fixed scanline CRT effect |

### Animation Tokens

| Token | Description |
|:---|:---|
| `--animate-deploy` | Entry animation (fade + slide up) |
| `--animate-pulse-mech` | Stepped opacity pulse |
| `--animate-scanline` | Vertical scanline sweep |
| `--ease-bolt-action` | Mechanical lock easing |
| `--ease-recoil` | Bounce-back easing |

---

## Component Architecture

### `src/components/ui/` — Shadcn-style primitives
Alert, Avatar, Badge, Button, Card, Dialog, Input, Label, Popover, Progress, ScrollArea, Select, Slider, Tabs, Textarea, Toggle, Skeleton.

Plus IronForge-specific UI:
- `GameToast` — in-game notification toast (mounted globally in root layout)
- `ForgeInput` — themed input field
- `HintTooltip` / `JargonTooltip` / `TutorialTooltip` — contextual help
- `LoadingSpinner` — mechanical spinner
- `NotificationBell` — notification system
- `PRBadge` / `PRCelebration` — personal records
- `PwaInstallBanner` — PWA install prompt
- `QuestBadge` / `ShimmerBadge` — quest & rarity badges
- `DemoVideoModal` — video demonstrations

### `src/components/core/` — Persistent layout
- `PersistentHeader.tsx` — always-visible header

### `src/components/layout/`
- `QuickStatsHeader.tsx` — quick-glance stats

### `src/components/game/` — Game-specific UI
Arena, BerserkerMode, Bestiary, Grimoire, InventoryList, LootDrop, LootReveal, Marketplace, ProgressBar, SkillTreeLegacy, Stopwatch, TierBadge, Weakness_Radar, WorldMap.
Sub-modules: `dungeon/`, `pvp/`, `territory/`.

### `src/components/dashboard/`
- `BioStatusWidget.tsx` — bio integration status

### Other component directories
`charts/`, `factory/`, `gamification/`, `logger/`, `marketing/`, `mobility/`, `tv/`, `workout/`

---

## Routing (Next.js App Router)

### Route Groups
| Group | Purpose |
|:---|:---|
| `(authenticated)` | Auth-gated pages |
| `(main)` | Main application shell |
| `(marketing)` | Public marketing pages |

### Top-level routes
`admin/`, `api/`, `auth/`, `battle-pass/`, `campaign/`, `factory/`, `grimoire/`, `iron-arena/`, `logger/`, `login/`, `login-neon/`, `privacy/`, `ranked-arena/`, `settings/`, `welcome/`

### Root layout
- Wraps children in `AnimationProvider` (Framer Motion `LazyMotion`)
- Renders `GameToaster` globally
- Applies `Inter`, `Cinzel`, `JetBrains Mono` fonts

---

## Feature Modules (`src/features/`)

auth, bio, combat, companion, coop, dashboard, game, gamification, guild, leaderboard, neural-lattice, onboarding, oracle, podcast, pvp, settings, social, strength, territories, territory, titan, training

---

## Providers & Context

| File | Purpose |
|:---|:---|
| `AnimationProvider.tsx` | Framer Motion `LazyMotion` with `domMax` |
| `AchievementContext.tsx` | Achievement state |
| `SkillContext.tsx` | Skill tree state (14 KB — significant logic) |

---

## Custom Hooks (`src/hooks/`)

| Hook | Purpose |
|:---|:---|
| `useTheme` | Theme management |
| `useReducedMotion` | a11y: respects prefers-reduced-motion |
| `useKeyboardShortcuts` | Global keyboard shortcuts |
| `useGestureNavigation` | Touch/swipe navigation |
| `useVoiceCommand(s)` | Voice input |
| `useOfflineMode` | Offline/PWA support |
| `useNetworkStatus` | Connection detection |
| `usePwaInstall` | PWA install flow |
| `usePlatformContext` | Device/platform detection |
| `useAmbientSound` | Audio atmosphere |
| `useSoundProtocol` | Sound effect system |
| `useCelebration` | Achievement celebrations |
| `useCountUp` | Number animation |
| `useHaptic` | Vibration feedback |
| `useRestTimer` | Workout rest timer |
| `useMaxReps` | Rep tracking |
| `useUser` | User state |
| `use-toast` | Toast notifications |
| `useWeatherEffects` | Dynamic weather visuals |

---

## State Management

- `src/stores/auditorStore.ts` — Zustand-style store
- `src/context/` — React Context for local state (Achievements, Skills)

---

## Utilities

- `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge), `formatQuestType()`
- `src/lib/mock-data.ts` — Development mock data

---

## Key Conventions

1. **Styling**: Tailwind v4 with custom design tokens. Always use `cn()` for conditional classes.
2. **Components**: Shadcn-inspired primitives in `ui/`. Game-specific in `game/`. Feature-scoped in `features/`.
3. **Animations**: Always use Framer Motion via `AnimationProvider`. Respect `useReducedMotion`.
4. **Storybook**: Every `ui/` component should have a `.stories.tsx` file.
5. **Hard corners**: `border-radius: 0` — the "Mechanical" aesthetic.
6. **Fonts**: Never use browser defaults. Always `Inter`/`Cinzel`/`JetBrains Mono`.
7. **PWA**: Offline support is first-class. Use `useOfflineMode` and service worker (`sw.ts`).
8. **Multi-platform**: Support desktop, mobile, and TV mode (see `components/tv/`).

---

*Generated by Antigravity — Domain Session (frontend)*
