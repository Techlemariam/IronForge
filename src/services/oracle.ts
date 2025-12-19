import { IntervalsWellness, OracleRecommendation, TTBIndices, Session, BlockType, ExerciseLogic, IntervalsEvent, TitanLoadCalculation } from '../types';
import { AuditReport, WeaknessLevel } from '../types/auditor';
import { canPerformExercise, EquipmentType } from '../data/equipmentDb';
import { muscleMap } from '../data/muscleMap';
import { StorageService } from './storage';
import { GeminiService } from './gemini';

/**
 * The Oracle
 * An adaptive coaching engine that prescribes the next action based on physiological state and progression goals.
 */
export const OracleService = {

    consult: async (
        wellness: IntervalsWellness,
        ttb: TTBIndices,
        events: IntervalsEvent[] = [],
        auditReport?: AuditReport | null,
        titanAnalysis?: TitanLoadCalculation | null
    ): Promise<OracleRecommendation> => {

        // --- PRIORITY 0: EVENT RADAR (Races & Competitions) ---
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
            const rationale = await GeminiService.generateOracleAdvice({
                priority: "RECOVERY",
                trigger: `Race: ${raceJustFinished.name} finished recently`,
                wellness,
                data: { daysSince: 2 } // Approximation
            });

            return {
                type: 'RECOVERY',
                title: 'POST-RACE RESTORATION',
                rationale: rationale || `Event "${raceJustFinished.name}" detected recently. System flush required. Structural integrity must be restored before resuming heavy load.`,
                priorityScore: 110,
                targetExercise: 'Mobility & Foam Roll'
            };
        }

        if (raceComingUp) {
            const eventDate = new Date(raceComingUp.start_date_local);
            const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            if (daysUntil <= 2) {
                const primeSession: Session = {
                    id: `oracle_prime_${Date.now()}`,
                    name: 'Oracle: Neural Priming',
                    zoneName: 'The Antechamber',
                    difficulty: 'Normal',
                    isGenerated: true,
                    blocks: [
                        { id: 'wu', name: 'Dynamic Warmup', type: BlockType.WARMUP, exercises: [{ id: 'wu1', name: 'Leg Swings', logic: ExerciseLogic.FIXED_REPS, sets: [{ id: 's1', reps: 20, completed: false }] }] },
                        { id: 'act', name: 'Activation', type: BlockType.STATION, exercises: [{ id: 'act1', name: 'Explosive Jumps', logic: ExerciseLogic.FIXED_REPS, sets: [{ id: 'j1', reps: 3, completed: false, rarity: 'rare' }, { id: 'j2', reps: 3, completed: false, rarity: 'rare' }] }] }
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
                return {
                    type: 'TAPER',
                    title: 'TAPER PROTOCOL ACTIVE',
                    rationale: `Approaching "${raceComingUp.name}" (${daysUntil} days). Volume reduced by 50%. Focus on maintaining intensity without fatigue accumulation.`,
                    priorityScore: 105,
                    targetExercise: 'Low Volume / High Quality'
                };
            }
        }

        // --- PRIORITY 0.5: TITAN PROTOCOL (High Intensity/Volume Load) ---
        if (titanAnalysis && titanAnalysis.titanLoad > 750) {
            const rationale = await GeminiService.generateOracleAdvice({
                priority: "PR_ATTEMPT",
                trigger: "Titan Load > 750",
                wellness,
                data: titanAnalysis
            });

            return {
                type: 'PR_ATTEMPT',
                title: 'TITAN QUEST: OVERLOAD DETECTED',
                rationale: rationale || `Titan Load is high (${titanAnalysis.titanLoad.toFixed(0)}), indicating peak physiological adaptation. The Oracle demands a High-Intensity Protocol to capitalize on this overcompensation.`,
                priorityScore: 102,
                sessionId: 'session_mythic_challenge',
                targetExercise: 'Compound Movement'
            };
        }

        // --- PRIORITY 1: SAFETY ---
        const isCompromised = (wellness.bodyBattery || 100) < 25 || (wellness.sleepScore || 100) < 30;

        if (isCompromised) {
            return {
                type: 'RECOVERY',
                title: 'CRITICAL: REST REQUIRED',
                rationale: `System Critical (Body Battery ${wellness.bodyBattery}). Risk of injury is extreme. No training authorized.`,
                priorityScore: 100
            };
        }

        // --- PRIORITY 1.5: AUDITOR INTERVENTION ---
        if (auditReport && auditReport.highestPriorityGap) {
            const gap = auditReport.highestPriorityGap;
            if (gap.level !== WeaknessLevel.NONE && gap.priority > 50) {
                const exercises = await OracleService.getExercisesForMuscle(gap.muscleGroup);

                if (exercises.length > 0) {
                    const correctiveSession: Session = {
                        id: `oracle_corrective_${Date.now()}`,
                        name: `Oracle: ${gap.muscleGroup} Specialist`,
                        zoneName: 'The Iron Clinic',
                        difficulty: 'Normal',
                        isGenerated: true,
                        blocks: [
                            {
                                id: 'blk_corrective_1',
                                name: `Targeted ${gap.muscleGroup} Work`,
                                type: BlockType.STATION,
                                exercises: exercises.slice(0, 3).map((exName, idx) => ({
                                    id: `corr_ex_${idx}`,
                                    name: exName,
                                    logic: ExerciseLogic.FIXED_REPS,
                                    sets: [
                                        { id: 's1', reps: 12, completed: false, rarity: 'common' },
                                        { id: 's2', reps: 12, completed: false, rarity: 'common' },
                                        { id: 's3', reps: 15, completed: false, rarity: 'uncommon' }
                                    ]
                                }))
                            }
                        ]
                    };

                    const rationale = await GeminiService.generateOracleAdvice({
                        priority: "WEAKNESS_AUDIT",
                        trigger: `Weakness: ${gap.muscleGroup}`,
                        wellness,
                        data: gap
                    });

                    return {
                        type: 'GRIND',
                        title: `WEAKNESS DETECTED: ${gap.muscleGroup.toUpperCase()}`,
                        rationale: rationale || `The Auditor has flagged your ${gap.muscleGroup} as ${gap.level.toUpperCase()}. We must balance the Titan's physique. Priority: ${gap.priority}.`,
                        priorityScore: 98,
                        generatedSession: correctiveSession
                    };
                }
            }
        }

        // --- PRIORITY 2: BALANCE CORRECTION ---
        if (ttb.lowest === 'wellness') {
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
            return {
                type: 'PR_ATTEMPT',
                title: 'STRENGTH FOCUS: LANDMINE',
                sessionId: 'session_a',
                targetExercise: 'Landmine Press',
                rationale: `Strength Index (${ttb.strength}) has decayed. It has been too long since your last Epic set. You are primed for a PR attempt.`,
                priorityScore: 90
            };
        }

        return {
            type: 'GRIND',
            title: 'MAINTENANCE: BELT SQUAT',
            sessionId: 'session_b',
            targetExercise: 'Belt Squat',
            rationale: `All systems balanced (TTB ~${ttb.strength}). Proceed with standard volume accumulation to build Titan Load.`,
            priorityScore: 50
        };
    },

    getExercisesForMuscle: async (muscleGroup: string): Promise<string[]> => {
        const groupData = muscleMap.get(muscleGroup);
        if (!groupData) return [];
        const ownedEquipment = await StorageService.getOwnedEquipment() || [EquipmentType.BODYWEIGHT];
        const prioritizeHyperPro = await StorageService.getHyperProPriority();
        const validExercises = groupData.exercises.filter(exName =>
            canPerformExercise(exName, ownedEquipment, prioritizeHyperPro)
        );
        if (prioritizeHyperPro) {
            validExercises.sort((a, b) => {
                const isAHyper = canPerformExercise(a, ownedEquipment, true);
                const isBHyper = canPerformExercise(b, ownedEquipment, true);
                return (isAHyper === isBHyper) ? 0 : isAHyper ? -1 : 1;
            });
        }
        return validExercises;
    }
};
