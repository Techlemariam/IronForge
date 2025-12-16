
export const calculateE1RM = (weight: number, reps: number, rpe: number) => {
  return weight * reps * 0.0333 + weight;
};
