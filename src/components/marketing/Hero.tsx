"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
    return (
        <section className="relative h-screen flex items-center justify-center pt-20 overflow-hidden">
            {/* Background Layers */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0 opacity-40 mix-blend-overlay"
                style={{ backgroundImage: "url('/images/hero-bg.png')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-void via-transparent to-void z-10" />

            {/* Content */}
            <div className="container mx-auto px-6 relative z-20 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
                        <span className="w-2 h-2 rounded-full bg-magma animate-pulse" />
                        <span className="text-xs uppercase tracking-widest font-bold text-slate-300">Phase 3: The Living Titan is Here</span>
                    </div>

                    <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 italic uppercase drop-shadow-2xl">
                        IronForge <span className="text-magma not-italic italic-none font-light">RPG</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                        The AI-augmented strength training RPG. Integrate your workouts,
                        battle mythical bosses, and forge a legend that evolves with your real-world effort.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <Link
                            href="/login"
                            className="group relative px-10 py-5 bg-magma rounded-xl font-bold text-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,68,0,0.3)] hover:shadow-[0_0_60px_rgba(255,68,0,0.5)]"
                        >
                            <span className="relative z-10 flex items-center gap-2 text-white">
                                JOIN THE FACTION <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>

                        <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-xl font-bold text-xl text-white hover:bg-white/10 transition-all backdrop-blur-xl hover:scale-105 active:scale-95">
                            WATCH TRAILER
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Fade */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-void to-transparent z-20" />
        </section>
    );
};
