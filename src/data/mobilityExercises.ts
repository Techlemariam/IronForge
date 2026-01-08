/**
 * Mobility Exercises Database (ATG Integration)
 * 
 * Contains 20+ ATG-inspired mobility exercises for the Mobility Studio.
 * Each exercise has resource costs for GPE budget integration.
 */

export type MobilityRegion =
    | "ankle"
    | "hip_flexor"
    | "hip_external_rotation"
    | "thoracic"
    | "shoulder"
    | "wrist"
    | "hamstring"
    | "quad"
    | "knee"
    | "calf"
    | "neck"
    | "lower_back";

export type MobilitySource = "ATG" | "GOWOD" | "CUSTOM";
export type MobilityDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface MobilityExercise {
    id: string;
    name: string;
    source: MobilitySource;
    difficulty: MobilityDifficulty;
    durationSecs: number;
    videoUrl?: string;
    instructions?: string;

    // Resource Cost (per minute)
    resourceCost: {
        cns: number;       // 0.1-0.4 per min
        muscular: number;  // 0.1-0.3 per min
        metabolic: number; // 0.05-0.1 per min (always low)
    };

    targetRegions: MobilityRegion[];
}

/**
 * ATG-Inspired Mobility Exercise Library
 * Based on Knees Over Toes Guy / ATG methodology
 */
export const MOBILITY_EXERCISES: MobilityExercise[] = [
    // === ANKLE & TIBIALIS (ATG Foundation) ===
    {
        id: "atg-tibialis-raise",
        name: "Tibialis Raise",
        source: "ATG",
        difficulty: "BEGINNER",
        durationSecs: 60,
        videoUrl: "https://www.youtube.com/watch?v=gT5C5wSEeCg",
        instructions: "Stand with heels elevated. Raise toes as high as possible. 25 reps.",
        resourceCost: { cns: 0.2, muscular: 0.15, metabolic: 0.05 },
        targetRegions: ["ankle", "calf"],
    },
    {
        id: "atg-calf-raise-sl",
        name: "Single Leg Calf Raise",
        source: "ATG",
        difficulty: "INTERMEDIATE",
        durationSecs: 90,
        videoUrl: "https://www.youtube.com/watch?v=HuW3Z8tFhKs",
        instructions: "Full ROM calf raise on one leg. 15 reps each side.",
        resourceCost: { cns: 0.25, muscular: 0.2, metabolic: 0.05 },
        targetRegions: ["calf", "ankle"],
    },
    {
        id: "atg-tib-bar-raise",
        name: "Tib Bar Raise",
        source: "ATG",
        difficulty: "INTERMEDIATE",
        durationSecs: 60,
        instructions: "Using tib bar, raise foot against resistance. 15-25 reps.",
        resourceCost: { cns: 0.2, muscular: 0.2, metabolic: 0.05 },
        targetRegions: ["ankle"],
    },

    // === KNEE & QUAD ===
    {
        id: "atg-patrick-step",
        name: "Patrick Step",
        source: "ATG",
        difficulty: "BEGINNER",
        durationSecs: 90,
        videoUrl: "https://www.youtube.com/watch?v=9g2k6Xj6gqU",
        instructions: "Step forward letting back knee drive toward ground. Heel stays down. 10 each leg.",
        resourceCost: { cns: 0.3, muscular: 0.15, metabolic: 0.05 },
        targetRegions: ["knee", "hip_flexor", "quad"],
    },
    {
        id: "atg-atg-split-squat",
        name: "ATG Split Squat",
        source: "ATG",
        difficulty: "INTERMEDIATE",
        durationSecs: 120,
        videoUrl: "https://www.youtube.com/watch?v=J9f2W6x8sx4",
        instructions: "Deep split squat with back knee touching ground. 8-12 each leg.",
        resourceCost: { cns: 0.35, muscular: 0.25, metabolic: 0.1 },
        targetRegions: ["knee", "hip_flexor", "quad"],
    },
    {
        id: "atg-sissy-squat",
        name: "Sissy Squat",
        source: "ATG",
        difficulty: "ADVANCED",
        durationSecs: 90,
        instructions: "Lower back while pushing knees forward. Full ROM. 10-15 reps.",
        resourceCost: { cns: 0.4, muscular: 0.3, metabolic: 0.1 },
        targetRegions: ["knee", "quad"],
    },
    {
        id: "atg-poliquin-step-up",
        name: "Poliquin Step-Up",
        source: "ATG",
        difficulty: "BEGINNER",
        durationSecs: 60,
        instructions: "Step up on low box, driving knee forward. 15 each leg.",
        resourceCost: { cns: 0.2, muscular: 0.15, metabolic: 0.05 },
        targetRegions: ["knee", "quad"],
    },

    // === HIP FLEXOR ===
    {
        id: "atg-couch-stretch",
        name: "Couch Stretch",
        source: "ATG",
        difficulty: "BEGINNER",
        durationSecs: 120,
        videoUrl: "https://www.youtube.com/watch?v=lgxXL5pQzYk",
        instructions: "Back foot on wall/couch, front foot forward. Squeeze glute. 60s each side.",
        resourceCost: { cns: 0.15, muscular: 0.2, metabolic: 0.05 },
        targetRegions: ["hip_flexor", "quad"],
    },
    {
        id: "atg-hip-flexor-stretch",
        name: "Hip Flexor Stretch (Active)",
        source: "ATG",
        difficulty: "BEGINNER",
        durationSecs: 90,
        instructions: "Half-kneeling position, actively squeeze glute and push hips forward.",
        resourceCost: { cns: 0.2, muscular: 0.15, metabolic: 0.05 },
        targetRegions: ["hip_flexor"],
    },

    // === HIP EXTERNAL ROTATION ===
    {
        id: "atg-90-90-stretch",
        name: "90/90 Hip Stretch",
        source: "ATG",
        difficulty: "INTERMEDIATE",
        durationSecs: 120,
        instructions: "Sit with both legs at 90 degrees. Rotate torso over front leg. 60s each side.",
        resourceCost: { cns: 0.15, muscular: 0.2, metabolic: 0.05 },
        targetRegions: ["hip_external_rotation"],
    },
    {
        id: "atg-pigeon-pose",
        name: "Pigeon Pose",
        source: "ATG",
        difficulty: "BEGINNER",
        durationSecs: 120,
        instructions: "Front leg bent across body, back leg extended. 60s each side.",
        resourceCost: { cns: 0.1, muscular: 0.2, metabolic: 0.05 },
        targetRegions: ["hip_external_rotation", "hip_flexor"],
    },

    // === HAMSTRING ===
    {
        id: "atg-jefferson-curl",
        name: "Jefferson Curl",
        source: "ATG",
        difficulty: "INTERMEDIATE",
        durationSecs: 90,
        videoUrl: "https://www.youtube.com/watch?v=6h5X5_z_q_Q",
        instructions: "Stand on elevated surface. Roll spine down vertebra by vertebra. Light weight.",
        resourceCost: { cns: 0.4, muscular: 0.25, metabolic: 0.05 },
        targetRegions: ["hamstring", "thoracic", "lower_back"],
    },
    {
        id: "atg-romanian-deadlift-stretch",
        name: "RDL Stretch Hold",
        source: "ATG",
        difficulty: "BEGINNER",
        durationSecs: 60,
        instructions: "Hold bottom position of RDL with light weight. 30-60s.",
        resourceCost: { cns: 0.25, muscular: 0.2, metabolic: 0.05 },
        targetRegions: ["hamstring"],
    },
    {
        id: "atg-elephant-walk",
        name: "Elephant Walk",
        source: "ATG",
        difficulty: "BEGINNER",
        durationSecs: 60,
        instructions: "Walk forward with hands and feet, keeping legs straight. 20 steps.",
        resourceCost: { cns: 0.2, muscular: 0.15, metabolic: 0.1 },
        targetRegions: ["hamstring", "calf"],
    },

    // === THORACIC & SHOULDER ===
    {
        id: "atg-cat-cow",
        name: "Cat-Cow",
        source: "ATG",
        difficulty: "BEGINNER",
        durationSecs: 60,
        instructions: "On all fours, alternate between arching and rounding spine. 15 cycles.",
        resourceCost: { cns: 0.1, muscular: 0.1, metabolic: 0.05 },
        targetRegions: ["thoracic", "lower_back"],
    },
    {
        id: "atg-thoracic-rotation",
        name: "Thoracic Rotation",
        source: "ATG",
        difficulty: "BEGINNER",
        durationSecs: 90,
        instructions: "On all fours, rotate one arm to ceiling. 10 each side.",
        resourceCost: { cns: 0.15, muscular: 0.1, metabolic: 0.05 },
        targetRegions: ["thoracic"],
    },
    {
        id: "atg-wall-angels",
        name: "Wall Angels",
        source: "ATG",
        difficulty: "BEGINNER",
        durationSecs: 60,
        instructions: "Back against wall, arms in W position. Slide up and down. 15 reps.",
        resourceCost: { cns: 0.2, muscular: 0.15, metabolic: 0.05 },
        targetRegions: ["shoulder", "thoracic"],
    },
    {
        id: "atg-shoulder-dislocates",
        name: "Shoulder Dislocates",
        source: "ATG",
        difficulty: "INTERMEDIATE",
        durationSecs: 60,
        instructions: "With band or stick, rotate arms overhead and behind. 15 reps.",
        resourceCost: { cns: 0.2, muscular: 0.15, metabolic: 0.05 },
        targetRegions: ["shoulder"],
    },
    {
        id: "atg-face-pull-stretch",
        name: "Face Pull Hold",
        source: "ATG",
        difficulty: "BEGINNER",
        durationSecs: 45,
        instructions: "Hold face pull position with external rotation. 30-45s.",
        resourceCost: { cns: 0.15, muscular: 0.15, metabolic: 0.05 },
        targetRegions: ["shoulder"],
    },

    // === WRIST ===
    {
        id: "atg-wrist-circles",
        name: "Wrist Circles",
        source: "ATG",
        difficulty: "BEGINNER",
        durationSecs: 30,
        instructions: "Circle wrists in both directions. 10 each way.",
        resourceCost: { cns: 0.1, muscular: 0.05, metabolic: 0.05 },
        targetRegions: ["wrist"],
    },
    {
        id: "atg-wrist-stretch-floor",
        name: "Floor Wrist Stretches",
        source: "ATG",
        difficulty: "BEGINNER",
        durationSecs: 60,
        instructions: "On hands and knees, rotate wrists in various positions. Rock back and forth.",
        resourceCost: { cns: 0.15, muscular: 0.1, metabolic: 0.05 },
        targetRegions: ["wrist"],
    },

    // === NECK ===
    {
        id: "atg-neck-rotations",
        name: "Neck Rotations",
        source: "ATG",
        difficulty: "BEGINNER",
        durationSecs: 45,
        instructions: "Gently rotate neck in full circles. 5 each direction.",
        resourceCost: { cns: 0.1, muscular: 0.05, metabolic: 0.05 },
        targetRegions: ["neck"],
    },
    {
        id: "atg-neck-flexion-extension",
        name: "Neck Flexion/Extension",
        source: "ATG",
        difficulty: "BEGINNER",
        durationSecs: 30,
        instructions: "Slowly nod head forward and back with control. 10 reps.",
        resourceCost: { cns: 0.1, muscular: 0.05, metabolic: 0.05 },
        targetRegions: ["neck"],
    },
];

/**
 * Get exercises by target region
 */
export function getExercisesByRegion(region: MobilityRegion): MobilityExercise[] {
    return MOBILITY_EXERCISES.filter(e => e.targetRegions.includes(region));
}

/**
 * Get exercises by difficulty
 */
export function getExercisesByDifficulty(difficulty: MobilityDifficulty): MobilityExercise[] {
    return MOBILITY_EXERCISES.filter(e => e.difficulty === difficulty);
}

/**
 * Calculate total resource cost for a mobility session
 */
export function calculateSessionCost(
    exercises: { exerciseId: string; durationSecs: number }[]
): { cns: number; muscular: number; metabolic: number } {
    let totalCns = 0;
    let totalMuscular = 0;
    let totalMetabolic = 0;

    for (const session of exercises) {
        const exercise = MOBILITY_EXERCISES.find(e => e.id === session.exerciseId);
        if (exercise) {
            const durationMins = session.durationSecs / 60;
            totalCns += exercise.resourceCost.cns * durationMins;
            totalMuscular += exercise.resourceCost.muscular * durationMins;
            totalMetabolic += exercise.resourceCost.metabolic * durationMins;
        }
    }

    return {
        cns: Math.round(totalCns * 10) / 10,
        muscular: Math.round(totalMuscular * 10) / 10,
        metabolic: Math.round(totalMetabolic * 10) / 10,
    };
}
