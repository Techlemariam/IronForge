// Backend logic for HR calculations (Simulated)
// This service would normally interact with HealthKit/Bluetooth service

export const HRStrengthService = {
    calculateZone: (hr: number, max: number, resting: number) => {
        const hrr = max - resting;
        return (hr - resting) / hrr;
    },

    // Calculates "Cardiac Drift" - The increase in HR for the same workload over time
    calculateDrift: (initialHR: number, currentHR: number) => {
        if (initialHR === 0) return 0;
        return ((currentHR - initialHR) / initialHR) * 100;
    },

    getZoneColor: (zone: number) => {
        switch (zone) {
            case 1: return "bg-blue-500";
            case 2: return "bg-green-500";
            case 3: return "bg-yellow-500";
            case 4: return "bg-orange-500";
            case 5: return "bg-red-500";
            default: return "bg-zinc-500";
        }
    }
};
