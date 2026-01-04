"use server";

import prisma from "@/lib/prisma";
import { OracleService } from "@/services/oracle";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function generateDailyDecreeAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    // Generate Decree using the Service
    const decree = await OracleService.generateDailyDecree(user.id);

    // Persist to Titan Model
    // We need to find the Titan associated with the user first to get ID, or update via user relation
    const titan = await prisma.titan.findFirst({
      where: { userId: user.id },
    });

    if (titan) {
      await prisma.titan.update({
        where: { id: titan.id },
        data: {
          dailyDecree: decree as any, // Casting strictly to JSON compatible
        },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/citadel");

    return { success: true, data: decree };
  } catch (error: any) {
    console.error("Failed to generate Oracle Decree:", error.message);
    return { success: false, error: error.message };
  }
}
