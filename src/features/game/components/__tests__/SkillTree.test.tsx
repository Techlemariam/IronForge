/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import SkillTree from "../SkillTree";
import { useSkills } from "../../../../context/SkillContext";
import { SkillStatus } from "../../../../types/skills";

// Mock React Flow
vi.mock("reactflow", () => ({
  default: ({ children }: any) => <div>ReactFlow Mock {children}</div>,
  Background: () => <div>Background</div>,
  Controls: () => <div>Controls</div>,
  useNodesState: (initial: any) => [initial, vi.fn(), vi.fn()],
  useEdgesState: (initial: any) => [initial, vi.fn(), vi.fn()],
  Handle: () => null,
  Position: { Top: "top", Bottom: "bottom" },
}));

// Mock Context
vi.mock("../../../../context/SkillContext", () => ({
  useSkills: vi.fn(),
}));

// Mock Data
vi.mock("../../../../data/skill-tree-v2", () => ({
  SKILL_TREE_V2: [
    {
      id: "node-1",
      title: "Test Skill",
      tier: "minor",
      cost: 1,
      currency: "talent_point",
      description: "Test Description",
      position: { x: 0, y: 0 },
      parents: [],
    },
    {
      id: "node-2",
      title: "Locked Skill",
      tier: "minor",
      cost: 1,
      currency: "talent_point",
      description: "Locked Description",
      position: { x: 100, y: 0 },
      parents: ["node-1"],
    },
  ],
  getNodeById: vi.fn(),
}));

describe("SkillTree Component", () => {
  const mockUnlockSkill = vi.fn();
  const mockCanAfford = vi.fn();
  const mockGetNodeStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSkills as any).mockReturnValue({
      purchasedSkillIds: [],
      unlockSkill: mockUnlockSkill,
      canAfford: mockCanAfford,
      availableTalentPoints: 5,
      availableKineticShards: 10,
      getNodeStatus: mockGetNodeStatus,
      refundSkill: vi.fn(),
      activeKeystoneId: null,
    });
  });

  it("should render header with currency", () => {
    mockGetNodeStatus.mockReturnValue(SkillStatus.LOCKED);

    render(<SkillTree onExit={vi.fn()} wellness={null} />);

    expect(screen.getByText("Neural Lattice")).toBeDefined();
    expect(screen.getByText("5 TP")).toBeDefined();
    expect(screen.getByText("10 KS")).toBeDefined();
  });

  // Note: Interacting with React Flow nodes in unit test via RTL is hard because they are canvas/custom divs.
  // We typically test the "Logic" of node generation in the component (which we can't easily access without exporting)
  // OR we test the side panel if it renders.

  // Since we mocked useSkills, we verify that the component *attempts* to rceive data.
  // A true integration test would need a helper to click a node.

  it("should rely on context for node status", () => {
    mockGetNodeStatus.mockReturnValue(SkillStatus.UNLOCKED);
    render(<SkillTree onExit={vi.fn()} wellness={null} />);
    expect(mockGetNodeStatus).toHaveBeenCalled();
  });
});
