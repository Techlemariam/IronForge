'use server'

import { HevyExerciseTemplate } from '@/types/hevy';
import axios from 'axios';
import prisma from '@/lib/prisma';
import { getHevyTemplates } from '@/lib/hevy';
import { createClient } from '@/utils/supabase/server';


export async function getHevyTemplatesAction(apiKey: string) {
    if (!apiKey) {
        throw new Error("Hevy API Key is required.");
    }

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


export async function saveWorkoutAction(apiKey: string, payload: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!apiKey) {
        throw new Error("Hevy API Key is required.");
    }

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
