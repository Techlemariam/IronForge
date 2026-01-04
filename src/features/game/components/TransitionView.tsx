import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Block } from "@/types";
import {
  Wrench,
  CheckCircle2,
  ArrowRight,
  Clock,
  SkipForward,
  Keyboard,
  X,
} from "lucide-react";
import { playSound } from "@/utils";

interface TransitionViewProps {
  block: Block;
  onComplete: () => void;
  onAbort: () => void;
}

// Mapping of setup names to image URLs (simulated for demo with matching aesthetic)
const SETUP_IMAGES: Record<string, string> = {
  "Landmine Station":
    "https://placehold.co/800x450/09090b/ea580c?text=Landmine+Configuration",
  "Hyper Pro GHD Mode":
    "https://placehold.co/800x450/09090b/ea580c?text=GHD+Configuration",
  "Belt Squat Station":
    "https://placehold.co/800x450/09090b/ea580c?text=Belt+Squat+Configuration",
};

const TransitionView: React.FC<TransitionViewProps> = ({
  block,
  onComplete,
  onAbort,
}) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Play sound on mount to signal phase change
    playSound("quest_accept");

    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        playSound("ding");
        onComplete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onComplete]);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const setupImage = block.targetSetupName
    ? SETUP_IMAGES[block.targetSetupName]
    : null;

  return (
    <div className="flex flex-col h-full animate-fade-in bg-[#050505]">
      {/* Header */}
      <div className="bg-orange-600 p-6 shadow-2xl shadow-orange-900/20 sticky top-0 z-10 relative">
        <button
          onClick={onAbort}
          className="absolute top-6 right-6 text-orange-200 hover:text-white transition-colors"
          title="Abandon Setup"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center justify-between mb-2 pr-8">
          <h2 className="text-orange-100 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Setup Phase
          </h2>
          <div className="flex items-center gap-2 bg-orange-700/50 px-3 py-1 rounded font-mono text-orange-100 font-bold">
            <Clock className="w-4 h-4" />
            {formatTime(seconds)}
          </div>
        </div>
        <h1 className="text-3xl font-black text-white leading-tight">
          {block.targetSetupName || "Prepare Station"}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* Instructions */}
        <div className="space-y-4">
          <h3 className="text-zinc-500 uppercase tracking-widest text-xs font-bold border-b border-zinc-800 pb-2">
            Configuration Protocol
          </h3>
          <ul className="space-y-4">
            {block.setupInstructions?.map((inst, idx) => (
              <li
                key={idx}
                className="flex items-start gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-lg group hover:border-orange-500/30 transition-colors"
              >
                <div className="mt-0.5 min-w-[24px] h-6 rounded-full border-2 border-zinc-700 text-zinc-500 flex items-center justify-center text-xs font-mono font-bold group-hover:border-orange-500 group-hover:text-orange-500 transition-colors">
                  {idx + 1}
                </div>
                <p className="text-zinc-300 leading-relaxed font-sans">
                  {inst}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Visual Aid */}
        {setupImage ? (
          <div className="aspect-video bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-lg relative group">
            <Image
              src={setupImage}
              alt={block.targetSetupName || "Setup"}
              fill
              className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950/90 to-transparent p-4">
              <span className="text-xs font-mono text-zinc-300 uppercase tracking-widest">
                Visual Reference: {block.targetSetupName}
              </span>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col items-center justify-center text-zinc-700">
            <Wrench className="w-12 h-12 mb-2 opacity-20" />
            <span className="font-mono text-xs uppercase">
              Visual Reference: {block.targetSetupName || "N/A"}
            </span>
          </div>
        )}

        <div className="flex items-center justify-center text-zinc-600 text-xs font-serif uppercase tracking-widest gap-2">
          <Keyboard className="w-4 h-4" />
          <span>Press [SPACE] to Confirm Setup</span>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-6 bg-zinc-950 border-t border-zinc-900 space-y-3">
        <button
          onClick={() => {
            playSound("ding");
            onComplete();
          }}
          className="w-full h-16 bg-zinc-100 hover:bg-white text-zinc-950 font-black text-xl uppercase tracking-widest rounded flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all active:scale-[0.98]"
        >
          <span>Station Ready</span>
          <ArrowRight className="w-6 h-6" />
        </button>

        <button
          onClick={onComplete}
          className="w-full py-4 border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900 rounded font-mono text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
        >
          <SkipForward className="w-4 h-4" />
          <span>Manual Override</span>
        </button>
      </div>
    </div>
  );
};

export default TransitionView;
