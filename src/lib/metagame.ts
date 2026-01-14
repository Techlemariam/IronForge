/**
 * THE META-GAME ENGINE
 * Calculates the user's "True Rank" in the IronForge universe.
 */

// Rank Tiers
export type MetaRank = "IRON" | "STEEL" | "TITANIUM" | "NEUTRONIUM" | "SINGULARITY";

interface RankThreshold {
    name: MetaRank;
    minScore: number;
    color: string;
}

const RANKS: RankThreshold[] = [
    { name: "IRON", minScore: 0, color: "text-gray-400" },
    { name: "STEEL", minScore: 2000, color: "text-slate-300" },
    { name: "TITANIUM", minScore: 5000, color: "text-cyan-400" },
    { name: "NEUTRONIUM", minScore: 8000, color: "text-purple-400" },
    { name: "SINGULARITY", minScore: 9500, color: "text-yellow-400" },
];

interface PlayerStats {
    level: number;       // RPG Level (Grind)
    powerRating: number; // Physical Stats (0-1000)
    pvpRating: number;   // Skill (0-3000+)
}

/**
 * Calculates the "Meta Score" used to determine Rank.
 * Formula: (Level * 100) + (PowerRating * 5) + (PvpRating * 2)
 * 
 * Rationale:
 * - Level is the base grind. (Lvl 50 = 5000pts)
 * - PowerRating is the physical multiplier. (PR 500 = 2500pts)
 * - PvpRating is the skill bonus. (1500 Rating = 3000pts)
 */
export function calculateMetaScore(stats: PlayerStats): number {
    const levelScore = stats.level * 100;
    const powerScore = (stats.powerRating || 0) * 5;
    const pvpScore = (stats.pvpRating || 0) * 2;

    return Math.round(levelScore + powerScore + pvpScore);
}

export function getMetaRank(score: number): RankThreshold {
    // Find highest threshold met
    return RANKS.slice().reverse().find(r => score >= r.minScore) || RANKS[0];
}

export function getRankProgress(score: number): { current: RankThreshold, next?: RankThreshold, percent: number } {
    const current = getMetaRank(score);
    const currentIndex = RANKS.findIndex(r => r.name === current.name);
    const next = RANKS[currentIndex + 1];

    if (!next) {
        return { current, percent: 100 };
    }

    const range = next.minScore - current.minScore;
    const progress = score - current.minScore;
    return {
        current,
        next,
        percent: Math.min(100, Math.round((progress / range) * 100))
    };
}
