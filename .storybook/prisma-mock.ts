/**
 * Mock Prisma Client for Storybook
 * This file provides empty mocks for Prisma Client to prevent module resolution errors
 * when running Storybook in the browser environment.
 */

// Mock PrismaClient class
export class PrismaClient {
    constructor() {
        console.warn('Using mocked PrismaClient in Storybook');
    }

    // Add mock methods as needed
    $connect = async () => { };
    $disconnect = async () => { };
    $transaction = async () => { };
}

// Default export
export default PrismaClient;

// Mock Prisma namespace
export const Prisma = {
    ModelName: {},
    PrismaClientKnownRequestError: class { },
    PrismaClientUnknownRequestError: class { },
    PrismaClientRustPanicError: class { },
    PrismaClientInitializationError: class { },
    PrismaClientValidationError: class { },
    InputJsonValue: {} as any,
};

// Mock all commonly used Prisma types and enums
export enum Archetype {
    JUGGERNAUT = 'JUGGERNAUT',
    PATHFINDER = 'PATHFINDER',
    WARDEN = 'WARDEN',
}

export enum Faction {
    ALLIANCE = 'ALLIANCE',
    HORDE = 'HORDE',
}

export enum EquipmentType {
    BODYWEIGHT = 'BODYWEIGHT',
    BARBELL = 'BARBELL',
    DUMBBELL = 'DUMBBELL',
    CABLE = 'CABLE',
    MACHINE = 'MACHINE',
    KETTLEBELL = 'KETTLEBELL',
    BAND = 'BAND',
    HYPER_PRO = 'HYPER_PRO',
    OTHER = 'OTHER',
}

export enum ChallengeType {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    SEASONAL = 'SEASONAL',
}

export enum SubscriptionTier {
    FREE = 'FREE',
    PRO = 'PRO',
    LIFETIME = 'LIFETIME',
}

export enum TerritoryType {
    TRAINING_GROUNDS = 'TRAINING_GROUNDS',
    RESOURCE_NODE = 'RESOURCE_NODE',
    FORTRESS = 'FORTRESS',
}

export enum FriendshipStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    BLOCKED = 'BLOCKED',
}

// Mock type interfaces (empty objects for type compatibility)
export type User = Record<string, any>;
export type Exercise = Record<string, any>;
export type CardioLog = Record<string, any>;
export type ExerciseLog = Record<string, any>;
export type Titan = Record<string, any>;
export type DuelChallenge = Record<string, any>;
export type ActiveSession = Record<string, any>;
export type SessionParticipant = Record<string, any>;
export type PvpSeason = Record<string, any>;
export type Challenge = Record<string, any>;
export type UserChallenge = Record<string, any>;
export type Monster = Record<string, any>;
export type RaidBoss = Record<string, any>;
export type WorldRegion = Record<string, any>;
export type Territory = Record<string, any>;
export type Guild = Record<string, any>;
export type Notification = Record<string, any>;
export type CombatSession = Record<string, any>;
export type TitanMemory = Record<string, any>;
export type TitanScar = Record<string, any>;
export type Follow = Record<string, any>;
export type Friendship = Record<string, any>;
export type Title = Record<string, any>;
export type UserTitle = Record<string, any>;
export type WorkoutTemplate = Record<string, any>;
export type BodyMetric = Record<string, any>;
export type MeditationLog = Record<string, any>;
export type GrimoireEntry = Record<string, any>;
export type UnlockedMonster = Record<string, any>;
export type UserSkill = Record<string, any>;
export type UserAchievement = Record<string, any>;
export type UserEquipment = Record<string, any>;
export type Item = Record<string, any>;
export type ChatMessage = Record<string, any>;
export type PvpProfile = Record<string, any>;
export type BattleLog = Record<string, any>;
export type PvpRating = Record<string, any>;
export type PvpMatch = Record<string, any>;
export type WeeklyPlan = Record<string, any>;
export type GauntletRun = Record<string, any>;
export type GuildRaid = Record<string, any>;
export type GuildRaidContribution = Record<string, any>;
export type Achievement = Record<string, any>;
export type TrainingProgram = Record<string, any>;
export type TerritoryContestEntry = Record<string, any>;
export type TerritoryHistory = Record<string, any>;
