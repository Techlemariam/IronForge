'''
export type Rarity = 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export enum ExerciseLogic {
  FIXED_REPS = 'fixed_reps',
  TM_PERCENT = '531_tm_percent',
}

export interface Set {
  id: string;
  reps: number | string;
  completedReps?: number;
  weight?: number;
  completed: boolean;
  rarity?: Rarity;
  e1rm?: number;
  targetReps: number;
  targetRPE: number;
  isPrZone?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  type: 'strength';
  sets: Set[];
  completed: boolean;
  logic?: ExerciseLogic;
}
''