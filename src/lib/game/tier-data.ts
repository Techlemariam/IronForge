import { RARITY_COLORS } from '@/config/rarity';

export const LEAGUE_TIERS = [
  {
    id: 'bronze',
    name: 'Bronze League',
    minRating: 0,
    maxRating: 1199,
    color: RARITY_COLORS.BRONZE,
    icon: '🥉',
  },
  {
    id: 'silver',
    name: 'Silver League',
    minRating: 1200,
    maxRating: 1399,
    color: RARITY_COLORS.SILVER,
    icon: '🥈',
  },
  {
    id: 'gold',
    name: 'Gold League',
    minRating: 1400,
    maxRating: 1599,
    color: RARITY_COLORS.GOLD,
    icon: '🥇',
  },
  {
    id: 'platinum',
    name: 'Platinum League',
    minRating: 1600,
    maxRating: 1799,
    color: RARITY_COLORS.PLATINUM,
    icon: '💎',
  },
  {
    id: 'diamond',
    name: 'Diamond League',
    minRating: 1800,
    maxRating: 1999,
    color: RARITY_COLORS.DIAMOND,
    icon: '💠',
  },
  {
    id: 'master',
    name: 'Master League',
    minRating: 2000,
    maxRating: 2199,
    color: RARITY_COLORS.EPIC,
    icon: '🏆',
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    minRating: 2200,
    maxRating: 2399,
    color: RARITY_COLORS.LEGENDARY,
    icon: '👑',
  },
  {
    id: 'legend',
    name: 'Iron Legend',
    minRating: 2400,
    maxRating: Number.POSITIVE_INFINITY,
    color: RARITY_COLORS.ARTIFACT,
    icon: '⚔️',
  },
] as const;

export interface LeagueInfo {
  tier: (typeof LEAGUE_TIERS)[number];
  rank: number;
  totalInLeague: number;
  seasonPoints: number;
  seasonWins: number;
  seasonLosses: number;
  nextTier?: (typeof LEAGUE_TIERS)[number];
  pointsToNextTier?: number;
}
