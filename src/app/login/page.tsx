'use client'

export const dynamic = 'force-dynamic'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Database, Key, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isPasswordLogin, setIsPasswordLogin] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)

    // Clear message when switching modes
    useEffect(() => {
        setMessage(null)
    }, [isPasswordLogin])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const supabase = createClient()

        try {
            if (isPasswordLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                // Redirect is handled automatically by middleware or client state change
                window.location.href = '/'
            } else {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                })
                if (error) throw error
                setMessage({ type: 'success', text: 'Secure Link dispatched to your email coordinates.' })
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Authentication protocol failed.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-forge-950 flex items-center justify-center p-4 bg-noise">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-forge-900 border border-forge-border p-8 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-warrior to-transparent opacity-50" />

                <div className="flex justify-center mb-6">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-16 h-16 bg-warrior/10 rounded-full flex items-center justify-center border border-warrior/30"
                    >
                        <Database className="w-8 h-8 text-warrior" />
                    </motion.div>
                </div>

                <h1 className="text-3xl font-serif text-center text-white mb-2 tracking-widest uppercase text-shadow-glow">IronForge</h1>
                <p className="text-center text-forge-muted mb-8 font-mono text-sm tracking-tight">Secure Uplink Required</p>

                <form onSubmit={handleLogin} className="space-y-4 relative">
                    <div>
                        <label className="block text-xs font-mono uppercase text-forge-muted mb-1 flex items-center gap-2">
                            <Mail className="w-3 h-3" /> Email Coordinates
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-black/40 border border-forge-border/50 rounded p-3 text-white focus:outline-none focus:border-warrior focus:bg-black/60 transition-all font-mono placeholder:text-gray-700"
                            placeholder="hunter@ironforge.com"
                        />
                    </div>

                    <AnimatePresence mode='wait'>
                        {isPasswordLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <label className="block text-xs font-mono uppercase text-forge-muted mb-1 flex items-center gap-2">
                                    <Key className="w-3 h-3" /> Access Key
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required={isPasswordLogin}
                                    className="w-full bg-black/40 border border-forge-border/50 rounded p-3 text-white focus:outline-none focus:border-warrior focus:bg-black/60 transition-all font-mono placeholder:text-gray-700"
                                    placeholder="••••••••"
                                    autoFocus
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-warrior hover:bg-warrior-light hover:shadow-[0_0_20px_rgba(255,215,0,0.2)] text-black font-bold py-3 rounded uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-wait relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <LoadingSpinner size="sm" color="text-black" />
                                    {isPasswordLogin ? 'Authenticating...' : 'Sending Signal...'}
                                </>
                            ) : (
                                isPasswordLogin ? 'Initialize Uplink' : 'Send Magic Link'
                            )}
                        </span>
                    </button>

                    <div className="pt-2 text-center">
                        <button
                            type="button"
                            onClick={() => setIsPasswordLogin(!isPasswordLogin)}
                            className="text-xs text-forge-muted hover:text-warrior transition-colors font-mono uppercase tracking-wide border-b border-transparent hover:border-warrior pb-0.5"
                        >
                            {isPasswordLogin ? 'Use Magic Link Signal' : 'Use Access Key Protocol'}
                        </button>
                    </div>
                </form>

                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`mt-6 p-4 rounded text-sm flex items-center gap-3 border ${message.type === 'error'
                                ? 'bg-red-950/40 text-red-200 border-red-900/50'
                                : 'bg-green-950/40 text-green-200 border-green-900/50'
                                }`}
                        >
                            {message.type === 'error' ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                            <span className="font-mono">{message.text}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
