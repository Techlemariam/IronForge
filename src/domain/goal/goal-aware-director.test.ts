import { describe, expect, it } from 'vitest';
import { rankGoalAwareCandidates, scoreGoalAwareCandidate } from './goal-aware-director';

describe('goal-aware director', () => {
  const goals = [
    {
      goalId: 'build-chest',
      priority: 'PRIMARY' as const,
      objectiveCapabilities: ['CHEST_HORIZONTAL_PRESS', 'CHEST_INCLINE_PRESS'],
    },
  ];

  it('raises compatible candidates that match the active goal', () => {
    const result = scoreGoalAwareCandidate(
      {
        candidateId: 'bench',
        exerciseId: 'barbell-bench-press',
        stimulusCapabilities: ['CHEST_HORIZONTAL_PRESS'],
        equipmentCompatible: true,
        recoveryAllowsProgression: true,
        baseScore: 50,
      },
      goals,
    );

    expect(result).toMatchObject({ eligible: true, score: 70 });
    expect(result.reasonCodes).toContain('PRIMARY_GOAL_MATCH');
  });

  it('never reintroduces equipment-incompatible candidates', () => {
    const result = scoreGoalAwareCandidate(
      {
        candidateId: 'pec-deck',
        exerciseId: 'pec-deck',
        stimulusCapabilities: ['CHEST_ADDUCTION'],
        equipmentCompatible: false,
        recoveryAllowsProgression: true,
        baseScore: 99,
      },
      goals,
    );

    expect(result).toEqual({
      candidateId: 'pec-deck',
      eligible: false,
      score: 0,
      matchedGoalIds: [],
      reasonCodes: ['EQUIPMENT_INCOMPATIBLE'],
    });
  });

  it('lets recovery downgrade goal contribution instead of being overridden', () => {
    const result = scoreGoalAwareCandidate(
      {
        candidateId: 'bench',
        exerciseId: 'barbell-bench-press',
        stimulusCapabilities: ['CHEST_HORIZONTAL_PRESS'],
        equipmentCompatible: true,
        recoveryAllowsProgression: false,
        baseScore: 50,
      },
      goals,
    );

    expect(result.score).toBe(42);
    expect(result.reasonCodes).toContain('RECOVERY_DOWNGRADE');
  });

  it('ranks deterministically and excludes local avoid candidates', () => {
    const result = rankGoalAwareCandidates(
      [
        {
          candidateId: 'push-up',
          exerciseId: 'push-up',
          stimulusCapabilities: ['CHEST_HORIZONTAL_PRESS'],
          equipmentCompatible: true,
          recoveryAllowsProgression: true,
          baseScore: 40,
        },
        {
          candidateId: 'bench',
          exerciseId: 'barbell-bench-press',
          stimulusCapabilities: ['CHEST_HORIZONTAL_PRESS'],
          equipmentCompatible: true,
          locallyAvoided: true,
          recoveryAllowsProgression: true,
          baseScore: 90,
        },
      ],
      goals,
    );

    expect(result.map((candidate) => candidate.candidateId)).toEqual(['push-up']);
  });
});
