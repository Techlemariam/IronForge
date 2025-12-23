
import React, { useState, useEffect, useRef } from 'react';
import { RaidBoss, ChatMessage } from '../../types';
import { Skull, Swords, Shield, Users, Send, Info, WifiOff, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { sendChatAction, attackBossAction, getUserStatsAction } from '@/actions/guild';

interface GuildHallProps {
    onClose: () => void;
}

const DEFAULT_BOSS: RaidBoss = {
    id: 'boss_iron_golem',
    name: 'The Iron Golem',
    totalHp: 1000000,
    currentHp: 1000000,
    image: '🦾',
    description: 'A massive automaton forged in the heart of the Iron Mines. It grows stronger with every failed attempt.',
    rewards: ['Kinetic Shard x50', 'Golem Core', 'Title: Golem Smasher'],
};

const ATTACK_COST = 5;

interface FloatingText {
    id: number;
    text: string;
    x: number;
    y: number;
    color: string;
}

export const GuildHall: React.FC<GuildHallProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [boss, setBoss] = useState<RaidBoss>(DEFAULT_BOSS);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineCount, setOnlineCount] = useState(1);

    // Performance Coach State
    const [kineticEnergy, setKineticEnergy] = useState<number>(0);
    const [heroName, setHeroName] = useState<string>('Titan');

    // Visual Juice State
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
    const [shake, setShake] = useState(false);

    // Animation state
    const [hpAnim, setHpAnim] = useState(boss.currentHp);

    const channelRef = useRef<RealtimeChannel | null>(null);

    // Initial Load & Subscription
    useEffect(() => {
        let mounted = true;

        const init = async () => {
            const supabase = createClient();
            setIsConnected(true);

            // Fetch User Stats (Ammo)
            const userStats = await getUserStatsAction();
            if (userStats && mounted) {
                setKineticEnergy(userStats.kineticEnergy);
                setHeroName(userStats.heroName || 'Titan');
            }

            // 1. Fetch Initial Boss State
            const { data: bossData } = await supabase
                .from('raid_bosses')
                .select('*')
                .eq('is_active', true)
                .single();

            if (bossData) {
                const mappedBoss: RaidBoss = {
                    id: bossData.id,
                    name: bossData.name,
                    totalHp: bossData.total_hp,
                    currentHp: bossData.current_hp,
                    image: bossData.image,
                    description: bossData.description,
                    rewards: bossData.rewards
                };
                if (mounted) {
                    setBoss(mappedBoss);
                    setHpAnim(mappedBoss.currentHp);
                }
            }

            // 2. Fetch Recent Chat
            const { data: chatData } = await supabase
                .from('chat_messages')
                .select('*')
                .order('timestamp', { ascending: false })
                .limit(50);

            if (chatData && mounted) {
                const mappedMessages = chatData.map((msg: any) => ({
                    id: msg.id,
                    userName: msg.user_name,
                    message: msg.message,
                    timestamp: msg.timestamp,
                    type: msg.type
                }));
                setMessages(mappedMessages.reverse());
            }

            // 3. Subscribe to Changes
            const channel = supabase.channel('guild_hall_global')
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'raid_bosses', filter: `id=eq.${bossData?.id || DEFAULT_BOSS.id}` },
                    (payload) => {
                        const newHp = payload.new.current_hp;
                        if (mounted) {
                            setBoss(prev => ({ ...prev, currentHp: newHp }));
                        }
                    }
                )
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                    (payload) => {
                        const newMsgRaw = payload.new;
                        const newMsg: ChatMessage = {
                            id: newMsgRaw.id,
                            userName: newMsgRaw.user_name,
                            message: newMsgRaw.message,
                            timestamp: newMsgRaw.timestamp,
                            type: newMsgRaw.type
                        };

                        if (mounted) {
                            setMessages(prev => [...prev, newMsg]);
                        }
                    }
                )
                .on('presence', { event: 'sync' }, () => {
                    const state = channel.presenceState();
                    if (mounted) setOnlineCount(Object.keys(state).length + 1);
                })
                .subscribe();

            await channel.track({ online_at: new Date().toISOString() });
            channelRef.current = channel;
        };

        init();

        return () => {
            mounted = false;
            if (channelRef.current) {
                channelRef.current.unsubscribe();
            }
        };
    }, []);

    // Lerp HP for smooth animation
    useEffect(() => {
        const interval = setInterval(() => {
            setHpAnim(prev => {
                const diff = boss.currentHp - prev;
                if (Math.abs(diff) < 1) return boss.currentHp;
                return prev + diff * 0.1;
            });
        }, 30);
        return () => clearInterval(interval);
    }, [boss.currentHp]);

    // Floating Text Animation Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setFloatingTexts(prev => prev.map(ft => ({ ...ft, y: ft.y - 2 })).filter(ft => ft.y > -50));
        }, 30);
        return () => clearInterval(interval);
    }, []);

    const hpPct = (hpAnim / boss.totalHp) * 100;

    const spawnFloatingText = (text: string, color: string = 'white') => {
        // Random offset
        const xOffset = Math.random() * 100 - 50;
        const yOffset = Math.random() * 50 - 25;

        const newText: FloatingText = {
            id: Date.now() + Math.random(),
            text,
            x: xOffset,
            y: yOffset,
            color
        };
        setFloatingTexts(prev => [...prev, newText]);
    };

    const handleSendMessage = async () => {
        if (!input.trim()) return;
        const msgToSend = input;
        setInput('');

        try {
            await sendChatAction(msgToSend);
        } catch (e) {
            console.error("Failed to send message", e);
        }
    };

    const handleAttack = async (e: React.MouseEvent) => {
        if (!boss.id) return;

        // 1. Check Energy (Optimistic Check)
        if (kineticEnergy < ATTACK_COST) {
            spawnFloatingText("LOW ENERGY!", "#ef4444"); // Red
            return;
        }

        // 2. Consume Energy Optimistically
        setKineticEnergy(prev => Math.max(0, prev - ATTACK_COST));

        // 3. Visual Juice
        setShake(true);
        setTimeout(() => setShake(false), 200);

        // 4. Server Action
        try {
            const result = await attackBossAction(boss.id);
            if (result.damage) {
                spawnFloatingText(`-${result.damage}`, "#facc15"); // Yellow
            }
        } catch (err: any) {
            console.error("Attack failed", err);
            // Revert Energy on fail? Or just let it sync next time.
            spawnFloatingText("MISS!", "#a1a1aa");
        }
    };

    return (
        <div className={cn(
            "h-full bg-forge-900 overflow-hidden flex flex-col font-serif animate-fade-in transition-transform duration-75",
            shake ? "translate-x-1 translate-y-1" : ""
        )}>
            {/* Header */}
            <div className="bg-black/50 border-b border-forge-border p-6 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-950/30 border border-red-500/50 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <Swords className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">The Guild Hall</h1>
                        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
                            <span className="flex items-center gap-1">
                                {isConnected ? <Users className="w-3 h-3 text-cyan-500" /> : <WifiOff className="w-3 h-3 text-red-500" />}
                                {isConnected ? `${onlineCount} Online` : 'Offline Mode'}
                            </span>
                            <span className="flex items-center gap-1 text-yellow-500">
                                <Zap className="w-3 h-3 text-yellow-500" /> {kineticEnergy} Energy
                                <span className="opacity-50 text-[10px] ml-1">(Cost: {ATTACK_COST})</span>
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="bg-forge-800 border-2 border-forge-border px-6 py-2 rounded font-bold uppercase text-xs hover:bg-forge-700 transition-all hover:scale-105"
                >
                    Retreat
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Battle Area */}
                <div className="flex-1 p-8 flex flex-col items-center justify-center relative overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-forge-900 to-forge-900">

                    {/* Floating Texts Layer */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
                        {floatingTexts.map(ft => (
                            <div
                                key={ft.id}
                                className="absolute text-4xl font-black animate-float-up"
                                style={{
                                    transform: `translate(${ft.x}px, ${ft.y}px)`,
                                    color: ft.color,
                                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                                }}
                            >
                                {ft.text}
                            </div>
                        ))}
                    </div>

                    {/* Boss Visualization */}
                    <div
                        className={cn(
                            "relative group cursor-pointer transition-transform active:scale-95 select-none",
                            kineticEnergy < ATTACK_COST ? "opacity-50 cursor-not-allowed filter grayscale" : ""
                        )}
                        onClick={handleAttack}
                    >
                        <div className="text-[12rem] animate-pulse-slow drop-shadow-[0_0_50px_rgba(239,68,68,0.3)] filter grayscale-[0.2] transition-all group-hover:scale-110 group-active:filter-none">
                            {boss.image}
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 border border-red-500/50 px-4 py-1 rounded-full pointer-events-none">
                            <span className="text-red-500 font-black tracking-[0.2em] uppercase text-sm">{boss.name}</span>
                        </div>
                        {/* Tooltip for Attack */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col items-center gap-1">
                            {kineticEnergy >= ATTACK_COST ? (
                                <>
                                    <span className="text-4xl font-black text-red-500 text-shadow-neon stroke-black whitespace-nowrap">CLICK TO ATTACK</span>
                                    <span className="text-xs font-bold text-yellow-500 bg-black/80 px-2 py-1 rounded uppercase">Costs {ATTACK_COST} Energy</span>
                                </>
                            ) : (
                                <span className="text-2xl font-black text-zinc-500 text-shadow-neon stroke-black whitespace-nowrap">NEED ENERGY</span>
                            )}
                        </div>
                    </div>

                    {/* Boss HP Bar */}
                    <div className="w-full max-w-2xl mt-16 space-y-2">
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Global Integrity</span>
                                <span className="text-2xl font-black text-red-500 font-mono tracking-tighter italic">
                                    {Math.round(hpAnim).toLocaleString()} <span className="text-zinc-600 text-sm italic">/ {boss.totalHp.toLocaleString()} HP</span>
                                </span>
                            </div>
                            <span className="text-4xl font-black text-white italic opacity-20">{Math.floor(hpPct)}%</span>
                        </div>
                        <div className="h-4 w-full bg-zinc-950 rounded-full border-2 border-zinc-900 p-0.5 overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-red-900 via-red-600 to-red-400 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-all duration-100 ease-out relative overflow-hidden"
                                style={{ width: `${hpPct}%` }}
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:2rem_2rem] animate-scroll"></div>
                            </div>
                        </div>
                    </div>

                    {/* Boss Info Card */}
                    <div className="mt-12 grid grid-cols-2 gap-6 w-full max-w-2xl">
                        <div className="bg-black/40 border border-zinc-800 p-4 rounded-lg">
                            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Info className="w-3 h-3 text-cyan-500" /> Intelligence
                            </h3>
                            <p className="text-xs text-zinc-300 leading-relaxed italic">
                                &quot;{boss.description}&quot;
                            </p>
                        </div>
                        <div className="bg-black/40 border border-zinc-800 p-4 rounded-lg">
                            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Shield className="w-3 h-3 text-red-500" /> Bounties
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {boss.rewards.map((reward, i) => (
                                    <span key={i} className="text-[9px] font-bold text-rarity-legendary bg-rarity-legendary/10 border border-rarity-legendary/30 px-2 py-0.5 rounded uppercase">
                                        {reward}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Raid Chat/Log */}
                <div className="w-96 bg-black/40 border-l border-forge-border flex flex-col">
                    <div className="p-4 border-b border-forge-border bg-black/20">
                        <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Users className="w-4 h-4 text-cyan-500" /> Raid Comms
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans no-scrollbar flex flex-col-reverse">
                        {[...messages].reverse().map((msg) => (
                            <div key={msg.id} className={cn(
                                "p-3 rounded-lg border text-xs leading-relaxed animate-slide-in",
                                msg.type === 'LOG'
                                    ? "bg-red-950/20 border-red-500/20 text-red-400 italic font-medium"
                                    : "bg-zinc-900/50 border-zinc-800 text-zinc-300"
                            )}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className={cn(
                                        "font-black uppercase tracking-tighter",
                                        msg.userName === 'Titan' ? "text-cyan-500" : "text-zinc-500"
                                    )}>
                                        {msg.userName}
                                    </span>
                                    <span className="text-[9px] opacity-30">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p>{msg.message}</p>
                            </div>
                        ))}
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-forge-border bg-black/40">
                        <div className="relative group">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder={isConnected ? "Coordinate attack..." : "Connecting to Neural Link..."}
                                disabled={!isConnected}
                                className="w-full bg-forge-800 border border-forge-border rounded-lg py-2 pl-4 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!isConnected}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-cyan-500 transition-colors disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuildHall;
