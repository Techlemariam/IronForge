import {
  getDefaultEquipmentConstraints,
  inferExerciseRegion,
  resolveEquipmentConstraints,
} from '@/services/training/progressionDefaults';
import { describe, expect, it } from 'vitest';

describe('progression defaults', () => {
  it('uses 5 kg increments for lower-body exercises', () => {
    expect(inferExerciseRegion({ name: 'Belt Squat' })).toBe('LOWER');
    expect(getDefaultEquipmentConstraints({ name: 'Belt Squat' }).minimumIncrement).toBe(5);
    expect(getDefaultEquipmentConstraints({ name: 'Romanian Deadlift' }).minimumIncrement).toBe(5);
  });

  it('uses 2.5 kg increments for upper-body exercises', () => {
    expect(inferExerciseRegion({ name: 'Bench Press' })).toBe('UPPER');
    expect(getDefaultEquipmentConstraints({ name: 'Bench Press' }).minimumIncrement).toBe(2.5);
    expect(getDefaultEquipmentConstraints({ name: 'Barbell Row' }).minimumIncrement).toBe(2.5);
  });

  it('falls back conservatively to 2.5 kg when classification is unknown', () => {
    expect(inferExerciseRegion({ name: 'Custom Forge Movement' })).toBe('UNKNOWN');
    expect(getDefaultEquipmentConstraints({ name: 'Custom Forge Movement' }).minimumIncrement).toBe(2.5);
  });

  it('allows any exercise to override its default increment', () => {
    expect(
      resolveEquipmentConstraints(
        { name: 'Bench Press' },
        { minimumIncrement: 1.25, availableLoads: [20, 21.25, 22.5] }
      )
    ).toEqual({ minimumIncrement: 1.25, availableLoads: [20, 21.25, 22.5] });

    expect(resolveEquipmentConstraints({ name: 'Belt Squat' }, { minimumIncrement: 2.5 })).toEqual({
      minimumIncrement: 2.5,
      availableLoads: undefined,
    });
  });

  it('ignores invalid overrides and keeps the safe default', () => {
    expect(resolveEquipmentConstraints({ name: 'Belt Squat' }, { minimumIncrement: 0 })).toEqual({
      minimumIncrement: 5,
      availableLoads: undefined,
    });
  });
});
