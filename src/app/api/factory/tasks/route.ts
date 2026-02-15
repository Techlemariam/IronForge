import { NextResponse } from 'next/server';
import { addFactoryTask } from '@/actions/factory';

export async function POST(request: Request) {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;

    if (!secret || authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { description, source, metadata } = body;

        if (!description) {
            return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        }

        const result = await addFactoryTask(description, source || 'DISCORD', metadata);
        return NextResponse.json(result);
    } catch (error) {
        console.error('API Error in /api/factory/tasks:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
