"use server";

import prisma from "@/lib/prisma";
import { AppSettings, Equipment } from "@/types";
import { z } from "zod";

// --- Schemas ---

const appSettingsSchema = z.object({
    intervalsApiKey: z.string().optional(),
    intervalsAthleteId: z.string().optional(),
    hevyApiKey: z.string().optional(),
    supabaseUrl: z.string().optional(),
    supabaseKey: z.string().optional(),
    valhallaId: z.string().optional(),
    heroName: z.string().optional(),
    hueBridgeIp: z.string().optional(),
    hueUsername: z.string().optional(),
    prioritizeHyperPro: z.boolean().optional(),
});

const equipmentSchema = z.object({
    id: z.string(),
    name: z.string(),
    category: z.enum(["Barbell", "Weights", "Machine", "Cardio", "Accessory", "Rack"]),
    isOwned: z.boolean(),
});

// --- Actions ---

export async function getOrCreateUserAction(email?: string) {
    if (email) {
        let user = await prisma.user.findUnique({
            where: { email },
            include: {
                equipment: true,
                skills: true,
                achievements: true,
                unlockedMonsters: true,
            },
        });

        if (!user) {
            user = await prisma.user.create({
                data: { email },
                include: {
                    equipment: true,
                    skills: true,
                    achievements: true,
                    unlockedMonsters: true,
                },
            });
        }
        return user;
    } else {
        // Single player / Fallback Mode
        // Check for existing users
        const users = await prisma.user.findMany({
            take: 1,
            include: {
                equipment: true,
                skills: true,
                achievements: true,
                unlockedMonsters: true,
            },
        });

        if (users.length > 0) return users[0];

        // Create default user
        return await prisma.user.create({
            data: { heroName: "IronLegend" },
            include: {
                equipment: true,
                skills: true,
                achievements: true,
                unlockedMonsters: true,
            },
        });
    }
}

export async function getUserAction(userId: string) {
    if (!userId) return null;

    return prisma.user.findUnique({
        where: { id: userId },
        include: {
            equipment: true,
            skills: true,
            achievements: true,
            unlockedMonsters: true,
        },
    });
}

export async function updateSettingsAction(userId: string, settings: Partial<AppSettings>) {
    // Validate basic structure (runtime check)
    // Note: z.parse might throw, we should handle error or let it bubble up
    // Depending on usage, we might want to return { success: boolean, error?: string }
    // For direct service replacement, bubbling error is okay, but strictly validated.

    const parsed = appSettingsSchema.partial().safeParse(settings);
    if (!parsed.success) {
        throw new Error("Invalid settings payload: " + parsed.error.message);
    }

    return prisma.user.update({
        where: { id: userId },
        data: {
            intervalsApiKey: settings.intervalsApiKey,
            intervalsAthleteId: settings.intervalsAthleteId,
            hevyApiKey: settings.hevyApiKey,
            prioritizeHyperPro: settings.prioritizeHyperPro,
            // Add other mapped fields if they exist in schema but are missing in direct type mapping
        },
    });
}

export async function updateGoldAction(userId: string, amount: number) {
    if (amount < 0 && Math.abs(amount) > Number.MAX_SAFE_INTEGER) {
        throw new Error("Invalid amount");
    }

    return prisma.user.update({
        where: { id: userId },
        data: { gold: amount },
    });
}

export async function updateEquipmentAction(userId: string, equipment: Equipment[]) {
    // Validate
    const parsed = z.array(equipmentSchema).safeParse(equipment);
    if (!parsed.success) {
        throw new Error("Invalid equipment payload");
    }

    const operations = equipment.map((eq) =>
        prisma.userEquipment.upsert({
            where: { userId_equipmentId: { userId, equipmentId: eq.id } },
            create: { userId, equipmentId: eq.id, isOwned: eq.isOwned },
            update: { isOwned: eq.isOwned },
        }),
    );
    return prisma.$transaction(operations);
}
