'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { TrainingContextService } from '@/services/data/TrainingContextService';
import { GeminiService } from '@/services/gemini';

/**
 * Sends a message to the Oracle (Gemini) and persists the interaction.
 */
export async function chatWithOracleAction(message: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        // 1. Persist User Message
        await prisma.oracleMessage.create({
            data: {
                userId: user.id,
                role: 'user',
                content: message
            }
        });

        // 2. Fetch Context
        const context = await TrainingContextService.getTrainingContext(user.id);
        const bioString = `
            Readiness: ${context.readiness}
            CNS Fatigue: ${context.cnsFatigue}
            Cardio Stress: ${context.cardioStress}
            Warnings: ${context.warnings.join(", ") || "None"}
        `;

        // 3. Get History
        const messages = await prisma.oracleMessage.findMany({
            where: { userId: user.id },
            orderBy: { timestamp: 'desc' },
            take: 6
        });
        const history = messages.reverse().map(m => ({
            role: m.role,
            content: m.content
        }));

        // 4. Call Generative AI
        const oracleResponse = await GeminiService.chat(message, history, bioString);

        // 5. Persist Oracle Response
        await prisma.oracleMessage.create({
            data: {
                userId: user.id,
                role: 'oracle',
                content: oracleResponse
            }
        });

        revalidatePath('/oracle');
        return { success: true, message: oracleResponse };

    } catch (error) {
        console.error("Oracle Chat Error:", error);
        return { success: false, message: "The Oracle is silent." };
    }
}

/**
 * Retrieves the recent chat history for the user.
 */
export async function getOracleHistoryAction(limit = 20) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const messages = await prisma.oracleMessage.findMany({
            where: { userId: user.id },
            orderBy: { timestamp: 'desc' },
            take: limit
        });

        return messages.reverse();
    } catch (error) {
        return [];
    }
}
