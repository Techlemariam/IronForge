import { describe, expect, it } from 'vitest';
import { prioritizeGoals } from './goal-prioritization';

describe('prioritizeGoals', () => {
  it('prioritizes the primary goal deterministically', () => {
    const result = prioritizeGoals(
      [
        { goalId: 'marathon', priority: 'SECONDARY', requestedLoad: 4, recoveryCost: 4, equipmentCompatible: true },
        { goalId: 'build-chest', priority: 'PRIMARY', requestedLoad: 4, recoveryCost: 4, equipmentCompatible: true },
      ],
      { availableRecovery: 5, availableTime: 5 },
    );

    expect(result[0]).toMatchObject({ goalId: 'build-chest', mode: 'PROGRESS' });
    expect(result[1].mode).not.toBe('PROGRESS');
  });

  it('uses maintenance when the remaining budget cannot support progression', () => {
    const result = prioritizeGoals(
      [
        { goalId: 'build-chest', priority: 'PRIMARY', requestedLoad: 6, recoveryCost: 6, equipmentCompatible: true },
        { goalId: 'marathon', priority: 'SECONDARY', requestedLoad: 6, recoveryCost: 6, equipmentCompatible: true },
      ],
      { availableRecovery: 8, availableTime: 8 },
    );

    expect(result).toEqual([
      expect.objectContaining({ goalId: 'build-chest', mode: 'PROGRESS' }),
      expect.objectContaining({ goalId: 'marathon', mode: 'MAINTENANCE' }),
    ]);
  });

  it('never prioritizes equipment-incompatible or locally avoided goals', () => {
    const result = prioritizeGoals(
      [
        { goalId: 'pec-deck-goal', priority: 'PRIMARY', requestedLoad: 1, recoveryCost: 1, equipmentCompatible: false },
        { goalId: 'build-chest', priority: 'SECONDARY', requestedLoad: 1, recoveryCost: 1, equipmentCompatible: true, locallyAvoided: true },
      ],
      { availableRecovery: 10, availableTime: 10 },
    );

    expect(result[0].reasonCodes).toContain('EQUIPMENT_INCOMPATIBLE');
    expect(result[1].reasonCodes).toContain('LOCAL_AVOID');
    expect(result.every((decision) => decision.mode === 'PAUSED')).toBe(true);
  });
});
