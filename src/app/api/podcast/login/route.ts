import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { PocketCastsClient } from "@/services/pocketcasts";

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, password } = await req.json();

    if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    try {
        const pcClient = new PocketCastsClient();
        const token = await pcClient.login(email, password);

        // Save token to user profile
        await prisma.user.update({
            where: { id: user.id },
            data: {
                pocketCastsToken: token,
                pocketCastsEnabled: true,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[Podcast Login Error]:", error.message);
        return NextResponse.json(
            { error: error.message || "Failed to log in to Pocket Casts" },
            { status: 500 }
        );
    }
}

export async function DELETE(_req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                pocketCastsToken: null,
                pocketCastsEnabled: false,
            },
        });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
    }
}
