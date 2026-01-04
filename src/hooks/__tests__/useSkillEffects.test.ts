import { describe, it, expect } from "vitest";
import { calculateSkillEffects } from "@/features/game/hooks/useSkillEffects";
import { SessionMetadata } from "@/features/game/hooks/useSkillEffects";
import { IntervalsWellness } from "../../types";

describe("useSkillEffects Logic (Integration)", () => {
  // Helper to create mock wellness
  const mockWellness: IntervalsWellness = {
    id: "1",
    restingHR: 60,
    hrv: 50,
    sleepScore: 80,
    bodyBattery: 80,
    vo2max: 50,
  };

  it("should return default effects when no skills are unlocked", () => {
    const effects = calculateSkillEffects(new Set(), mockWellness);

    expect(effects.tpMultiplier).toBe(1.0);
    expect(effects.ksMultiplier).toBe(1.0);
    expect(effects.titanLoadMultiplier).toBe(1.0);
    expect(effects.features.brickWorkouts).toBe(false);
  });

  it("should apply simple effects from Juggernaut Origin", () => {
    const purchased = new Set(["origin_juggernaut"]);
    const effects = calculateSkillEffects(purchased, mockWellness);

    // Origin Juggernaut: Titan Load +10%
    expect(effects.titanLoadMultiplier).toBeCloseTo(1.1);
    // Flat TP +5
    expect(effects.flatTpBonus).toBe(5);
  });

  it("should compound multiplicative effects (Juggernaut Path)", () => {
    // Unlock Origin (1.1) and Iron Shoulder (1.15)
    const purchased = new Set(["origin_juggernaut", "notable_iron_shoulder"]);
    const effects = calculateSkillEffects(purchased, mockWellness);

    // 1.1 * 1.15 = 1.265
    expect(effects.titanLoadMultiplier).toBeCloseTo(1.265);
  });

  it("should apply Keystone drawback when conditions are met", () => {
    // Unlock Iron Discipline (+50% TP, but 0 TP if failed set)
    const purchased = new Set(["keystone_iron_discipline"]);

    // Scenario 1: No failed sets (Positive Effect)
    const cleanSession: SessionMetadata = { hasFailedSets: false };
    const effectsClean = calculateSkillEffects(
      purchased,
      mockWellness,
      cleanSession,
    );
    expect(effectsClean.tpMultiplier).toBe(1.5); // +50%

    // Scenario 2: Failed sets (Drawback Applied)
    const failedSession: SessionMetadata = { hasFailedSets: true };
    const effectsFailed = calculateSkillEffects(
      purchased,
      mockWellness,
      failedSession,
    );
    expect(effectsFailed.tpMultiplier).toBe(0); // Penalty overrides
  });

  it("should apply conditional effects (Sage Path)", () => {
    // Unlock Sage's Rest (+100 KS/day IF Body Battery > 80)
    // Note: Check ID in data file. It is 'keystone_sages_rest' in previous view.
    // Wait, Sage's Rest effect condition is minBodyBattery: 80

    const purchased = new Set(["keystone_sages_rest"]);

    // Scenario 1: High Body Battery (85) -> Effect Active
    const goodWellness = { ...mockWellness, bodyBattery: 85 };
    const effectsGood = calculateSkillEffects(purchased, goodWellness);
    expect(effectsGood.passiveKsPerDay).toBe(100);

    // Scenario 2: Low Body Battery (50) -> Effect Inactive
    const badWellness = { ...mockWellness, bodyBattery: 50 };
    const effectsBad = calculateSkillEffects(purchased, badWellness);
    expect(effectsBad.passiveKsPerDay).toBe(0);
  });
});
