export const LEAGUE_TIERS = [
    {
        id: "bronze",
        name: "Bronze League",
        minRating: 0,
        maxRating: 1199,
        color: "#cd7f32",
        icon: "🥉",
    },
    {
        id: "silver",
        name: "Silver League",
        minRating: 1200,
        maxRating: 1399,
        color: "#c0c0c0",
        icon: "🥈",
    },
    {
        id: "gold",
        name: "Gold League",
        minRating: 1400,
        maxRating: 1599,
        color: "var(--color-gold-bright)",
        icon: "🥇",
    },
    {
        id: "platinum",
        name: "Platinum League",
        minRating: 1600,
        maxRating: 1799,
        color: "#e5e4e2",
        icon: "💎",
    },
    {
        id: "diamond",
        name: "Diamond League",
        minRating: 1800,
        maxRating: 1999,
        color: "#b9f2ff",
        icon: "💠",
    },
    {
        id: "master",
        name: "Master League",
        minRating: 2000,
        maxRating: 2199,
        color: "var(--color-warp)",
        icon: "🏆",
    },
    {
        id: "grandmaster",
        name: "Grandmaster",
        minRating: 2200,
        maxRating: 2399,
        color: "var(--color-legend)",
        icon: "👑",
    },
    {
        id: "legend",
        name: "Iron Legend",
        minRating: 2400,
        maxRating: Infinity,
        color: "#e6cc80",
        icon: "⚔️",
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

