
export type LeaderboardScope = "GLOBAL" | "CITY" | "COUNTRY" | "FRIENDS";
export type LeaderboardType = "PVP_RANK" | "WINS" | "WILKS" | "XP";

export interface LeaderboardEntry {
    userId: string;
    heroName: string;
    rankScore: number;
    wins: number;
    title: string | null;
    city: string | null;
    level: number;
    highestWilksScore: number;
    totalExperience: number;
    faction: 'HORDE' | 'ALLIANCE';
    avatar?: string;
}
