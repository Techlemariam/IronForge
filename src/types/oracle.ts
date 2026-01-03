import { IntervalsWellness } from "@/types";

export type OracleDecreeType = "BUFF" | "DEBUFF" | "NEUTRAL";

export interface OracleDecree {
  type: OracleDecreeType;
  code: string; // e.g. "REST_FORCED", "PR_PRIMED"
  label: string;
  description: string;
  actions: {
    lockFeatures?: string[]; // ["HEAVY_LIFT", "PVP"]
    unlockBuffs?: string[];  // ["XP_BOOST"]
    notifyUser: boolean;
    urgency: "LOW" | "MEDIUM" | "HIGH";
  };
  effect?: {
    stat?: string;
    modifier?: number;
    xpMultiplier?: number;
  };
}

export interface DecreeContext {
  wellness: IntervalsWellness;
  recentVolume: number; // calculated from last 7 days maybe?
  recentLoad: number; // calculated from last 7 days
  history: {
    strength: unknown[]; // ExerciseLog[] - kept as unknown for flexibility
    cardio: unknown[]; // CardioLog[]
  };
}
