import {
  getDefaultEquipmentConstraints,
  inferExerciseRegion,
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
});
