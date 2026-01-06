"use server";

// import { prisma } from "@/lib/prisma";
// import { getSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";
// import { revalidatePath } from "next/cache";
// import { getPvpRank } from "@/lib/pvpRanks";

const SEASON_DURATION_DAYS = 28;

export interface PlayerRating {
    rating: number;
    peakRating: number;
    wins: number;
    losses: number;
    rank: string;
}

export interface RankedOpponent {
    userId: string;
    name: string | null;
    rating: number;
    rank: string;
    image: string | null;
    className?: string; // e.g. "Warrior"
}

// Get or Create Active Season
export async function getCurrentSeasonAction() {
    const now = new Date();
    let season = await prisma.pvpSeason.findFirst({
        where: {
            startDate: { lte: now },
            endDate: { gte: now },
            isActive: true,
        },
    });

    if (!season) {
        // Check if we need to bootstrap Season 1
        const count = await prisma.pvpSeason.count();
        if (count === 0) {
            season = await prisma.pvpSeason.create({
                data: {
                    name: "Season 1: Genesis",
                    startDate: now,
                    endDate: new Date(now.getTime() + SEASON_DURATION_DAYS * 24 * 60 * 60 * 1000),
                    isActive: true,
                    rewards: [],
                },
            });
        }
    }

    return season;
}

// Get current user rating
export async function getPlayerRatingAction(userId: string): Promise<PlayerRating> {
    const season = await getCurrentSeasonAction();
    if (!season) return { rating: 1200, peakRating: 1200, wins: 0, losses: 0, rank: "UNRANKED" };

    let rating = await prisma.pvpRating.findUnique({
        where: { userId_seasonId: { userId, seasonId: season.id } },
    });

    if (!rating) {
        rating = await prisma.pvpRating.create({
            data: {
                userId,
                seasonId: season.id,
                rating: 1200,
                peakRating: 1200,
            },
        });
    }

    return {
        rating: rating.rating,
        peakRating: rating.peakRating,
        wins: rating.wins,
        losses: rating.losses,
        rank: rating.rank,
    };
}

// Find opponent
export async function findRankedOpponentAction(): Promise<RankedOpponent | null> {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const season = await getCurrentSeasonAction();
    if (!season) return null;

    const myRating = await getPlayerRatingAction(session.user.id);
    const range = 200; // Search range

    // Find candidates
    const candidates = await prisma.pvpRating.findMany({
        where: {
            seasonId: season.id,
            userId: { not: session.user.id },
            rating: {
                gte: myRating.rating - range,
                lte: myRating.rating + range,
            },
        },
        include: {
            user: {
                select: { id: true, heroName: true, activeTitle: true },
            },
        },
        take: 10,
    });

    if (candidates.length === 0) {
        // Expanded search (any activity)
        const anyCandidate = await prisma.pvpRating.findFirst({
            where: { seasonId: season.id, userId: { not: session.user.id } },
            include: { user: { select: { id: true, heroName: true } } },
            orderBy: { rating: 'desc' }
        });

        if (!anyCandidate) return null;

        return {
            userId: anyCandidate.userId,
            name: anyCandidate.user.heroName,
            rating: anyCandidate.rating,
            rank: anyCandidate.rank,
            image: null,
        };
    }

    // Random pick from candidates
    const opponent = candidates[Math.floor(Math.random() * candidates.length)];
    return {
        userId: opponent.userId,
        name: opponent.user.heroName,
        rating: opponent.rating,
        rank: opponent.rank,
        image: null,
    };
}

// Submit Result
export async function submitMatchResultAction(input: {
    opponentId: string;
    result: "WIN" | "LOSS";
}) {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    const season = await getCurrentSeasonAction();
    if (!season) throw new Error("No active season");

    const myId = session.user.id;
    const oppId = input.opponentId;

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Re-fetch ratings for safety
        const p1 = await tx.pvpRating.findUniqueOrThrow({
            where: { userId_seasonId: { userId: myId, seasonId: season.id } }
        });
        const p2 = await tx.pvpRating.findUniqueOrThrow({
            where: { userId_seasonId: { userId: oppId, seasonId: season.id } }
        });

        // ELO Calc
        const expectedP1 = 1 / (1 + Math.pow(10, (p2.rating - p1.rating) / 400));
        const actualP1 = input.result === "WIN" ? 1 : 0;

        // K-Factor Dynamic
        const K = p1.rating < 2000 ? 32 : 16;
        const ratingChange = Math.round(K * (actualP1 - expectedP1));

        // Update P1
        const p1NewRating = p1.rating + ratingChange;
        await tx.pvpRating.update({
            where: { id: p1.id },
            data: {
                rating: p1NewRating,
                peakRating: Math.max(p1.peakRating, p1NewRating),
                wins: input.result === "WIN" ? { increment: 1 } : p1.wins,
                losses: input.result === "LOSS" ? { increment: 1 } : p1.losses,
                rank: getRankForRating(p1NewRating),
            }
        });

        // Update P2 (Opponent)
        const p2NewRating = p2.rating - ratingChange;
        await tx.pvpRating.update({
            where: { id: p2.id },
            data: {
                rating: p2NewRating,
                peakRating: Math.max(p2.peakRating, p2NewRating),
                wins: input.result === "LOSS" ? { increment: 1 } : p2.wins,
                losses: input.result === "WIN" ? { increment: 1 } : p2.losses,
                rank: getRankForRating(p2NewRating),
            }
        });

        // Create Match Record
        await tx.pvpMatch.create({
            data: {
                seasonId: season.id,
                player1Id: myId,
                player2Id: oppId,
                winnerId: input.result === "WIN" ? myId : oppId,
                player1Rating: p1.rating,
                player2Rating: p2.rating,
                ratingChange: ratingChange,
            }
        });

        return {
            newRating: p1NewRating,
            change: ratingChange,
            opponentName: p2.rank // placeholder
        };
    });
}



// Use getPvpRank from @/lib/pvpRanks for rank calculation
// Returns rank number as string for DB storage
function getRankForRating(rating: number): string {
    const pvpRank = getPvpRank(rating);
    return String(pvpRank.rank);
}
