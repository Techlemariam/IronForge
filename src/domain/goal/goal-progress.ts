export type GoalEvidenceKind =
  | 'BENCHMARK'
  | 'TRAINING_VOLUME'
  | 'FREQUENCY'
  | 'BODY_MEASUREMENT'
  | 'SELF_REPORT';

export type GoalEvidenceQuality = 'DIRECT' | 'INDIRECT' | 'SELF_REPORTED';

export type GoalActivityOutcome = 'COMPLETED' | 'PARTIAL' | 'QUIT_SMART';

export interface GoalEvidenceEvent {
  id: string;
  goalId: string;
  occurredAt: string;
  kind: GoalEvidenceKind;
  quality: GoalEvidenceQuality;
  outcome: GoalActivityOutcome;
  contribution: number;
  sourceId: string;
}

export interface GoalProgressSnapshot {
  goalId: string;
  calculatedAt: string;
  progress: number;
  confidence: number;
  evidenceCount: number;
  reasonCodes: string[];
}

const outcomeMultiplier: Record<GoalActivityOutcome, number> = {
  COMPLETED: 1,
  PARTIAL: 0.6,
  QUIT_SMART: 0.25,
};

const qualityMultiplier: Record<GoalEvidenceQuality, number> = {
  DIRECT: 1,
  INDIRECT: 0.7,
  SELF_REPORTED: 0.45,
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function calculateGoalProgress(
  goalId: string,
  events: GoalEvidenceEvent[],
  calculatedAt: string,
): GoalProgressSnapshot {
  const relevant = events
    .filter((event) => event.goalId === goalId)
    .sort((a, b) => a.id.localeCompare(b.id));

  const weightedContribution = relevant.reduce((sum, event) => {
    return (
      sum +
      clamp(event.contribution) *
        outcomeMultiplier[event.outcome] *
        qualityMultiplier[event.quality]
    );
  }, 0);

  const progress = clamp(weightedContribution / 10);
  const directEvidence = relevant.filter((event) => event.quality === 'DIRECT').length;
  const confidence = clamp(
    relevant.length === 0
      ? 0
      : 0.2 + Math.min(relevant.length, 6) * 0.1 + Math.min(directEvidence, 4) * 0.08,
  );

  const reasonCodes: string[] = [];
  if (relevant.length === 0) reasonCodes.push('NO_EVIDENCE');
  if (relevant.some((event) => event.outcome === 'PARTIAL')) {
    reasonCodes.push('PARTIAL_ACTIVITY_COUNTED');
  }
  if (relevant.some((event) => event.outcome === 'QUIT_SMART')) {
    reasonCodes.push('QUIT_SMART_LIMITED_CONTRIBUTION');
  }
  if (directEvidence > 0) reasonCodes.push('DIRECT_EVIDENCE_PRESENT');
  if (confidence < 0.5 && relevant.length > 0) reasonCodes.push('LOW_CONFIDENCE');

  return {
    goalId,
    calculatedAt,
    progress,
    confidence,
    evidenceCount: relevant.length,
    reasonCodes,
  };
}
