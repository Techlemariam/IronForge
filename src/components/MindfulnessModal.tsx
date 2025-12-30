import React, { useState } from "react";
import { Brain, X, Check, Cloud, Sparkles } from "lucide-react";
import { StorageService } from "../services/storage";
import { MeditationLog } from "../types";
import { playSound } from "../utils";

interface MindfulnessModalProps {
  onClose: () => void;
  onSave: () => void; // Trigger refresh in parent
}

const MindfulnessModal: React.FC<MindfulnessModalProps> = ({
  onClose,
  onSave,
}) => {
  const [duration, setDuration] = useState<number>(10);
  const [source, setSource] = useState<"Headspace" | "Calm" | "Other">(
    "Headspace",
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    const log: MeditationLog = {
      date: new Date().toISOString(),
      durationMinutes: duration,
      source: source,
    };

    await StorageService.saveMeditation(log);
    playSound("quest_accept"); // Sound effect
    setIsSaved(true);

    setTimeout(() => {
      onSave();
      onClose();
    }, 1500);
  };

  if (isSaved) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(59,130,246,0.5)]">
            <Brain className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-blue-100 uppercase tracking-widest">
            Mind Fog Cleared
          </h2>
          <p className="text-blue-300 font-mono text-sm">
            + {duration} Mana Restored
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#111] border-2 border-blue-900 w-full max-w-sm rounded-lg shadow-[0_0_50px_rgba(30,58,138,0.3)] overflow-hidden font-serif">
        {/* Header */}
        <div className="bg-blue-950/30 p-4 border-b border-blue-900/50 flex justify-between items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse-slow"></div>
          <div className="flex items-center gap-2 text-blue-400 relative z-10">
            <Cloud className="w-5 h-5" />
            <h2 className="font-bold uppercase tracking-widest text-sm">
              The Void Sanctum
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-zinc-400 text-xs font-sans text-center leading-relaxed">
            &quot;Direct neural link to Headspace/Calm is unavailable. Manually
            scribe your time in the void to regenerate mental attributes.&quot;
          </p>

          {/* Input Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase text-blue-300">
              <span>Duration</span>
              <span>{duration} Min</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Source Selector */}
          <div className="grid grid-cols-3 gap-2">
            {["Headspace", "Calm", "Other"].map((s) => (
              <button
                key={s}
                onClick={() => setSource(s as any)}
                className={`py-2 text-[10px] font-bold uppercase tracking-wider border rounded transition-all ${
                  source === s
                    ? "bg-blue-900/40 border-blue-500 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                    : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            className="w-full py-4 bg-blue-900/20 hover:bg-blue-800/40 text-blue-400 border border-blue-800 hover:border-blue-400 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all group"
          >
            <Sparkles className="w-4 h-4 group-hover:animate-spin-slow" />
            <span>Log Meditation</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MindfulnessModal;
