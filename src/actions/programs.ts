'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Creates a new training program skeleton.
 */
export async function createProgramAction(userId: string, data: { name: string, weeks: number, description?: string }) {
    const program = await prisma.trainingProgram.create({
        data: {
            creatorId: userId,
            name: data.name,
            description: data.description,
            weeks: data.weeks,
            // Create weeks automatically
            programWeeks: {
                create: Array.from({ length: data.weeks }).map((_, i) => ({
                    weekNumber: i + 1,
                    focus: 'General'
                }))
            }
        },
        include: { programWeeks: true }
    });

    revalidatePath('/dashboard');
    return program;
}

export async function getProgramAction(programId: string) {
    return prisma.trainingProgram.findUnique({
        where: { id: programId },
        include: {
            programWeeks: {
                include: { workouts: true },
                orderBy: { weekNumber: 'asc' }
            },
            creator: { select: { heroName: true } }
        }
    });
}
