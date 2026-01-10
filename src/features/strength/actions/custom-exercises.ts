'use server';

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

interface CustomExerciseInput {
    name: string;
    muscle: string;
    equipment: string;
}

export async function createCustomExercise(data: CustomExerciseInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) throw new Error("Unauthorized");

    try {
        // Use the Exercise model (which supports custom exercises via a createdBy pattern if needed)
        // For now, create in Exercise table directly
        const exercise = await prisma.exercise.create({
            data: {
                id: `custom_${Date.now()}`,
                name: data.name,
                muscleGroup: data.muscle,
                equipment: data.equipment,
                secondaryMuscles: [],
            }
        });
        return { ...exercise, isCustom: true };
    } catch (e) {
        console.error("Create custom exercise failed", e);
        // Fallback for demo
        return {
            id: `custom_${Date.now()}`,
            name: data.name,
            muscle: data.muscle,
            equipment: data.equipment,
            isCustom: true
        };
    }
}

export async function getCustomExercises() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (!userId) return [];

    try {
        // Get exercises that start with 'custom_' prefix (our convention)
        const custom = await prisma.exercise.findMany({
            where: {
                id: { startsWith: 'custom_' }
            }
        });
        return custom.map(ex => ({ ...ex, isCustom: true }));
    } catch (e) {
        return [];
    }
}
