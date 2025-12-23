import prisma from "@/lib/prisma";

export type LeaderboardScope = "GLOBAL" | "CITY" | "COUNTRY";
export type LeaderboardType = "PVP_RANK" | "WINS" | "WILKS";

interface GetLeaderboardOptions {
    scope: LeaderboardScope;
    type: LeaderboardType;
    city?: string;
    country?: string;
    limit?: number;
}

export interface LeaderboardEntry {
    userId: string;
    heroName: string;
    rankScore: number;
    wins: number;
    title: string | null;
    city: string | null;
    level: number;
    highestWilksScore: number;
    avatar?: string; // Future Use
}

export async function getLeaderboard({
    scope,
    type,
    city,
    country,
    limit = 50
}: GetLeaderboardOptions): Promise<LeaderboardEntry[]> {
    const where: any = {
        pvpProfile: { isNot: null } // Only users with PvP profile
    };

    if (scope === "CITY" && city) {
        where.city = { equals: city, mode: 'insensitive' };
    }

    if (scope === "COUNTRY" && country) {
        where.country = { equals: country, mode: 'insensitive' };
    }

    // Order by logic
    let orderBy: any = {};
    if (type === "PVP_RANK") {
        orderBy = { pvpProfile: { rankScore: 'desc' } };
    } else if (type === "WINS") {
        orderBy = { pvpProfile: { wins: 'desc' } };
    } else if (type === "WILKS") {
        orderBy = { pvpProfile: { highestWilksScore: 'desc' } };
    }

    const users = await prisma.user.findMany({
        where,
        include: {
            pvpProfile: true,
            activeTitle: true,
        },
        orderBy,
        take: limit,
    });

    return users.map(u => ({
        userId: u.id,
        heroName: u.heroName || "Unknown Hero",
        rankScore: u.pvpProfile?.rankScore || 0,
        wins: u.pvpProfile?.wins || 0,
        title: u.activeTitle?.name || null,
        city: u.city,
        level: u.level,
        highestWilksScore: u.pvpProfile?.highestWilksScore || 0,
    }));
}
