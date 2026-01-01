import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchExercisesAction, createExerciseAction, logExerciseSetsAction } from "../logger";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
    default: {
        exercise: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
        },
        exerciseLog: {
            create: vi.fn(),
        },
        user: {
            update: vi.fn(),
            findUnique: vi.fn(),
        },
        combatSession: {
            findUnique: vi.fn(),
            update: vi.fn(),
        }
    },
}));

// Mock Supabase Auth
vi.mock("@/utils/supabase/server", () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: vi.fn(() => ({
                data: { user: { id: "user_123" } },
            })),
        },
    })),
}));

// Mock Next Cache
vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

// Mock Training Context Service
vi.mock("@/services/data/TrainingContextService", () => ({
    TrainingContextService: {
        getTrainingContext: vi.fn(),
    },
}));

import prisma from "@/lib/prisma";

import { TrainingContextService } from "@/services/data/TrainingContextService";

describe("Logger Actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (TrainingContextService.getTrainingContext as any).mockResolvedValue({
            recovery: { status: "FRESH" }
        });
    });

    it("should search exercises", async () => {
        (prisma.exercise.findMany as any).mockResolvedValue([
            { id: "1", name: "Bench Press" },
        ]);

        const result = await searchExercisesAction("Bench");
        expect(prisma.exercise.findMany).toHaveBeenCalled();
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Bench Press");
    });

    it("should create a new exercise", async () => {
        (prisma.exercise.findFirst as any).mockResolvedValue(null);
        (prisma.exercise.create as any).mockResolvedValue({
            id: "2",
            name: "Squat",
            muscleGroup: "Legs",
        });

        const result = await createExerciseAction({ name: "Squat", muscleGroup: "Legs" });
        expect(result.success).toBe(true);
        expect(prisma.exercise.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ name: "Squat", muscleGroup: "Legs" })
        });
    });

    it("should log sets and award energy", async () => {
        (prisma.exerciseLog.create as any).mockResolvedValue({ id: "log_1" });
        (prisma.combatSession.findUnique as any).mockResolvedValue(null); // No combat

        // 100kg * 5 reps = 500 volume -> 5 energy
        const result = await logExerciseSetsAction({
            exerciseId: "ex_1",
            sets: [{ weight: 100, reps: 5, rpe: 8 }],
            notes: "Easy"
        });

        expect(result.success).toBe(true);
        expect(result.energyGained).toBe(5);
        expect(prisma.exerciseLog.create).toHaveBeenCalled();
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: "user_123" },
            data: expect.objectContaining({
                kineticEnergy: { increment: 5 }
            })
        });
    });

    it("should apply damage to active combat session", async () => {
        (prisma.exerciseLog.create as any).mockResolvedValue({ id: "log_2" });
        (prisma.combatSession.findUnique as any).mockResolvedValue({
            id: "session_1",
            userId: "user_123",
            bossHp: 1000,
            bossMaxHp: 1000,
            isVictory: false,
            isDefeat: false
        });

        // 200kg * 5 reps = 1000 damage
        const result = await logExerciseSetsAction({
            exerciseId: "ex_1",
            sets: [{ weight: 200, reps: 5, rpe: 9 }],
            notes: "For the kill"
        });

        expect(result.success).toBe(true);
        expect(prisma.combatSession.update).toHaveBeenCalledWith({
            where: { id: "session_1" },
            data: expect.objectContaining({
                bossHp: 0,
                isVictory: true
            })
        });
        // @ts-ignore
        expect(result.combatStats.isVictory).toBe(true);
        // @ts-ignore
        expect(result.combatStats.damageDealt).toBe(1000);
    });
});
