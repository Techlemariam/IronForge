'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// --- Types & Schemas ---
const CreateGuildSchema = z.object({
    name: z.string().min(3).max(20),
    description: z.string().optional()
});

/**
 * Creates a new Guild and assigns the creator as the first member.
 */
export async function createGuildAction(userId: string, data: { name: string, description?: string }) {
    try {
        const validated = CreateGuildSchema.parse(data);

        // Transaction to ensure atomicity
        const guild = await prisma.$transaction(async (tx) => {
            const newGuild = await tx.guild.create({
                data: {
                    name: validated.name,
                    description: validated.description
                }
            });

            await tx.user.update({
                where: { id: userId },
                data: { guildId: newGuild.id }
            });

            return newGuild;
        });

        // Trigger achievement check? "Join the Horde" might trigger here too since they joined a guild.
        // Lazy loading achievement check via client or explicit call.

        revalidatePath('/dashboard');
        return { success: true, guild };
    } catch (error) {
        console.error('Create Guild Error:', error);
        return { success: false, error: 'Failed to create guild. Name might be taken.' };
    }
}

/**
 * Joins an existing Guild.
 */
export async function joinGuildAction(userId: string, guildId: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { guildId }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to join guild' };
    }
}

/**
 * Get Guild details including current Raid.
 */
export async function getGuildAction(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { guild: { include: { raids: true, members: { take: 10 } } } }
    });

    if (!user?.guild) return null;

    // Find active raid
    // Simple logic: the one that ends in future
    const activeRaid = user.guild.raids.find(r => new Date(r.endDate) > new Date());

    return {
        ...user.guild,
        activeRaid
    };
}

/**
 * Start a new Raid (Admin/Leader function, or auto-generated).
 */
export async function startRaidAction(guildId: string, bossName: string, hp: number, durationDays: number = 7) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const raid = await prisma.guildRaid.create({
        data: {
            guildId,
            bossName,
            totalHp: hp,
            currentHp: hp,
            endDate
        }
    });

    revalidatePath('/dashboard');
    return raid;
}

/**
 * Contribute damage to the active raid.
 */
export async function contributeToRaidAction(userId: string, raidId: string, damage: number) {
    try {
        const raid = await prisma.guildRaid.findUnique({ where: { id: raidId } });
        if (!raid || raid.currentHp <= 0) return { success: false, error: 'Raid ended or invalid' };

        const newHp = Math.max(0, raid.currentHp - damage);

        await prisma.$transaction([
            prisma.guildRaidContribution.create({
                data: {
                    raidId,
                    userId,
                    damage
                }
            }),
            prisma.guildRaid.update({
                where: { id: raidId },
                data: { currentHp: newHp }
            })
        ]);

        if (newHp === 0) {
            // Did we just kill it?
            if (raid.currentHp > 0) {
                // Boss killed logic: Rewards!
                // Trigger ACHIEVEMENT: BOSS_SLAYER
                // We'll let the client trigger check or do it here.
                const { checkAchievementsAction } = await import('@/actions/achievements');
                await checkAchievementsAction(userId);
            }
        }

        revalidatePath('/dashboard');
        return { success: true, damageDealt: damage, bossDead: newHp === 0 };
    } catch (e) {
        console.error(e);
        return { success: false, error: 'Attack failed' };
    }
}
