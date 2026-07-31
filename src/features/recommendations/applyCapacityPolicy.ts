import type { CapacitySelection } from '@/features/recovery/capacityMode';
import { isCapacitySelectionActive, shouldSuppressIntensity } from '@/features/recovery/capacityMode';
import type { TrainingRecommendation } from './contracts';

export function applyCapacityPolicy(
  recommendation: TrainingRecommendation,
  selection: CapacitySelection | undefined,
  now: string
): TrainingRecommendation {
  if (!selection || !isCapacitySelectionActive(selection, now) || !shouldSuppressIntensity(selection)) {
    return recommendation;
  }

  return {
    ...recommendation,
    kind: recommendation.kind === 'TRAIN' ? 'LIGHT' : recommendation.kind,
    reasonCodes: [...new Set(['LOW_CAPACITY', ...recommendation.reasonCodes])].slice(0, 3),
  };
}
