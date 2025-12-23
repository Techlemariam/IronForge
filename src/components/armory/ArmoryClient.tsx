'use client'

import { useState } from 'react'
import { ItemGrid } from '@/components/armory/ItemGrid'
import { LootReveal } from '@/components/game/LootReveal'
import { simulateLootDrop, type LootResult } from '@/actions/gameplay'
import { Play } from 'lucide-react'
import type { ArmoryItem } from '@/actions/armory'

export default function ArmoryClient({ initialItems }: { initialItems: ArmoryItem[] }) {
    const [loot, setLoot] = useState<LootResult['item'] | null>(null)
    const [isSimulating, setIsSimulating] = useState(false)

    // Simulate Button Logic
    const handleSimulate = async () => {
        setIsSimulating(true)
        const result = await simulateLootDrop()

        if (result.success && result.item) {
            setLoot(result.item)
        } else {
            console.log(result.message)
        }
        setIsSimulating(false)
    }

    // Helper calculate stats
    const unlockedCount = initialItems.filter(i => !i.locked).length
    const totalPower = initialItems.reduce((acc, i) => acc + (i.locked ? 0 : i.power), 0)

    return (
        <div className="min-h-screen bg-forge-950 text-white p-6 md:p-12 pb-24">
            <LootReveal item={loot || null} onClose={() => setLoot(null)} />

            {/* Header Section */}
            <header className="mb-12 border-b border-white/10 pb-8 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif tracking-widest text-shadow-glow mb-2 uppercase">The Armory</h1>
                    <p className="text-forge-muted font-mono text-sm tracking-wide uppercase">Equipment & Artifacts</p>

                    <div className="flex gap-8 mt-6">
                        <div>
                            <span className="block text-2xl font-bold text-warrior">
                                {unlockedCount} <span className="text-sm font-normal text-gray-500">/ {initialItems.length}</span>
                            </span>
                            <span className="text-xs uppercase tracking-wider text-gray-500">Unlocked</span>
                        </div>
                        <div>
                            <span className="block text-2xl font-bold text-blue-400">
                                {totalPower}
                            </span>
                            <span className="text-xs uppercase tracking-wider text-gray-500">Total Power</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSimulate}
                    disabled={isSimulating}
                    className="flex items-center gap-2 px-6 py-3 bg-red-900/20 border border-red-500/50 text-red-400 rounded hover:bg-red-900/40 transition-all font-mono text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-wait"
                >
                    <Play className="w-4 h-4" />
                    {isSimulating ? 'Simulating Scan...' : 'Run Simulation'}
                </button>
            </header>

            {/* Content */}
            <ItemGrid initialItems={initialItems} />
        </div>
    )
}
