// src/data/muscleMap.ts

import { RPVolumeStandards } from '../types/auditor';

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
 *   - `rpStandards`: Mike Israetel volume landmarks (MEV/MAV/MRV)
 */

export interface MuscleGroup {
    exercises: string[];
    category: 'Horizontal Push' | 'Horizontal Pull' | 'Vertical Push' | 'Vertical Pull' | 'Leg Push' | 'Leg Hinge' | 'Leg Accessory' | 'Arms' | 'Core' | 'Cardio';
    rpStandards: RPVolumeStandards;
}

export const muscleMap = new Map<string, MuscleGroup>([
    ["Chest", {
        exercises: [
            "Bench Press (Barbell)", "Bench Press (Dumbbell)", "Incline Bench Press (Barbell)",
            "Incline Bench Press (Dumbbell)", "Push Up", "Dips", "Chest Fly", "Cable Fly",
            "Pec Deck", "Machine Press", "Smith Machine Bench Press", "Decline Bench Press"
        ],
        category: "Horizontal Push",
        rpStandards: { MV: 0, MEV: 10, MAV: [12, 20], MRV: 22 }
    }],
    ["Back (Width)", {
        exercises: [
            "Pull Up", "Chin Up", "Lat Pulldown", "Assisted Pull Up", "Wide Grip Pull Up",
            "Neutral Grip Pull Up", "V-Bar Pulldown", "Straight Arm Pulldown"
        ],
        category: "Vertical Pull",
        rpStandards: { MV: 0, MEV: 10, MAV: [12, 22], MRV: 25 }
    }],
    ["Back (Thickness)", {
        exercises: [
            "Barbell Row", "Pendlay Row", "T-Bar Row", "Dumbbell Row", "Seated Row",
            "Cable Row", "Meadows Row", "Chest Supported Row", "Machine Row", "Standing Row",
            "45° Back Extension", "90° Back Extension", "QL Raise", "Rack Pull"
        ],
        category: "Horizontal Pull",
        rpStandards: { MV: 8, MEV: 8, MAV: [10, 18], MRV: 20 }
    }],
    ["Shoulders (Front)", {
        exercises: [
            "Overhead Press (Barbell)", "Overhead Press (Dumbbell)", "Military Press",
            "Arnold Press", "Front Raise", "Push Press", "Seated Dumbbell Press", "Machine Shoulder Press"
        ],
        category: "Vertical Push",
        rpStandards: { MV: 0, MEV: 0, MAV: [0, 0], MRV: 6 } // Indirect work from pressing is usually sufficient
    }],
    ["Shoulders (Side)", {
        exercises: [
            "Lateral Raises", "Dumbbell Lateral Raise", "Cable Lateral Raise",
            "Machine Lateral Raise", "Upright Row", "Lu Raises"
        ],
        category: "Vertical Push",
        rpStandards: { MV: 0, MEV: 8, MAV: [12, 20], MRV: 26 }
    }],
    ["Shoulders (Rear)", {
        exercises: [
            "Face Pull", "Reverse Fly", "Rear Delt Fly", "Rear Delt Row",
            "Reverse Pec Deck", "Trap 3 Raise", "External Rotator"
        ],
        category: "Horizontal Pull",
        rpStandards: { MV: 0, MEV: 8, MAV: [12, 22], MRV: 26 }
    }],
    ["Biceps", {
        exercises: [
            "Bicep Curl (Dumbbell)", "Bicep Curl (Barbell)", "Hammer Curl", "Preacher Curl",
            "Cable Curl", "Concentration Curl", "Incline Dumbbell Curl", "Spider Curl", "Zottman Curl",
            "Bicep Curl (Upper Body Kit)"
        ],
        category: "Arms",
        rpStandards: { MV: 0, MEV: 8, MAV: [14, 20], MRV: 26 }
    }],
    ["Triceps", {
        exercises: [
            "Tricep Pushdown", "Skullcrusher", "Tricep Dips", "Overhead Tricep Extension",
            "Close Grip Bench Press", "Kickback", "Cable Overhead Extension", "JM Press"
        ],
        category: "Arms",
        rpStandards: { MV: 0, MEV: 6, MAV: [10, 14], MRV: 18 }
    }],
    ["Quads", {
        exercises: [
            "Back Squat (Barbell)", "Front Squat (Barbell)", "Leg Press", "Goblet Squat",
            "Leg Extension", "Bulgarian Split Squat", "Lunges", "Hack Squat", "Belt Squat",
            "KOT Squat", "Reverse Nordic", "Step Up"
        ],
        category: "Leg Push",
        rpStandards: { MV: 0, MEV: 8, MAV: [12, 18], MRV: 20 }
    }],
    ["Hamstrings", {
        exercises: [
            "Deadlift (Barbell)", "Romanian Deadlift (Barbell)", "Good Morning", "Leg Curl",
            "Stiff-Leg Deadlift", "Nordic Curl", "Glute Ham Raise", "Hamstring Curl (Seated)",
            "Hamstring Curl (Lying)", "Sumo Deadlift"
        ],
        category: "Leg Hinge",
        rpStandards: { MV: 0, MEV: 6, MAV: [10, 16], MRV: 20 }
    }],
    ["Glutes", {
        exercises: [
            "Hip Thrust (Barbell)", "Hip Thrust (Machine)", "Glute Bridge", "Reverse Hyper",
            "Cable Pull Through", "Kickbacks", "Incline Pigeon"
        ],
        category: "Leg Hinge",
        rpStandards: { MV: 0, MEV: 0, MAV: [4, 12], MRV: 16 }
    }],
    ["Calves", {
        exercises: [
            "Calf Raise (Barbell)", "Seated Calf Raise", "Standing Calf Raise", "Donkey Calf Raise",
            "Calf Raise (Leg Press)", "Calf Raise (Belt Squat)"
        ],
        category: "Leg Accessory",
        rpStandards: { MV: 0, MEV: 8, MAV: [12, 16], MRV: 20 }
    }],
    ["Abs", {
        exercises: [
            "Plank", "Ab Wheel", "Cable Crunch", "Hanging Leg Raise", "Sit Up", "GHD Sit-Up",
            "Russian Twist", "Woodchop", "Leg Raise", "Crunch", "Dragon Flag"
        ],
        category: "Core",
        rpStandards: { MV: 0, MEV: 0, MAV: [12, 20], MRV: 25 }
    }],
]);

/**
 * Finds the IronForge muscle group category for a given Hevy exercise title.
 * @param exerciseTitle The title of the exercise from Hevy.
 * @returns The corresponding muscle group name (e.g., "Chest") or null if not found.
 */
export const getMuscleGroupForExercise = (exerciseTitle: string): string | null => {
    for (const [group, data] of muscleMap.entries()) {
        if (data.exercises.some(ex => ex.toLowerCase() === exerciseTitle.toLowerCase())) {
            return group;
        }
    }
    return null; // Return null if no mapping is found
};
