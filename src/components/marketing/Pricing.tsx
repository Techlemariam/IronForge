"use client";

import React from "react";
import Link from "next/link";
import { Check } from "lucide-react";

export const Pricing = () => {
    return (
        <section className="py-32 relative overflow-hidden bg-void">
            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-6xl font-black mb-6 italic uppercase tracking-tighter text-white">
                        Choose Your <span className="text-magma">Path</span>
                    </h2>
                    <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                        Begin as a Recruit or ascend immediately to Titan status.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Tier */}
                    <div className="p-10 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-lg flex flex-col">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-slate-400 uppercase tracking-widest mb-2">Recruit</h3>
                            <div className="text-5xl font-black text-white">$0</div>
                            <p className="text-slate-500 mt-2">Forever free. No ads.</p>
                        </div>
                        <ul className="space-y-4 mb-10 flex-1">
                            {["Basic Workout Logging", "3 Titan Avatars", "Manual Progression", "Community Discord"].map((feature) => (
                                <li key={feature} className="flex items-center gap-3 text-slate-300">
                                    <Check className="w-5 h-5 text-slate-500" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/login"
                            className="w-full py-4 bg-white/10 border border-white/10 rounded-xl font-bold text-center text-white hover:bg-white/20 transition-all uppercase tracking-widest"
                        >
                            Start Journey
                        </Link>
                    </div>

                    {/* Premium Tier */}
                    <div className="p-10 bg-magma/10 border border-magma/50 rounded-3xl backdrop-blur-lg relative flex flex-col transform md:-translate-y-4 shadow-[0_0_50px_rgba(255,68,0,0.15)]">
                        <div className="absolute top-0 right-0 bg-magma text-white text-xs font-bold px-4 py-2 rounded-bl-2xl rounded-tr-2xl uppercase tracking-widest">
                            Most Popular
                        </div>
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-magma uppercase tracking-widest mb-2">Titan</h3>
                            <div className="text-5xl font-black text-white">$9<span className="text-2xl text-slate-500">/mo</span></div>
                            <p className="text-magma/80 mt-2">7-day free trial.</p>
                        </div>
                        <ul className="space-y-4 mb-10 flex-1">
                            {[
                                "Oracle AI Coach",
                                "Unlimited Bio-Sync",
                                "Full Battle Pass Access",
                                "Ranked PvP Arena",
                                "Advanced Analytics (TTB/TSB)",
                                "TV Mode HUD"
                            ].map((feature) => (
                                <li key={feature} className="flex items-center gap-3 text-white">
                                    <Check className="w-5 h-5 text-magma" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/login?plan=titan"
                            className="w-full py-4 bg-magma rounded-xl font-bold text-center text-white hover:bg-orange-600 transition-all uppercase tracking-widest shadow-lg shadow-magma/30"
                        >
                            Ascend Now
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};
