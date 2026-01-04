import { useState, useEffect, useRef } from "react";
import { contributeGuildDamageAction } from "@/actions/guild/core";

interface UseGuildContributionProps {
  userId?: string;
  watts: number;
  heartRate: number;
  ftp: number;
  maxHr: number;
  isPaused: boolean;
}

export interface GuildSession {
  totalDamage: number;
  pendingDamage: number;
  bossHp: number;
  bossTotalHp: number;
  bossName: string;
}

export const useGuildContribution = ({
  userId,
  watts,
  heartRate,
  ftp = 200,
  maxHr = 190,
  isPaused,
}: UseGuildContributionProps) => {
  const [stats, setStats] = useState<GuildSession>({
    totalDamage: 0,
    pendingDamage: 0,
    bossHp: 0,
    bossTotalHp: 0,
    bossName: "Unknown",
  });

  const pendingDamageRef = useRef(0);
  const lastSyncRef = useRef(Date.now());

  // Damage Calculation Loop (1s Interval)
  useEffect(() => {
    if (isPaused || !userId) return;

    const interval = setInterval(() => {
      let dps = 0;

      // 1. Base Damage (Active)
      if (watts > 10 || heartRate > 90) {
        dps += 1;
      }

      // 2. Power Bonus: +1 per 10W over 50% FTP
      const powerThreshold = ftp * 0.5;
      if (watts > powerThreshold) {
        const surplus = watts - powerThreshold;
        dps += Math.floor(surplus / 10);
      }

      // 3. Zone 5 Bonus (2x Multiplier)
      const zone5Threshold = maxHr * 0.9;
      if (heartRate >= zone5Threshold) {
        dps *= 2;
      }

      if (dps > 0) {
        pendingDamageRef.current += dps;
        setStats((prev) => ({
          ...prev,
          totalDamage: prev.totalDamage + dps,
          pendingDamage: pendingDamageRef.current,
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [watts, heartRate, ftp, maxHr, isPaused, userId]);

  // Sync Loop (30s Interval)
  useEffect(() => {
    if (!userId) return;

    const syncInterval = setInterval(async () => {
      const damageToSync = pendingDamageRef.current;

      if (damageToSync > 0) {
        try {
          // Reset pending immediately to avoid double counting if request is slow
          // (Optimistic update pattern could be better but this is safer for no-dupes)
          // Actually, if it fails we want to retry.
          // Let's keep it simple: sync, then subtract.

          const result = await contributeGuildDamageAction(
            userId,
            damageToSync,
          );

          if (result.success) {
            pendingDamageRef.current -= damageToSync;
            setStats((prev) => ({
              ...prev,
              pendingDamage: pendingDamageRef.current,
              bossHp: (result.bossHp as number) || prev.bossHp,
              bossTotalHp: (result.bossTotalHp as number) || prev.bossTotalHp,
            }));
          }
        } catch (e) {
          console.error("Guild Sync Failed", e);
        }
      }
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [userId]);

  return stats;
};
