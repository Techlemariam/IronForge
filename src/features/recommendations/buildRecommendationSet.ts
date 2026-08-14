import type { RecommendationSet, TrainingRecommendation } from './contracts';
import { limitReasons, type RecommendationReason } from './reasonCodes';

export interface RecommendationCandidate extends Omit<TrainingRecommendation, 'reasonCodes'> {
  reasons: RecommendationReason[];
}

export function buildRecommendationSet(
  candidates: RecommendationCandidate[],
  generatedAt: string
): RecommendationSet {
  const recommendations = candidates.slice(0, 3).map(({ reasons, ...candidate }) => ({
    ...candidate,
    reasonCodes: limitReasons(reasons).map((reason) => reason.code),
  }));

  if (recommendations.length === 0) {
    throw new Error('At least one recommendation candidate is required');
  }

  return { generatedAt, recommendations };
}
