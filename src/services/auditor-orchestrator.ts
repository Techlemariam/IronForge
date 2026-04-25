import { getWeeklyMobilityLogs } from '@/actions/mobility/logMobilityAction';
import { getIronForgeStrengthLogs } from '@/actions/training/getIronForgeStrengthLogs';
import type { AuditReport } from '../types/auditor';
import type { HevyWorkout } from '../types/hevy';
import { calculateWeeklyVolume } from '../utils/volumeCalculator';
import { auditWeaknesses } from '../utils/weaknessAuditor';
import { MobilityAuditor } from './mobility-auditor';
import { StorageService as Storage } from './storage';

/**
 * Auditor Orchestrator
 * Coordinates data fetching, processing, and storage for the Weakness Auditor system.
 *
 * DATA SOURCE: IronForge PostgreSQL (strength logs from IronMines)
 * NOTE: Hevy integration has been removed per data-source-reconciliation.md
 */

/**
 * Runs a full audit cycle:
 * 1. Fetches recent workout history from IronForge DB
 * 2. Calculates weekly volume per muscle group
 * 3. Analyzes weaknesses and imbalances
 * 4. Caches the report locally
 *
 * @param forceRefresh - If true, ignores cache and forces a new fetch
 * @returns The generated AuditReport
 */
export async function runFullAudit(
  forceRefresh = false,
  userId?: string,
  prefetchedHistory?: HevyWorkout[]
): Promise<AuditReport> {
  // 1. Check cache first
  if (!forceRefresh && !prefetchedHistory) {
    const cached = await Storage.getLatestAuditorReport();
    if (cached) {
      const reportAge =
        Date.now() -
        new Date((cached as unknown as { timestamp: string | number | Date }).timestamp).getTime();
      if (reportAge < 1000 * 60 * 60) {
        console.log('Using cached Auditor Report');
        return cached as unknown as AuditReport;
      }
    }
  }

  let history: HevyWorkout[] = [];

  if (prefetchedHistory && prefetchedHistory.length > 0) {
    // Use injected history (e.g. from Demo Mode or already fetched)
    console.log('Orchestrator: Using prefetched history...');
    history = prefetchedHistory;
  } else if (userId) {
    // 2. Fetch IronForge Native Logs
    console.log(`Orchestrator: Fetching IronForge logs for user ${userId}...`);
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const result = await getIronForgeStrengthLogs(userId, oneMonthAgo, now);

    if (result.success && result.data) {
      // Transform ExerciseLog[] to HevyWorkout[] for the calculator
      history = result.data.map((log: any) => ({
        id: String(log.id),
        start_time: log.date.toISOString(),
        end_time: log.date.toISOString(),
        exercises: [
          {
            exercise_template: { title: log.exercise.name },
            sets: ((log.sets as any[]) || []).map((s) => ({
              type: s.setType || (s.isWarmup ? 'warmup' : 'normal'),
              weight: s.weight || 0,
              reps: Number(s.completedReps || s.reps || 0),
            })),
          },
        ],
      })) as unknown as HevyWorkout[];
    } else {
      console.warn('Orchestrator: Failed to fetch strength logs or no data found.');
      history = [];
    }
  } else {
    console.warn(
      'Orchestrator: No userId provided and no prefetched history. Returning empty report.'
    );
    history = [];
  }

  // 3. Transform Data
  console.log(`Orchestrator: Calculating volumes for ${history.length} workouts...`);
  const volumes = calculateWeeklyVolume(history);

  // 4. Analyze
  console.log('Orchestrator: Running Auditor analysis...');
  const report = auditWeaknesses(volumes);

  // Mobility Audit
  if (userId) {
    try {
      const mobilityLogs = await getWeeklyMobilityLogs(); // Use implicit auth
      if (mobilityLogs.success && mobilityLogs.data) {
        const mobilityReport = MobilityAuditor.auditMobility(mobilityLogs.data.logs);
        report.mobility = mobilityReport;
      }
    } catch (e) {
      console.error('Failed to audit mobility', e);
    }
  }

  // 5. Persist
  console.log('Orchestrator: Caching report...');
  // Only save if we are in a client environment capable of storage
  if (typeof window !== 'undefined') {
    await Storage.saveAuditorReport(report);
  }

  return report;
}
