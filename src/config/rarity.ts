/**
 * Centralized Rarity Color Registry
 * These should match the CSS variables defined in globals.css
 */

export const RARITY_COLORS = {
  POOR: 'var(--color-rarity-poor)',
  COMMON: 'var(--color-rarity-common)',
  UNCOMMON: 'var(--color-rarity-uncommon)',
  RARE: 'var(--color-rarity-rare)',
  EPIC: 'var(--color-rarity-epic)',
  LEGENDARY: 'var(--color-rarity-legendary)',
  ARTIFACT: 'var(--color-rarity-artifact)',
  GOLD: 'var(--color-rarity-gold)',
  GOLD_LIGHT: '#ffec8b',
  GOLD_DARK: '#daa520',
  // League Colors
  BRONZE: '#cd7f32',
  SILVER: '#c0c0c0',
  PLATINUM: '#e5e4e2',
  DIAMOND: '#b9f2ff',
} as const;

export const RARITY_HEX_ARRAY = [
  RARITY_COLORS.POOR,
  RARITY_COLORS.COMMON,
  RARITY_COLORS.UNCOMMON,
  RARITY_COLORS.RARE,
  RARITY_COLORS.EPIC,
  RARITY_COLORS.LEGENDARY,
  RARITY_COLORS.ARTIFACT,
];
