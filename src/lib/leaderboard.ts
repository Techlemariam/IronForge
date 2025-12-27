import prisma from "@/lib/prisma";
import { LeaderboardEntry, LeaderboardScope, LeaderboardType } from "@/features/leaderboard/types";

export type { LeaderboardScope, LeaderboardType, LeaderboardEntry };

interface GetLeaderboardOptions {
    scope: LeaderboardScope;
    type: LeaderboardType;
    city?: string;
    country?: string;
    limit?: number;
    userIds?: string[]; // For Friend/Custom scopes
}

export async function getLeaderboard({
    scope,
    type,
    city,
    country,
    limit = 50,
    userIds
}: GetLeaderboardOptions): Promise<LeaderboardEntry[]> {
    const where: any = {};

    // 1. Scope Filtering
    if (scope === "CITY" && city) {
        where.city = { equals: city, mode: 'insensitive' };
    } else if (scope === "COUNTRY" && country) {
        where.country = { equals: country, mode: 'insensitive' };
    } else if (scope === "FRIENDS" && userIds) {
        where.id = { in: userIds };
    }

    // 2. Type Filtering & Ordering
    let orderBy: any = {};

    // Default ensure pvpProfile exists for PvP stats, but NOT for XP
    if (type === "PVP_RANK") {
        where.pvpProfile = { isNot: null };
        orderBy = { pvpProfile: { rankScore: 'desc' } };
    } else if (type === "WINS") {
        where.pvpProfile = { isNot: null };
        orderBy = { pvpProfile: { wins: 'desc' } };
    } else if (type === "WILKS") {
        where.pvpProfile = { isNot: null };
        orderBy = { pvpProfile: { highestWilksScore: 'desc' } };
    } else if (type === "XP") {
        orderBy = { totalExperience: 'desc' };
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
        totalExperience: u.totalExperience,
        faction: ((u as any).faction as 'HORDE' | 'ALLIANCE') || 'HORDE',
    }));
}
