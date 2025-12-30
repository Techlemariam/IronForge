import React, { useEffect, useState } from "react";
import { BioBuff } from "@/features/bio/BioBuffService";
import { BioBuffBadge } from "@/features/bio/components/BioBuffBadge";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Skull, Sword, Scroll } from "lucide-react";

interface DungeonInterfaceProps {
  bossName: string;
  totalHp: number;
  currentHp: number; // HP Remaining
  onDamage?: number; // Last damage dealt for visual effect
  buffs?: BioBuff[];
  level: number;
  className?: string;
}

const DungeonInterface: React.FC<DungeonInterfaceProps> = ({
  bossName,
  totalHp,
  currentHp,
  onDamage,
  buffs = [],
  level,
  className,
}) => {
  const [shake, setShake] = useState(0);
  const hpPercent = Math.max(0, Math.min(100, (currentHp / totalHp) * 100));

  // Visual reaction when damage is taken
  useEffect(() => {
    if (onDamage && onDamage > 0) {
      setShake((prev) => prev + 1);
    }
  }, [onDamage]);

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden bg-zinc-950 border-2 border-zinc-800 p-4 ${className}`}
    >
      {/* TOP BAR: BOSS INFO */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-900/20 border-2 border-red-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.4)]">
            <Skull className="w-6 h-6 text-red-500 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest">
              {bossName}
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-zinc-500">
              <span className="bg-red-950 text-red-400 px-1 rounded border border-red-900">
                Elite Boss
              </span>
              <span>Lvl {level} Titan</span>
            </div>
          </div>
        </div>

        {/* BUFFS */}
        <div className="flex gap-2">
          {buffs.map((buff, i) => (
            <BioBuffBadge key={i} buff={buff} />
          ))}
        </div>
      </div>

      {/* BOSS VISUAL (Centered & Absurd) */}
      <motion.div
        className="flex justify-center py-6 relative"
        animate={shake ? { x: [0, -5, 5, -2, 2, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        {/* Simple visual representation of the Boss */}
        <div className="relative w-32 h-32">
          {/* Aura */}
          <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-pulse rounded-full"></div>

          {/* Boss Model (Icon for now) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Sword className="w-24 h-24 text-red-600 drop-shadow-lg" />
          </div>

          {/* Damage Number Popups (Simplified) */}
          <AnimatePresence>
            {onDamage && onDamage > 0 && (
              <motion.div
                key={shake}
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -50, scale: 1.5 }}
                exit={{ opacity: 0 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl font-black text-white italic stroke-black text-shadow-lg pointer-events-none"
                style={{ textShadow: "2px 2px 0px #000" }}
              >
                -{onDamage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* HP BAR - HUGE */}
      <div className="relative w-full h-8 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700 mt-2 shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-red-600 to-red-500 relative"
          initial={{ width: "100%" }}
          animate={{ width: `${hpPercent}%` }}
          transition={{ type: "spring", stiffness: 50 }}
        >
          {/* Shine effect */}
          <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-white/50 shadow-[0_0_10px_white]"></div>
        </motion.div>

        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-white drop-shadow-md z-10">
          {currentHp.toLocaleString()} / {totalHp.toLocaleString()} HP
        </div>
      </div>
    </div>
  );
};

export default DungeonInterface;
