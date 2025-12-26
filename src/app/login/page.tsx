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

    const handleGoogleLogin = async () => {
        setLoading(true)
        setMessage(null)
        const supabase = createClient()

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${location.origin}/auth/callback`,
                },
            })
            if (error) throw error
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Google Auth failed.' })
            setLoading(false)
        }
    }

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

                <div className="space-y-4 mb-6">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white hover:bg-zinc-200 text-black font-medium py-3 rounded flex items-center justify-center gap-3 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <LoadingSpinner size="sm" color="text-black" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        Continue with Google
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-forge-border/50" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-forge-900 px-2 text-forge-muted">Or continue with email</span>
                        </div>
                    </div>
                </div>

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
