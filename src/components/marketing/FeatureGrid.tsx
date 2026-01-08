"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Activity, Trophy, Users, Shield, Zap } from "lucide-react";

export const FeatureGrid = () => {
    return (
        <section className="py-32 relative bg-void">
            <div className="container mx-auto px-6">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-6xl font-black mb-6 italic uppercase tracking-tighter text-white">
                        A New Era of <span className="text-magma">Performance</span>
                    </h2>
                    <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                        We&apos;ve bridged the gap between your fitness data and high-stakes RPG mechanics.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Brain className="w-8 h-8 text-magma" />}
                        title="The Oracle AI"
                        description="Proprietary engine that analyzes HRV, sleep debt, and training volume to decree your perfect daily workout."
                    />
                    <FeatureCard
                        icon={<Activity className="w-8 h-8 text-blue-500" />}
                        title="V-Sync Bio-Feedback"
                        description="Connect Garmin, Apple Health, or Strava. Your real-world recovery fuels your titan's combat readiness."
                    />
                    <FeatureCard
                        icon={<Trophy className="w-8 h-8 text-warrior" />}
                        title="Titan Battle Pass"
                        description="Level up through seasonal tiers by hitting PRs. Unlock exclusive armor, weapon skins, and titles."
                    />
                    <FeatureCard
                        icon={<Users className="w-8 h-8 text-green-500" />}
                        title="Squad Raids"
                        description="Form a guild with friends. Combine your weekly volume to take down world bosses in synchronous territory conquest."
                    />
                    <FeatureCard
                        icon={<Shield className="w-8 h-8 text-indigo-500" />}
                        title="TV Mode HUD"
                        description="Cast your session to a big screen for a cinematic workout experience with real-time heart rate and mission tracking."
                    />
                    <FeatureCard
                        icon={<Zap className="w-8 h-8 text-magma" />}
                        title="Power Rating"
                        description="A single 0-1000 score representing your total athletic capability. Optimized via the 2045 Living Titan manifesto."
                    />
                </div>
            </div>
        </section>
    );
};

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="p-10 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-lg hover:bg-white/10 transition-all group"
        >
            <div className="mb-6 transform group-hover:scale-110 transition-transform origin-left bg-white/5 p-4 rounded-2xl w-fit border border-white/5">
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-tight">{title}</h3>
            <p className="text-slate-400 leading-relaxed font-light">{description}</p>
        </motion.div>
    );
}
