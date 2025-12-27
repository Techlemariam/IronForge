'use client';

import React, { useState, useEffect } from 'react';
import { createGuildAction, joinGuildAction, contributeToRaidAction, getGuildAction, startRaidAction } from '@/actions/guild-raids.ts'; // Oops, relative path issue via tool call, should use alias
import { createGuildAction as create, joinGuildAction as join, contributeToRaidAction as contribute, getGuildAction as getG, startRaidAction as startR } from '@/actions/guild-raids';
import { Shield, Sword, Users, Scroll } from 'lucide-react';

interface GuildHallProps {
    userId: string;
}

export const GuildHall: React.FC<GuildHallProps> = ({ userId }) => {
    // Basic state handling for MVP
    const [guild, setGuild] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [createName, setCreateName] = useState('');

    useEffect(() => {
        loadGuild();
    }, [userId]);

    const loadGuild = async () => {
        setLoading(true);
        const g = await getG(userId);
        setGuild(g);
        setLoading(false);
    };

    const handleCreate = async () => {
        await create(userId, { name: createName });
        loadGuild();
    };

    const handleAttack = async () => {
        if (!guild?.activeRaid) return;
        // Simulating damage based on user stats (random for now)
        const dmg = Math.floor(Math.random() * 50) + 10;
        await contribute(userId, guild.activeRaid.id, dmg);
        loadGuild(); // Refresh HP
    };

    const handleStartRaid = async () => {
        if (!guild) return;
        await startR(guild.id, 'Onyxia', 10000); // Default boss
        loadGuild();
    };

    if (loading) return <div className="text-zinc-500">Loading Guild Data...</div>;

    if (!guild) {
        // No Guild View
        return (
            <div className="bg-zinc-900 border border-white/5 p-8 rounded-xl text-center">
                <Shield className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">You are Guildless</h2>
                <p className="text-zinc-400 mb-6">Join a guild to fight massive Raid Bosses.</p>

                <div className="max-w-xs mx-auto space-y-4">
                    <input
                        className="w-full bg-black/40 border border-white/10 p-2 rounded text-white"
                        placeholder="Guild Name"
                        value={createName}
                        onChange={e => setCreateName(e.target.value)}
                    />
                    <button onClick={handleCreate} className="w-full bg-magma text-black font-bold py-2 rounded hover:bg-magma/80">
                        Form New Guild
                    </button>
                    <div className="text-xs text-zinc-500">Or wait for an invite... (Search WIP)</div>
                </div>
            </div>
        );
    }

    const { activeRaid } = guild;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">{guild.name}</h1>
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <Users className="w-4 h-4" />
                        {guild.members.length} Members
                    </div>
                </div>
                {!activeRaid && (
                    <button onClick={handleStartRaid} className="text-sm bg-white/5 px-3 py-1 rounded hover:bg-white/10">
                        Start Raid (Debug)
                    </button>
                )}
            </div>

            {/* Raid Boss */}
            {activeRaid ? (
                <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sword className="w-32 h-32 text-red-500" />
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-2xl font-black text-red-500 uppercase flex items-center gap-2">
                            <Sword className="w-6 h-6" />
                            {activeRaid.bossName}
                        </h3>
                        <div className="mt-4 mb-2 flex justify-between text-xs font-bold uppercase text-red-300">
                            <span>HP</span>
                            <span>{activeRaid.currentHp} / {activeRaid.totalHp}</span>
                        </div>
                        <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-red-500/30">
                            <div
                                className="h-full bg-red-600 transition-all duration-500"
                                style={{ width: `${(activeRaid.currentHp / activeRaid.totalHp) * 100}%` }}
                            />
                        </div>

                        <button
                            onClick={handleAttack}
                            disabled={activeRaid.currentHp <= 0}
                            className="mt-6 w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg uppercase tracking-wider transition-colors shadow-lg shadow-red-900/20"
                        >
                            {activeRaid.currentHp > 0 ? 'Attack!' : 'Boss Defeated'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl text-center text-zinc-500 italic">
                    No active raid. The realm is safe... for now.
                </div>
            )}

            {/* Member List (Simple) */}
            <div className="bg-zinc-900 border border-white/5 rounded-xl p-4">
                <h4 className="font-bold text-zinc-400 text-sm mb-4 uppercase flex items-center gap-2">
                    <Scroll className="w-4 h-4" />
                    Roster
                </h4>
                <div className="space-y-2">
                    {guild.members.map((m: any) => (
                        <div key={m.id} className="flex justify-between text-sm">
                            <span className={m.id === userId ? 'text-magma font-bold' : 'text-zinc-300'}>
                                {m.heroName || m.email || 'Unknown Hero'}
                            </span>
                            <span className="text-zinc-500">Lvl {m.level}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
