"use server";

import { getWellness } from "@/lib/intervals";
import prisma from "@/lib/prisma";
import { GeminiService } from "@/services/gemini";
import { AnalyticsService } from "@/services/analytics";
import { TTBIndices } from "@/types";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { EquipmentService } from "@/services/game/EquipmentService";

function getNextMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() + (day === 0 ? 1 : 8 - day);
  const nextMonday = new Date(d.setDate(diff));
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}

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

  // 3. Fetch real TTB Analysis
  const [dbLogs, dbCardio] = await Promise.all([
    prisma.exerciseLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      take: 20
    }),
    prisma.cardioLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      take: 10
    })
  ]);

  // Map Prisma logs to Analytics format
  const history = dbLogs.map(log => {
    const sets = (log.sets as any[]) || [];
    const bestE1rm = sets.length > 0 ? Math.max(...sets.map(s => (s.weight || 0) * (1 + (s.reps || 0) / 30))) : 0;
    const avgRpe = sets.length > 0 ? sets.reduce((acc, s) => acc + (s.rpe || 7), 0) / sets.length : 7;
    return {
      date: log.date.toISOString(),
      exerciseId: log.exerciseId,
      e1rm: bestE1rm,
      rpe: avgRpe,
      isEpic: log.isPersonalRecord
    };
  });

  const activities = dbCardio.map(c => ({
    icu_intensity: c.load, // Using load as intensity proxy for simple TTB
    moving_time: c.duration,
    type: c.type,
    start_date_local: c.date.toISOString()
  }));

  const ttb = AnalyticsService.calculateTTB(history as any, activities as any, wellness as any);

  // 4. Fetch Capabilities & Status
  const [capabilities, titan] = await Promise.all([
    EquipmentService.getUserCapabilities(session.user.id),
    prisma.titan.findUnique({ where: { userId: session.user.id } })
  ]);

  const injuries = titan?.isInjured ? ["General Fatigue/Injury"] : [];

  // 5. Call Gemini
  const plan = await GeminiService.generateWeeklyPlanAI(
    {
      heroName: sessionUser.heroName || "Titan",
      level: sessionUser.level,
      trainingPath: sessionUser.activePath || "WARDEN",
      equipment: capabilities,
      injuries: injuries,
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
      weekStart: getNextMonday(),
      plan: plan,
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
