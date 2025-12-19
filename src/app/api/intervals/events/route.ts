import { NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = process.env.INTERVALS_API_KEY;
const USER_ID = process.env.INTERVALS_USER_ID;

export async function GET(request: Request) {
    if (!API_KEY || !USER_ID) {
        return NextResponse.json({ error: "Intervals credentials missing on server." }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const oldest = searchParams.get('oldest');
    const newest = searchParams.get('newest');

    if (!oldest || !newest) {
        return NextResponse.json({ error: "Missing date range parameters (oldest, newest)" }, { status: 400 });
    }

    const url = `https://intervals.icu/api/v1/athlete/${USER_ID}/events?oldest=${oldest}&newest=${newest}`;

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("Intervals Events Error:", error.message);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}
