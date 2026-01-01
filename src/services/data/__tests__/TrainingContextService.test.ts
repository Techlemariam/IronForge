import { describe, it, expect, vi, beforeEach } from "vitest";
import { TrainingContextService } from "../TrainingContextService";
import prisma from "@/lib/prisma";
import { getWellnessAction, getActivitiesAction } from "@/actions/intervals";

// Mock dependencies
vi.mock("@/lib/prisma", () => {
    const mockClient = {
        exerciseLog: {
            findMany: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        },
    };
    return {
        default: mockClient,
        prisma: mockClient,
    };
});

vi.mock("@/actions/intervals", () => ({
    getWellnessAction: vi.fn(),
    getActivitiesAction: vi.fn(),
}));

describe("TrainingContextService", () => {
    const userId = "user_123";

    beforeEach(() => {
        vi.clearAllMocks();
        (prisma.user.findUnique as any).mockResolvedValue({ id: "user_123" });
    });

    describe("getWeeklyVolume", () => {
        it("should aggregate volume correctly by muscle group", async () => {
            (prisma.exerciseLog.findMany as any).mockResolvedValue([
                {
                    sets: [{ weight: 100, reps: 5 }, { weight: 100, reps: 5 }],
                    exercise: { name: "Bench Press", muscleGroup: "CHEST" }
                },
                {
                    sets: [{ weight: 50, reps: 10 }],
                    exercise: { name: "Push Up", muscleGroup: "CHEST" }
                },
                {
                    sets: [{ weight: 100, reps: 3 }],
                    exercise: { name: "Squat", muscleGroup: "QUADS" }
                }
            ]);

            const result = await TrainingContextService.getWeeklyVolume(userId);

            expect(result["CHEST"].weeklySets).toBe(3); // 2 + 1
            expect(result["QUADS"].weeklySets).toBe(1);
            expect(result["CHEST"].status).toBe("LOW"); // 3/20 = 15%
        });

        it("should handle mapped muscle groups if explicit group is missing", async () => {
            (prisma.exerciseLog.findMany as any).mockResolvedValue([
                {
                    sets: [{ weight: 5, reps: 5 }],
                    exercise: { name: "Bicep Curl (Dumbbell)", muscleGroup: null }
                }
            ]);

            const result = await TrainingContextService.getWeeklyVolume(userId);

            // "Bicep Curl (Dumbbell)" maps to BICEPS in Hevy Map
            expect(result["BICEPS"].weeklySets).toBe(1);
        });
    });

    describe("getTrainingContext", () => {
        it("should return context with readiness and volume", async () => {
            // Mock Volume
            (prisma.exerciseLog.findMany as any).mockResolvedValue([]);

            // Mock Intervals
            (getWellnessAction as any).mockResolvedValue({
                bodyBattery: 90,
                hrv: 80,
                sleepScore: 85,
                sleepSecs: 28800, // 8 hours
                restingHR: 50
            });
            (getActivitiesAction as any).mockResolvedValue([]);

            const context = await TrainingContextService.getTrainingContext(userId);

            expect(context.readiness).toBe("HIGH");
            expect(context.cnsFatigue).toBe("LOW");
            expect(context.warnings).toHaveLength(0);
        });

        it("should trigger warnings for low recovery", async () => {
            // Mock Volume
            (prisma.exerciseLog.findMany as any).mockResolvedValue([]);

            // Mock Low Recovery
            (getWellnessAction as any).mockResolvedValue({
                bodyBattery: 20,
                hrv: 50,
                sleepScore: 0,
                sleepSecs: 14400 // 4h
            });
            (getActivitiesAction as any).mockResolvedValue([]);

            const context = await TrainingContextService.getTrainingContext(userId);

            expect(context.readiness).toBe("RECOVERY_NEEDED");
            expect(context.warnings).toContain("Recovery is critical. Low HRV/Sleep.");
        });

        it("should detect high cardio fatigue", async () => {
            // Mock Volume
            (prisma.exerciseLog.findMany as any).mockResolvedValue([]);

            // Mock Normal Recovery
            (getWellnessAction as any).mockResolvedValue({
                bodyBattery: 80,
                sleepSecs: 28800
            });

            // Mock Long Run
            (getActivitiesAction as any).mockResolvedValue([
                { moving_time: 4000, icu_intensity: 300 } // > 250 TSS for HIGH stress
            ]);

            const context = await TrainingContextService.getTrainingContext(userId);

            expect(context.cardioStress).toBe("HIGH");
            expect(context.warnings).toContain("High cardio fatigue detected (Long session detected).");
        });
    });

    describe("estimateCnsCost", () => {
        it("should return HIGH for Heavy Deadlifts", () => {
            const cost = TrainingContextService.estimateCnsCost("Deadlift (Barbell)", 9, 5);
            // 9 (Base) * 1.3 (RPE 9) = 11.7 -> HIGH (>8.5)
            expect(cost).toBe("HIGH");
        });

        it("should return LOW for Light Curls", () => {
            const cost = TrainingContextService.estimateCnsCost("Bicep Curl (Dumbbell)", 6, 12);
            // 3 (Base) * 0.8 (RPE 6) = 2.4 -> LOW (<5)
            expect(cost).toBe("LOW");
        });

        it("should return MEDIUM for Moderate Bench", () => {
            const cost = TrainingContextService.estimateCnsCost("Bench Press (Barbell)", 7, 10);
            // 7 * 1.0 = 7 -> MEDIUM (>5)
            expect(cost).toBe("MEDIUM");
        });

        it("should return HIGH for RPE 10 Squats", () => {
            const cost = TrainingContextService.estimateCnsCost("Squat (Barbell)", 10, 3);
            // 9 * 1.3 (capped) = 11.7 -> HIGH
            expect(cost).toBe("HIGH");
        });
    });
});
