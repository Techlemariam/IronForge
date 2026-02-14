"use client";

import React from "react";
import { motion } from "framer-motion";
import { ModelQuota } from "@/services/game/FactoryService";

interface QuotaGaugesProps {
    quotas: ModelQuota[];
}

export const QuotaGauges: React.FC<QuotaGaugesProps> = ({ quotas }) => {
    return (
        <div className="grid grid-cols-3 gap-8">
            {quotas.map((quota, i) => (
                <div key={quota.model} className="flex flex-col items-center space-y-3">
                    <div className="relative w-24 h-24">
                        {/* Background Circle */}
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="44"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-slate-800"
                            />
                            {/* Progress Circle */}
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="44"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeDasharray={2 * Math.PI * 44}
                                initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - quota.progress / 100) }}
                                transition={{ duration: 1.5, delay: i * 0.2, ease: "easeOut" }}
                                fill="transparent"
                                strokeLinecap="round"
                                className={quota.progress > 85 ? "text-red-500" : quota.progress > 60 ? "text-amber-500" : "text-cyan-400"}
                            />
                        </svg>

                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0">
                            <span className="text-xl font-black text-white leading-none">
                                {quota.progress}<span className="text-[10px] font-bold text-slate-500">%</span>
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                                {quota.hoursLeft}h
                            </span>
                        </div>

                        {/* Inner Glow */}
                        <div className={`absolute inset-4 rounded-full blur-xl opacity-20 pointer-events-none ${quota.progress > 85 ? "bg-red-500" : "bg-cyan-400"
                            }`} />
                    </div>

                    <div className="text-center space-y-0.5">
                        <span className="text-[11px] font-bold text-slate-200 block uppercase tracking-wide">
                            {quota.model}
                        </span>
                        <span className="text-[9px] text-slate-500 font-medium">
                            {quota.used.toLocaleString()} / {quota.limit.toLocaleString()}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};
