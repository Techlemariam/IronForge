import React, { useState } from "react";
import {
  Session,
  Block,
  BlockType,
  Exercise,
  ExerciseLogic,
} from "@/types";
import {
  Plus,
  Trash2,
  Save,
  Dumbbell,
  ArrowDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface DungeonBuilderProps {
  onSave: (session: Session) => void;
  onCancel: () => void;
}

const DungeonBuilder: React.FC<DungeonBuilderProps> = ({
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: `blk_${Date.now()}`,
      name: type === BlockType.TRANSITION ? "Transition Area" : "New Station",
      type,
      exercises: type === BlockType.STATION ? [] : undefined,
      setupInstructions:
        type === BlockType.TRANSITION ? ["Setup instruction 1"] : undefined,
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (index: number) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: "UP" | "DOWN") => {
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    const temp = newBlocks[targetIndex];
    newBlocks[targetIndex] = newBlocks[index];
    newBlocks[index] = temp;
    setBlocks(newBlocks);
  };

  const addExercise = (blockIndex: number) => {
    const newEx: Exercise = {
      id: `ex_${Date.now()}`,
      name: "New Exercise",
      logic: ExerciseLogic.FIXED_REPS,
      sets: [
        { id: `s_${Date.now()}_1`, reps: 10, completed: false },
        { id: `s_${Date.now()}_2`, reps: 10, completed: false },
        { id: `s_${Date.now()}_3`, reps: 10, completed: false },
      ],
      instructions: ["Perform with perfect form."],
    };

    const updatedBlocks = [...blocks];
    if (!updatedBlocks[blockIndex].exercises)
      updatedBlocks[blockIndex].exercises = [];
    updatedBlocks[blockIndex].exercises!.push(newEx);
    setBlocks(updatedBlocks);
  };

  const updateExercise = (
    bIdx: number,
    eIdx: number,
    field: keyof Exercise,
    value: any,
  ) => {
    const updatedBlocks = [...blocks];
    updatedBlocks[bIdx].exercises![eIdx] = {
      ...updatedBlocks[bIdx].exercises![eIdx],
      [field]: value,
    };
    setBlocks(updatedBlocks);
  };

  const handleSave = () => {
    if (!name) return alert("Dungeon must have a name!");
    const session: Session = {
      id: `custom_${Date.now()}`,
      name,
      zoneName: zoneName || "The Player Realm",
      difficulty: "Normal",
      blocks,
      isCustom: true,
    };
    onSave(session);
  };

  return (
    <div className="h-full bg-[var(--color-void)] p-6 overflow-y-auto font-sans text-zinc-200">
      <h1 className="text-3xl font-black text-[var(--color-clay)] mb-6 border-b border-[var(--color-armor)] pb-4">
        Dungeon Architect
      </h1>

      <div className="space-y-4 mb-8">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-zinc-500">
            Dungeon Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[var(--color-armor)] border border-[var(--color-steel)] p-3 rounded focus:border-[var(--color-clay)] focus:outline-none"
            placeholder="e.g. The Iron Fortress"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-zinc-500">
            Zone / Flavor Text
          </label>
          <input
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            className="w-full bg-[var(--color-armor)] border border-[var(--color-steel)] p-3 rounded focus:border-[var(--color-clay)] focus:outline-none"
            placeholder="e.g. A dark cavern filled with heavy weights..."
          />
        </div>
      </div>

      <div className="space-y-6">
        {blocks.map((block, bIdx) => (
          <div
            key={block.id}
            className="bg-[var(--color-armor)] border border-[var(--color-steel)] rounded-lg p-4 relative group transition-all"
          >
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                onClick={() => moveBlock(bIdx, -1)}
                disabled={bIdx === 0}
                aria-label="Move Block Up"
                title="Move Block Up"
                className="p-1 text-zinc-600 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-600"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveBlock(bIdx, 1)}
                disabled={bIdx === blocks.length - 1}
                aria-label="Move Block Down"
                title="Move Block Down"
                className="p-1 text-zinc-600 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-600"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-zinc-700 mx-1 self-center"></div>
              <button
                onClick={() => removeBlock(block.id)}
                aria-label="Remove Block"
                title="Remove Block"
                className="p-1 text-zinc-600 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 pr-24">
              <input
                value={block.name}
                onChange={(e) => updateBlock(bIdx, "name", e.target.value)}
                aria-label="Block Name"
                placeholder="Block Name"
                className="bg-transparent text-xl font-bold text-[var(--color-clay)] focus:outline-none w-full"
              />
              <span className="text-[10px] uppercase font-bold text-[var(--color-clay)] bg-[var(--color-clay)]/10 px-2 py-0.5 rounded">
                {block.type}
              </span>
            </div>

            {block.type === BlockType.STATION && (
              <div className="space-y-4 pl-4 border-l-2 border-[var(--color-steel)]">
                {block.exercises?.map((ex, eIdx) => (
                  <div key={ex.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-zinc-500" />
                      <input
                        value={ex.name}
                        onChange={(e) =>
                          updateExercise(bIdx, eIdx, "name", e.target.value)
                        }
                        aria-label="Exercise Name"
                        placeholder="Exercise Name"
                        className="bg-[var(--color-void)] border border-[var(--color-steel)] p-1 rounded text-sm w-full"
                      />
                    </div>
                    <div className="flex gap-2">
                      {ex.sets.map((set, sIdx) => (
                        <div
                          key={set.id}
                          className="bg-zinc-900 px-2 py-1 rounded text-xs border border-zinc-800"
                        >
                          Set {sIdx + 1}: {set.reps} reps
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addExercise(bIdx)}
                  className="text-xs text-zinc-500 hover:text-[var(--color-clay)] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Monster (Exercise)
                </button>
              </div>
            )}

            {block.type === BlockType.TRANSITION && (
              <textarea
                className="w-full bg-[var(--color-void)] text-xs text-zinc-400 p-2 rounded"
                placeholder="Setup instructions..."
                value={block.setupInstructions?.join("\n")}
                onChange={(e) => {
                  const newBlocks = [...blocks];
                  newBlocks[bIdx].setupInstructions =
                    e.target.value.split("\n");
                  setBlocks(newBlocks);
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <button
          onClick={() => addBlock(BlockType.STATION)}
          className="py-4 border-2 border-dashed border-[var(--color-steel)] text-zinc-500 hover:border-[var(--color-clay)] hover:text-[var(--color-clay)] rounded flex justify-center items-center gap-2 uppercase font-bold text-xs"
        >
          <Plus className="w-4 h-4" /> Add Station
        </button>
        <button
          onClick={() => addBlock(BlockType.TRANSITION)}
          className="py-4 border-2 border-dashed border-zinc-700 text-zinc-500 hover:border-blue-500 hover:text-blue-500 rounded flex justify-center items-center gap-2 uppercase font-bold text-xs"
        >
          <ArrowDown className="w-4 h-4" /> Add Transition
        </button>
      </div>

      <div className="mt-8 flex gap-4 sticky bottom-0 bg-[var(--color-void)] py-4 border-t border-[var(--color-armor)]">
        <button
          onClick={onCancel}
          className="flex-1 py-3 text-zinc-500 hover:text-white"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 bg-[var(--color-clay)] hover:bg-[var(--color-clay)]/80 text-[var(--color-void)] font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Dungeon
        </button>
      </div>
    </div>
  );
};

export default DungeonBuilder;
