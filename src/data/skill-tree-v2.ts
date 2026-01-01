/**
 * @fileoverview Neural Lattice V2 Data
 * PoE-inspired Neural Lattice with tiered nodes (Minor, Notable, Keystone)
 */

import { SkillNodeV2, TitanRank } from "../types/skills";

// ============================================================================
// ATTRIBUTE / ORIGIN NODES (Starting Points)
// ============================================================================

const ORIGINS: SkillNodeV2[] = [
  {
    id: "origin_juggernaut",
    title: "Juggernaut Origin",
    description: "The Path of Iron. Strength above all.",
    tier: "notable", // Origins are treated as notables but are free
    path: "juggernaut",
    category: "strength",
    parents: [],
    unlockLogic: "AND",
    position: { x: 0, y: 0 },
    effects: {
      titanLoadMultiplier: 1.1, // +10% Titan Load
      flatTpBonus: 5,
    },
    currency: "talent_point",
    cost: 0, // Origins are free
    requirements: [],
  },
  {
    id: "origin_pathfinder",
    title: "Pathfinder Origin",
    description: "The Path of Wind. Endurance is eternal.",
    tier: "notable",
    path: "pathfinder",
    category: "endurance",
    parents: [],
    unlockLogic: "AND",
    position: { x: -400, y: 0 },
    effects: {
      ksMultiplier: 1.1, // +10% Kinetic Shards
      flatKsBonus: 500,
    },
    currency: "kinetic_shard",
    cost: 0,
    requirements: [],
  },
  {
    id: "origin_warden",
    title: "Warden Origin",
    description: "The Path of Balance. Master all, fear none.",
    tier: "notable",
    path: "warden",
    category: "hybrid",
    parents: [],
    unlockLogic: "AND",
    position: { x: 200, y: 200 },
    effects: {
      tpMultiplier: 1.05,
      ksMultiplier: 1.05,
    },
    currency: "talent_point",
    cost: 0,
    requirements: [],
  },
  {
    id: "origin_titan",
    title: "Titan Origin",
    description: "The Path of Mass. Volume is king.",
    tier: "notable",
    path: "titan",
    category: "hypertrophy",
    parents: [],
    unlockLogic: "AND",
    position: { x: 400, y: 0 },
    effects: {
      titanLoadMultiplier: 1.1,
    },
    currency: "talent_point",
    cost: 0,
    requirements: [],
  },
  {
    id: "origin_sage",
    title: "Sage Origin",
    description: "The Path of Wisdom. Recovery is training.",
    tier: "notable",
    path: "sage",
    category: "utility",
    parents: [],
    unlockLogic: "AND",
    position: { x: 0, y: 400 },
    effects: {
      recoveryRateMultiplier: 1.1,
      passiveTpPerDay: 1,
    },
    currency: "talent_point",
    cost: 0,
    requirements: [],
  },
];

// ============================================================================
// JUGGERNAUT PATH: NOTABLES
// ============================================================================

const JUGGERNAUT_NOTABLES: SkillNodeV2[] = [
  {
    id: "notable_iron_shoulder",
    title: "Iron Shoulder",
    description:
      "Stabilize the overhead press. Unlocks Viking Press variation.",
    tier: "notable",
    path: "juggernaut",
    category: "strength",
    parents: ["origin_juggernaut"],
    unlockLogic: "AND",
    position: { x: 0, y: -150 },
    effects: {
      titanLoadMultiplier: 1.15, // +15% from pressing
      unlocksVikingPress: true,
    },
    currency: "talent_point",
    cost: 1,
    requirements: [
      {
        type: "1rm_weight",
        exerciseId: "ex_landmine_press",
        value: 30,
        comparison: "gte",
      },
    ],
  },
  {
    id: "notable_viking_strength",
    title: "Viking Strength",
    description:
      "Mastery of the Landmine. Adds +2.5kg to Training Max calculations.",
    tier: "notable",
    path: "juggernaut",
    category: "strength",
    parents: ["notable_iron_shoulder"],
    unlockLogic: "AND",
    position: { x: 0, y: -300 },
    effects: {
      flatTitanLoad: 10,
      flatTpBonus: 1, // +1 TP per pressing session
    },
    currency: "talent_point",
    cost: 2,
    requirements: [
      {
        type: "1rm_weight",
        exerciseId: "ex_landmine_press",
        value: 50,
        comparison: "gte",
      },
    ],
  },
  {
    id: "notable_apex_predator",
    title: "Apex Predator",
    description:
      "Daily 1RM inputs no longer require warmup confirmation. Ready on arrival.",
    tier: "notable",
    path: "juggernaut",
    category: "strength",
    parents: ["notable_viking_strength"],
    unlockLogic: "AND",
    position: { x: 0, y: -450 },
    effects: {
      tpMultiplier: 1.2, // +20% TP from PRs
    },
    currency: "talent_point",
    cost: 4,
    requirements: [
      {
        type: "achievement_count",
        exerciseId: "any",
        value: 10,
        comparison: "gte",
      },
    ],
  },
];

// ============================================================================
// PATHFINDER PATH: NOTABLES
// ============================================================================

const PATHFINDER_NOTABLES: SkillNodeV2[] = [
  {
    id: "notable_fatigue_shroud",
    title: "Fatigue Shroud",
    description: "Reduces ATL penalty from cardio sessions by 10%.",
    tier: "notable",
    path: "pathfinder",
    category: "endurance",
    parents: ["origin_pathfinder"],
    unlockLogic: "AND",
    position: { x: -400, y: -150 },
    effects: {
      recoveryRateMultiplier: 1.1,
    },
    currency: "kinetic_shard",
    cost: 500,
    requirements: [
      {
        type: "achievement_count",
        exerciseId: "any",
        value: 2,
        comparison: "gte",
      },
    ],
  },
  {
    id: "notable_aero_tech",
    title: "Aero Tech",
    description: "Unlocks Brick Workout transitions (Bike → Run).",
    tier: "notable",
    path: "pathfinder",
    category: "endurance",
    parents: ["notable_fatigue_shroud"],
    unlockLogic: "AND",
    position: { x: -400, y: -300 },
    effects: {
      unlocksBrickWorkouts: true,
      ksMultiplier: 1.1,
    },
    currency: "kinetic_shard",
    cost: 1500,
    requirements: [
      {
        type: "achievement_count",
        exerciseId: "any",
        value: 6,
        comparison: "gte",
      },
    ],
  },
  {
    id: "notable_void_runner",
    title: "Void Runner",
    description: "Zone 2 training fills Body Battery 2x faster.",
    tier: "notable",
    path: "pathfinder",
    category: "endurance",
    parents: ["notable_aero_tech"],
    unlockLogic: "AND",
    position: { x: -400, y: -450 },
    effects: {
      recoveryRateMultiplier: 2.0, // 2x recovery from Z2
    },
    effectConditions: {
      requiredZone: 2,
    },
    currency: "kinetic_shard",
    cost: 5000,
    requirements: [
      { type: "vo2max_value", exerciseId: "any", value: 50, comparison: "gte" },
    ],
  },
  {
    id: "notable_elite_pathfinder",
    title: "Elite Pathfinder",
    description: 'Reach sub-70 VO2 Max range. Unlocks "The 70+ Club" regalia.',
    tier: "notable",
    path: "pathfinder",
    category: "endurance",
    parents: ["notable_void_runner"],
    unlockLogic: "AND",
    position: { x: -400, y: -600 },
    effects: {
      ksMultiplier: 1.1,
    },
    currency: "kinetic_shard",
    cost: 10000,
    requirements: [
      { type: "vo2max_value", exerciseId: "any", value: 60, comparison: "gte" },
    ],
  },
];

// ============================================================================
// WARDEN PATH: NOTABLES
// ============================================================================

const WARDEN_NOTABLES: SkillNodeV2[] = [
  {
    id: "notable_the_hybrid",
    title: "The Hybrid",
    description:
      "Embrace dual training. +5% to both TP and KS from any session.",
    tier: "notable",
    path: "warden",
    category: "hybrid",
    parents: ["origin_warden"],
    unlockLogic: "AND",
    position: { x: 200, y: 50 },
    effects: {
      tpMultiplier: 1.05,
      ksMultiplier: 1.05,
    },
    currency: "talent_point",
    cost: 1,
    requirements: [
      {
        type: "session_count",
        exerciseId: "hybrid",
        value: 1,
        comparison: "gte",
      },
    ],
  },
  {
    id: "notable_dual_mastery",
    title: "Dual Mastery",
    description: "+10% to all rewards when session includes both modalities.",
    tier: "notable",
    path: "warden",
    category: "hybrid",
    parents: ["notable_the_hybrid"],
    unlockLogic: "AND",
    position: { x: 200, y: -100 },
    effects: {
      tpMultiplier: 1.1,
      ksMultiplier: 1.1,
    },
    effectConditions: {
      requiresHybridSession: true,
    },
    currency: "talent_point",
    cost: 2,
    requirements: [
      {
        type: "session_count",
        exerciseId: "hybrid",
        value: 5,
        comparison: "gte",
      },
    ],
  },
  {
    id: "notable_brick_layer",
    title: "Brick Layer",
    description: "+15% rewards from Brick sessions specifically.",
    tier: "notable",
    path: "warden",
    category: "hybrid",
    parents: ["notable_dual_mastery"],
    unlockLogic: "AND",
    position: { x: 200, y: -250 },
    effects: {
      tpMultiplier: 1.15,
      ksMultiplier: 1.15,
    },
    effectConditions: {
      requiresHybridSession: true,
    },
    currency: "talent_point",
    cost: 3,
    requirements: [
      {
        type: "brick_workout_count",
        exerciseId: "any",
        value: 1,
        comparison: "gte",
      },
    ],
  },
];

// ============================================================================
// TITAN PATH: NOTABLES
// ============================================================================

const TITAN_NOTABLES: SkillNodeV2[] = [
  {
    id: "notable_volume_veteran",
    title: "Volume Veteran",
    description: "+10% Titan Load from sets in 8-12 rep range.",
    tier: "notable",
    path: "titan",
    category: "hypertrophy",
    parents: ["origin_titan"],
    unlockLogic: "AND",
    position: { x: 400, y: -150 },
    effects: {
      titanLoadMultiplier: 1.1,
    },
    effectConditions: {
      minReps: 8,
      maxReps: 12,
    },
    currency: "talent_point",
    cost: 1,
    requirements: [
      { type: "rep_count", exerciseId: "any", value: 50, comparison: "gte" },
    ],
  },
  {
    id: "notable_pump_chaser",
    title: "Pump Chaser",
    description:
      "+15% Titan Load from 10+ rep sets. Visual pump indicator in UI.",
    tier: "notable",
    path: "titan",
    category: "hypertrophy",
    parents: ["notable_volume_veteran"],
    unlockLogic: "AND",
    position: { x: 400, y: -300 },
    effects: {
      titanLoadMultiplier: 1.15,
      unlocksPumpIndicator: true,
    },
    effectConditions: {
      minReps: 10,
    },
    currency: "talent_point",
    cost: 2,
    requirements: [
      { type: "rep_count", exerciseId: "any", value: 100, comparison: "gte" },
    ],
  },
  {
    id: "notable_mass_architect",
    title: "Mass Architect",
    description: "+20% Titan Load, unlock Hypertrophy Block auto-programming.",
    tier: "notable",
    path: "titan",
    category: "hypertrophy",
    parents: ["notable_pump_chaser"],
    unlockLogic: "AND",
    position: { x: 400, y: -450 },
    effects: {
      titanLoadMultiplier: 1.2,
      unlocksAutoDeload: true,
    },
    currency: "talent_point",
    cost: 3,
    requirements: [
      {
        type: "1rm_weight",
        exerciseId: "ex_belt_squat",
        value: 100,
        comparison: "gte",
      },
      { type: "rep_count", exerciseId: "any", value: 200, comparison: "gte" },
    ],
  },
];

// ============================================================================
// SAGE PATH: NOTABLES
// ============================================================================

const SAGE_NOTABLES: SkillNodeV2[] = [
  {
    id: "notable_disciplined_rest",
    title: "Disciplined Rest",
    description: "+10% Body Battery recovery rate, +1 TP per planned rest day.",
    tier: "notable",
    path: "sage",
    category: "utility",
    parents: ["origin_sage"],
    unlockLogic: "AND",
    position: { x: 0, y: 550 },
    effects: {
      recoveryRateMultiplier: 1.1,
      passiveTpPerDay: 1,
    },
    currency: "talent_point",
    cost: 1,
    requirements: [
      {
        type: "rest_day_count",
        exerciseId: "any",
        value: 7,
        comparison: "gte",
      },
    ],
  },
  {
    id: "notable_sleep_master",
    title: "Sleep Master",
    description:
      "+50 KS per night with Sleep Score > 80. Sleep tracking widget.",
    tier: "notable",
    path: "sage",
    category: "utility",
    parents: ["notable_disciplined_rest"],
    unlockLogic: "AND",
    position: { x: 0, y: 700 },
    effects: {
      passiveKsPerDay: 50,
    },
    effectConditions: {
      minSleepScore: 80,
    },
    currency: "talent_point",
    cost: 2,
    requirements: [
      {
        type: "sleep_score_streak",
        exerciseId: "any",
        value: 14,
        comparison: "gte",
      },
    ],
  },
  {
    id: "notable_the_patient_one",
    title: "The Patient One",
    description: "+100 KS passive per rest day, +20% all recovery metrics.",
    tier: "notable",
    path: "sage",
    category: "utility",
    parents: ["notable_sleep_master"],
    unlockLogic: "AND",
    position: { x: 0, y: 850 },
    effects: {
      passiveKsPerDay: 100,
      recoveryRateMultiplier: 1.2,
    },
    currency: "talent_point",
    cost: 3,
    requirements: [
      // 30 days without 5+ consecutive training days
      {
        type: "rest_day_count",
        exerciseId: "any",
        value: 30,
        comparison: "gte",
      },
    ],
  },
];

// ============================================================================
// KEYSTONES
// ============================================================================

const KEYSTONES: SkillNodeV2[] = [
  // --- Iron Discipline (Juggernaut) ---
  {
    id: "keystone_iron_discipline",
    title: "Iron Discipline",
    description: "The lifter who never misses a rep. Perfect execution.",
    tier: "keystone",
    path: "juggernaut",
    category: "strength",
    parents: ["notable_apex_predator"],
    unlockLogic: "AND",
    position: { x: 0, y: -600 },
    effects: {
      tpMultiplier: 1.5, // +50% TP for completed sets
    },
    effectConditions: {
      // Only applies to completed sets
    },
    drawbacks: {
      tpMultiplier: 0, // Failed sets = 0 TP
    },
    drawbackConditions: {
      onFailedSet: true,
    },
    currency: "talent_point",
    cost: 8,
    requirements: [],
    gateRequirement: 10, // Need 10 notables
  },

  // --- Void Runner's Covenant (Engine) ---
  {
    id: "keystone_void_runner_covenant",
    title: "Void Runner's Covenant",
    description: "The patient aerobic base builder. Long, slow, steady.",
    tier: "keystone",
    path: "pathfinder",
    category: "endurance",
    parents: ["notable_elite_pathfinder"],
    unlockLogic: "AND",
    position: { x: -400, y: -750 },
    effects: {
      ksMultiplier: 3.0, // 3x KS for Zone 2 > 45 min
    },
    effectConditions: {
      requiredZone: 2,
      minSessionDurationMins: 45,
    },
    drawbacks: {
      ksMultiplier: 0, // Sessions < 30 min = 0 KS
    },
    drawbackConditions: {
      maxSessionDurationMins: 30,
    },
    currency: "kinetic_shard",
    cost: 15000,
    requirements: [],
    gateRequirement: 10,
  },

  // --- Titan's Balance (Warden) ---
  {
    id: "keystone_titans_balance",
    title: "Titan's Balance",
    description: "The complete athlete. Strength AND cardio.",
    tier: "keystone",
    path: "warden",
    category: "hybrid",
    parents: ["notable_brick_layer"],
    unlockLogic: "AND",
    position: { x: 200, y: -400 },
    effects: {
      tpMultiplier: 1.75, // +75% to both for hybrid
      ksMultiplier: 1.75,
    },
    effectConditions: {
      requiresHybridSession: true,
    },
    // No harsh drawback, just base rewards for pure sessions
    currency: "talent_point",
    cost: 6,
    requirements: [],
    gateRequirement: 10,
  },

  // --- Hypertrophy Ascendant (Titan) ---
  {
    id: "keystone_hypertrophy_ascendant",
    title: "Hypertrophy Ascendant",
    description: "The sculptor. Volume is king.",
    tier: "keystone",
    path: "titan",
    category: "hypertrophy",
    parents: ["notable_mass_architect"],
    unlockLogic: "AND",
    position: { x: 400, y: -600 },
    effects: {
      titanLoadMultiplier: 2.0, // +100% Titan Load for 8-15 reps
    },
    effectConditions: {
      minReps: 8,
      maxReps: 15,
    },
    drawbacks: {
      titanLoadMultiplier: 0, // Sets < 5 reps = 0 TL
    },
    drawbackConditions: {
      maxReps: 5,
    },
    currency: "talent_point",
    cost: 6,
    requirements: [],
    gateRequirement: 10,
  },

  // --- Sage's Rest (Sage) ---
  {
    id: "keystone_sages_rest",
    title: "Sage's Rest",
    description: "Recovery is training. Rest is sacred.",
    tier: "keystone",
    path: "sage",
    category: "utility",
    parents: ["notable_the_patient_one"],
    unlockLogic: "AND",
    position: { x: 0, y: 1000 },
    effects: {
      passiveTpPerDay: 1, // +1 TP per rest day (BB > 80)
      passiveKsPerDay: 100,
    },
    effectConditions: {
      minBodyBattery: 80,
    },
    drawbacks: {
      tpMultiplier: 0.5, // -50% if training on low sleep
      ksMultiplier: 0.5,
    },
    drawbackConditions: {
      maxSleepScore: 50,
    },
    currency: "talent_point",
    cost: 5,
    requirements: [],
    gateRequirement: 10,
  },
];

// ============================================================================
// MINOR NODES (Connect the tree)
// ============================================================================

const MINOR_NODES: SkillNodeV2[] = [
  // Juggernaut Path Minors
  {
    id: "minor_jugg_1",
    title: "+5 Titan Load",
    description: "Incremental strength gains.",
    tier: "minor",
    path: "juggernaut",
    category: "strength",
    parents: ["origin_juggernaut"],
    unlockLogic: "AND",
    position: { x: -50, y: -75 },
    effects: { flatTitanLoad: 5 },
    currency: "talent_point",
    cost: 1,
    requirements: [],
  },
  {
    id: "minor_jugg_2",
    title: "+2% TP Gain",
    description: "Small but meaningful progress.",
    tier: "minor",
    path: "juggernaut",
    category: "strength",
    parents: ["notable_iron_shoulder"],
    unlockLogic: "AND",
    position: { x: 50, y: -225 },
    effects: { tpMultiplier: 1.02 },
    currency: "talent_point",
    cost: 1,
    requirements: [],
  },
  // Pathfinder Path Minors
  {
    id: "minor_pathfinder_1",
    title: "+50 Kinetic Shards",
    description: "Build your aerobic currency.",
    tier: "minor",
    path: "pathfinder",
    category: "endurance",
    parents: ["origin_pathfinder"],
    unlockLogic: "AND",
    position: { x: -450, y: -75 },
    effects: { flatKsBonus: 50 },
    currency: "kinetic_shard",
    cost: 100,
    requirements: [],
  },
  {
    id: "minor_pathfinder_2",
    title: "+75 Kinetic Shards",
    description: "The long road pays dividends.",
    tier: "minor",
    path: "pathfinder",
    category: "endurance",
    parents: ["notable_fatigue_shroud"],
    unlockLogic: "AND",
    position: { x: -350, y: -225 },
    effects: { flatKsBonus: 75 },
    currency: "kinetic_shard",
    cost: 200,
    requirements: [],
  },
  // Additional minors can be added as needed...
];

// ============================================================================
// COMBINED NEURAL LATTICE
// ============================================================================

export const SKILL_TREE_V2: SkillNodeV2[] = [
  ...ORIGINS,
  ...JUGGERNAUT_NOTABLES,
  ...PATHFINDER_NOTABLES,
  ...WARDEN_NOTABLES,
  ...TITAN_NOTABLES,
  ...SAGE_NOTABLES,
  ...KEYSTONES,
  ...MINOR_NODES,
];

// ============================================================================
// TITAN RANKS (Unchanged from V1)
// ============================================================================

export const TITAN_RANKS: TitanRank[] = [
  { id: 1, name: "Novice Titan", minTp: 5, minKs: 500 },
  {
    id: 2,
    name: "Ascendant Titan",
    minTp: 15,
    minKs: 1500,
    gateDescription:
      "Unlock 1 Achievement in Dungeons, Professions, and Cardio.",
  },
  {
    id: 3,
    name: "Warrior Titan",
    minTp: 35,
    minKs: 4000,
    gateDescription: "Unlock 3 Feats of Strength Achievements.",
  },
  {
    id: 4,
    name: "Windrunner Titan",
    minTp: 60,
    minKs: 8000,
    gateDescription: "Unlock 2 Brick Workout Achievements.",
  },
  {
    id: 5,
    name: "ELITE TITAN",
    minTp: 100,
    minKs: 15000,
    gateDescription: "Mastery of All Disciplines.",
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Get all nodes of a specific tier */
export function getNodesByTier(tier: SkillNodeV2["tier"]): SkillNodeV2[] {
  return SKILL_TREE_V2.filter((node) => node.tier === tier);
}

/** Get all nodes of a specific path */
export function getNodesByPath(path: SkillNodeV2["path"]): SkillNodeV2[] {
  return SKILL_TREE_V2.filter((node) => node.path === path);
}

/** Get a node by ID */
export function getNodeById(id: string): SkillNodeV2 | undefined {
  return SKILL_TREE_V2.find((node) => node.id === id);
}

/** Count notables unlocked (for Keystone gating) */
export function countUnlockedNotables(unlockedIds: Set<string>): number {
  return SKILL_TREE_V2.filter(
    (node) => node.tier === "notable" && unlockedIds.has(node.id),
  ).length;
}
