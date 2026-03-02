"use server";

import { RECIPES, ITEMS } from "@/data/gameData";
import { type UserInventory } from "@/types/game";
import { CraftItemSchema } from "@/types/schemas";
import { revalidatePath } from "next/cache";
import { authActionClient } from "@/lib/safe-action";

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

export const getInventoryAction = authActionClient
  .action(async ({ ctx: { userId } }) => {
    try {
      const inventory = await getInventory(userId);
      return { success: true, data: inventory };
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      return { success: false, message: "Failed to load inventory" };
    }
  });

export const craftItem = authActionClient
  .schema(CraftItemSchema)
  .action(async ({ parsedInput: { recipeId }, ctx: { userId } }) => {
    try {
      const recipe = RECIPES.find((r) => r.id === recipeId);
      if (!recipe) {
        return { success: false, message: "Recipe not found" };
      }

      // 1. Get User Inventory
      const inventory = await getInventory(userId);

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

      // 6. Save (Mock)
      console.log(`[Forge] Crafted ${recipe.name} for ${userId}`);

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
  });
