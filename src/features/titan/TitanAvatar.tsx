import React from "react";
import { motion } from "framer-motion";
import { Zap, Moon, HeartCrack, Flame, Heart, Swords, Wind, Dumbbell, Shield, Brain } from "lucide-react";
import { TitanState } from "@/actions/titan/core";
import { EffectiveTitanStats } from "@/services/game/TitanService";
import { StatModifier } from "@/features/neural-lattice/types";

interface TitanAvatarProps {
  titan: TitanState | null | undefined;
  effectiveStats?: EffectiveTitanStats;
  activeModifiers?: StatModifier[];
}

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  base: number;
  effective: number;
}

const StatRow: React.FC<StatRowProps> = ({ icon, label, base, effective }) => {
  const bonus = effective - base;
  return (
    <div className="flex items-center justify-between text-xs font-mono">
      <div className="flex items-center gap-1.5 text-zinc-400">
        {icon}
        <span className="uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-white font-bold">{effective}</span>
        {bonus !== 0 && (
          <span className={`text-[10px] ${bonus > 0 ? "text-emerald-400" : "text-red-400"}`}>
            ({bonus > 0 ? "+" : ""}{bonus})
          </span>
        )}
      </div>
    </div>
  );
};

export const TitanAvatar: React.FC<TitanAvatarProps> = ({ titan, effectiveStats, activeModifiers }) => {
  if (!titan) {
    return (
      <div className="w-full text-center p-4 animate-pulse text-forge-muted">
        Summoning Titan...
      </div>
    );
  }

  const { mood, currentEnergy: energy, currentHp, maxHp, isResting, name, level } = titan;
  const baseTitan = { maxHp, strength: 10, vitality: 10, endurance: 10, agility: 10, willpower: 10, maxEnergy: 100 };
  const eff = effectiveStats ?? baseTitan;

  const hpPercent = Math.min(100, Math.max(0, (currentHp / eff.maxHp) * 100));
  const energyPercent = Math.min(100, Math.max(0, (energy / eff.maxEnergy) * 100));

  // Visual Logic
  let statusIcon = <Flame className="w-5 h-5 text-magma" />;
  let statusText = "Ready for Battle";
  let glowColor = "shadow-magma/50";
  let avatarEmoji = "🛡️";

  if (isResting) {
    statusIcon = <Moon className="w-5 h-5 text-indigo-400" />;
    statusText = "Resting (Recovering Energy)";
    glowColor = "shadow-indigo-500/50";
    avatarEmoji = "😴";
  } else if (mood === "WEAKENED") {
    statusIcon = <HeartCrack className="w-5 h-5 text-red-500" />;
    statusText = "Weakened (Needs Maintenance)";
    glowColor = "shadow-red-500/50";
    avatarEmoji = "❤️‍🩹";
  } else if (mood === "FOCUSED") {
    statusIcon = <Zap className="w-5 h-5 text-yellow-400" />;
    statusText = "FOCUSED (XP Bonus Active)";
    glowColor = "shadow-yellow-500/50";
    avatarEmoji = "⚡";
  }

  const hasModifiers = activeModifiers && activeModifiers.length > 0;

  return (
    <div
      className={`col-span-full bg-gradient-to-b from-zinc-900 to-black border border-white/10 rounded-xl p-6 relative overflow-hidden shadow-lg ${glowColor} transition-all duration-500`}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')] mix-blend-overlay pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
        {/* Avatar Visual */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-28 h-28 shrink-0 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
        >
          <span className="filter drop-shadow-lg">{avatarEmoji}</span>
        </motion.div>

        {/* Main Info Column */}
        <div className="flex-1 space-y-3 min-w-0">
          {/* Name & Level */}
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-2xl font-bold text-white tracking-wider uppercase">{name}</h2>
            <span className="px-2 py-0.5 bg-magma/20 text-magma text-xs rounded border border-magma/30">
              LVL {level}
            </span>
            {hasModifiers && (
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded border border-emerald-500/30 font-mono uppercase tracking-wider">
                ✦ Lattice Active
              </span>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-forge-300">
            {statusIcon}
            <span className="font-mono text-xs uppercase">{statusText}</span>
          </div>

          {/* HP Bar */}
          <div>
            <div className="flex justify-between text-[10px] text-zinc-500 uppercase font-mono tracking-widest mb-1">
              <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" /> HP</span>
              <span className={eff.maxHp !== maxHp ? "text-emerald-400" : ""}>{currentHp} / {eff.maxHp}{eff.maxHp !== maxHp && <span className="text-zinc-600 ml-1">(base {maxHp})</span>}</span>
            </div>
            <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className={`h-full rounded-full ${hpPercent > 50 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : hpPercent > 25 ? "bg-orange-500" : "bg-red-800 animate-pulse"}`}
                initial={{ width: 0 }}
                animate={{ width: `${hpPercent}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>

          {/* Energy Bar */}
          <div>
            <div className="flex justify-between text-[10px] text-zinc-500 uppercase font-mono tracking-widest mb-1">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-cyan-400" /> Energy</span>
              <span>{energy.toFixed(0)} / {eff.maxEnergy}</span>
            </div>
            <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${energyPercent}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="w-full md:w-48 shrink-0 bg-white/3 border border-white/5 rounded-lg p-3 space-y-2">
          <p className="text-[10px] text-zinc-600 uppercase font-mono tracking-widest mb-2">Core Stats</p>
          <StatRow icon={<Swords className="w-3 h-3" />} label="STR" base={baseTitan.strength} effective={eff.strength} />
          <StatRow icon={<Heart className="w-3 h-3" />} label="VIT" base={baseTitan.vitality} effective={eff.vitality} />
          <StatRow icon={<Shield className="w-3 h-3" />} label="END" base={baseTitan.endurance} effective={eff.endurance} />
          <StatRow icon={<Wind className="w-3 h-3" />} label="AGI" base={baseTitan.agility} effective={eff.agility} />
          <StatRow icon={<Brain className="w-3 h-3" />} label="WIL" base={baseTitan.willpower} effective={eff.willpower} />
        </div>
      </div>
    </div>
  );
};
