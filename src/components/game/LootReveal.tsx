"use client";

import { motion, AnimatePresence } from "framer-motion";

type Item = {
  id: string;
  name: string;
  rarity: string;
  image: string | null;
};

const RARITY_COLORS: Record<string, string> = {
  common: "border-gray-500 shadow-gray-500 bg-gray-900",
  rare: "border-blue-500 shadow-blue-500 bg-blue-950",
  epic: "border-purple-500 shadow-purple-500 bg-purple-950",
  legendary: "border-yellow-500 shadow-yellow-500 bg-yellow-950",
};

interface LootRevealProps {
  item: Item | null;
  onClose: () => void;
}

export function LootReveal({ item, onClose }: LootRevealProps) {
  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Chest / Item Animation */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50, rotateX: 45 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 12, stiffness: 100 }}
            className={`relative w-full max-w-sm aspect-[3/4] rounded-lg p-1 border-4 ${RARITY_COLORS[item.rarity]} shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center justify-center gap-6 text-center`}
          >
            {/* Rays */}
            <div
              className={`absolute inset-0 animate-spin-slow opacity-30 bg-gradient-to-t from-current to-transparent bg-[length:200%_200%] ${RARITY_COLORS[item.rarity].split(" ")[1]}`}
            />

            <div className="z-10 relative">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div
                  className={`w-32 h-32 rounded-full border-4 border-white/20 bg-black/50 flex items-center justify-center shadow-2xl`}
                >
                  {/* Simple Icon placeholder */}
                  <div
                    className={`w-16 h-16 rounded-full bg-current ${RARITY_COLORS[item.rarity].split(" ")[1]}`}
                  />
                </div>
              </motion.div>
            </div>

            <div className="z-10 space-y-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="font-mono text-xs uppercase tracking-[0.2em] text-white/70"
              >
                New Artifact Unlocked
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-serif text-white uppercase tracking-widest text-shadow-lg"
              >
                {item.name}
              </motion.h2>

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider border rounded-full bg-black/50 ${RARITY_COLORS[item.rarity].split(" ")[1]}`}
              >
                {item.rarity}
              </motion.span>
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={onClose}
              className="z-10 mt-8 px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors rounded"
            >
              Claim
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
