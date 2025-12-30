export type ItemType = "material" | "consumable" | "equipment" | "currency";
export type ItemRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic";

export interface GameItem {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  effect?: string; // e.g. "+10% XP", "Restores 50 HP"
  value: number; // Gold value
  image: string; // Emoji or URL
  stackable: boolean;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  resultItemId: string;
  resultCount: number;
  materials: { itemId: string; count: number }[];
  goldCost: number;
  requiredLevel?: number;
  craftingTimeSeconds?: number;
}

export interface InventorySlot {
  itemId: string;
  count: number;
}

export interface UserInventory {
  userId: string;
  gold: number;
  items: InventorySlot[];
}
