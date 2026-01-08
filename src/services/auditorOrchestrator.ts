import { calculateWeeklyVolume } from "../utils/volumeCalculator";
import { auditWeaknesses } from "../utils/weaknessAuditor";
import { StorageService } from "./storage";
import { AuditReport } from "../types/auditor";
import { getWeeklyMobilityLogs } from "@/actions/mobility/logMobilityAction";
import { auditMobility } from "./MobilityAuditor";

/**
 * Auditor Orchestrator
 * Coordinates data fetching, processing, and storage for the Weakness Auditor system.
 * 
 * DATA SOURCE: IronForge PostgreSQL (strength logs from IronMines)
 * NOTE: Hevy integration has been removed per data-source-reconciliation.md
 */

const HISTORY_DEPTH = 30; // Fetch last 30 workouts to ensure full week coverage

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
export const runFullAudit = async (
  forceRefresh: boolean = false,
  userId?: string,
  prefetchedHistory?: any[],
): Promise<AuditReport> => {
  // 1. Check cache first
  if (!forceRefresh && !prefetchedHistory) {
    const cached = await StorageService.getLatestAuditorReport();
    if (cached) {
      const reportAge = Date.now() - new Date((cached as any).timestamp).getTime();
      if (reportAge < 1000 * 60 * 60) {
        console.log("Using cached Auditor Report");
        return cached as any as AuditReport;
      }
    }
  }

  let history: any[] = [];

  if (prefetchedHistory && prefetchedHistory.length > 0) {
    // Use injected history (e.g. from Demo Mode or already fetched)
    console.log("Orchestrator: Using prefetched history...");
    history = prefetchedHistory;
  } else if (userId) {
    // TODO: Implement getIronForgeStrengthLogs(userId, HISTORY_DEPTH)
    // This action should query the strength_logs table for the user's recent workouts
    // and transform them into the format expected by calculateWeeklyVolume.
    console.warn("Orchestrator: getIronForgeStrengthLogs not yet implemented. Returning empty history.");
    history = [];

    // Placeholder for future implementation:
    // const result = await getIronForgeStrengthLogs(userId, HISTORY_DEPTH);
    // history = result.workouts;
  } else {
    console.warn("Orchestrator: No userId provided and no prefetched history. Returning empty report.");
    history = [];
  }

  // 3. Transform Data
  console.log(
    `Orchestrator: Calculating volumes for ${history.length} workouts...`,
  );
  const volumes = calculateWeeklyVolume(history);

  // 4. Analyze
  console.log("Orchestrator: Running Auditor analysis...");
  const report = auditWeaknesses(volumes);

  // Mobility Audit
  if (userId) {
    try {
      const mobilityLogs = await getWeeklyMobilityLogs(); // Use implicit auth
      if (mobilityLogs.success && mobilityLogs.data) {
        const mobilityReport = auditMobility(mobilityLogs.data.logs);
        report.mobility = mobilityReport;
      }
    } catch (e) {
      console.error("Failed to audit mobility", e);
    }
  }

  // 5. Persist
  console.log("Orchestrator: Caching report...");
  // Only save if we are in a client environment capable of storage
  if (typeof window !== "undefined") {
    // @ts-ignore
    await StorageService.saveAuditorReport(report);
  }

  return report;
};
