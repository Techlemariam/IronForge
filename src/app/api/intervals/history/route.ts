import { NextResponse } from 'next/server';
import { getActivities } from '@/lib/intervals';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const today = new Date().toISOString().split('T')[0];
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);

    const oldest = searchParams.get('oldest') || threeMonthsAgo.toISOString().split('T')[0];
    const newest = searchParams.get('newest') || today;

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
        const data = await getActivities(oldest, newest, dbUser.intervalsApiKey, dbUser.intervalsAthleteId);
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: "Could not retrieve historical cardio data." }, { status: 500 });
    }
}
