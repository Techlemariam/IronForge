import { RPVolumeStandards } from "../types/auditor";
import { VOLUME_LANDMARKS } from "./builds";

/**
 * Universal Muscle & Exercise Taxonomy
 * This map provides a canonical source for categorizing exercises by their primary muscle group.
 * It ensures that the Weakness Auditor has a consistent system for analysis.
 *
 * Structure:
 * - Key: A standardized muscle group name (e.g., "Chest", "Back (Width)", "Quads").
 * - Value: An object containing:
 *   - `exercises`: Exercise names that target this muscle (aligned with Hevy titles)
 *   - `category`: Broader movement pattern
 *   - `rpStandards`: Synced with src/data/builds.ts VOLUME_LANDMARKS
 */

export interface MuscleGroup {
  exercises: string[];
  category:
  | "Horizontal Push"
  | "Horizontal Pull"
  | "Vertical Push"
  | "Vertical Pull"
  | "Leg Push"
  | "Leg Hinge"
  | "Leg Accessory"
  | "Arms"
  | "Core"
  | "Cardio";
  rpStandards: RPVolumeStandards;
}

export const muscleMap = new Map<string, MuscleGroup>([
  [
    "Chest",
    {
      exercises: [
        "Bench Press (Barbell)",
        "Bench Press (Dumbbell)",
        "Incline Bench Press (Barbell)",
        "Incline Bench Press (Dumbbell)",
        "Push Up",
        "Dips",
        "Chest Fly",
        "Cable Fly",
        "Pec Deck",
        "Machine Press",
        "Smith Machine Bench Press",
        "Decline Bench Press",
      ],
      category: "Horizontal Push",
      rpStandards: {
        MV: VOLUME_LANDMARKS.CHEST.mv,
        MEV: VOLUME_LANDMARKS.CHEST.mev,
        MAV: [VOLUME_LANDMARKS.CHEST.mav, VOLUME_LANDMARKS.CHEST.mrv],
        MRV: VOLUME_LANDMARKS.CHEST.mrv,
      },
    },
  ],
  [
    "Back (Width)",
    {
      exercises: [
        "Pull Up",
        "Chin Up",
        "Lat Pulldown",
        "Assisted Pull Up",
        "Wide Grip Pull Up",
        "Neutral Grip Pull Up",
        "V-Bar Pulldown",
        "Straight Arm Pulldown",
      ],
      category: "Vertical Pull",
      rpStandards: {
        MV: VOLUME_LANDMARKS.BACK.mv,
        MEV: VOLUME_LANDMARKS.BACK.mev,
        MAV: [VOLUME_LANDMARKS.BACK.mav, VOLUME_LANDMARKS.BACK.mrv],
        MRV: VOLUME_LANDMARKS.BACK.mrv,
      },
    },
  ],
  [
    "Back (Thickness)",
    {
      exercises: [
        "Barbell Row",
        "Pendlay Row",
        "T-Bar Row",
        "Dumbbell Row",
        "Seated Row",
        "Cable Row",
        "Meadows Row",
        "Chest Supported Row",
        "Machine Row",
        "Standing Row",
        "45° Back Extension",
        "90° Back Extension",
        "QL Raise",
        "Rack Pull",
      ],
      category: "Horizontal Pull",
      rpStandards: {
        MV: VOLUME_LANDMARKS.BACK.mv,
        MEV: VOLUME_LANDMARKS.BACK.mev,
        MAV: [VOLUME_LANDMARKS.BACK.mav, VOLUME_LANDMARKS.BACK.mrv],
        MRV: VOLUME_LANDMARKS.BACK.mrv,
      },
    },
  ],
  [
    "Shoulders (Front)",
    {
      exercises: [
        "Overhead Press (Barbell)",
        "Overhead Press (Dumbbell)",
        "Military Press",
        "Arnold Press",
        "Front Raise",
        "Push Press",
        "Seated Dumbbell Press",
        "Machine Shoulder Press",
      ],
      category: "Vertical Push",
      rpStandards: {
        MV: VOLUME_LANDMARKS.SHOULDERS.mv,
        MEV: VOLUME_LANDMARKS.SHOULDERS.mev,
        MAV: [VOLUME_LANDMARKS.SHOULDERS.mav, VOLUME_LANDMARKS.SHOULDERS.mrv],
        MRV: VOLUME_LANDMARKS.SHOULDERS.mrv,
      },
    },
  ],
  [
    "Shoulders (Side)",
    {
      exercises: [
        "Lateral Raises",
        "Dumbbell Lateral Raise",
        "Cable Lateral Raise",
        "Machine Lateral Raise",
        "Upright Row",
        "Lu Raises",
      ],
      category: "Vertical Push",
      rpStandards: {
        MV: VOLUME_LANDMARKS.SHOULDERS.mv,
        MEV: VOLUME_LANDMARKS.SHOULDERS.mev,
        MAV: [VOLUME_LANDMARKS.SHOULDERS.mav, VOLUME_LANDMARKS.SHOULDERS.mrv],
        MRV: VOLUME_LANDMARKS.SHOULDERS.mrv,
      },
    },
  ],
  [
    "Shoulders (Rear)",
    {
      exercises: [
        "Face Pull",
        "Reverse Fly",
        "Rear Delt Fly",
        "Rear Delt Row",
        "Reverse Pec Deck",
        "Trap 3 Raise",
        "External Rotator",
      ],
      category: "Horizontal Pull",
      rpStandards: {
        MV: VOLUME_LANDMARKS.SHOULDERS.mv,
        MEV: VOLUME_LANDMARKS.SHOULDERS.mev,
        MAV: [VOLUME_LANDMARKS.SHOULDERS.mav, VOLUME_LANDMARKS.SHOULDERS.mrv],
        MRV: VOLUME_LANDMARKS.SHOULDERS.mrv,
      },
    },
  ],
  [
    "Biceps",
    {
      exercises: [
        "Bicep Curl (Dumbbell)",
        "Bicep Curl (Barbell)",
        "Hammer Curl",
        "Preacher Curl",
        "Cable Curl",
        "Concentration Curl",
        "Incline Dumbbell Curl",
        "Spider Curl",
        "Zottman Curl",
        "Bicep Curl (Upper Body Kit)",
      ],
      category: "Arms",
      rpStandards: {
        MV: VOLUME_LANDMARKS.BICEPS.mv,
        MEV: VOLUME_LANDMARKS.BICEPS.mev,
        MAV: [VOLUME_LANDMARKS.BICEPS.mav, VOLUME_LANDMARKS.BICEPS.mrv],
        MRV: VOLUME_LANDMARKS.BICEPS.mrv,
      },
    },
  ],
  [
    "Triceps",
    {
      exercises: [
        "Tricep Pushdown",
        "Skullcrusher",
        "Tricep Dips",
        "Overhead Tricep Extension",
        "Close Grip Bench Press",
        "Kickback",
        "Cable Overhead Extension",
        "JM Press",
      ],
      category: "Arms",
      rpStandards: {
        MV: VOLUME_LANDMARKS.TRICEPS.mv,
        MEV: VOLUME_LANDMARKS.TRICEPS.mev,
        MAV: [VOLUME_LANDMARKS.TRICEPS.mav, VOLUME_LANDMARKS.TRICEPS.mrv],
        MRV: VOLUME_LANDMARKS.TRICEPS.mrv,
      },
    },
  ],
  [
    "Quads",
    {
      exercises: [
        "Back Squat (Barbell)",
        "Front Squat (Barbell)",
        "Leg Press",
        "Goblet Squat",
        "Leg Extension",
        "Bulgarian Split Squat",
        "Lunges",
        "Hack Squat",
        "Belt Squat",
        "KOT Squat",
        "Reverse Nordic",
        "Step Up",
      ],
      category: "Leg Push",
      rpStandards: {
        MV: VOLUME_LANDMARKS.QUADS.mv,
        MEV: VOLUME_LANDMARKS.QUADS.mev,
        MAV: [VOLUME_LANDMARKS.QUADS.mav, VOLUME_LANDMARKS.QUADS.mrv],
        MRV: VOLUME_LANDMARKS.QUADS.mrv,
      },
    },
  ],
  [
    "Hamstrings",
    {
      exercises: [
        "Deadlift (Barbell)",
        "Romanian Deadlift (Barbell)",
        "Good Morning",
        "Leg Curl",
        "Stiff-Leg Deadlift",
        "Nordic Curl",
        "Glute Ham Raise",
        "Hamstring Curl (Seated)",
        "Hamstring Curl (Lying)",
        "Sumo Deadlift",
      ],
      category: "Leg Hinge",
      rpStandards: {
        MV: VOLUME_LANDMARKS.HAMS.mv,
        MEV: VOLUME_LANDMARKS.HAMS.mev,
        MAV: [VOLUME_LANDMARKS.HAMS.mav, VOLUME_LANDMARKS.HAMS.mrv],
        MRV: VOLUME_LANDMARKS.HAMS.mrv,
      },
    },
  ],
  [
    "Glutes",
    {
      exercises: [
        "Hip Thrust (Barbell)",
        "Hip Thrust (Machine)",
        "Glute Bridge",
        "Reverse Hyper",
        "Cable Pull Through",
        "Kickbacks",
        "Incline Pigeon",
      ],
      category: "Leg Hinge",
      rpStandards: {
        MV: VOLUME_LANDMARKS.GLUTES.mv,
        MEV: VOLUME_LANDMARKS.GLUTES.mev,
        MAV: [VOLUME_LANDMARKS.GLUTES.mav, VOLUME_LANDMARKS.GLUTES.mrv],
        MRV: VOLUME_LANDMARKS.GLUTES.mrv,
      },
    },
  ],
  [
    "Calves",
    {
      exercises: [
        "Calf Raise (Barbell)",
        "Seated Calf Raise",
        "Standing Calf Raise",
        "Donkey Calf Raise",
        "Calf Raise (Leg Press)",
        "Calf Raise (Belt Squat)",
      ],
      category: "Leg Accessory",
      rpStandards: {
        MV: VOLUME_LANDMARKS.CALVES.mv,
        MEV: VOLUME_LANDMARKS.CALVES.mev,
        MAV: [VOLUME_LANDMARKS.CALVES.mav, VOLUME_LANDMARKS.CALVES.mrv],
        MRV: VOLUME_LANDMARKS.CALVES.mrv,
      },
    },
  ],
  [
    "Abs",
    {
      exercises: [
        "Plank",
        "Ab Wheel",
        "Cable Crunch",
        "Hanging Leg Raise",
        "Sit Up",
        "GHD Sit-Up",
        "Russian Twist",
        "Woodchop",
        "Leg Raise",
        "Crunch",
        "Dragon Flag",
      ],
      category: "Core",
      rpStandards: {
        MV: VOLUME_LANDMARKS.ABS.mv,
        MEV: VOLUME_LANDMARKS.ABS.mev,
        MAV: [VOLUME_LANDMARKS.ABS.mav, VOLUME_LANDMARKS.ABS.mrv],
        MRV: VOLUME_LANDMARKS.ABS.mrv,
      },
    },
  ],
]);

/**
 * Finds the IronForge muscle group category for a given Hevy exercise title.
 * @param exerciseTitle The title of the exercise from Hevy.
 * @returns The corresponding muscle group name (e.g., "Chest") or null if not found.
 */
export const getMuscleGroupForExercise = (
  exerciseTitle: string,
): string | null => {
  for (const [group, data] of muscleMap.entries()) {
    if (
      data.exercises.some(
        (ex) => ex.toLowerCase() === exerciseTitle.toLowerCase(),
      )
    ) {
      return group;
    }
  }
  return null; // Return null if no mapping is found
};
