import { NextResponse } from 'next/server';
import axios from 'axios';

// Get environment variables directly (server-side safe)
const API_KEY = process.env.INTERVALS_API_KEY;
const USER_ID = process.env.INTERVALS_USER_ID;

export async function GET(request: Request) {
    if (!API_KEY || !USER_ID) {
        return NextResponse.json({ error: "Oracle Uplink Failed. API keys missing." }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const today = new Date().toISOString().split('T')[0];
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);

    const oldest = searchParams.get('oldest') || threeMonthsAgo.toISOString().split('T')[0];
    const newest = searchParams.get('newest') || today;

    const url = `https://intervals.icu/api/v1/athlete/${USER_ID}/activities?oldest=${oldest}&newest=${newest}&include=tss,duration,type,zone_stats`;

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("Intervals History Error:", error.message);
        return NextResponse.json({ error: "Could not retrieve historical cardio data." }, { status: 500 });
    }
}
