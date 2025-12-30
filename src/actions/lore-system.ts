"use server";

type LoreCategory = "WORLD" | "CHARACTER" | "HISTORY" | "BESTIARY" | "ARTIFACT";
type LoreRarity = "COMMON" | "UNCOMMON" | "RARE" | "LEGENDARY";

interface LoreEntry {
  id: string;
  category: LoreCategory;
  title: string;
  content: string;
  rarity: LoreRarity;
  unlockCondition: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
  relatedEntries?: string[];
}

interface LoreCollection {
  totalEntries: number;
  unlockedEntries: number;
  completionPercentage: number;
  byCategory: Record<LoreCategory, { total: number; unlocked: number }>;
}

// Sample lore entries
const LORE_DATABASE: LoreEntry[] = [
  // World Lore
  {
    id: "lore-world-001",
    category: "WORLD",
    title: "The Founding of IronForge",
    content:
      "In the age before ages, when titans still walked the earth, the first Iron Forge was lit. Not by mortal hands, but by the clash of two primordial forces: Will and Strength. Where their collision ignited the eternal flame, warriors from across the realm came to test their mettle...",
    rarity: "COMMON",
    unlockCondition: "Complete first workout",
    isUnlocked: true,
    relatedEntries: ["lore-world-002", "lore-character-001"],
  },
  {
    id: "lore-world-002",
    category: "WORLD",
    title: "The Iron Mines",
    content:
      "Beneath the Forge lie the endless Iron Mines, a labyrinth of tunnels where warriors descend to face increasingly powerful foes. It is said that at the deepest level awaits the Primal Titan - a being of pure iron will who has never been defeated...",
    rarity: "UNCOMMON",
    unlockCondition: "Reach dungeon floor 10",
    isUnlocked: false,
  },
  // Character Lore
  {
    id: "lore-character-001",
    category: "CHARACTER",
    title: "The Oracle",
    content:
      "The Oracle is neither alive nor dead, but something in between. Born from the collective wisdom of a thousand fallen warriors, it speaks with the voice of experience itself. Some say it can see the future; others claim it merely reads the patterns of progress...",
    rarity: "RARE",
    unlockCondition: "Reach level 20",
    isUnlocked: false,
    relatedEntries: ["lore-world-001"],
  },
  // Bestiary
  {
    id: "lore-bestiary-001",
    category: "BESTIARY",
    title: "Iron Golem",
    content:
      "The most common guardian of the mines, Iron Golems are animated constructs powered by crystallized workout essence. Each golem represents the abandoned progress of a warrior who gave up on their journey...",
    rarity: "COMMON",
    unlockCondition: "Defeat first enemy",
    isUnlocked: true,
  },
  // Artifacts
  {
    id: "lore-artifact-001",
    category: "ARTIFACT",
    title: "The First Barbell",
    content:
      "Legend speaks of the First Barbell, forged from the spine of a fallen titan. Those who wield it are said to channel the strength of all who lifted before them...",
    rarity: "LEGENDARY",
    unlockCondition: "Set 100 PRs",
    isUnlocked: false,
  },
];

/**
 * Get user's lore collection.
 */
export async function getLoreCollectionAction(
  userId: string,
): Promise<LoreCollection> {
  const unlocked = LORE_DATABASE.filter((l) => l.isUnlocked).length;

  const byCategory: Record<LoreCategory, { total: number; unlocked: number }> =
    {
      WORLD: { total: 0, unlocked: 0 },
      CHARACTER: { total: 0, unlocked: 0 },
      HISTORY: { total: 0, unlocked: 0 },
      BESTIARY: { total: 0, unlocked: 0 },
      ARTIFACT: { total: 0, unlocked: 0 },
    };

  for (const entry of LORE_DATABASE) {
    byCategory[entry.category].total++;
    if (entry.isUnlocked) byCategory[entry.category].unlocked++;
  }

  return {
    totalEntries: LORE_DATABASE.length,
    unlockedEntries: unlocked,
    completionPercentage: Math.round((unlocked / LORE_DATABASE.length) * 100),
    byCategory,
  };
}

/**
 * Get lore entries by category.
 */
export async function getLoreEntriesAction(
  userId: string,
  category?: LoreCategory,
): Promise<LoreEntry[]> {
  if (category) {
    return LORE_DATABASE.filter((l) => l.category === category);
  }
  return LORE_DATABASE;
}

/**
 * Get single lore entry.
 */
export async function getLoreEntryAction(
  userId: string,
  loreId: string,
): Promise<LoreEntry | null> {
  return LORE_DATABASE.find((l) => l.id === loreId) || null;
}

/**
 * Unlock a lore entry.
 */
export async function unlockLoreEntryAction(
  userId: string,
  loreId: string,
): Promise<{ success: boolean; entry?: LoreEntry }> {
  const entry = LORE_DATABASE.find((l) => l.id === loreId);
  if (!entry) return { success: false };

  console.log(`Unlocked lore: ${entry.title}`);
  return {
    success: true,
    entry: { ...entry, isUnlocked: true, unlockedAt: new Date() },
  };
}

/**
 * Check for lore unlocks based on user actions.
 */
export async function checkLoreUnlocksAction(
  userId: string,
  trigger: { type: string; value: number },
): Promise<LoreEntry[]> {
  const newUnlocks: LoreEntry[] = [];
  // In production, check conditions against user stats
  return newUnlocks;
}
