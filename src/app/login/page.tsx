'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Database } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            setMessage(`Error: ${error.message}`)
        } else {
            setMessage('Check your email for the magic link!')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-forge-950 flex items-center justify-center p-4 bg-noise">
            <div className="w-full max-w-md bg-forge-900 border border-forge-border p-8 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)]">

                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-warrior/20 rounded-full flex items-center justify-center border border-warrior/50">
                        <Database className="w-8 h-8 text-warrior" />
                    </div>
                </div>

                <h1 className="text-3xl font-serif text-center text-white mb-2 tracking-widest uppercase">IronForge</h1>
                <p className="text-center text-forge-muted mb-8 font-mono text-sm">Secure Uplink Required</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-mono uppercase text-gray-400 mb-1">Email Coordinates</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-black/50 border border-forge-border rounded p-3 text-white focus:outline-none focus:border-warrior transition-colors"
                            placeholder="hunter@ironforge.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-warrior hover:bg-warrior-light text-black font-bold py-3 rounded uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-wait"
                    >
                        {loading ? <div className="flex items-center justify-center gap-2"><LoadingSpinner size="sm" /> Sending Signal...</div> : 'Send Magic Link'}
                    </button>
                </form>

                {message && (
                    <div className={`mt-6 p-4 rounded text-sm text-center font-mono ${message.includes('Error') ? 'bg-red-900/50 text-red-200 border border-red-800' : 'bg-green-900/50 text-green-200 border border-green-800'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    )
}
