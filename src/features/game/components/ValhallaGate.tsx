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
import { ValhallaPayload } from "@/types";
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-void)]/90 backdrop-blur-md animate-fade-in p-4">
      <div className="w-full max-w-md bg-[var(--color-void)] border-2 border-[var(--color-warp)] rounded-lg shadow-[0_0_50px_rgba(163,53,238,0.2)] overflow-hidden font-sans relative">
        {/* Valhalla Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

        {/* Header */}
        <div className="relative bg-gradient-to-r from-[var(--color-warp)]/20 to-[var(--color-void)] p-6 border-b border-[var(--color-warp)]/50 flex justify-between items-start">
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
                  <div className="w-20 h-20 bg-[var(--color-armor)]/20 border border-[var(--color-plasma)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-pulse">
                    <Shield className="w-10 h-10 text-[var(--color-plasma)]" />
                  </div>
                  <h3 className="text-white font-bold uppercase tracking-widest mb-2">
                    Bind Your Soul
                  </h3>
                  <p className="text-[var(--color-steel)]/60 text-xs font-sans max-w-xs mx-auto">
                    Create a permanent link to the Hall of Records to enable
                    cross-device progression.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-[var(--color-warp)] font-bold">
                    Identify Yourself
                  </label>
                  <input
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    placeholder="ENTER ALIAS..."
                    className="w-full bg-[var(--color-armor)] border border-[var(--color-steel)] p-4 text-center text-xl font-bold text-white focus:border-[var(--color-plasma)] outline-none rounded shadow-inner"
                  />
                </div>
                <button
                  onClick={handleBind}
                  disabled={!inputName}
                  className="w-full py-4 bg-[var(--color-warp)]/30 border border-[var(--color-warp)] text-[var(--color-plasma)] hover:bg-[var(--color-warp)]/40 font-bold uppercase tracking-widest rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Engrave Name
                </button>
              </div>
          )}

              {/* STEP 2: DASHBOARD (Sync) */}
              {step === "IDLE" && (
                <div className="space-y-6 animate-slide-up">
                  <div className="text-center space-y-2">
                    <div className="w-20 h-20 mx-auto bg-[var(--color-warp)]/10 rounded-full flex items-center justify-center border border-[var(--color-warp)] shadow-[0_0_20px_rgba(163,53,238,0.2)]">
                      <User className="w-10 h-10 text-[var(--color-warp)]" />
                    </div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                      {userName}
                    </h3>
                    <p className="text-xs text-[var(--color-steel)] uppercase tracking-widest">
                      Soul Bound
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase text-[var(--color-steel)] border-b border-[var(--color-steel)]/50 pb-1">
                      Pending Upload
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-[var(--color-steel)] font-mono">
                      <div>
                        XP Level:{" "}
                        <span className="text-white">
                          {finalPayload?.level || 0}
                        </span>
                      </div>
                      <div>
                        Achievements:{" "}
                        <span className="text-white">
                          {finalPayload?.achievements.length || 0}
                        </span>
                      </div>
                      <div>
                        Talents:{" "}
                        <span className="text-white">
                          {finalPayload?.skills.length || 0}
                        </span>
                      </div>
                      <div>
                        Logs:{" "}
                        <span className="text-white">
                          {finalPayload?.historyCount || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSync}
                    className="w-full py-6 bg-gradient-to-r from-[var(--color-warp)]/50 to-[var(--color-void)]/50 border border-[var(--color-warp)]/50 hover:border-[var(--color-plasma)] text-[var(--color-plasma)] font-black uppercase tracking-[0.15em] rounded transition-all shadow-[0_0_30px_rgba(163,53,238,0.1)] hover:shadow-[0_0_30px_rgba(163,53,238,0.3)] flex flex-col items-center justify-center gap-1 group"
                  >
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      <span>Sync Cloud Data</span>
                    </div>
                    <span className="text-[10px] font-normal opacity-70 tracking-normal">
                      Push Local Progress to Valhalla
                    </span>
                  </button>
                </div>
              )}

              {/* STEP 3: TERMINAL LOGS (Syncing/Success) */}
              {(step === "SYNCING" || step === "SUCCESS") && (
                <div className="h-64 bg-black border border-[var(--color-warp)]/50 p-4 rounded font-mono text-xs overflow-y-auto space-y-2 shadow-inner">
                  {logs.map((log, i) => (
                    <div key={i} className="text-[var(--color-plasma)]">
                      <span className="opacity-50 mr-2">[{log.time}]</span>
                      {log.msg}
                    </div>
                  ))}
                  {step === "SYNCING" && (
                    <div className="animate-pulse text-[var(--color-warp)]">_</div>
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
