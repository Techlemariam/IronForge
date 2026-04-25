import { getTerritoriesAction } from '@/actions/territories';
import { Card } from '@/components/ui/card';
import { TerritoryMap } from '@/features/territories/components/TerritoryMap';
import { prisma } from '@/lib/prisma';
import { Map as MapIcon, Shield, Sword, Trophy } from 'lucide-react';
import { Suspense } from 'react';

export const metadata = {
  title: 'Strategic Map | IronForge',
  description: 'Manage your guild territories and plan your next conquest.',
};

export default async function TerritoriesPage() {
  // 1. Fetch Territories
  const territoryResult = await getTerritoriesAction();
  const territories = territoryResult?.success && territoryResult.data ? territoryResult.data : [];

  // 2. Fetch User/Guild (Mocking for now, would use auth session)
  // In a real app, we'd get this from the session
  const userId = 'current-user-id';
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      guild: {
        include: {
          leader: true,
          territories: true,
        },
      },
    },
  });

  const userGuildId = user?.guildId || undefined;
  const isLeader = user?.guild?.leaderId === userId;

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-100 uppercase italic flex items-center gap-3">
            <MapIcon className="text-cyan-500 w-10 h-10" />
            TERRITORY CONTROL
          </h1>
          <p className="text-slate-500 font-medium tracking-widest uppercase text-xs mt-1">
            Season 2: The Conquest of IronForge
          </p>
        </div>

        <div className="flex gap-4">
          <Card className="bg-slate-900 border-slate-800 p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Controlled</p>
              <p className="text-xl font-black text-slate-100">
                {user?.guild?.territories?.length || 0}/3
              </p>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <Sword className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase">Active Target</p>
              <p className="text-xl font-black text-slate-100 truncate max-w-[120px]">
                {user?.guild?.targetTerritoryId ? 'LOCKED' : 'NONE'}
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-900 border-slate-800 p-6 overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />
            <h3 className="text-sm font-black text-slate-100 uppercase mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-cyan-400" />
              THE RULES OF WAR
            </h3>
            <ul className="space-y-4 text-xs text-slate-400 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-cyan-500 font-bold">01.</span>
                Choose a target territory to focus your guild's training volume.
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-500 font-bold">02.</span>
                Top guild by XP earned in a sector at the end of the week wins control.
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-500 font-bold">03.</span>
                Max 3 territories per guild. Capturing a 4th forfeits your oldest node.
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-500 font-bold">04.</span>
                Resolution occurs every Sunday at 23:59 UTC.
              </li>
            </ul>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-6">
            <h3 className="text-sm font-black text-slate-100 uppercase mb-4">YOUR GUILD</h3>
            {user?.guild ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-slate-400">
                    {user.guild.tag}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-100">{user.guild.name}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase">
                      Level {user.guild.level}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">You are not currently in a guild.</p>
            )}
          </Card>
        </div>

        {/* Map View */}
        <div className="lg:col-span-3">
          <Suspense
            fallback={<div className="w-full h-[700px] bg-slate-900 animate-pulse rounded-3xl" />}
          >
            <TerritoryMap territories={territories} userGuildId={userGuildId} isLeader={isLeader} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
