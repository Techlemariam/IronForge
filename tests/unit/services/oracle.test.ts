import { describe, it, expect, vi, beforeEach } from "vitest";
import { OracleService } from '@/services/oracle';
import prisma from "@/lib/prisma";
import { getWellness, getActivities } from "@/lib/intervals";
import { EquipmentService } from "@/services/game/EquipmentService";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  default: {
    user: { findUnique: vi.fn() },
    cardioLog: { findMany: vi.fn() },
    exerciseLog: { findMany: vi.fn() },
    duelChallenge: { findFirst: vi.fn() }, // NEW
    userEquipment: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/intervals", () => ({
  getWellness: vi.fn(),
  getActivities: vi.fn(),
}));

vi.mock("@/lib/hevy", () => ({
  getHevyWorkouts: vi.fn(),
}));

vi.mock("@/services/game/EquipmentService", () => ({
  EquipmentService: {
    getUserCapabilities: vi.fn().mockResolvedValue(["BARBELL", "MACHINE"])
  }
}));


describe("OracleService V3", () => {
  const mockUser = {
    id: "u1",
    intervalsApiKey: "key",
    intervalsAthleteId: "id",
    titan: { isInjured: false },
    activePath: "WARDEN"
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.cardioLog.findMany as any).mockResolvedValue([]);
    (prisma.exerciseLog.findMany as any).mockResolvedValue([]);
    (prisma.duelChallenge.findFirst as any).mockResolvedValue(null); // Default no duel
    (getActivities as any).mockResolvedValue([]);
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
  });

  it("should return V3 structure with codes", async () => {
    (getWellness as any).mockResolvedValue({ readiness: 50, sleepScore: 50 });
    const decree = await OracleService.generateDailyDecree("u1");
    expect(decree.code).toBeDefined();
    expect(decree.actions).toBeDefined();
    expect(decree.code).toBe("BASELINE_GRIND");
  });

  it("should return INJURY_PRESERVATION if injured", async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      ...mockUser,
      titan: { isInjured: true },
    });

    const decree = await OracleService.generateDailyDecree("u1");

    expect(decree.code).toBe("INJURY_PRESERVATION");
    expect(decree.actions.lockFeatures).toContain("HEAVY_LIFT");
    expect(decree.actions.urgency).toBe("HIGH");
  });

  it("should return REST_FORCED if bio-metrics are critical", async () => {
    (getWellness as any).mockResolvedValue({ readiness: 20 }); // Low
    const decree = await OracleService.generateDailyDecree("u1");

    expect(decree.code).toBe("REST_FORCED");
    expect(decree.actions.lockFeatures).toContain("HEAVY_LIFT");
  });

  it("should return PVP_RALLY if duel ending soon", async () => {
    (getWellness as any).mockResolvedValue({ readiness: 50, sleepScore: 60 });

    // Mock Active Duel ending tomorrow
    (prisma.duelChallenge.findFirst as any).mockResolvedValue({
      id: "d1",
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day left
    });

    const decree = await OracleService.generateDailyDecree("u1");

    expect(decree.code).toBe("PVP_RALLY");
    expect(decree.actions.urgency).toBe("MEDIUM");
    expect(decree.actions.notifyUser).toBe(true);
  });
});
