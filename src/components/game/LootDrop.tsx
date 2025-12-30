import React from "react";
import { motion } from "framer-motion";
import { LootDrop as LootDropType, Rarity } from "../../types/loot";

interface LootDropProps {
  drops: LootDropType[];
}

const rarityColors: Record<Rarity, string> = {
  [Rarity.COMMON]: "border-gray-500 text-gray-300 bg-gray-900/50",
  [Rarity.UNCOMMON]: "border-green-500 text-green-300 bg-green-900/50",
  [Rarity.RARE]: "border-blue-500 text-blue-300 bg-blue-900/50",
  [Rarity.EPIC]: "border-purple-500 text-purple-300 bg-purple-900/50",
  [Rarity.LEGENDARY]: "border-orange-500 text-orange-300 bg-orange-900/50",
  [Rarity.MYTHIC]: "border-red-600 text-red-400 bg-red-900/50",
};

const rarityGlow: Record<Rarity, string> = {
  [Rarity.COMMON]: "shadow-[0_0_10px_rgba(107,114,128,0.3)]",
  [Rarity.UNCOMMON]: "shadow-[0_0_15px_rgba(34,197,94,0.4)]",
  [Rarity.RARE]: "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
  [Rarity.EPIC]: "shadow-[0_0_25px_rgba(168,85,247,0.6)]",
  [Rarity.LEGENDARY]: "shadow-[0_0_30px_rgba(249,115,22,0.7)]",
  [Rarity.MYTHIC]: "shadow-[0_0_40px_rgba(220,38,38,0.8)]",
};

const LootDropNotification: React.FC<LootDropProps> = ({ drops }) => {
  return (
    <div className="w-full max-w-lg mx-auto mt-6 space-y-3">
      <h3 className="font-heading text-xl text-center text-warrior tracking-wider mb-4 animate-pulse">
        LOOT ACQUIRED
      </h3>
      {drops.map((drop, index) => (
        <motion.div
          key={drop.id}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            delay: index * 0.2,
            type: "spring",
            stiffness: 120,
          }}
          className={`
                        flex items-center p-4 rounded-lg border-l-4 
                        ${rarityColors[drop.item.rarity]} 
                        ${rarityGlow[drop.item.rarity]}
                    `}
        >
          {/* Placeholder Icon */}
          <div className="w-10 h-10 mr-4 rounded bg-black/40 flex items-center justify-center font-bold text-lg">
            {drop.quantity}
          </div>

          <div className="flex-1">
            <div className="font-bold flex justify-between">
              <span>{drop.item.name}</span>
              <span className="text-xs uppercase opacity-70 border px-1 rounded border-current">
                {drop.item.rarity}
              </span>
            </div>
            <p className="text-sm opacity-80 italic">{drop.item.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LootDropNotification;
