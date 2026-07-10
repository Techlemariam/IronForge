// src/types/combat.ts

import type { ActivityMatch } from './arbiter';
import type { DoctrineProfile } from './doctrine';

export interface CombatSafetyFlags {
  isOvertrained: boolean;
  fatigueDebuffApplied: boolean;
  isCombatLocked: boolean; // True if Oracle recovery health dictates rest
  xpCapReached: boolean;
}

export interface BossDamage {
  bossId: string;
  damageDealt: number;
  isFatalBlow: boolean;
}

export interface GuildContribution {
  guildId: string;
  pointsContributed: number;
  activeRaidParticipation: boolean;
}

export interface LootEligibility {
  lootTableId: string;
  luckMultiplier: number;
  eligibleForDrop: boolean;
}

export interface PvEEffect {
  bossDamage?: BossDamage;
  defenseShieldAdded: number; // Shield point addition based on active recovery
  comebackMultiplierActive: boolean; // Comeback bonuses for returning after fatigue rest
  lootEligibility: LootEligibility[];
}

export interface PvPScore {
  opponentId: string;
  rawScore: number;
  normalizedScore: number; // Adjusted via DoctrineProfile risk/modality multipliers
  planAdherenceRatio: number; // Target vs completed workout adherence (0.0 - 1.0)
  victoryResolved: boolean;
}

export interface CombatInput {
  userId: string;
  activityMatch: ActivityMatch;
  doctrineProfile: DoctrineProfile;
  oracleVerdict: 'TRAIN' | 'REST' | 'LIGHT';
  rewardReason: string; // e.g. "DAILY_QUEST_COMPLETE", "ARENA_DUEL_RESOLVED"
}

export interface CombatEffect {
  id: string;
  userId: string;
  combatInputReferenceId: string;
  xpEarned: number;
  goldEarned: number;
  pve?: PvEEffect;
  pvp?: PvPScore;
  safetyFlags: CombatSafetyFlags;
  appliedAt: Date;
}
