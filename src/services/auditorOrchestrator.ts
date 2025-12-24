import { getHevyWorkouts } from '@/lib/hevy';
import { calculateWeeklyVolume } from '../utils/volumeCalculator';
import { auditWeaknesses } from '../utils/weaknessAuditor';
import { StorageService } from './storage';
import { AuditReport } from '../types/auditor';

/**
 * Auditor Orchestrator
 * Coordinates data fetching, processing, and storage for the Weakness Auditor system.
 */

const HISTORY_DEPTH = 30; // Fetch last 30 workouts to ensure full week coverage

/**
 * Runs a full audit cycle:
 * 1. Fetches recent workout history from Hevy
 * 2. Calculates weekly volume per muscle group
 * 3. Analyzes weaknesses and imbalances
 * 4. Caches the report locally
 * 
 * @param forceRefresh - If true, ignores cache and forces a new API call (logic handled by caller or here)
 * @returns The generated AuditReport
 */
export const runFullAudit = async (forceRefresh: boolean = false, apiKey?: string | null, baseUrl?: string): Promise<AuditReport> => {
    // 1. Check cache first? 
    // Usually Orchestrator is called when we WANT a refresh. 
    // But we can check if we have a very recent report (e.g. < 1 hour old) to save API calls.
    // For MVP, we will assume this is triggered explicitly or on app load if stale.

    if (!forceRefresh) {
        // SSR SAFEGUARD: StorageService returns null on server, so this is safe.
        const cached = await StorageService.getLatestAuditorReport();
        if (cached) {
            const reportAge = Date.now() - new Date(cached.timestamp).getTime();
            // detailed cache validity check could go here (e.g. 1 hour)
            if (reportAge < 1000 * 60 * 60) {
                console.log("Using cached Auditor Report");
                return cached;
            }
        }
    }

    console.log("Orchestrator: Fetching workout history...");
    // 2. Fetch Data (Hevy limit is 10 per page)
    const PAGE_SIZE = 10;
    const pagesNeeded = Math.ceil(HISTORY_DEPTH / PAGE_SIZE);
    let allWorkouts: any[] = [];

    for (let p = 1; p <= pagesNeeded; p++) {
        const result = await getHevyWorkouts(apiKey || '', p, PAGE_SIZE);
        if (result.workouts) {
            allWorkouts.push(...result.workouts);
        }
        // If we got fewer than PAGE_SIZE, we've reached the end
        if (result.workouts.length < PAGE_SIZE) break;
    }

    // Trim to exactly HISTORY_DEPTH if needed
    const history = allWorkouts.slice(0, HISTORY_DEPTH);

    // 3. Transform Data
    console.log(`Orchestrator: Calculating volumes for ${history.length} workouts...`);
    const volumes = calculateWeeklyVolume(history);

    // 4. Analyze
    console.log("Orchestrator: Running Auditor analysis...");
    const report = auditWeaknesses(volumes);

    // 5. Persist
    console.log("Orchestrator: Caching report...");
    // Only save if we are in a client environment capable of storage
    if (typeof window !== 'undefined') {
        await StorageService.saveAuditorReport(report);
    }

    return report;
};
