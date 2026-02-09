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
    WARRIOR = 'WARRIOR',
    MAGE = 'MAGE',
    ROGUE = 'ROGUE',
}

export enum Faction {
    IRON_LEGION = 'IRON_LEGION',
    SHADOW_GUILD = 'SHADOW_GUILD',
    NEUTRAL = 'NEUTRAL',
}

export enum EquipmentType {
    WEAPON = 'WEAPON',
    ARMOR = 'ARMOR',
    ACCESSORY = 'ACCESSORY',
}

export enum ChallengeType {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    SPECIAL = 'SPECIAL',
}

export enum SubscriptionTier {
    FREE = 'FREE',
    PREMIUM = 'PREMIUM',
    ELITE = 'ELITE',
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
