"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const NeonNoirLogin: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // TODO: Implement authentication logic
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-void overflow-hidden">
            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-grid-titan opacity-20" />

            {/* Radial Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-void/50 to-void" />

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                {/* Glassmorphic Container */}
                <div className="glass-panel rounded-2xl p-8 shadow-[0_0_60px_rgba(6,182,212,0.15)]">
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan to-transparent opacity-60" />

                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 bg-cyan blur-xl opacity-30 animate-pulse-mech" />
                            <Zap className="relative w-12 h-12 text-cyan" />
                        </div>

                        <h1 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan via-pulse to-plasma">
                            IronForge Access
                        </h1>
                        <p className="text-sm text-muted-foreground mt-2">
                            Initialize Neural Link
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Input */}
                        <div className="relative group">
                            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                                Operator ID
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel transition-colors group-focus-within:text-cyan" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="titan@ironforge.io"
                                    className="pl-10 bg-armor/50 border-steel focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="relative group">
                            <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                                Access Code
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-steel transition-colors group-focus-within:text-plasma" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-10 bg-armor/50 border-steel focus:border-plasma focus:ring-2 focus:ring-plasma/20 transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-gradient-to-r from-plasma to-legend hover:shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all duration-300 font-bold uppercase tracking-widest disabled:opacity-50"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Authenticating...</span>
                                </span>
                            ) : (
                                "Initialize Link"
                            )}
                        </Button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                        <button className="hover:text-cyan transition-colors">
                            Forgot password?
                        </button>
                        <button className="hover:text-pulse transition-colors">
                            Request Access
                        </button>
                    </div>

                    {/* Social Login Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-steel/50" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-armor px-2 text-muted-foreground">
                                Or connect via
                            </span>
                        </div>
                    </div>

                    {/* Social Login Icons */}
                    <div className="flex justify-center space-x-4">
                        {["Google", "GitHub", "Discord"].map((provider) => (
                            <button
                                key={provider}
                                className="w-10 h-10 rounded-lg bg-armor/50 border border-steel hover:border-cyan hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center group"
                            >
                                <span className="text-xs font-mono text-steel group-hover:text-cyan transition-colors">
                                    {provider[0]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bottom Glow Effect */}
                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan/10 blur-3xl rounded-full pointer-events-none" />
            </motion.div>
        </div>
    );
};
