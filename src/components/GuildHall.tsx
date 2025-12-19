
import React, { useState, useEffect, useRef } from 'react';
import { RaidBoss, ChatMessage } from '../types';
import { Users, Skull, Wifi, Zap, MousePointer2, Video, Volume2 } from 'lucide-react';
import { getSupabase } from '../lib/supabase';
import { playSound } from '../utils';
import { RaidService } from '../services/raid';

const DEFAULT_BOSS: RaidBoss = {
    id: 'boss_ragnaros',
    name: 'Ragnaros the Firelord',
    totalHp: 5000000,
    currentHp: 5000000,
    image: 'https://placehold.co/150x150/800000/ff0000?text=BOSS',
    description: 'LIVE RAID: Damage is synced via WebSocket to all Guild Members.',
    rewards: ['Sulfuras, Hand of Ragnaros', 'Tier 2 Leggings']
};

interface PresenceState {
    user: string;
    x: number;
    y: number;
    online_at: string;
}

const GuildHall: React.FC = () => {
    const [raidBoss, setRaidBoss] = useState<RaidBoss>(DEFAULT_BOSS);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [onlineCount, setOnlineCount] = useState(1);
    const [cursors, setCursors] = useState<PresenceState[]>([]);
    const [heroName, setHeroName] = useState('Titan');
    
    // Raidverse State
    const [showSquadCam, setShowSquadCam] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [activeDebuff, setActiveDebuff] = useState<string | null>(null);

    const arenaRef = useRef<HTMLDivElement>(null);
    const bossRef = useRef(raidBoss);
    const lastBroadcastRef = useRef<number>(0); // Throttle Ref

    useEffect(() => {
        const loadIdentity = async () => {
             const stored = localStorage.getItem('ironforge_settings');
             if (stored) {
                 const parsed = JSON.parse(stored);
                 if (parsed.heroName) setHeroName(parsed.heroName);
             }
        };
        loadIdentity();

        let channel: any;

        const connect = async () => {
            const supabase = await getSupabase();
            if (!supabase) {
                setMessages([{ id: 'sys', user: 'System', message: 'Offline Mode: Configure Supabase.', timestamp: new Date().toISOString(), type: 'LOG' }]);
                return;
            }

            // Fetch Boss State
            const { data } = await supabase.from('raid_bosses').select('*').single();
            if (data) {
                const loadedBoss = { ...DEFAULT_BOSS, currentHp: data.current_hp, totalHp: data.total_hp };
                setRaidBoss(loadedBoss);
                bossRef.current = loadedBoss;
            }

            // Subscribe
            channel = supabase.channel('guild_hall')
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'raid_bosses' }, (payload) => {
                    const newHp = payload.new.current_hp;
                    
                    // --- SYNCHRONIZED INTERVALS ---
                    // Random chance on health update to trigger a "Gravity Spell"
                    if (Math.random() < 0.1) {
                        triggerGravitySpell();
                    }

                    setRaidBoss(prev => {
                        const next = { ...prev, currentHp: newHp };
                        bossRef.current = next;
                        return next;
                    });
                    playSound('ding'); 
                })
                .on('broadcast', { event: 'chat' }, (payload) => {
                    setMessages(prev => [...prev, payload.payload]);
                })
                .on('presence', { event: 'sync' }, () => {
                    const state = channel.presenceState();
                    const presenceList: PresenceState[] = [];
                    Object.values(state).forEach((users: any) => {
                        users.forEach((u: any) => presenceList.push(u));
                    });
                    setCursors(presenceList.filter(u => u.user !== heroName));
                    setOnlineCount(presenceList.length);
                })
                .subscribe(status => {
                    if (status === 'SUBSCRIBED') {
                        setIsConnected(true);
                        channel.track({ user: heroName, x: 50, y: 50, online_at: new Date().toISOString() });
                    }
                });
        };

        connect();

        return () => {
            if (channel) channel.unsubscribe();
        };
    }, [heroName]);

    // Setup Local Camera for "Squad Cam"
    useEffect(() => {
        if (showSquadCam) {
            navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
                .then(stream => {
                    if (videoRef.current) videoRef.current.srcObject = stream;
                })
                .catch(err => console.error("Squad Cam Error", err));
        }
    }, [showSquadCam]);

    const triggerGravitySpell = () => {
        setActiveDebuff("GRAVITY CRUSH");
        playSound('fail'); // Alarm sound
        setTimeout(() => setActiveDebuff(null), 5000);
    };

    const handleAttack = async () => {
        const damage = Math.floor(Math.random() * 500) + 100;
        const newHp = Math.max(0, raidBoss.currentHp - damage);
        
        setRaidBoss(prev => ({ ...prev, currentHp: newHp }));
        bossRef.current = { ...raidBoss, currentHp: newHp };
        
        playSound('loot_epic'); 

        const supabase = await getSupabase();
        if (supabase) {
            await supabase.rpc('damage_boss', { damage_amount: damage, boss_id: 1 });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!arenaRef.current || !isConnected) return;

        // THROTTLE LOGIC: Cap at 20fps (50ms)
        const now = Date.now();
        if (now - lastBroadcastRef.current < 50) return;
        lastBroadcastRef.current = now;

        const rect = arenaRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        RaidService.broadcastPresence(heroName, x, y);
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        
        const msg: ChatMessage = { 
            id: Date.now().toString(), 
            user: heroName,
            message: chatInput, 
            timestamp: new Date().toISOString(), 
            type: 'CHAT' 
        };
        setMessages(prev => [...prev, msg]);
        setChatInput('');

        const supabase = await getSupabase();
        if (supabase) {
            await supabase.channel('guild_hall').send({
                type: 'broadcast',
                event: 'chat',
                payload: msg
            });
        }
    };

    return (
        <div className="h-full bg-[#0a0f14] flex flex-col font-serif relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 pointer-events-none"></div>

            {/* HEADER */}
            <div className="p-4 border-b border-[#1f2937] bg-[#111827]/80 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-900/50 border border-indigo-500 rounded text-indigo-400">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold uppercase tracking-widest">IronForge Guild</h1>
                        <span className="text-xs text-indigo-400 flex items-center gap-1">
                            {isConnected ? <Wifi className="w-3 h-3 text-green-500" /> : <Wifi className="w-3 h-3 text-red-500" />}
                            {isConnected ? 'Live Uplink Active' : 'Offline Mode'} • {onlineCount} Titans Online
                        </span>
                    </div>
                </div>
                <button 
                    onClick={() => setShowSquadCam(!showSquadCam)}
                    className={`p-2 rounded border ${showSquadCam ? 'bg-indigo-500 text-white' : 'bg-black border-indigo-900 text-indigo-500'}`}
                >
                    <Video className="w-5 h-5" />
                </button>
            </div>

            {/* BOSS ARENA */}
            <div 
                ref={arenaRef}
                onMouseMove={handleMouseMove}
                className="flex-1 p-6 overflow-hidden z-10 flex flex-col items-center justify-center relative cursor-crosshair"
            >
                {/* GRAVITY SPELL OVERLAY */}
                {activeDebuff && (
                    <div className="absolute inset-0 z-50 bg-red-900/30 flex items-center justify-center pointer-events-none animate-pulse">
                        <div className="bg-black/90 border-2 border-red-500 p-6 rounded-lg text-center transform rotate-2">
                            <h2 className="text-4xl font-black text-red-500 uppercase tracking-widest mb-2">{activeDebuff}</h2>
                            <p className="text-white font-mono text-sm">RESISTANCE INCREASED BY 20%</p>
                            <p className="text-red-400 text-xs mt-2">PEDAL HARDER TO BREAK SHIELD</p>
                        </div>
                    </div>
                )}

                {/* SQUAD CAM GRID (Simulated WebRTC) */}
                {showSquadCam && (
                    <div className="absolute right-4 top-4 w-48 flex flex-col gap-2 z-40">
                        <div className="relative aspect-video bg-black rounded border border-indigo-500/50 overflow-hidden">
                            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                            <div className="absolute bottom-1 left-1 text-[8px] bg-black/50 text-white px-1">YOU</div>
                        </div>
                        {/* Fake squad members */}
                        {[1, 2].map(i => (
                            <div key={i} className="relative aspect-video bg-zinc-900 rounded border border-indigo-900/50 overflow-hidden flex items-center justify-center">
                                <Users className="w-8 h-8 text-zinc-700" />
                                <div className="absolute bottom-1 left-1 text-[8px] bg-black/50 text-white px-1">SQUAD {i}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* LIVE CURSORS */}
                {cursors.map((c, i) => (
                    <div 
                        key={i}
                        className="absolute pointer-events-none transition-all duration-200 ease-out z-50 flex flex-col items-center"
                        style={{ left: `${c.x}%`, top: `${c.y}%` }}
                    >
                        <MousePointer2 className="w-4 h-4 text-indigo-400 fill-indigo-900 transform -rotate-12" />
                        <span className="text-[9px] bg-black/50 text-white px-1 rounded whitespace-nowrap">{c.user}</span>
                    </div>
                ))}

                <div className="w-full max-w-2xl bg-[#111] border-2 border-red-900 rounded-lg overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)] relative z-20">
                    <div className="h-48 bg-gradient-to-b from-red-950 to-black relative flex items-center justify-center group cursor-pointer" onClick={handleAttack}>
                        <img src={raidBoss.image} alt="Boss" className="w-32 h-32 rounded-full border-4 border-red-600 shadow-2xl z-10 group-active:scale-95 transition-transform" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent animate-pulse"></div>
                    </div>

                    <div className="p-6">
                        <div className="flex justify-between items-end mb-2">
                            <h2 className="text-2xl font-black text-red-500 uppercase tracking-tighter flex items-center gap-2">
                                <Skull className="w-6 h-6" /> {raidBoss.name}
                            </h2>
                            <span className="text-red-400 font-mono text-xl">{((raidBoss.currentHp / raidBoss.totalHp) * 100).toFixed(1)}%</span>
                        </div>
                        
                        <div className="w-full h-6 bg-red-950 rounded-full overflow-hidden border border-red-900 mb-4">
                            <div 
                                className="h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)] transition-all duration-300 ease-out"
                                style={{ width: `${(raidBoss.currentHp / raidBoss.totalHp) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CHAT LOG */}
            <div className="h-64 bg-black/80 border-t border-zinc-800 flex flex-col z-10">
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {messages.map((msg, i) => (
                        <div key={i} className={`text-xs ${msg.type === 'LOG' ? 'text-yellow-600 italic' : 'text-zinc-300'}`}>
                            <span className="font-bold text-zinc-500">[{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]</span>{' '}
                            <span className={`font-bold ${msg.user === 'System' ? 'text-red-500' : 'text-indigo-400'}`}>{msg.user}:</span>{' '}
                            {msg.message}
                        </div>
                    ))}
                </div>
                <form onSubmit={sendMessage} className="p-2 border-t border-zinc-800 flex gap-2">
                    <input 
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                        placeholder="Guild Chat..."
                    />
                    <button type="submit" className="bg-indigo-900/50 border border-indigo-500 text-indigo-300 px-4 rounded text-xs font-bold uppercase">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GuildHall;
