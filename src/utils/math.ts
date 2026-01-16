export const calculateE1RM = (weight: number, reps: number, _rpe: number) => {
  return weight * reps * 0.0333 + weight;
};
