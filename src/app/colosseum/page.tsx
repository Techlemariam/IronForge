import React from 'react';
import prisma from '../../lib/prisma';
import Leaderboard from '../../components/colosseum/Leaderboard';
import { Swords, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ColosseumPage() {
    // Fetch Leaderboard Data from Real DB
    const leaderboardData = await prisma.pvpProfile.findMany({
        orderBy: { rankScore: 'desc' },
        take: 20,
        include: { user: { select: { heroName: true, level: true } } }
    });

    const formattedPlayers = leaderboardData.map((p: any) => ({
        userId: p.userId,
        heroName: p.user.heroName || 'Anonymous',
        rankScore: p.rankScore,
        highestWilksScore: p.highestWilksScore,
        wins: p.wins,
        level: p.user.level
    }));

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-zinc-800 pb-6">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-[#ffd700] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
                        The Iron Colosseum
                    </h1>
                    <p className="text-zinc-500 font-serif italic mt-2 max-w-lg">
                        "Here, titles are earned in sweat and iron. Prove your strength against the Titans of the Forge."
                    </p>
                </div>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <div className="text-center p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                        <div className="text-2xl font-bold text-white"><Users className="w-6 h-6 inline mr-2 text-zinc-500" /> {formattedPlayers.length}</div>
                        <div className="text-[10px] uppercase tracking-widest text-zinc-600">Gladiators</div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: ACTIONS */}
                <div className="space-y-6">

                    {/* Find Match Card */}
                    <div className="bg-gradient-to-br from-red-950 to-zinc-950 border border-red-900 rounded-xl p-6 shadow-glow-blood hover:scale-[1.02] transition-transform cursor-pointer group">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-4 group-hover:animate-pulse shadow-lg shadow-red-600/50">
                            <Swords className="w-6 h-6 text-black" />
                        </div>
                        <h3 className="text-2xl font-black uppercase italic text-white mb-2">Find Match</h3>
                        <p className="text-red-200 text-sm mb-4">
                            Challenge a rival to an asychronous duel based on Wilks Score.
                        </p>
                        <div className="w-full py-3 bg-red-600 text-black font-black uppercase text-center rounded tracking-widest group-hover:bg-white transition-colors">
                            Enter Arena
                        </div>
                    </div>

                    {/* Weekly Boss Raid */}
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 relative overflow-hidden grayscale hover:grayscale-0 transition-all">
                        <div className="absolute top-0 right-0 p-2 bg-zinc-800 text-[10px] font-bold uppercase rounded-bl text-zinc-400">Locked</div>
                        <h3 className="text-xl font-bold text-zinc-300 mb-2">Weekly Raid Boss</h3>
                        <p className="text-zinc-500 text-xs">Target: 50,000kg Total Volume</p>
                    </div>

                </div>

                {/* RIGHT COLUMN: LEADERBOARD */}
                <div className="lg:col-span-2">
                    <Leaderboard players={formattedPlayers} />
                </div>

            </div>
        </div>
    );
}
