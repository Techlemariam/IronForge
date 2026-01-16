import QuickLogSession from "@/components/logger/QuickLogSession";
import { Metadata } from "next";

import { getActiveCombatSession } from "@/actions/combat/core";

export const metadata: Metadata = {
    title: "Iron Logger | IronForge",
    description: "Quickly log your workouts.",
};

export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { EquipmentService } from "@/services/game/EquipmentService";

// ...

export default async function LoggerPage() {
    // 1. Get User
    const user = await prisma.user.findFirst(); // Replace with Auth
    if (!user) return <div>Auth Error</div>;

    // 2. Data Fetching
    const { session, boss } = await getActiveCombatSession();
    const capabilities = await EquipmentService.getUserCapabilities(user.id);

    return (
        <div className="min-h-screen bg-black/90 pb-20">
            {/* ... Header ... */}

            <main className="container max-w-lg mx-auto p-4 pt-8">
                <QuickLogSession
                    activeCombatSession={session}
                    boss={boss}
                    capabilities={capabilities}
                />
            </main>
        </div>
    );
}
