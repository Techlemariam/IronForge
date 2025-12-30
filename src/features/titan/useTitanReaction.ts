import { useState, useEffect, useRef } from "react";
import { TITAN_THOUGHTS, TitanThoughtCategory } from "@/data/titanThoughts";

// Superseded by internal interface below to ensure export matches
/* export interface UseTitanReactionProps {
    heartRate: number;
    maxHeartRate?: number;
    isPaused?: boolean;
    hasFinished?: boolean;
    duration?: number;
} */

export interface UseTitanReactionProps {
  heartRate: number;
  power?: number;
  cadence?: number;
  ftp?: number;
  maxHeartRate?: number;
  isPaused?: boolean;
  hasFinished?: boolean;
  duration?: number;
}

export const useTitanReaction = ({
  heartRate,
  power = 0,
  cadence = 0,
  ftp = 200, // Default FTP
  maxHeartRate = 190,
  isPaused = false,
  hasFinished = false,
  duration = 0,
}: UseTitanReactionProps) => {
  const [thought, setThought] = useState<string>("");
  const [mood, setMood] = useState<TitanThoughtCategory>("IDLE");
  const lastChangeRef = useRef<number>(0);
  const lastCategoryRef = useRef<TitanThoughtCategory>("IDLE");

  // Context Analysis
  useEffect(() => {
    const getCategory = (): TitanThoughtCategory => {
      if (hasFinished) return "VICTORY";
      if (isPaused) return "IDLE";

      // 1. Power/Cadence Events override HR (immediate reaction)
      const powerPct = (power / ftp) * 100;

      // Sprint: > 150% FTP
      if (powerPct > 150) return "SPRINT";

      // Grind: Hard effort (> 90% FTP) at low cadence (< 60)
      if (powerPct > 90 && cadence > 0 && cadence < 60) return "GRIND";

      // Spinning: High cadence (> 100)
      if (cadence > 100) return "SPINNING";

      // 2. Heart Rate Zones (Base Logic)
      if (duration < 10 && heartRate < 100) return "WARMUP";

      const hrPct = (heartRate / maxHeartRate) * 100;

      // Consistency Check: If holding mid-zones (Z2/Z3) for long duration without urgent events
      // We use a simplified check here, assuming 'duration' > 5 mins and current zone is Z2/Z3
      // In a real implementation we'd track time-in-zone.
      if (duration > 300 && hrPct >= 60 && hrPct < 80) {
        // 10% chance to trigger consistency thought if not already triggered recently?
        // Or just let it be the return value if nothing urgent overrides it.
        // We need to ensure we don't get stuck in CONSISTENCY.
      }

      // Simplified return for now, but let's effectively map it.
      // Actually, we can just return CONSISTENCY if we are in Z2/Z3 and long duration,
      // but maybe we want to prioritize it LOWER than specific zone thoughts?
      // Let's add it as a return condition if nothing else matches?
      // Or better: Let it override generic Z2/Z3 occasionally?

      // Re-evaluating logic:
      if (hrPct < 50) return "WARMUP";
      if (hrPct < 60) return "WARMUP"; // Z1

      if (hrPct < 80) {
        // Z2 & Z3 range
        if (duration > 300) return "CONSISTENCY"; // After 5 mins, Z2/Z3 becomes "Consistency"
        if (hrPct < 70) return "ZONE_2";
        return "ZONE_3";
      }

      if (hrPct < 90) return "ZONE_4"; // Z4
      return "ZONE_5"; // Z5
    };

    const category = getCategory();
    const now = Date.now();
    const timeSinceLastChange = now - lastChangeRef.current;
    const MIN_DURATION = 15000; // 15s stability

    // High Intensity contexts (SPRINT/GRIND/Z5) update faster (5s) to capture the moment
    const isUrgentContext = ["SPRINT", "GRIND", "ZONE_5", "VICTORY"].includes(
      category,
    );
    const stableDuration = isUrgentContext ? 5000 : MIN_DURATION;

    // Change conditions:
    // 1. Category actually changed
    // 2. AND (Urgent update OR enough time passed)
    const shouldUpdate =
      (category !== lastCategoryRef.current &&
        (isUrgentContext || timeSinceLastChange > 5000)) || // Fast switch to urgent
      timeSinceLastChange > stableDuration; // Regular periodic refresh

    if (shouldUpdate) {
      const thoughts = TITAN_THOUGHTS[category] || TITAN_THOUGHTS["IDLE"];
      const randomThought =
        thoughts[Math.floor(Math.random() * thoughts.length)];

      setThought(randomThought);
      setMood(category);

      lastCategoryRef.current = category;
      lastChangeRef.current = now;
    }
  }, [
    heartRate,
    power,
    cadence,
    ftp,
    isPaused,
    hasFinished,
    maxHeartRate,
    duration,
  ]);

  return { thought, mood };
};
