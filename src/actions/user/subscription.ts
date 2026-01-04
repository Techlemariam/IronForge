"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type SubscriptionTier = "FREE" | "COACH" | "PRO" | "ELITE";

interface SubscriptionInfo {
  tier: SubscriptionTier;
  features: string[];
  expiresAt?: Date;
  isActive: boolean;
}

interface CoachFeatures {
  advancedAnalytics: boolean;
  aiPeriodization: boolean;
  volumeL4Access: boolean;
  oracleDeepInsights: boolean;
  prioritySupport: boolean;
  customPrograms: boolean;
  exportData: boolean;
  teamManagement: boolean;
}

const TIER_FEATURES: Record<SubscriptionTier, CoachFeatures> = {
  FREE: {
    advancedAnalytics: false,
    aiPeriodization: false,
    volumeL4Access: false,
    oracleDeepInsights: false,
    prioritySupport: false,
    customPrograms: false,
    exportData: false,
    teamManagement: false,
  },
  COACH: {
    advancedAnalytics: true,
    aiPeriodization: true,
    volumeL4Access: true,
    oracleDeepInsights: false,
    prioritySupport: false,
    customPrograms: true,
    exportData: true,
    teamManagement: false,
  },
  PRO: {
    advancedAnalytics: true,
    aiPeriodization: true,
    volumeL4Access: true,
    oracleDeepInsights: true,
    prioritySupport: true,
    customPrograms: true,
    exportData: true,
    teamManagement: false,
  },
  ELITE: {
    advancedAnalytics: true,
    aiPeriodization: true,
    volumeL4Access: true,
    oracleDeepInsights: true,
    prioritySupport: true,
    customPrograms: true,
    exportData: true,
    teamManagement: true,
  },
};

const TIER_PRICES: Record<
  Exclude<SubscriptionTier, "FREE">,
  { monthly: number; yearly: number }
> = {
  COACH: { monthly: 9.99, yearly: 99.99 },
  PRO: { monthly: 19.99, yearly: 199.99 },
  ELITE: { monthly: 49.99, yearly: 499.99 },
};

/**
 * Get user's current subscription.
 */
export async function getSubscriptionAction(
  userId: string,
): Promise<SubscriptionInfo> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true, subscriptionExpiry: true },
    });

    const tier = (user?.subscriptionTier as SubscriptionTier) || "FREE";
    const expiresAt = user?.subscriptionExpiry || undefined;
    const isActive =
      tier === "FREE" || !expiresAt || new Date(expiresAt) > new Date();

    const featureList = Object.entries(TIER_FEATURES[tier])
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => formatFeatureName(feature));

    return {
      tier,
      features: featureList,
      expiresAt,
      isActive,
    };
  } catch (error) {
    console.error("Error getting subscription:", error);
    return { tier: "FREE", features: [], isActive: true };
  }
}

/**
 * Check if user has access to specific feature.
 */
export async function hasFeatureAccessAction(
  userId: string,
  feature: keyof CoachFeatures,
): Promise<boolean> {
  try {
    const subscription = await getSubscriptionAction(userId);
    if (!subscription.isActive) return false;

    return TIER_FEATURES[subscription.tier][feature];
  } catch (error) {
    console.error("Error checking feature access:", error);
    return false;
  }
}

/**
 * Upgrade subscription (mock - would integrate with Stripe).
 */
export async function upgradeSubscriptionAction(
  userId: string,
  tier: Exclude<SubscriptionTier, "FREE">,
  billingPeriod: "MONTHLY" | "YEARLY",
): Promise<{ success: boolean; checkoutUrl?: string; error?: string }> {
  try {
    // In production, create Stripe checkout session
    const price =
      billingPeriod === "YEARLY"
        ? TIER_PRICES[tier].yearly
        : TIER_PRICES[tier].monthly;

    console.log(
      `Upgrade request: user=${userId}, tier=${tier}, price=${price}`,
    );

    // Mock checkout URL
    const checkoutUrl = `/checkout?tier=${tier}&period=${billingPeriod}`;

    return { success: true, checkoutUrl };
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    return { success: false, error: "Failed to start upgrade" };
  }
}

/**
 * Cancel subscription.
 */
export async function cancelSubscriptionAction(
  userId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // In production, cancel via Stripe and update DB
    console.log(`Cancellation request: user=${userId}`);

    revalidatePath("/settings");
    return {
      success: true,
      message:
        "Subscription cancelled. You'll retain access until the end of the billing period.",
    };
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return { success: false, message: "Failed to cancel subscription" };
  }
}

/**
 * Get available subscription tiers with pricing.
 */
export function getSubscriptionTiers() {
  return {
    FREE: {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      features: [
        "Basic workout tracking",
        "Achievement system",
        "Combat system",
      ],
    },
    COACH: {
      name: "Coach",
      price: TIER_PRICES.COACH,
      features: [
        "Advanced analytics",
        "AI Periodization",
        "Volume L4",
        "Custom programs",
        "Data export",
      ],
    },
    PRO: {
      name: "Pro",
      price: TIER_PRICES.PRO,
      features: [
        "Everything in Coach",
        "Oracle Deep Insights",
        "Priority support",
      ],
    },
    ELITE: {
      name: "Elite",
      price: TIER_PRICES.ELITE,
      features: ["Everything in Pro", "Team management", "White-label options"],
    },
  };
}

function formatFeatureName(feature: string): string {
  return feature
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
