"use server";

type BossPhase =
  | "INTRO"
  | "PHASE_1"
  | "PHASE_2"
  | "PHASE_3"
  | "ENRAGE"
  | "DEFEATED";
type AttackType = "PHYSICAL" | "MAGICAL" | "AOE" | "DOT" | "DEBUFF" | "HEAL";

interface BossAttack {
  id: string;
  name: string;
  type: AttackType;
  damage: number;
  cooldownTurns: number;
  description: string;
  telegraphMessage?: string;
  counterableWith?: string;
}

interface BossPhaseConfig {
  phase: BossPhase;
  hpThreshold: number; // Percentage to trigger this phase
  attacks: BossAttack[];
  modifiers: PhaseModifier[];
  dialogue?: string;
}

interface PhaseModifier {
  stat: "DAMAGE" | "DEFENSE" | "SPEED" | "CRIT";
  multiplier: number;
}

interface BossMechanics {
  id: string;
  name: string;
  title: string;
  level: number;
  maxHp: number;
  currentHp: number;
  currentPhase: BossPhase;
  phases: BossPhaseConfig[];
  enrageTimer: number; // Turns until enrage
  specialMechanic?: SpecialMechanic;
}

interface SpecialMechanic {
  name: string;
  description: string;
  triggerCondition: string;
  effect: string;
}

// Boss templates
const BOSS_TEMPLATES: Record<string, Partial<BossMechanics>> = {
  iron_guardian: {
    name: "Iron Guardian",
    title: "Keeper of the Forge",
    phases: [
      {
        phase: "PHASE_1",
        hpThreshold: 100,
        attacks: [
          {
            id: "slam",
            name: "Iron Slam",
            type: "PHYSICAL",
            damage: 25,
            cooldownTurns: 0,
            description: "Heavy physical attack",
          },
          {
            id: "shield",
            name: "Forge Shield",
            type: "DEBUFF",
            damage: 0,
            cooldownTurns: 3,
            description: "Reduces damage taken",
            telegraphMessage: "The Guardian raises its shield!",
          },
        ],
        modifiers: [],
        dialogue: "You dare enter MY forge?!",
      },
      {
        phase: "PHASE_2",
        hpThreshold: 50,
        attacks: [
          {
            id: "molten",
            name: "Molten Strike",
            type: "MAGICAL",
            damage: 35,
            cooldownTurns: 2,
            description: "Fire damage over time",
            telegraphMessage: "Heat radiates from the Guardian!",
          },
          {
            id: "quake",
            name: "Forge Quake",
            type: "AOE",
            damage: 20,
            cooldownTurns: 4,
            description: "Damages all party members",
          },
        ],
        modifiers: [{ stat: "DAMAGE", multiplier: 1.25 }],
        dialogue: "You will be FORGED in flame!",
      },
      {
        phase: "ENRAGE",
        hpThreshold: 10,
        attacks: [
          {
            id: "berserk",
            name: "Berserk Fury",
            type: "PHYSICAL",
            damage: 50,
            cooldownTurns: 0,
            description: "Devastating attacks",
          },
        ],
        modifiers: [
          { stat: "DAMAGE", multiplier: 2.0 },
          { stat: "SPEED", multiplier: 1.5 },
        ],
        dialogue: "ENOUGH! I WILL END THIS!",
      },
    ],
    specialMechanic: {
      name: "Forge Heat",
      description: "Environmental damage increases over time",
      triggerCondition: "Every 5 turns",
      effect: "+10% DOT damage per stack",
    },
  },
};

/**
 * Get boss mechanics for encounter.
 */
export async function getBossMechanicsAction(
  bossId: string,
  level: number,
): Promise<BossMechanics> {
  const template = BOSS_TEMPLATES[bossId] || BOSS_TEMPLATES.iron_guardian;
  const scaledHp = 500 + level * 100;

  return {
    id: bossId,
    name: template.name || "Unknown Boss",
    title: template.title || "The Challenger",
    level,
    maxHp: scaledHp,
    currentHp: scaledHp,
    currentPhase: "PHASE_1",
    phases: template.phases || [],
    enrageTimer: 30,
    specialMechanic: template.specialMechanic,
  };
}

/**
 * Process boss turn and select attack.
 */
export async function processBossTurnAction(
  bossState: BossMechanics,
  playerDefending: boolean,
): Promise<{
  attack: BossAttack;
  damage: number;
  phaseChange?: BossPhase;
  message: string;
}> {
  const hpPercent = (bossState.currentHp / bossState.maxHp) * 100;

  // Determine current phase based on HP
  let activePhase = bossState.phases.find((p) => hpPercent <= p.hpThreshold);
  if (!activePhase) activePhase = bossState.phases[0];

  // Select random attack from phase
  const attacks = activePhase.attacks;
  const attack = attacks[Math.floor(Math.random() * attacks.length)];

  // Calculate damage with modifiers
  let damage = attack.damage;
  for (const mod of activePhase.modifiers) {
    if (mod.stat === "DAMAGE") damage *= mod.multiplier;
  }
  if (playerDefending) damage *= 0.5;

  const phaseChange =
    activePhase.phase !== bossState.currentPhase
      ? activePhase.phase
      : undefined;

  return {
    attack,
    damage: Math.round(damage),
    phaseChange,
    message:
      attack.telegraphMessage || `${bossState.name} uses ${attack.name}!`,
  };
}

/**
 * Check for boss defeat.
 */
export async function checkBossDefeatAction(
  bossState: BossMechanics,
): Promise<{ defeated: boolean; rewards?: unknown }> {
  if (bossState.currentHp <= 0) {
    return {
      defeated: true,
      rewards: {
        xp: bossState.level * 500,
        gold: bossState.level * 250,
        crateRarity: "EPIC",
      },
    };
  }
  return { defeated: false };
}
