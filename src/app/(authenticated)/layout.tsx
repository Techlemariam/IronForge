import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { QuickStatsHeader } from '@/components/layout/QuickStatsHeader';

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Auth Check
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    // Fetch User Data for Header
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
            level: true,
            totalExperience: true,
            gold: true,
        }
    });

    if (!dbUser) {
        redirect('/login');
    }

    // Calculate XP for next level (using same formula as progression service)
    const maxXP = 100 + (dbUser.level * 50);

    return (
        <>
            <QuickStatsHeader
                level={dbUser.level}
                currentXP={dbUser.totalExperience}
                maxXP={maxXP}
                gold={dbUser.gold}
            />
            {/* Add top padding to account for fixed header */}
            <div className="pt-16">
                {children}
            </div>
        </>
    );
}
