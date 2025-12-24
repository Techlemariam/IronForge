/**
 * WoW Vanilla-style PvP Rank System
 * Ranks 1-14 with faction-specific titles
 */

export type Faction = 'ALLIANCE' | 'HORDE';

export interface PvpRank {
    rank: number;
    allianceTitle: string;
    hordeTitle: string;
    minRankScore: number;
    icon?: string;
}

/**
 * PvP Ranks based on World of Warcraft Classic system
 * rankScore thresholds scaled for our rating system (1000 base)
 */
export const PVP_RANKS: PvpRank[] = [
    { rank: 1, allianceTitle: 'Private', hordeTitle: 'Scout', minRankScore: 1000 },
    { rank: 2, allianceTitle: 'Corporal', hordeTitle: 'Grunt', minRankScore: 1050 },
    { rank: 3, allianceTitle: 'Sergeant', hordeTitle: 'Sergeant', minRankScore: 1100 },
    { rank: 4, allianceTitle: 'Master Sergeant', hordeTitle: 'Senior Sergeant', minRankScore: 1150 },
    { rank: 5, allianceTitle: 'Sergeant Major', hordeTitle: 'First Sergeant', minRankScore: 1200 },
    { rank: 6, allianceTitle: 'Knight', hordeTitle: 'Stone Guard', minRankScore: 1300 },
    { rank: 7, allianceTitle: 'Knight-Lieutenant', hordeTitle: 'Blood Guard', minRankScore: 1400 },
    { rank: 8, allianceTitle: 'Knight-Captain', hordeTitle: 'Legionnaire', minRankScore: 1500 },
    { rank: 9, allianceTitle: 'Knight-Champion', hordeTitle: 'Centurion', minRankScore: 1600 },
    { rank: 10, allianceTitle: 'Lieutenant Commander', hordeTitle: 'Champion', minRankScore: 1700 },
    { rank: 11, allianceTitle: 'Commander', hordeTitle: 'Lieutenant General', minRankScore: 1850 },
    { rank: 12, allianceTitle: 'Marshal', hordeTitle: 'General', minRankScore: 2000 },
    { rank: 13, allianceTitle: 'Field Marshal', hordeTitle: 'Warlord', minRankScore: 2200 },
    { rank: 14, allianceTitle: 'Grand Marshal', hordeTitle: 'High Warlord', minRankScore: 2500 },
];

/**
 * Get a player's PvP rank based on their rating score
 */
export function getPvpRank(rankScore: number): PvpRank {
    // Find highest rank the player qualifies for
    let currentRank = PVP_RANKS[0];

    for (const rank of PVP_RANKS) {
        if (rankScore >= rank.minRankScore) {
            currentRank = rank;
        } else {
            break;
        }
    }

    return currentRank;
}

/**
 * Get the title string for a player based on their faction and rank score
 */
export function getRankTitle(rankScore: number, faction: Faction): string {
    const rank = getPvpRank(rankScore);
    return faction === 'ALLIANCE' ? rank.allianceTitle : rank.hordeTitle;
}

/**
 * Get progress to next rank (0-100%)
 */
export function getRankProgress(rankScore: number): number {
    const currentRank = getPvpRank(rankScore);
    const currentIndex = PVP_RANKS.findIndex(r => r.rank === currentRank.rank);

    // Already at max rank
    if (currentIndex === PVP_RANKS.length - 1) {
        return 100;
    }

    const nextRank = PVP_RANKS[currentIndex + 1];
    const rangeStart = currentRank.minRankScore;
    const rangeEnd = nextRank.minRankScore;

    const progress = ((rankScore - rangeStart) / (rangeEnd - rangeStart)) * 100;
    return Math.min(100, Math.max(0, progress));
}

/**
 * Get points needed for next rank
 */
export function getPointsToNextRank(rankScore: number): number | null {
    const currentRank = getPvpRank(rankScore);
    const currentIndex = PVP_RANKS.findIndex(r => r.rank === currentRank.rank);

    if (currentIndex === PVP_RANKS.length - 1) {
        return null; // Already max rank
    }

    const nextRank = PVP_RANKS[currentIndex + 1];
    return nextRank.minRankScore - rankScore;
}
