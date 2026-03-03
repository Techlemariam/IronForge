import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_TOPICS = [
    "HANDOFF",
    "ALERT",
    "REQUEST",
    "REVIEW",
    "INFO",
    "BLOCKED",
] as const;

function isAuthorized(request: Request): boolean {
    const auth = request.headers.get("authorization");
    return auth === `Bearer ${process.env.CRON_SECRET}`;
}

// POST /api/agent/message — Send a message between agents
export async function POST(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
        from: senderRole,
        to: receiverRole,
        topic,
        content,
        taskId = null,
        prNumber = null,
    } = body as Record<string, unknown>;

    // Basic validation
    if (!senderRole || !receiverRole || !topic || !content) {
        return NextResponse.json(
            { error: "Missing required fields: from, to, topic, content" },
            { status: 400 },
        );
    }

    if (!ALLOWED_TOPICS.includes(topic as (typeof ALLOWED_TOPICS)[number])) {
        return NextResponse.json(
            { error: `Invalid topic. Allowed: ${ALLOWED_TOPICS.join(", ")}` },
            { status: 400 },
        );
    }

    try {
        const message = await prisma.agentMessage.create({
            data: {
                senderRole: String(senderRole),
                receiverRole: String(receiverRole),
                topic: String(topic),
                content: String(content),
                status: "UNREAD",
                taskId: taskId ? String(taskId) : null,
                prNumber: prNumber ? Number(prNumber) : null,
            },
        });

        return NextResponse.json(
            {
                success: true,
                id: message.id,
                from: message.senderRole,
                to: message.receiverRole,
                topic: message.topic,
                createdAt: message.createdAt,
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("[agent/message] POST error:", error);
        return NextResponse.json(
            { error: "Failed to create message" },
            { status: 500 },
        );
    }
}

// GET /api/agent/message?to=@coder&status=UNREAD&limit=20
export async function GET(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const to = searchParams.get("to");
    const from = searchParams.get("from");
    const status = searchParams.get("status");
    const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 100);

    try {
        const messages = await prisma.agentMessage.findMany({
            where: {
                ...(to ? { receiverRole: to } : {}),
                ...(from ? { senderRole: from } : {}),
                ...(status ? { status } : {}),
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            select: {
                id: true,
                senderRole: true,
                receiverRole: true,
                topic: true,
                content: true,
                status: true,
                taskId: true,
                prNumber: true,
                createdAt: true,
                readAt: true,
            },
        });

        return NextResponse.json({ success: true, count: messages.length, messages });
    } catch (error) {
        console.error("[agent/message] GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch messages" },
            { status: 500 },
        );
    }
}

// PATCH /api/agent/message — Mark message(s) as READ
export async function PATCH(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { ids } = body as { ids?: string[] };
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
            { error: "Provide ids: string[] to mark as read" },
            { status: 400 },
        );
    }

    try {
        const result = await prisma.agentMessage.updateMany({
            where: { id: { in: ids }, status: "UNREAD" },
            data: { status: "READ", readAt: new Date() },
        });

        return NextResponse.json({ success: true, updated: result.count });
    } catch (error) {
        console.error("[agent/message] PATCH error:", error);
        return NextResponse.json(
            { error: "Failed to update messages" },
            { status: 500 },
        );
    }
}
