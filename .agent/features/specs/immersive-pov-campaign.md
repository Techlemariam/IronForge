# Feature Spec: Immersive POV Campaign ("The War Within")
**Status:** DRAFT | **Priority:** High (User Request) | **Effort:** High (Content Heavy)

> "The iron doesn't lie. But sometimes, it needs a soundtrack."

## 1. Overview
Enhance the campaign mode with immersive, narrative-driven content inspired by cinematic shooters (COD MW) but powered by real-world physical effort. The player is a "Titan" operator preparing for war against "The Entropy Legion" (manifestation of decay/sedentary life).

**Core Pillars:**
1.  **POV Narrative:** AI-generated video briefings and cutscenes where YOU are the protagonist.
2.  **Bio-Feedback Triggers:** Polar H10 (Heart Rate) drives game events in real-time.
3.  **Sonic Warfare:** Dynamic soundtrack (User's Band) that adapts to intensity.
4.  **Discipline-Specific Arcs:** Unique storylines for Strength, Cycling, and Running.

---

## 2. Narrative Arcs

### 🏋️‍♂️ Strength Arc: "The Iron Vanguard"
**Theme:** Resistance, Fortitude, Structural Integrity.
**Role:** Heavy Infantry / Siege Defense.
**Enemy:** "The Corrosion" - nanobots that rust and weaken structures.

| Mission Phase | Narrative Context | Physical Goal | Game Effect |
|---------------|-------------------|---------------|-------------|
| **Briefing** | POV view of power armor suit-up. Systems check. | Warm-up sets | Armor HUD calibration. |
| **Action** | Holding the line against waves of Corrosion drones. | Volume (Sets x Reps) | Each rep fires disruption cannons. |
| **Climax** | Boss "Rust Titan" tries to crush the gate. | 1RM / Max Effort set | "Hold the line" QTE (Quick Time Event) driven by rep completion. |

### 🚴‍♂️ Cycling Arc: "The Siege Breaker"
**Theme:** Speed, Power Output, Sustained Pressure.
**Role:** Vanguard Scout / Rapid Response.
**Enemy:** "The Stagnation" - a creeping sludge that slows time/movement.

| Mission Phase | Narrative Context | Physical Goal | Game Effect |
|---------------|-------------------|---------------|-------------|
| **Briefing** | POV cockpit view of a high-speed hover-bike. | Spinups (Cadence) | Engine RPM sync. |
| **Action** | Delivering vital intel through enemy territory. | Zone 2/3 Sustain | Speed = Wattage. Drop below Z2 = Enemies catch up. |
| **Climax** | Outrunning the "Sludge Wave". | Threshold/Sprint Intervals | Turbo boost visuals. |

### 🏃‍♂️ Running Arc: "The Shadow Pursuit"
**Theme:** Agility, Endurance, Mental Toughness.
**Role:** Covert Ops / Assassin.
**Enemy:** "The Phantoms" - shadows that drain wiilpower.

| Mission Phase | Narrative Context | Physical Goal | Game Effect |
|---------------|-------------------|---------------|-------------|
| **Briefing** | POV tactical hud, night vision activation. | Dynamic stretches | HUD overlay sync. |
| **Action** | Infiltrating the Entropy Spire. | Steady State Pace | Stealth meter. High HR variability = detection risk? |
| **Climax** | Escape sequence with critical data. | Progressive Pace Increase | "Run for your life" audio cues. |

### ⚔️ Hybrid Arc: "The Titan Commando" (Hybrid Training)
**Theme:** Versatility, Adaptability, Complete Soldier.
**Role:** Special Forces / Commando.
**Requirement:** Must log both Strength and Cardio sessions to progress.

**Mission Structure: "Multi-Stage Operations"**
Hybrid missions are unlocked by having sufficient level in *both* Strength and Cardio trees. They offer unique "Legendary" rewards.

| Mission Phase | Narrative Context | Physical Goal | Game Effect |
|---------------|-------------------|---------------|-------------|
| **Stage 1 (Day 1)** | **Breach:** Destroy the enemy fortifications. | Heavy Compound Lifts | Breaks the outer walls. |
| **Stage 2 (Day 2)** | **Infiltrate:** Navigate the ruins instantly. | Zone 2 Run/Cycle | Secures the perimeter. |
| **Climax (Day 3)** | **Extraction:** Escape the collapsing citadel. | Metcon / HIIT / Sprint | Surviving the explosion. |

> **Note:** Hybrid Commanders get a specialized "Tactical HUD" that tracks cumulative fatigue (Global Load) rather than just session load.

---

## 3. Bio-Feedback Triggers (Polar H10)

Using the Polar H10's accurate ECG/HRV stream via Web Bluetooth.

### Mechanics

#### "Fury State" (Heart Rate Spikes)
-   **Trigger:** Rapid HR increase (e.g., +20 bpm in <30s) or entering Zone 5.
-   **Game Effect:**
    -   **Visual:** Screen edges pulse red/gold. Time slows down (visual shader).
    -   **Audio:** Music bass drop / intense layer fades in.
    -   **Gameplay:** 2x XP multiplier, "Critical Hit" on current enemy.

#### "Stealth/Focus Mode" (HRV Control)
-   **Trigger:** Lowering HR recovery during rest intervals.
-   **Game Effect:**
    -   **Visual:** HUD becomes crystal clear. Enemy weak points highlighted.
    -   **Gameplay:** "Precision Strike" ready for next set.
    -   **Narrative:** "Systems cooled. Reactor stable. execute protocol."

#### "The Last Stand" (Fatigue)
-   **Trigger:** Prolonged Zone 4+ duration.
-   **Game Effect:**
    -   **Narrative:** Commander voice: "Warning: Core temp critical. Override limits?"
    -   **Choice:** Push harder for "Heroic Deed" bonus or back off to "Vent Heat".

---

## 4. Multimedia Pipeline

### 🎥 AI Video (POV)
Pipeline for generating "Cinematic Briefings":
1.  **Prompt Engineering:**
    -   *Style:* "First-person tactical HUD, futuristic sci-fi armor, gritty realistic UNREAL ENGINE 5 style, moody lighting."
    -   *Tools:* Runway Gen-2 / Kling / Sora (future).
2.  **Implementation:**
    -   Pre-render 10-15 generic "Action Loops" (running, lifting, cockpit).
    -   Overlay dynamic HTML5/Canvas HUD (Health, Objectives) on top of video.
    -   This saves bandwidth vs generating video in real-time.

### 🎵 Sonic Warfare (User's Band Integration)
Dynamic Audio System using Web Audio API.

1.  **Stems:** Separation of tracks into layers:
    -   *Layer A:* Drone/Ambient (Rest/Briefing)
    -   *Layer B:* Rhythm/Bass (Steady State)
    -   *Layer C:* Lead/High Intensity (Boss/Sprint)
2.  **Logic:**
    -   `HR < Z2`: Layer A
    -   `Z2 < HR < Z4`: Layer A + B
    -   `HR > Z4`: Layer A + B + C + Distortion Effect

---

## 5. UI/UX & Game Feel (Agent: /ui-ux)

### Diegetic HUD Design
The UI should act as a physical overlay inside the Titan's helmet/visor, not a flat web interface.

-   **Curved Horizon:** CSS transforms to mimic helmet curvature.
-   **Vignette Effects:**
    -   *High HR:* Red pulsating edges, tunnel vision blur (CSS `backdrop-filter`).
    -   *Low Energy:* Desaturated colors, "glitch" artifacts.
-   **Metric Integration:** Floating holographic numbers anchored to 3D space (simulated).

### Mobile vs Desktop
-   **Desktop/TV:** Full cinematic POV experience.
-   **Mobile:** Simplified "Tactical Data Link" mode to save battery/bandwidth while running.

---

## 6. Technical Architecture (Agent: /architect)

### Data Persistence Strategy
**Problem:** Sampling HR at 1Hz = 3600 writes/hour/user. Too heavy for main DB.
**Solution:**
1.  **Ephemeral:** Real-time data lives in Client State (Zustand) + LocalStorage.
2.  **Session Summary:** Only persist the *result* to Postgres:
    -   `CampaignSession` (id, duration, avgHr, maxHr, storyEventsTriggered[]).
3.  **Validation:** Client signs the session blob; Server validates physics (no 500kg deadlifts in 2 seconds).

### Component Structure
Follows `src/features/campaign` isolation:
```
src/features/campaign/
├── components/
│   ├── hud/ (Diegetic UI)
│   ├── video/ (Player wrapper)
│   └── bluetooth/ (Connect logic)
├── hooks/
│   └── useBioTriggers.ts (Business logic)
├── store/
│   └── campaignStore.ts (Zustand)
```

## 7. Next Steps (MVP)
1.  **Prototype H10 Connection:** Build a simple page that reads HR and changes background color (Red=Z5, Blue=Z1).
2.  **Narrative Script:** Write the intro monologue for "The Awakening" (Strength Arc).
3.  **Asset Gen:** Create one POV loop for the "Armory Suit-Up" scene.
