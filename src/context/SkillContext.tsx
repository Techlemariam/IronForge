/**
 * @fileoverview SkillContext V2
 * Manages Neural Lattice state with V2 node structure and effect calculation.
 */

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import {
  SKILL_TREE_V2,
  getNodeById,
  countUnlockedNotables,
} from "../data/skill-tree-v2";
import {
  SkillNodeV2,
  CalculatedEffects,
  SkillStatus,
  SkillRequirement,
} from "../types/skills";
import { calculateTitanRank, playSound, getMaxTM } from "../utils";
import { IntervalsWellness } from "../types";
import { StorageService } from "../services/storage";
import {
  useSkillEffects,
  canPurchaseKeystone,
  getPathProgress,
  SessionMetadata,
} from "../hooks/useSkillEffects";

// ============================================================================
// Logic Helpers
// ============================================================================

const checkRequirement = (
  req: SkillRequirement,
  unlockedAchievementIds: Set<string>,
  wellness: IntervalsWellness | null,
): boolean => {
  if (req.type === "achievement_count") {
    // If exerciseId is 'any', count total achievements.
    // Otherwise check specific exercise achievements? (Current implementation usually counts total unlocked)
    // For V2, let's assume 'value' is the count of achievements needed.
    return unlockedAchievementIds.size >= req.value;
  }

  if (req.type === "vo2max_value") {
    if (!wellness || !wellness.vo2max) return false;
    return req.comparison === "gte"
      ? wellness.vo2max >= req.value
      : wellness.vo2max <= req.value;
  }

  if (req.type === "1rm_weight") {
    const maxTM = getMaxTM(req.exerciseId || "any"); // Handle missing ID gracefully
    return req.comparison === "gte" ? maxTM >= req.value : maxTM <= req.value;
  }

  // Fallback for types not yet implemented or 'any' exercise check
  return true;
};

// ============================================================================
// Context Types
// ============================================================================

interface SkillContextType {
  // State
  purchasedSkillIds: Set<string>;
  isLoading: boolean;

  // Resources
  availableTalentPoints: number;
  availableKineticShards: number;

  // Actions
  unlockSkill: (skillId: string) => { success: boolean; message?: string };
  canAfford: (skillId: string) => boolean;
  refundSkill: (skillId: string) => { success: boolean; message?: string };

  // V2 Features
  calculatedEffects: CalculatedEffects;
  pathProgress: Record<string, number>;
  getNodeStatus: (nodeId: string) => SkillStatus;
  activeKeystoneId: string | null;
}

const SkillContext = createContext<SkillContextType | null>(null);

// ============================================================================
// Hook
// ============================================================================

export const useSkills = () => {
  const context = useContext(SkillContext);
  if (!context) {
    throw new Error("useSkills must be used within a SkillProvider");
  }
  return context;
};

// ============================================================================
// Provider
// ============================================================================

interface SkillProviderProps {
  children: React.ReactNode;
  unlockedAchievementIds: Set<string>;
  wellness: IntervalsWellness | null;
  sessionMetadata?: SessionMetadata;
}

export const SkillProvider: React.FC<SkillProviderProps> = ({
  children,
  unlockedAchievementIds,
  wellness,
  sessionMetadata = {},
}) => {
  const [purchasedSkillIds, setPurchasedSkillIds] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(true);

  // ─────────────────────────────────────────────────────────────────────────
  // Load from Storage
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadSkills = async () => {
      try {
        await StorageService.init();
        const saved = await StorageService.getState<string[]>("skills_v2");
        if (saved) {
          setPurchasedSkillIds(new Set(saved));
        } else {
          // Try loading V1 and migrating
          const v1Saved = await StorageService.getState<string[]>("skills");
          if (v1Saved) {
            // Basic migration: keep IDs that exist in V2
            const validV2Ids = v1Saved.filter((id) => getNodeById(id));
            setPurchasedSkillIds(new Set(validV2Ids));
            // Save to V2 key
            await StorageService.saveState("skills_v2", validV2Ids);
          }
        }
      } catch (e) {
        console.error("Skill load failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSkills();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Calculate Resources
  // ─────────────────────────────────────────────────────────────────────────
  const { talentPoints: totalTP, kineticShards: totalKS } = useMemo(
    () => calculateTitanRank(unlockedAchievementIds),
    [unlockedAchievementIds],
  );

  const { spentTP, spentKS } = useMemo(() => {
    let tp = 0;
    let ks = 0;
    purchasedSkillIds.forEach((id) => {
      const node = getNodeById(id);
      if (node) {
        if (node.currency === "talent_point") tp += node.cost;
        if (node.currency === "kinetic_shard") ks += node.cost;
      }
    });
    return { spentTP: tp, spentKS: ks };
  }, [purchasedSkillIds]);

  const availableTalentPoints = totalTP - spentTP;
  const availableKineticShards = totalKS - spentKS;

  // ─────────────────────────────────────────────────────────────────────────
  // V2 Effect Calculation
  // ─────────────────────────────────────────────────────────────────────────
  const calculatedEffects = useSkillEffects(
    purchasedSkillIds,
    wellness,
    sessionMetadata,
  );
  const pathProgress = useMemo(
    () => getPathProgress(purchasedSkillIds),
    [purchasedSkillIds],
  );
  const activeKeystoneId = calculatedEffects.activeKeystoneId;

  // ─────────────────────────────────────────────────────────────────────────
  // Node Status Calculation
  // ─────────────────────────────────────────────────────────────────────────
  const getNodeStatus = useCallback(
    (nodeId: string): SkillStatus => {
      if (purchasedSkillIds.has(nodeId)) {
        return SkillStatus.MASTERED;
      }

      const node = getNodeById(nodeId);
      if (!node) return SkillStatus.LOCKED;

      // Check parent requirements
      const parentsUnlocked =
        node.parents.length === 0 ||
        (node.unlockLogic === "AND"
          ? node.parents.every((pid) => purchasedSkillIds.has(pid))
          : node.parents.some((pid) => purchasedSkillIds.has(pid)));

      // Check requirements (achievements, stats, etc.)
      const requirementsMet = node.requirements.every((req) =>
        checkRequirement(req, unlockedAchievementIds, wellness),
      );
      if (!requirementsMet) return SkillStatus.LOCKED;

      if (!parentsUnlocked) return SkillStatus.LOCKED;

      // Check Keystone gating
      if (node.tier === "keystone") {
        const { canPurchase } = canPurchaseKeystone(nodeId, purchasedSkillIds);
        if (!canPurchase) return SkillStatus.LOCKED;
      }

      return SkillStatus.UNLOCKED;
    },
    [purchasedSkillIds, unlockedAchievementIds, wellness],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────────────────────
  const canAfford = useCallback(
    (skillId: string): boolean => {
      const node = getNodeById(skillId);
      if (!node) return false;

      if (node.currency === "talent_point")
        return availableTalentPoints >= node.cost;
      if (node.currency === "kinetic_shard")
        return availableKineticShards >= node.cost;
      return false;
    },
    [availableTalentPoints, availableKineticShards],
  );

  const unlockSkill = useCallback(
    (skillId: string): { success: boolean; message?: string } => {
      if (purchasedSkillIds.has(skillId)) {
        return { success: false, message: "Already unlocked" };
      }

      const node = getNodeById(skillId);
      if (!node) {
        return { success: false, message: "Node not found" };
      }

      // Check status
      const status = getNodeStatus(skillId);
      if (status === SkillStatus.LOCKED) {
        playSound("fail");
        return { success: false, message: "Prerequisites not met" };
      }

      // Check Keystone gating
      if (node.tier === "keystone") {
        const { canPurchase, reason } = canPurchaseKeystone(
          skillId,
          purchasedSkillIds,
        );
        if (!canPurchase) {
          playSound("fail");
          return { success: false, message: reason };
        }
      }

      // Check affordability
      if (!canAfford(skillId)) {
        playSound("fail");
        return { success: false, message: "Insufficient resources" };
      }

      // Determine sound based on tier
      if (node.tier === "keystone") {
        playSound("achievement");
      } else if (node.tier === "notable") {
        playSound("loot_epic");
      } else {
        playSound("ding");
      }

      setPurchasedSkillIds((prev) => {
        const next = new Set(prev);
        next.add(skillId);
        StorageService.saveState("skills_v2", Array.from(next)).catch(
          console.error,
        );
        return next;
      });

      return { success: true };
    },
    [purchasedSkillIds, getNodeStatus, canAfford],
  );

  const refundSkill = useCallback(
    (skillId: string): { success: boolean; message?: string } => {
      if (!purchasedSkillIds.has(skillId)) {
        return { success: false, message: "Skill not owned" };
      }

      const node = getNodeById(skillId);
      if (!node) {
        return { success: false, message: "Node not found" };
      }

      // Check if any other owned skills depend on this one
      const dependents = Array.from(purchasedSkillIds).filter((id) => {
        const n = getNodeById(id);
        return n?.parents.includes(skillId);
      });

      if (dependents.length > 0) {
        return { success: false, message: "Other skills depend on this node" };
      }

      // Keystones cannot be refunded (for now)
      if (node.tier === "keystone") {
        return { success: false, message: "Keystones cannot be refunded" };
      }

      playSound("ding");

      setPurchasedSkillIds((prev) => {
        const next = new Set(prev);
        next.delete(skillId);
        StorageService.saveState("skills_v2", Array.from(next)).catch(
          console.error,
        );
        return next;
      });

      return { success: true };
    },
    [purchasedSkillIds],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Provider Value
  // ─────────────────────────────────────────────────────────────────────────
  const value = useMemo<SkillContextType>(
    () => ({
      purchasedSkillIds,
      isLoading,
      availableTalentPoints,
      availableKineticShards,
      unlockSkill,
      canAfford,
      refundSkill,
      calculatedEffects,
      pathProgress,
      getNodeStatus,
      activeKeystoneId,
    }),
    [
      purchasedSkillIds,
      isLoading,
      availableTalentPoints,
      availableKineticShards,
      unlockSkill,
      canAfford,
      refundSkill,
      calculatedEffects,
      pathProgress,
      getNodeStatus,
      activeKeystoneId,
    ],
  );

  return (
    <SkillContext.Provider value={value}>{children}</SkillContext.Provider>
  );
};
