"use server";

import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";
import { getWellness } from "@/lib/intervals";
import prisma from "@/lib/prisma";
import { GeminiService } from "@/services/gemini";
import { AnalyticsService } from "@/services/analytics";
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

const GenerateProgramSchema = z.object({
  intent: z.string().min(1),
  daysPerWeek: z.number().int().min(1).max(7),
});

export const generateProgramAction = authActionClient
  .schema(GenerateProgramSchema)
  .action(async ({ parsedInput: { intent, daysPerWeek }, ctx: { userId } }) => {
    const sessionUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!sessionUser) throw new Error("User not found");

    let wellness = { id: "unknown", bodyBattery: 80, sleepScore: 80 };
    if (sessionUser.intervalsApiKey && sessionUser.intervalsAthleteId) {
      const today = new Date().toISOString().split("T")[0];
      const w = await getWellness(today, sessionUser.intervalsApiKey, sessionUser.intervalsAthleteId);
      if (w) wellness = w as any;
    }

    const [dbLogs, dbCardio] = await Promise.all([
      prisma.exerciseLog.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 20 }),
      prisma.cardioLog.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 10 }),
    ]);

    const history = dbLogs.map((log) => {
      const sets = (log.sets as any[]) || [];
      const bestE1rm = sets.length > 0 ? Math.max(...sets.map((s) => (s.weight || 0) * (1 + (s.reps || 0) / 30))) : 0;
      const avgRpe = sets.length > 0 ? sets.reduce((acc, s) => acc + (s.rpe || 7), 0) / sets.length : 7;
      return { date: log.date.toISOString(), exerciseId: log.exerciseId, e1rm: bestE1rm, rpe: avgRpe, isEpic: log.isPersonalRecord };
    });

    const activities = dbCardio.map((c) => ({
      icu_intensity: c.load,
      moving_time: c.duration,
      type: c.type,
      start_date_local: c.date.toISOString(),
    }));

    const ttb = AnalyticsService.calculateTTB(history as any, activities as any, wellness as any);

    const [capabilities, titan] = await Promise.all([
      EquipmentService.getUserCapabilities(userId),
      prisma.titan.findUnique({ where: { userId } }),
    ]);

    const injuries = titan?.isInjured ? ["General Fatigue/Injury"] : [];

    const plan = await GeminiService.generateWeeklyPlanAI(
      {
        heroName: sessionUser.heroName || "Titan",
        level: sessionUser.level,
        trainingPath: sessionUser.activePath || "WARDEN",
        equipment: capabilities,
        injuries,
      },
      { wellness: wellness as any, ttb, intent, daysPerWeek },
    );

    return { plan };
  });

export const saveProgramAction = authActionClient
  .schema(z.object({ plan: z.any() }))
  .action(async ({ parsedInput: { plan }, ctx: { userId } }) => {
    await prisma.weeklyPlan.create({
      data: { userId, weekStart: getNextMonday(), plan },
    });
    revalidatePath("/dashboard");
    return { saved: true };
  });
