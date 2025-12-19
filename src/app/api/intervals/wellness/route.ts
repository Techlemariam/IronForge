import { NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = process.env.INTERVALS_API_KEY;
const USER_ID = process.env.INTERVALS_USER_ID;

export async function GET(request: Request) {
    if (!API_KEY || !USER_ID) {
        return NextResponse.json({ error: "Intervals credentials missing on server." }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const url = `https://intervals.icu/api/v1/athlete/${USER_ID}/wellness/${date}`;

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("Intervals Wellness Error:", error.message);
        // Intervals returns 404 if no wellness data exists for that day, which is valid.
        if (error.response?.status === 404) {
            return NextResponse.json({});
        }
        return NextResponse.json({ error: "Failed to fetch wellness data" }, { status: 500 });
    }
}
