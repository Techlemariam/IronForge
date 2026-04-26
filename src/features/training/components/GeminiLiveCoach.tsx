import { Brain, X } from 'lucide-react';
import type React from 'react';

interface GeminiLiveCoachProps {
  isOpen: boolean;
  onClose: () => void;
}

const OracleLiveCoach: React.FC<GeminiLiveCoachProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 animate-slide-up">
      <div className="bg-black/90 border border-purple-500 rounded-lg p-4 shadow-[0_0_20px_rgba(168,85,247,0.3)] w-72 backdrop-blur-md">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 text-purple-400">
            <Brain className="w-5 h-5" />
            <span className="font-bold uppercase text-xs tracking-widest">The Oracle</span>
          </div>
          <button
            aria-label="Close Oracle"
            onClick={onClose}
            className="text-zinc-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="h-24 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center relative overflow-hidden p-4">
          <p className="text-[10px] text-zinc-400 text-center font-mono uppercase tracking-tighter">
            [ Neural Audio Link Offline ]<br/>
            The Oracle only speaks through the text terminals in Local-Only mode.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OracleLiveCoach;
