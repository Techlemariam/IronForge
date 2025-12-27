'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { TrainingPath } from '@/types/training'
import { processWorkoutLog } from '@/services/challengeService'

export type TitanLogResult = {
    success: boolean
    message: string
    newLevel?: number
    xpGained?: number
    energyGained?: number
}

export async function logTitanSet(
    exerciseId: string,
    reps: number,
    weight: number,
    rpe: number
): Promise<TitanLogResult> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'User not authenticated' }
    }

    try {
        // 1. Calculate Rewards
        // Base XP per set = 10. Bonus 1 XP per rep.
        // Energy = reps * 2 (Kinetic Shards logic)
        const xpGained = 10 + reps;
        const energyGained = reps * 2;

        // 2. Log Exercise (optional, but good for history)
        // Check if we need to create an explicit ExerciseLog entry per set or just update aggregate.
        // For now, let's create a log entry implicitly by updating the user stats.
        // Ideally we should have a 'SetLog' table or append to ExerciseLog.
        // Given schema, ExerciseLog seems to be per SESSION or per EXERCISE instance?
        // Let's look at schema: model ExerciseLog { id, userId, date, exerciseId, ... }
        // It seems to be one entry per "log". Let's create one.

        // Calculate E1RM for the log
        const rir = 10 - rpe;
        const e1rm = weight * (1 + (reps + rir) / 30);

        await prisma.exerciseLog.create({
            data: {
                userId: user.id,
                exerciseId,
                sets: [{
                    reps,
                    weight,
                    rpe,
                    isWarmup: false,
                }],
                isPersonalRecord: rpe >= 9, // Epic effort
                date: new Date()
            }
        })

        // 3. Update User Stats (Atomic increment)
        const dbUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                totalExperience: { increment: xpGained },
                kineticEnergy: { increment: energyGained }
            }
        })

        // 4. Level Calculation
        // Formula: floor(totalXP / 100) + 1
        const newLevel = Math.floor(dbUser.totalExperience / 100) + 1;

        if (newLevel > dbUser.level) {
            await prisma.user.update({
                where: { id: user.id },
                data: { level: newLevel }
            })
        }

        // 5. Challenge Processing (Fire and Forget)
        // We do not await this to keep UI snappy, or we await if we want data consistency.
        // Next.js actions should handle promises.
        try {
            await processWorkoutLog(user.id, weight, reps);
        } catch (e) {
            console.error("Challenge Sync Failed", e);
        }

        revalidatePath('/') // Refresh dashboard

        return {
            success: true,
            message: 'Set Logged',
            newLevel,
            xpGained,
            energyGained
        }

    } catch (error) {
        console.error('Titan Log Error:', error)
        return { success: false, message: 'Failed to log set' }
    }
}

export async function updateActivePathAction(path: TrainingPath): Promise<{ success: boolean; message: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, message: 'User not authenticated' }
    }

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: { activePath: path }
        })
        revalidatePath('/')
        return { success: true, message: 'Path updated' }
    } catch (error) {
        console.error('Update Path Error:', error)
        return { success: false, message: 'Failed to update path' }
    }
}
