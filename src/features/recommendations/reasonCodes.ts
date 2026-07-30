export type RecommendationReasonCode =
  | 'GOAL_ALIGNMENT'
  | 'EQUIPMENT_COMPATIBLE'
  | 'LOW_CAPACITY'
  | 'RECOVERY_SUPPRESSED'
  | 'RETURN_TO_TRAINING'
  | 'TIME_CONSTRAINT'
  | 'DATA_UNCERTAIN'
  | 'USER_OVERRIDE';

export interface RecommendationReason {
  code: RecommendationReasonCode;
  summary: string;
  source: 'USER' | 'GOAL_ENGINE' | 'RECOVERY' | 'EQUIPMENT' | 'SYSTEM';
}

export function limitReasons(reasons: RecommendationReason[]): RecommendationReason[] {
  return reasons.slice(0, 3);
}
