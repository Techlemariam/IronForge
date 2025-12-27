export const ACHIEVEMENTS_DATA = [
    // Strength
    {
        code: 'FIRST_LIFT',
        name: 'First Lift',
        description: 'Log your first strength workout',
        icon: '💪',
        condition: { type: 'count', metric: 'workout', target: 1 }
    },
    {
        code: 'IRON_BORN',
        name: 'Iron Born',
        description: 'Log 10 strength workouts',
        icon: '🏋️',
        condition: { type: 'count', metric: 'workout', target: 10 }
    },
    {
        code: 'TITAN_STRENGTH',
        name: 'Titan Strength',
        description: 'Log 50 strength workouts',
        icon: '🏛️',
        condition: { type: 'count', metric: 'workout', target: 50 }
    },

    // Cardio
    {
        code: 'CARDIO_NOVICE',
        name: 'Cardio Novice',
        description: 'Complete 1 cardio session',
        icon: '🏃',
        condition: { type: 'count', metric: 'cardio', target: 1 }
    },
    {
        code: 'MARATHONER',
        name: 'Marathoner',
        description: 'Complete 10 cardio sessions',
        icon: '👟',
        condition: { type: 'count', metric: 'cardio', target: 10 }
    },

    // Social
    {
        code: 'JOIN_THE_HORDE',
        name: 'Join the Horde',
        description: 'Join a Guild',
        icon: '🏴',
        condition: { type: 'boolean', metric: 'guild', target: true }
    },

    // Bosses
    {
        code: 'BOSS_SLAYER',
        name: 'Boss Slayer',
        description: 'Defeat your first Raid Boss',
        icon: '🐉',
        condition: { type: 'count', metric: 'boss_kill', target: 1 }
    }
];
