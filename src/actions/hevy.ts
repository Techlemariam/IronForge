'use server'

import { HevyExerciseTemplate, HevyRoutine, HevyWorkout } from '@/types/hevy';
import axios from 'axios';
import prisma from '@/lib/prisma';
import { getHevyTemplates } from '@/lib/hevy';
import { createClient } from '@/utils/supabase/server';


import { HevyHelperSchema, ImportHevyHistorySchema } from '@/types/schemas';

export async function getHevyTemplatesAction(apiKey: string) {
    const { apiKey: validatedKey } = HevyHelperSchema.pick({ apiKey: true }).parse({ apiKey });

    try {
        const allExercises = await getHevyTemplates(apiKey);
        return {
            exercise_templates: allExercises,
            page: 1,
            total_pages: 1,
            total_records: allExercises.length
        };
    } catch (error: any) {
        console.error("Server Action Hevy Error:", error.message);
        throw new Error("Failed to fetch Hevy templates: " + error.message);
    }
}



export async function getHevyRoutinesAction(apiKey: string, page: number = 1, pageSize: number = 10) {
    const { apiKey: key, page: p, pageSize: ps } = HevyHelperSchema.pick({ apiKey: true, page: true, pageSize: true }).parse({ apiKey, page, pageSize });

    try {
        const response = await axios.get('https://api.hevyapp.com/v1/routines', {
            headers: { 'api-key': apiKey },
            params: { page, pageSize }
        });
        return response.data as { page: number; page_count: number; routines: HevyRoutine[] };
    } catch (error: any) {
        console.error("Server Action Hevy Routines Error:", error.message);
        throw new Error("Failed to fetch Hevy routines: " + (error.response?.data?.error || error.message));
    }
}

export async function getHevyWorkoutHistoryAction(apiKey: string, count: number = 30) {
    const { apiKey: key, count: c } = HevyHelperSchema.pick({ apiKey: true, count: true }).parse({ apiKey, count });

    const pageSize = 10;
    const numPagesToFetch = Math.ceil(count / pageSize);
    let allWorkouts: HevyWorkout[] = [];

    try {
        for (let page = 1; page <= numPagesToFetch; page++) {
            const response = await axios.get('https://api.hevyapp.com/v1/workouts', {
                headers: { 'api-key': apiKey },
                params: { page, pageSize }
            });

            if (response.status === 200 && response.data.workouts) {
                allWorkouts.push(...response.data.workouts);
                if (response.data.workouts.length < pageSize) {
                    break;
                }
            } else {
                console.warn(`Warning: Could not fetch page ${page} of Hevy workout history. Status: ${response.status}`);
            }
        }
        return { workouts: allWorkouts.slice(0, count) };
    } catch (error: any) {
        console.error("Server Action Hevy History Error:", error.message);
        throw new Error("Failed to fetch Hevy history: " + (error.response?.data?.error || error.message));
    }
}


export async function saveWorkoutAction(apiKey: string, payload: any) {
    const { apiKey: validatedKey } = HevyHelperSchema.pick({ apiKey: true }).parse({ apiKey });
    // Note: payload validation is tricky as strict Hevy schema might reject valid calls if our types are incomplete.
    // Ideally we validate payload too, but for now we secure the API key.
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    try {
        const response = await axios.post('https://api.hevyapp.com/v1/workouts', payload, {
            headers: {
                'api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        // --- PERFORMANCE COACH: Award Kinetic Energy ---
        if (user && payload.workout) {
            const exercises = payload.workout.exercises || [];
            let totalVolume = 0;
            for (const ex of exercises) {
                // Hevy sets: { weight_kg, reps }
                if (ex.sets) {
                    for (const s of ex.sets) {
                        totalVolume += (s.weight_kg || 0) * (s.reps || 0);
                    }
                }
            }

            // Calculation: 1 Energy per 100kg volume. Min 10.
            const energyGain = Math.max(10, Math.floor(totalVolume / 100));

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    kineticEnergy: { increment: energyGain },
                    totalExperience: { increment: energyGain * 2 } // Also give XP?
                }
            });

            // We could notify user here but let's stick to API response augmentation
            response.data.rewards = { energy: energyGain };
        }

        return response.data;

    } catch (error: any) {
        console.error("Server Action Hevy Save Error:", error.message);
        throw new Error("Failed to save workout: " + (error.response?.data?.error || error.message));
    }
}

export async function importHevyHistoryAction(workouts: any[]) {
    // Validate strict structure
    const { workouts: validatedWorkouts } = ImportHevyHistorySchema.parse({ workouts });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Unauthorized");
    }

    try {
        let logsToCreate: any[] = [];
        let importedCount = 0;

        for (const workout of workouts) {
            const date = new Date(workout.start_time);

            for (const exercise of workout.exercises) {
                // Calculate Best e1rm for this session
                let bestE1rm = 0;

                if (exercise.sets && Array.isArray(exercise.sets)) {
                    for (const set of exercise.sets) {
                        const weight = set.weight_kg || 0;
                        const reps = set.reps || 0;
                        if (weight > 0 && reps > 0) {
                            const e1rm = weight * (1 + (reps / 30));
                            if (e1rm > bestE1rm) bestE1rm = e1rm;
                        }
                    }
                }

                if (bestE1rm > 0) {
                    logsToCreate.push({
                        userId: user.id,
                        date: date,
                        exerciseId: exercise.exercise_template_id || exercise.title, // Fallback to title if ID missing
                        e1rm: bestE1rm,
                        rpe: (exercise as any).rpe || 8, // Default RPE
                        isEpic: bestE1rm > 100 // Arbitrary threshold for now
                    });
                }
            }
            importedCount++;
        }

        // Batch insert
        if (logsToCreate.length > 0) {
            await prisma.exerciseLog.createMany({
                data: logsToCreate,
                skipDuplicates: true
            });
        }

        return { success: true, count: importedCount, logs: logsToCreate.length };

    } catch (error: any) {
        console.error("Server Action Hevy Import Error:", error.message);
        throw new Error("Failed to import history: " + error.message);
    }
}

