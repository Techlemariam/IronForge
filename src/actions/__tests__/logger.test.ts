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
        },
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

import prisma from "@/lib/prisma";

describe("Logger Actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
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

        // 100kg * 5 reps = 500 volume -> 5 energy
        const result = await logExerciseSetsAction({
            exerciseId: "ex_1",
            sets: [{ weight: 100, reps: 5 }],
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
});
