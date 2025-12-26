import React from 'react';
// Force Rebuild
import { createClient } from '@/utils/supabase/server';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getHevyTemplatesAction, getHevyRoutinesAction, getHevyWorkoutHistoryAction } from '@/actions/hevy';
import { runFullAudit } from '@/services/auditorOrchestrator';
import { getWellnessAction, getActivitiesAction, getEventsAction } from '@/actions/intervals';
import { AnalyticsService } from '@/services/analytics';
import { ProgressionService } from '@/services/progression';
import { OracleService } from '@/services/oracle';
import { RecoveryService } from '@/services/bio/RecoveryService';
import DashboardClient from '@/features/dashboard/DashboardClient';

// Types
import { AuditReport } from '@/types/auditor';
import { WeaknessAudit, IntervalsWellness, TTBIndices, TitanLoadCalculation, IntervalsActivity, IntervalsEvent } from '@/types';
import { HevyExerciseTemplate, HevyRoutine, HevyWorkout } from '@/types/hevy';

export default async function Page() {
    // 0. Auth Check
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    // 0b. Fetch DB User & Config
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { achievements: true }
    });

    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // --- DEMO MODE CHECK ---
    const cookieStore = await cookies();
    const isDemoMode = cookieStore.has('ironforge_demo_mode');

    // --- INTEGRATION CREDENTIALS ---
    const hevyApiKey = dbUser?.hevyApiKey || process.env.HEVY_API_KEY;
    const intervalsApiKey = dbUser?.intervalsApiKey;
    const intervalsAthleteId = dbUser?.intervalsAthleteId;

    // --- DATA CONTAINERS ---
    let hevyRoutines: HevyRoutine[] = [];
    let hevyTemplates: HevyExerciseTemplate[] = [];
    let history: HevyWorkout[] = [];

    let wellness: IntervalsWellness | null = null;
    let activities: IntervalsActivity[] = [];
    let events: IntervalsEvent[] = [];

    // --- DATA FETCHING ---
    if (isDemoMode) {
        console.log("🧪 DEMO MODE ENABLED: Loading Mock Data");
        const { MOCK_WELLNESS, MOCK_ACTIVITIES, MOCK_EVENTS, MOCK_HEVY_WORKOUTS } = await import('@/lib/mock-data');

        wellness = MOCK_WELLNESS;
        activities = MOCK_ACTIVITIES;
        events = MOCK_EVENTS;
        history = MOCK_HEVY_WORKOUTS;

        // Mock Hevy Templates/Routines can be empty or added later
        hevyRoutines = [];
        hevyTemplates = [];

    } else {
        // REAL DATA
        // 1. Hevy
        if (hevyApiKey) {
            try {
                const routinesRes = await getHevyRoutinesAction(hevyApiKey);
                hevyRoutines = routinesRes.routines;

                const templatesRes = await getHevyTemplatesAction(hevyApiKey);
                hevyTemplates = templatesRes.exercise_templates;

                const historyRes = await getHevyWorkoutHistoryAction(hevyApiKey, 30);
                history = historyRes.workouts;
            } catch (e) {
                console.error("Failed to load Hevy data", e);
            }
        }

        // 2. Intervals
        if (intervalsApiKey && intervalsAthleteId) {
            try {
                const today = new Date().toISOString().split('T')[0];
                const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                // Note: The actions might not require keys if they use the session user, 
                // but our previous check confirms keys exist on the user.
                // The actions `getWellnessAction` etc internally fetch keys from DB user based on session.
                // So we just pass dates.

                const [w, acts, evts] = await Promise.all([
                    getWellnessAction(today),
                    getActivitiesAction(lastMonth, today),
                    getEventsAction(today, nextWeek)
                ]);

                wellness = w;
                activities = acts;
                events = evts;

            } catch (e) {
                console.error("Failed to load Intervals data", e);
            }
        }
    }

    // --- PROCESSING & ANALYSIS ---

    // 1. TTB & Wellness Defaults
    if (!wellness || !wellness.id) {
        wellness = { ctl: 0, ramp_rate: 0, bodyBattery: 0, sleepScore: 0 } as IntervalsWellness;
    }

    const fakeTTB: TTBIndices = { strength: 75, endurance: 60, wellness: wellness.sleepScore || 50, lowest: 'endurance' };

    // 2. Audit
    let report: AuditReport | null = null;
    try {
        // Ensure history is passed. If demo mode, history is mock data.
        if (history.length > 0) {
            report = await runFullAudit(false, hevyApiKey || 'demo', baseUrl, history);
        }
    } catch (e) {
        console.error("Warning: Failed to run auditor", e);
    }

    // 3. Activity Analysis (Titan Load)
    let titanAnalysis: TitanLoadCalculation | null = null;
    if (activities.length > 0) {
        const sorted = activities.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
        const latest = sorted[0];
        const durMins = latest.moving_time ? latest.moving_time / 60 : 60;
        const intensity = latest.icu_intensity ? latest.icu_intensity / 100 : 0.5;
        const estimatedVol = durMins * 100;
        titanAnalysis = AnalyticsService.calculateTitanLoad(estimatedVol, intensity, durMins);
    }

    // 4. Progression & Oracle
    const progression = await ProgressionService.getProgressionState(user.id);
    if (!progression) {
        // Should ideally create one if missing
        // throw new Error("Could not load progression"); 
    }

    const recoveryAnalysis = await RecoveryService.analyzeRecovery(user.id);

    // Cast to any to bypass stale Prisma types in IDE
    const activePath = ((dbUser as any)?.activePath as import('@/types/training').TrainingPath) || 'HYBRID_WARDEN';

    const oracleRec = await OracleService.consult(
        wellness,
        fakeTTB,
        [],
        report,
        titanAnalysis,
        recoveryAnalysis,
        activePath
    );

    const todaysLoad = titanAnalysis ? titanAnalysis.titanLoad : 0;
    const realForecast = AnalyticsService.calculateTSBForecast(wellness, [todaysLoad]);

    // 5. Weekly Mastery Calculation
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyStrengthSets = await prisma.exerciseLog.count({
        where: {
            userId: user.id,
            date: { gte: sevenDaysAgo }
        }
    });

    const weeklyMobilitySessions = await prisma.meditationLog.count({
        where: {
            userId: user.id,
            date: { gte: sevenDaysAgo }
        }
    });

    const weeklyCardioTss = activities
        .filter(a => {
            const dateStr = (a as any).start_date_local;
            return dateStr && new Date(dateStr) >= sevenDaysAgo;
        })
        .reduce((sum, a) => sum + ((a as any).training_load || 0), 0);

    const weeklyMastery = {
        strengthSets: weeklyStrengthSets,
        cardioTss: Math.round(weeklyCardioTss),
        mobilitySessions: weeklyMobilitySessions,
        mobilityLevel: ((dbUser as any)?.mobilityLevel) || 'I',
        recoveryLevel: ((dbUser as any)?.recoveryLevel) || 'I'
    };

    // 6. Initial Data Construction
    const initialData = {
        wellness,
        activities,
        events,
        ttb: fakeTTB,
        recommendation: oracleRec,
        auditReport: report,
        forecast: realForecast,
        titanAnalysis,
        activePath,
        weeklyMastery
        // We can add history here if needed directly
    };

    const hasCompletedOnboarding = !!(dbUser as any)?.hasCompletedOnboarding;

    return (
        <DashboardClient
            initialData={initialData as any}
            userData={dbUser as any} // Cast to UI User type
            dbUser={dbUser as any}
            isMobile={false} // Would need UA check
            hevyTemplates={hevyTemplates}
            hevyRoutines={hevyRoutines}
            intervalsConnected={!!(dbUser?.intervalsApiKey && dbUser?.intervalsAthleteId)}
            stravaConnected={!!(dbUser as any)?.stravaAccessToken}
            faction={(dbUser as any)?.faction || 'HORDE'}
            hasCompletedOnboarding={hasCompletedOnboarding}
            isDemoMode={isDemoMode}
        />
    );
}
