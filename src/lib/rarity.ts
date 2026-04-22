/**
 * Brotherhood Rarity Protocol - IronForge Registry
 *
 * Maps IronForge's RPG & training states to the global rarity standard.
 * Rarity tiers drive all visual state indicators (badges, progress, alerts).
 */

export const RARITY_COLORS = {
  POOR: 'var(--color-rarity-poor)',
  COMMON: 'var(--color-rarity-common)',
  UNCOMMON: 'var(--color-rarity-uncommon)',
  RARE: 'var(--color-rarity-rare)',
  EPIC: 'var(--color-rarity-epic)',
  LEGENDARY: 'var(--color-rarity-legendary)',
  GOLD: 'var(--color-rarity-gold)',
} as const;

export type RarityTier = keyof typeof RARITY_COLORS;

/**
 * IronForge-specific state mapping
 */
export const GAME_STATE_TO_RARITY: Record<string, RarityTier> = {
  // Training states
  'inactive': 'POOR',
  'ready': 'COMMON',
  'active': 'UNCOMMON',
  'streak': 'RARE',
  'peak': 'EPIC',
  'legendary-run': 'LEGENDARY',

  // RPG rank states
  'recruit': 'COMMON',
  'soldier': 'UNCOMMON',
  'veteran': 'RARE',
  'elite': 'EPIC',
  'titan': 'LEGENDARY',

  // Meta / UI
  'warning': 'GOLD',
  'achievement': 'LEGENDARY',
  'prediction': 'EPIC',
};
