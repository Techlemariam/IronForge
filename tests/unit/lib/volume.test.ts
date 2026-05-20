import type { HevyWorkout } from '@/types/hevy';
import { calculateWeeklyVolume } from '@/utils/volumeCalculator';
import { describe, expect, it } from 'vitest';

// Minimal mock data generator
const createWorkout = (date: Date, exercises: any[]): HevyWorkout => ({
  id: 'w1',
  title: 'Test Workout',
  start_time: date.toISOString(),
  duration_seconds: 3600,
  exercises: exercises.map((ex, i) => ({
    index: i,
    title: ex.title,
    notes: '',
    exercise_template_id: 'ex1',
    exercise_template: { id: 'ex1', title: ex.title },
    sets: [
      { index: 0, type: 'normal', weight_kg: 100, reps: 5 },
      { index: 1, type: 'normal', weight_kg: 100, reps: 5 },
      { index: 2, type: 'warmup', weight_kg: 20, reps: 10 }, // Warm-up set shouldn't count
    ],
  })),
});

describe('Volume Calculator', () => {
  it('should aggregate volume for known muscle groups', () => {
    const now = new Date();
    // Workout with Bench Press (Chest)
    const workout = createWorkout(now, [{ title: 'Bench Press (Barbell)' }]);

    const volume = calculateWeeklyVolume([workout], now);

    const chest = volume.find((v) => v.muscleGroup === 'Chest');
    expect(chest).toBeDefined();
    // 3 sets total, 1 warm-up => 2 valid sets
    expect(chest?.weeklyVolume).toBe(2);
  });

  it('should ignore workouts older than 7 days', () => {
    const now = new Date();
    const oldDate = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000); // 8 days ago

    const workout = createWorkout(oldDate, [{ title: 'Squat (Barbell)' }]);

    const volume = calculateWeeklyVolume([workout], now);
    const quads = volume.find((v) => v.muscleGroup === 'Quads');
    expect(quads).toBeDefined();
    expect(quads?.weeklyVolume).toBe(0);
  });

  it('should handle zero workouts gracefully', () => {
    const volume = calculateWeeklyVolume([], new Date());
    expect(volume.length).toBeGreaterThan(0); // Should return initialized 0s
    expect(volume[0].weeklyVolume).toBe(0);
  });

  it('should ignore unknown exercises', () => {
    const now = new Date();
    const workout = createWorkout(now, [{ title: 'Exotic Space Lift' }]);
    const volume = calculateWeeklyVolume([workout], now);

    // Assuming 'Exotic Space Lift' isn't in muscleMap, it shouldn't crash
    const totalVolume = volume.reduce((acc, curr) => acc + curr.weeklyVolume, 0);
    expect(totalVolume).toBe(0);
  });

  it('should exclude warm-up-only exercises from volume', () => {
    const now = new Date();
    const warmupOnly: HevyWorkout = {
      id: 'w2',
      title: 'Warm-up Only',
      start_time: now.toISOString(),
      duration_seconds: 600,
      exercises: [
        {
          index: 0,
          title: 'Bench Press (Barbell)',
          notes: '',
          exercise_template_id: 'bench',
          exercise_template: { id: 'bench', title: 'Bench Press (Barbell)' },
          sets: [{ index: 0, type: 'warmup', weight_kg: 20, reps: 10 }],
        },
      ],
    };

    const volume = calculateWeeklyVolume([warmupOnly], now);
    const chest = volume.find((v) => v.muscleGroup === 'Chest');
    expect(chest?.weeklyVolume).toBe(0);
  });
});
