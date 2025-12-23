import { NextResponse } from 'next/server';
import { getWellness } from '@/lib/intervals';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { intervalsApiKey: true, intervalsAthleteId: true }
    });

    if (!dbUser?.intervalsApiKey || !dbUser?.intervalsAthleteId) {
        return NextResponse.json({ error: "Intervals.icu not connected" }, { status: 400 });
    }

    try {
        const data = await getWellness(date, dbUser.intervalsApiKey, dbUser.intervalsAthleteId);
        return NextResponse.json(data || {});
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch wellness data" }, { status: 500 });
    }
}
