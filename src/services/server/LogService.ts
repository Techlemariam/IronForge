import prisma from '@/lib/prisma';
import { ExerciseLog, MeditationLog } from '@/types';

export const LogService = {
    async saveExerciseLog(userId: string, log: ExerciseLog) {
        // Check if log already exists (optional, depends on ID strategy)
        // For now, simple create
        return prisma.exerciseLog.create({
            data: {
                userId,
                exerciseId: log.exerciseId,
                e1rm: log.e1rm,
                rpe: log.rpe,
                isEpic: log.isEpic || false,
                date: new Date(log.date),
            }
        });
    },

    async getExerciseHistory(userId: string) {
        const logs = await prisma.exerciseLog.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        });

        // Map back to frontend type
        return logs.map(log => ({
            ...log,
            date: log.date.toISOString(),
        }));
    },

    async saveMeditationLog(userId: string, log: MeditationLog) {
        return prisma.meditationLog.create({
            data: {
                userId,
                durationMinutes: log.durationMinutes,
                source: log.source,
                date: new Date(log.date),
            }
        });
    },

    async getMeditationHistory(userId: string) {
        const logs = await prisma.meditationLog.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        });
        return logs.map(log => ({
            ...log,
            date: log.date.toISOString(),
        }));
    }
};
