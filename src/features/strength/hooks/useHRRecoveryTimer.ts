import { create } from "zustand";

interface HRState {
    currentHR: number;
    maxHR: number;
    restingHR: number;
    recoveryStartTime: number | null;
    recoveryStartHR: number | null;
    recoveryStatus: "none" | "recovering" | "recovered";
    metrics: {
        zone: number; // 1-5
        drift: number; // Percentage drift from baseline
    };
}

interface HRStore extends HRState {
    updateHR: (hr: number) => void;
    setZones: (max: number, resting: number) => void;
    startRecovery: () => void;
    stopRecovery: () => void;
    reset: () => void;
}

const DEFAULT_STATE: HRState = {
    currentHR: 0,
    maxHR: 190, // Default fallback
    restingHR: 60, // Default fallback
    recoveryStartTime: null,
    recoveryStartHR: null,
    recoveryStatus: "none",
    metrics: {
        zone: 0,
        drift: 0,
    }
};

export const useHRStore = create<HRStore>((set, get) => ({
    ...DEFAULT_STATE,

    setZones: (max, resting) => set({ maxHR: max, restingHR: resting }),

    updateHR: (hr) => {
        const { maxHR, restingHR, recoveryStatus, recoveryStartHR, recoveryStartTime } = get();

        // Calculate Zone (Karvonen)
        const hrr = maxHR - restingHR;
        const intensity = (hr - restingHR) / hrr;
        let zone = 1;
        if (intensity > 0.6) zone = 2;
        if (intensity > 0.7) zone = 3;
        if (intensity > 0.8) zone = 4;
        if (intensity > 0.9) zone = 5;

        // Check Recovery
        let newStatus = recoveryStatus;
        if (recoveryStatus === "recovering" && recoveryStartHR && recoveryStartTime) {
            const drop = recoveryStartHR - hr;
            // const duration = (Date.now() - recoveryStartTime) / 1000;

            // Simple Logic: If HR drops by 20bpm or falls below 100bpm, considered recovered
            if (drop >= 20 || hr < 100) {
                newStatus = "recovered";
            }
        }

        set({
            currentHR: hr,
            metrics: { ...get().metrics, zone },
            recoveryStatus: newStatus
        });
    },

    startRecovery: () => set((state) => ({
        recoveryStatus: "recovering",
        recoveryStartTime: Date.now(),
        recoveryStartHR: state.currentHR
    })),

    stopRecovery: () => set({ recoveryStatus: "none", recoveryStartTime: null }),

    reset: () => set(DEFAULT_STATE)
}));

// Derived hook for use in components
export const useHRRecoveryTimer = () => {
    const store = useHRStore();

    // We could add polling logic or simulation here if we don't have a real source

    return store;
};
