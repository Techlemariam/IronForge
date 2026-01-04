import React, { useState, useEffect } from "react";
import {
  Cloud,
  X,
  Shield,
  RefreshCw,
  CheckCircle2,
  Server,
  Wifi,
} from "lucide-react";
import { ValhallaPayload, ValhallaSyncResult } from "@/types";
import { ValhallaService } from "@/services/valhalla";
import { playSound } from "@/utils";
import { useSkills } from "@/context/SkillContext";

interface ValhallaGateProps {
  isOpen: boolean;
  onClose: () => void;
  heroName: string | undefined;
  onBind: (name: string, id: string) => void;
  syncPayload: ValhallaPayload | null; // Partial payload from App
}

const ValhallaGate: React.FC<ValhallaGateProps> = ({
  isOpen,
  onClose,
  heroName,
  onBind,
  syncPayload,
}) => {
  const [step, setStep] = useState<"BIND" | "IDLE" | "SYNCING" | "SUCCESS">(
    "BIND",
  );
  const [inputName, setInputName] = useState(heroName || "");
  const [logs, setLogs] = useState<string[]>([]);

  // Integrate Skills Context
  const { purchasedSkillIds } = useSkills();

  // Construct final payload with skills
  const finalPayload: ValhallaPayload | null = syncPayload
    ? {
      ...syncPayload,
      skills: Array.from(purchasedSkillIds),
    }
    : null;

  useEffect(() => {
    if (isOpen) {
      if (heroName) {
        setStep("IDLE");
      } else {
        setStep("BIND");
      }
      setLogs([]);
    }
  }, [isOpen, heroName]);

  const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

  const handleBind = async () => {
    if (!inputName) return;
    setStep("SYNCING");
    addLog("Initiating Soul Bind Protocol...");

    const res = await ValhallaService.bindSoul(inputName);

    if (res.success) {
      playSound("quest_accept");
      addLog(`Identity Confirmed. Welcome, ${inputName}.`);
      addLog(`Valhalla ID Assigned: ${res.id}`);
      onBind(inputName, res.id);
      // Step transition handled by useEffect on heroName change
    }
  };

  const handleSync = async () => {
    if (!finalPayload) return;
    setStep("SYNCING");
    playSound("quest_accept");
    addLog("Opening Bifrost Gate...");
    addLog("Compressing Soul Data...");

    const res = await ValhallaService.engraveRecords(finalPayload);

    if (res.success) {
      playSound("achievement");
      addLog("Success: " + res.message);
      setStep("SUCCESS");
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]/90 backdrop-blur-md animate-fade-in p-4">
      <div className="w-full max-w-md bg-[#0a0f14] border-2 border-cyan-900 rounded-lg shadow-[0_0_50px_rgba(8,145,178,0.2)] overflow-hidden font-serif relative">
        {/* Valhalla Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-cyan-950 to-[#0a0f14] p-6 border-b border-cyan-900/50 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Cloud className="w-6 h-6" />
              <h2 className="font-bold uppercase tracking-[0.2em] text-sm">
                Project Valhalla
              </h2>
            </div>
            <p className="text-cyan-700 text-[10px] font-sans">
              IronForge Cloud Services (v1.0)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-cyan-800 hover:text-cyan-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 relative z-10">
          {/* STEP 1: BIND SOUL (Login) */}
          {step === "BIND" && (
            <div className="space-y-4 animate-slide-up">
              <div className="text-center">
                <div className="w-20 h-20 bg-cyan-900/20 border border-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-pulse">
                  <Shield className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-cyan-100 font-bold uppercase tracking-widest mb-2">
                  Bind Your Soul
                </h3>
                <p className="text-cyan-500/60 text-xs font-sans max-w-xs mx-auto">
                  Create a permanent link to the Hall of Records to enable
                  cross-device progression.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-cyan-700 tracking-widest">
                  Hero Name
                </label>
                <input
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="w-full bg-[#050505] border border-cyan-900 p-3 text-cyan-100 focus:border-cyan-500 focus:outline-none rounded font-mono text-center uppercase tracking-widest"
                  placeholder="ENTER NAME"
                />
              </div>
              <button
                onClick={handleBind}
                disabled={!inputName}
                className="w-full py-4 bg-cyan-900/30 border border-cyan-600 text-cyan-400 hover:bg-cyan-800/40 font-bold uppercase tracking-widest rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Engrave Name
              </button>
            </div>
          )}

          {/* STEP 2: DASHBOARD (Sync) */}
          {step === "IDLE" && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex items-center justify-between bg-cyan-950/20 p-4 rounded border border-cyan-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-900 rounded-full flex items-center justify-center text-cyan-200 font-bold text-lg">
                    {inputName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-cyan-100 font-bold uppercase text-sm">
                      {inputName}
                    </div>
                    <div className="text-cyan-700 text-[10px] flex items-center gap-1">
                      <Wifi className="w-3 h-3" /> Connected
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-cyan-600 uppercase">
                    Cloud Status
                  </div>
                  <div className="text-cyan-400 font-bold text-xs">Ready</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase text-cyan-800 border-b border-cyan-900/50 pb-1">
                  Pending Upload
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-cyan-600 font-mono">
                  <div>
                    XP Level:{" "}
                    <span className="text-cyan-300">
                      {finalPayload?.level || 0}
                    </span>
                  </div>
                  <div>
                    Achievements:{" "}
                    <span className="text-cyan-300">
                      {finalPayload?.achievements.length || 0}
                    </span>
                  </div>
                  <div>
                    Talents:{" "}
                    <span className="text-cyan-300">
                      {finalPayload?.skills.length || 0}
                    </span>
                  </div>
                  <div>
                    Logs:{" "}
                    <span className="text-cyan-300">
                      {finalPayload?.historyCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSync}
                className="w-full py-6 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-500/50 hover:border-cyan-400 text-cyan-100 font-black uppercase tracking-[0.15em] rounded transition-all shadow-[0_0_30px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] flex flex-col items-center justify-center gap-1 group"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                  <span>Sync to Valhalla</span>
                </div>
                <span className="text-[9px] text-cyan-600 font-sans group-hover:text-cyan-400">
                  Overwrites Remote Data
                </span>
              </button>
            </div>
          )}

          {/* STEP 3: TERMINAL LOGS (Syncing/Success) */}
          {(step === "SYNCING" || step === "SUCCESS") && (
            <div className="h-64 bg-black border border-cyan-900/50 p-4 rounded font-mono text-xs overflow-y-auto space-y-2 shadow-inner">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-cyan-800">
                    [{new Date().toLocaleTimeString()}]
                  </span>
                  <span className="text-cyan-400">{log}</span>
                </div>
              ))}
              {step === "SYNCING" && (
                <div className="animate-pulse text-cyan-600">
                  _ Process Active...
                </div>
              )}
              {step === "SUCCESS" && (
                <div className="text-green-500 font-bold mt-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  SYNC COMPLETE
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Status */}
        <div className="bg-[#050505] p-3 text-center border-t border-cyan-900/30">
          <div className="flex items-center justify-center gap-2 text-[10px] text-cyan-800 uppercase font-bold tracking-widest">
            <Server className="w-3 h-3" />
            <span>Server Realm: EU-North (Simulated)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValhallaGate;
