import React, { useState, useContext, useEffect } from "react";
import {
  Session,
  BlockType,
  Block,
  Exercise,
  ExerciseLog,
  AppSettings,
  IntervalsWellness,
} from "@/types";
import QuestLog from "@/components/QuestLog";
import TransitionView from "@/components/TransitionView";
import PreWorkoutCheck from "@/components/PreWorkoutCheck";
import {
  CheckCircle2,
  Crown,
  Save,
  Upload,
  Loader2,
  Zap,
  AlertTriangle,
  PlayCircle,
  Trash2,
} from "lucide-react";
import { useMiningSession } from "./hooks/useMiningSession";
import { IntegrationService } from "@/services/integration";
import DungeonSessionView from "./components/DungeonSessionView";

interface IronMinesProps {
  session: Session;
  onExit: () => void;
  onComplete?: (results?: any) => void;
}

const IronMines: React.FC<IronMinesProps> = ({
  session,
  onExit,
  onComplete,
}) => {
  const {
    activeSession,
    setActiveSession,
    hasCheckedIn,
    setHasCheckedIn,
    completed,
    setCompleted,
    isSaving,
    showAbandonConfirm,
    setShowAbandonConfirm,
    wellnessData,
    exportStatus,
    foundRecovery,
    handleRestore,
    handleDiscard,
    handleExport,
    confirmAbandon,
  } = useMiningSession({ initialSession: session, onComplete, onExit });

  const handleAbortRequest = () => {
    setShowAbandonConfirm(true);
  };

  // --- RECOVERY UI ---
  if (foundRecovery) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 animate-fade-in font-serif">
        <div className="max-w-md w-full border-2 border-red-500 rounded-lg p-6 bg-red-950/20 shadow-[0_0_50px_rgba(220,38,38,0.3)]">
          <div className="flex items-center gap-3 text-red-500 mb-4">
            <AlertTriangle className="w-8 h-8" />
            <h2 className="text-xl font-black uppercase tracking-widest">
              Session Interrupted
            </h2>
          </div>
          <p className="text-zinc-300 mb-6 font-sans text-sm">
            Resume &quot;{foundRecovery.sessionData.name}&quot;?
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRestore}
              className="w-full py-4 bg-green-600 text-white font-black uppercase rounded"
            >
              Resume Quest
            </button>
            <button
              onClick={handleDiscard}
              className="w-full py-3 bg-zinc-900 border border-zinc-700 text-zinc-400 uppercase"
            >
              Discard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- PRE-CHECK ---
  if (!hasCheckedIn) {
    return (
      <PreWorkoutCheck
        session={activeSession}
        onProceed={(finalSession) => {
          setActiveSession(finalSession);
          setHasCheckedIn(true);
        }}
        onCancel={onExit}
      />
    );
  }

  // --- COMPLETION SCREEN ---
  const isRested = (wellnessData?.sleepScore || 0) > 80;

  if (completed) {
    const sessionType = IntegrationService.detectSessionType(activeSession);
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 p-6 text-center space-y-6 animate-fade-in font-serif">
        <div className="w-24 h-24 rounded-full bg-green-900/20 flex items-center justify-center border-2 border-green-800 text-green-500 mb-4 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tight">
          Quest Complete
        </h1>
        <p className="text-zinc-500 max-w-md font-sans text-sm">
          {isSaving
            ? "Writing to Tomes..."
            : "Great work. The logistical data has been logged to the Local Database."}
        </p>

        {isRested && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Zap className="w-3 h-3 text-white fill-current" />
            <span className="text-blue-300 font-bold uppercase tracking-widest text-xs">
              Rested XP Bonus
            </span>
          </div>
        )}

        {!isSaving && (
          <div className="w-full max-w-xs space-y-3">
            <button
              onClick={handleExport}
              disabled={
                exportStatus === "UPLOADING" || exportStatus === "SUCCESS"
              }
              className={`w-full py-4 border-2 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all
                    ${sessionType === "CARDIO" ? "bg-blue-900/20 border-blue-600 text-blue-400" : "bg-orange-900/20 border-orange-600 text-orange-400"}
                    ${exportStatus === "SUCCESS" ? "opacity-50 cursor-not-allowed" : ""}
                  `}
            >
              {exportStatus === "UPLOADING" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              {exportStatus === "UPLOADING"
                ? "Syncing..."
                : exportStatus === "SUCCESS"
                  ? "Exported"
                  : "Upload Data"}
            </button>
          </div>
        )}

        <button
          onClick={onExit}
          disabled={isSaving}
          className="px-8 py-4 bg-zinc-100 hover:bg-white text-zinc-950 font-bold uppercase tracking-wider rounded shadow-lg flex items-center gap-2"
        >
          {isSaving ? <Save className="w-4 h-4 animate-bounce" /> : null}
          Return to Dashboard
        </button>
      </div>
    );
  }

  // --- MAIN TRAINING VIEW (QUEST LOG) ---
  return (
    <>
      {showAbandonConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-fade-in font-serif">
          <div className="bg-[#111] border-2 border-red-900 w-full max-w-sm rounded-lg p-6 shadow-[0_0_50px_rgba(220,38,38,0.3)]">
            <h3 className="text-red-500 font-bold uppercase text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Abandon Quest?
            </h3>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed font-sans">
              Retreating now will forfeit all progress made in this session. Are
              you sure you want to return to the dashboard?
            </p>
            <div className="space-y-3">
              <button
                onClick={confirmAbandon}
                className="w-full py-4 bg-red-900/20 border border-red-600/50 text-red-500 hover:bg-red-900 hover:text-white font-bold uppercase tracking-widest rounded transition-all"
              >
                Confirm Retreat
              </button>
              <button
                onClick={() => setShowAbandonConfirm(false)}
                className="w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white font-mono text-xs uppercase rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ActionView: The Main Workout Interface */}
      {/* DungeonSessionView: The Main Workout Interface (Replaces ActionView) */}
      <DungeonSessionView
        title={activeSession.name || "Dungeon Quest"}
        initialData={activeSession.blocks[0].exercises || []}
        onComplete={() => setCompleted(true)}
        onAbort={handleAbortRequest}
        wellness={wellnessData}
      />
    </>
  );
};


export default IronMines;
