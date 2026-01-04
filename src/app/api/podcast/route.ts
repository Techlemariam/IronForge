import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { PocketCastsClient } from "@/services/pocketcasts";

async function getClient(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { pocketCastsToken: true }
    });

    if (!user?.pocketCastsToken) {
        throw new Error("Pocket Casts not connected");
    }

    return new PocketCastsClient(user.pocketCastsToken);
}

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "subscriptions";

    try {
        const client = await getClient(user.id);
        let data;

        switch (type) {
            case "subscriptions":
                data = await client.getSubscriptions();
                break;
            case "queue":
                data = await client.getQueue();
                break;
            case "in-progress":
                data = await client.getInProgress();
                break;
            case "episodes":
                const uuid = searchParams.get("uuid");
                if (!uuid) throw new Error("Podcast UUID required");
                const page = parseInt(searchParams.get("page") || "1");
                data = await client.getEpisodes(uuid, page);
                break;
            default:
                return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        if (error.message.includes("401")) {
            return NextResponse.json({ error: "Token expired" }, { status: 401 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { episodeId, podcastId, position, status } = body;

    try {
        const client = await getClient(user.id);
        await client.updateProgress(episodeId, podcastId, position, status);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
