import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import IntegrationsPanel from '@/components/settings/IntegrationsPanel';
import MigrationTool from '@/components/settings/MigrationTool';
import { Shield } from 'lucide-react';

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id }
    });

    if (!dbUser) redirect('/login');

    const hevyConnected = !!dbUser.hevyApiKey;
    const intervalsConnected = !!(dbUser.intervalsApiKey && dbUser.intervalsAthleteId);
    const stravaConnected = !!dbUser.stravaAccessToken;
    const faction = dbUser.faction || 'HORDE';

    return (
        <div className="min-h-screen bg-forge-900 text-white p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">

                <header className="flex items-center gap-4 mb-8">
                    <Shield className="w-10 h-10 text-magma" />
                    <div>
                        <h1 className="text-3xl font-heading text-magma uppercase tracking-widest">System Configuration</h1>
                        <p className="text-forge-300">Manage your uplink to external archives.</p>
                    </div>
                </header>

                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 shadow-xl">
                    <IntegrationsPanel
                        userId={user.id}
                        hevyConnected={hevyConnected}
                        intervalsConnected={intervalsConnected}
                        stravaConnected={stravaConnected}
                        initialFaction={faction}
                        onIntegrationChanged={() => {
                            // Since this is a server component page, we can't force reload easily from here without client logic.
                            // But IntegrationsPanel is likely client.
                            // We rely on it to handle its own state or refresh.
                        }}
                    />
                </div>

                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-4">Data Migration</h2>
                    <MigrationTool />
                </div>

                <div className="text-center">
                    <Link href="/" className="text-zinc-500 hover:text-white transition-colors underline">Return to Citadel</Link>
                </div>
            </div>
        </div>
    );
}
