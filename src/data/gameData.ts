
import { Monster, Zone } from '../types';

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
