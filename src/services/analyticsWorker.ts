import { ExerciseLog, IntervalsWellness } from "../types";

const workerCode = `
self.onmessage = function(e) {
    const { history, wellness } = e.data;
    
    // --- HEAVY MATH SECTION ---

    // 1. Calculate Daily Load (Timeline)
    const oneDay = 24 * 60 * 60 * 1000;
    const now = new Date();
    const loadMap = new Map();

    // Populate Load from Logs (Volume * Intensity Proxy)
    history.forEach(log => {
        const dateStr = log.date.split('T')[0];
        const load = (log.e1rm * log.rpe) / 10; // Simplified Load Proxy
        const current = loadMap.get(dateStr) || 0;
        loadMap.set(dateStr, current + load);
    });

    // 2. Calculate ACWR (Acute:Chronic Workload Ratio)
    let acuteSum = 0;
    let chronicSum = 0;

    for (let i = 0; i < 28; i++) {
        const d = new Date(now.getTime() - (i * oneDay));
        const dateStr = d.toISOString().split('T')[0];
        const dayLoad = loadMap.get(dateStr) || 0;

        if (i < 7) acuteSum += dayLoad;
        chronicSum += dayLoad;
    }

    const acuteAvg = acuteSum / 7;
    const chronicAvg = chronicSum / 28;
    // Avoid division by zero
    const acwr = chronicAvg === 0 ? 0 : acuteAvg / chronicAvg;

    // 3. Muscle Heatmap Calculation
    // Map Exercise IDs to Muscle Groups (Simplified mapping for worker)
    const muscleMap = {
        'ex_landmine_press': ['shoulders', 'triceps', 'chest'],
        'ex_belt_squat': ['quads', 'glutes'],
        'ex_ghd_raise': ['hamstrings', 'lower_back'],
        'ex_db_pullover': ['lats', 'chest']
    };

    const recoveryHeatmap = {};
    
    history.forEach(log => {
        const muscles = muscleMap[log.exerciseId] || [];
        const daysSince = (now.getTime() - new Date(log.date).getTime()) / oneDay;
        
        muscles.forEach(m => {
            // Recovery Curve: 0 days = 0%, 3 days = 100%
            // We want "Fatigue", so 0 days = 1.0 (High Fatigue)
            let fatigue = Math.max(0, 1 - (daysSince / 3)); 
            
            // If multiple hits, take the max fatigue
            if (!recoveryHeatmap[m] || fatigue > recoveryHeatmap[m]) {
                recoveryHeatmap[m] = fatigue;
            }
        });
    });

    self.postMessage({
        acwr: parseFloat(acwr.toFixed(2)),
        acuteLoad: Math.round(acuteSum),
        chronicLoad: Math.round(chronicSum),
        heatmap: recoveryHeatmap
    });
};
`;

export const AnalyticsWorkerService = {
  worker: null as Worker | null,

  init() {
    if (typeof window !== "undefined" && !this.worker) {
      const blob = new Blob([workerCode], { type: "application/javascript" });
      this.worker = new Worker(URL.createObjectURL(blob));
    }
  },

  computeAdvancedStats(
    history: ExerciseLog[],
    wellness: IntervalsWellness,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.worker) this.init();

      if (!this.worker) {
        reject("Worker init failed");
        return;
      }

      this.worker.onmessage = (e) => {
        resolve(e.data);
      };

      this.worker.onerror = (e) => {
        reject(e);
      };

      this.worker.postMessage({ history, wellness });
    });
  },

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  },
};
