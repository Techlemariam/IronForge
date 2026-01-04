"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type SkinTone = "PALE" | "FAIR" | "MEDIUM" | "TAN" | "DARK" | "EBONY";
type HairStyle = "BALD" | "SHORT" | "MEDIUM" | "LONG" | "MOHAWK" | "BRAIDED";
type HairColor =
  | "BLACK"
  | "BROWN"
  | "BLONDE"
  | "RED"
  | "GRAY"
  | "WHITE"
  | "BLUE"
  | "PURPLE";
type ArmorSlot = "HEAD" | "CHEST" | "HANDS" | "LEGS" | "FEET" | "BACK";
type EquipmentRarity = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";

interface TitanAppearance {
  skinTone: SkinTone;
  hairStyle: HairStyle;
  hairColor: HairColor;
  beardStyle?: string;
  scars?: string[];
  tattoos?: string[];
  eyeColor: string;
}

interface EquippedItem {
  slot: ArmorSlot;
  itemId: string;
  name: string;
  rarity: EquipmentRarity;
  stats: Record<string, number>;
  visualId: string;
}

interface TitanCustomization {
  appearance: TitanAppearance;
  equipment: EquippedItem[];
  title?: string;
  frame?: string;
  aura?: string;
  pose?: string;
}

const DEFAULT_APPEARANCE: TitanAppearance = {
  skinTone: "MEDIUM",
  hairStyle: "SHORT",
  hairColor: "BROWN",
  eyeColor: "#4a90d9",
};

/**
 * Get user's Titan customization.
 */
export async function getTitanCustomizationAction(
  userId: string,
): Promise<TitanCustomization> {
  try {
    const titan = await prisma.titan.findFirst({
      where: { userId },
    });

    // MVP: Return default customization
    return {
      appearance: DEFAULT_APPEARANCE,
      equipment: [
        {
          slot: "CHEST",
          itemId: "armor-iron",
          name: "Iron Plate",
          rarity: "COMMON",
          stats: { defense: 10 },
          visualId: "iron-chest",
        },
        {
          slot: "HANDS",
          itemId: "gloves-leather",
          name: "Leather Gloves",
          rarity: "COMMON",
          stats: { grip: 5 },
          visualId: "leather-hands",
        },
      ],
      title: "Iron Initiate",
      frame: "basic",
    };
  } catch (error) {
    console.error("Error getting titan customization:", error);
    return { appearance: DEFAULT_APPEARANCE, equipment: [] };
  }
}

/**
 * Update Titan appearance.
 */
export async function updateTitanAppearanceAction(
  userId: string,
  updates: Partial<TitanAppearance>,
): Promise<{ success: boolean }> {
  try {
    console.log(`Updated titan appearance for ${userId}:`, updates);
    revalidatePath("/titan");
    return { success: true };
  } catch (error) {
    console.error("Error updating appearance:", error);
    return { success: false };
  }
}

/**
 * Equip an item.
 */
export async function equipItemAction(
  userId: string,
  itemId: string,
  slot: ArmorSlot,
): Promise<{ success: boolean; unequipped?: string }> {
  try {
    console.log(`Equipped ${itemId} to ${slot} for ${userId}`);
    revalidatePath("/titan");
    return { success: true };
  } catch (error) {
    console.error("Error equipping item:", error);
    return { success: false };
  }
}

/**
 * Unequip an item.
 */
export async function unequipItemAction(
  userId: string,
  slot: ArmorSlot,
): Promise<{ success: boolean }> {
  try {
    console.log(`Unequipped ${slot} for ${userId}`);
    revalidatePath("/titan");
    return { success: true };
  } catch (error) {
    console.error("Error unequipping item:", error);
    return { success: false };
  }
}

/**
 * Set active title.
 */
export async function setTitanTitleAction(
  userId: string,
  titleId: string,
): Promise<{ success: boolean }> {
  try {
    console.log(`Set title for ${userId}: ${titleId}`);
    revalidatePath("/titan");
    return { success: true };
  } catch (error) {
    console.error("Error setting title:", error);
    return { success: false };
  }
}

/**
 * Get available customization options.
 */
export function getCustomizationOptions() {
  return {
    skinTones: ["PALE", "FAIR", "MEDIUM", "TAN", "DARK", "EBONY"],
    hairStyles: ["BALD", "SHORT", "MEDIUM", "LONG", "MOHAWK", "BRAIDED"],
    hairColors: [
      "BLACK",
      "BROWN",
      "BLONDE",
      "RED",
      "GRAY",
      "WHITE",
      "BLUE",
      "PURPLE",
    ],
    eyeColors: [
      "#4a90d9",
      "#8b5a2b",
      "#228b22",
      "#808080",
      "#800020",
      "#9932cc",
    ],
  };
}
