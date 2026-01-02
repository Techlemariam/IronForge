# Archetype Data Sync Update - Implementation Artifact

## 🎯 Objective
Synchronize the data layers related to the Archetype system, ensuring the `Archetype` enum (`JUGGERNAUT`, `PATHFINDER`, `WARDEN`) is consistently used across the codebase, replacing deprecated `TrainingPath` values.

## 🏗️ Architectural Changes

### 1. Data Layer Alignment (Single Source of Truth)
- **Problem**: `muscleMap.ts` (used for Auditing) had hardcoded "RP Standards" for volume landmarks, while `builds.ts` (used for Game Mechanics) had its own "Game Balanced" landmarks.
- **Solution**: `muscleMap.ts` now imports `VOLUME_LANDMARKS` from `builds.ts`. This ensures that if game balance changes (e.g., reducing chest volume for Wardens), the audit system automatically reflects this.
- **Files Modified**:
  - `src/data/muscleMap.ts`: Updated `rpStandards` to reference `VOLUME_LANDMARKS`.

### 2. Titan Identity & UX
- **Problem**: Users could not easily view or change their Archetype (Combat Profile).
- **Solution**: Introduced `ArchetypeSelector` in the Settings page. This component provides a visual selection UI with descriptions and icons for each path.
- **Files Created/Modified**:
  - `src/components/settings/ArchetypeSelector.tsx` (New Component)
  - `src/features/settings/SettingsPage.tsx` (Integrated Selector)
  - `src/app/(authenticated)/settings/page.tsx` (Fetches Archetype from DB)
  - `src/actions/user.ts` (Added `updateArchetypeAction`)

### 3. Buff Visualization
- **Problem**: "TitanLoad" calculation included a multiplier (e.g., from excessive strength training or buffs), but this was hidden from the user.
- **Solution**: Updated `TitanLoadCalculation` to return the `appliedMultiplier` and added a visual "Buff Active" indicator in the `UltrathinkDashboard`.
- **Files Modified**:
  - `src/types/index.ts`: Added `appliedMultiplier` to `TitanLoadCalculation`.
  - `src/services/analytics.ts`: Returned multiplier in calculation.
  - `src/components/UltrathinkDashboard.tsx`: Added visual pulse indicator.

### 4. Deprecation Cleanup
- **Problem**: References to legacy paths `ENGINE`, `TITAN`, `HYBRID_WARDEN` persisted in `workouts.ts`.
- **Solution**: Bulk replaced with `PATHFINDER`, `JUGGERNAUT`, `WARDEN`.
- **Files Modified**:
  - `src/data/workouts.ts`

## 🧪 Verification
- **Build Status**: `npm run build` executed to verify type safety of new Enum usages.
- **Logic Check**: `muscleMap` properly maps string keys ("Chest") to Enum keys ("CHEST") from `builds.ts`.

## ⏭️ Next Steps
- **IronLogger**: Deep dive into logging mechanics if "Archetype Awareness" is needed in historical logs.
- **E2E Testing**: Add a test case for switching Archetype and verifying the Dashboard updates.
