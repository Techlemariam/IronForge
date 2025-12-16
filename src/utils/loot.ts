
export const determineRarity = (weight: number, reps: number, rpe: number, targetRpe: number, globalPr: number, sessionPr: number) => {
  if (reps > 10) return 'legendary';
  return 'common';
};
