import { buildChatTrainingContext } from '@/features/training-context/chatTrainingContext';
import type { IntervalsActivity, WellnessData } from '@/lib/intervals';
import { describe, expect, it } from 'vitest';

const AS_OF = new Date('2026-09-02T20:00:00Z');

const completeWellness: WellnessData = {
  date: '2026-09-02',
  readiness: 68,
  bodyBattery: 68,
  sleepScore: 74,
  sleepSecs: 25_200,
  hrv: 41,
  restingHR: 56,
  ctl: 38,
  atl: 47,
  tsb: -9,
  rampRate: 3.2,
  stress: 6,
  fatigue: 54,
  soreness: 3,
};

const activities: IntervalsActivity[] = [
  {
    id: 'ride-recent',
    type: 'Ride',
    start_date_local: '2026-09-02T17:00:00Z',
    moving_time: 2_700,
    icu_training_load: 42,
    icu_intensity: 72,
    average_heartrate: 138,
    average_watts: 151,
  },
  {
    id: 'run-old',
    type: 'Run',
    start_date_local: '2026-08-29T08:00:00Z',
    moving_time: 1_800,
    icu_training_load: 30,
  },
];

describe('buildChatTrainingContext', () => {
  it('projects a small sanitized context from current wellness and recent activities', () => {
    const result = buildChatTrainingContext({ wellness: completeWellness, activities, asOf: AS_OF });

    expect(result).toEqual({
      asOf: '2026-09-02T20:00:00.000Z',
      source: 'INTERVALS_ICU',
      wellness: {
        bodyBattery: 68,
        sleepScore: 74,
        sleepSeconds: 25_200,
        hrv: 41,
        restingHr: 56,
        fitnessCtl: 38,
        fatigueAtl: 47,
        formTsb: -9,
        rampRate: 3.2,
        stress: 6,
        fatigue: 54,
        soreness: 3,
      },
      recentActivities: [
        {
          id: 'ride-recent',
          type: 'Ride',
          startedAt: '2026-09-02T17:00:00Z',
          durationSeconds: 2_700,
          trainingLoad: 42,
          intensity: 72,
          averageHr: 138,
          averageWatts: 151,
        },
      ],
      freshness: 'FRESH',
      missingSignals: [],
    });
  });

  it('preserves missing readiness instead of using the legacy bodyBattery=50 fallback', () => {
    const wellnessWithoutReadiness: WellnessData = {
      date: '2026-09-02',
      bodyBattery: 50,
      sleepScore: 70,
    };

    const result = buildChatTrainingContext({ wellness: wellnessWithoutReadiness, asOf: AS_OF });

    expect(result.wellness.bodyBattery).toBeUndefined();
    expect(result.missingSignals).toContain('bodyBattery');
    expect(result.freshness).toBe('FRESH');
  });

  it('returns an empty bounded activity set when no recent activities exist', () => {
    const result = buildChatTrainingContext({
      wellness: completeWellness,
      activities: [activities[1]],
      asOf: AS_OF,
    });

    expect(result.recentActivities).toEqual([]);
  });

  it('marks older wellness as stale', () => {
    const staleWellness: WellnessData = {
      ...completeWellness,
      date: '2026-08-30',
    };

    const result = buildChatTrainingContext({ wellness: staleWellness, asOf: AS_OF });

    expect(result.freshness).toBe('STALE');
  });

  it('marks missing wellness as unknown and lists unavailable core signals', () => {
    const result = buildChatTrainingContext({ wellness: undefined, activities: [], asOf: AS_OF });

    expect(result.freshness).toBe('UNKNOWN');
    expect(result.wellness).toEqual({});
    expect(result.missingSignals).toContain('sleepScore');
    expect(result.missingSignals).toContain('formTsb');
  });
});
