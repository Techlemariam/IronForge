"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sword, Shield, Zap, Skull, Trophy, Timer } from "lucide-react";
import { playSound } from "@/utils";
import { logGauntletRunAction, GauntletResult } from "@/actions/training/gauntlet";

interface GauntletArenaProps {
  userLevel: number;
  userFtp: number; // For scaling difficulty
  onClose: () => void;
  currentWatts: number; // Real-time input
  currentHr: number; // Real-time input
}

interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  image?: string;
}

export const GauntletArena: React.FC<GauntletArenaProps> = ({
  userLevel,
  userFtp,
  onClose,
  currentWatts,
  currentHr,
}) => {
  // State
  const [wave, setWave] = useState(1);
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(100);
  const [status, setStatus] = useState<"ACTIVE" | "VICTORY" | "DEFEAT">(
    "ACTIVE",
  );
  const [enemy, setEnemy] = useState<Enemy | null>(null);
  const [rewards, setRewards] = useState<{
    xp: number;
    gold: number;
    kinetic: number;
  } | null>(null);

  // Stats
  const startTimeRef = useRef(Date.now());
  const [damageDealt, setDamageDealt] = useState(0);

  // Refs for intervals
  const attackInterval = useRef<NodeJS.Timeout | null>(null);

  // Refs for stable callbacks
  const waveRef = useRef(wave);
  const damageDealtRef = useRef(damageDealt);
  const currentHrRef = useRef(currentHr);

  useEffect(() => {
    waveRef.current = wave;
  }, [wave]);
  useEffect(() => {
    damageDealtRef.current = damageDealt;
  }, [damageDealt]);
  useEffect(() => {
    currentHrRef.current = currentHr;
  }, [currentHr]);

  // Define callbacks before useEffects that use them
  const spawnEnemy = useCallback((waveNum: number) => {
    const multiplier = 1 + (waveNum - 1) * 0.1;
    setEnemy({
      id: `wave-${waveNum}`,
      name: `Titan Construct Mk.${waveNum}`,
      maxHp: Math.floor(100 * multiplier),
      hp: Math.floor(100 * multiplier),
      damage: Math.floor(5 * (1 + waveNum * 0.05)),
    });
  }, []);

  const handleDefeat = useCallback(async () => {
    setStatus("DEFEAT");
    playSound("fail");
    if (attackInterval.current) clearInterval(attackInterval.current);

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const result: GauntletResult = {
      wavesCleared: waveRef.current - 1,
      totalDamage: damageDealtRef.current,
      duration: duration,
      avgHr: currentHrRef.current > 0 ? currentHrRef.current : undefined,
    };

    try {
      const resp = await logGauntletRunAction(result);
      if (resp.success && resp.rewards) {
        setRewards(resp.rewards);
      }
    } catch (e) {
      console.error("Failed to save run", e);
    }
  }, []);

  const handleWaveClear = useCallback(() => {
    playSound("achievement");
    setWave((prev) => {
      const nextWave = prev + 1;
      spawnEnemy(nextWave);
      return nextWave;
    });
    setHp((prev) => Math.min(100, prev + 20));
  }, [spawnEnemy]);

  // Initial Spawn
  useEffect(() => {
    spawnEnemy(1);
    playSound("quest_accept");

    return () => {
      if (attackInterval.current) clearInterval(attackInterval.current);
    };
  }, [spawnEnemy]);

  // Auto-Attack Logic (Player attacks Enemy based on Watts)
  useEffect(() => {
    if (status !== "ACTIVE" || !enemy) return;

    const interval = setInterval(() => {
      const intensity = currentWatts / (userFtp || 200);
      const damage = Math.max(1, Math.floor(intensity * 10));

      if (damage > 0) {
        setEnemy((prev) => {
          if (!prev) return null;
          const newHp = prev.hp - damage;

          if (newHp <= 0) {
            handleWaveClear();
            return null;
          }
          return { ...prev, hp: newHp };
        });
        setDamageDealt((prev) => prev + damage);
        setScore((prev) => prev + damage);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, enemy, currentWatts, userFtp, handleWaveClear]);

  // Enemy Attack Logic
  useEffect(() => {
    if (status !== "ACTIVE" || !enemy) {
      if (attackInterval.current) clearInterval(attackInterval.current);
      return;
    }

    if (!attackInterval.current) {
      attackInterval.current = setInterval(() => {
        setHp((prev) => {
          const newHp = prev - (enemy.damage || 5);
          if (newHp <= 0) {
            handleDefeat();
            return 0;
          }
          playSound("ui_error");
          return newHp;
        });
      }, 3000); // Enemy attacks every 3s
    }

    return () => {
      // Cleanup handled in main effect or state change
    };

    return () => {
      // Cleanup handled in main effect or state change
    };
  }, [enemy, status, handleDefeat]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-white">
      {/* HUD */}
      <div className="absolute top-4 w-full px-8 flex justify-between items-center font-mono">
        <div className="text-xl text-yellow-500 flex items-center gap-2">
          <Trophy className="w-6 h-6" /> Wave {wave}
        </div>
        <div className="text-xl text-red-500 flex items-center gap-2">
          <Heart className="w-6 h-6 fill-current" /> {hp}%
        </div>
        <div className="text-xl text-blue-400 flex items-center gap-2">
          <Timer className="w-6 h-6" />{" "}
          {Math.floor((Date.now() - startTimeRef.current) / 1000)}s
        </div>
      </div>

      {/* Arena Content */}
      <div className="relative w-full max-w-4xl h-[60vh] flex items-center justify-center">
        {status === "ACTIVE" && enemy && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={enemy.id}
            className="flex flex-col items-center"
          >
            <div className="w-64 h-64 bg-red-900/30 rounded-full flex items-center justify-center border-4 border-red-500/50 relative shadow-[0_0_50px_rgba(239,68,68,0.3)]">
              <Skull className="w-32 h-32 text-red-500 animate-pulse" />
              {/* Health Bar */}
              <div className="absolute -bottom-8 w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                <motion.div
                  className="h-full bg-red-600"
                  animate={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                />
              </div>
            </div>
            <h2 className="mt-8 text-2xl font-bold text-red-400">
              {enemy.name}
            </h2>
            <div className="mt-2 text-red-300">
              HP: {enemy.hp} / {enemy.maxHp}
            </div>
          </motion.div>
        )}

        {status === "DEFEAT" && (
          <div className="bg-gray-900 border-2 border-red-600 p-8 rounded-xl max-w-md w-full text-center shadow-2xl">
            <h2 className="text-4xl font-bold text-red-500 mb-4">DEFEATED</h2>
            <p className="text-xl mb-6">You survived {wave - 1} Waves</p>

            {rewards ? (
              <div className="grid grid-cols-3 gap-4 mb-6 bg-black/40 p-4 rounded-lg">
                <div>
                  <div className="text-yellow-400 text-sm">Gold</div>
                  <div className="text-xl font-bold">+{rewards.gold}</div>
                </div>
                <div>
                  <div className="text-purple-400 text-sm">XP</div>
                  <div className="text-xl font-bold">+{rewards.xp}</div>
                </div>
                <div>
                  <div className="text-blue-400 text-sm">Energy</div>
                  <div className="text-xl font-bold">+{rewards.kinetic}</div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 animate-pulse">
                Calculating Rewards...
              </p>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg transition-colors"
            >
              Return to Base
            </button>
          </div>
        )}
      </div>

      {/* Player Stats */}
      <div className="absolute bottom-8 w-full max-w-2xl grid grid-cols-2 gap-8 px-4">
        <div className="bg-gray-900/80 p-4 rounded-lg border border-yellow-500/30">
          <div className="text-xs text-gray-400 uppercase">Power Output</div>
          <div className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
            <Zap className="w-6 h-6" /> {Math.floor(currentWatts)}w
          </div>
        </div>
        <div className="bg-gray-900/80 p-4 rounded-lg border border-red-500/30">
          <div className="text-xs text-gray-400 uppercase">Heart Rate</div>
          <div className="text-3xl font-bold text-red-400 flex items-center gap-2">
            <Heart className="w-6 h-6" /> {Math.floor(currentHr)} bpm
          </div>
        </div>
      </div>
    </div>
  );
};
