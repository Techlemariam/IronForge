
import { IntervalsWellness, OracleRecommendation, TTBIndices, Session, BlockType, ExerciseLogic, IntervalsEvent } from '../types';

/**
 * The Oracle
 * An adaptive coaching engine that prescribes the next action based on physiological state and progression goals.
 */
export const OracleService = {

    consult: (
        wellness: IntervalsWellness, 
        ttb: TTBIndices,
        events: IntervalsEvent[] = []
    ): OracleRecommendation => {
        
        // --- PRIORITY 0: EVENT RADAR (Races & Competitions) ---
        // Checks for events in the immediate future (-2 to +7 days)
        const today = new Date();
        const raceComingUp = events.find(e => {
            const eventDate = new Date(e.start_date_local);
            const diffTime = eventDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            return diffDays >= 0 && diffDays <= 7;
        });

        const raceJustFinished = events.find(e => {
            const eventDate = new Date(e.start_date_local);
            const diffTime = today.getTime() - eventDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 && diffDays <= 2;
        });

        if (raceJustFinished) {
             return {
                type: 'RECOVERY',
                title: 'POST-RACE RESTORATION',
                rationale: `Event "${raceJustFinished.name}" detected recently. System flush required. Structural integrity must be restored before resuming heavy load.`,
                priorityScore: 110, // Higher than everything
                targetExercise: 'Mobility & Foam Roll'
            };
        }

        if (raceComingUp) {
            const eventDate = new Date(raceComingUp.start_date_local);
            const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (daysUntil <= 2) {
                // PRIMING / ACTIVATION
                const primeSession: Session = {
                    id: `oracle_prime_${Date.now()}`,
                    name: 'Oracle: Neural Priming',
                    zoneName: 'The Antechamber',
                    difficulty: 'Normal',
                    isGenerated: true,
                    blocks: [
                        { id: 'wu', name: 'Dynamic Warmup', type: BlockType.WARMUP, exercises: [{ id: 'wu1', name: 'Leg Swings', logic: ExerciseLogic.FIXED_REPS, sets: [{id:'s1', reps: 20, completed: false}] }] },
                        { id: 'act', name: 'Activation', type: BlockType.STATION, exercises: [{ id: 'act1', name: 'Explosive Jumps', logic: ExerciseLogic.FIXED_REPS, sets: [{id:'j1', reps: 3, completed: false, rarity: 'rare'}, {id:'j2', reps: 3, completed: false, rarity: 'rare'}] }] }
                    ]
                };
                return {
                    type: 'COMPETITION_PREP',
                    title: 'NEURAL PRIMING',
                    generatedSession: primeSession,
                    rationale: `Target Acquired: "${raceComingUp.name}" in ${daysUntil} days. Volume dropped to zero. Intensity high but short to prime the CNS.`,
                    priorityScore: 105
                };
            } else {
                // TAPER
                return {
                    type: 'TAPER',
                    title: 'TAPER PROTOCOL ACTIVE',
                    rationale: `Approaching "${raceComingUp.name}" (${daysUntil} days). Volume reduced by 50%. Focus on maintaining intensity without fatigue accumulation.`,
                    priorityScore: 105,
                    targetExercise: 'Low Volume / High Quality'
                };
            }
        }

        // --- PRIORITY 1: SAFETY (Critical Physiological Check) ---
        // Overrides all logic if system is critical.
        const isCompromised = (wellness.bodyBattery || 100) < 25 || (wellness.sleepScore || 100) < 30;
        
        if (isCompromised) {
            return {
                type: 'RECOVERY',
                title: 'CRITICAL: REST REQUIRED',
                rationale: `System Critical (Body Battery ${wellness.bodyBattery}). Risk of injury is extreme. No training authorized.`,
                priorityScore: 100
            };
        }

        // --- PRIORITY 2: BALANCE CORRECTION (The Weakest Link) ---
        // Prioritize the lowest TTB Index to enforce a "Fully Trained Body".

        if (ttb.lowest === 'wellness') {
            // GENERATE DYNAMIC RECOVERY SESSION
            const recoverySession: Session = {
                id: `oracle_recovery_${Date.now()}`,
                name: 'Oracle: Active Restoration',
                zoneName: 'The Spirit Pools',
                difficulty: 'Normal',
                isGenerated: true,
                blocks: [
                    {
                        id: 'rec_mob',
                        name: 'Mobility Flow',
                        type: BlockType.WARMUP,
                        exercises: [
                            {
                                id: 'ex_cat_cow',
                                name: 'Cat-Cow Flow',
                                logic: ExerciseLogic.FIXED_REPS,
                                sets: [{ id: 'r1', reps: 20, completed: false, weight: 0 }]
                            },
                            {
                                id: 'ex_world_greatest',
                                name: 'World\'s Greatest Stretch',
                                logic: ExerciseLogic.FIXED_REPS,
                                sets: [{ id: 'r2', reps: 10, completed: false, weight: 0 }]
                            }
                        ]
                    },
                    {
                        id: 'rec_zone1',
                        name: 'Station: Zone 1 Flush',
                        type: BlockType.STATION,
                        exercises: [
                            {
                                id: 'ex_bike_flush',
                                name: 'Airbike Flush (Z1 Only)',
                                logic: ExerciseLogic.FIXED_REPS,
                                instructions: ['Maintain nose breathing.', 'HR must stay < 110 BPM.'],
                                sets: [{ id: 'z1_1', reps: '15 min', completed: false, weight: 0 }]
                            }
                        ]
                    }
                ]
            };

             return {
                type: 'RECOVERY',
                title: 'PRIORITIZE RECOVERY',
                generatedSession: recoverySession,
                rationale: `Wellness Index (${ttb.wellness}) is limiting growth. I have generated a custom Active Recovery protocol to flush metabolites without CNS stress.`,
                priorityScore: 95
            };
        }

        if (ttb.lowest === 'endurance') {
             // GENERATE DYNAMIC ENDURANCE SESSION
             const enduranceSession: Session = {
                id: `oracle_endurance_${Date.now()}`,
                name: 'Oracle: Engine Builder',
                zoneName: 'The Wind Spire',
                difficulty: 'Heroic',
                isGenerated: true,
                blocks: [
                    {
                        id: 'end_warmup',
                        name: 'Ramp Up',
                        type: BlockType.WARMUP,
                        exercises: [{ id: 'wu_ramp', name: 'Progressive Ramp (Z1->Z3)', logic: ExerciseLogic.FIXED_REPS, sets: [{ id: 'w1', reps: '5 min', completed: false }] }]
                    },
                    {
                        id: 'end_intervals',
                        name: 'Station: VO2 Max Intervals',
                        type: BlockType.STATION,
                        exercises: [
                            {
                                id: 'ex_intervals_4x4',
                                name: '4x4 Norwegian Intervals',
                                logic: ExerciseLogic.FIXED_REPS,
                                instructions: ['4 Minutes at 90% HRMax', '3 Minutes Active Recovery', 'Repeat 4 times.'],
                                sets: [
                                    { id: 'i1', reps: '4 min', completed: false, rarity: 'epic' },
                                    { id: 'i2', reps: '4 min', completed: false, rarity: 'epic' },
                                    { id: 'i3', reps: '4 min', completed: false, rarity: 'epic' },
                                    { id: 'i4', reps: '4 min', completed: false, rarity: 'epic' },
                                ]
                            }
                        ]
                    }
                ]
            };

            return {
                type: 'CARDIO_VALIDATION',
                title: 'AERO ATTACK PROTOCOL',
                generatedSession: enduranceSession,
                rationale: `Endurance Index (${ttb.endurance}) is lagging. To maintain Elite status, you must validate your engine. I have added a VO2 Max quest to your log.`,
                priorityScore: 90
            };
        }

        if (ttb.lowest === 'strength') {
             // Determine which session to push based on history (defaulting A for demo)
             return {
                type: 'PR_ATTEMPT',
                title: 'STRENGTH FOCUS: LANDMINE',
                sessionId: 'session_a',
                targetExercise: 'Landmine Press',
                rationale: `Strength Index (${ttb.strength}) has decayed. It has been too long since your last Epic set. You are primed for a PR attempt.`,
                priorityScore: 90
            };
        }

        // --- PRIORITY 3: MAINTENANCE (Balanced State) ---
        // If everything is balanced, default to standard progression.
        return {
            type: 'GRIND',
            title: 'MAINTENANCE: BELT SQUAT',
            sessionId: 'session_b',
            targetExercise: 'Belt Squat',
            rationale: `All systems balanced (TTB ~${ttb.strength}). Proceed with standard volume accumulation to build Titan Load.`,
            priorityScore: 50
        };
    }
};
