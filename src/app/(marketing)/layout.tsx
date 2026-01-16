import Link from "next/link";
import React from "react";
import "../globals.css";


export const metadata = {
    title: "IronForge RPG | Train Like a Titan",
    description: "The AI-augmented strength training RPG.",
};

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-void min-h-screen text-white font-sans selection:bg-magma selection:text-white">
            {/* Header / Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-void/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black italic tracking-tighter hover:text-magma transition-colors">
                        IRONFORGE
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-400">
                        <Link href="#features" className="hover:text-white transition-colors">Features</Link>
                        <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
                        <Link href="/login" className="hover:text-white transition-colors">Login</Link>
                        <Link
                            href="/login"
                            className="px-6 py-2 bg-white text-void rounded-lg hover:bg-magma hover:text-white transition-all"
                        >
                            Start Quest
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                {/* Offset for fixed header */}
                {children}
            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-black/40">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-2xl font-black italic tracking-tighter">IRONFORGE</div>
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
