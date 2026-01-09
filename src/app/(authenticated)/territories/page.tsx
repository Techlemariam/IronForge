import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TerritoryMap } from "@/features/territory/components/TerritoryMap";
import { getTerritoryMapAction } from "@/actions/territory";

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
            city: true,
        },
    });

    if (!dbUser) {
        return <div>User not found</div>;
    }

    // Fetch territory map state
    const mapResult = await getTerritoryMapAction();

    if (!mapResult.success || !mapResult.data) {
        return (
            <div className="min-h-screen bg-forge-900 flex items-center justify-center">
                <div className="text-white text-center">
                    <h1 className="text-2xl font-bold mb-4">Territory Map Unavailable</h1>
                    <p className="text-zinc-400">Failed to load territory data.</p>
                </div>
            </div>
        );
    }

    // Transform data for TerritoryMap component
    const tiles = mapResult.data.territories.map((t) => ({
        id: t.id,
        lat: t.coordY, // Using coordY as latitude
        lng: t.coordX, // Using coordX as longitude
        state: (t.controlledBy === dbUser.guildId
            ? "OWNED"
            : t.controlledBy
                ? "HOSTILE"
                : "NEUTRAL") as "OWNED" | "HOSTILE" | "NEUTRAL",
        controlPoints: t.influencePoints || 0,
        ownerName: t.controlledByName || undefined,
    }));

    const homeLocation = dbUser.city
        ? { lat: 59.3293, lng: 18.0686 } // Default to Stockholm, should be city-based
        : null;

    return (
        <div className="min-h-screen bg-forge-900 bg-noise pb-20">
            {/* Header */}
            <div className="bg-zinc-950 border-b border-white/5 p-6 sticky top-0 z-30 backdrop-blur-md bg-opacity-80">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-white tracking-widest uppercase flex items-center gap-2">
                        🗺️ Guild Territories
                    </h1>
                    <p className="text-sm text-forge-muted mt-2">
                        Conquer regions through training volume. Control grants bonuses to your guild.
                    </p>
                </div>
            </div>

            {/* Map */}
            <div className="max-w-6xl mx-auto p-6">
                <TerritoryMap
                    tiles={tiles}
                    stats={{}}
                    homeLocation={homeLocation}
                />

                {/* Guild Status */}
                {dbUser.guildId ? (
                    <div className="mt-6 bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-2">Your Guild&apos;s Influence</h2>
                        <p className="text-zinc-400 text-sm">
                            Complete workouts to increase your guild&apos;s control over territories.
                            Each territory provides unique bonuses.
                        </p>
                    </div>
                ) : (
                    <div className="mt-6 bg-amber-900/20 border border-amber-500/30 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-amber-400 mb-2">Join a Guild</h2>
                        <p className="text-amber-200/80 text-sm">
                            You must be part of a guild to participate in territory conquest.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
