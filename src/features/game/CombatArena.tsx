"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Monster, BossTier, MonsterElement } from "@/types";
import { CombatState } from "@/services/game/CombatEngine";
import {
  startBossFight,
  performCombatAction,
  fleeFromCombat,
  getActiveCombatSession,
} from "@/actions/combat";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/GameToast";
import {
  Swords,
  Shield,
  Heart,
  Zap,
  Skull,
  Trophy,
  DoorOpen,
  Flame,
  Snowflake,
  Mountain,
  Ghost,
  Sun,
  PlayCircle,
} from "lucide-react";
import { LootItem } from "@/types/loot";
import { playSound, triggerHaptic } from "@/utils";
import useCelebration from "@/hooks/useCelebration";
import { LootReveal } from "@/components/game/LootReveal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface CombatArenaProps {
  bossId: string;
  onClose: () => void;
}

const ELEMENT_CONFIG: Record<
  MonsterElement | "Physical",
  {
    icon: React.ElementType;
    borderColor: string;
    badgeBg: string;
    textColor: string;
    shadowColor: string;
  }
> = {
  Physical: {
    icon: Swords,
    borderColor: "border-zinc-500",
    badgeBg: "bg-zinc-800",
    textColor: "text-zinc-200",
    shadowColor: "shadow-zinc-500/20",
  },
  Fire: {
    icon: Flame,
    borderColor: "border-orange-500",
    badgeBg: "bg-orange-950",
    textColor: "text-orange-400",
    shadowColor: "shadow-orange-500/40",
  },
  Ice: {
    icon: Snowflake,
    borderColor: "border-cyan-500",
    badgeBg: "bg-cyan-950",
    textColor: "text-cyan-300",
    shadowColor: "shadow-cyan-500/40",
  },
  Lightning: {
    icon: Zap,
    borderColor: "border-yellow-400",
    badgeBg: "bg-yellow-950",
    textColor: "text-yellow-300",
    shadowColor: "shadow-yellow-400/40",
  },
  Earth: {
    icon: Mountain,
    borderColor: "border-emerald-600",
    badgeBg: "bg-emerald-950",
    textColor: "text-emerald-400",
    shadowColor: "shadow-emerald-600/40",
  },
  Shadow: {
    icon: Ghost,
    borderColor: "border-purple-600",
    badgeBg: "bg-purple-950",
    textColor: "text-purple-400",
    shadowColor: "shadow-purple-600/40",
  },
  Holy: {
    icon: Sun,
    borderColor: "border-amber-400",
    badgeBg: "bg-amber-950",
    textColor: "text-amber-200",
    shadowColor: "shadow-amber-400/40",
  },
};

const CombatArena: React.FC<CombatArenaProps> = ({ bossId, onClose }) => {
  const [gameState, setGameState] = useState<CombatState | null>(null);
  const [boss, setBoss] = useState<Monster | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const [droppedItem, setDroppedItem] = useState<LootItem | null>(null);
  const [rewards, setRewards] = useState<{ xp: number; gold: number } | null>(
    null,
  );
  const [isFleeing, setIsFleeing] = useState(false);
  const [resumeData, setResumeData] = useState<{ hasSession: boolean; bossName?: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [combatStarted, setCombatStarted] = useState(false);
  const [selectedTier, setSelectedTier] = useState<BossTier>("HEROIC");

  // Final Push: Micro-Celebrations
  const { victorySequence, screenShake } = useCelebration();

  // Check for active session on mount
  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
      try {
        const res = await getActiveCombatSession();
        if (mounted && res.success && res.session) {
          setResumeData({
            hasSession: true,
            bossName: (res.boss as any)?.name || "Unknown Boss"
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    checkSession();
    return () => { mounted = false; };
  }, []);

  const handleStartFight = async (tier: BossTier) => {
    setIsLoading(true);
    setSelectedTier(tier);
    playSound("dungeon_ambient" as any);

    try {
      const res = await startBossFight(bossId, tier);
      if (res.success && res.state && res.boss) {
        setGameState(res.state);
        setBoss(res.boss as any);
        setCombatStarted(true);
        if (res.message) {
          toast.success("Combat Resumed", { description: res.message });
        }
      } else {
        console.error("Failed to start fight:", res.message);
        toast.error("Arena Locked", { description: res.message });
        onClose();
      }
    } catch (error) {
      console.error("Combat Init Error", error);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll logs
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [gameState?.logs]);

  const handleAction = useCallback(
    async (type: "ATTACK" | "DEFEND" | "HEAL" | "ULTIMATE") => {
      if (isProcessingTurn || !gameState) {
        playSound("ui_error");
        return;
      }
      playSound("ui_click");
      setIsProcessingTurn(true);

      try {
        const res = await performCombatAction({ type });

        if (res.success && res.newState) {
          setGameState(res.newState);

          // Sounds
          if (type === "ATTACK") playSound("sword_hit" as any);
          if (type === "HEAL") playSound("heal" as any);
          if (type === "DEFEND") playSound("shield_block" as any);

          // Check Victory
          if (res.newState.isVictory) {
            playSound("victory_fanfare" as any);
            victorySequence(); // Confetti + Shake
            if (res.loot) setDroppedItem(res.loot);
            if (res.reward) setRewards(res.reward);
          } else if (res.newState.isDefeat) {
            playSound("game_over" as any);
            triggerHaptic("error");
          } else {
            // Regular hit - subtle shake
            if (type === "ATTACK") screenShake("light");
          }
        } else {
          console.error("Combat Action Failed", res.message);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsProcessingTurn(false);
      }
    },
    [isProcessingTurn, gameState, victorySequence, screenShake],
  );

  const handleFlee = useCallback(async () => {
    if (isProcessingTurn) return;
    setIsProcessingTurn(true);
    try {
      const res = await fleeFromCombat(50);
      if (res.success) {
        playSound("flee" as any);
        setIsFleeing(true);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        toast.error("Escape Failed", {
          description: res.message || "The enemy blocks your path!",
        });
        setIsProcessingTurn(false);
      }
    } catch (e) {
      console.error(e);
      setIsProcessingTurn(false);
    }
  }, [isProcessingTurn, onClose]);

  // P1: Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!combatStarted || isProcessingTurn || !gameState) return;
      if (gameState.isVictory || gameState.isDefeat) return;

      switch (e.key) {
        case "1":
          handleAction("ATTACK");
          break;
        case "2":
          handleAction("DEFEND");
          break;
        case "3":
          handleAction("HEAL");
          break;
        case "Escape":
          handleFlee();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [combatStarted, isProcessingTurn, gameState, handleAction, handleFlee]);

  if (!combatStarted) {
    // Tier Selection Screen
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-8 animate-fade-in text-center">
          <h1 className="text-4xl md:text-6xl font-black text-magma uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,87,34,0.5)]">
            {resumeData ? "Combat Active" : "Select Difficulty"}
          </h1>

          {resumeData ? (
            <div className="flex flex-col items-center gap-6 mt-12 animate-fade-in">
              <button
                onClick={() => handleStartFight(selectedTier)} // Tier doesn't matter for resume, backend ignores it or uses saved
                disabled={isLoading}
                className="group relative p-8 w-full max-w-md rounded-xl border-2 border-yellow-500/50 hover:border-yellow-400 bg-zinc-900 overflow-hidden transition-all hover:scale-105 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
              >
                <div className="absolute inset-0 bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <PlayCircle className="w-16 h-16 text-yellow-500 animate-pulse" />
                  <h3 className="text-3xl font-bold text-yellow-400 uppercase tracking-widest">
                    Resume vs {resumeData.bossName}
                  </h3>
                  <p className="text-zinc-400">Your battle awaits!</p>
                </div>
              </button>

              <button
                disabled={isLoading}
                onClick={async () => {
                  await fleeFromCombat(0); // Free flee if abandoning via menu
                  setResumeData(null);
                  toast.success("Combat Abandoned");
                }}
                className="text-red-500 hover:text-red-400 underline decoration-dotted transition-colors hover:scale-105"
              >
                Abandon Fight (Reset)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {/* STORY MODE */}
              <button
                onClick={() => handleStartFight("STORY")}
                disabled={isLoading}
                className="group relative p-8 rounded-xl border-2 border-emerald-500/30 hover:border-emerald-500 bg-zinc-900 overflow-hidden transition-all hover:scale-105"
              >
                <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-zinc-950 border border-emerald-500/50 text-emerald-500 mb-2">
                    <Shield className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-400 uppercase tracking-widest">
                    Story
                  </h3>
                  <div className="text-sm text-zinc-400 space-y-1">
                    <p>Reduced Boss Stats</p>
                    <p>50% Rewards</p>
                  </div>
                </div>
              </button>

              {/* HEROIC (DEFAULT) */}
              <button
                onClick={() => handleStartFight("HEROIC")}
                disabled={isLoading}
                className="group relative p-8 rounded-xl border-2 border-magma/30 hover:border-magma bg-zinc-900 overflow-hidden transition-all hover:scale-105"
              >
                <div className="absolute inset-0 bg-magma/5 group-hover:bg-magma/10 transition-colors" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-zinc-950 border border-magma/50 text-magma mb-2">
                    <Swords className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-magma uppercase tracking-widest">
                    Heroic
                  </h3>
                  <div className="text-sm text-zinc-400 space-y-1">
                    <p>Standard Challenge</p>
                    <p>Normal Rewards</p>
                  </div>
                </div>
              </button>

              {/* TITAN SLAYER */}
              <button
                onClick={() => handleStartFight("TITAN_SLAYER")}
                disabled={isLoading}
                className="group relative p-8 rounded-xl border-2 border-purple-500/30 hover:border-purple-500 bg-zinc-900 overflow-hidden transition-all hover:scale-105"
              >
                <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-zinc-950 border border-purple-500/50 text-purple-500 mb-2">
                    <Skull className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-purple-400 uppercase tracking-widest">
                    Titan Slayer
                  </h3>
                  <div className="text-sm text-zinc-400 space-y-1">
                    <p>+50% Boss HP</p>
                    <p className="text-yellow-400 font-bold">200% Rewards</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          <button
            disabled={isLoading}
            onClick={onClose}
            className="mt-8 text-zinc-500 hover:text-white underline decoration-dotted transition-colors"
          >
            Return to Map
          </button>
        </div>
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <LoadingSpinner />
      </div>
    );
  if (!gameState || !boss) return null;

  // Resolve Element Config
  const bossElement = (boss.element as MonsterElement) || "Physical";
  const elementConfig = ELEMENT_CONFIG[bossElement] || ELEMENT_CONFIG.Physical;
  const ElementIcon = elementConfig.icon as any;

  return (
    <div className="relative w-full h-screen bg-zinc-900 text-white overflow-hidden flex flex-col">
      {/* Background / Arena Immersive Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-stone.png')] opacity-30"></div>
        {/* Could add dynamic background based on boss zone later */}
      </div>

      {/* --- HEADER: BOSS STATUS --- */}
      <div className="relative z-10 p-4 pt-8 md:p-8 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Boss Avatar */}
          <div className="relative">
            <div
              className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 ${elementConfig.borderColor} bg-black overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.2)] ${elementConfig.shadowColor}`}
            >
              {/* Placeholder or Image */}
              <div className="flex items-center justify-center h-full text-4xl">
                {boss.image || "👹"}
              </div>
            </div>
            <div
              className={`absolute -bottom-2 -right-2 ${elementConfig.badgeBg} ${elementConfig.borderColor} text-xs px-2 py-1 rounded border font-bold flex items-center gap-1 shadow-lg`}
            >
              <span className="text-zinc-300">Lvl {boss.level}</span>
              {bossElement !== "Physical" && (
                <>
                  <span className="w-1 h-3 bg-zinc-700/50 rounded-full mx-1"></span>
                  <ElementIcon
                    className={`w-3 h-3 ${elementConfig.textColor}`}
                  />
                  <span className={`${elementConfig.textColor} uppercase`}>
                    {bossElement}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Boss Health Bar */}
          <div className="w-full max-w-2xl text-center">
            <h2 className="text-2xl font-black uppercase tracking-widest text-red-500 drop-shadow-md mb-2">
              {boss.name}
            </h2>
            <div className="relative h-6 bg-zinc-950 rounded-full border border-zinc-700 overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-900"
                initial={{ width: "100%" }}
                animate={{
                  width: `${(gameState.bossHp / gameState.bossMaxHp) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold z-10 text-white drop-shadow-md">
                {gameState.bossHp} / {gameState.bossMaxHp} HP
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- MAIN CONTENT: BATTLEFIELD & LOGS --- */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 gap-8">
        {/* Combat Text / FX Area (Could be expanded) */}
        <div className="h-32 w-full max-w-lg bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg p-4 overflow-y-auto font-mono text-sm space-y-1 custom-scrollbar shadow-inner">
          {gameState.logs.map((log, i) => (
            <div
              key={i}
              className={`opacity-80 ${log.includes("You") ? (log.includes("defeated") ? "text-yellow-400 font-bold" : "text-cyan-300") : "text-red-400"}`}
            >
              {i === gameState.logs.length - 1 ? "> " : ""}
              {log}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* --- FOOTER: PLAYER ACTIONS --- */}
      <div className="relative z-20 bg-zinc-950 border-t border-zinc-800 p-6 md:p-8">
        {/* Player Stats HUD */}
        <div className="max-w-4xl mx-auto mb-6 flex items-end justify-between">
          <div className="flex flex-col gap-1 w-full max-w-sm">
            <div className="flex justify-between text-xs font-bold uppercase text-zinc-400">
              <span>My Health</span>
              <span>
                {gameState.playerHp} / {gameState.playerMaxHp}
              </span>
            </div>
            <div className="h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-green-700"
                animate={{
                  width: `${(gameState.playerHp / gameState.playerMaxHp) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="max-w-4xl mx-auto grid grid-cols-5 gap-4">
          <ActionButton
            icon={<Swords className="w-6 h-6" />}
            label="Attack"
            color="bg-red-600 hover:bg-red-500"
            onClick={() => handleAction("ATTACK")}
            disabled={
              isProcessingTurn || gameState.isVictory || gameState.isDefeat
            }
          />
          <ActionButton
            icon={<Shield className="w-6 h-6" />}
            label="Defend"
            color="bg-blue-600 hover:bg-blue-500"
            onClick={() => handleAction("DEFEND")}
            disabled={
              isProcessingTurn || gameState.isVictory || gameState.isDefeat
            }
          />
          <ActionButton
            icon={<Heart className="w-6 h-6" />}
            label="Heal"
            color="bg-green-600 hover:bg-green-500"
            onClick={() => handleAction("HEAL")}
            disabled={
              isProcessingTurn || gameState.isVictory || gameState.isDefeat
            }
          />
          <ActionButton
            icon={<Zap className="w-6 h-6" />}
            label="Ultimate"
            color="bg-purple-600 hover:bg-purple-500"
            isSpecial
            onClick={() => handleAction("ULTIMATE")}
            disabled={
              isProcessingTurn || gameState.isVictory || gameState.isDefeat
            }
          />
          <ActionButton
            icon={<DoorOpen className="w-6 h-6" />}
            label="Flee"
            color="bg-amber-600 hover:bg-amber-500"
            onClick={handleFlee}
            disabled={
              isProcessingTurn || gameState.isVictory || gameState.isDefeat
            }
          />
        </div>
      </div>

      {/* --- VICTORY / DEFEAT OVERLAYS --- */}
      <AnimatePresence>
        {gameState.isVictory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8"
          >
            <Trophy className="w-24 h-24 text-yellow-500 mb-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)] animate-bounce" />
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 uppercase tracking-widest mb-4">
              Victory!
            </h1>
            <p className="text-zinc-400 mb-8 max-w-md text-center">
              You have slain the {boss.name}. Glory and riches are yours.
            </p>

            {droppedItem ? (
              <div className="bg-zinc-900 border border-yellow-500/30 p-6 rounded-lg mb-8 text-center animate-pulse">
                <p className="text-yellow-500 font-bold uppercase text-sm mb-2">
                  Rewards
                </p>
                <p className="text-white font-mono text-lg">
                  + {rewards?.xp} XP
                </p>
                <p className="text-yellow-400 font-mono text-lg">
                  + {rewards?.gold} Gold
                </p>
              </div>
            ) : (
              <p className="text-zinc-500 text-sm mb-8">
                No loot found this time...
              </p>
            )}

            <button
              onClick={onClose}
              className="px-8 py-4 bg-yellow-600 hover:bg-yellow-500 text-black font-bold uppercase tracking-widest rounded shadow-lg hover:scale-105 transition-all"
            >
              Return to World Map
            </button>

            {/* Loot Reveal Modal Integration */}
            {droppedItem && (
              <LootReveal
                item={droppedItem}
                onClose={() => {
                  /* LootReveal closes when item is claimed */
                }}
              />
            )}
          </motion.div>
        )}
        {gameState.isDefeat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-8"
          >
            <Skull className="w-24 h-24 text-red-500 mb-6 animate-pulse" />
            <h1 className="text-6xl font-black text-red-500 uppercase tracking-widest mb-4 text-shadow-lg">
              Defeat
            </h1>
            <p className="text-red-300 mb-8 max-w-md text-center">
              The {boss.name} was too strong. Train harder and return when you
              are worthy.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-widest rounded shadow-lg hover:scale-105 transition-all"
            >
              Retreat
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fleeing Overlay */}
      <AnimatePresence>
        {isFleeing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.8, x: -100, opacity: 0 }}
              animate={{ scale: 1, x: 0, opacity: 1 }}
              className="flex items-center gap-4 text-amber-500"
            >
              <DoorOpen className="w-16 h-16 animate-pulse" />
              <h1 className="text-4xl font-black uppercase tracking-widest italic leading-none">
                Retreating...
              </h1>
            </motion.div>
            <p className="text-amber-300/50 mt-4 font-mono text-sm">
              Escaping the arena (-50g)
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
  disabled?: boolean;
  isSpecial?: boolean;
}> = ({ icon, label, color, onClick, disabled, isSpecial }) => (
  <button
    onClick={onClick}
    onMouseEnter={() => !disabled && playSound("ui_hover")}
    disabled={disabled}
    className={`
            relative group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black
            ${disabled ? "bg-zinc-900 opacity-50 cursor-not-allowed grayscale" : `${color} shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:-translate-y-1 active:scale-95`}
            ${isSpecial ? "border-2 border-yellow-400" : ""}
        `}
  >
    <div className="mb-2">{icon}</div>
    <span className="font-bold uppercase tracking-wide text-xs md:text-sm">
      {label}
    </span>
    {label === "Flee" && (
      <span className="text-[10px] text-yellow-500 font-mono mt-1">-50g</span>
    )}
  </button>
);

export default CombatArena;
