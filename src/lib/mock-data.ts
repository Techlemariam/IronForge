import { IntervalsWellness, IntervalsActivity, IntervalsEvent, Block, BlockType, ExerciseLogic } from '@/types';
import { HevyWorkout } from '@/types/hevy';

export const MOCK_WELLNESS: IntervalsWellness = {
    id: 'mock-wellness',
    bodyBattery: 85,
    sleepScore: 92,
    hrv: 65,
    restingHR: 48,
    vo2max: 54,
    ctl: 45,
    atl: 55,
    tsb: -10,
    sleepSecs: 28800, // 8 hours
    ramp_rate: 1.5
};

export const MOCK_ACTIVITIES: IntervalsActivity[] = [
    { id: 'mock-run-1', icu_intensity: 85, moving_time: 1800 }, // 30m Run
    { id: 'mock-ride-1', icu_intensity: 60, moving_time: 3600 }, // 60m Ride
    { id: 'mock-run-2', icu_intensity: 75, moving_time: 2400 }, // 40m Run
    { id: 'mock-ride-2', icu_intensity: 65, moving_time: 3600 }, // 60m Ride
    { id: 'mock-run-3', icu_intensity: 90, moving_time: 1200 }, // 20m Hiit
];

export const MOCK_EVENTS: IntervalsEvent[] = [
    { id: 1, start_date_local: new Date().toISOString(), name: 'Ironman Training', category: 'WORKOUT', type: 'Run' },
    { id: 2, start_date_local: new Date(Date.now() + 86400000).toISOString(), name: 'Recovery Ride', category: 'WORKOUT', type: 'Ride' }
];

export const MOCK_HEVY_WORKOUTS: HevyWorkout[] = [
    {
        id: 'mock-w-1',
        title: 'Upper Body Power',
        // description: 'Heavy pushing day', // HevyWorkout interface doesn't have description? Check types/hevy.ts. It doesn't.
        start_time: new Date(Date.now() - 86400000 * 1).toISOString(),
        duration_seconds: 3600,
        // end_time not in HevyWorkout
        exercises: [
            {
                exercise_template_id: 'bench',
                exercise_template: { id: 'bench', title: 'Bench Press' },
                sets: [{ index: 0, weight_kg: 100, reps: 5 }, { index: 1, weight_kg: 100, reps: 5 }, { index: 2, weight_kg: 100, reps: 5 }]
            },
            {
                exercise_template_id: 'ohp',
                exercise_template: { id: 'ohp', title: 'Overhead Press' },
                sets: [{ index: 0, weight_kg: 60, reps: 8 }, { index: 1, weight_kg: 60, reps: 8 }]
            },
        ]
    },
    {
        id: 'mock-w-2',
        title: 'Lower Body Hypertrophy',
        start_time: new Date(Date.now() - 86400000 * 3).toISOString(),
        duration_seconds: 4500,
        exercises: [
            {
                exercise_template_id: 'squat',
                exercise_template: { id: 'squat', title: 'Squat' },
                sets: [{ index: 0, weight_kg: 140, reps: 8 }, { index: 1, weight_kg: 140, reps: 8 }]
            },
            {
                exercise_template_id: 'leg-ext',
                exercise_template: { id: 'leg-ext', title: 'Leg Extension' },
                sets: [{ index: 0, weight_kg: 80, reps: 15 }]
            },
        ]
    },
    {
        id: 'mock-w-3',
        title: 'Full Body Tempo',
        start_time: new Date(Date.now() - 86400000 * 5).toISOString(),
        duration_seconds: 3000,
        exercises: [
            {
                exercise_template_id: 'deadlift',
                exercise_template: { id: 'deadlift', title: 'Deadlift' },
                sets: [{ index: 0, weight_kg: 180, reps: 3 }]
            },
        ]
    }
];

export const MOCK_ORACLE_PLAN = {
    weeklyFocus: 'Hybrid Peak',
    recommendation: {
        type: 'COMPETITION_PREP' as const,
        title: 'Mock Prep Phase',
        rationale: 'Simulated data suggests you are ready to peak.',
        priorityScore: 95,
        targetExercise: 'Squat'
    }
};

export const MOCK_TITAN_ATTRIBUTES = {
    strength: 75,
    endurance: 60,
    technique: 80,
    recovery: 90,
    mental: 70,
    hypertrophy: 65
};
