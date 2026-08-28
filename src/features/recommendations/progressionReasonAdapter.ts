import type { ProgressionDecision } from '@/services/training/progressionEngine';
import type { RecommendationReason } from './reasonCodes';

export function progressionDecisionToReason(
  decision: ProgressionDecision
): RecommendationReason {
  const code =
    decision.action === 'DELOAD' || decision.action === 'REDUCE'
      ? 'RECOVERY_SUPPRESSED'
      : 'GOAL_ALIGNMENT';

  return {
    code,
    summary: decision.reason,
    source: decision.action === 'DELOAD' ? 'RECOVERY' : 'GOAL_ENGINE',
  };
}
