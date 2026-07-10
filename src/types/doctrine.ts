// src/types/doctrine.ts

export type DoctrineType = 'SUSTAINABLE' | 'PERFORMANCE' | 'HERO' | 'COACH' | 'CUSTOM';

export type CoachingExplanationStyle = 'CONCISE' | 'DETAILED' | 'GAMIFIED' | 'COMPASSIONATE' | 'DIRECT';

export interface SafetyOverrideRules {
  allowManualOverride: boolean;
  minHrvThreshold?: number; // Absolute safety lock if HRV drops below this value
  maxRhrThreshold?: number; // Absolute safety lock if RHR goes above this value
  requireJustification: boolean;
}

export interface DoctrineProfile {
  id: string;
  userId: string;
  type: DoctrineType;
  riskTolerance: number; // 0 to 100
  primaryGoal: string; // e.g. "Longevity", "Strength Taper", "Hypertrophy"
  recoveryStrictness: number; // 0 to 100
  rpgIntensityPreference: 'LOW' | 'MEDIUM' | 'HIGH';
  coachingStyle: CoachingExplanationStyle;
  competitionPreference: boolean; // Prefer active PvP leagues or standalone PvE
  safetyOverrides: SafetyOverrideRules;
  createdAt: Date;
  updatedAt: Date;
}
