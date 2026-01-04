"use server";

import { revalidatePath } from "next/cache";

type ItemCategory =
  | "CONSUMABLE"
  | "EQUIPMENT"
  | "MATERIAL"
  | "COSMETIC"
  | "BOOST";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  price: number;
  currency: "GOLD" | "GEMS";
  stock: number | null; // null = unlimited
  owned: number;
  requiresLevel?: number;
  discount?: number;
}

interface ShopSection {
  id: string;
  name: string;
  items: ShopItem[];
  refreshesAt?: Date;
}

const SHOP_INVENTORY: ShopSection[] = [
  {
    id: "consumables",
    name: "Consumables",
    items: [
      {
        id: "potion-health",
        name: "Health Potion",
        description: "Restores 50 HP",
        category: "CONSUMABLE",
        price: 50,
        currency: "GOLD",
        stock: null,
        owned: 5,
      },
      {
        id: "potion-energy",
        name: "Energy Potion",
        description: "Restores 25 energy",
        category: "CONSUMABLE",
        price: 75,
        currency: "GOLD",
        stock: null,
        owned: 2,
      },
      {
        id: "potion-xp",
        name: "XP Elixir",
        description: "+50% XP for 1 hour",
        category: "BOOST",
        price: 200,
        currency: "GOLD",
        stock: 3,
        owned: 0,
      },
    ],
  },
  {
    id: "equipment",
    name: "Equipment",
    items: [
      {
        id: "sword-steel",
        name: "Steel Sword",
        description: "+15 attack",
        category: "EQUIPMENT",
        price: 500,
        currency: "GOLD",
        stock: 1,
        owned: 0,
      },
      {
        id: "armor-iron",
        name: "Iron Armor",
        description: "+20 defense",
        category: "EQUIPMENT",
        price: 600,
        currency: "GOLD",
        stock: 1,
        owned: 0,
      },
      {
        id: "ring-might",
        name: "Ring of Might",
        description: "+5% strength",
        category: "EQUIPMENT",
        price: 1000,
        currency: "GOLD",
        stock: 1,
        owned: 0,
        requiresLevel: 20,
      },
    ],
  },
  {
    id: "daily-deals",
    name: "Daily Deals",
    refreshesAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    items: [
      {
        id: "deal-crate",
        name: "Mystery Crate",
        description: "Random rare reward",
        category: "CONSUMABLE",
        price: 150,
        currency: "GOLD",
        stock: 1,
        owned: 0,
        discount: 50,
      },
    ],
  },
];

/**
 * Get shop inventory.
 */
export async function getShopInventoryAction(
  userId: string,
): Promise<ShopSection[]> {
  return SHOP_INVENTORY;
}

/**
 * Buy item from shop.
 */
export async function buyItemAction(
  userId: string,
  itemId: string,
  quantity: number = 1,
): Promise<{ success: boolean; message: string; newBalance?: number }> {
  const allItems = SHOP_INVENTORY.flatMap((s) => s.items);
  const item = allItems.find((i) => i.id === itemId);

  if (!item) return { success: false, message: "Item not found" };
  if (item.stock !== null && item.stock < quantity)
    return { success: false, message: "Not enough stock" };

  const totalCost = item.price * quantity * (1 - (item.discount || 0) / 100);
  console.log(
    `Purchased ${quantity}x ${item.name} for ${totalCost} ${item.currency}`,
  );
  revalidatePath("/shop");

  return {
    success: true,
    message: `Purchased ${quantity}x ${item.name}`,
    newBalance: 1000 - totalCost,
  };
}

/**
 * Sell item.
 */
export async function sellItemAction(
  userId: string,
  itemId: string,
  quantity: number = 1,
): Promise<{ success: boolean; goldReceived: number }> {
  // Items sell for 50% of their buy price
  const sellPrice = 50 * quantity;
  console.log(`Sold ${quantity}x ${itemId} for ${sellPrice} gold`);
  revalidatePath("/inventory");

  return { success: true, goldReceived: sellPrice };
}

/**
 * Get user's gold balance.
 */
export async function getGoldBalanceAction(userId: string): Promise<number> {
  return 2500;
}

/**
 * Check if user can afford item.
 */
export async function canAffordItemAction(
  userId: string,
  itemId: string,
  quantity: number,
): Promise<boolean> {
  const balance = await getGoldBalanceAction(userId);
  const allItems = SHOP_INVENTORY.flatMap((s) => s.items);
  const item = allItems.find((i) => i.id === itemId);
  if (!item) return false;
  return balance >= item.price * quantity;
}
