
/**
 * Equipment Database
 * Maps exercises to their required equipment and identifies Hyper Pro compatibility.
 */

export enum EquipmentType {
    BODYWEIGHT = 'bodyweight',
    BARBELL = 'barbell',
    DUMBBELL = 'dumbbell',
    CABLE = 'cable',
    MACHINE = 'machine',
    KETTLEBELL = 'kettlebell',
    BAND = 'band',
    HYPER_PRO = 'hyper_pro' // Freak Athlete Hyper Pro 10-in-1
}

export interface EquipmentRequirement {
    types: EquipmentType[]; // OR logic (e.g., [DUMBBELL, CABLE] means either works)
    isHyperProCompatible: boolean;
    hyperProMode?: string; // e.g., "GHD Mode", "Back Extension Mode"
}

// Map exercise names (must match muscleMap.ts / Hevy titles) to requirements
export const exerciseEquipmentMap = new Map<string, EquipmentRequirement>([
    // --- CHEST ---
    ["Bench Press (Barbell)", { types: [EquipmentType.BARBELL], isHyperProCompatible: false }],
    ["Bench Press (Dumbbell)", { types: [EquipmentType.DUMBBELL], isHyperProCompatible: false }],
    ["Incline Bench Press (Barbell)", { types: [EquipmentType.BARBELL], isHyperProCompatible: false }],
    ["Incline Bench Press (Dumbbell)", { types: [EquipmentType.DUMBBELL], isHyperProCompatible: false }],
    ["Push Up", { types: [EquipmentType.BODYWEIGHT], isHyperProCompatible: true, hyperProMode: "Flat/Incline (Bench)" }],
    ["Dips", { types: [EquipmentType.BODYWEIGHT], isHyperProCompatible: true, hyperProMode: "Dip Station" }],
    ["Chest Fly", { types: [EquipmentType.DUMBBELL], isHyperProCompatible: false }],
    ["Cable Fly", { types: [EquipmentType.CABLE], isHyperProCompatible: false }],

    // --- BACK ---
    ["Pull Up", { types: [EquipmentType.BODYWEIGHT], isHyperProCompatible: false }], // Needs pullup bar (Hyper Pro doesn't have high bar)
    ["Chin Up", { types: [EquipmentType.BODYWEIGHT], isHyperProCompatible: false }],
    ["Barbell Row", { types: [EquipmentType.BARBELL], isHyperProCompatible: false }],
    ["Pendlay Row", { types: [EquipmentType.BARBELL], isHyperProCompatible: false }],
    ["Dumbbell Row", { types: [EquipmentType.DUMBBELL], isHyperProCompatible: false }],
    ["45° Back Extension", { types: [EquipmentType.MACHINE], isHyperProCompatible: true, hyperProMode: "45° Extension" }],
    ["90° Back Extension", { types: [EquipmentType.MACHINE], isHyperProCompatible: true, hyperProMode: "90° Extension" }],
    ["Rack Pull", { types: [EquipmentType.BARBELL], isHyperProCompatible: false }],

    // --- SHOULDERS ---
    ["Overhead Press (Barbell)", { types: [EquipmentType.BARBELL], isHyperProCompatible: false }],
    ["Lateral Raises", { types: [EquipmentType.DUMBBELL], isHyperProCompatible: false }],
    ["Face Pull", { types: [EquipmentType.CABLE], isHyperProCompatible: false }],
    ["Rear Delt Fly", { types: [EquipmentType.DUMBBELL], isHyperProCompatible: false }],
    ["Lu Raises", { types: [EquipmentType.DUMBBELL], isHyperProCompatible: false }],

    // --- LEGS (QUADS) ---
    ["Back Squat (Barbell)", { types: [EquipmentType.BARBELL], isHyperProCompatible: false }],
    ["Front Squat (Barbell)", { types: [EquipmentType.BARBELL], isHyperProCompatible: false }],
    ["Goblet Squat", { types: [EquipmentType.DUMBBELL, EquipmentType.KETTLEBELL], isHyperProCompatible: true, hyperProMode: "Slant Board Squat" }],
    ["Bulgarian Split Squat", { types: [EquipmentType.DUMBBELL, EquipmentType.BODYWEIGHT], isHyperProCompatible: true, hyperProMode: "Split Squat Stand" }],
    ["Leg Extension", { types: [EquipmentType.MACHINE], isHyperProCompatible: true, hyperProMode: "Leg Extension Attachment" }],
    ["Sissy Squat", { types: [EquipmentType.BODYWEIGHT], isHyperProCompatible: true, hyperProMode: "Sissy Squat Station" }],
    ["Reverse Nordic", { types: [EquipmentType.BODYWEIGHT], isHyperProCompatible: true, hyperProMode: "Floor/Pad" }],
    ["KOT Squat", { types: [EquipmentType.BODYWEIGHT], isHyperProCompatible: true, hyperProMode: "Slant Board" }],

    // --- LEGS (HAMSTRINGS/GLUTES) ---
    ["Deadlift (Barbell)", { types: [EquipmentType.BARBELL], isHyperProCompatible: false }],
    ["Romanian Deadlift (Barbell)", { types: [EquipmentType.BARBELL], isHyperProCompatible: false }],
    ["Nordic Curl", { types: [EquipmentType.BODYWEIGHT], isHyperProCompatible: true, hyperProMode: "Nordic Station" }],
    ["Glute Ham Raise", { types: [EquipmentType.BODYWEIGHT], isHyperProCompatible: true, hyperProMode: "GHD" }],
    ["Hamstring Curl (Lying)", { types: [EquipmentType.MACHINE], isHyperProCompatible: true, hyperProMode: "Leg Curl Attachment" }],
    ["Reverse Hyper", { types: [EquipmentType.MACHINE], isHyperProCompatible: true, hyperProMode: "Reverse Hyper Attachment" }],
    ["Hip Thrust (Barbell)", { types: [EquipmentType.BARBELL], isHyperProCompatible: false }],
    ["45° Back Extension", { types: [EquipmentType.MACHINE], isHyperProCompatible: true, hyperProMode: "45° Extension (Glute Bias)" }],

    // --- CORE ---
    ["GHD Sit-Up", { types: [EquipmentType.BODYWEIGHT], isHyperProCompatible: true, hyperProMode: "GHD" }],
    ["Dragon Flag", { types: [EquipmentType.BODYWEIGHT], isHyperProCompatible: true, hyperProMode: "Bench Handle" }],
    ["Decline Sit Up", { types: [EquipmentType.BODYWEIGHT], isHyperProCompatible: true, hyperProMode: "Decline Bench" }],
]);

/**
 * Checks if an exercise can be performed with the user's available equipment.
 * @param exerciseName Name of the exercise
 * @param ownedEquipment List of owned equipment types
 * @param prioritizeHyperPro If true, checks if Hyper Pro is owned AND exercise is compatible
 */
export const canPerformExercise = (
    exerciseName: string,
    ownedEquipment: EquipmentType[],
    prioritizeHyperPro: boolean = false
): boolean => {
    const req = exerciseEquipmentMap.get(exerciseName);

    // Default to true if not mapped (assume bodyweight or generic)
    if (!req) return true;

    // Hyper Pro Priority Check
    if (prioritizeHyperPro && req.isHyperProCompatible) {
        if (ownedEquipment.includes(EquipmentType.HYPER_PRO)) {
            return true;
        }
    }

    // Standard Check: Do we own AT LEAST ONE of the required types?
    return req.types.some(type => ownedEquipment.includes(type));
};
