import { prisma } from '@/lib/prisma';
import { WardensManifest, GoalPriority, MacroPhase } from '@/types/goals';
import { Prisma } from '@prisma/client';

export class WardensService {
    /**
     * Retrieves the Warden's Manifest for a user.
     * Transforms Prisma JSON types back to domain types.
     */
    static async getManifest(userId: string): Promise<WardensManifest | null> {
        const record = await prisma.wardensManifest.findUnique({
            where: { userId },
        });

        if (!record) return null;

        return {
            userId: record.userId,
            goals: record.goals as unknown as GoalPriority[],
            phase: record.phase as MacroPhase,
            phaseStartDate: record.phaseStartDate,
            phaseWeek: record.phaseWeek,
            autoRotate: record.autoRotate,
            consents: {
                healthData: record.privacyHealth,
                leaderboard: record.privacyPublic,
            },
        };
    }

    /**
     * Creates or updates the manifest.
     */
    static async upsertManifest(
        userId: string,
        data: Partial<WardensManifest>
    ): Promise<WardensManifest> {

        // Validate goals if present
        if (data.goals) {
            const totalWeight = data.goals.reduce((sum, g) => sum + g.weight, 0);
            if (Math.abs(totalWeight - 1.0) > 0.01) {
                throw new Error(`Goal weights must sum to 1.0 (got ${totalWeight})`);
            }
        }

        const payload: Prisma.WardensManifestUpsertArgs['create'] = {
            userId,
            phase: data.phase || 'BALANCED',
            phaseStartDate: data.phaseStartDate || new Date(),
            phaseWeek: data.phaseWeek || 1,
            autoRotate: data.autoRotate ?? true,
            privacyHealth: data.consents?.healthData ?? true,
            privacyPublic: data.consents?.leaderboard ?? true,
            goals: (data.goals as any) || [],
        };

        const record = await prisma.wardensManifest.upsert({
            where: { userId },
            create: payload,
            update: {
                phase: data.phase,
                phaseStartDate: data.phaseStartDate,
                phaseWeek: data.phaseWeek,
                autoRotate: data.autoRotate,
                privacyHealth: data.consents?.healthData,
                privacyPublic: data.consents?.leaderboard,
                goals: data.goals as any,
            },
        });

        return {
            userId: record.userId,
            goals: record.goals as unknown as GoalPriority[],
            phase: record.phase as MacroPhase,
            phaseStartDate: record.phaseStartDate,
            phaseWeek: record.phaseWeek,
            autoRotate: record.autoRotate,
            consents: {
                healthData: record.privacyHealth,
                leaderboard: record.privacyPublic,
            },
        };
    }

    /**
     * Updates only the phase and week (e.g., during auto-rotation).
     */
    static async updatePhase(
        userId: string,
        phase: MacroPhase,
        week: number = 1
    ): Promise<void> {
        await prisma.wardensManifest.update({
            where: { userId },
            data: {
                phase,
                phaseWeek: week,
                phaseStartDate: new Date(), // Reset start date on phase change? Usually yes.
            },
        });
    }
}
