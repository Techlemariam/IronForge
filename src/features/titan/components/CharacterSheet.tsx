import React, { useState, useEffect, useMemo } from "react";
import { ACHIEVEMENTS, SESSIONS } from "../../../data/static";
import {
  AchievementCategory,
  TitanAttributes,
  ExerciseLog,
  MeditationLog,
} from "../../../types";
import {
  X,
  Shield,
  Swords,
  Zap,
  Activity,
  Brain,
  User,
  TrendingUp,
  Heart,
  Crown,
  ChevronDown,
  Anchor,
  Target,
  Scale,
  Zap as ZapIcon,
  Calendar,
  Skull,
  ScrollText,
  History,
} from "lucide-react";
import { TitanXPBar } from "@/features/titan/components/TitanXPBar";
import { calculateTitanRank, calculateTitanAttributes } from "../../../utils";
import { useSkills } from "../../../context/SkillContext";
import { StorageService } from "../../../services/storage";
import { IntervalsWellness } from "../../../types";
import AttributeRadar from "@/features/titan/components/AttributeRadar";

interface CharacterSheetProps {
  unlockedIds: Set<string>;
  onClose: () => void;
  meditationLogs?: MeditationLog[];
}

type TabType = "attributes" | "contract" | "history";

const CharacterSheet: React.FC<CharacterSheetProps> = ({
  unlockedIds,
  onClose,
  meditationLogs = [],
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("attributes");
  const [wellness, setWellness] = useState<IntervalsWellness | null>(null);
  const [historyLogs, setHistoryLogs] = useState<ExerciseLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const { purchasedSkillIds } = useSkills();

  // --- DATA CALCS ---
  const { currentRank, level, talentPoints, kineticShards, isElite } =
    calculateTitanRank(unlockedIds);

  const attributes = calculateTitanAttributes(
    unlockedIds,
    wellness,
    purchasedSkillIds,
    meditationLogs,
  );

  const totalXP = talentPoints * 10 + (kineticShards / 10) * 2;
  const currentXP = totalXP % 100;
  const maxXP = 100;

  // --- LOAD HISTORY ON TAB CHANGE ---
  useEffect(() => {
    if (activeTab === "history") {
      setIsLoadingHistory(true);
      StorageService.getHistory()
        .then((logs: ExerciseLog[]) => setHistoryLogs(logs))
        .finally(() => setIsLoadingHistory(false));
    }
  }, [activeTab]);

  // --- GROUP HISTORY BY DATE ---
  const groupedHistory = useMemo(() => {
    const groups: Record<string, ExerciseLog[]> = {};
    historyLogs.forEach((log) => {
      const dateKey = log.date.split("T")[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    // Sort dates descending
    return Object.entries(groups).sort(
      (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
    );
  }, [historyLogs]);

  const getExerciseName = (id: string) => {
    // Simple lookup, could be optimized with a map
    for (const s of SESSIONS) {
      for (const b of s.blocks) {
        const ex = b.exercises?.find((e: any) => e.id === id);
        if (ex) return ex.name;
      }
    }
    // Fallback for warmup exercises or unknown IDs
    return id.replace("ex_", "").replace(/_/g, " ");
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // --- WOW THEME CONSTANTS ---
  const WOW_GOLD = "text-[#FFD100]";
  const WOW_GREEN = "text-[#1eff00]";
  const WOW_GREY = "text-[#9d9d9d]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-serif">
      {/* MAIN FRAME - The "C" Menu */}
      <div className="relative w-full max-w-4xl bg-[#0f0f11] border-[3px] border-[#444] rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* TEXTURE OVERLAY */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-50 pointer-events-none"></div>

        {/* --- HEADER --- */}
        <div className="relative h-12 bg-gradient-to-b from-[#2a2a2a] to-[#111] border-b border-[#555] flex items-center justify-between px-4 shrink-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FFD100] to-[#b8860b] border border-white/20 flex items-center justify-center shadow-inner">
              <User className="w-4 h-4 text-black" />
            </div>
            <span
              className={`font-bold tracking-wide ${WOW_GOLD} text-shadow-sm`}
            >
              Character Info
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white hover:bg-red-900/50 rounded p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- CONTENT BODY --- */}
        <div className="relative flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* LEFT PANEL: PAPER DOLL (Gear Slots & Avatar) */}
          <div className="w-full md:w-[45%] bg-[#050505] relative flex flex-col border-r border-[#333]">
            {/* Top Info */}
            <div className="p-4 text-center z-10 bg-gradient-to-b from-[#1a1a1a] to-transparent">
              <h1 className="text-2xl font-bold text-white tracking-wide drop-shadow-md">
                Athlete Name
              </h1>
              <div className="text-sm font-sans font-bold text-white flex justify-center gap-2 items-center">
                <span className={WOW_GOLD}>Level {level}</span>
                <span className={WOW_GREY}>|</span>
                <span className={isElite ? "text-[#a335ee]" : "text-[#0070dd]"}>
                  {currentRank.name}
                </span>
                <span className={WOW_GREY}>|</span>
                <span className="text-zinc-400">IronForge Guild</span>
              </div>
            </div>

            {/* The Avatar Model & Gear Slots */}
            <div className="flex-1 relative flex justify-between px-4 py-2">
              {/* Left Slots */}
              <div className="flex flex-col gap-2 pt-4">
                <GearSlot
                  icon={<Brain className="w-5 h-5" />}
                  rarity="epic"
                  label="Head"
                />
                <GearSlot
                  icon={<Shield className="w-5 h-5" />}
                  rarity="rare"
                  label="Neck"
                />
                <GearSlot
                  icon={<Zap className="w-5 h-5" />}
                  rarity={attributes.strength > 15 ? "epic" : "uncommon"}
                  label="Shoulders"
                />
                <GearSlot
                  icon={<Heart className="w-5 h-5" />}
                  rarity="rare"
                  label="Chest"
                />
                <GearSlot
                  icon={<User className="w-5 h-5" />}
                  rarity="common"
                  label="Shirt"
                />
                <GearSlot
                  icon={<Activity className="w-5 h-5" />}
                  rarity="uncommon"
                  label="Tabard"
                />
              </div>

              {/* Center Model (Placeholder) */}
              <div className="flex-1 flex items-center justify-center relative">
                {/* Background Glow behind character */}
                <div className="absolute w-48 h-48 bg-blue-500/10 rounded-full blur-[50px]"></div>

                <div className="relative w-40 h-64 bg-zinc-900/50 border border-zinc-700/50 rounded-lg flex flex-col items-center justify-center group overflow-hidden">
                  {/* Render a 3D-ish looking silhouette or the user icon */}
                  <User
                    className={`w-24 h-24 ${isElite ? "text-[#FFD100]" : "text-zinc-500"} drop-shadow-2xl`}
                  />
                  <div className="absolute bottom-2 text-[10px] text-zinc-500 font-sans uppercase tracking-widest group-hover:text-white transition-colors">
                    Model Viewer
                  </div>
                </div>
              </div>

              {/* Right Slots */}
              <div className="flex flex-col gap-2 pt-4">
                <GearSlot
                  icon={<Swords className="w-5 h-5" />}
                  rarity="rare"
                  label="Hands"
                />
                <GearSlot
                  icon={<TrendingUp className="w-5 h-5" />}
                  rarity="epic"
                  label="Waist"
                />
                <GearSlot
                  icon={<Activity className="w-5 h-5" />}
                  rarity={attributes.endurance > 15 ? "epic" : "rare"}
                  label="Legs"
                />
                <GearSlot
                  icon={<Zap className="w-5 h-5" />}
                  rarity="uncommon"
                  label="Feet"
                />
                <GearSlot
                  icon={<Zap className="w-5 h-5" />}
                  rarity="rare"
                  label="Ring 1"
                />
                <GearSlot
                  icon={<Zap className="w-5 h-5" />}
                  rarity="epic"
                  label="Trinket"
                />
              </div>
            </div>

            {/* Bottom Bar (Reputation / XP) */}
            <div className="p-4 bg-[#111] border-t border-[#333] z-10">
              <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-400 mb-1">
                <span>Experience</span>
                <span>
                  {Math.floor(currentXP)} / {maxXP}
                </span>
              </div>
              <TitanXPBar
                currentXP={currentXP}
                maxXP={maxXP}
                level={level}
                isElite={isElite}
              />
            </div>
          </div>

          {/* RIGHT PANEL: TABS CONTENT */}
          <div className="w-full md:w-[55%] bg-[#151515] p-0 overflow-y-auto custom-scrollbar relative flex flex-col">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>

            {/* TAB: ATTRIBUTES */}
            {activeTab === "attributes" && (
              <>
                {/* RADAR CHART HERO */}
                <div className="p-6 bg-[#0a0a0a] border-b border-[#333] relative">
                  <AttributeRadar attributes={attributes} />
                </div>

                <div className="flex-1 p-6 space-y-6">
                  {/* MENTAL (PHASE 1 FOCUS) */}
                  <div>
                    <h4 className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-blue-900/30 pb-1">
                      <Brain className="w-3 h-3" /> Mental & Sustainability
                    </h4>
                    <div className="space-y-1">
                      <StatRow
                        label="Consistency"
                        value={attributes.mental}
                        color={
                          attributes.mental > 10 ? WOW_GREEN : "text-white"
                        }
                        subtext="Streak + Meditation"
                      />
                      <StatRow
                        label="Recovery"
                        value={attributes.recovery}
                        color={
                          attributes.recovery > 12 ? WOW_GREEN : "text-white"
                        }
                        subtext="Sleep > 70 required"
                      />
                      <StatRow
                        label="Resilience (CTL)"
                        value={Math.max(
                          3,
                          Math.floor(attributes.endurance * 0.8),
                        )}
                        color="text-zinc-400"
                        subtext="Ramp Rate: +4"
                      />
                      <StatRow
                        label="Focus"
                        value={Math.max(5, Math.floor(attributes.mental * 1.2))}
                        color="text-zinc-400"
                      />
                    </div>
                  </div>

                  {/* PHYSICAL */}
                  <div>
                    <h4 className="text-xs text-orange-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-orange-900/30 pb-1">
                      <Activity className="w-3 h-3" /> Physical Capacity
                    </h4>
                    <div className="space-y-1">
                      <StatRow
                        label="Aerobic (VO2)"
                        value={Math.floor(attributes.endurance)}
                      />
                      <StatRow
                        label="Anaerobic (W')"
                        value={Math.max(
                          4,
                          Math.floor(attributes.strength * 0.6),
                        )}
                      />
                      <StatRow
                        label="Max Strength"
                        value={attributes.strength}
                      />
                      <StatRow
                        label="Muscular End."
                        value={attributes.hypertrophy}
                      />
                    </div>
                  </div>

                  {/* TECHNICAL */}
                  <div>
                    <h4 className="text-xs text-green-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-green-900/30 pb-1">
                      <Target className="w-3 h-3" /> Technical & Control
                    </h4>
                    <div className="space-y-1">
                      <StatRow label="Stability" value={attributes.technique} />
                      <StatRow
                        label="Form (RIR)"
                        value={Math.min(20, attributes.technique + 2)}
                      />
                      <StatRow
                        label="Balance"
                        value={Math.max(
                          5,
                          Math.floor(attributes.technique * 0.8),
                        )}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB: HISTORY */}
            {activeTab === "history" && (
              <div className="flex-1 p-6 space-y-4">
                <h2 className="text-xl font-black text-zinc-500 uppercase tracking-tighter mb-6 flex items-center gap-3">
                  <History className="w-6 h-6" />
                  Quest Archive
                </h2>

                {isLoadingHistory ? (
                  <div className="text-center p-10 text-zinc-500 font-mono animate-pulse">
                    Reading Scrolls...
                  </div>
                ) : groupedHistory.length === 0 ? (
                  <div className="text-center p-10 border-2 border-dashed border-zinc-800 rounded-lg">
                    <ScrollText className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 font-serif">
                      No quests recorded yet.
                    </p>
                  </div>
                ) : (
                  groupedHistory.map(([date, logs]) => (
                    <div
                      key={date}
                      className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden group hover:border-zinc-700 transition-colors"
                    >
                      <div className="bg-[#1a1a1a] px-4 py-2 border-b border-zinc-800 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          <span className="text-xs font-bold font-sans text-zinc-300">
                            {formatDate(date)}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-600 uppercase">
                          Complete
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        {logs.map((log, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-sm border-b border-zinc-800/50 pb-2 last:border-0 last:pb-0"
                          >
                            <span
                              className={`font-serif capitalize ${log.isEpic ? "text-rarity-epic font-bold" : "text-zinc-400"}`}
                            >
                              {getExerciseName(log.exerciseId)}
                            </span>
                            <div className="flex items-center gap-3">
                              {log.isEpic && (
                                <Skull className="w-3 h-3 text-rarity-epic animate-pulse" />
                              )}
                              <span className="font-mono font-bold text-zinc-200">
                                {log.e1rm}kg{" "}
                                <span className="text-[9px] text-zinc-600 font-normal">
                                  e1RM
                                </span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: CONTRACT */}
            {activeTab === "contract" && (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                <ScrollText className="w-16 h-16 text-zinc-700 mb-4" />
                <h3 className="text-lg font-bold text-zinc-500 uppercase tracking-widest">
                  No Active Contracts
                </h3>
                <p className="text-sm text-zinc-600 font-serif mt-2 max-w-xs">
                  Check back later for special weekly challenges and elite
                  bounties.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* --- FOOTER TABS --- */}
        <div className="h-10 bg-[#111] border-t border-[#444] flex items-center justify-center gap-2 px-4 z-10">
          <TabButton
            label="Attributes"
            active={activeTab === "attributes"}
            onClick={() => setActiveTab("attributes")}
          />
          <TabButton
            label="Contract"
            active={activeTab === "contract"}
            onClick={() => setActiveTab("contract")}
          />
          <TabButton
            label="History"
            active={activeTab === "history"}
            onClick={() => setActiveTab("history")}
          />
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const GearSlot: React.FC<{
  icon: React.ReactNode;
  rarity: string;
  label: string;
}> = ({ icon, rarity, label }) => {
  const getBorderColor = () => {
    switch (rarity) {
      case "epic":
        return "border-[#a335ee]";
      case "rare":
        return "border-[#0070dd]";
      case "uncommon":
        return "border-[#1eff00]";
      default:
        return "border-[#9d9d9d]";
    }
  };

  return (
    <div className="group relative w-10 h-10 bg-[#1a1a1a] border border-zinc-700 rounded-sm flex items-center justify-center cursor-pointer hover:brightness-125 transition-all">
      <div
        className={`absolute inset-0 border-2 opacity-50 ${getBorderColor()}`}
      ></div>
      <div className="text-zinc-500 group-hover:text-white transition-colors">
        {icon}
      </div>

      {/* Tooltip */}
      <div className="absolute left-12 top-0 hidden group-hover:block z-50 w-48 bg-[#050505] border border-zinc-600 rounded p-2 pointer-events-none shadow-xl">
        <div
          className={`font-bold text-sm ${rarity === "epic"
            ? "text-[#a335ee]"
            : rarity === "rare"
              ? "text-[#0070dd]"
              : rarity === "uncommon"
                ? "text-[#1eff00]"
                : "text-white"
            }`}
        >
          {label} Slot
        </div>
        <div className="text-[10px] text-white mt-1">
          Item Level {Math.floor(Math.random() * 100) + 200}
        </div>
        <div className="text-[10px] text-[#ffd700] mt-1">
          &lt;Right Click to Equip&gt;
        </div>
      </div>
    </div>
  );
};

const StatRow: React.FC<{
  label: string;
  value: string | number;
  color?: string;
  tooltip?: string;
  subtext?: string;
}> = ({ label, value, color = "text-white", tooltip, subtext }) => {
  const numericValue = typeof value === "number" ? value : 0;

  // FM Coloring: 16-20 Gold, 11-15 Green, 6-10 White, 1-5 Grey
  let valueColor = "text-zinc-500";
  if (numericValue > 15) valueColor = "text-[#ffd700]";
  else if (numericValue > 10) valueColor = "text-[#1eff00]";
  else if (numericValue > 5) valueColor = "text-white";

  return (
    <div className="flex justify-between items-center text-sm group relative cursor-help border-b border-[#222] py-1 last:border-0 hover:bg-[#1a1a1a] px-2 rounded">
      <div className="flex flex-col">
        <span className="text-zinc-400 group-hover:text-white transition-colors text-xs uppercase font-bold tracking-wider">
          {label}
        </span>
        {subtext && (
          <span className="text-[9px] text-zinc-600 font-sans">{subtext}</span>
        )}
      </div>
      <span
        className={`font-mono font-bold text-sm ${valueColor} bg-[#000] px-2 py-0.5 rounded border border-[#333]`}
      >
        {value}
      </span>
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black/90 border border-white/20 p-2 rounded text-xs text-white z-50 w-48 text-center pointer-events-none shadow-xl">
          {tooltip}
        </div>
      )}
    </div>
  );
};

const TabButton: React.FC<{
  label: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1 rounded-t-lg text-xs font-bold transition-all
            ${active
          ? "bg-[#1a1a1a] text-white border-x border-t border-[#444] -mb-1 pb-2"
          : "bg-[#0f0f11] text-zinc-500 hover:text-zinc-300 hover:bg-[#151515]"
        }
        `}
    >
      {label}
    </button>
  );
};

export default CharacterSheet;
