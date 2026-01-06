"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, Dumbbell, Swords, ArrowRight } from "lucide-react";

const steps = [
    {
        icon: Dumbbell,
        title: "Train in Real Life",
        description: "Log internally or sync from Hevy, Strava, & Garmin. Every rep, step, and calorie is tracked automatically.",
        color: "from-blue-500 to-cyan-500",
        delay: 0.2
    },
    {
        icon: Activity,
        title: "Power Up Your Titan",
        description: "Your physical effort converts to XP. Strength gains boost your damage; cardio fuels your stamina.",
        color: "from-magma to-orange-500",
        delay: 0.4
    },
    {
        icon: Swords,
        title: "Conquer the Arena",
        description: "Battle bosses, duel friends, and climb the Iron Leagues. Your real-world fitness is your only cheat code.",
        color: "from-purple-500 to-pink-500",
        delay: 0.6
    }
];

export const HowItWorks = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-magma/10 rounded-full blur-[128px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black italic uppercase mb-4"
                    >
                        From <span className="text-transparent bg-clip-text bg-gradient-to-r from-magma to-orange-400">Sweat</span> to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Glory</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg max-w-2xl mx-auto"
                    >
                        The Loop is simple. You do the work, we give you the power.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: step.delay }}
                            className="relative group"
                        >
                            <div className="flex flex-col items-center text-center">
                                {/* Icon Circle */}
                                <div className="relative mb-6">
                                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`} />
                                    <div className="relative w-24 h-24 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <step.icon className="w-10 h-10 text-white" />
                                    </div>
                                    {/* Step Number Badge */}
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-void border border-white/10 flex items-center justify-center font-bold text-slate-400 text-sm">
                                        {index + 1}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold mb-3 group-hover:text-white transition-colors">{step.title}</h3>
                                <p className="text-slate-400 leading-relaxed max-w-xs mx-auto">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
