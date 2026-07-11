// tests/unit/data/hyperProDailyMissions.test.ts

import { hyperProDailyMissions } from '@/data/hyperProDailyMissions';
import { hyperProTaxonomyMap } from '@/utils/hyperProAdvisorAdapter';

describe('HyperPro Daily Missions', () => {
  test('all missions have required fields', () => {
    hyperProDailyMissions.forEach((mission) => {
      expect(mission.id).toBeTruthy();
      expect(mission.name).toBeTruthy();
      expect(mission.taxonomy).toBeTruthy();
      expect(mission.intent).toBeTruthy();
      expect(mission.clears).toBeTruthy();
      expect(mission.clears.minimum).toBeTruthy();
      expect(mission.clears.standard).toBeTruthy();
      expect(mission.clears.boss).toBeTruthy();
      expect(mission.rpeGuidance).toBeTruthy();
      expect(mission.stopCondition).toBeTruthy();
      expect(mission.rewardReason).toBeTruthy();
    });
  });

  test('taxonomy entries exist in map', () => {
    hyperProDailyMissions.forEach((mission) => {
      const lookup = hyperProTaxonomyMap.get(mission.taxonomy.setupMode);
      // taxonomy objects should be reference-equal to map entry
      // Using deep equality on name to ensure correct mapping
      const nameMatch = Object.values(hyperProTaxonomyMap).some((t) => t?.setupMode === mission.taxonomy.setupMode);
      expect(nameMatch).toBe(true);
    });
  });
});
