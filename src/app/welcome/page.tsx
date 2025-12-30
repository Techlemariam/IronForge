"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Swords,
  Activity,
  Zap,
  Shield,
  Crown,
} from "lucide-react";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-forge-950 text-white overflow-x-hidden selection:bg-warrior selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-forge-950/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warrior rounded flex items-center justify-center overflow-hidden border border-warrior/50 shadow-[0_0_15px_rgba(255,215,0,0.2)]">
              <Image
                src="/logo-rpg.png"
                alt="IronForge Logo"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <span className="font-serif text-xl tracking-widest uppercase font-bold text-shadow-glow">
              IronForge RPG
            </span>
          </div>
          <div>
            <Link
              href="/login"
              className="text-sm font-mono uppercase tracking-widest text-forge-muted hover:text-white transition-colors mr-6"
            >
              Log In
            </Link>
            <Link
              href="/login"
              className="bg-white text-black px-5 py-2 rounded font-bold text-sm uppercase tracking-wide hover:bg-warrior hover:scale-105 transition-all"
            >
              Join the Faction
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-warrior/5 rounded-full blur-[120px]" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-widest text-warrior mb-6">
              <Zap className="w-3 h-3" /> System Operational v1.3
            </div>
            <h1 className="text-5xl lg:text-7xl font-black mb-6 tracking-tight leading-tight">
              Forge Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-warrior to-orange-500">
                Legacy
              </span>
              <br />
              Not Just A Body.
            </h1>
            <p className="text-xl text-forge-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              The first AI-augmented training platform that treats your fitness
              journey like a grand strategy RPG. Train, battle, and ascend.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-warrior text-black font-bold rounded text-lg flex items-center justify-center gap-2 hover:bg-warrior-light hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] transition-all"
              >
                Begin Your Saga <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded text-lg hover:bg-white/10 transition-all"
              >
                View Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-24 bg-black/20 relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-forge-900/50 border border-white/5 p-8 rounded-2xl hover:border-warrior/30 transition-colors group"
            >
              <div className="w-12 h-12 bg-purple-900/20 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                The Oracle AI
              </h3>
              <p className="text-forge-muted leading-relaxed">
                An adaptive intelligence that analyzes your HRV, sleep, and
                performance to generate the perfect daily workout.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-forge-900/50 border border-white/5 p-8 rounded-2xl hover:border-warrior/30 transition-colors group"
            >
              <div className="w-12 h-12 bg-red-900/20 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Swords className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                PvP & Boss Battles
              </h3>
              <p className="text-forge-muted leading-relaxed">
                Join a faction. Battle raid bosses with your squad. Your
                physical effort deals real damage in the digital realm.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-forge-900/50 border border-white/5 p-8 rounded-2xl hover:border-warrior/30 transition-colors group"
            >
              <div className="w-12 h-12 bg-emerald-900/20 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Neural Lattice
              </h3>
              <p className="text-forge-muted leading-relaxed">
                A visualized skill tree of your physical capabilities. Unlock
                perks and abilities as you master different domains.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-24 border-y border-white/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-16">The Legion is Growing</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-black text-white mb-2">1,204</div>
              <div className="text-xs uppercase tracking-widest text-forge-muted">
                Active Titans
              </div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">84k</div>
              <div className="text-xs uppercase tracking-widest text-forge-muted">
                Kgs Lifted
              </div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">14</div>
              <div className="text-xs uppercase tracking-widest text-forge-muted">
                Bosses Slain
              </div>
            </div>
            <div>
              <div className="text-4xl font-black text-white mb-2">99%</div>
              <div className="text-xs uppercase tracking-widest text-forge-muted">
                Uptime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-forge-muted text-sm">
        <p>&copy; {new Date().getFullYear()} IronForge RPG. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4">
          <Link href="#" className="hover:text-white transition-colors">
            Privacy Protocol
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
