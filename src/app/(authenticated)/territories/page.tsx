import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { TerritoryMap } from "@/features/guild/TerritoryMap";
import { Shield, Sword, Map as MapIcon, Info } from "lucide-react";

export default async function TerritoriesPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
            id: true,
            guildId: true,
        },
    });

    if (!dbUser) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500">
                Authenticating Hero...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black pb-20">
            {/* Cinematic Header */}
            <div className="relative border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-magma/10 border border-magma/20 rounded-2xl shadow-[0_0_30px_rgba(255,69,0,0.1)]">
                            <MapIcon className="w-8 h-8 text-magma" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                                Territories
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-magma animate-pulse" />
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
                                    Guild Conquest Active • Season 2
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-zinc-900/50 border border-white/5 rounded-xl px-5 py-3 flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none mb-1">Guild Status</div>
                                <div className="text-sm font-bold text-white leading-none">
                                    {dbUser.guildId ? "Operational" : "Mercenary (No Guild)"}
                                </div>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${dbUser.guildId ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-700'}`} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
                {/* Interaction Layer */}
                <section>
                    <TerritoryMap userId={dbUser.id} guildId={dbUser.guildId || undefined} />
                </section>

                {/* Intelligence / Rules */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Shield className="w-32 h-32 text-white" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-500" />
                            Claiming
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Unclaimed territories can be captured instantly by any guild. Control grants immediate resource bonuses to all members.
                        </p>
                    </div>

                    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Sword className="w-32 h-32 text-white" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase mb-2 flex items-center gap-2">
                            <Sword className="w-4 h-4 text-red-500" />
                            Contesting
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Issuing a challenge starts a 7-day siege. The guild with the highest accumulated training volume (kg) at the end of the week wins control.
                        </p>
                    </div>

                    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-all">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Info className="w-32 h-32 text-white" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-500" />
                            Volume Matters
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Every rep counts. Volume from Strava, Hevy, and Apple Watch syncs directly to active contests your guild is involved in.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
