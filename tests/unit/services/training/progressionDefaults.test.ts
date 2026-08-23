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

  it('lets lower-body movement identity override ambiguous catalog metadata', () => {
    expect(inferExerciseRegion({ name: 'Deadlift', muscleGroup: 'Back' })).toBe('LOWER');
    expect(getDefaultEquipmentConstraints({ name: 'Deadlift', muscleGroup: 'Back' }).minimumIncrement).toBe(
      5
    );
  });

  it('prefers exercise muscle-group metadata over ambiguous names', () => {
    expect(inferExerciseRegion({ name: 'Glute Ham Raise', muscleGroup: 'HAMSTRINGS' })).toBe('LOWER');
    expect(inferExerciseRegion({ name: 'Nordic Hamstrings Curls', muscleGroup: 'HAMSTRINGS' })).toBe(
      'LOWER'
    );
    expect(inferExerciseRegion({ name: 'Hip Abduction (Machine)', muscleGroup: 'GLUTES' })).toBe(
      'LOWER'
    );
  });

  it('keeps lower-body catalog fallbacks safe when metadata is unavailable', () => {
    expect(getDefaultEquipmentConstraints({ name: 'Glute Ham Raise' }).minimumIncrement).toBe(5);
    expect(getDefaultEquipmentConstraints({ name: 'Nordic Hamstrings Curls' }).minimumIncrement).toBe(5);
    expect(getDefaultEquipmentConstraints({ name: 'Hip Abduction (Machine)' }).minimumIncrement).toBe(5);
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