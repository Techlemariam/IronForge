import { SkillNode } from "./types";

/**
 * Proof of concept Neural Lattice (Passive Skill Tree)
 * 
 * Future nodes will be added here to balance the gameplay loop.
 * Start at ROOT, then branch out.
 */
export const NEURAL_LATTICE_DATA: SkillNode[] = [
    {
        id: "ROOT_NODE",
        name: "Awakening",
        description: "The spark of Titan genesis. Unlocks your physical potential.",
        type: "MINOR",
        costKS: 0,
        costTP: 0,
        connections: [],
        position: { x: 500, y: 500 },
        modifiers: [
            { stat: "vitality", value: 1, isPercentage: false }
        ]
    },
    {
        id: "JUGGERNAUT_START",
        name: "Iron Flesh",
        description: "Increases Max HP and Strength.",
        type: "NOTABLE",
        costKS: 10,
        costTP: 1,
        connections: ["ROOT_NODE"],
        position: { x: 400, y: 350 },
        modifiers: [
            { stat: "maxHp", value: 25, isPercentage: false },
            { stat: "strength", value: 2, isPercentage: false }
        ],
        icon: "shield"
    },
    {
        id: "PATHFINDER_START",
        name: "Relentless Pace",
        description: "Increases Max Energy and Agility.",
        type: "NOTABLE",
        costKS: 10,
        costTP: 1,
        connections: ["ROOT_NODE"],
        position: { x: 600, y: 350 },
        modifiers: [
            { stat: "maxEnergy", value: 15, isPercentage: false },
            { stat: "agility", value: 2, isPercentage: false }
        ],
        icon: "wind"
    },
    {
        id: "WARDEN_START",
        name: "Stoic Resolve",
        description: "Improves Willpower and Endurance.",
        type: "NOTABLE",
        costKS: 10,
        costTP: 1,
        connections: ["ROOT_NODE"],
        position: { x: 500, y: 650 },
        modifiers: [
            { stat: "willpower", value: 3, isPercentage: false },
            { stat: "endurance", value: 2, isPercentage: false }
        ],
        icon: "brain"
    },
    {
        id: "KEYSTONE_BERSERKER",
        name: "Blood Price (Keystone)",
        description: "Converts 20% of Max HP to Strength. Cannot be reduced by debuffs.",
        type: "KEYSTONE",
        costKS: 50,
        costTP: 5,
        connections: ["JUGGERNAUT_START"],
        position: { x: 300, y: 200 },
        modifiers: [
            { stat: "maxHp", value: -20, isPercentage: true },
            { stat: "strength", value: 20, isPercentage: true }
        ],
        icon: "flame"
    }
];

export const getSkillNodeById = (id: string): SkillNode | undefined => {
    return NEURAL_LATTICE_DATA.find((node) => node.id === id);
};
