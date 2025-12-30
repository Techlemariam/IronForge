"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type LiftType = "SQUAT" | "BENCH" | "DEADLIFT";
type BracketSize = 8 | 16 | 32 | 64;

interface TournamentBracket {
  id: string;
  name: string;
  liftType: LiftType;
  weightClass: string;
  startDate: Date;
  endDate: Date;
  bracketSize: BracketSize;
  participants: BracketParticipant[];
  rounds: BracketRound[];
  status: "REGISTRATION" | "IN_PROGRESS" | "COMPLETED";
  champion?: string;
}

interface BracketParticipant {
  userId: string;
  heroName: string;
  seed: number;
  qualifyingLift: number; // e1RM used for seeding
}

interface BracketRound {
  roundNumber: number;
  name: string; // 'Round of 16', 'Quarterfinals', etc.
  matches: BracketMatch[];
}

interface BracketMatch {
  id: string;
  participant1?: BracketParticipant;
  participant2?: BracketParticipant;
  lift1?: number; // Participant 1's best lift
  lift2?: number; // Participant 2's best lift
  winnerId?: string;
  deadline: Date;
}

const WEIGHT_CLASSES = [
  "59kg",
  "66kg",
  "74kg",
  "83kg",
  "93kg",
  "105kg",
  "120kg",
  "120kg+",
];

const ROUND_NAMES: Record<number, Record<BracketSize, string>> = {
  1: {
    8: "Quarterfinals",
    16: "Round of 16",
    32: "Round of 32",
    64: "Round of 64",
  },
  2: {
    8: "Semifinals",
    16: "Quarterfinals",
    32: "Round of 16",
    64: "Round of 32",
  },
  3: { 8: "Finals", 16: "Semifinals", 32: "Quarterfinals", 64: "Round of 16" },
  4: { 8: "Finals", 16: "Finals", 32: "Semifinals", 64: "Quarterfinals" },
  5: { 8: "Finals", 16: "Finals", 32: "Finals", 64: "Semifinals" },
  6: { 8: "Finals", 16: "Finals", 32: "Finals", 64: "Finals" },
};

/**
 * Create a new tournament bracket.
 */
export async function createTournamentAction(
  name: string,
  liftType: LiftType,
  weightClass: string,
  bracketSize: BracketSize,
  daysToRun: number = 14,
): Promise<{ success: boolean; tournamentId?: string }> {
  try {
    const now = new Date();
    const endDate = new Date(now.getTime() + daysToRun * 24 * 60 * 60 * 1000);

    // For MVP, return generated ID
    const tournamentId = `tournament-${liftType.toLowerCase()}-${Date.now()}`;

    console.log(
      `Created tournament: ${name}, ${liftType}, ${weightClass}, size ${bracketSize}`,
    );

    revalidatePath("/tournaments");
    return { success: true, tournamentId };
  } catch (error) {
    console.error("Error creating tournament:", error);
    return { success: false };
  }
}

/**
 * Register for a tournament.
 */
export async function registerForTournamentAction(
  tournamentId: string,
  userId: string,
  qualifyingLift: number,
): Promise<{ success: boolean; seed?: number }> {
  try {
    // In production, insert into tournament_participants table
    // For MVP, simulate registration
    const seed = Math.floor(Math.random() * 32) + 1;

    console.log(
      `Registered: user=${userId}, tournament=${tournamentId}, lift=${qualifyingLift}kg`,
    );

    return { success: true, seed };
  } catch (error) {
    console.error("Error registering for tournament:", error);
    return { success: false };
  }
}

/**
 * Submit a lift result for a match.
 */
export async function submitMatchLiftAction(
  matchId: string,
  userId: string,
  liftWeight: number,
): Promise<{ success: boolean; isWinner?: boolean }> {
  try {
    // In production, update match with lift result
    console.log(
      `Submitted lift: match=${matchId}, user=${userId}, weight=${liftWeight}kg`,
    );

    // For MVP, randomly determine if winner (in real app, compare lifts)
    const isWinner = Math.random() > 0.5;

    return { success: true, isWinner };
  } catch (error) {
    console.error("Error submitting match lift:", error);
    return { success: false };
  }
}

/**
 * Get active tournaments.
 */
export async function getActiveTournamentsAction(): Promise<
  TournamentBracket[]
> {
  // MVP: Return sample tournaments
  return [
    {
      id: "squat-championship-2025",
      name: "New Year Squat Championship",
      liftType: "SQUAT",
      weightClass: "83kg",
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      bracketSize: 16,
      participants: [],
      rounds: [],
      status: "REGISTRATION",
    },
    {
      id: "bench-battle-2025",
      name: "Bench Battle Royale",
      liftType: "BENCH",
      weightClass: "93kg",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      bracketSize: 8,
      participants: [],
      rounds: [],
      status: "IN_PROGRESS",
    },
  ];
}

/**
 * Generate seeded bracket from participants.
 */
export function generateBracket(
  participants: BracketParticipant[],
  bracketSize: BracketSize,
): BracketRound[] {
  // Sort by qualifying lift (highest first)
  const sorted = [...participants].sort(
    (a, b) => b.qualifyingLift - a.qualifyingLift,
  );

  // Pad with byes if needed
  while (sorted.length < bracketSize) {
    sorted.push({
      userId: "BYE",
      heroName: "BYE",
      seed: sorted.length + 1,
      qualifyingLift: 0,
    });
  }

  // Standard seeding: 1v16, 8v9, 5v12, 4v13, 3v14, 6v11, 7v10, 2v15
  const seedOrder = [1, 16, 8, 9, 5, 12, 4, 13, 3, 14, 6, 11, 7, 10, 2, 15];

  const matches: BracketMatch[] = [];
  for (let i = 0; i < bracketSize / 2; i++) {
    const p1Index = seedOrder[i * 2] - 1;
    const p2Index = seedOrder[i * 2 + 1] - 1;

    matches.push({
      id: `match-r1-${i}`,
      participant1: sorted[p1Index],
      participant2: sorted[p2Index],
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });
  }

  return [
    {
      roundNumber: 1,
      name: ROUND_NAMES[1][bracketSize],
      matches,
    },
  ];
}

export function getWeightClasses() {
  return WEIGHT_CLASSES;
}
