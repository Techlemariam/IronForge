"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Clock,
  Dumbbell,
  Heart,
  Zap,
  Trophy,
} from "lucide-react";

interface TvModeProps {
  userId: string;
}

interface WorkoutDisplay {
  currentExercise: string;
  currentSet: number;
  totalSets: number;
  weight: number;
  targetReps: number;
  restTimer: number;
  isResting: boolean;
}

interface TitanStats {
  hp: number;
  maxHp: number;
  energy: number;
  xp: number;
  streak: number;
}

export default function IronCommandCenter({ userId: _userId }: TvModeProps) {
  // isFullscreen unused, setIsFullscreen used in toggleFullscreen
  const [_isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [workout] = useState<WorkoutDisplay>({
    currentExercise: "Barbell Bench Press",
    currentSet: 3,
    totalSets: 4,
    weight: 100,
    targetReps: 8,
    restTimer: 90,
    isResting: true,
  });

  const [titan] = useState<TitanStats>({
    hp: 85,
    maxHp: 100,
    energy: 72,
    xp: 4500,
    streak: 7,
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8 select-none">
      {/* Header with Clock and Controls */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            IRON COMMAND
          </h1>
          <span className="text-6xl font-mono text-slate-400">
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <Maximize className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-8 h-[calc(100vh-200px)]">
        {/* Left: Current Exercise */}
        <div className="col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-8 border border-slate-700/50">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-slate-400 text-xl mb-2">Current Exercise</p>
              <h2 className="text-5xl font-black">{workout.currentExercise}</h2>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xl">Set</p>
              <p className="text-6xl font-black text-amber-400">
                {workout.currentSet}/{workout.totalSets}
              </p>
            </div>
          </div>

          {/* Weight and Reps Display */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-800/50 rounded-2xl p-6 text-center">
              <Dumbbell className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <p className="text-slate-400 text-xl">Weight</p>
              <p className="text-7xl font-black">
                {workout.weight}
                <span className="text-3xl text-slate-400">kg</span>
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-6 text-center">
              <Zap className="w-12 h-12 mx-auto mb-4 text-amber-400" />
              <p className="text-slate-400 text-xl">Target Reps</p>
              <p className="text-7xl font-black">{workout.targetReps}</p>
            </div>
          </div>

          {/* Rest Timer */}
          <AnimatePresence>
            {workout.isResting && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 rounded-2xl p-8 text-center border-2 border-amber-500/50"
              >
                <Clock className="w-16 h-16 mx-auto mb-4 text-amber-400 animate-pulse" />
                <p className="text-2xl text-amber-300 mb-2">REST</p>
                <p className="text-9xl font-black text-amber-400">
                  {Math.floor(workout.restTimer / 60)}:
                  {(workout.restTimer % 60).toString().padStart(2, "0")}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-6 rounded-full bg-amber-500 hover:bg-amber-400 transition-colors"
            >
              {isPaused ? (
                <Play className="w-10 h-10" />
              ) : (
                <Pause className="w-10 h-10" />
              )}
            </button>
            <button className="p-6 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors">
              <SkipForward className="w-10 h-10" />
            </button>
          </div>
        </div>

        {/* Right: Titan Status */}
        <div className="space-y-6">
          {/* HP */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="w-8 h-8 text-red-400" />
              <span className="text-xl text-slate-400">Titan HP</span>
            </div>
            <div className="h-6 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-red-400"
                initial={{ width: 0 }}
                animate={{ width: `${(titan.hp / titan.maxHp) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <p className="text-right text-2xl font-bold mt-2">
              {titan.hp}/{titan.maxHp}
            </p>
          </div>

          {/* Energy */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-8 h-8 text-yellow-400" />
              <span className="text-xl text-slate-400">Energy</span>
            </div>
            <div className="h-6 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-500 to-amber-400"
                initial={{ width: 0 }}
                animate={{ width: `${titan.energy}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <p className="text-right text-2xl font-bold mt-2">
              {titan.energy}%
            </p>
          </div>

          {/* XP */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-purple-400" />
              <span className="text-xl text-slate-400">Session XP</span>
            </div>
            <p className="text-5xl font-black text-purple-400">
              +{titan.xp.toLocaleString()}
            </p>
          </div>

          {/* Streak */}
          <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-2xl p-6 border border-orange-500/50">
            <p className="text-xl text-orange-300 mb-2">🔥 Current Streak</p>
            <p className="text-6xl font-black text-orange-400">
              {titan.streak} days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
