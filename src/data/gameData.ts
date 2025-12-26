
import { Monster, Zone } from '../types';
import { GameItem, CraftingRecipe } from '../types/game';

export const MONSTERS: Monster[] = [
    {
        id: 'monster_stone_giant',
        name: 'The Living Monolith',
        type: 'Giant',
        level: 1,
        description: 'A massive golem formed from ancient bedrock. Resilient and slow.',
        image: '🗿',
        hp: 1000,
        maxHp: 1000,
        element: 'Earth',
        weakness: ['legs'],
        associatedExerciseIds: ['ex_belt_squat']
    },
    {
        id: 'monster_iron_wraith',
        name: 'Iron Wraith',
        type: 'Undead',
        level: 3,
        description: 'A spectral guardian bound to the heavy chains of the old forge.',
        image: '👻',
        hp: 500,
        maxHp: 500,
        element: 'Shadow',
        weakness: ['pull'],
        associatedExerciseIds: ['ex_ghd_raise']
    },
    {
        id: 'monster_viking_warlord',
        name: 'Ancient Jarl',
        type: 'Beast',
        level: 5,
        description: 'A resurrected warrior who refuses to drop the hammer.',
        image: '🛡️',
        hp: 2500,
        maxHp: 2500,
        element: 'Ice',
        weakness: ['push'],
        associatedExerciseIds: ['ex_landmine_press']
    },
    {
        id: 'monster_storm_drake',
        name: 'Thunder-Tail Drake',
        type: 'Dragon',
        level: 7,
        description: 'A winged predator that feeds on the kinetic energy of rapid-fire movements.',
        image: '🐲',
        hp: 5000,
        maxHp: 5000,
        element: 'Lightning',
        weakness: ['endurance'],
        associatedExerciseIds: ['ex_bike_flush']
    },
    {
        id: 'monster_titan_core',
        name: 'The Vulcan Core',
        type: 'Construct',
        level: 10,
        description: 'The pulsating heart of the foundry. High temperature, high pressure, high stakes.',
        image: '☄️',
        hp: 15000,
        maxHp: 15000,
        element: 'Fire',
        weakness: ['push', 'legs'],
        associatedExerciseIds: ['ex_belt_squat', 'ex_landmine_press']
    }
];

export const ZONES: Zone[] = [
    {
        id: 'zone_foundry',
        name: 'The Iron Foundry',
        description: 'The industrial heart of IronForge. Heavy weights and high heat.',
        requiredLevel: 1,
        coordinates: { x: 50, y: 70 },
        icon: '🌋',
        isDiscovered: true,
        region: 'Foundry'
    },
    {
        id: 'zone_wind_spire',
        name: 'The Wind Spire',
        description: 'A dizzying peak where cardiorespiratory limits are tested.',
        requiredLevel: 5,
        coordinates: { x: 30, y: 30 },
        icon: '🌪️',
        isDiscovered: false,
        region: 'Wilderness'
    },
    {
        id: 'zone_spirit_pools',
        name: 'The Spirit Pools',
        description: 'Serene gardens built for recovery and neural recalibration.',
        requiredLevel: 2,
        coordinates: { x: 70, y: 40 },
        icon: '🌊',
        isDiscovered: true,
        region: 'Ethereal'
    }
];

export const ITEMS: GameItem[] = [
    {
        id: 'item_iron_ore',
        name: 'Iron Ore',
        description: 'Raw ore mined from the depths of the gym logic.',
        type: 'material',
        rarity: 'common',
        value: 5,
        image: '🪨',
        stackable: true
    },
    {
        id: 'item_flux',
        name: 'Kinetic Flux',
        description: 'A stabilizing agent found in high-rep ranges.',
        type: 'material',
        rarity: 'common',
        value: 10,
        image: '✨',
        stackable: true
    },
    {
        id: 'item_titan_ingot',
        name: 'Titan Ingot',
        description: 'Refined metal, strong enough to forge god-tier equipment.',
        type: 'material',
        rarity: 'rare',
        value: 50,
        image: '🧱',
        stackable: true
    },
    {
        id: 'item_potion_haste',
        name: 'Potion of Haste',
        description: 'Temporarily increases workout speed (reduces rest times).',
        type: 'consumable',
        rarity: 'uncommon',
        effect: 'Reduces Rest Timers by 15% for 1 hour.',
        value: 25,
        image: '🧪',
        stackable: true
    },
    {
        id: 'item_potion_power',
        name: 'Elixir of Power',
        description: 'Surges with pre-workout energy.',
        type: 'consumable',
        rarity: 'rare',
        effect: '+5% Estimated 1RM for next session.',
        value: 100,
        image: '🍷',
        stackable: true
    }
];

export const RECIPES: CraftingRecipe[] = [
    {
        id: 'recipe_refine_iron',
        name: 'Refine Iron',
        resultItemId: 'item_titan_ingot',
        resultCount: 1,
        materials: [
            { itemId: 'item_iron_ore', count: 2 },
            { itemId: 'item_flux', count: 1 }
        ],
        goldCost: 20,
        craftingTimeSeconds: 5
    },
    {
        id: 'recipe_brew_haste',
        name: 'Brew Haste Potion',
        resultItemId: 'item_potion_haste',
        resultCount: 1,
        materials: [
            { itemId: 'item_flux', count: 3 }
        ],
        goldCost: 50,
        craftingTimeSeconds: 10
    }
];
