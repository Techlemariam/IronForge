import { NextResponse } from 'next/server';
import axios from 'axios';
import { getHevyWorkouts } from '@/lib/hevy';

export async function GET(request: Request) {
    const hevyApiKey = request.headers.get('x-hevy-api-key');
    if (!hevyApiKey) {
        return NextResponse.json({ error: "Hevy API Key is required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    try {
        const data = await getHevyWorkouts(hevyApiKey, page, pageSize);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Failed to fetch Hevy workouts:", error.message);
        return NextResponse.json({
            error: "Could not analyze past battles.",
            message: error.message
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const hevyApiKey = request.headers.get('x-hevy-api-key');
    if (!hevyApiKey) {
        return NextResponse.json({ error: "Hevy API Key is required." }, { status: 401 });
    }

    try {
        const body = await request.json();
        const response = await axios.post('https://api.hevyapp.com/v1/workouts', body, {
            headers: {
                'api-key': hevyApiKey,
                'Content-Type': 'application/json'
            }
        });
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("Hevy Save Error:", error.response?.data || error.message);
        return NextResponse.json({
            error: "Failed to save to Archive.",
            details: error.response?.data
        }, { status: error.response?.status || 500 });
    }
}
