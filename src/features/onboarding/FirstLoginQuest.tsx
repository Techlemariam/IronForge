"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Map, Shield, ChevronRight } from "lucide-react";
import { completeOnboardingAction } from "@/actions/user/onboarding";

interface FirstLoginQuestProps {
  onComplete: (newState: any) => void;
}

export const FirstLoginQuest: React.FC<FirstLoginQuestProps> = ({
  onComplete,
}) => {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    {
      title: "Awaken, Titan",
      text: "The IronForge has chosen you. You stand at the precipice of greatness. Your journey to forge a body of steel and a will of iron begins now.",
      icon: <Sparkles className="w-12 h-12 text-yellow-400" />,
    },
    {
      title: "The Citadel",
      text: "This is your command center. From here you will access the Training Grounds to build strength, explore the Wilds to fight monsters, and visit the Iron City to upgrade your gear.",
      icon: <Map className="w-12 h-12 text-blue-400" />,
    },
    {
      title: "Your Oath",
      text: "I swear to push my limits.\nI swear to log my battles.\nI swear to never give up.",
      icon: <Shield className="w-12 h-12 text-red-400" />,
      action: true,
    },
  ];

  const currentStep = steps[step];

  const handleNext = async () => {
    if (currentStep.action) {
      setIsLoading(true);
      try {
        const res = await completeOnboardingAction();
        if (res.success) {
          onComplete(res.newState);
        } else {
          alert("The Oath failed to register. Try again.");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    } else {
      setStep((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-md w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-8 shadow-[0_0_50px_rgba(234,179,8,0.2)] text-white relative overflow-hidden"
      >
        {/* Background FX */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="p-4 bg-zinc-800 rounded-full border border-zinc-600 shadow-xl">
            {currentStep.icon}
          </div>

          <h2 className="text-3xl font-bold font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500">
            {currentStep.title}
          </h2>

          <p className="text-lg text-zinc-300 leading-relaxed min-h-[100px] whitespace-pre-line">
            {currentStep.text}
          </p>

          <button
            onClick={handleNext}
            disabled={isLoading}
            className="group relative px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-700 rounded-lg font-bold uppercase tracking-widest shadow-lg hover:shadow-orange-500/20 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center space-x-2">
              <span>
                {currentStep.action
                  ? isLoading
                    ? "Forging Oath..."
                    : "I Swear It"
                  : "Continue"}
              </span>
              {!currentStep.action && (
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </span>
          </button>

          <div className="flex space-x-2 mt-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i === step ? "bg-yellow-500" : "bg-zinc-700"}`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
