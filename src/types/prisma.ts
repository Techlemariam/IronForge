/**
 * Centralized Prisma type exports
 * 
 * This file re-exports all Prisma types and enums used throughout the application.
 * Components should import from this file instead of directly from @prisma/client
 * to enable better separation of concerns and Storybook compatibility.
 */

// Re-export all types from Prisma
export type {
    User,
    Exercise,
    CardioLog,
    ExerciseLog,
    Titan,
    DuelChallenge,
    ActiveSession,
    SessionParticipant,
    PvpSeason,
    Challenge,
    UserChallenge,
    Monster,
} from '@prisma/client';

// Re-export all enums from Prisma
export {
    Archetype,
    Faction,
    EquipmentType,
    ChallengeType,
    SubscriptionTier,
} from '@prisma/client';

// Re-export Prisma namespace for advanced usage
export { Prisma } from '@prisma/client';
