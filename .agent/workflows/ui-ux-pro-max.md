---
description: "Generates Titan-Tier UI/UX designs with radical aesthetics."
---

# 🎨 UI/UX Pro Max (Titan Edition)

> **Philosophy:** "Good is the enemy of Great. We don't build UIs; we build Digital Artifacts."

## 1. 🧠 Intent Analysis

**Input:** User request + Current Screen Context
**Action:** Identify the *emotional goal* of the component (e.g., "Intimidating Leaderboard", "Serene Recovery", "Visceral Combat").

## 2. 🎨 Aesthetic Injection (The "Pro Max" Step)

Select ONE dominant aesthetic based on intent:

### A. **Cyber-Physical (Default)**

* **Vibe:** High-tech gym equipment, carbon fiber, brushed metal.
* **Tokens:** `bg-slate-950`, `border-slate-800`, `text-emerald-400`.
* **Effects:** Subtle noise textures, mechanical transitions.

### B. **Neon-Noir (Night Shift)**

* **Vibe:** Late-night coding/training, high contrast.
* **Tokens:** `bg-black`, `ring-neon-purple`, `shadow-glow`.
* **Effects:** Glassmorphism, blurred backdrops.

### C. **Titan-Clean (Data Dense)**

* **Vibe:** Strava meets Bloomberg Terminal.
* **Tokens:** `bg-white/zinc-50`, `text-slate-900`, `font-mono`.
* **Effects:** Crisp borders, zero shadows, maximum information density.

## 3. 🛠️ Component Construction

**Strict Rules:**

1. **Mobile-First:** Start with `w-full` and `flex-col`.
2. **Motion:** Every interaction must have feedback (`active:scale-95`, `transition-all`).
3. **Shadcn:** Use existing primitives but *heavily* styled via `className`.
4. **Accessibility:** `aria-label` is mandatory.

## 4. 📝 Output Format

Provide the code in a single generic artifact, wrapped in a `Carousel` if showing multiple variants.

```tsx
// @/components/features/titan/TitanCard.tsx
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
// ... implementation
```

## 5. 🔍 Self-Correction

* "Does this look like a Bootstrap site?" -> **Restart & Radicalize.**
* "Is the contrast accessible?" -> **Verify WCAG AA.**
* "Is it mobile responsive?" -> **Check grouping.**
