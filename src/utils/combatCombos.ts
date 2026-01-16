

interface ComboStep {
  actionType: "ATTACK" | "DEFEND" | "HEAL" | "ULTIMATE";
  multiplier: number;
}

interface ComboDefinition {
  id: string;
  name: string;
  description: string;
  sequence: ComboStep[];
  bonusDamage: number;
  cooldown: number; // turns
}

// Predefined combat combos
export const COMBAT_COMBOS: ComboDefinition[] = [
  {
    id: "triple_strike",
    name: "Triple Strike",
    description: "Three consecutive attacks deal bonus damage",
    sequence: [
      { actionType: "ATTACK", multiplier: 1.0 },
      { actionType: "ATTACK", multiplier: 1.2 },
      { actionType: "ATTACK", multiplier: 1.5 },
    ],
    bonusDamage: 50,
    cooldown: 3,
  },
  {
    id: "counter_assault",
    name: "Counter Assault",
    description: "Defend then attack for critical damage",
    sequence: [
      { actionType: "DEFEND", multiplier: 1.0 },
      { actionType: "ATTACK", multiplier: 2.0 },
    ],
    bonusDamage: 30,
    cooldown: 2,
  },
  {
    id: "berserker_rush",
    name: "Berserker Rush",
    description: "Attack, Attack, Ultimate for massive damage",
    sequence: [
      { actionType: "ATTACK", multiplier: 1.0 },
      { actionType: "ATTACK", multiplier: 1.0 },
      { actionType: "ULTIMATE", multiplier: 2.5 },
    ],
    bonusDamage: 100,
    cooldown: 5,
  },
  {
    id: "tactical_recovery",
    name: "Tactical Recovery",
    description: "Heal during defense for bonus healing",
    sequence: [
      { actionType: "DEFEND", multiplier: 1.0 },
      { actionType: "HEAL", multiplier: 1.5 },
    ],
    bonusDamage: 0,
    cooldown: 4,
  },
];

interface ComboState {
  currentSequence: string[];
  activeCombos: Map<string, number>; // comboId -> turns until available
}

export class ComboTracker {
  private state: ComboState = {
    currentSequence: [],
    activeCombos: new Map(),
  };

  recordAction(actionType: string): {
    comboTriggered: ComboDefinition | null;
    multiplier: number;
  } {
    this.state.currentSequence.push(actionType);

    // Keep only last 5 actions
    if (this.state.currentSequence.length > 5) {
      this.state.currentSequence.shift();
    }

    // Check for combo completion
    for (const combo of COMBAT_COMBOS) {
      if (this.state.activeCombos.has(combo.id)) continue; // on cooldown

      const match = this.checkComboMatch(combo);
      if (match) {
        this.state.activeCombos.set(combo.id, combo.cooldown);
        this.state.currentSequence = []; // Reset sequence after combo

        const lastStep = combo.sequence[combo.sequence.length - 1];
        return { comboTriggered: combo, multiplier: lastStep.multiplier };
      }
    }

    return { comboTriggered: null, multiplier: 1.0 };
  }

  private checkComboMatch(combo: ComboDefinition): boolean {
    const seqLen = combo.sequence.length;
    const histLen = this.state.currentSequence.length;

    if (histLen < seqLen) return false;

    const recentActions = this.state.currentSequence.slice(-seqLen);
    return combo.sequence.every(
      (step, i) => step.actionType === recentActions[i],
    );
  }

  advanceTurn(): void {
    // Reduce cooldowns
    for (const [comboId, turnsLeft] of this.state.activeCombos) {
      if (turnsLeft <= 1) {
        this.state.activeCombos.delete(comboId);
      } else {
        this.state.activeCombos.set(comboId, turnsLeft - 1);
      }
    }
  }

  getAvailableCombos(): ComboDefinition[] {
    return COMBAT_COMBOS.filter((c) => !this.state.activeCombos.has(c.id));
  }

  getCurrentSequence(): string[] {
    return [...this.state.currentSequence];
  }

  getProgressTowardsCombo(
    comboId: string,
  ): { progress: number; total: number } | null {
    const combo = COMBAT_COMBOS.find((c) => c.id === comboId);
    if (!combo) return null;

    const seq = combo.sequence;
    let matched = 0;

    for (
      let i = 0;
      i < this.state.currentSequence.length && i < seq.length;
      i++
    ) {
      if (seq[i].actionType === this.state.currentSequence[i]) {
        matched++;
      } else {
        break;
      }
    }

    return { progress: matched, total: seq.length };
  }
}

// Singleton instance for game session
let comboTrackerInstance: ComboTracker | null = null;

export function getComboTracker(): ComboTracker {
  if (!comboTrackerInstance) {
    comboTrackerInstance = new ComboTracker();
  }
  return comboTrackerInstance;
}

export function resetComboTracker(): void {
  comboTrackerInstance = new ComboTracker();
}
