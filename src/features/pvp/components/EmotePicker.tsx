'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Lock, Sparkles } from 'lucide-react';
import {
    getAvailableEmotesAction,
    sendBattleEmoteAction,
    type BattleEmoteWithUnlock,
} from '@/actions/combat/emotes';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface EmotePickerProps {
    matchId: string;
    disabled?: boolean;
    className?: string;
    onSend?: (emote: BattleEmoteWithUnlock) => void;
}

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
    taunt: { label: 'Taunts', icon: '😤' },
    flex: { label: 'Flex', icon: '💪' },
    gg: { label: 'GG', icon: '🎉' },
    premium: { label: 'Premium', icon: '👑' },
    seasonal: { label: 'Seasonal', icon: '🎄' },
};

export function EmotePicker({ matchId, disabled, className, onSend }: EmotePickerProps) {
    const [emotes, setEmotes] = useState<BattleEmoteWithUnlock[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        async function loadEmotes() {
            const result = await getAvailableEmotesAction();
            if (result.success && result.data) {
                setEmotes(result.data);
            }
            setIsLoading(false);
        }
        loadEmotes();
    }, []);

    const handleSendEmote = async (emote: BattleEmoteWithUnlock) => {
        if (!emote.isUnlocked) {
            toast.error(
                emote.isPremium
                    ? 'Upgrade to PRO to unlock this emote'
                    : `Reach level ${emote.unlockLevel} to unlock`
            );
            return;
        }

        setIsSending(true);
        const result = await sendBattleEmoteAction(matchId, emote.id);
        setIsSending(false);

        if (result.success) {
            setIsOpen(false);
            onSend?.(emote);
            toast.success('Emote sent!');
        } else {
            toast.error(result.error || 'Failed to send emote');
        }
    };

    const categories = [...new Set(emotes.map((e) => e.category))];

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    disabled={disabled || isLoading}
                    className={cn(
                        'h-12 w-12 rounded-full border-2 border-amber-500/50',
                        'bg-gradient-to-br from-amber-500/20 to-orange-600/20',
                        'hover:from-amber-500/30 hover:to-orange-600/30',
                        'transition-all duration-200',
                        className
                    )}
                >
                    <span className="text-2xl">😈</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 bg-slate-900/95 border-amber-500/30 p-0"
                side="top"
                align="end"
            >
                <div className="p-3 border-b border-white/10">
                    <h4 className="font-semibold text-amber-400 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Battle Emotes
                    </h4>
                </div>
                <Tabs defaultValue={categories[0] || 'taunt'} className="w-full">
                    <TabsList className="w-full justify-start bg-slate-800/50 rounded-none p-1 gap-1">
                        {categories.map((cat) => (
                            <TabsTrigger
                                key={cat}
                                value={cat}
                                className="data-[state=active]:bg-amber-500/20 text-xs px-2"
                            >
                                {CATEGORY_LABELS[cat]?.icon || '📦'}{' '}
                                {CATEGORY_LABELS[cat]?.label || cat}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {categories.map((cat) => (
                        <TabsContent key={cat} value={cat} className="p-2 m-0">
                            <div className="grid grid-cols-4 gap-2">
                                {emotes
                                    .filter((e) => e.category === cat)
                                    .map((emote) => (
                                        <EmoteButton
                                            key={emote.id}
                                            emote={emote}
                                            onClick={() => handleSendEmote(emote)}
                                            disabled={isSending}
                                        />
                                    ))}
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </PopoverContent>
        </Popover>
    );
}

interface EmoteButtonProps {
    emote: BattleEmoteWithUnlock;
    onClick: () => void;
    disabled?: boolean;
}

function EmoteButton({ emote, onClick, disabled }: EmoteButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: emote.isUnlocked ? 1.1 : 1 }}
            whileTap={{ scale: emote.isUnlocked ? 0.95 : 1 }}
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'relative w-16 h-16 rounded-lg overflow-hidden',
                'border-2 transition-all duration-200',
                emote.isUnlocked
                    ? 'border-amber-500/50 hover:border-amber-400 cursor-pointer'
                    : 'border-slate-600/50 cursor-not-allowed opacity-60'
            )}
        >
            <Image
                src={emote.gifPath}
                alt={emote.name}
                fill
                className="object-cover"
                unoptimized // GIFs need unoptimized to animate
            />
            {!emote.isUnlocked && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-slate-400" />
                </div>
            )}
            {emote.isPremium && emote.isUnlocked && (
                <div className="absolute top-0.5 right-0.5">
                    <span className="text-xs">👑</span>
                </div>
            )}
        </motion.button>
    );
}
