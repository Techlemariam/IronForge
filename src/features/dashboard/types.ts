import { Exercise } from "@/types/ironforge";
import {
  IntervalsWellness,
  TTBIndices,
  WeaknessAudit,
  TSBForecast,
  IntervalsEvent,
  TitanLoadCalculation,
  Session,
} from "@/types";
import { OracleRecommendation } from "@/types";
import { AuditReport } from "@/types/auditor";
import {
  TrainingPath,
  LayerLevel,
  WeeklyMastery,
  Faction,
  WorkoutDefinition,
} from "@/types/training";
import { CardioMode } from "@/features/training/CardioStudio";
import { HevyExerciseTemplate, HevyRoutine } from "@/types/hevy";
import { ChallengeWithStatus } from "@/components/gamification/QuestBoard";
import { TitanState } from "@/actions/titan";

export type View =
  | "citadel"
  | "war_room"
  | "iron_mines"
  | "quest_completion"
  | "armory"
  | "bestiary"
  | "world_map"
  | "grimoire"
  | "guild_hall"
  | "arena"
  | "marketplace"
  | "combat_arena"
  | "forge"
  | "training_center"
  | "cardio_studio"
  | "social_hub"
  | "item_shop"
  | "strava_upload"
  | "strength_log"
  | "program_builder"
  | "trophy_room"
  | "import_routines";

export interface DashboardData {
  wellness: IntervalsWellness;
  activities: any[];
  events: IntervalsEvent[];
  ttb: TTBIndices;
  recommendation: OracleRecommendation | null;
  auditReport: AuditReport | null;
  forecast: TSBForecast[];
  titanAnalysis: TitanLoadCalculation | null;
  activePath: TrainingPath;
  weeklyMastery?: WeeklyMastery;
  activeDuel?: any;
}

export interface DashboardClientProps {
  initialData: DashboardData;
  userData: any;
  dbUser?: any;
  isMobile?: boolean;
  hevyTemplates: HevyExerciseTemplate[];
  hevyRoutines: HevyRoutine[];
  intervalsConnected: boolean;
  stravaConnected: boolean;
  pocketCastsConnected: boolean;
  faction: Faction | string;
  hasCompletedOnboarding: boolean;
  isDemoMode?: boolean;
  challenges: ChallengeWithStatus[];
  titanState?: TitanState | null;
  activeDuel?: any;
}

export interface DashboardState {
  isCodexLoading: boolean;
  wellnessData: IntervalsWellness | null;
  ttb: TTBIndices | null;
  level: number;
  activeQuest: Exercise[] | null;
  questTitle: string;
  exerciseNameMap: Map<string, string>;
  startTime: Date | null;
  currentView: View;
  oracleRecommendation: OracleRecommendation | null;
  auditReport: AuditReport | null;
  weaknessAudit: WeaknessAudit | null;
  forecast: TSBForecast[];
  events: IntervalsEvent[];
  titanAnalysis: TitanLoadCalculation | null;
  isCoachOpen: boolean;
  activeBossId: string | null;
  activePath: TrainingPath;
  mobilityLevel: LayerLevel;
  recoveryLevel: LayerLevel;
  totalExperience: number;
  weeklyMastery?: WeeklyMastery;
  cardioMode?: CardioMode;
  activeWorkout?: WorkoutDefinition;
  returnView: View | null;
  faction: Faction;
  challenges: ChallengeWithStatus[];
  activeDuel?: any;
}

export type DashboardAction =
  | { type: "INITIAL_DATA_LOAD_START" }
  | { type: "INITIAL_DATA_LOAD_SUCCESS"; payload: any }
  | { type: "INITIAL_DATA_LOAD_FAILURE" }
  | {
    type: "SELECT_ROUTINE";
    payload: { routine: HevyRoutine; nameMap: Map<string, string> };
  }
  | { type: "COMPLETE_QUEST" }
  | { type: "SAVE_WORKOUT" }
  | { type: "ABORT_QUEST" }
  | { type: "SET_VIEW"; payload: View }
  | { type: "START_COMBAT"; payload: string }
  | { type: "START_GENERATED_QUEST"; payload: Session }
  | { type: "RECALCULATE_PROGRESSION"; payload: { level: number } }
  | { type: "TOGGLE_COACH" }
  | { type: "UPDATE_PATH"; payload: TrainingPath }
  | { type: "SET_CARDIO_MODE"; payload: CardioMode }
  | { type: "START_CODEX_WORKOUT"; payload: { workout: WorkoutDefinition } }
  | { type: "RETURN_TO_PREVIOUS" }
  | { type: "UPDATE_CHALLENGES"; payload: ChallengeWithStatus[] };
