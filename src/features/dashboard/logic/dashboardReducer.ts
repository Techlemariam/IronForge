import { DashboardState, DashboardAction } from "../types";
import { mapHevyToQuest } from "@/utils/hevyAdapter";
import { mapSessionToQuest } from "@/utils/typeMappers";

export const dashboardReducer = (
  state: DashboardState,
  action: DashboardAction,
): DashboardState => {
  switch (action.type) {
    case "INITIAL_DATA_LOAD_START":
      return { ...state, isCodexLoading: true };
    case "INITIAL_DATA_LOAD_SUCCESS":
      return {
        ...state,
        isCodexLoading: false,
        exerciseNameMap: action.payload.nameMap,
        ttb: action.payload.ttb,
        wellnessData: action.payload.wellness,
        level: action.payload.level,
        auditReport: action.payload.auditReport,
        oracleRecommendation: action.payload.oracleRec,
        weaknessAudit: action.payload.weaknessAudit,
        forecast: action.payload.forecast,
        events: action.payload.events,
        titanAnalysis: action.payload.titanAnalysis,
      };
    case "INITIAL_DATA_LOAD_FAILURE":
      return { ...state, isCodexLoading: false };
    case "SELECT_ROUTINE":
      return {
        ...state,
        questTitle: action.payload.routine.title,
        activeQuest: mapHevyToQuest(
          action.payload.routine,
          action.payload.nameMap,
        ),
        startTime: new Date(),
        currentView: "iron_mines",
      };
    case "COMPLETE_QUEST":
      return { ...state, currentView: "quest_completion" };
    case "SAVE_WORKOUT":
    case "ABORT_QUEST":
      return {
        ...state,
        activeQuest: null,
        questTitle: "",
        startTime: null,
        currentView: "citadel",
      };
    case "SET_VIEW":
      return { ...state, currentView: action.payload };
    case "START_COMBAT":
      return {
        ...state,
        currentView: "combat_arena",
        activeBossId: action.payload,
      };

    case "START_GENERATED_QUEST":
      return {
        ...state,
        questTitle: action.payload.name,
        activeQuest: mapSessionToQuest(
          action.payload.blocks.flatMap((b) => b.exercises || []),
        ),
        startTime: new Date(),
        currentView: "iron_mines",
      };
    case "RECALCULATE_PROGRESSION":
      return { ...state, level: action.payload.level };
    case "TOGGLE_COACH":
      return { ...state, isCoachOpen: !state.isCoachOpen };
    case "UPDATE_PATH":
      return { ...state, activePath: action.payload };
    case "SET_CARDIO_MODE":
      return {
        ...state,
        cardioMode: action.payload,
        currentView: "cardio_studio",
        returnView: state.currentView,
      };
    case "START_CODEX_WORKOUT":
      const { workout } = action.payload;
      if (workout.type === "RUN" || workout.type === "BIKE") {
        return {
          ...state,
          activeWorkout: workout,
          cardioMode: workout.type === "RUN" ? "running" : "cycling",
          currentView: "cardio_studio",
          returnView: "training_center",
        };
      } else {
        return {
          ...state,
          activeWorkout: workout,
          questTitle: workout.name,
          activeQuest: null,
          startTime: new Date(),
          currentView: "iron_mines",
        };
      }
    case "RETURN_TO_PREVIOUS":
      return {
        ...state,
        currentView: state.returnView || "citadel",
        returnView: null,
        activeWorkout: undefined,
      };
    case "UPDATE_CHALLENGES":
      return { ...state, challenges: action.payload };
    default:
      return state;
  }
};
