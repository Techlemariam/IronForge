"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

// --- Types & Schemas ---
const CreateGuildSchema = z.object({
  name: z.string().min(3).max(20),
  description: z.string().optional(),
});

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

/**
 * Create a new guild and assign the creator as a member.
 */
export async function createGuildAction(data: { name: string; description?: string }) {
  try {
    const user = await getAuthenticatedUser();
    const validated = CreateGuildSchema.parse(data);

    const guild = await prisma.$transaction(async (tx) => {
      const g = await tx.guild.create({
        data: {
          name: validated.name,
          tag: validated.name.substring(0, 4).toUpperCase(), // Auto-generate tag to satisfy schema
          description: validated.description,
          leaderId: user.id,
          isPublic: true,
          minLevel: 1,
          xp: 0,
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { guildId: g.id },
      });

      return g;
    });

    revalidatePath("/dashboard");
    return { success: true, guild };
  } catch (error) {
    return { success: false, error: "Failed to create guild" };
  }
}

/**
 * Join an existing guild.
 */
export async function joinGuildAction(guildId: string) {
  try {
    const user = await getAuthenticatedUser();

    await prisma.user.update({
      where: { id: user.id },
      data: { guildId },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Failed to join guild" };
  }
}

/**
 * Get Guild details including current Raid.
 */
export async function getGuildAction() {
  // We handle auth gracefully here returning null if no user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { guild: { include: { raids: true, members: { take: 10 } } } },
  });

  if (!dbUser?.guild) return null;

  // Find active raid
  // Simple logic: the one that ends in future
  const activeRaid = dbUser.guild.raids.find(
    (r) => new Date(r.endDate) > new Date(),
  );

  return {
    ...dbUser.guild,
    activeRaid,
  };
}

/**
 * Start a new Raid (Admin/Leader function, or auto-generated).
 */
export async function startRaidAction(
  guildId: string,
  bossName: string,
  hp: number,
  durationDays: number = 7,
) {
  try {
    const user = await getAuthenticatedUser();

    // Verify user is leader of the guild
    const guild = await prisma.guild.findUnique({
      where: { id: guildId },
      select: { leaderId: true },
    });

    if (!guild) {
      return { success: false, error: "Guild not found" };
    }

    if (guild.leaderId !== user.id) {
      return { success: false, error: "Unauthorized: Only guild leader can start raids" };
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const raid = await prisma.guildRaid.create({
      data: {
        guildId,
        bossName,
        totalHp: hp,
        currentHp: hp,
        endDate,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, raid };
  } catch (error) {
    console.error("Failed to start raid:", error);
    return { success: false, error: "Failed to start raid" };
  }
}

/**
 * Contribute damage to the active raid.
 */
export async function contributeToRaidAction(raidId: string, damage: number) {
  try {
    const user = await getAuthenticatedUser();

    const raid = await prisma.guildRaid.findUnique({ where: { id: raidId } });
    if (!raid || Number(raid.currentHp) <= 0)
      return { success: false, error: "Raid ended or invalid" };

    // Assuming currentHp is BigInt in Prisma schema?
    // In previous view it was accessed as raid.currentHp <= 0.
    // If it is BigInt, we need BigInt literals or conversion.
    // Let's assume it is Int or BigInt.
    // If Int, Math.max works. If BigInt, need logic.
    // Usually HP is Int unless huge.
    // Let's safe cast.

    // Check types from view_file:
    // 97: totalHp: hp,
    // 115: const newHp = Math.max(0, raid.currentHp - damage);
    // This suggests it is number, not BigInt.
    // If it was BigInt, Math.max would fail or need explicit handling.
    // I will keep it as number to match previous code style unless I know schema.

    const newHp = Math.max(0, Number(raid.currentHp) - damage);

    await prisma.$transaction([
      prisma.guildRaidContribution.create({
        data: {
          raidId,
          userId: user.id,
          damage,
        },
      }),
      prisma.guildRaid.update({
        where: { id: raidId },
        data: { currentHp: newHp },
      }),
    ]);

    if (newHp === 0) {
      if (raid.currentHp > 0) {
        // Boss killed logic
        const { checkAchievementsAction } =
          await import("@/actions/progression/achievements");
        await checkAchievementsAction(user.id);
      }
    }

    revalidatePath("/dashboard");
    return { success: true, damageDealt: damage, bossDead: newHp === 0 };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Attack failed" };
  }
}
