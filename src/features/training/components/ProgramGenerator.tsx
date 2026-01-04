"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Calendar,
  Save,
  Dumbbell,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  X,
} from "lucide-react";
import { generateProgramAction, saveProgramAction } from "@/actions/training/program";
import { toast } from "sonner";

interface ProgramGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "INTENT" | "CONSTRAINTS" | "GENERATING" | "REVIEW";

export const ProgramGenerator: React.FC<ProgramGeneratorProps> = ({
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState<Step>("INTENT");
  const [intent, setIntent] = useState<string>("Hypertrophy");
  const [days, setDays] = useState<number>(4);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const intents = [
    {
      id: "Hypertrophy",
      label: "Hypertrophy",
      desc: "Focus on muscle growth and volume.",
    },
    {
      id: "Strength",
      label: "Maximum Strength",
      desc: "Low reps, high intensity, major lifts.",
    },
    {
      id: "Peak Week",
      label: "Peak Week",
      desc: "Taper volume, maintain intensity.",
    },
    {
      id: "Cardio Base",
      label: "Endurance Base",
      desc: "High volume zone 2 work.",
    },
  ];

  const handleGenerate = async () => {
    setStep("GENERATING");
    setIsGenerating(true);
    try {
      const res = await generateProgramAction({ intent, daysPerWeek: days });
      if (res.success && res.plan) {
        setGeneratedPlan(res.plan);
        setStep("REVIEW");
      } else {
        toast.error("The Oracle failed to divine a plan. Try again.");
        setStep("INTENT");
      }
    } catch (e) {
      console.error(e);
      toast.error("Connection to the Spirit Realm failed.");
      setStep("INTENT");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedPlan) return;
    try {
      await saveProgramAction(generatedPlan);
      toast.success("Program inscribed into your calendar.");
      onClose();
    } catch (e) {
      toast.error("Failed to save program.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                AI Program Architect
              </h2>
              <p className="text-xs text-zinc-500 uppercase tracking-widest">
                Powered by Gemini 2.5 Flash
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {step === "INTENT" && (
              <motion.div
                key="intent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg text-zinc-300 font-medium">
                  What is your primary training objective?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {intents.map((i) => (
                    <button
                      key={i.id}
                      onClick={() => setIntent(i.id)}
                      className={`text-left p-6 rounded-xl border-2 transition-all ${
                        intent === i.id
                          ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                          : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`font-bold ${intent === i.id ? "text-indigo-400" : "text-zinc-200"}`}
                        >
                          {i.label}
                        </span>
                        {intent === i.id && (
                          <CheckCircle className="w-5 h-5 text-indigo-400" />
                        )}
                      </div>
                      <p className="text-sm text-zinc-500">{i.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setStep("CONSTRAINTS")}
                    className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 flex items-center gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === "CONSTRAINTS" && (
              <motion.div
                key="constraints"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-lg text-zinc-300 font-medium mb-4">
                    Training Frequency
                  </h3>
                  <div className="flex items-center gap-4">
                    {[3, 4, 5, 6].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDays(d)}
                        className={`w-16 h-16 rounded-xl font-bold text-xl flex items-center justify-center border-2 transition-all ${
                          days === d
                            ? "border-indigo-500 bg-indigo-500/20 text-indigo-400"
                            : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-600"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                    <span className="text-zinc-500 ml-2">days / week</span>
                  </div>
                </div>

                <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1" />
                  <div>
                    <h4 className="text-yellow-500 font-bold text-sm uppercase">
                      Constraint Check
                    </h4>
                    <p className="text-yellow-200/60 text-xs mt-1">
                      The Oracle will verify your recovery metrics (HRV, Sleep)
                      before generating. If recovery is critical, volume will be
                      automatically reduced.
                    </p>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep("INTENT")}
                    className="text-zinc-500 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleGenerate}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-900/20 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Generate Plan
                  </button>
                </div>
              </motion.div>
            )}

            {step === "GENERATING" && (
              <motion.div
                key="generating"
                className="flex flex-col items-center justify-center py-20 space-y-6 text-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse" />
                  <Brain className="w-24 h-24 text-indigo-500 animate-bounce relative z-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Consulting the Iron Oracle
                  </h3>
                  <p className="text-zinc-400 animate-pulse">
                    Analyzing physiological data...
                  </p>
                </div>
                <div className="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 animate-progress" />
                </div>
              </motion.div>
            )}

            {step === "REVIEW" && generatedPlan && (
              <motion.div
                key="review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col h-full"
              >
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  <div className="bg-indigo-900/20 p-4 rounded-lg mb-6 border border-indigo-500/30">
                    <h3 className="text-indigo-300 font-bold uppercase tracking-wider text-xs mb-1">
                      Oracle Rationale
                    </h3>
                    <p className="text-indigo-100 text-sm leading-relaxed">
                      {generatedPlan.weekRationale ||
                        "Efficiency and adaptation focused."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {generatedPlan.days.map((day: any) => (
                      <div
                        key={day.dayOfWeek}
                        className={`p-4 rounded-lg border flex items-center gap-4 ${
                          day.isRestDay
                            ? "bg-zinc-900/50 border-zinc-800 opacity-60"
                            : "bg-zinc-900 border-zinc-700"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${day.isRestDay ? "bg-zinc-800" : "bg-zinc-800 text-white font-bold"}`}
                        >
                          <span className="text-[10px] uppercase text-zinc-500">
                            {
                              ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                                day.dayOfWeek
                              ]
                            }
                          </span>
                        </div>

                        <div className="flex-1">
                          {day.isRestDay ? (
                            <h4 className="text-zinc-500 font-medium italic">
                              Active Recovery / Rest
                            </h4>
                          ) : (
                            <div>
                              <h4 className="text-white font-bold flex items-center gap-2">
                                {day.session?.name || "Workout"}
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded border ${
                                    day.session?.difficulty === "Mythic"
                                      ? "border-red-500 text-red-500"
                                      : day.session?.difficulty === "Heroic"
                                        ? "border-orange-500 text-orange-500"
                                        : "border-blue-500 text-blue-500"
                                  }`}
                                >
                                  {day.session?.difficulty}
                                </span>
                              </h4>
                              <p className="text-zinc-400 text-xs mt-0.5">
                                {day.focus}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800 flex justify-between mt-4">
                  <button
                    onClick={() => setStep("INTENT")}
                    className="text-zinc-500 hover:text-white"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 shadow-lg shadow-green-900/20 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Save to Calendar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
