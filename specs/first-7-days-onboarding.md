# 🗺️ Feature Specification: 'First 7 Days' Onboarding Quest

**Author:** `@analyst`
**Date:** 2026-02-28
**Status:** DRAFT (Ready for `@architect`)
**Epic:** User Acquisition & Retention (Season 2)

## 📌 Executive Summary

IronForge suffers from an "Overwhelming Onboarding" gap where new users are dropped into a data-heavy RPG environment. The 'First 7 Days' Onboarding Quest replaces the generic start with a guided, heavily narrative-driven 7-day path. It introduces the user to the core loops (Loot, Skills, Oracle) sequentially, ensuring high retention through forced early victories and clear goals.

---

## 📖 User Stories (INVEST)

### 1. The Welcome Directive (Day 1)

**As a** New User
**I want to** be greeted by a specific "Quest UI" rather than an empty dashboard on my first day
**So that** I know exactly what my immediate first step is (e.g., Log a 15-minute walk).

### 2. Drip-Fed Mechanics (Day 2-6)

**As a** Novice Titan
**I want to** unlock tabs (Loot, Skill Tree, Guilds) one by one on successive days after completing daily assignments
**So that** I am not overwhelmed by complex RPG menus before I understand the core workout loop.

### 3. Guaranteed Early Rewards

**As a** Novice Titan
**I want to** receive a guaranteed Epic 'Welcome Boss' loot drop on Day 3
**So that** I experience the dopamine surge of a high-tier reward early, hooking me into the system before the RNG tables normalize.

### 4. Guided Jargon Breakdown

**As a** Fitness Beginner
**I want to** have an interactive "Oracle Tutorial" that explicitly explains IronForge jargon (e.g., "What is Wilks?", "What is Power Rating?") contextually during my first week
**So that** I do not feel alienated by the language used in the app.

---

## ✅ Acceptance Criteria (Gherkin)

### Scenario 1: Initializing the 7-Day Protocol

- **Given** I am a newly registered User with `loginStreak` = 0
- **When** I land on the `/dashboard`
- **Then** I am automatically redirected to `/onboarding/quest`
- **And** all navbar links except "Profile" and "Today's Quest" are locked (greyed out).

### Scenario 2: Unlocking the Loot System (Day 2)

- **Given** I am on Day 2 of my account creation
- **And** I successfully completed the Day 1 workout quota
- **When** I log in
- **Then** the "Inventory" tab becomes visually unlocked with a celebratory animation
- **And** I am granted 500 Beginner Gold to spend in the Shop.

### Scenario 3: The Day 3 Fixed Drop

- **Given** I have reached Day 3 of the Onboarding Quest
- **When** I complete the required "Prove Your Strength" workout
- **Then** the Loot Service bypasses the dynamic probability table
- **And** forcefully awards me `item_welcome_sword` (Epic Rarity)
- **And** I receive a push notification celebrating the legendary find.

### Scenario 4: Graduation (Day 7)

- **Given** I have completed all 7 days of the Onboarding Quest
- **When** I submit the final required workout log
- **Then** the onboarding lock is permanently removed from my `UserSettings`
- **And** I am granted the title "Initiate of the Forge"
- **And** all core IronForge loops (Dynamic XP, RNG Loot) return to normal production behavior for my account.

---

## 🛠️ Technical Notes & Architecture Implications

### Dependencies & Setup

- Requires a new state array in `User.preferences` or a dedicated `OnboardingState` table to track the exact index of the 7-day flow.
- Requires a middleware or layout-level check to redirect users dynamically based on this state.

### Identified Risks

- **Alienating Experienced Athletes:** A powerlifter migrating to the app does not want to be restricted from using advanced tools (1RM calculators) for 7 days.
  - *Mitigation:* Include a "Skip Onboarding (Veteran)" button on Day 1 that immediately unlocks all UI tabs, but permanently voids the free Day 3 Epic Loot Drop to prevent exploitation.
- **Lost Streaks during Onboarding:** If a user misses Day 4, do they fail onboarding?
  - *Mitigation:* The "7 Days" should represent 7 *Workout Days*, not 7 chronological calendar days. If they break a streak, apply the normal mood penalty, but do not eject them from the tutorial.
