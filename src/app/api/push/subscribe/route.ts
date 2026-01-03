import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { subscription } = await req.json();

        if (!subscription?.endpoint) {
            return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
        }

        // Upsert the subscription
        await prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
                userId: session.user.id,
                keys: subscription.keys,
                updatedAt: new Date(),
            },
            create: {
                userId: session.user.id,
                endpoint: subscription.endpoint,
                keys: subscription.keys,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Push Subscribe] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
