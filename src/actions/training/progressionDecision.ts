'use server';

import { getSession } from '@/lib/auth';
import { getWellness, type WellnessData } from '@/lib/intervals';
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
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const date = (value: Date) => value.toISOString().split('T')[0];

    const [todayData, yesterdayData] = await Promise.all([
      getWellness(date(today), user.intervalsApiKey, user.intervalsAthleteId),
      getWellness(date(yesterday), user.intervalsApiKey, user.intervalsAthleteId),
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
  exercise: { name: string },
  exerciseId: string,
  input: ProgressionInput,
  preferences: UserPreferences
): ProgressionProfile & { minimumIncrement: number } {
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

export async function setProgressionProfileAction(
  exerciseId: string,
  profile: ProgressionProfile
): Promise<{ success: true; profile: ProgressionProfile } | { success: false; error: string }> {
  try {
    const userId = await requireUserId();
    const validated = ProgressionProfileSchema.parse(profile);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });
    if (!user) return { success: false, error: 'User not found' };

    const preferences = normalizePreferences(user.preferences);
    const profiles = preferences[PROFILE_KEY] ?? {};
    await prisma.user.update({
      where: { id: userId },
      data: {
        preferences: toJsonValue({
          ...preferences,
          [PROFILE_KEY]: { ...profiles, [exerciseId]: validated },
        }),
      },
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
    const [user, exercise] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true },
      }),
      prisma.exercise.findUnique({
        where: { id: exerciseId },
        select: { name: true },
      }),
    ]);
    if (!user) return { success: false, error: 'User not found' };

    const preferences = normalizePreferences(user.preferences);
    const profile = resolveProfile(exercise ?? { name: exerciseId }, exerciseId, validated, preferences);
    const recovery = profile.useRecovery ? await loadRecoveryContext(userId) : undefined;
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

    const progressionStore = preferences[STORAGE_KEY] ?? {};
    const updatedPreferences = {
      ...preferences,
      [STORAGE_KEY]: {
        ...progressionStore,
        [exerciseId]: stored,
      },
    };

    await prisma.user.update({
      where: { id: userId },
      data: { preferences: toJsonValue(updatedPreferences) },
    });

    return { success: true, decision: stored };
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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });

  const preferences = normalizePreferences(user?.preferences);
  const progressionStore = preferences[STORAGE_KEY] ?? {};
  const remainingProgressionStore = Object.fromEntries(
    Object.entries(progressionStore).filter(([storedExerciseId]) => storedExerciseId !== exerciseId)
  );

  await prisma.user.update({
    where: { id: userId },
    data: {
      preferences: toJsonValue({
        ...preferences,
        [STORAGE_KEY]: remainingProgressionStore,
      }),
    },
  });

  return { success: true };
}
