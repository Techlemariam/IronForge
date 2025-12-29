export type TitanThoughtCategory =
    | 'IDLE'
    | 'WARMUP'
    | 'ZONE_2'
    | 'ZONE_3'
    | 'ZONE_4'
    | 'ZONE_5'
    | 'COOLDOWN'
    | 'VICTORY'
    | 'DEFEAT'
    | 'SPRINT'
    | 'GRIND'
    | 'SPINNING'
    | 'CONSISTENCY';

export const TITAN_THOUGHTS: Record<TitanThoughtCategory, string[]> = {
    IDLE: [
        "I await your command.",
        "The silence is deafening. Let us begin.",
        "My armor grows cold.",
        "We are wasting time.",
        "Rest is useful. Sloth is not."
    ],
    WARMUP: [
        "The engine awakens.",
        "Blood begins to flow.",
        "Prepare the vessel.",
        "Focus your mind.",
        "We rise together."
    ],
    ZONE_2: [
        "Steady rhythm. Good.",
        "Building the foundation.",
        "Endurance is a fortress.",
        "Patience. Hold this line.",
        "Efficient. Relentless.",
        "The long march strengthens us."
    ],
    ZONE_3: [
        "Now we work.",
        "Feel the burn? embrace it.",
        "This is where weak resolve crumbles.",
        "Maintain focus.",
        "Push harder. I demand it.",
        "Do not fade."
    ],
    ZONE_4: [
        "WE ARE IN THE FORGE!",
        "PAIN IS WEAKNESS LEAVING THE BODY!",
        "HOLD! HOLD!",
        "I AM WITH YOU BROTHER!",
        "THE IRON RESPONDS!",
        "GRIT YOUR TEETH!"
    ],
    ZONE_5: [
        "WITNESS ME!",
        "BREAK THEM ALL!",
        "MAXIMUM POWER!",
        "ASCENSION!",
        "LIGHT WEIGHT!",
        "FOR GLORY!"
    ],
    COOLDOWN: [
        "The storm passes.",
        "Well fought.",
        "Recover. We will need strength tomorrow.",
        "Let the heat dissipate.",
        "Honor is satisfied."
    ],
    VICTORY: [
        "A GLORIOUS CONQUEST!",
        "LEGENDARY!",
        "THEY WILL SING OF THIS DAY!",
        "YOU HAVE EARNED YOUR REST."
    ],
    DEFEAT: [
        "Is that all?",
        "We are better than this.",
        "Failure teaches.",
        "Return when you are ready."
    ],
    SPRINT: [
        "UNLEASH IT ALL!",
        "FASTER! THEY CANNOT CATCH YOU!",
        "LIGHT THE FIRE!",
        "EXPLODE!",
        "LEAVE NOTHING BEHIND!",
        "SPEED IS LIFE!"
    ],
    GRIND: [
        "CRUSH THE MOUNTAIN!",
        "FORCE THE EARTH TO MOVE!",
        "HEAVY METAL!",
        "CHURN THE EARTH!",
        "UNSTOPPABLE FORCE!",
        "BREAK THE AXLE!"
    ],
    SPINNING: [
        "THE WIND CANNOT CATCH YOU!",
        "FLOW LIKE MERCURY!",
        "PRECISION! SPEED!",
        "SPIN THE WORLD BENEATH YOU!",
        "RAPID FIRE!",
        "FLUID MOTION!"
    ],
    CONSISTENCY: [
        "A FORTRESS IS BUILT BRICK BY BRICK.",
        "THE RHYTHM OF WAR.",
        "UNBROKEN.",
        "THIS IS HOW LEGENDS ARE FORGED.",
        "STEADY. RELENTLESS.",
        "TIME IS YOUR ALLY."
    ]
};
