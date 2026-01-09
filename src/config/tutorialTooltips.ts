/**
 * Tutorial Tooltips Configuration
 * 
 * Defines tooltips for complex game mechanics.
 * Used throughout the app to guide first-time users.
 */

export const TUTORIAL_TOOLTIPS = {
    DUAL_COEFFICIENT: {
        id: "dual-coefficient-volume",
        title: "Dual-Coefficient Volume",
        content:
            "This advanced system tracks both stimulus (how hard you train) and recovery (how well you adapt). The dual bars show your current training load vs. your recovery capacity.",
    },
    BUFFS_SYSTEM: {
        id: "bio-combat-buffs",
        title: "Bio-Combat Buffs",
        content:
            "Your real-world training unlocks combat buffs! Good sleep = +10% XP, high HRV = +5% damage. Train smart in real life to dominate in the arena.",
    },
    TSB_METRIC: {
        id: "tsb-training-stress",
        title: "TSB (Training Stress Balance)",
        content:
            "TSB measures your freshness. Positive = well-rested, negative = fatigued. The Oracle uses this to recommend rest days or push harder.",
    },
    MACRO_PHASES: {
        id: "macro-phase-system",
        title: "Macro Phases",
        content:
            "Your training cycles through phases: ALPHA (base building), BETA (intensity), GAMMA (recovery). The system auto-rotates based on your performance and fatigue.",
    },
    RESOURCE_BUDGET: {
        id: "daily-resource-budget",
        title: "Daily Resource Budget",
        content:
            "You have three resources: CNS (neural), Muscular, and Metabolic. Each workout costs resources. Poor sleep or high stress reduces your budget.",
    },
    TERRITORY_CONQUEST: {
        id: "territory-conquest",
        title: "Territory Conquest",
        content:
            "Guilds compete for map control. Your training volume contributes influence points. Control territories to earn guild-wide bonuses like +5% XP or +10% Gold.",
    },
    PVP_RANKING: {
        id: "pvp-ranking-system",
        title: "PvP Ranking",
        content:
            "Earn rating by winning duels. Climb from Private to High Warlord. Higher ranks unlock exclusive titles and cosmetic rewards.",
    },
    ORACLE_AI: {
        id: "oracle-ai-coach",
        title: "The Iron Oracle",
        content:
            "Your AI coach analyzes your biometrics (HRV, sleep, TSB) and recommends optimal training. It uses the Goal-Priority Engine for scientifically-grounded advice.",
    },
} as const;

export type TutorialTooltipId = keyof typeof TUTORIAL_TOOLTIPS;
