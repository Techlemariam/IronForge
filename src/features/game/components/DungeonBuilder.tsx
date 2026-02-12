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
    <div className="h-full bg-[#050505] p-6 overflow-y-auto font-serif text-zinc-200">
      <h1 className="text-3xl font-black text-[#c79c6e] mb-6 border-b border-[#46321d] pb-4">
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
            className="w-full bg-[#111] border border-zinc-700 p-3 rounded focus:border-[#c79c6e] focus:outline-none"
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
            className="w-full bg-[#111] border border-zinc-700 p-3 rounded focus:border-[#c79c6e] focus:outline-none"
            placeholder="e.g. A dark cavern filled with heavy weights..."
          />
        </div>
      </div>

      <div className="space-y-6">
        {blocks.map((block, bIdx) => (
          <div
            key={block.id}
            className="bg-[#1a1a1a] border border-zinc-800 rounded-lg p-4 relative group transition-all"
          >
            <div className="absolute top-2 right-2 flex gap-1">
              <button
                onClick={() => moveBlock(bIdx, "UP")}
                disabled={bIdx === 0}
                className="p-1 text-zinc-600 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-600"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveBlock(bIdx, "DOWN")}
                disabled={bIdx === blocks.length - 1}
                className="p-1 text-zinc-600 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-600"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-zinc-700 mx-1 self-center"></div>
              <button
                onClick={() => removeBlock(bIdx)}
                className="p-1 text-zinc-600 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 pr-24">
              <input
                value={block.name}
                onChange={(e) => {
                  const newBlocks = [...blocks];
                  newBlocks[bIdx].name = e.target.value;
                  setBlocks(newBlocks);
                }}
                className="bg-transparent text-xl font-bold text-white focus:outline-none w-full"
              />
              <span className="text-[10px] uppercase font-bold text-[#c79c6e] bg-[#c79c6e]/10 px-2 py-0.5 rounded">
                {block.type}
              </span>
            </div>

            {block.type === BlockType.STATION && (
              <div className="space-y-4 pl-4 border-l-2 border-zinc-800">
                {block.exercises?.map((ex, eIdx) => (
                  <div key={ex.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-zinc-500" />
                      <input
                        value={ex.name}
                        onChange={(e) =>
                          updateExercise(bIdx, eIdx, "name", e.target.value)
                        }
                        className="bg-[#111] border border-zinc-700 p-1 rounded text-sm w-full"
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
                  className="text-xs text-zinc-500 hover:text-[#c79c6e] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Monster (Exercise)
                </button>
              </div>
            )}

            {block.type === BlockType.TRANSITION && (
              <textarea
                className="w-full bg-[#111] text-xs text-zinc-400 p-2 rounded"
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
          className="py-4 border-2 border-dashed border-zinc-700 text-zinc-500 hover:border-[#c79c6e] hover:text-[#c79c6e] rounded flex justify-center items-center gap-2 uppercase font-bold text-xs"
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

      <div className="mt-8 flex gap-4 sticky bottom-0 bg-[#050505] py-4 border-t border-zinc-900">
        <button
          onClick={onCancel}
          className="flex-1 py-3 text-zinc-500 hover:text-white"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 bg-[#c79c6e] hover:bg-[#d4a87a] text-[#46321d] font-bold uppercase tracking-widest rounded flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Dungeon
        </button>
      </div>
    </div>
  );
};

export default DungeonBuilder;
