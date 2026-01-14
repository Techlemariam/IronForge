import { vi, describe, it, expect } from "vitest";
import { PlannerService } from "@/services/planner";
import prisma from "@/lib/prisma";

// Mock dependencies
vi.mock("@/lib/prisma", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
    },
    weeklyPlan: {
      create: vi.fn(),
    },
  };
  return {
    __esModule: true,
    default: mockPrisma,
    prisma: mockPrisma,
  };
});
vi.mock("@/services/auditorOrchestrator", () => ({
  runFullAudit: vi.fn().mockResolvedValue({ highestPriorityGap: null }),
}));
vi.mock("@/lib/intervals", () => ({
  getWellness: vi.fn().mockResolvedValue({ tsb: 0, ctl: 50, atl: 50 }),
}));
vi.mock("@/services/analytics", () => ({
  AnalyticsService: {
    calculateTTB: vi
      .fn()
      .mockReturnValue({
        strength: 50,
        endurance: 50,
        wellness: 50,
        lowest: "strength",
      }),
  },
}));
vi.mock("@/services/oracle", () => ({
  OracleService: {
    consult: vi.fn().mockResolvedValue({
      id: "mock-rec",
      title: "mock-title",
      rationale: "mock-rationale",
      playlist: [],
      generatedSession: null,
    }),
  },
}));

describe("PlannerService", () => {
  it("should generate a plan for a valid user", async () => {
    // Setup mock user
    (prisma.user.findUnique as any).mockResolvedValue({
      id: "user1",
      hevyApiKey: "test-key",
      intervalsApiKey: "test-key",
      intervalsAthleteId: "test-id",
      exerciseLogs: [],
      cardioLogs: [],
      activePath: "IRON_JUGGERNAUT",
    });

    const plan = await PlannerService.triggerWeeklyPlanGeneration("user1");

    expect(plan).toBeDefined();
    expect(plan.id).toMatch(/^plan_/);
    expect(prisma.weeklyPlan.create).toHaveBeenCalled();
  });
});
