// src/data/muscleMap.ts

/**
 * Universal Muscle & Exercise Taxonomy
 * This map provides a canonical source for categorizing exercises by their primary muscle group.
 * It ensures that the Weakness Auditor has a consistent system for analysis.
 * 
 * Structure:
 * - Key: A standardized muscle group name (e.g., "Chest", "Back", "Quads").
 * - Value: An object containing:
 *   - `exercises`: An array of strings representing names of exercises targeting this muscle.
 *                  These names should align with Hevy's exercise titles for accurate mapping.
 *   - `category`: A broader movement pattern (e.g., "Horizontal Push", "Vertical Pull").
 */

export interface MuscleGroup {
    exercises: string[];
    category: 'Horizontal Push' | 'Horizontal Pull' | 'Vertical Push' | 'Vertical Pull' | 'Leg Push' | 'Leg Hinge' | 'Leg Accessory' | 'Arms' | 'Core' | 'Cardio';
}

export const muscleMap = new Map<string, MuscleGroup>([
    ["Chest", {
        exercises: ["Bench Press (Barbell)", "Bench Press (Dumbbell)", "Incline Bench Press (Barbell)", "Incline Bench Press (Dumbbell)", "Push Up"],
        category: "Horizontal Push"
    }],
    ["Back", {
        exercises: ["Barbell Row", "Pendlay Row", "Pull Up", "Chin Up", "Lat Pulldown", "T-Bar Row"],
        category: "Horizontal Pull" // Note: A mix of horizontal and vertical, but can be broadly categorized.
    }],
    ["Lats", {
        exercises: ["Pull Up", "Chin Up", "Lat Pulldown"],
        category: "Vertical Pull"
    }],
    ["Shoulders", {
        exercises: ["Overhead Press (Barbell)", "Overhead Press (Dumbbell)", "Arnold Press", "Lateral Raises"],
        category: "Vertical Push"
    }],
    ["Quads", {
        exercises: ["Back Squat (Barbell)", "Front Squat (Barbell)", "Leg Press", "Goblet Squat"],
        category: "Leg Push"
    }],
    ["Hamstrings", {
        exercises: ["Deadlift (Barbell)", "Romanian Deadlift (Barbell)", "Good Morning", "Leg Curl"],
        category: "Leg Hinge"
    }],
    ["Glutes", {
        exercises: ["Hip Thrust (Barbell)", "Back Squat (Barbell)", "Deadlift (Barbell)"],
        category: "Leg Hinge"
    }],
    ["Biceps", {
        exercises: ["Bicep Curl (Dumbbell)", "Bicep Curl (Barbell)", "Hammer Curl"],
        category: "Arms"
    }],
    ["Triceps", {
        exercises: ["Tricep Pushdown", "Skullcrusher", "Dips"],
        category: "Arms"
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
