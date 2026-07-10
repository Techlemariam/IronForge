// src/types/arbiter.ts

export type ActivityModality = 'STRENGTH' | 'CYCLING' | 'RUNNING' | 'SWIMMING' | 'WALKING' | 'MOBILITY' | 'CARDIO_OTHER';

export type MatchDecision = 
  | 'ACCEPTED' 
  | 'PARTIAL' 
  | 'NEEDS_CONFIRMATION' 
  | 'REJECTED' 
  | 'UNSAFE_MISMATCH';

export interface ExpectedOutcome {
  modality: ActivityModality;
  targetDurationMinutes?: number;
  targetDistanceMeter?: number;
  targetVolumeSets?: number;
  targetRpe?: number; // Rate of Perceived Exertion (1-10)
  targetHeartRateZone?: number; // Target zone (e.g. Zone 2)
  exerciseNameFilter?: string[]; // Expected exercise names for strength
  isBossClearRequired: boolean;
}

export type EvidenceSourceType = 'IN_APP' | 'INTERVALS' | 'GARMIN' | 'HEVY' | 'ZWIFT' | 'MANUAL';

export interface ActivityEvidence {
  id: string;
  source: EvidenceSourceType;
  modality: ActivityModality;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  distanceMeter?: number;
  avgHeartRate?: number;
  peakHeartRate?: number;
  volumeSets?: number;
  loggedSets?: {
    exerciseName: string;
    reps: number;
    weightKg: number;
    rpe?: number;
  }[];
  rawPayloadReference?: string; // Reference key to raw data dump
}

export interface MatchConfidence {
  score: number; // 0.0 to 1.0
  reasons: string[]; // ["Time aligned", "Volume matched", "Modality matched"]
}

export interface ActivityMatch {
  id: string;
  expectedOutcome: ExpectedOutcome;
  evidence: ActivityEvidence | null;
  decision: MatchDecision;
  confidence: MatchConfidence;
  verifiedAt: Date;
  substitutionUsed: boolean;
  notes?: string;
}
