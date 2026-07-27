export type GoalContributionReasonCode =
  | 'PRIMARY_GOAL_MATCH'
  | 'SECONDARY_GOAL_MATCH'
  | 'PARTIAL_STIMULUS_MATCH'
  | 'RECOVERY_DOWNGRADE'
  | 'LOCAL_AVOID'
  | 'EQUIPMENT_INCOMPATIBLE';

export interface ActiveGoalContribution {
  goalId: string;
  priority: 'PRIMARY' | 'SECONDARY';
  objectiveCapabilities: string[];
}

export interface DirectorCandidateInput {
  candidateId: string;
  exerciseId: string;
  stimulusCapabilities: string[];
  equipmentCompatible: boolean;
  locallyAvoided?: boolean;
  recoveryAllowsProgression: boolean;
  baseScore: number;
}

export interface GoalAwareDirectorResult {
  candidateId: string;
  eligible: boolean;
  score: number;
  matchedGoalIds: string[];
  reasonCodes: GoalContributionReasonCode[];
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function scoreGoalAwareCandidate(
  candidate: DirectorCandidateInput,
  goals: ActiveGoalContribution[],
): GoalAwareDirectorResult {
  const reasonCodes: GoalContributionReasonCode[] = [];

  if (!candidate.equipmentCompatible) {
    return {
      candidateId: candidate.candidateId,
      eligible: false,
      score: 0,
      matchedGoalIds: [],
      reasonCodes: ['EQUIPMENT_INCOMPATIBLE'],
    };
  }

  if (candidate.locallyAvoided) {
    return {
      candidateId: candidate.candidateId,
      eligible: false,
      score: 0,
      matchedGoalIds: [],
      reasonCodes: ['LOCAL_AVOID'],
    };
  }

  const matchedGoals = goals.filter((goal) =>
    goal.objectiveCapabilities.some((capability) =>
      candidate.stimulusCapabilities.includes(capability),
    ),
  );

  let contribution = 0;
  for (const goal of matchedGoals) {
    if (goal.priority === 'PRIMARY') {
      contribution += 20;
      reasonCodes.push('PRIMARY_GOAL_MATCH');
    } else {
      contribution += 10;
      reasonCodes.push('SECONDARY_GOAL_MATCH');
    }
  }

  let score = candidate.baseScore + contribution;
  if (!candidate.recoveryAllowsProgression) {
    score *= 0.6;
    reasonCodes.push('RECOVERY_DOWNGRADE');
  }

  return {
    candidateId: candidate.candidateId,
    eligible: true,
    score: clampScore(score),
    matchedGoalIds: matchedGoals.map((goal) => goal.goalId).sort(),
    reasonCodes: [...new Set(reasonCodes)],
  };
}

export function rankGoalAwareCandidates(
  candidates: DirectorCandidateInput[],
  goals: ActiveGoalContribution[],
): GoalAwareDirectorResult[] {
  return candidates
    .map((candidate) => scoreGoalAwareCandidate(candidate, goals))
    .filter((result) => result.eligible)
    .sort((a, b) => b.score - a.score || a.candidateId.localeCompare(b.candidateId));
}
