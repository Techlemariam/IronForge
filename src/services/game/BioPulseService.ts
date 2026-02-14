import { prisma } from "@/lib/prisma";
import { awardTitanXpAction, syncTitanStateWithWellness } from "@/actions/titan/core";
import { logger } from "@/lib/logger";

export class BioPulseService {
    static async handleWorkoutPulse(userId: string, workout: any) {
        try {
            logger.info({ userId, workoutId: workout.id }, "Processing Workout Bio-Pulse");

            // 1. Calculate XP based on workout data
            // For now, a base amount + complexity multiplier
            let baseXP = 500;
            if (workout.exercises) baseXP += workout.exercises.length * 50;

            const titan = await prisma.titan.findUnique({ where: { userId } });
            if (!titan) throw new Error(`Titan not found for user ${userId}`);

            const xpResult = await awardTitanXpAction(userId, baseXP, "WORKOUT_PULSE");

            // 2. Create a Titan Memory
            const description = `Genomförde ett ${workout.exercises?.length || 0}-övnings pass med fokus på kraft.`;
            const memory = await prisma.titanMemory.create({
                data: {
                    titanId: titan.id,
                    type: "WORKOUT",
                    description,
                    importance: baseXP > 1000 ? 3 : 1,
                }
            });

            // 3. Generate Moltbot Context for n8n/Dialog
            const moltbotContext = {
                role: "Moltbot (IronForge Overseer)",
                tone: titan?.mood === "WEAKENED" ? "Concerned/Patronizing" : "Proud/Authoritarian",
                message: `Titanen har absorberat ${baseXP} XP från en Bio-Pulse. ${xpResult.leveledUp ? 'EN NIVÅÖKNING HAR SKETT!' : ''}`,
                prompt_hint: `Titanen just genomförde ett träningspass. Skriv en kort, atmosfärisk kommentar på svenska. Titanens humör är ${titan?.mood}.`
            };

            return {
                success: true,
                xpAwarded: baseXP,
                leveledUp: xpResult.leveledUp,
                newLevel: titan?.level,
                memoryId: memory.id,
                moltbot: moltbotContext
            };
        } catch (error) {
            logger.error({ err: error, userId }, "Failed to handle workout pulse");
            throw error;
        }
    }

    static async handleWellnessPulse(userId: string, wellness: any) {
        try {
            logger.info({ userId }, "Processing Wellness Bio-Pulse");

            // 1. Sync Titan state (Energy, Mood, etc.)
            const syncResult = await syncTitanStateWithWellness(userId, wellness);
            const titan = await prisma.titan.findUnique({ where: { userId } });
            if (!titan) throw new Error(`Titan not found for user ${userId}`);

            // 2. Notable events (HRV/Battery)
            let eventMemory = null;
            if (wellness.bodyBattery && wellness.bodyBattery < 20) {
                eventMemory = await prisma.titanMemory.create({
                    data: {
                        titanId: titan.id,
                        type: "FATIGUE",
                        description: "Titanens energi är kritiskt låg. Återhämtning krävs.",
                        importance: 2,
                    }
                });
            }

            const moltbotContext = {
                role: "Moltbot",
                tone: wellness.bodyBattery < 40 ? "Strict/Recovery-focused" : "Observational",
                message: `Bio-data synkad. Energi: ${wellness.bodyBattery}%. Humör: ${titan?.mood}.`,
                prompt_hint: `Analysera Titanens vitalvärden. Energi är ${wellness.bodyBattery}%. Ge ett kort råd på svenska.`
            };

            return {
                ...syncResult,
                moltbot: moltbotContext,
                memoryId: eventMemory?.id
            };
        } catch (error) {
            logger.error({ err: error, userId }, "Failed to handle wellness pulse");
            throw error;
        }
    }
}
