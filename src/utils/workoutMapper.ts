import { WorkoutDefinition } from "@/types/training";
import { Session, Block, BlockType, ExerciseLogic } from "@/types";

/**
 * Maps a static WorkoutDefinition (from the Codex) to an executable Session
 * compatible with IronMines.
 */
export function mapDefinitionToSession(def: WorkoutDefinition): Session {
  const session: Session = {
    id: `gen-${def.id}-${Date.now()}`, // Generate unique ID
    name: def.name, // Use 'name' property as Session title
    // startTime: new Date().toISOString(), // Removed this property as it's not in Session type
    blocks: [],
    zoneName: "Training Center",
    difficulty: "Normal",
    levelReq: 1,
  };

  const genericBlock: Block = {
    id: `blk-${Date.now()}`,
    name: "Main Workout",
    type: BlockType.STATION,
    exercises: [
      {
        id: `ex-${Date.now()}`,
        name: "Primary Lift (Manual)",
        logic: ExerciseLogic.FIXED_REPS,
        sets: [
          {
            id: `s-1`,
            weight: 0,
            reps: 5,
            rpe: 7,
            completed: false,
            type: "STRAIGHT",
          },
          {
            id: `s-2`,
            weight: 0,
            reps: 5,
            rpe: 8,
            completed: false,
            type: "STRAIGHT",
          },
          {
            id: `s-3`,
            weight: 0,
            reps: 5,
            rpe: 9,
            completed: false,
            type: "STRAIGHT",
          },
        ],
      },
    ],
  };

  session.blocks.push(genericBlock);

  return session;
}
