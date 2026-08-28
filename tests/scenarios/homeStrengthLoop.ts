export interface HomeStrengthScenario {
  name: string;
  capacity: 'MINIMUM' | 'GOOD' | 'OPTIMAL';
  completion: 'FULL' | 'PARTIAL' | 'QUIT_SMART';
  expectedDebt: false;
  expectedRecommendationCount: number;
}

export const homeStrengthScenarios: HomeStrengthScenario[] = [
  {
    name: 'normal completion updates next recommendation',
    capacity: 'GOOD',
    completion: 'FULL',
    expectedDebt: false,
    expectedRecommendationCount: 3,
  },
  {
    name: 'minimum day stays valid and debt free',
    capacity: 'MINIMUM',
    completion: 'PARTIAL',
    expectedDebt: false,
    expectedRecommendationCount: 3,
  },
  {
    name: 'quit smart creates no make-up debt',
    capacity: 'MINIMUM',
    completion: 'QUIT_SMART',
    expectedDebt: false,
    expectedRecommendationCount: 3,
  },
];
