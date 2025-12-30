import React from "react";
import { motion } from "framer-motion";
import { Crown, ArrowUpCircle, XCircle } from "lucide-react";
import ForgeButton from "../../../components/ui/ForgeButton";

interface OverchargePromptProps {
  onAccept: () => void;
  onDecline: () => void;
  suggestedWeight: number;
}

const OverchargePrompt: React.FC<OverchargePromptProps> = ({
  onAccept,
  onDecline,
  suggestedWeight,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-24 right-4 z-50 animate-slide-up w-80 md:w-96"
    >
      <div className="bg-zinc-900/95 border-2 border-yellow-500 rounded-xl p-4 shadow-[0_0_30px_rgba(234,179,8,0.3)] backdrop-blur-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-yellow-900/20 rounded-full border border-yellow-500/50">
            <Crown className="w-6 h-6 text-yellow-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-yellow-400 font-bold uppercase tracking-widest text-sm">
              Opportunity Detected
            </h3>
            <p className="text-zinc-400 text-xs">
              That last set was too easy...
            </p>
          </div>
        </div>

        <div className="bg-black/50 p-3 rounded mb-4 border border-zinc-800">
          <p className="text-zinc-200 text-sm font-serif italic text-center">
            &quot;The Iron Gods demand a true challenge. Increase load to{" "}
            <span className="text-yellow-400 font-bold">
              {suggestedWeight}kg
            </span>
            ?&quot;
          </p>
          <div className="mt-2 text-[10px] text-center uppercase tracking-widest text-yellow-600 font-bold">
            Reward: 2x XP + Rare Loot
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onAccept}
            className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 rounded uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowUpCircle className="w-4 h-4" /> Overcharge
          </button>
          <button
            onClick={onDecline}
            className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OverchargePrompt;
