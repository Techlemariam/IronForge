import { TitanAttributes, Monster } from "@/types";

export interface CombatState {
  playerHp: number;
  playerMaxHp: number;
  bossHp: number;
  bossMaxHp: number;
  turnCount: number;
  logs: string[];
  isVictory: boolean;
  isDefeat: boolean;
}

export interface CombatAction {
  type: "ATTACK" | "DEFEND" | "HEAL" | "ULTIMATE";
  payload?: any;
}

export interface TurnResult {
  playerDamage: number;
  bossDamage: number;
  playerHeal: number;
  bossHeal: number;
  events: string[];
  newState: CombatState;
}

export class CombatEngine {
  // --- DAMAGE FORMULAS ---

  static calculatePlayerDamage(
    attributes: TitanAttributes,
    actionType: CombatAction["type"],
  ): { damage: number; isCrit: boolean } {
    // Base damage comes from Strength (Max Force) + Hypertrophy (Muscle Size)
    const basePower = attributes.strength * 2 + attributes.hypertrophy;

    let multiplier = 1;
    let critChance = 0.05 + attributes.technique / 200; // 5% base + 0.5% per technique point

    switch (actionType) {
      case "ATTACK":
        multiplier = 1.0;
        break;
      case "DEFEND":
        multiplier = 0.2; // Counter-attack
        break;
      case "HEAL":
        multiplier = 0;
        break;
      case "ULTIMATE":
        multiplier = 2.5;
        critChance += 0.2; // +20% crit chance
        break;
    }

    const isCrit = Math.random() < critChance;
    const critMult = isCrit ? 1.5 + attributes.mental / 100 : 1; // Mental focus increases crit damage

    const damage = Math.floor(
      basePower * multiplier * critMult * (0.9 + Math.random() * 0.2),
    ); // +/- 10% variance

    return { damage, isCrit };
  }

  static calculateBossDamage(
    boss: Monster,
    playerAttributes: TitanAttributes,
    isDefending: boolean,
  ): { damage: number; isCrit: boolean } {
    // Boss damage vs Player Defense
    // Player HP/Defense comes from Endurance (Cardio base) + Recovery (Health)
    const mitigation =
      playerAttributes.endurance * 0.5 + playerAttributes.recovery * 1;
    const defenseMultiplier = isDefending ? 2 : 1;

    const effectiveMitigation = mitigation * defenseMultiplier;

    // Boss base damage (simplified, usually boss has stats, for now derive from level)
    const bossPower = boss.level * 15 + boss.maxHp / 100;

    let damage = Math.max(0, bossPower - effectiveMitigation * 0.5);

    // Random variance
    damage = Math.floor(damage * (0.8 + Math.random() * 0.4));

    return { damage, isCrit: false }; // Bosses don't crit for now
  }

  static processTurn(
    state: CombatState,
    action: CombatAction,
    playerAttributes: TitanAttributes,
    boss: Monster,
  ): TurnResult {
    const events: string[] = [];
    let playerDamage = 0;
    let playerHeal = 0;
    let bossDamage = 0;

    // 1. Player Turn
    if (action.type === "HEAL") {
      // Healing based on Recovery + Mental
      const healAmount =
        playerAttributes.recovery * 5 + playerAttributes.mental * 2;
      playerHeal = Math.floor(healAmount * (0.9 + Math.random() * 0.2));
      state.playerHp = Math.min(state.playerMaxHp, state.playerHp + playerHeal);
      events.push(`You concentrated and recovered ${playerHeal} HP.`);
    } else {
      const { damage, isCrit } = this.calculatePlayerDamage(
        playerAttributes,
        action.type,
      );
      playerDamage = damage;
      state.bossHp = Math.max(0, state.bossHp - damage);
      events.push(
        `You used ${action.type}! Dealt ${damage} damage.${isCrit ? " CRITICAL HIT!" : ""}`,
      );
    }

    // 2. Victory Check
    if (state.bossHp <= 0) {
      state.isVictory = true;
      events.push(`The ${boss.name} has been defeated!`);
      return {
        playerDamage,
        bossDamage: 0,
        playerHeal,
        bossHeal: 0,
        events,
        newState: { ...state },
      };
    }

    // 3. Boss Turn
    const isPlayerDefending = action.type === "DEFEND";
    const { damage: bDmg } = this.calculateBossDamage(
      boss,
      playerAttributes,
      isPlayerDefending,
    );
    bossDamage = bDmg;
    state.playerHp = Math.max(0, state.playerHp - bossDamage);

    if (isPlayerDefending) {
      events.push(
        `You braced for impact! The ${boss.name} dealt only ${bossDamage} damage.`,
      );
    } else {
      events.push(`The ${boss.name} attacked! You took ${bossDamage} damage.`);
    }

    // 4. Defeat Check
    if (state.playerHp <= 0) {
      state.isDefeat = true;
      events.push(`You have been defeated by the ${boss.name}...`);
    } else {
      state.turnCount++;
    }

    return {
      playerDamage,
      bossDamage,
      playerHeal,
      bossHeal: 0,
      events,
      newState: { ...state },
    };
  }
}
