import { create } from "zustand";
import { AuditReport } from "../types/auditor";
import { runFullAudit } from "../services/auditorOrchestrator";

interface AuditorState {
  report: AuditReport | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchReport: (userId?: string, forceRefresh?: boolean) => Promise<void>;
  reset: () => void;
}

export const useAuditorStore = create<AuditorState>((set) => ({
  report: null,
  loading: false,
  error: null,

  fetchReport: async (userId, forceRefresh = false) => {
    set({ loading: true, error: null });
    try {
      const report = await runFullAudit(forceRefresh, userId);
      set({ report, loading: false });
    } catch (error) {
      console.error("Auditor Store Error:", error);
      set({
        error: (error as Error).message || "Failed to generate Auditor Report",
        loading: false,
      });
    }
  },

  reset: () => set({ report: null, loading: false, error: null }),
}));
