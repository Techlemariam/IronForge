# 🏗️ Refactoring Plan: Vertical Slicing Migration

This plan moves domain logic from generic folders (`components`, `hooks`) to the `features` directory to enforce the **Vertical Slicing** architecture.

## 🎯 Objective
Reduce cognitive load and improve maintainability by co-locating code related to the same feature.

## 🚀 Migration Strategy

### 1. `src/hooks` Consolidation
Move domain-specific hooks to their respective features.

| Hook | Target Destination |
| :--- | :--- |
| `useAchievements.ts` | `src/features/gamification/hooks/` |
| `useBluetooth*.ts` | `src/features/bio/hooks/` |
| `useGuildContribution.ts` | `src/features/guild/hooks/` |
| `useLiveCombat.ts` | `src/features/combat/hooks/` |
| `useOnboardingTour.ts` | `src/features/onboarding/hooks/` |
| `usePodcastPlayer.ts` | `src/features/podcast/hooks/` |
| `usePushNotifications.ts` | `src/features/oracle/hooks/` |
| `useSkillEffects.ts` | `src/features/game/hooks/` |

### 2. `src/components` Cleanup (The Big Move)
Move domain components to `src/features/[domain]/components`.

#### ⚔️ Game & Combat
| File | Target |
| :--- | :--- |
| `ActionView.tsx` | `features/game/components/ActionView.tsx` |
| `AttributeRadar.tsx` | `features/titan/components/AttributeRadar.tsx` |
| `AvatarViewer.tsx` | `features/titan/components/AvatarViewer.tsx` |
| `DungeonBuilder.tsx` | `features/game/components/DungeonBuilder.tsx` |
| `QuestLog.tsx` | `features/game/components/QuestLog.tsx` |
| `TitanXPBar.tsx` | `features/titan/components/TitanXPBar.tsx` |
| `ValhallaGate.tsx` | `features/game/components/ValhallaGate.tsx` |
| `TransitionView.tsx` | `features/game/components/TransitionView.tsx` |

#### 🏋️ Training & Equipment
| File | Target |
| :--- | :--- |
| `EquipmentArmory.tsx` | `features/strength/components/EquipmentArmory.tsx` |
| `ExerciseLibrary.tsx` | `features/strength/components/ExerciseLibrary.tsx` |
| `HevyImportWizard.tsx` | `features/training/components/HevyImportWizard.tsx` |
| `PlateVisualizer.tsx` | `features/strength/components/PlateVisualizer.tsx` |
| `PreWorkoutCheck.tsx` | `features/training/components/PreWorkoutCheck.tsx` |
| `ProgramGenerator.tsx` | `features/training/components/ProgramGenerator.tsx` |
| `GeminiLiveCoach.tsx` | `features/training/components/GeminiLiveCoach.tsx` |
| `VisionRepCounter.tsx` | `features/training/components/VisionRepCounter.tsx` |

#### 🔮 Oracle & AI
| File | Target |
| :--- | :--- |
| `ActiveDecree.tsx` | `features/oracle/components/ActiveDecree.tsx` |
| `OracleChat.tsx` | `features/oracle/components/OracleChat.tsx` |
| `OracleVerdict.tsx` | `features/oracle/components/OracleVerdict.tsx` |
| `UltrathinkDashboard.tsx`| `features/dashboard/components/UltrathinkDashboard.tsx` |

#### 🩺 Bio & Health
| File | Target |
| :--- | :--- |
| `HeartRateMonitor.tsx` | `features/bio/components/HeartRateMonitor.tsx` |
| `HeartRateZoneChart.tsx` | `features/bio/components/HeartRateZoneChart.tsx` |

### 3. Folder Merges
The following folders in `src/components` duplicate `src/features`:
- `armory` -> `features/strength/components/armory`
- `battle-pass` -> `features/gamification/components/battle-pass`
- `bestiary` -> `features/game/components/bestiary`
- `campaign` -> `features/game/components/campaign`
- `colosseum` -> `features/pvp/components/colosseum`
- `duel` -> `features/pvp/components/duel`
- `onboarding` -> `features/onboarding/components`
- `oracle` -> `features/oracle/components`
- `settings` -> `features/settings/components`
- `social` -> `features/social/components`
- `strava` -> `features/training/components/strava`

## ⚠️ Risk & Mitigation
*   **Imports:** Many imports will break.
*   **Mitigation:** I will use a script or rigorous manual check to update imports after moving.
*   **Verification:** `npm run build` will be my primary feedback loop.

## 📝 Action Plan
1.  **Approve:** User approves this plan.
2.  **Move (Batch 1):** Move independent files (Training/Bio/Oracle). Update imports. Verify.
3.  **Move (Batch 2):** Move complex folders (Game/PVP). Update imports. Verify.
4.  **Finalize:** Delete empty folders in `src/components` and `src/hooks`.

## ✅ Status
- [x] Batch 1 Completed (Training, Bio, Oracle Files)
- [x] Batch 2 Completed (Game Core, Folder merges)
- [x] Import Correction Completed (Verified via `npm run build`)
- [x] Cleanup of empty source folders in `src/components`
- [x] Unit Tests Verified (All 60+ tests passing)

**Outcome:** Refactoring Successful. Codebase is now strictly vertically sliced.

