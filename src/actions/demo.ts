"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function toggleDemoModeAction(enabled: boolean) {
  const cookieStore = await cookies();

  if (enabled) {
    cookieStore.set("ironforge_demo_mode", "true", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } else {
    cookieStore.delete("ironforge_demo_mode");
  }

  revalidatePath("/");
  return { success: true };
}

export async function getDemoModeStatus() {
  const cookieStore = await cookies();
  return cookieStore.has("ironforge_demo_mode");
}
