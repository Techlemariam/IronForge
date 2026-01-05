"use server";

import { RECIPES, ITEMS } from "@/data/gameData";
import { type UserInventory, type CraftingRecipe, type InventorySlot } from "@/types/game";
import { createClient } from "@/utils/supabase/server";
import { CraftItemSchema } from "@/types/schemas";
import { revalidatePath } from "next/cache";

/**
 * Mock Inventory for MVP (until DB schema is finalized)
 * In production, this would fetch from 'inventory' table.
 */
// const MOCK_INVENTORY_KEY = "mock_inventory_state";

// Helper to get inventory (Replace with DB call later)
async function getInventory(userId: string): Promise<UserInventory> {
  // TODO: Fetch from actual DB
  // Current Block: Database schema 'UserEquipment' does not support stackable items (count).
  // Requires schema update to support resources/materials.
  // For now, we simulate a basic inventory so the UI works
  return {
    userId,
    gold: 500,
    items: [
      { itemId: "item_iron_ore", count: 10 },
      { itemId: "item_flux", count: 5 },
    ],
  };
}

export async function craftItem(
  recipeId: string,
): Promise<{ success: boolean; message: string; inventory?: UserInventory }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Unauthorized" };
    }

    const validated = CraftItemSchema.parse({ recipeId });
    const recipe = RECIPES.find((r) => r.id === validated.recipeId);
    if (!recipe) {
      return { success: false, message: "Recipe not found" };
    }

    // 1. Get User Inventory
    const inventory = await getInventory(user.id);

    // 2. Validate Gold
    if (inventory.gold < recipe.goldCost) {
      return { success: false, message: "Not enough gold" };
    }

    // 3. Validate Materials
    for (const mat of recipe.materials) {
      const slot = inventory.items.find((i) => i.itemId === mat.itemId);
      if (!slot || slot.count < mat.count) {
        const matName =
          ITEMS.find((i) => i.id === mat.itemId)?.name || mat.itemId;
        return { success: false, message: `Missing materials: ${matName}` };
      }
    }

    // 4. Deduct Resources (Mock Logic - In DB this would be a transaction)
    inventory.gold -= recipe.goldCost;
    recipe.materials.forEach((mat) => {
      const slot = inventory.items.find((i) => i.itemId === mat.itemId)!;
      slot.count -= mat.count;
      // Remove slot if 0? Or keep empty? Let's keep for now or filter out.
      if (slot.count <= 0) {
        inventory.items = inventory.items.filter(
          (i) => i.itemId !== mat.itemId,
        );
      }
    });

    // 5. Add Result
    const resultSlot = inventory.items.find(
      (i) => i.itemId === recipe.resultItemId,
    );
    if (resultSlot) {
      resultSlot.count += recipe.resultCount;
    } else {
      inventory.items.push({
        itemId: recipe.resultItemId,
        count: recipe.resultCount,
      });
    }

    // 6. Save (Mock - No Persist yet in this MVP step, just return success)
    console.log(`[Forge] Crafted ${recipe.name} for ${user.email}`);

    revalidatePath("/dashboard");
    return {
      success: true,
      message: `Successfully crafted ${recipe.name}`,
      inventory,
    };
  } catch (error) {
    console.error("Crafting error:", error);
    return { success: false, message: "Server error during crafting" };
  }
}
