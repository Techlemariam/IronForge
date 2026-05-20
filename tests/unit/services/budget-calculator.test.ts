import { BudgetCalculator } from '@/services/budget-calculator';
import { describe, expect, it } from 'vitest';

describe('BudgetCalculator', () => {
  it('uses restingHrBaseline to detect elevated resting HR', () => {
    const budget = BudgetCalculator.calculateDailyBudget(
      {
        restingHR: 70,
      } as any,
      {
        restingHrBaseline: 50,
      }
    );

    expect(budget.cns).toBe(80);
    expect(budget.muscular).toBe(85);
    expect(budget.metabolic).toBe(100);
  });

  it('does not penalize resting HR when under threshold for provided baseline', () => {
    const budget = BudgetCalculator.calculateDailyBudget(
      {
        restingHR: 57,
      } as any,
      {
        restingHrBaseline: 50,
      }
    );

    expect(budget.cns).toBe(100);
    expect(budget.muscular).toBe(100);
    expect(budget.metabolic).toBe(100);
  });

  it('applies step-based modifiers consistently', () => {
    const highSteps = BudgetCalculator.calculateDailyBudget({ steps: 12000 } as any);
    const lowSteps = BudgetCalculator.calculateDailyBudget({ steps: 1500 } as any);

    expect(highSteps.cns).toBe(105);
    expect(lowSteps.metabolic).toBe(95);
  });
});
