import { describe, it, expect, vi, beforeEach } from "vitest";
import { OracleService } from "../oracle";
import prisma from "@/lib/prisma";
import { getWellness, getActivities } from "@/lib/intervals";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  default: {
    user: { findUnique: vi.fn() },
    cardioLog: { findMany: vi.fn() },
    exerciseLog: { findMany: vi.fn() },
    userEquipment: { findMany: vi.fn().mockResolvedValue([{ item: { equipmentType: "BARBELL" } }]) },
  },
}));

vi.mock("@/lib/intervals", () => ({
  getWellness: vi.fn(),
  getActivities: vi.fn(),
}));

vi.mock("@/lib/hevy", () => ({
  getHevyWorkouts: vi.fn(),
}));

describe("OracleService", () => {
  const mockUser = {
    id: "u1",
    intervalsApiKey: "key",
    intervalsAthleteId: "id",
    titan: { isInjured: false },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.cardioLog.findMany as any).mockResolvedValue([]);
    (prisma.exerciseLog.findMany as any).mockResolvedValue([]);
    (getActivities as any).mockResolvedValue([]);
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
  });

  it("should return Decree of Preservation if injured", async () => {
    (prisma.user.findUnique as any).mockResolvedValue({
      ...mockUser,
      titan: { isInjured: true },
    });

    const decree = await OracleService.generateDailyDecree("u1");

    expect(decree.type).toBe("DEBUFF");
    expect(decree.label).toBe("Decree of Preservation");
  });

  it("should return Decree of Rest if Body Battery is low", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);
    (getWellness as any).mockResolvedValue({ readiness: 20 }); // Body Battery < 30
    (prisma.cardioLog.findMany as any).mockResolvedValue([]);
    (prisma.exerciseLog.findMany as any).mockResolvedValue([]);
    (getActivities as any).mockResolvedValue([]);

    const decree = await OracleService.generateDailyDecree("u1");

    expect(decree.type).toBe("DEBUFF");
    expect(decree.label).toBe("Decree of Rest");
  });

  it("should return Decree of Power if conditions are perfect", async () => {
    (prisma.user.findUnique as any).mockResolvedValue(mockUser);

    // Mock perfect stats
    (getWellness as any).mockResolvedValue({
      readiness: 90,
      sleepScore: 90,
      hrv: 100, // assuming baseline is < 100
    });

    // Mock low load (not overreaching)
    (prisma.cardioLog.findMany as any).mockResolvedValue([]);
    (prisma.exerciseLog.findMany as any).mockResolvedValue([]);
    (getActivities as any).mockResolvedValue([]);

    const decree = await OracleService.generateDailyDecree("u1");

    expect(decree.type).toBe("BUFF");
    expect(decree.label).toBe("Decree of Power");
  });
});
