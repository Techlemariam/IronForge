"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { authActionClient } from "@/lib/safe-action";

export const deleteAccountAction = authActionClient
  .action(async ({ ctx: { userId } }) => {
    const supabase = await createClient();

    try {
      // Delete user data from Prisma/DB first
      await prisma.user.delete({
        where: { id: userId },
      });

      // Sign out the user (Supabase admin delete requires service role,
      // so we just sign out and let Supabase handle user deletion via their dashboard/policy)
      await supabase.auth.signOut();

      revalidatePath("/", "layout");
      return { success: true };
    } catch (error) {
      console.error("Failed to delete account:", error);
      throw new Error("Failed to delete account. Please contact support.");
    }
  });

export const signOutAction = authActionClient
  .action(async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
  });
