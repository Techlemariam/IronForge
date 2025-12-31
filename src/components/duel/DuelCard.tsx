"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Swords, Trophy, Timer } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { DuelArena } from "../../features/game/DuelArena";

// Types
interface DuelParticipant {
  id: string;
  heroName: string | null;
  level: number;
  image: string | null;
  faction: string;
}

interface DuelData {
  id: string;
  startDate: Date | null;
  endDate: Date | null;
  challengerScore: number;
  defenderScore: number;
  challenger: DuelParticipant;
  defender: DuelParticipant;
  // Cardio Fields
  duelType?: string;
  activityType?: string;
  durationMinutes?: number;
  targetDistance?: number;
  wkgTier?: number;
  challengerDistance?: number;
  defenderDistance?: number;
}

interface DuelCardProps {
  duel: DuelData;
  currentUserId: string;
  onTaunt?: () => void;
}

export function DuelCard({ duel, currentUserId, onTaunt }: DuelCardProps) {
  const [showArena, setShowArena] = useState(false);
  const isChallenger = currentUserId === duel.challenger.id;
  const userScore = isChallenger ? duel.challengerScore : duel.defenderScore;
  const opponentScore = isChallenger
    ? duel.defenderScore
    : duel.challengerScore;
  const user = isChallenger ? duel.challenger : duel.defender;
  const opponent = isChallenger ? duel.defender : duel.challenger;

  // Cardio Logic
  const isCardio =
    duel.duelType !== "TITAN_VS_TITAN" && duel.duelType !== undefined;
  const userDistance = isChallenger
    ? duel.challengerDistance || 0
    : duel.defenderDistance || 0;
  const opponentDistance = isChallenger
    ? duel.defenderDistance || 0
    : duel.challengerDistance || 0;

  // Calculate percentages
  let maxMetric = 100;
  if (isCardio) {
    if (
      duel.duelType === "DISTANCE_RACE" ||
      duel.duelType === "ELEVATION_GRIND"
    ) {
      // For distance/elevation race, relative scale
      maxMetric = Math.max(userDistance, opponentDistance, 1);
    } else if (duel.duelType === "SPEED_DEMON") {
      // For speed demon, target is max
      maxMetric = duel.targetDistance || 10;
    }
  } else {
    // Standard Score
    maxMetric = Math.max(userScore, opponentScore, 500);
  }

  const userProgress = isCardio
    ? (userDistance / maxMetric) * 100
    : (userScore / maxMetric) * 100;

  const opponentProgress = isCardio
    ? (opponentDistance / maxMetric) * 100
    : (opponentScore / maxMetric) * 100;

  const daysLeft = duel.endDate
    ? Math.max(
      0,
      Math.ceil(
        (new Date(duel.endDate).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
      ),
    )
    : 7;

  return (
    <Card className="w-full bg-slate-900 border-slate-800 text-slate-100 overflow-hidden relative">
      {/* Background Ambient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 to-blue-900/10 pointer-events-none" />

      <CardHeader className="pb-2 border-b border-white/5 relative z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-amber-500 font-bold tracking-wider">
            <Swords className="w-5 h-5" />
            <span>
              {duel.duelType === "SPEED_DEMON"
                ? "SPEED DEMON"
                : duel.duelType === "DISTANCE_RACE"
                  ? "DISTANCE RACE"
                  : "ACTIVE DUEL"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Timer className="w-4 h-4" />
            <span>{daysLeft}d remaining</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 relative z-10 space-y-6">
        {/* Head to Head */}
        <div className="flex justify-between items-center px-2">
          {/* User Side */}
          <div className="flex flex-col items-center gap-2 text-center w-1/3">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="bg-slate-800 text-blue-500">
                  {user.heroName?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <Badge className="absolute -bottom-2 -right-2 bg-blue-600 border-blue-400 px-1 text-[10px]">
                Lvl {user.level}
              </Badge>
            </div>
            <div>
              <div className="font-bold text-lg truncate max-w-[100px]">
                {user.heroName || "You"}
              </div>
              <div className="text-2xl font-black text-blue-400">
                {isCardio ? `${userDistance.toFixed(2)} km` : userScore}
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center w-1/3 -mt-6">
            <div className="text-4xl font-black text-white/10 italic">VS</div>
          </div>

          {/* Opponent Side */}
          <div className="flex flex-col items-center gap-2 text-center w-1/3">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                <AvatarImage src={opponent.image || undefined} />
                <AvatarFallback className="bg-slate-800 text-red-500">
                  {opponent.heroName?.[0] || "O"}
                </AvatarFallback>
              </Avatar>
              <Badge className="absolute -bottom-2 -right-2 bg-red-600 border-red-400 px-1 text-[10px]">
                Lvl {opponent.level}
              </Badge>
            </div>
            <div>
              <div className="font-bold text-lg truncate max-w-[100px]">
                {opponent.heroName || "Opponent"}
              </div>
              <div className="text-2xl font-black text-red-400">
                {isCardio ? `${opponentDistance.toFixed(2)} km` : opponentScore}
              </div>
            </div>
          </div>
        </div>

        {/* Semantic Comparison Bar */}
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400 uppercase tracking-widest font-semibold">
              <span>Dominance</span>
              <span>{userScore > opponentScore ? "Leading" : "Trailing"}</span>
            </div>
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex relative">
              {/* Center Marker */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 z-20" />

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${userProgress}%` }}
                className="h-full bg-gradient-to-r from-blue-900 to-blue-500 rounded-r-sm z-10"
              />
              {/* Overlap logic is tricky in CSS flex, simplifying to two bars for now */}
            </div>
            {/* Alternative Visualization: Tug of War */}
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex mt-2">
              <motion.div
                initial={{ flex: 1 }}
                animate={{ flex: userScore + 1 }}
                className="bg-blue-600 h-full"
              />
              <div className="w-1 bg-black z-10"></div>
              <motion.div
                initial={{ flex: 1 }}
                animate={{ flex: opponentScore + 1 }}
                className="bg-red-600 h-full"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-slate-700 hover:bg-slate-800"
            size="sm"
          >
            View Details
          </Button>

          {duel.status === "ACTIVE" && (
            <Button
              className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold tracking-wider animate-pulse"
              size="sm"
              onClick={() => setShowArena(true)}
            >
              ENTER ARENA ⚔️
            </Button>
          )}

          <Button
            variant="ghost"
            className="flex-1 text-amber-500 hover:text-amber-400 hover:bg-amber-950/30"
            size="sm"
            onClick={async () => {
              if (onTaunt) {
                await onTaunt();
              }
            }}
          >
            Send Taunt 💬
          </Button>
        </div>
      </CardContent>

      {/* Arena Modal */}
      {showArena && (
        <DuelArena
          duelId={duel.id}
          currentUserId={currentUserId}
          onClose={() => setShowArena(false)}
        />
      )}
    </Card>
  );
}
