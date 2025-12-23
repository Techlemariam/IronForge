'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ForgeCard from '@/components/ui/ForgeCard';
import ForgeButton from '@/components/ui/ForgeButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ITEMS, RECIPES } from '@/data/gameData';
import { UserInventory, CraftingRecipe } from '@/types/game';
import { craftItem } from '@/actions/forge';
import { Hammer, Anvil, Coins, ArrowRight } from 'lucide-react';

interface TheForgeProps {
    onClose: () => void;
}

const TheForge: React.FC<TheForgeProps> = ({ onClose }) => {
    // TODO: In a real app, inventory would be passed in or fetched via hook
    // For MVP, we mock the initial state or fetch it on mount
    const [inventory, setInventory] = useState<UserInventory | null>(null);
    const [loading, setLoading] = useState(false);
    const [craftingId, setCraftingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Initial Mock Load (Replace with server action fetch later if needed)
    useEffect(() => {
        // Simulating data fetch
        const mockInventory: UserInventory = {
            userId: 'current-user',
            gold: 500,
            items: [
                { itemId: 'item_iron_ore', count: 10 },
                { itemId: 'item_flux', count: 5 }
            ]
        };
        setInventory(mockInventory);
    }, []);

    const handleCraft = async (recipe: CraftingRecipe) => {
        if (!inventory) return;
        setCraftingId(recipe.id);
        setMessage(null);

        try {
            const result = await craftItem(recipe.id);
            if (result.success && result.inventory) {
                // Update local state with new inventory from server
                // Note: The mock server action returns the inventory, so we use that.
                // In a real app we might revalidatePath or use a router refresh.
                // But for client interactivity, updating state is faster.
                // Since the mock action is stateless (doesn't persist to DB truly yet), 
                // we might need to manually update local state if the server result isn't fully persistent.
                // BUT, our server action returns 'inventory'. Let's trust it.
                // Wait, the Mock Action re-computes inventory freshly every time from static mock, 
                // so it won't persist across calls in this specific implementation step.
                // TO FIX: The server action calculates result based on Input Inventory it generates.
                // For this UI to feel "real", we should manually update the local state 
                // to reflect the craft immediately, assuming success.

                // Manual Optimistic Update for MVP fluidity:
                const newItems = [...inventory.items];

                // Deduct
                recipe.materials.forEach(mat => {
                    const idx = newItems.findIndex(i => i.itemId === mat.itemId);
                    if (idx > -1) {
                        newItems[idx] = { ...newItems[idx], count: newItems[idx].count - mat.count };
                        if (newItems[idx].count <= 0) newItems.splice(idx, 1);
                    }
                });

                // Add
                const resIdx = newItems.findIndex(i => i.itemId === recipe.resultItemId);
                if (resIdx > -1) {
                    newItems[resIdx] = { ...newItems[resIdx], count: newItems[resIdx].count + recipe.resultCount };
                } else {
                    newItems.push({ itemId: recipe.resultItemId, count: recipe.resultCount });
                }

                setInventory({
                    ...inventory,
                    gold: inventory.gold - recipe.goldCost,
                    items: newItems
                });

                setMessage({ text: result.message, type: 'success' });
            } else {
                setMessage({ text: result.message, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'The Hammer failed to strike.', type: 'error' });
        } finally {
            setCraftingId(null);
        }
    };

    if (!inventory) return <LoadingSpinner />;

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-heading text-3xl text-magma tracking-widest uppercase flex items-center gap-3">
                        <Anvil className="w-8 h-8" /> The Forge
                    </h1>
                    <p className="text-forge-muted font-mono text-sm mt-1">Refine materials. Forge destiny.</p>
                </div>
                <ForgeButton variant="rune" onClick={onClose}>Exit</ForgeButton>
            </div>

            {/* Inventory Bar */}
            <ForgeCard className="mb-8 p-4 flex items-center gap-6 overflow-x-auto bg-black/40 border-forge-border">
                <div className="flex items-center gap-2 text-gold font-mono border-r border-forge-border pr-6">
                    <Coins className="w-5 h-5" />
                    <span className="text-xl">{inventory.gold}</span>
                </div>
                {inventory.items.map((slot) => {
                    const item = ITEMS.find(i => i.id === slot.itemId);
                    if (!item) return null;
                    return (
                        <div key={slot.itemId} className="flex items-center gap-2 min-w-fit px-3 py-1 bg-forge-800 rounded border border-forge-border/50">
                            <span className="text-xl">{item.image}</span>
                            <div className="flex flex-col leading-none">
                                <span className={`text-xs uppercase font-bold text-${item.rarity === 'common' ? 'white' : 'magma'}`}>
                                    {item.name}
                                </span>
                                <span className="text-xs text-forge-muted font-mono">x{slot.count}</span>
                            </div>
                        </div>
                    )
                })}
            </ForgeCard>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 mb-6 rounded border ${message.type === 'success' ? 'bg-green-900/20 border-green-500/50 text-green-200' : 'bg-red-900/20 border-blood/50 text-blood'} font-mono text-center`}
                >
                    {message.text}
                </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {RECIPES.map((recipe) => {
                    const resultItem = ITEMS.find(i => i.id === recipe.resultItemId);
                    if (!resultItem) return null;

                    const canCraft = inventory.gold >= recipe.goldCost && recipe.materials.every(mat => {
                        const slot = inventory.items.find(i => i.itemId === mat.itemId);
                        return slot && slot.count >= mat.count;
                    });

                    return (
                        <ForgeCard key={recipe.id} className="relative group overflow-visible">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-forge-900 rounded-lg flex items-center justify-center text-3xl border border-forge-border shadow-inner">
                                        {resultItem.image}
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-lg text-white group-hover:text-magma transition-colors">
                                            {recipe.name}
                                        </h3>
                                        <div className="flex items-center gap-1 text-gold text-xs font-mono">
                                            <Coins className="w-3 h-3" /> {recipe.goldCost}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="text-xs text-forge-muted uppercase tracking-wider">Requires:</div>
                                <div className="space-y-1">
                                    {recipe.materials.map(mat => {
                                        const matItem = ITEMS.find(i => i.id === mat.itemId);
                                        const inventoryCount = inventory.items.find(i => i.itemId === mat.itemId)?.count || 0;
                                        const hasEnough = inventoryCount >= mat.count;

                                        return (
                                            <div key={mat.itemId} className="flex justify-between text-sm font-mono">
                                                <span className="text-white/80">{matItem?.name || mat.itemId}</span>
                                                <span className={hasEnough ? 'text-green-400' : 'text-blood'}>
                                                    {inventoryCount}/{mat.count}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <ForgeButton
                                variant={canCraft ? 'magma' : 'rune'}
                                className="w-full"
                                disabled={!canCraft || craftingId === recipe.id}
                                onClick={() => handleCraft(recipe)}
                            >
                                {craftingId === recipe.id ? (
                                    <><LoadingSpinner className="w-4 h-4 mr-2" /> Forging...</>
                                ) : (
                                    <><Hammer className="w-4 h-4 mr-2" /> Forge Item</>
                                )}
                            </ForgeButton>
                        </ForgeCard>
                    );
                })}
            </div>
        </div>
    );
};

export default TheForge;
