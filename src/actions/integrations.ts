'use server'

import { getAthleteSettings } from '@/lib/intervals';
import { getHevyWorkouts } from '@/lib/hevy';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface ValidationResult {
    valid: boolean;
    error?: string;
    metadata?: any;
}

// --- HEVY ---

export async function validateHevyApiKey(apiKey: string): Promise<ValidationResult> {
    try {
        // Fetch a single workout to validate the key
        await getHevyWorkouts(apiKey, 1, 1);
        return { valid: true };
    } catch (error: any) {
        return {
            valid: false,
            error: error.message || 'Invalid Hevy API Key'
        };
    }
}

export async function connectHevy(userId: string, apiKey: string) {
    try {
        const validation = await validateHevyApiKey(apiKey);
        if (!validation.valid) throw new Error(validation.error);

        await prisma.user.update({
            where: { id: userId },
            data: { hevyApiKey: apiKey }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function disconnectHevy(userId: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { hevyApiKey: null }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- INTERVALS.ICU ---

export async function validateIntervalsCredentials(apiKey: string, athleteId: string): Promise<ValidationResult> {
    try {
        const settings = await getAthleteSettings(apiKey, athleteId);
        if (!settings) {
            return { valid: false, error: 'Invalid Credentials or Athlete ID not found' };
        }
        return { valid: true, metadata: { name: settings.name } };
    } catch (error: any) {
        return { valid: false, error: error.message };
    }
}

export async function connectIntervals(userId: string, apiKey: string, athleteId: string) {
    try {
        const validation = await validateIntervalsCredentials(apiKey, athleteId);
        if (!validation.valid) throw new Error(validation.error);

        await prisma.user.update({
            where: { id: userId },
            data: {
                intervalsApiKey: apiKey,
                intervalsAthleteId: athleteId
            }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function disconnectIntervals(userId: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                intervalsApiKey: null,
                intervalsAthleteId: null
            }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
