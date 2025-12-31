# ⚔️ Project: Iron Logger (The Titan Killer)

> "Hevy is a log. Iron Logger is a Weapon."

## 🎯 The Vision
To build a workout tracker so fast, so rewarding, and so integrated that using Hevy feels like using a paper notebook. We don't just "log" weights; we **transmute suffering into digital power**.

## 🧬 Core Differentiators (The "Why")

### 1. ⚡ Ludicrous Speed (The "Flow" State)
**Problem:** Most apps require too many taps. Unlock phone -> Open App -> Find Workout -> Find Exercise -> Tap Input -> Type Weight -> Type Reps -> Save.
**Solution:**
*   **Predictive Loading:** "It's Monday, 5 PM. You usually do Push Day." The app opens *directly* to your next expected set.
*   **One-Handed Mode:** All inputs reachable with a thumb. Large tap zones.
*   **Voice/Haptic Command:** "Next set, same weight."

### 2. 🎮 Deep Gamification (The "Hook")
**Problem:** Hevy gives you a confetti animation. Boring.
**Solution:**
*   **Real-Time Boss Damage:** Every rep deals damage to the active Raid Boss. You see the HP bar drop *as you lift*.
*   **Loot Drops:** Finish a PR set? A legendary item might drop instantly.
*   **Kinetic Energy:** The currency of effort. Earned per kg lifted.

### 3. 🧠 Smart Coaching (The "Brain")
**Problem:** Hevy tells you what you did. It doesn't tell you what to do.
**Solution:**
*   **Auto-Regulation (RPE):** "Your last set was RPE 9. Drop weight by 5% for the next set."
*   **Plate Calculator built-in:** Don't do math. See exactly which plates to load.
*   **Warm-up Sets:** Auto-calculate warm-up ramps based on your working weight.

## 🛠 Feature Specifications

### Phase 1: The Foundation (Speed)
*   [ ] **The "Always-On" Session:** No "Start Workout" button. Just start logging.
*   [ ] **Smart History:** Previous weight/reps auto-filled as ghost text.
*   [ ] **Plate Visualizer:** Visual representation of the bar.
*   [ ] **Rest Timer**: Auto-starts on set completion. Floating overlay (PiP) if you leave the app.

### Phase 2: The Game (Engagement)
*   [ ] **Active Encounter:** The Raid Boss is visible *during* the workout.
*   [ ] **Combo Meter:** Maintain a consistent rest time to build a "Combo Multiplier" for XP.
*   [ ] **Party Mode:** See your guildmates lifting in real-time. "Player X just crit on Bench Press!"

### Phase 3: The Coach (Intelligence)
*   [ ] **1RM Projector:** "You need 5 reps at 100kg to beat your PR."
*   [ ] **Volume Tracking:** Live chart showing volume load vs. last week.
*   [ ] **Injury Prevention:** "You've done heavy shoulders 2 days in a row. Suggest swapping OHP for Lateral Raises."

## 📱 UX/UI Experience (The "Feel")
*   **Theme:** Dark, high contrast (OLED Black + Magma Orange).
*   **Typography:** Large, tabular numbers (Monospace).
*   **Feedback:** Heavy use of haptics. A "thud" when you lock in a set.

## 🏗 Technical Architecture
*   **State:** Local-First (Zustand + IndexedDB). Works 100% offline. Syncs when online.
*   **Performance:** ZERO layout shifts. Instant interactions.
*   **Charts:** 60fps WebGL graphs for volume/strength analysis.
