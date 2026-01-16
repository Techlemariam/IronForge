import { NextResponse } from "next/server";
import { UserService } from "@/services/server/UserService";
import { getSession } from "@/lib/auth";
import { SyncRequestBodySchema } from "./schemas";


export async function POST(request: Request) {
  try {
    // 1. Auth Guard
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Input Validation (Zero-Trust)
    const json = await request.json();
    const result = SyncRequestBodySchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { action, payload } = result.data;

    // 3. User Existence Check
    // Optimization: We could rely on session.user.id directly for updates, 
    // ensuring users can only modify their own data.
    const userId = session.user.id;
    const user = await UserService.getUser(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Action Dispatch
    switch (action) {
      case "UPDATE_SETTINGS":
        await UserService.updateSettings(userId, payload);
        return NextResponse.json({ success: true });

      case "UPDATE_GOLD":
        // Gold sync is sensitive. Ideally we'd have server-side validation logic here 
        // to prevent simple "I have 999999 gold" hacks, but for pure sync:
        await UserService.updateGold(userId, payload);
        return NextResponse.json({ success: true });

      case "UPDATE_EQUIPMENT":
        await UserService.updateEquipment(userId, payload);
        return NextResponse.json({ success: true });

      case "GET_USER":
        return NextResponse.json({ user });

      default:
        // Zod discriminated union should prevent this, but safe fallback
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Sync API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  // Simple verification endpoint
  return NextResponse.json({ status: "IronForge API Online" });
}
