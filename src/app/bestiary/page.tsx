import { Suspense } from 'react'
import { MonsterList } from '@/components/bestiary/MonsterList'
import { Skull, Scroll, Swords } from 'lucide-react'
import { getBestiaryData } from '@/actions/bestiary'

export default async function BestiaryPage() {
    // Fetch Real Data
    const monsters = await getBestiaryData()
    const defeatedCount = monsters.filter(m => m.defeated).length

    return (
        <div className="min-h-screen bg-forge-950 text-white p-6 md:p-12 pb-24">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-12 relative">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-900/80 to-transparent" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-red-950/30 rounded-lg border border-red-900/50 flex items-center justify-center transform -rotate-2 hover:rotate-0 transition-all duration-300">
                            <Skull className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-serif tracking-widest text-shadow-glow uppercase text-red-100">The Bestiary</h1>
                            <p className="text-forge-muted font-mono text-sm tracking-wide">Known Threats & Bosses</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-black/30 px-4 py-2 rounded border border-forge-border flex items-center gap-2">
                            <Swords className="w-4 h-4 text-red-400" />
                            <span className="font-mono text-sm text-gray-300">Enemies Defeated: <span className="text-red-400">{defeatedCount}</span></span>
                        </div>
                        <div className="bg-black/30 px-4 py-2 rounded border border-forge-border flex items-center gap-2">
                            <Scroll className="w-4 h-4 text-warrior" />
                            <span className="font-mono text-sm text-gray-300">Lore Unlocked: <span className="text-warrior">{Math.round((defeatedCount / Math.max(1, monsters.length)) * 100)}%</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                <Suspense fallback={<div className="text-center font-mono animate-pulse text-red-500">Scanning Perimeter...</div>}>
                    <MonsterList initialMonsters={monsters} />
                </Suspense>
            </div>
        </div>
    )
}
