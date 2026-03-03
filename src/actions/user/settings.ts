"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authActionClient } from "@/lib/safe-action";

export interface UserPreferences {
    liteMode?: boolean;
    theme?: "light" | "dark" | "system";
    // Add more preferences here as needed
}

const userPreferencesSchema = z.object({
    liteMode: z.boolean().optional(),
    theme: z.enum(["light", "dark", "system"]).optional(),
});

export const updateUserPreferencesAction = authActionClient
    .schema(userPreferencesSchema)
    .action(async ({ parsedInput: preferences, ctx: { userId } }) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { preferences: true },
            });

            const currentPreferences = (user?.preferences as UserPreferences) || {};
            const updatedPreferences = { ...currentPreferences, ...preferences };

            await prisma.user.update({
                where: { id: userId },
                data: { preferences: updatedPreferences },
            });

            revalidatePath("/settings");
            revalidatePath("/dashboard");
            return { success: true };
        } catch (error) {
            console.error("Error updating user preferences:", error);
            throw new Error("Failed to update preferences");
        }
    });

export const getUserPreferencesAction = authActionClient
    .action(async ({ ctx: { userId } }) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { preferences: true },
            });
            return (user?.preferences as UserPreferences) || {}; // Fallback typed cleanly
        } catch (error) {
            console.error("Error getting user preferences:", error);
            return {};
        }
    });
