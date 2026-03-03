/**
 * Neural Lattice (Skill Tree) Typings
 *
 * Defines the passive skill tree ("Path of Exile style") structures.
 */

export type NodeType = "MINOR" | "NOTABLE" | "KEYSTONE";

export type StatModifier = {
    stat: "strength" | "vitality" | "endurance" | "agility" | "willpower" | "maxHp" | "maxEnergy" | "mrvAdherence";
    value: number; // Flat value or percentage based on type
    isPercentage: boolean;
};

export type SkillNode = {
    id: string;
    name: string;
    description: string;
    type: NodeType;

    // Cost to unlock this node
    costKS: number; // Kinetic Shards (derived from kineticEnergy)
    costTP: number; // Talent Points (from training volume/Titan level)

    // Pre-requisites (other node IDs that must be unlocked first)
    connections: string[];

    // Visual position on the UI canvas
    position: { x: number; y: number };

    // The buffs this node grants
    modifiers: StatModifier[];

    // Optional icon or glyph
    icon?: string;
};
