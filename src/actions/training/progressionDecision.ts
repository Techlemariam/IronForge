'use server';

import { getSession } from '@/lib/auth';
import { getAthleteSettings, getWellness, type WellnessData } from '@/lib/intervals';
import prisma from '@/lib/prisma';
import { resolveEquipmentConstraints } from '@/services/training/progressionDefaults';
import {
  decideProgression,
  type ProgressionDecision,
  type ProgressionInput,
  type ProgressionMethod,
  type RecoveryContext,
} from '@/services/training/progressionEngine';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';

const STORAGE_KEY = 'trainingProgression';
const PROFILE_KEY = 'trainingProgressionProfiles';
const PREFERENCE_WRITE_RETRIES = 3;
const PROGRESSION_EVALUATION_RETRIES = 3;

const ProgressionMethodSchema = z.enum([
  'FIXED',
  'DOUBLE_PROGRESSION',
  'REP_GOAL',
  'RPT',
  'TOP_SET_BACKOFF',
  'TRAINING_MAX',
  'MANUAL',
]);

const ProgressionProfileSchema = z.object({
  method: ProgressionMethodSchema,
  minimumIncrement: z.number().positive().optional(),
  availableLoads: z.array(z.number().min(0)).optional(),
  useRecovery: z.boolean().default(true),
});

const ProgressionInputSchema = z.object({
  method: ProgressionMethodSchema,
  prescription: z.array(
    z.object({
      targetWeight: z.number().min(0),
      minimumReps: z.number().int().min(1),
      targetReps: z.number().int().min(1).optional(),
      maximumReps: z.number().int().min(1).optional(),
      targetRpe: z.number().min(1).max(10).optional(),
      setRole: z.enum(['TOP', 'BACKOFF', 'VOLUME', 'AMRAP', 'WARMUP']),
    })
  ),
  completedSets: z.array(
    z.object({
      weight: z.number().min(0),
      reps: z.number().int().min(1),
      rpe: z.number().min(1).max(10).optional(),
      setRole: z.enum(['TOP', 'BACKOFF', 'VOLUME', 'AMRAP', 'WARMUP']).optional(),
      isWarmup: z.boolean().optional(),
    })
  ),
  previousFailures: z.number().int().min(0).optional(),
  repGoal: z.number().int().min(1).optional(),
  equipment: z.object({
    minimumIncrement: z.number().positive(),
    availableLoads: z.array(z.number().min(0)).optional(),
  }),
  recovery: z
    .object({
      sleepScore: z.number().min(0).max(100).optional(),
      bodyBattery: z.number().min(0).max(100).optional(),
      hrvTrend: z.enum(['UP', 'STABLE', 'DOWN']).optional(),
      systemicFailures: z.number().int().min(0).optional(),
    })
    .optional(),
});

export type ProgressionProfile = z.infer<typeof ProgressionProfileSchema>;

type StoredProgressionDecision = ProgressionDecision & {
  exerciseId: string;
  savedAt: string;
  method: ProgressionMethod;
  profile: ProgressionProfile & { minimumIncrement: number };
  recoveryApplied: boolean;
};

type ProgressionPreferenceStore = Record<string, StoredProgressionDecision>;
type ProgressionProfileStore = Record<string, ProgressionProfile>;

type UserPreferences = Record<string, unknown> & {
  [STORAGE_KEY]?: ProgressionPreferenceStore;
  [PROFILE_KEY]?: ProgressionProfileStore;
};

type ResolvedProgressionProfile = ProgressionProfile & { minimumIncrement: number };
type ExerciseIdentity = { name: string; muscleGroup?: string | null };

class ProgressionProfileChangedError extends Error {
  constructor() {
    super('Progression profile changed during evaluation');
    this.name = 'ProgressionProfileChangedError';
  }
}

function normalizePreferences(value: unknown): UserPreferences {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as UserPreferences;
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

async function requireUserId(): Promise<string> {
  const session = await getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session.user.id;
}

async function mergeUserPreferences(
  userId: string,
  merge: (preferences: UserPreferences) => UserPreferences
): Promise<void> {
  for (let attempt = 0; attempt < PREFERENCE_WRITE_RETRIES; attempt += 1) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true, updatedAt: true },
    });
    if (!user) throw new Error('User not found');

    const nextPreferences = merge(normalizePreferences(user.preferences));
    const result = await prisma.user.updateMany({
      where: { id: userId, updatedAt: user.updatedAt },
      data: { preferences: toJsonValue(nextPreferences) },
    });

    if (result.count === 1) return;
  }

  throw new Error('Preferences changed concurrently; retry the operation');
}

function inferHrvTrend(today?: number | null, yesterday?: number | null): RecoveryContext['hrvTrend'] {
  if (!today || !yesterday) return undefined;
  const change = (today - yesterday) / yesterday;
  if (change <= -0.08) return 'DOWN';
  if (change >= 0.08) return 'UP';
  return 'STABLE';
}

function asWellness(value: WellnessData | WellnessData[] | null): WellnessData | null {
  if (!value) return null;
  return Array.isArray(value) ? value[value.length - 1] ?? null : value;
}

function dateKeyInTimeZone(value: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) throw new Error(`Unable to derive date in timezone ${timeZone}`);
  return `${year}-${month}-${day}`;
}

function previousDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
}

async function loadRecoveryContext(userId: string): Promise<RecoveryContext | undefined> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      intervalsApiKey: true,
      intervalsAthleteId: true,
    },
  });

  if (!user?.intervalsApiKey || !user.intervalsAthleteId) return undefined;

  try {
    const athlete = await getAthleteSettings(user.intervalsApiKey, user.intervalsAthleteId);
    if (!athlete?.timezone) return undefined;

    const today = dateKeyInTimeZone(new Date(), athlete.timezone);
    const yesterday = previousDateKey(today);
    const [todayData, yesterdayData] = await Promise.all([
      getWellness(today, user.intervalsApiKey, user.intervalsAthleteId),
      getWellness(yesterday, user.intervalsApiKey, user.intervalsAthleteId),
    ]);

    const current = asWellness(todayData);
    const previous = asWellness(yesterdayData);
    if (!current && !previous) return undefined;

    return {
      sleepScore: current?.sleepScore ?? undefined,
      bodyBattery: current?.bodyBattery ?? undefined,
      hrvTrend: inferHrvTrend(current?.hrv, previous?.hrv),
    };
  } catch (error) {
    console.warn('Recovery context unavailable; progression continues without it.', error);
    return undefined;
  }
}

function resolveProfile(
  exercise: ExerciseIdentity,
  exerciseId: string,
  input: ProgressionInput,
  preferences: UserPreferences
): ResolvedProgressionProfile {
  const stored = preferences[PROFILE_KEY]?.[exerciseId];
  const parsed = ProgressionProfileSchema.parse(
    stored ?? {
      method: input.method,
      useRecovery: true,
    }
  );
  const equipment = resolveEquipmentConstraints(exercise, {
    minimumIncrement: parsed.minimumIncrement,
    availableLoads: parsed.availableLoads,
  });

  return {
    ...parsed,
    minimumIncrement: equipment.minimumIncrement,
    availableLoads: equipment.availableLoads,
  };
}

function profilesEqual(
  left: ResolvedProgressionProfile,
  right: ResolvedProgressionProfile
): boolean {
  const leftLoads = left.availableLoads ?? [];
  const rightLoads = right.availableLoads ?? [];
  return (
    left.method === right.method &&
    left.minimumIncrement === right.minimumIncrement &&
    left.useRecovery === right.useRecovery &&
    leftLoads.length === rightLoads.length &&
    leftLoads.every((load, index) => load === rightLoads[index])
  );
}

async function loadResolvedProfile(
  userId: string,
  exercise: ExerciseIdentity,
  exerciseId: string,
  input: ProgressionInput
): Promise<ResolvedProgressionProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });
  if (!user) throw new Error('User not found');
  return resolveProfile(exercise, exerciseId, input, normalizePreferences(user.preferences));
}

export async function setProgressionProfileAction(
  exerciseId: string,
  profile: ProgressionProfile
): Promise<{ success: true; profile: ProgressionProfile } | { success: false; error: string }> {
  try {
    const userId = await requireUserId();
    const validated = ProgressionProfileSchema.parse(profile);

    await mergeUserPreferences(userId, (preferences) => {
      const profiles = preferences[PROFILE_KEY] ?? {};
      return {
        ...preferences,
        [PROFILE_KEY]: { ...profiles, [exerciseId]: validated },
      };
    });

    return { success: true, profile: validated };
  } catch (error) {
    console.error('Failed to save progression profile:', error);
    return { success: false, error: 'Failed to save progression profile' };
  }
}

export async function getProgressionProfileAction(
  exerciseId: string
): Promise<ProgressionProfile | null> {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });
  const preferences = normalizePreferences(user?.preferences);
  const profile = preferences[PROFILE_KEY]?.[exerciseId];
  return profile ? ProgressionProfileSchema.parse(profile) : null;
}

export async function evaluateAndSaveProgressionAction(
  exerciseId: string,
  input: ProgressionInput
): Promise<{ success: true; decision: StoredProgressionDecision } | { success: false; error: string }> {
  try {
    const userId = await requireUserId();
    const validated = ProgressionInputSchema.parse(input) as ProgressionInput;
    const storedExercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      select: { name: true, muscleGroup: true },
    });
    const exercise: ExerciseIdentity = storedExercise ?? { name: exerciseId };

    for (let attempt = 0; attempt < PROGRESSION_EVALUATION_RETRIES; attempt += 1) {
      const profileBeforeRecovery = await loadResolvedProfile(
        userId,
        exercise,
        exerciseId,
        validated
      );
      let recovery = profileBeforeRecovery.useRecovery ? await loadRecoveryContext(userId) : undefined;
      let profile = await loadResolvedProfile(userId, exercise, exerciseId, validated);

      // If recovery was enabled while the first provider request window was open,
      // fetch it now and re-read once more before deciding. If it was disabled,
      // discard any recovery data fetched under the old profile.
      if (profile.useRecovery && !profileBeforeRecovery.useRecovery) {
        recovery = await loadRecoveryContext(userId);
        profile = await loadResolvedProfile(userId, exercise, exerciseId, validated);
      }
      if (!profile.useRecovery) recovery = undefined;

      const enrichedInput: ProgressionInput = {
        ...validated,
        method: profile.method,
        equipment: {
          minimumIncrement: profile.minimumIncrement,
          availableLoads: profile.availableLoads,
        },
        recovery: recovery
          ? {
              ...recovery,
              systemicFailures: validated.recovery?.systemicFailures,
            }
          : validated.recovery,
      };

      const decision = decideProgression(enrichedInput);
      const stored: StoredProgressionDecision = {
        ...decision,
        exerciseId,
        method: profile.method,
        profile,
        recoveryApplied: Boolean(recovery),
        savedAt: new Date().toISOString(),
      };

      try {
        await mergeUserPreferences(userId, (latestPreferences) => {
          const latestProfile = resolveProfile(exercise, exerciseId, validated, latestPreferences);
          if (!profilesEqual(latestProfile, profile)) {
            throw new ProgressionProfileChangedError();
          }

          const progressionStore = latestPreferences[STORAGE_KEY] ?? {};
          return {
            ...latestPreferences,
            [STORAGE_KEY]: {
              ...progressionStore,
              [exerciseId]: stored,
            },
          };
        });
        return { success: true, decision: stored };
      } catch (error) {
        if (error instanceof ProgressionProfileChangedError && attempt + 1 < PROGRESSION_EVALUATION_RETRIES) {
          continue;
        }
        throw error;
      }
    }

    return { success: false, error: 'Progression profile changed repeatedly; retry the operation' };
  } catch (error) {
    console.error('Failed to evaluate and save progression:', error);
    return { success: false, error: 'Failed to save progression decision' };
  }
}

export async function getSavedProgressionAction(
  exerciseId: string
): Promise<StoredProgressionDecision | null> {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });

  const preferences = normalizePreferences(user?.preferences);
  return preferences[STORAGE_KEY]?.[exerciseId] ?? null;
}

export async function clearSavedProgressionAction(exerciseId: string): Promise<{ success: true }> {
  const userId = await requireUserId();

  await mergeUserPreferences(userId, (preferences) => {
    const progressionStore = preferences[STORAGE_KEY] ?? {};
    const remainingProgressionStore = Object.fromEntries(
      Object.entries(progressionStore).filter(([storedExerciseId]) => storedExerciseId !== exerciseId)
    );

    return {
      ...preferences,
      [STORAGE_KEY]: remainingProgressionStore,
    };
  });

  return { success: true };
}