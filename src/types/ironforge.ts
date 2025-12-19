
export type Rarity = 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export enum ExerciseLogic {
  FIXED_REPS = 'fixed_reps',
  TM_PERCENT = '531_tm_percent',
}

export interface WorkoutSet {
  id: string;
  completed: boolean;
  weight?: number;
  targetReps: number;
  targetRPE: number;
  completedReps?: number;
  rarity?: Rarity;
  e1rm?: number;
  isPr?: boolean;
  type?: string;
  reps?: number | string;
}

export interface Exercise {
  id: string;
  name: string;
  hevyId: string;
  sets: WorkoutSet[];
  trainingMax?: number;
  notes?: string;
}

