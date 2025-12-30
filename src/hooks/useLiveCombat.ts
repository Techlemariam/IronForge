import { useState, useEffect } from "react";

interface LiveCombatProps {
  watts: number;
  heartRate: number;
  ftp: number;
  maxHr: number;
  isPaused: boolean;
}

interface BossState {
  name: string;
  currentHp: number;
  maxHp: number;
  isDefeated: boolean;
}

interface CombatFeedback {
  boss: BossState;
  lastDamage: number;
  combo: number; // Consecutive seconds of damage
}

export const useLiveCombat = ({
  watts,
  heartRate,
  ftp,
  maxHr,
  isPaused,
}: LiveCombatProps) => {
  // Ephemeral Boss for the session
  const [boss, setBoss] = useState<BossState>({
    name: "Frost Giant",
    currentHp: 50000,
    maxHp: 50000,
    isDefeated: false,
  });

  const [lastDamage, setLastDamage] = useState(0);
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    if (isPaused || boss.isDefeated) return;

    const interval = setInterval(() => {
      let damage = 0;

      // Calculate Logic
      // Power Zones (approx)
      const zone = watts / ftp;

      if (zone < 0.55)
        damage = 1; // Z1
      else if (zone < 0.75)
        damage = 2; // Z2
      else if (zone < 0.9)
        damage = 4; // Z3
      else if (zone < 1.05)
        damage = 8; // Z4
      else damage = 15; // Z5+

      if (watts < 10) damage = 0; // Not moving

      if (damage > 0) {
        setLastDamage(damage);
        setCombo((c) => c + 1);
        setBoss((prev) => {
          const newHp = Math.max(0, prev.currentHp - damage);
          return {
            ...prev,
            currentHp: newHp,
            isDefeated: newHp === 0,
          };
        });
      } else {
        setCombo(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [watts, ftp, isPaused, boss.isDefeated]);

  return { boss, lastDamage, combo };
};
