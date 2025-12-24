import React from 'react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { getHevyTemplatesAction } from '@/actions/hevy';
import { runFullAudit } from '@/services/auditorOrchestrator';
import { getWellness, getEvents, getActivities } from '@/lib/intervals';
import { AnalyticsService } from '@/services/analytics';
import { ProgressionService } from '@/services/progression';
import { OracleService } from '@/services/oracle';
import { AuditReport } from '@/types/auditor';
import { WeaknessAudit, IntervalsWellness, TTBIndices, TitanLoadCalculation } from '@/types';
import { HevyExerciseTemplate } from '@/types/hevy';
import DashboardClient from '@/features/dashboard/DashboardClient';

import { RecoveryService } from '@/services/bio/RecoveryService';

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

    // 1. Fetch Hevy Templates
    // Pass the key from DB, fallback to Env.
    const hevyApiKey = dbUser?.hevyApiKey || process.env.HEVY_API_KEY;

    let nameMap = new Map<string, string>();
    try {
        // Use Server Action directly
        if (hevyApiKey) {
            const templatesData = await getHevyTemplatesAction(hevyApiKey);
            nameMap = new Map(templatesData.exercise_templates.map((t: HevyExerciseTemplate) => [t.id, t.title]));
        }
    } catch (e) {
        console.error("Warning: Failed to load Hevy templates. Dashboard will show raw IDs.", e);
    }

    // 2. Run Audit
    let report: AuditReport = {
        timestamp: new Date().toISOString(),
        muscleAudits: [],
        ratios: [],
        overallScore: 0,
        highestPriorityGap: null
    };

    try {
        report = await runFullAudit(false, hevyApiKey, baseUrl);
    } catch (e) {
        console.error("Warning: Failed to run auditor. Audit report will be empty.", e);
    }
    const weaknessAudit: WeaknessAudit = {
        detected: !!report.highestPriorityGap,
        type: report.highestPriorityGap ? 'RECOVERY_DEBT' : 'NONE',
        message: report.highestPriorityGap ? `Focus on ${report.highestPriorityGap.muscleGroup}` : 'Systems Optimal',
        confidence: 0.9,
    };

    // 3. Wellness & Events
    const today = new Date().toISOString().split('T')[0];
    let wellness = {} as IntervalsWellness;

    try {
        if (dbUser?.intervalsApiKey && dbUser?.intervalsAthleteId) {
            wellness = await getWellness(today, dbUser.intervalsApiKey, dbUser.intervalsAthleteId) || {} as IntervalsWellness;
        }
    } catch (e) {
        console.error("Warning: Failed to load wellness data", e);
    }

    if (!wellness || !wellness.id) {
        wellness = { ctl: 0, ramp_rate: 0, bodyBattery: 0, sleepScore: 0 } as IntervalsWellness;
    }

    const fakeTTB: TTBIndices = { strength: 75, endurance: 60, wellness: wellness.sleepScore || 50, lowest: 'endurance' };

    const ninetyDaysOut = new Date();
    ninetyDaysOut.setDate(ninetyDaysOut.getDate() + 90);

    let events: import('@/types').IntervalsEvent[] = [];
    try {
        if (dbUser?.intervalsApiKey && dbUser?.intervalsAthleteId) {
            events = await getEvents(today, ninetyDaysOut.toISOString().split('T')[0], dbUser.intervalsApiKey, dbUser.intervalsAthleteId);
        }
    } catch (e) {
        console.warn("Could not load events", e);
    }

    // 4. Activity Analysis
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

    let activities: import('@/types').IntervalsActivity[] = [];
    try {
        if (dbUser?.intervalsApiKey && dbUser?.intervalsAthleteId) {
            activities = await getActivities(twentyEightDaysAgo.toISOString().split('T')[0], today, dbUser.intervalsApiKey, dbUser.intervalsAthleteId);
        }
    } catch (e) {
        console.warn("Could not load activities", e);
    }

    let titanAnalysis: TitanLoadCalculation | null = null;
    if (activities.length > 0) {
        const sorted = activities.sort((a, b) => b.id!.localeCompare(a.id!));
        const latest = sorted[0];
        const durMins = latest.moving_time ? latest.moving_time / 60 : 60;
        const intensity = latest.icu_intensity ? latest.icu_intensity / 100 : 0.5;
        const estimatedVol = durMins * 100;
        titanAnalysis = AnalyticsService.calculateTitanLoad(estimatedVol, intensity, durMins);
    }

    // 5. Progression & Oracle
    const progression = await ProgressionService.getProgressionState(user.id);
    if (!progression) {
        // Fallback or error
        throw new Error("Could not load progression");
    }

    // Bio-Engine Recovery Check
    const recoveryAnalysis = await RecoveryService.analyzeRecovery(user.id);

    // Training Path State
    // Cast to any to bypass stale Prisma types in IDE
    const activePath = ((dbUser as any)?.activePath as import('@/types/training').TrainingPath) || 'HYBRID_WARDEN';
    const mobilityLevel = ((dbUser as any)?.mobilityLevel as import('@/types/training').LayerLevel) || 'NONE';
    const recoveryLevel = ((dbUser as any)?.recoveryLevel as import('@/types/training').LayerLevel) || 'NONE';

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

    // 6. Weekly Mastery Calculation
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
        mobilitySets: weeklyMobilitySessions
    };

    const hasCompletedOnboarding = dbUser?.achievements.some(a => a.achievementId === 'ONBOARDING_COMPLETED') || false;

    return (
        <DashboardClient
            apiKey={hevyApiKey}
            nameMap={nameMap}
            ttb={fakeTTB}
            wellness={wellness}
            level={progression.level}
            auditReport={report}
            oracleRec={oracleRec}
            weaknessAudit={weaknessAudit}
            forecast={realForecast}
            events={events}
            titanAnalysis={titanAnalysis}
            activePath={activePath}
            mobilityLevel={mobilityLevel}
            recoveryLevel={recoveryLevel}
            totalExperience={dbUser?.totalExperience || 0}
            weeklyMastery={weeklyMastery}
            userId={user.id}
            intervalsConnected={!!(dbUser?.intervalsApiKey && dbUser?.intervalsAthleteId)}
            faction={(dbUser as any)?.faction || 'HORDE'}
            hasCompletedOnboarding={hasCompletedOnboarding}
        />
    );
}
