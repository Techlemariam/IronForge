import { describe, expect, it } from 'vitest';
import { hyperProProgressions } from '@/data/hyperProProgressions';

describe('Hyper Pro Progression & Regression Model', () => {
  it('should define safe progressions for all key families', () => {
    expect(hyperProProgressions).toBeDefined();
    expect(hyperProProgressions.length).toBeGreaterThanOrEqual(6);

    const families = ['nordic_curl_progression', 'reverse_nordic_progression', 'sissy_squat_progression', 'back_extension_progression', 'reverse_hyper_progression', 'ghd_sit_up_progression'];
    
    families.forEach(id => {
      const family = hyperProProgressions.find(f => f.id === id);
      expect(family).toBeDefined();
      expect(family?.stages.length).toBe(3); // Regression, Baseline, Progression
      expect(family?.cautionNote).toContain('Non-medical caution');
      
      family?.stages.forEach(stage => {
        expect(stage.name).toBeDefined();
        expect(stage.rpeGuidance).toBeDefined();
        expect(stage.stopCondition).toBeDefined();
        expect(stage.description).toBeDefined();
      });
    });
  });
});
