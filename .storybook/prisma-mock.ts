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
  $connect = async () => {};
  $disconnect = async () => {};
  $transaction = async () => {};
}

// Default export
export default PrismaClient;

// Mock Prisma namespace
export const Prisma = {
  ModelName: {},
  PrismaClientKnownRequestError: class {},
  PrismaClientUnknownRequestError: class {},
  PrismaClientRustPanicError: class {},
  PrismaClientInitializationError: class {},
  PrismaClientValidationError: class {},
  InputJsonValue: {} as unknown,
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
export type User = Record<string, unknown>;
export type Exercise = Record<string, unknown>;
export type CardioLog = Record<string, unknown>;
export type ExerciseLog = Record<string, unknown>;
export type Titan = Record<string, unknown>;
export type DuelChallenge = Record<string, unknown>;
export type ActiveSession = Record<string, unknown>;
export type SessionParticipant = Record<string, unknown>;
export type PvpSeason = Record<string, unknown>;
export type Challenge = Record<string, unknown>;
export type UserChallenge = Record<string, unknown>;
export type Monster = Record<string, unknown>;
export type RaidBoss = Record<string, unknown>;
export type WorldRegion = Record<string, unknown>;
export type Territory = Record<string, unknown>;
export type Guild = Record<string, unknown>;
export type Notification = Record<string, unknown>;
export type CombatSession = Record<string, unknown>;
export type TitanMemory = Record<string, unknown>;
export type TitanScar = Record<string, unknown>;
export type Follow = Record<string, unknown>;
export type Friendship = Record<string, unknown>;
export type Title = Record<string, unknown>;
export type UserTitle = Record<string, unknown>;
export type WorkoutTemplate = Record<string, unknown>;
export type BodyMetric = Record<string, unknown>;
export type MeditationLog = Record<string, unknown>;
export type GrimoireEntry = Record<string, unknown>;
export type UnlockedMonster = Record<string, unknown>;
export type UserSkill = Record<string, unknown>;
export type UserAchievement = Record<string, unknown>;
export type UserEquipment = Record<string, unknown>;
export type Item = Record<string, unknown>;
export type ChatMessage = Record<string, unknown>;
export type PvpProfile = Record<string, unknown>;
export type BattleLog = Record<string, unknown>;
export type PvpRating = Record<string, unknown>;
export type PvpMatch = Record<string, unknown>;
export type WeeklyPlan = Record<string, unknown>;
export type GauntletRun = Record<string, unknown>;
export type GuildRaid = Record<string, unknown>;
export type GuildRaidContribution = Record<string, unknown>;
export type Achievement = Record<string, unknown>;
export type TrainingProgram = Record<string, unknown>;
export type FactoryStatus = Record<string, unknown>;
export type TerritoryContestEntry = Record<string, unknown>;
export type TerritoryHistory = Record<string, unknown>;
