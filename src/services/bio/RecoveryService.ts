import prisma from '@/lib/prisma';

export type RecoveryState = 'HIGH_RECOVERY' | 'NORMAL_RECOVERY' | 'LOW_RECOVERY' | 'UNKNOWN';

interface RecoveryAnalysis {
    state: RecoveryState;
    score: number; // 0-100
    reason: string;
}

export class RecoveryService {
    /**
     * Analyzes user's recovery based on recent HRV and Resting HR (7-day trend vs yesterday)
     */
    static async analyzeRecovery(userId: string): Promise<RecoveryAnalysis> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { hrv: true, restingHr: true }
        });

        if (!user || user.hrv === null || user.restingHr === null) {
            return { state: 'UNKNOWN', score: 50, reason: "Insufficient biometric data" };
        }

        // Simplified logic: In a real app we would fetch 7-day history from a separate table.
        // For now, we assume the 'hrv' on the user model is "Yesterday's/Current HRV" 
        // and we compare it to a static baseline or just return "Normal" if we lack history.
        // To make this "Real", we need the history. 

        // Fallback: If HRV < 40 (arbitrary low) => Low Recovery.
        // If HRV > 60 => High Recovery.
        // TODO: Implement proper baseline tracking in Phase 2.

        let score = 50;
        let state: RecoveryState = 'NORMAL_RECOVERY';
        let reason = "Your biometrics are stable.";

        if (user.hrv < 40) {
            state = 'LOW_RECOVERY';
            score = 30;
            reason = "HRV is critically low. Prioritize rest.";
        } else if (user.hrv > 70) {
            state = 'HIGH_RECOVERY';
            score = 90;
            reason = "High HRV indicated! You are primed for deep work.";
        } else {
            score = 60 + (user.hrv - 40); // Scaling
        }

        return { state, score, reason };
    }
}
