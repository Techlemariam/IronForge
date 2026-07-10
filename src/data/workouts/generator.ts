import type { WorkoutDefinition } from '../../types/training';
import { EXERCISE_DB } from '../exerciseDb';

/**
 * Generates dynamic strength workouts based on templates and the Exercise DB.
 */
export const generateStrengthWorkouts = (): WorkoutDefinition[] => {
  const workouts: WorkoutDefinition[] = [];

  // --- TEMPLATE 1: FULL BODY POWER (Alpha) ---
  workouts.push({
    id: 'str_full_alpha_a',
    code: 'FBa',
    name: 'Full Body Power A',
    description: 'Heavy compound movements focusing on maximum force production.',
    type: 'STRENGTH',
    durationMin: 60,
    durationLabel: '60 min',
    intensity: 'HIGH',
    resourceCost: {
      CNS: 25,
      MUSCULAR: 20,
      METABOLIC: 15,
    },
    recommendedPaths: ['JUGGERNAUT', 'WARDEN'],
    exercises: [
      { id: 'Squat (Barbell)', sets: 3, reps: 5, rpe: 8, restMin: 3 },
      { id: 'Bench Press (Barbell)', sets: 3, reps: 5, rpe: 8, restMin: 3 },
      { id: 'Bent Over Row (Barbell)', sets: 3, reps: 8, rpe: 8, restMin: 2 },
      { id: 'Overhead Press (Barbell)', sets: 2, reps: 8, rpe: 7, restMin: 2 },
    ],
  });

  // --- TEMPLATE 2: UPPER HYPERTROPHY (Beta) ---
  workouts.push({
    id: 'str_upper_beta_a',
    code: 'UPa',
    name: 'Upper Hypertrophy A',
    description: 'Volume-focused upper body session for muscle growth.',
    type: 'STRENGTH',
    durationMin: 45,
    durationLabel: '45 min',
    intensity: 'MEDIUM',
    resourceCost: {
      CNS: 15,
      MUSCULAR: 35,
      METABOLIC: 20,
    },
    recommendedPaths: ['JUGGERNAUT', 'WARDEN'],
    exercises: [
      { id: 'Incline Bench Press (Dumbbell)', sets: 3, reps: 10, rpe: 8, restMin: 2 },
      { id: 'Lat Pulldown (Cable)', sets: 3, reps: 12, rpe: 8, restMin: 2 },
      { id: 'Lateral Raise (Dumbbell)', sets: 3, reps: 15, rpe: 9, restMin: 1.5 },
      { id: 'Bicep Curl (Dumbbell)', sets: 3, reps: 12, rpe: 9, restMin: 1.5 },
      { id: 'Triceps Pushdown', sets: 3, reps: 12, rpe: 9, restMin: 1.5 },
    ],
  });

  // --- TEMPLATE 3: LOWER HYPERTROPHY (Beta) ---
  workouts.push({
    id: 'str_lower_beta_a',
    code: 'LWa',
    name: 'Lower Hypertrophy A',
    description: 'Leg day focus on quads and hams.',
    type: 'STRENGTH',
    durationMin: 50,
    durationLabel: '50 min',
    intensity: 'HIGH',
    resourceCost: {
      CNS: 20,
      MUSCULAR: 40,
      METABOLIC: 25,
    },
    recommendedPaths: ['JUGGERNAUT', 'WARDEN'],
    exercises: [
      { id: 'Deadlift (Barbell)', sets: 1, reps: 5, rpe: 8, restMin: 3 },
      { id: 'Leg Press (Machine)', sets: 3, reps: 10, rpe: 8, restMin: 2 },
      { id: 'Bulgarian Split Squat', sets: 2, reps: 12, rpe: 8, restMin: 2 },
      { id: 'Seated Leg Curl (Machine)', sets: 3, reps: 15, rpe: 9, restMin: 1.5 },
      { id: 'Seated Calf Raise', sets: 3, reps: 15, rpe: 9, restMin: 1.5 },
    ],
  });

  // --- TEMPLATE 4: HYPER PRO POSTERIOR CHAIN MINIMUM ---
  workouts.push({
    id: 'hp_post_chain_min',
    code: 'HP-PCm',
    name: 'Hyper Pro Posterior Chain Minimum',
    description: 'Low-friction posterior chain maintenance focused on hyperextension.',
    type: 'STRENGTH',
    durationMin: 20,
    durationLabel: '20 min',
    intensity: 'LOW',
    resourceCost: {
      CNS: 5,
      MUSCULAR: 10,
      METABOLIC: 5,
    },
    recommendedPaths: ['JUGGERNAUT', 'WARDEN'],
    exercises: [
      { id: 'Back Extension (Hyperextension)', sets: 2, reps: 15, rpe: 6, restMin: 1.5 },
    ],
  });

  // --- TEMPLATE 5: HYPER PRO NORDIC PROGRESSION ---
  workouts.push({
    id: 'hp_nordic_prog',
    code: 'HP-Np',
    name: 'Hyper Pro Nordic Progression',
    description: 'Focused knee flexion/hamstring work on the Nordic station.',
    type: 'STRENGTH',
    durationMin: 30,
    durationLabel: '30 min',
    intensity: 'HIGH',
    resourceCost: {
      CNS: 18,
      MUSCULAR: 35,
      METABOLIC: 12,
    },
    recommendedPaths: ['JUGGERNAUT', 'WARDEN'],
    exercises: [
      { id: 'Nordic Hamstrings Curls', sets: 3, reps: 8, rpe: 8, restMin: 2 },
      { id: 'Lying Leg Curl (Machine)', sets: 3, reps: 12, rpe: 8, restMin: 1.5 },
    ],
  });

  // --- TEMPLATE 6: HYPER PRO QUAD ACCESSORY ---
  workouts.push({
    id: 'hp_quad_acc',
    code: 'HP-Qa',
    name: 'Hyper Pro Quad Accessory',
    description: 'Targeted quad work utilizing slant board and leg extension attachments.',
    type: 'STRENGTH',
    durationMin: 35,
    durationLabel: '35 min',
    intensity: 'MEDIUM',
    resourceCost: {
      CNS: 12,
      MUSCULAR: 30,
      METABOLIC: 18,
    },
    recommendedPaths: ['JUGGERNAUT', 'WARDEN'],
    exercises: [
      { id: 'Goblet Squat', sets: 3, reps: 12, rpe: 7, restMin: 2 },
      { id: 'Leg Extension (Machine)', sets: 3, reps: 15, rpe: 8, restMin: 1.5 },
      { id: 'Sissy Squat (Weighted)', sets: 2, reps: 15, rpe: 7, restMin: 1.5 },
    ],
  });

  // --- TEMPLATE 7: HYPER PRO CORE & TRUNK ---
  workouts.push({
    id: 'hp_core_trunk',
    code: 'HP-Ct',
    name: 'Hyper Pro Core & Trunk Work',
    description: 'High-intensity core conditioning on GHD and decline setups.',
    type: 'STRENGTH',
    durationMin: 25,
    durationLabel: '25 min',
    intensity: 'MEDIUM',
    resourceCost: {
      CNS: 10,
      MUSCULAR: 20,
      METABOLIC: 10,
    },
    recommendedPaths: ['JUGGERNAUT', 'WARDEN'],
    exercises: [
      { id: 'Dragon Flag', sets: 3, reps: 6, rpe: 8, restMin: 2 },
      { id: 'Decline Crunch', sets: 3, reps: 15, rpe: 7, restMin: 1.5 },
    ],
  });

  // --- TEMPLATE 8: HYPER PRO POWERLIFTING ACCESSORY ---
  workouts.push({
    id: 'hp_pl_accessory',
    code: 'HP-PLa',
    name: 'Hyper Pro Powerlifting Accessory',
    description: 'Accessory work tailored to support main squat and deadlift progression.',
    type: 'STRENGTH',
    durationMin: 40,
    durationLabel: '40 min',
    intensity: 'HIGH',
    resourceCost: {
      CNS: 20,
      MUSCULAR: 38,
      METABOLIC: 15,
    },
    recommendedPaths: ['JUGGERNAUT', 'WARDEN'],
    exercises: [
      { id: 'Glute Ham Raise', sets: 3, reps: 8, rpe: 8, restMin: 2 },
      { id: 'Reverse Hyperextension', sets: 3, reps: 12, rpe: 8, restMin: 2 },
      { id: 'Chest Dip', sets: 3, reps: 10, rpe: 8, restMin: 1.5 },
    ],
  });

  // Validate exercises exist in DB
  const validatedWorkouts = workouts.map((w) => {
    if (w.exercises) {
      w.exercises = w.exercises.filter((ex) => {
        if (!EXERCISE_DB[ex.id]) {
          console.warn(
            `Warning: Exercise '${ex.id}' not found in EXERCISE_DB. Removing from workout '${w.id}'.`
          );
          return false;
        }
        return true;
      });
    }
    return w;
  });

  return validatedWorkouts;
};
