export type RecommendationKind = 'TRAIN' | 'LIGHT' | 'RECOVER';

export type RecommendationConfidence = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TrainingRecommendation {
  id: string;
  kind: RecommendationKind;
  title: string;
  reasonCodes: string[];
  confidence: RecommendationConfidence;
  equipmentProfileId: string;
  estimatedMinutes: number;
}

export interface RecommendationSet {
  generatedAt: string;
  recommendations: TrainingRecommendation[];
}

export function validateRecommendationSet(set: RecommendationSet): boolean {
  return set.recommendations.length > 0 && set.recommendations.length <= 3;
}
