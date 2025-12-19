import React from 'react';
import { getHevyExerciseTemplates } from '@/services/hevy';
import { runFullAudit } from '@/services/auditorOrchestrator';
import { intervalsClient } from '@/services/intervals';
import { AnalyticsService } from '@/services/analytics';
import { ProgressionService } from '@/services/progression';
import { OracleService } from '@/services/oracle';
import { AuditReport } from '@/types/auditor';
import { WeaknessAudit, IntervalsWellness, TTBIndices, TitanLoadCalculation } from '@/types';
import { HevyExerciseTemplate } from '@/types/hevy';
import DashboardClient from '@/features/dashboard/DashboardClient';

export default async function Page() {
    // 1. Fetch Hevy Templates
    const templatesData = await getHevyExerciseTemplates();
    const nameMap = new Map(templatesData.exercise_templates.map((t: HevyExerciseTemplate) => [t.id, t.title]));

    // 2. Run Audit
    const report = await runFullAudit();
    const weaknessAudit: WeaknessAudit = {
        detected: !!report.highestPriorityGap,
        type: report.highestPriorityGap ? 'RECOVERY_DEBT' : 'NONE',
        message: report.highestPriorityGap ? `Focus on ${report.highestPriorityGap.muscleGroup}` : 'Systems Optimal',
        confidence: 0.9,
    };

    // 3. Wellness & Events
    // TODO: Connect this to real Date if not strictly "today" needed, but "today" is fine for dashboard
    const today = new Date().toISOString().split('T')[0];
    let wellness = await intervalsClient.getWellness(today);

    if (!wellness || !wellness.id) {
        wellness = { ctl: 0, ramp_rate: 0, bodyBattery: 0, sleepScore: 0 };
    }

    const fakeTTB: TTBIndices = { strength: 75, endurance: 60, wellness: wellness.sleepScore || 50, lowest: 'endurance' };

    const ninetyDaysOut = new Date();
    ninetyDaysOut.setDate(ninetyDaysOut.getDate() + 90);
    const events = await intervalsClient.getEvents(today, ninetyDaysOut.toISOString().split('T')[0]);

    // 4. Activity Analysis
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);
    const activities = await intervalsClient.getActivities(twentyEightDaysAgo.toISOString().split('T')[0], today);

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
    const progression = await ProgressionService.getProgressionState();
    const oracleRec = await OracleService.consult(wellness, fakeTTB, [], report, titanAnalysis);
    const todaysLoad = titanAnalysis ? titanAnalysis.titanLoad : 0;
    const realForecast = AnalyticsService.calculateTSBForecast(wellness, [todaysLoad]);

    return (
        <DashboardClient
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
        />
    );
}
