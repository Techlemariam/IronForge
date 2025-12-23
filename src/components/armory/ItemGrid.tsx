'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Lock } from 'lucide-react'
import type { ArmoryItem } from '@/actions/armory'

const RARITY_COLORS: Record<string, string> = {
    common: 'border-gray-600 text-gray-300 shadow-gray-900',
    rare: 'border-blue-500 text-blue-300 shadow-blue-900',
    epic: 'border-purple-500 text-purple-300 shadow-purple-900',
    legendary: 'border-warrior text-warrior shadow-yellow-900', // Gold/Warrior
}

export function ItemGrid({ initialItems }: { initialItems: ArmoryItem[] }) {
    const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
    const [search, setSearch] = useState('')
    const [selectedItem, setSelectedItem] = useState<ArmoryItem | null>(null)

    const filteredItems = initialItems.filter(item => {
        const matchesFilter = filter === 'all' || (filter === 'locked' ? item.locked : !item.locked)
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
        return matchesFilter && matchesSearch
    })

    return (
        <div>
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search repository..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-black/40 border border-forge-border rounded py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-warrior transition-colors font-mono"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded text-xs font-mono uppercase border ${filter === 'all' ? 'bg-warrior/10 border-warrior text-warrior' : 'bg-transparent border-forge-border text-gray-400 hover:border-gray-500'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unlocked')}
                        className={`px-4 py-2 rounded text-xs font-mono uppercase border ${filter === 'unlocked' ? 'bg-warrior/10 border-warrior text-warrior' : 'bg-transparent border-forge-border text-gray-400 hover:border-gray-500'}`}
                    >
                        Unlocked
                    </button>
                    <button
                        onClick={() => setFilter('locked')}
                        className={`px-4 py-2 rounded text-xs font-mono uppercase border ${filter === 'locked' ? 'bg-warrior/10 border-warrior text-warrior' : 'bg-transparent border-forge-border text-gray-400 hover:border-gray-500'}`}
                    >
                        Locked
                    </button>
                </div>
            </div>

            {/* Grid */}
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {filteredItems.map(item => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={item.id}
                            className={`relative bg-forge-900 border rounded-lg p-5 flex flex-col gap-4 aspect-square group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${RARITY_COLORS[item.rarity]} shadow-[0_0_15px_rgba(0,0,0,0.3)] cursor-pointer`}
                            onClick={() => setSelectedItem(item)}
                        >
                            {/* Rarity Glow Background */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-${item.rarity === 'legendary' ? 'yellow-500' : item.rarity === 'epic' ? 'purple-600' : 'blue-600'}`} />

                            <div className="flex justify-between items-start z-10">
                                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-current bg-black/50 tracking-wider`}>
                                    {item.rarity}
                                </span>
                                {item.locked && <Lock className="w-4 h-4 text-gray-500" />}
                            </div>

                            <div className="flex-1 flex items-center justify-center z-10">
                                {/* Placeholder Icon */}
                                <div className="w-16 h-16 rounded-full bg-black/30 border border-white/10 flex items-center justify-center">
                                    <div className={`w-8 h-8 rounded-full ${item.locked ? 'bg-gray-700' : 'bg-current shadow-[0_0_10px_currentColor]'}`} />
                                </div>
                            </div>

                            <div className="z-10">
                                <h3 className={`font-serif tracking-wide text-lg ${item.locked ? 'text-gray-500' : 'text-white'}`}>{item.name}</h3>
                                <p className="text-xs text-gray-500 font-mono mt-1 line-clamp-2">{item.description}</p>

                                {!item.locked && (
                                    <div className="mt-3 flex items-center gap-2 text-xs font-mono text-gray-400">
                                        <div className="h-1 w-full bg-black/50 rounded-full overflow-hidden">
                                            <div className="h-full bg-current w-3/4 opacity-50" />
                                        </div>
                                        <span>PWR {item.power}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {filteredItems.length === 0 && (
                <div className="text-center py-20 text-gray-500 font-mono">
                    No artifacts found matching query protocols.
                </div>
            )}

            {/* Item Details Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedItem(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className={`relative w-full max-w-lg bg-forge-950 border-2 ${RARITY_COLORS[selectedItem.rarity]} rounded-lg p-1 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden`}
                        >
                            <div className="bg-forge-900/90 p-8 rounded relative overflow-hidden">
                                {/* Background Effects */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>

                                <div className="flex flex-col items-center mb-6">
                                    <div className="w-24 h-24 rounded-full bg-black/50 border-2 border-white/10 flex items-center justify-center mb-4 shadow-xl relative">
                                        <div className={`w-12 h-12 rounded-full ${selectedItem.locked ? 'bg-gray-700' : 'bg-current shadow-[0_0_20px_currentColor]'} ${selectedItem.locked ? '' : RARITY_COLORS[selectedItem.rarity].split(' ')[1]}`} />
                                    </div>
                                    <h2 className="text-2xl font-serif tracking-widest uppercase text-white text-center">{selectedItem.name}</h2>
                                    <span className={`text-xs font-mono uppercase px-3 py-1 rounded-full border border-current bg-black/50 tracking-wider mt-2 ${RARITY_COLORS[selectedItem.rarity].split(' ')[1]}`}>
                                        {selectedItem.rarity}
                                    </span>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-black/30 p-4 rounded border border-white/5">
                                        <h4 className="text-xs font-mono uppercase text-gray-500 mb-2">Description</h4>
                                        <p className="text-gray-300 text-sm leading-relaxed">{selectedItem.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-black/30 p-3 rounded border border-white/5">
                                            <h4 className="text-xs font-mono uppercase text-gray-500 mb-1">Type</h4>
                                            <p className="text-white font-mono capitalize">{selectedItem.type}</p>
                                        </div>
                                        <div className="bg-black/30 p-3 rounded border border-white/5">
                                            <h4 className="text-xs font-mono uppercase text-gray-500 mb-1">Power Level</h4>
                                            <p className={`font-mono font-bold ${selectedItem.locked ? 'text-gray-500' : 'text-warrior'}`}>
                                                {selectedItem.locked ? '???' : selectedItem.power}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        {selectedItem.locked ? (
                                            <button disabled className="w-full bg-gray-800 text-gray-500 font-bold py-3 rounded uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2">
                                                <Lock className="w-4 h-4" /> Locked
                                            </button>
                                        ) : (
                                            <button className="w-full bg-warrior hover:bg-warrior-light text-black font-bold py-3 rounded uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)] hover:shadow-[0_0_30px_rgba(255,215,0,0.4)]">
                                                Equip Gear
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
