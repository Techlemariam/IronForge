import { decideProgression, roundToAvailableLoad } from '@/services/training/progressionEngine';
import { describe, expect, it } from 'vitest';

const equipment = { minimumIncrement: 2.5 };

const threeSets = [
  { targetWeight: 70, minimumReps: 8, maximumReps: 12, targetRpe: 9, setRole: 'VOLUME' as const },
  { targetWeight: 70, minimumReps: 8, maximumReps: 12, targetRpe: 9, setRole: 'VOLUME' as const },
  { targetWeight: 70, minimumReps: 8, maximumReps: 12, targetRpe: 9, setRole: 'VOLUME' as const },
];

describe('training progression engine', () => {
  it('rounds to the nearest available load', () => {
    expect(roundToAvailableLoad(72, { minimumIncrement: 2.5 })).toBe(72.5);
    expect(roundToAvailableLoad(72, { minimumIncrement: 2.5, availableLoads: [70, 75, 80] })).toBe(70);
  });

  it('increases double progression when all sets reach the upper bound', () => {
    const result = decideProgression({
      method: 'DOUBLE_PROGRESSION',
      prescription: threeSets,
      completedSets: [
        { weight: 70, reps: 12, rpe: 8.5 },
        { weight: 70, reps: 12, rpe: 9 },
        { weight: 70, reps: 12, rpe: 8.5 },
      ],
      equipment,
    });

    expect(result.action).toBe('INCREASE');
    expect(result.nextPrescription[0].targetWeight).toBe(72.5);
    expect(result.setGoals[0].repGoal).toBe(12);
  });

  it('holds rep-goal progression after a single miss', () => {
    const result = decideProgression({
      method: 'REP_GOAL',
      prescription: threeSets,
      completedSets: [
        { weight: 70, reps: 10 },
        { weight: 70, reps: 9 },
        { weight: 70, reps: 8 },
      ],
      repGoal: 30,
      equipment,
    });

    expect(result.action).toBe('HOLD');
    expect(result.nextPrescription[0].targetWeight).toBe(70);
  });

  it('increases rep-goal progression when total reps reach the goal', () => {
    const result = decideProgression({
      method: 'REP_GOAL',
      prescription: threeSets,
      completedSets: [
        { weight: 70, reps: 12 },
        { weight: 70, reps: 10 },
        { weight: 70, reps: 8 },
      ],
      repGoal: 30,
      equipment,
    });

    expect(result.action).toBe('INCREASE');
    expect(result.nextPrescription[0].targetWeight).toBe(72.5);
  });

  it('uses the RPT top set to decide progression', () => {
    const result = decideProgression({
      method: 'RPT',
      prescription: [
        { targetWeight: 100, minimumReps: 6, maximumReps: 8, targetRpe: 9, setRole: 'TOP' },
        { targetWeight: 90, minimumReps: 8, maximumReps: 10, setRole: 'BACKOFF' },
      ],
      completedSets: [
        { weight: 100, reps: 8, rpe: 9, setRole: 'TOP' },
        { weight: 90, reps: 9, rpe: 9, setRole: 'BACKOFF' },
      ],
      equipment,
    });

    expect(result.action).toBe('INCREASE');
    expect(result.nextPrescription.map((set) => set.targetWeight)).toEqual([102.5, 92.5]);
  });

  it('does not increase after a good session when recovery is suppressed', () => {
    const result = decideProgression({
      method: 'DOUBLE_PROGRESSION',
      prescription: threeSets,
      completedSets: threeSets.map(() => ({ weight: 70, reps: 12, rpe: 8.5 })),
      equipment,
      recovery: { sleepScore: 45, bodyBattery: 20, hrvTrend: 'STABLE', systemicFailures: 0 },
    });

    expect(result.action).toBe('HOLD');
  });

  it('recommends a deload for systemic fatigue', () => {
    const result = decideProgression({
      method: 'REP_GOAL',
      prescription: threeSets,
      completedSets: threeSets.map(() => ({ weight: 70, reps: 7, rpe: 10 })),
      repGoal: 30,
      previousFailures: 2,
      equipment,
      recovery: { sleepScore: 40, bodyBattery: 20, hrvTrend: 'DOWN', systemicFailures: 3 },
    });

    expect(result.action).toBe('DELOAD');
    expect(result.nextPrescription[0].targetWeight).toBeLessThan(70);
  });
});
