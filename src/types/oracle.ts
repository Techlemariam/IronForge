import { IntervalsWellness } from "@/types";

export type OracleDecreeType = "BUFF" | "DEBUFF" | "NEUTRAL";

export interface OracleDecree {
  type: OracleDecreeType;
  label: string; // e.g. "Decree of Rest"
  description: string; // e.g. "The Titan demands rest to heal."
  effect?: {
    stat?: string; // e.g. "strength"
    modifier?: number; // e.g. 0.8
    xpMultiplier?: number; // e.g. 1.2
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
