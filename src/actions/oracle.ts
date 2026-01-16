"use server";

import prisma from "@/lib/prisma";
import { GeminiService } from "@/services/gemini";
import { revalidatePath } from "next/cache";

// --- Types ---



// --- Actions ---

/**
 * Sends a message to the Oracle and gets a response.
 * Persists conversation to DB (OracleMessage).
 */
export async function chatWithOracleAction(userId: string, message: string) {
    try {
        if (!userId) throw new Error("Unauthorized");

        // 1. Fetch Context
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                titan: true,
                wardensManifest: true,
            }
        });

        if (!user) throw new Error("User not found");

        // 2. Fetch recent conversation history
        const recentHistory = await prisma.oracleMessage.findMany({
            where: { userId },
            orderBy: { timestamp: "desc" },
            take: 10,
        });
        // Reverse to chronological order
        const history = recentHistory.reverse().map(m => ({
            role: m.role,
            content: m.content
        }));

        // 3. Save User Message
        await prisma.oracleMessage.create({
            data: {
                userId,
                role: "user",
                content: message,
            },
        });

        // 4. Generate Bio Context for Oracle
        const bioContext = `
      Hero: ${user.heroName || "Titan"} (Lvl ${user.level})
      Faction: ${user.faction}
      Path: ${user.activePath}
      Injured: ${user.titan?.isInjured ? "YES" : "NO"}
      Energy: ${user.titan?.currentEnergy || 0}/${user.titan?.maxEnergy || 100}
      Mood: ${user.titan?.mood || "NEUTRAL"}
    `;

        // 5. Call Gemini
        const responseText = await GeminiService.chat(message, history, bioContext);

        // 6. Save Oracle Response
        await prisma.oracleMessage.create({
            data: {
                userId,
                role: "agent",
                content: responseText,
            },
        });

        revalidatePath("/oracle");
        return { success: true, response: responseText };

    } catch (error: any) {
        console.error("Oracle Chat Error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Retrieves conversation history for the UI.
 */
export async function getOracleConversationAction(userId: string, limit = 50) {
    try {
        const messages = await prisma.oracleMessage.findMany({
            where: { userId },
            orderBy: { timestamp: "asc" },
            take: limit,
        });
        return { success: true, data: messages };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Clears the conversation history (context reset).
 */
export async function clearOracleHistoryAction(userId: string) {
    try {
        await prisma.oracleMessage.deleteMany({
            where: { userId },
        });
        revalidatePath("/oracle");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
