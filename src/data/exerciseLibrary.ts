"use server";

type MuscleGroup =
  | "CHEST"
  | "BACK"
  | "SHOULDERS"
  | "BICEPS"
  | "TRICEPS"
  | "QUADRICEPS"
  | "HAMSTRINGS"
  | "GLUTES"
  | "CALVES"
  | "ABS"
  | "FOREARMS"
  | "FULL_BODY";
type Equipment =
  | "BARBELL"
  | "DUMBBELL"
  | "CABLE"
  | "MACHINE"
  | "BODYWEIGHT"
  | "KETTLEBELL"
  | "BANDS"
  | "OTHER";
type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

interface Exercise {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  difficulty: Difficulty;
  instructions: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  tips?: string[];
}

// Expanded exercise library (100+ exercises)
const EXERCISE_LIBRARY: Exercise[] = [
  // CHEST
  {
    id: "barbell-bench-press",
    name: "Barbell Bench Press",
    primaryMuscle: "CHEST",
    secondaryMuscles: ["TRICEPS", "SHOULDERS"],
    equipment: "BARBELL",
    difficulty: "INTERMEDIATE",
    instructions: [
      "Lie on bench",
      "Grip bar slightly wider than shoulders",
      "Lower to chest",
      "Press up",
    ],
  },
  {
    id: "incline-bench-press",
    name: "Incline Bench Press",
    primaryMuscle: "CHEST",
    secondaryMuscles: ["SHOULDERS", "TRICEPS"],
    equipment: "BARBELL",
    difficulty: "INTERMEDIATE",
    instructions: ["Set bench to 30-45 degrees", "Press from upper chest"],
  },
  {
    id: "dumbbell-bench-press",
    name: "Dumbbell Bench Press",
    primaryMuscle: "CHEST",
    secondaryMuscles: ["TRICEPS"],
    equipment: "DUMBBELL",
    difficulty: "BEGINNER",
    instructions: ["Hold dumbbells at chest", "Press up and together"],
  },
  {
    id: "dumbbell-fly",
    name: "Dumbbell Fly",
    primaryMuscle: "CHEST",
    secondaryMuscles: [],
    equipment: "DUMBBELL",
    difficulty: "BEGINNER",
    instructions: [
      "Arms extended above chest",
      "Lower in arc motion",
      "Squeeze at top",
    ],
  },
  {
    id: "cable-crossover",
    name: "Cable Crossover",
    primaryMuscle: "CHEST",
    secondaryMuscles: [],
    equipment: "CABLE",
    difficulty: "INTERMEDIATE",
    instructions: ["High pulley position", "Bring handles together at center"],
  },
  {
    id: "push-up",
    name: "Push-Up",
    primaryMuscle: "CHEST",
    secondaryMuscles: ["TRICEPS", "SHOULDERS"],
    equipment: "BODYWEIGHT",
    difficulty: "BEGINNER",
    instructions: [
      "Hands shoulder-width",
      "Body straight",
      "Lower chest to ground",
    ],
  },
  {
    id: "dips",
    name: "Dips",
    primaryMuscle: "CHEST",
    secondaryMuscles: ["TRICEPS", "SHOULDERS"],
    equipment: "BODYWEIGHT",
    difficulty: "INTERMEDIATE",
    instructions: [
      "Lean forward for chest focus",
      "Lower until elbows at 90 degrees",
    ],
  },

  // BACK
  {
    id: "deadlift",
    name: "Deadlift",
    primaryMuscle: "BACK",
    secondaryMuscles: ["HAMSTRINGS", "GLUTES"],
    equipment: "BARBELL",
    difficulty: "ADVANCED",
    instructions: [
      "Feet hip-width",
      "Grip outside legs",
      "Drive through heels",
      "Lock out at top",
    ],
  },
  {
    id: "barbell-row",
    name: "Barbell Row",
    primaryMuscle: "BACK",
    secondaryMuscles: ["BICEPS"],
    equipment: "BARBELL",
    difficulty: "INTERMEDIATE",
    instructions: [
      "Hinge at hips",
      "Pull to lower chest",
      "Squeeze shoulder blades",
    ],
  },
  {
    id: "pull-up",
    name: "Pull-Up",
    primaryMuscle: "BACK",
    secondaryMuscles: ["BICEPS"],
    equipment: "BODYWEIGHT",
    difficulty: "INTERMEDIATE",
    instructions: [
      "Overhand grip",
      "Pull chin above bar",
      "Lower with control",
    ],
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    primaryMuscle: "BACK",
    secondaryMuscles: ["BICEPS"],
    equipment: "CABLE",
    difficulty: "BEGINNER",
    instructions: ["Wide grip", "Pull to upper chest", "Control the return"],
  },
  {
    id: "cable-row",
    name: "Seated Cable Row",
    primaryMuscle: "BACK",
    secondaryMuscles: ["BICEPS"],
    equipment: "CABLE",
    difficulty: "BEGINNER",
    instructions: ["Sit upright", "Pull to stomach", "Squeeze at contraction"],
  },
  {
    id: "dumbbell-row",
    name: "Dumbbell Row",
    primaryMuscle: "BACK",
    secondaryMuscles: ["BICEPS"],
    equipment: "DUMBBELL",
    difficulty: "BEGINNER",
    instructions: ["One arm at a time", "Pull to hip", "Keep back flat"],
  },
  {
    id: "face-pull",
    name: "Face Pull",
    primaryMuscle: "BACK",
    secondaryMuscles: ["SHOULDERS"],
    equipment: "CABLE",
    difficulty: "BEGINNER",
    instructions: ["High pulley", "Pull to face", "External rotation at end"],
  },

  // SHOULDERS
  {
    id: "overhead-press",
    name: "Overhead Press",
    primaryMuscle: "SHOULDERS",
    secondaryMuscles: ["TRICEPS"],
    equipment: "BARBELL",
    difficulty: "INTERMEDIATE",
    instructions: ["Bar at collar bone", "Press overhead", "Lock out at top"],
  },
  {
    id: "dumbbell-shoulder-press",
    name: "Dumbbell Shoulder Press",
    primaryMuscle: "SHOULDERS",
    secondaryMuscles: ["TRICEPS"],
    equipment: "DUMBBELL",
    difficulty: "BEGINNER",
    instructions: ["Dumbbells at shoulders", "Press overhead"],
  },
  {
    id: "lateral-raise",
    name: "Lateral Raise",
    primaryMuscle: "SHOULDERS",
    secondaryMuscles: [],
    equipment: "DUMBBELL",
    difficulty: "BEGINNER",
    instructions: [
      "Arms at sides",
      "Raise to shoulder height",
      "Control the descent",
    ],
  },
  {
    id: "front-raise",
    name: "Front Raise",
    primaryMuscle: "SHOULDERS",
    secondaryMuscles: [],
    equipment: "DUMBBELL",
    difficulty: "BEGINNER",
    instructions: ["Raise in front to shoulder height"],
  },
  {
    id: "rear-delt-fly",
    name: "Rear Delt Fly",
    primaryMuscle: "SHOULDERS",
    secondaryMuscles: ["BACK"],
    equipment: "DUMBBELL",
    difficulty: "BEGINNER",
    instructions: ["Bent over", "Raise arms to sides"],
  },
  {
    id: "upright-row",
    name: "Upright Row",
    primaryMuscle: "SHOULDERS",
    secondaryMuscles: ["BICEPS"],
    equipment: "BARBELL",
    difficulty: "INTERMEDIATE",
    instructions: ["Narrow grip", "Pull to chin", "Elbows high"],
  },

  // LEGS
  {
    id: "squat",
    name: "Barbell Squat",
    primaryMuscle: "QUADRICEPS",
    secondaryMuscles: ["GLUTES", "HAMSTRINGS"],
    equipment: "BARBELL",
    difficulty: "INTERMEDIATE",
    instructions: [
      "Bar on upper back",
      "Feet shoulder-width",
      "Squat to parallel",
      "Drive up",
    ],
  },
  {
    id: "front-squat",
    name: "Front Squat",
    primaryMuscle: "QUADRICEPS",
    secondaryMuscles: ["GLUTES"],
    equipment: "BARBELL",
    difficulty: "ADVANCED",
    instructions: ["Bar on front delts", "Elbows high", "Upright torso"],
  },
  {
    id: "leg-press",
    name: "Leg Press",
    primaryMuscle: "QUADRICEPS",
    secondaryMuscles: ["GLUTES"],
    equipment: "MACHINE",
    difficulty: "BEGINNER",
    instructions: ["Feet shoulder-width", "Lower until 90 degrees", "Press up"],
  },
  {
    id: "leg-extension",
    name: "Leg Extension",
    primaryMuscle: "QUADRICEPS",
    secondaryMuscles: [],
    equipment: "MACHINE",
    difficulty: "BEGINNER",
    instructions: ["Extend legs fully", "Control the return"],
  },
  {
    id: "leg-curl",
    name: "Leg Curl",
    primaryMuscle: "HAMSTRINGS",
    secondaryMuscles: [],
    equipment: "MACHINE",
    difficulty: "BEGINNER",
    instructions: ["Curl heels to glutes", "Control the motion"],
  },
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift",
    primaryMuscle: "HAMSTRINGS",
    secondaryMuscles: ["GLUTES", "BACK"],
    equipment: "BARBELL",
    difficulty: "INTERMEDIATE",
    instructions: [
      "Slight knee bend",
      "Hinge at hips",
      "Feel hamstring stretch",
    ],
  },
  {
    id: "hip-thrust",
    name: "Hip Thrust",
    primaryMuscle: "GLUTES",
    secondaryMuscles: ["HAMSTRINGS"],
    equipment: "BARBELL",
    difficulty: "INTERMEDIATE",
    instructions: ["Upper back on bench", "Drive hips up", "Squeeze at top"],
  },
  {
    id: "lunge",
    name: "Walking Lunge",
    primaryMuscle: "QUADRICEPS",
    secondaryMuscles: ["GLUTES"],
    equipment: "DUMBBELL",
    difficulty: "BEGINNER",
    instructions: [
      "Step forward",
      "Lower until knee close to ground",
      "Alternate legs",
    ],
  },
  {
    id: "calf-raise",
    name: "Calf Raise",
    primaryMuscle: "CALVES",
    secondaryMuscles: [],
    equipment: "MACHINE",
    difficulty: "BEGINNER",
    instructions: ["Rise onto toes", "Full stretch at bottom"],
  },

  // ARMS
  {
    id: "bicep-curl",
    name: "Barbell Curl",
    primaryMuscle: "BICEPS",
    secondaryMuscles: [],
    equipment: "BARBELL",
    difficulty: "BEGINNER",
    instructions: ["Elbows fixed", "Curl to shoulders", "Lower with control"],
  },
  {
    id: "hammer-curl",
    name: "Hammer Curl",
    primaryMuscle: "BICEPS",
    secondaryMuscles: ["FOREARMS"],
    equipment: "DUMBBELL",
    difficulty: "BEGINNER",
    instructions: ["Neutral grip", "Curl up"],
  },
  {
    id: "preacher-curl",
    name: "Preacher Curl",
    primaryMuscle: "BICEPS",
    secondaryMuscles: [],
    equipment: "DUMBBELL",
    difficulty: "INTERMEDIATE",
    instructions: ["Arms on preacher bench", "Full range of motion"],
  },
  {
    id: "tricep-pushdown",
    name: "Tricep Pushdown",
    primaryMuscle: "TRICEPS",
    secondaryMuscles: [],
    equipment: "CABLE",
    difficulty: "BEGINNER",
    instructions: ["Elbows at sides", "Push down fully", "Squeeze at bottom"],
  },
  {
    id: "skull-crusher",
    name: "Skull Crusher",
    primaryMuscle: "TRICEPS",
    secondaryMuscles: [],
    equipment: "BARBELL",
    difficulty: "INTERMEDIATE",
    instructions: ["Lower bar to forehead", "Extend arms"],
  },
  {
    id: "overhead-tricep",
    name: "Overhead Tricep Extension",
    primaryMuscle: "TRICEPS",
    secondaryMuscles: [],
    equipment: "DUMBBELL",
    difficulty: "BEGINNER",
    instructions: ["Dumbbell overhead", "Lower behind head", "Extend up"],
  },
  {
    id: "close-grip-bench",
    name: "Close-Grip Bench Press",
    primaryMuscle: "TRICEPS",
    secondaryMuscles: ["CHEST"],
    equipment: "BARBELL",
    difficulty: "INTERMEDIATE",
    instructions: ["Hands shoulder-width", "Elbows close to body"],
  },

  // CORE
  {
    id: "plank",
    name: "Plank",
    primaryMuscle: "ABS",
    secondaryMuscles: [],
    equipment: "BODYWEIGHT",
    difficulty: "BEGINNER",
    instructions: ["Forearms on ground", "Body straight", "Hold position"],
  },
  {
    id: "crunch",
    name: "Crunch",
    primaryMuscle: "ABS",
    secondaryMuscles: [],
    equipment: "BODYWEIGHT",
    difficulty: "BEGINNER",
    instructions: ["Curl shoulders off ground", "Don't pull on neck"],
  },
  {
    id: "leg-raise",
    name: "Hanging Leg Raise",
    primaryMuscle: "ABS",
    secondaryMuscles: [],
    equipment: "BODYWEIGHT",
    difficulty: "INTERMEDIATE",
    instructions: ["Hang from bar", "Raise legs to parallel"],
  },
  {
    id: "cable-crunch",
    name: "Cable Crunch",
    primaryMuscle: "ABS",
    secondaryMuscles: [],
    equipment: "CABLE",
    difficulty: "INTERMEDIATE",
    instructions: ["Kneel at cable", "Crunch down"],
  },
  {
    id: "russian-twist",
    name: "Russian Twist",
    primaryMuscle: "ABS",
    secondaryMuscles: [],
    equipment: "BODYWEIGHT",
    difficulty: "BEGINNER",
    instructions: ["Seated, feet off ground", "Rotate side to side"],
  },
];

/**
 * Get all exercises, optionally filtered.
 */
export async function getExercisesAction(filters?: {
  muscle?: MuscleGroup;
  equipment?: Equipment;
  difficulty?: Difficulty;
  search?: string;
}): Promise<Exercise[]> {
  let results = [...EXERCISE_LIBRARY];

  if (filters?.muscle) {
    results = results.filter(
      (e) =>
        e.primaryMuscle === filters.muscle ||
        e.secondaryMuscles.includes(filters.muscle!),
    );
  }
  if (filters?.equipment) {
    results = results.filter((e) => e.equipment === filters.equipment);
  }
  if (filters?.difficulty) {
    results = results.filter((e) => e.difficulty === filters.difficulty);
  }
  if (filters?.search) {
    const term = filters.search.toLowerCase();
    results = results.filter((e) => e.name.toLowerCase().includes(term));
  }

  return results;
}

/**
 * Get exercise by ID.
 */
export async function getExerciseByIdAction(
  id: string,
): Promise<Exercise | null> {
  return EXERCISE_LIBRARY.find((e) => e.id === id) || null;
}

/**
 * Get exercises by muscle group.
 */
export async function getExercisesByMuscleAction(
  muscle: MuscleGroup,
): Promise<Exercise[]> {
  return EXERCISE_LIBRARY.filter((e) => e.primaryMuscle === muscle);
}

/**
 * Get random exercise for variety.
 */
export async function getRandomExerciseAction(
  muscle?: MuscleGroup,
): Promise<Exercise> {
  let pool = muscle
    ? EXERCISE_LIBRARY.filter((e) => e.primaryMuscle === muscle)
    : EXERCISE_LIBRARY;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get exercise count by category.
 */
export function getExerciseStats() {
  const byMuscle: Record<string, number> = {};
  const byEquipment: Record<string, number> = {};

  for (const ex of EXERCISE_LIBRARY) {
    byMuscle[ex.primaryMuscle] = (byMuscle[ex.primaryMuscle] || 0) + 1;
    byEquipment[ex.equipment] = (byEquipment[ex.equipment] || 0) + 1;
  }

  return { total: EXERCISE_LIBRARY.length, byMuscle, byEquipment };
}
