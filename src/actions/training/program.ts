"use server";

import { getWellness } from "@/lib/intervals";
import prisma from "@/lib/prisma";
import { GeminiService } from "@/services/gemini";
import { AnalyticsService } from "@/services/analytics";
import { TTBIndices } from "@/types";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function generateProgramAction(preferences: {
  intent: string;
  daysPerWeek: number;
}) {
  // 1. Auth Check
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const sessionUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });
  if (!sessionUser) throw new Error("User not found");

  // 2. Fetch Context
  let wellness = { id: "unknown", bodyBattery: 80, sleepScore: 80 };
  if (sessionUser.intervalsApiKey && sessionUser.intervalsAthleteId) {
    const today = new Date().toISOString().split("T")[0];
    const w = await getWellness(
      today,
      sessionUser.intervalsApiKey,
      sessionUser.intervalsAthleteId,
    );
    if (w) wellness = w as any;
  }

  // Mock TTB for now, or fetch real analysis
  const ttb: TTBIndices = {
    strength: 50,
    endurance: 50,
    wellness: 50,
    lowest: "strength",
  };

  // 3. Call Gemini
  const plan = await GeminiService.generateWeeklyPlanAI(
    {
      heroName: sessionUser.heroName || "Titan",
      level: sessionUser.level,
      trainingPath: sessionUser.activePath || "HYBRID_WARDEN",
      equipment: ["Barbell", "Dumbbells", "Pullup Bar"], // TODO: Fetch from DB
      injuries: [], // TODO: Fetch
    },
    {
      wellness: wellness as any,
      ttb,
      intent: preferences.intent,
      daysPerWeek: preferences.daysPerWeek,
    },
  );

  return { success: true, plan };
}

export async function saveProgramAction(plan: any) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");

  const sessionUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!sessionUser) throw new Error("User not found");

  // Persist to DB
  await prisma.weeklyPlan.create({
    data: {
      userId: sessionUser.id,
      weekStart: new Date(), // TODO: Calculate next Monday
      plan: plan,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
