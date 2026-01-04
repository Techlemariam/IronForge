"use server";

import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const pushSubscriptionSchema = z.object({
  endpoint: z.string(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export type SubscribePushResult =
  | { success: true }
  | { success: false; error: string };

export async function subscribeToPushNotificationsAction(
  subscription: z.infer<typeof pushSubscriptionSchema>
): Promise<SubscribePushResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = pushSubscriptionSchema.safeParse(subscription);
  if (!parsed.success) {
    return { success: false, error: "Invalid subscription data" };
  }

  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint: parsed.data.endpoint },
      update: {
        userId: user.id,
        keys: parsed.data.keys,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        endpoint: parsed.data.endpoint,
        keys: parsed.data.keys,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[Push Subscribe] Error:", error);
    return { success: false, error: "Failed to save subscription" };
  }
}
