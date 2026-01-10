"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { GoalPriorityEngine } from "@/services/GoalPriorityEngine";
import { WardensManifest } from "@/types/goals"; // Ensure you have this type or equivalent

export async function getTitanChoiceAction(userId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Auth check
    if (!user || user.id !== userId) return null;

    // 1. Fetch User Goal Manifest
    // Assuming we define this in User or separate table. For now, mock fallback or minimal manifest.
    // Real implementation: Fetch WardensManifest from DB
    const manifest: WardensManifest = {
        userId: userId,
        phase: "BALANCED",
        phaseWeek: 1,
        goals: [{ goal: "STRENGTH", weight: 1.0 }],
        phaseStartDate: new Date(),
        autoRotate: true,
        consents: { healthData: true, leaderboard: true }

    };

    // 2. Fetch System Metrics (BioBuff)
    // Real imp: fetch from daily_metrics
    const metrics: any = {
        ctl: 50,
        atl: 40,
        tsb: 10,
        sleepScore: 80,
        soreness: 3,
        mood: "FOCUSED",
        acwr: 1.1
    };

    // 3. Select Phase (Dynamic)
    const phase = GoalPriorityEngine.selectPhase(manifest, metrics);

    // 4. Budget (Standard 60 min for quick play)
    const budget = { cns: 50, muscular: 50, metabolic: 50, timeMin: 60 };

    // 5. Select Workout
    const recommendations = GoalPriorityEngine.selectWorkout(manifest, phase, budget);

    if (recommendations.length === 0) return null;

    return {
        workout: recommendations[0],
        reason: `Aligned with ${phase.replace('_', ' ')} Phase`
    };
}
