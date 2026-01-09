"use client";

import React from "react";
import { Star } from "lucide-react";

export const Testimonials = () => {
    const testimonials = [
        {
            name: "Alex K.",
            role: "Powerlifter",
            quote: "IronForge gamified my prep. I hit a 10kg PR on deadlift just to unlock the Obsidian Armor.",
            rating: 5,
        },
        {
            name: "Sarah J.",
            role: "Hybrid Athlete",
            quote: "The Oracle's advice is scary good. It predicted my fatigue wall two days before I hit it.",
            rating: 5,
        },
        {
            name: "Marcus T.",
            role: "CrossFit Coach",
            quote: "Finally, an app that understands that training data IS the game. My clients are addicted.",
            rating: 5,
        },
    ];

    return (
        <section className="py-24 border-y border-white/5 bg-black/20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
                        Forged by <span className="text-magma">Titans</span>
                    </h2>
                    <p className="text-slate-400">Join the vanguard of the fitness revolution.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md hover:border-magma/30 transition-colors">
                            <div className="flex gap-1 mb-4">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 text-magma fill-magma" />
                                ))}
                            </div>
                            <p className="text-slate-300 mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                            <div>
                                <div className="font-bold text-white uppercase tracking-wider">{t.name}</div>
                                <div className="text-xs text-slate-500 font-mono uppercase">{t.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
