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
import { IntervalsWellness, Archetype } from "../types";
import { StorageService } from "../services/storage";
import {
  useSkillEffects,
  canPurchaseKeystone,
  getPathProgress,
  SessionMetadata,
} from "@/features/game/hooks/useSkillEffects";

// ============================================================================
// Logic Helpers
// ============================================================================

/**
 * Validates a skill requirement against user data.
 */
function checkRequirement(
  req: SkillRequirement,
  unlockedAchievementIds: Set<string>,
  wellness: IntervalsWellness | null,
): boolean {
  const { type, value, comparison, exerciseId } = req;

  const compare = (val: number) => {
    if (comparison === "gte") return val >= value;
    if (comparison === "lte") return val <= value;
    if (comparison === "eq") return val === value;
    return false;
  };

  switch (type) {
    case "achievement_count":
      return unlockedAchievementIds.size >= value;

    case "vo2max_value":
      return wellness?.vo2max ? compare(wellness.vo2max) : false;

    case "1rm_weight": {
      const maxTM = getMaxTM(exerciseId);
      return compare(maxTM);
    }

    // These require more complex data sources not yet fully integrated in V2 context
    case "rep_count":
    case "session_count":
    case "rest_day_count":
    case "sleep_score_streak":
    case "brick_workout_count":
      // For now, these default to true to avoid hard-locking the tree 
      // until the relevant tracking services are wired up to the Provider.
      console.warn(`Requirement type ${type} is not yet implemented, defaulting to true.`);
      return true;

    default:
      return false;
  }
}

// ============================================================================
// Context Types
// ============================================================================

interface SkillContextType {
  // State
  purchasedSkillIds: Set<string>;
  isLoading: boolean;
  userArchetype: Archetype; // Added

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
  setActiveKeystone: (keystoneId: string | null) => void;
}

const SkillContext = createContext<SkillContextType | null>(null);

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
  userArchetype?: Archetype; // Added
}

export const SkillProvider: React.FC<SkillProviderProps> = ({
  children,
  unlockedAchievementIds,
  wellness,
  sessionMetadata = {},
  userArchetype = Archetype.WARDEN,
}) => {
  const [purchasedSkillIds, setPurchasedSkillIds] = useState<Set<string>>(
    new Set(),
  );
  const [activeKeystoneId, setActiveKeystoneState] = useState<string | null>(null);
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

        // Load active keystone
        const savedKeystone = await StorageService.getState<string>("active_keystone");
        if (savedKeystone) {
          setActiveKeystoneState(savedKeystone);
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
    { ...sessionMetadata, activeKeystoneId },
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

      // Check Archetype Gating
      const allowedPaths: Record<Archetype, string[]> = {
        [Archetype.JUGGERNAUT]: ["juggernaut", "titan", "sage"],
        [Archetype.PATHFINDER]: ["pathfinder", "sage"],
        [Archetype.WARDEN]: [
          "juggernaut",
          "pathfinder",
          "warden",
          "titan",
          "sage",
        ],
      };

      // Default to Warden if undefined (safe fallback)
      const currentArchetype = userArchetype || Archetype.WARDEN;
      const accessiblePaths = allowedPaths[currentArchetype];

      if (!accessiblePaths.includes(node.path)) {
        return SkillStatus.LOCKED;
      }

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
    [purchasedSkillIds, unlockedAchievementIds, wellness, userArchetype],
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

  const setActiveKeystone = useCallback((keystoneId: string | null) => {
    setActiveKeystoneState(keystoneId);
    StorageService.saveState("active_keystone", keystoneId).catch(console.error);
    if (keystoneId) playSound("ui_select");
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Provider Value
  // ─────────────────────────────────────────────────────────────────────────
  const value = useMemo<SkillContextType>(
    () => ({
      purchasedSkillIds,
      isLoading,
      userArchetype,
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
      userArchetype,
      availableTalentPoints,
      availableKineticShards,
      unlockSkill,
      canAfford,
      refundSkill,
      calculatedEffects,
      pathProgress,
      getNodeStatus,
      activeKeystoneId,
      setActiveKeystone,
    ],
  );

  return (
    <SkillContext.Provider value={value}>{children}</SkillContext.Provider>
  );
};
