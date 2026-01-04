'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

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

        // 2. Fetch Context (TODO: Use oracle-seed context builder)
        // const context = await buildOracleContext(user.id);

        // 3. Call Generative AI (TODO: Use gemini service)
        // const responseData = await generateOracleResponse(context, history);

        // Mock Response for Skeleton
        const mockResponse = `The spirits align. You asked: "${message}". My wisdom is currently loading...`;

        // 4. Persist Oracle Response
        await prisma.oracleMessage.create({
            data: {
                userId: user.id,
                role: 'oracle',
                content: mockResponse
            }
        });

        revalidatePath('/oracle');
        return { success: true, message: mockResponse };

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
