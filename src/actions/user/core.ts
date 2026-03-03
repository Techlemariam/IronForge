"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { Faction } from "@/types/prisma";
import { authActionClient } from "@/lib/safe-action";
import { z } from "zod";

export const updateFactionAction = authActionClient
  .schema(z.object({ faction: z.enum(["ALLIANCE", "HORDE"]) }))
  .action(async ({ parsedInput: { faction }, ctx: { userId } }) => {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { faction: faction as Faction },
      });

      revalidatePath("/", "layout");
      return { success: true };
    } catch (error) {
      console.error("Failed to update faction:", error);
      throw new Error("Failed to update faction");
    }
  });

export const updateArchetypeAction = authActionClient
  .schema(z.object({ archetype: z.any() })) // Still 'any' due to lack of strict typing for archetype, but safe from crash payload
  .action(async ({ parsedInput: { archetype }, ctx: { userId } }) => {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { archetype },
      });

      revalidatePath("/", "layout");
      return { success: true };
    } catch (error) {
      console.error("Failed to update archetype:", error);
      throw new Error("Failed to update archetype");
    }
  });

const ensureUserSchema = z.object({
  id: z.string().min(1).optional(),
  email: z.string().email().optional()
}).optional();

export const ensureUserAction = authActionClient
  .schema(ensureUserSchema)
  .action(async ({ parsedInput, ctx: { userId, user } }) => {
    // If not provided in input, fallback to context (preferred default behavior)
    const id = parsedInput?.id || userId;
    const email = parsedInput?.email || user?.email;

    try {
      const existing = await prisma.user.findUnique({ where: { id } });
      if (existing) return { success: true, data: existing };

      const newUser = await prisma.user.create({
        data: {
          id,
          email,
          gold: 0,
          level: 1,
          totalExperience: 0,
          faction: "HORDE", // Default
        },
      });

      revalidatePath("/", "layout");
      return { success: true, data: newUser };
    } catch (error) {
      console.error("Failed to ensure user:", error);
      throw new Error("Failed to ensure user");
    }
  });
