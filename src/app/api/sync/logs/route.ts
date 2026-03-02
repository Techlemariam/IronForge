import { NextResponse } from "next/server";
import { LogService } from "@/services/server/LogService";
import { getOrCreateUserAction } from "@/actions/user-actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, payload } = body;

    // For demo/migration, ensure user exists
    const res = await getOrCreateUserAction({
      email: userId ? undefined : "default"
    });
    const user = res?.data?.user;

    if (!user) {
      return NextResponse.json({ error: "User or Session not found" }, { status: 404 });
    }

    switch (action) {
      case "SAVE_LOG":
        await LogService.saveExerciseLog(user.id, payload);
        return NextResponse.json({ success: true });
      case "SAVE_MEDITATION":
        await LogService.saveMeditationLog(user.id, payload);
        return NextResponse.json({ success: true });
      case "GET_HISTORY":
        const history = await LogService.getExerciseHistory(user.id);
        return NextResponse.json({ history });
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Log API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
