export type BuffTier = "LEGENDARY" | "EPIC" | "RARE" | "COMMON" | "DEBUFF";

export interface BioBuffEffects {
  attackMod?: number; // Multiplier (1.0 = no change)
  defenseMod?: number;
  critChance?: number; // Additive bonus
  xpMod?: number;
  canFight?: boolean; // Specific override for EXHAUSTED
}

export interface BioBuff {
  tier: BuffTier;
  name: string;
  description: string;
  effects: BioBuffEffects;
}

const BUFF_DEFINITIONS: Record<string, BioBuff> = {
  IRON_CONSTITUTION: {
    tier: "LEGENDARY",
    name: "Iron Constitution",
    description: "Your recovery is absolute. The Titan is unstoppable.",
    effects: { attackMod: 1.2, critChance: 0.1 },
  },
  WELL_RESTED: {
    tier: "EPIC",
    name: "Well Rested",
    description: "Ideally prepared for battle.",
    effects: { attackMod: 1.15, xpMod: 1.1 },
  },
  FRESH: {
    tier: "RARE",
    name: "Fresh",
    description: "Ready to fight.",
    effects: { attackMod: 1.1 },
  },
  STABLE: {
    tier: "COMMON",
    name: "Stable",
    description: "Standard operating capacity.",
    effects: {},
  },
  FATIGUED: {
    tier: "DEBUFF",
    name: "Fatigued",
    description: "Poor recovery hampers performance.",
    effects: { attackMod: 0.9, defenseMod: 0.9 },
  },
  EXHAUSTED: {
    tier: "DEBUFF",
    name: "Exhausted",
    description: "Critically drained. Rest is required.",
    effects: { attackMod: 0.75, canFight: false },
  },
};

export class BioBuffService {
  static calculateBuff(
    sleepScore: number,
    hrv: number,
    hrvBaseline: number,
  ): BioBuff {
    // Simple logic for now, can be expanded with nuanced baseline deviation
    const hrvDeviation =
      hrvBaseline > 0 ? ((hrv - hrvBaseline) / hrvBaseline) * 100 : 0;

    if (sleepScore >= 90 && hrvDeviation >= 20)
      return BUFF_DEFINITIONS.IRON_CONSTITUTION;
    if (sleepScore >= 80 && hrvDeviation >= 0)
      return BUFF_DEFINITIONS.WELL_RESTED;
    if (sleepScore >= 70 && hrvDeviation >= -10) return BUFF_DEFINITIONS.FRESH;

    if (sleepScore < 40) return BUFF_DEFINITIONS.EXHAUSTED;
    if (sleepScore < 60 || hrvDeviation < -20) return BUFF_DEFINITIONS.FATIGUED;

    return BUFF_DEFINITIONS.STABLE;
  }
}
