import { describe, expect, it } from 'vitest';
import { getHyperProVolumeContribution, hyperProTaxonomyMap } from '@/utils/hyperProAdvisorAdapter';

describe('Hyper Pro Advisor Adapter', () => {
  it('should map exercises to their correct movement pattern and setup modes', () => {
    const nordic = hyperProTaxonomyMap.get('Nordic Curl');
    expect(nordic).toBeDefined();
    expect(nordic?.pattern).toBe('KNEE_FLEXION');
    expect(nordic?.setupMode).toBe('Nordic Station');
    expect(nordic?.primaryMuscles).toContain('Hamstrings');
    expect(nordic?.secondaryMuscles).toContain('Glutes');
  });

  it('should calculate primary and secondary volume contributions correctly', () => {
    const contribution = getHyperProVolumeContribution('Nordic Curl', 4);
    expect(contribution).toBeDefined();
    expect(contribution?.primaryMuscle).toBe('Hamstrings');
    expect(contribution?.primarySets).toBe(4);
    expect(contribution?.secondaryMuscles).toContain('Glutes');
    expect(contribution?.secondarySets).toBe(2); // 50% of 4 sets
  });

  it('should return null for non-Hyper Pro exercises', () => {
    const contribution = getHyperProVolumeContribution('Bench Press (Barbell)', 4);
    expect(contribution).toBeNull();
  });
});
