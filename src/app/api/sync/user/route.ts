import { NextResponse } from 'next/server';
import { UserService } from '@/services/server/UserService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, userId, payload } = body;

        // TODO: proper auth
        const user = await UserService.getOrCreateUser(userId ? undefined : "default"); // Hack for demo

        switch (action) {
            case 'UPDATE_SETTINGS':
                await UserService.updateSettings(user.id, payload);
                return NextResponse.json({ success: true });
            case 'UPDATE_GOLD':
                await UserService.updateGold(user.id, payload);
                return NextResponse.json({ success: true });
            case 'UPDATE_EQUIPMENT':
                await UserService.updateEquipment(user.id, payload);
                return NextResponse.json({ success: true });
            case 'GET_USER':
                return NextResponse.json({ user });
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error("Sync API Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    // Simple verification endpoint
    return NextResponse.json({ status: "IronForge API Online" });
}
