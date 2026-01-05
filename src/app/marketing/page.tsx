"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Swords, Zap, Activity, Shield, Trophy, Users, ArrowRight, Brain } from "lucide-react";

export default function MarketingPage() {
    return (
        <div className="bg-void min-h-screen text-white font-sans selection:bg-magma selection:text-white overflow-hidden">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center pt-20">
                <div
                    className="absolute inset-0 bg-cover bg-center z-0 opacity-40 mix-blend-overlay"
                    style={{ backgroundImage: "url('/images/hero-bg.png')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-void via-transparent to-void z-10" />

                <div className="container mx-auto px-6 relative z-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-magma animate-pulse" />
                            <span className="text-xs uppercase tracking-widest font-bold text-slate-300">Phase 3: The Living Titan is Here</span>
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 italic uppercase">
                            IronForge <span className="text-magma not-italic italic-none font-light">RPG</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                            The AI-augmented strength training RPG. Integrate your workouts,
                            battle mythical bosses, and forge a legend that evolves with your real-world effort.
                        </p>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <Link
                                href="/login"
                                className="group relative px-10 py-5 bg-magma rounded-xl font-bold text-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,68,0,0.3)]"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    JOIN THE FACTION <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-xl font-bold text-xl hover:bg-white/10 transition-all backdrop-blur-xl">
                                WATCH THE TRAILER
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Animated Background Decor */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-void to-transparent z-20" />
            </section>

            {/* Stats Section */}
            <section className="py-24 border-y border-white/5 bg-black/20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        {[
                            { label: "Active Titans", value: "24,800+" },
                            { label: "Power Reps", value: "1.2M+" },
                            { label: "Bosses Slain", value: "45K" },
                            { label: "Avg Gainz", value: "+12.4%" },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">{stat.value}</div>
                                <div className="text-sm uppercase tracking-widest text-slate-500 font-bold">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-6xl font-black mb-6 italic uppercase tracking-tighter">
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

            {/* CTA Section */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-magma/10 z-0" />
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <div className="max-w-4xl mx-auto bg-black/40 backdrop-blur-3xl border border-white/10 p-16 rounded-[40px]">
                        <h2 className="text-5xl md:text-7xl font-black mb-8 italic uppercase tracking-tighter text-white">
                            Ready to <span className="text-magma">Ascend</span>?
                        </h2>
                        <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                            IronForge is free to start. Join the thousands of athletes turning their training into an epic odyssey.
                        </p>
                        <Link
                            href="/login"
                            className="inline-block px-12 py-6 bg-white text-void rounded-2xl font-black text-2xl hover:bg-magma hover:text-white transition-all transform hover:-translate-y-1 shadow-2xl"
                        >
                            LEVEL UP NOW
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-2xl font-black italic">IRONFORGE</div>
                    <div className="flex gap-12 text-sm font-bold uppercase tracking-widest text-slate-500">
                        <a href="#" className="hover:text-magma transition-colors">Manifesto</a>
                        <a href="#" className="hover:text-magma transition-colors">Roadmap</a>
                        <a href="#" className="hover:text-magma transition-colors">Discord</a>
                        <a href="#" className="hover:text-magma transition-colors">Privacy</a>
                    </div>
                    <div className="text-slate-600 text-sm italic">© 2026 IronForge Systems Corp.</div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="p-10 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-lg hover:bg-white/10 transition-all group"
        >
            <div className="mb-6 transform group-hover:scale-110 transition-transform origin-left">{icon}</div>
            <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-tight">{title}</h3>
            <p className="text-slate-400 leading-relaxed font-light">{description}</p>
        </motion.div>
    );
}
