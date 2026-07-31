'use server';

import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  decideProgression,
  type ProgressionDecision,
  type ProgressionInput,
} from '@/services/training/progressionEngine';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';

const STORAGE_KEY = 'trainingProgression';

const ProgressionInputSchema = z.object({
  method: z.enum([
    'FIXED',
    'DOUBLE_PROGRESSION',
    'REP_GOAL',
    'RPT',
    'TOP_SET_BACKOFF',
    'TRAINING_MAX',
    'MANUAL',
  ]),
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

type StoredProgressionDecision = ProgressionDecision & {
  exerciseId: string;
  savedAt: string;
  method: ProgressionInput['method'];
};

type ProgressionPreferenceStore = Record<string, StoredProgressionDecision>;

type UserPreferences = Record<string, unknown> & {
  [STORAGE_KEY]?: ProgressionPreferenceStore;
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

export async function evaluateAndSaveProgressionAction(
  exerciseId: string,
  input: ProgressionInput
): Promise<{ success: true; decision: StoredProgressionDecision } | { success: false; error: string }> {
  try {
    const userId = await requireUserId();
    const validated = ProgressionInputSchema.parse(input) as ProgressionInput;
    const decision = decideProgression(validated);
    const stored: StoredProgressionDecision = {
      ...decision,
      exerciseId,
      method: validated.method,
      savedAt: new Date().toISOString(),
    };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });
    if (!user) return { success: false, error: 'User not found' };

    const preferences = normalizePreferences(user.preferences);
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
