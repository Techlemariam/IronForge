"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Share2,
  Copy,
  Check,
  Trophy,
  Flame,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface WorkoutSummary {
  date: string;
  duration: number; // minutes
  exerciseCount: number;
  totalVolume: number; // kg
  prsHit: number;
  xpEarned: number;
  streak?: number;
  userName: string;
  userLevel: number;
}

interface ShareableReplayCardProps {
  workout: WorkoutSummary;
  onShare?: () => void;
}

export function ShareableReplayCard({
  workout,
  onShare,
}: ShareableReplayCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const formatVolume = (kg: number) => {
    if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
    return `${kg.toFixed(0)}kg`;
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/replay/${workout.date}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `IronForge Workout - ${workout.date}`,
          text: `🏋️ ${workout.exerciseCount} exercises | ${formatVolume(workout.totalVolume)} lifted | ${workout.prsHit} PRs`,
          url: `${window.location.origin}/replay/${workout.date}`,
        });
        onShare?.();
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="bg-gradient-to-br from-slate-900 via-slate-950 to-black border-slate-800 overflow-hidden relative">
        {/* Decorative glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10 pointer-events-none" />

        <CardHeader className="relative z-10 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Workout Complete
              </h3>
              <p className="text-sm text-slate-400 font-mono">{workout.date}</p>
            </div>
            <Badge
              variant="outline"
              className="border-amber-500/50 text-amber-400 bg-amber-950/30"
            >
              Lvl {workout.userLevel}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-6">
          {/* Hero Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-3xl font-black text-white">
                {formatDuration(workout.duration)}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-widest">
                Duration
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-amber-400">
                {formatVolume(workout.totalVolume)}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-widest">
                Volume
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-green-400">
                {workout.exerciseCount}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-widest">
                Exercises
              </div>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="flex flex-wrap gap-2 justify-center">
            {workout.prsHit > 0 && (
              <Badge className="bg-purple-900/50 border-purple-500 text-purple-300 flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                {workout.prsHit} PR{workout.prsHit > 1 ? "s" : ""}
              </Badge>
            )}
            {workout.streak && workout.streak > 0 && (
              <Badge className="bg-orange-900/50 border-orange-500 text-orange-300 flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {workout.streak} Day Streak
              </Badge>
            )}
            <Badge className="bg-blue-900/50 border-blue-500 text-blue-300 flex items-center gap-1">
              <Zap className="w-3 h-3" />+{workout.xpEarned} XP
            </Badge>
          </div>

          {/* Share Actions */}
          <div className="flex gap-2 pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-slate-700 hover:bg-slate-800"
              onClick={handleCopyLink}
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Branding */}
          <div className="text-center pt-2">
            <span className="text-xs text-slate-600 font-mono tracking-widest">
              IRONFORGE.GG
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
