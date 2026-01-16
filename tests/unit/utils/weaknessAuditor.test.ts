import { describe, it, expect } from "vitest";
import { auditWeaknesses } from "@/utils/weaknessAuditor";
import {
  MuscleGroupVolume,
  WeaknessLevel,
} from "@/types/auditor";

// Mock Data
const mockChestUndertrained: MuscleGroupVolume = {
  muscleGroup: "Chest",
  weeklyVolume: 5,
  lastUpdated: new Date().toISOString(),
};

const mockSideDeltsOverreached: MuscleGroupVolume = {
  muscleGroup: "Shoulders (Side)", // MEV 8, MRV 26
  weeklyVolume: 30,
  lastUpdated: new Date().toISOString(),
};

const _mockBackAtrophy: MuscleGroupVolume = {
  muscleGroup: "Back (Width)",
  weeklyVolume: 0, // Assume MV is 0, so risk if strictly < MV? Or logic handles 0?
  // Current logic: < MV (0) -> Atrophy. 0 is not < 0. So 0 is "Undertrained" (< MEV)
  lastUpdated: new Date().toISOString(),
};

// We need to inject the standards for tests or rely on the real muscleMap.
// Integration test relies on real muscleMap which is fine.

describe("Weakness Auditor Engine", () => {
  it("WA-01: Detects UNDERTRAINED status", () => {
    const report = auditWeaknesses([mockChestUndertrained]);
    const chestAudit = report.muscleAudits.find(
      (a: any) => a.muscleGroup === "Chest",
    );

    expect(chestAudit).toBeDefined();
    // Chest MEV is 8. Volume is 5.
    expect(chestAudit?.level).toBe(WeaknessLevel.UNDERTRAINED);
    expect(chestAudit?.deficit).toBe(3); // 8 - 5
  });

  it("WA-02: Detects OVERREACHED status", () => {
    const report = auditWeaknesses([mockSideDeltsOverreached]);
    const deltAudit = report.muscleAudits.find(
      (a: any) => a.muscleGroup === "Shoulders (Side)",
    );

    // Side Delt MRV is 26. Volume is 30.
    expect(deltAudit?.level).toBe(WeaknessLevel.OVERREACHED);
    expect(deltAudit?.recommendation).toContain("Reduce volume");
  });

  it("WA-05: Calculates Push/Pull Ratio correctly", () => {
    // Push: Chest (20)
    // Pull: Back Width (10)
    const volumes: MuscleGroupVolume[] = [
      { muscleGroup: "Chest", weeklyVolume: 20, lastUpdated: "" },
      { muscleGroup: "Back (Width)", weeklyVolume: 10, lastUpdated: "" },
    ];

    const report = auditWeaknesses(volumes);
    const ppRatio = report.ratios.find((r) => r.type === "push_pull");

    expect(ppRatio).toBeDefined();
    // 20 / 10 = 2.0
    expect(ppRatio?.value).toBe(2.0);
    expect(ppRatio?.status).toBe("structural_risk");
  });

  it("WA-06: Identifies Balanced Quad/Ham Ratio", () => {
    const volumes: MuscleGroupVolume[] = [
      { muscleGroup: "Quads", weeklyVolume: 10, lastUpdated: "" },
      { muscleGroup: "Hamstrings", weeklyVolume: 10, lastUpdated: "" },
    ];

    const report = auditWeaknesses(volumes);
    const qhRatio = report.ratios.find((r) => r.type === "quad_ham");

    expect(qhRatio?.value).toBe(1.0);
    expect(qhRatio?.status).toBe("balanced");
  });
});
