import { IntervalsWellness, OracleRecommendation, TTBIndices, Session, BlockType, ExerciseLogic, IntervalsEvent, TitanLoadCalculation } from '../types';
import { AuditReport, WeaknessLevel } from '../types/auditor';
import { canPerformExercise, EquipmentType } from '../data/equipmentDb';
import { muscleMap } from '../data/muscleMap';
import { StorageService } from './storage';
import { GeminiService } from './gemini';
import { TrainingMemoryManager } from './trainingMemoryManager';
import { WORKOUT_LIBRARY } from '../data/workouts';
import { TrainingPath, WorkoutDefinition, WeeklyMastery } from '../types/training';
import { BUILD_VOLUME_TARGETS, PATH_INFO } from '../data/builds';

// RecoveryService import removed to keep Oracle isomorphic (Client/Server safe)

/**
 * The Oracle
 * An adaptive coaching engine that prescribes the next action based on physiological state and progression goals.
 * Now Path-aware: recommendations are filtered/prioritized based on user's active training path.
 */
export const OracleService = {

    consult: async (
        wellness: IntervalsWellness,
        ttb: TTBIndices,
        events: IntervalsEvent[] = [],
        auditReport?: AuditReport | null,
        titanAnalysis?: TitanLoadCalculation | null,
        recoveryAnalysis?: { state: string; reason: string } | null,
        activePath: TrainingPath = 'HYBRID_WARDEN',
        weeklyMastery?: WeeklyMastery
    ): Promise<OracleRecommendation> => {

        // Get path info for context
        const pathInfo = PATH_INFO[activePath];

        // Calculate debuffs from wellness data
        const debuffs = TrainingMemoryManager.calculateDebuffs(
            wellness.sleepScore || 100,
            wellness.hrv || 50
        );

        // Check if user should be in survival mode
        const survivalMode = TrainingMemoryManager.shouldEnterSurvivalMode({
            ctl: wellness.ctl || 0,
            atl: wellness.atl || 0,
            tsb: wellness.tsb || 0,
            hrv: wellness.hrv || 50,
            sleepScore: wellness.sleepScore || 100,
            bodyBattery: wellness.bodyBattery || 100,
            strengthDelta: 0
        });

        if (survivalMode) {
            return {
                type: 'RECOVERY',
                title: 'SURVIVAL MODE ACTIVE',
                rationale: `Multiple recovery debuffs detected. All training reduced to maintenance volume until recovery improves. ${debuffs.map(d => d.reason).join(', ')}`,
                priorityScore: 125, // Highest priority
                targetExercise: 'Light Mobility / Walking'
            };
        }

        // --- PRIORITY 0: PHYSICAL RECOVERY (Bio-Engine) ---
        // We check this first because if the body is broken, no amount of motivation matters.
        // Dependent on injected analysis (Server-Side only usually)
        if (recoveryAnalysis && recoveryAnalysis.state === 'LOW_RECOVERY') {
            return {
                type: 'RECOVERY',
                title: 'BIO-ENGINE WARNING: RECOVERY',
                rationale: `Bio-Engine metrics indicate Low Recovery (${recoveryAnalysis.reason}). Titan Protocol suspended. Active recovery authorized.`,
                priorityScore: 120, // Higher than everything
                targetExercise: 'Yoga / Meditation'
            };
        }

        // --- PRIORITY 0.1: EVENT RADAR (Races & Competitions) ---
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

            // Path-aware priority adjustment: Engine path gets higher priority for cardio
            const priorityBoost = activePath === 'ENGINE' ? 10 : 0;

            return {
                type: 'CARDIO_VALIDATION',
                title: activePath === 'ENGINE' ? '🔥 ENGINE PATH: VO2 MAX QUEST' : 'AERO ATTACK PROTOCOL',
                generatedSession: enduranceSession,
                rationale: activePath === 'ENGINE'
                    ? `As an Engine, endurance is your PRIMARY stat. Endurance Index (${ttb.endurance}) needs attention. This is your moment to shine!`
                    : `Endurance Index (${ttb.endurance}) is lagging. ${activePath === 'IRON_JUGGERNAUT' ? 'Light cardio to support recovery.' : 'VO2 Max quest added to your log.'}`,
                priorityScore: 90 + priorityBoost
            };
        }

        if (ttb.lowest === 'strength') {
            // Path-aware priority adjustment: Juggernaut/Titan get higher priority for strength
            const priorityBoost = (activePath === 'IRON_JUGGERNAUT' || activePath === 'TITAN') ? 10 : 0;

            // For Engine path, suggest lighter strength work to avoid interference
            if (activePath === 'ENGINE') {
                return {
                    type: 'GRIND',
                    title: 'ENGINE PATH: STRENGTH MAINTENANCE',
                    sessionId: 'session_b',
                    targetExercise: 'Belt Squat',
                    rationale: `Strength Index (${ttb.strength}) is low, but as an Engine your cardio is priority. Perform maintenance volume (MEV) only to preserve muscle.`,
                    priorityScore: 70 // Lower priority for Engine path
                };
            }

            return {
                type: 'PR_ATTEMPT',
                title: activePath === 'IRON_JUGGERNAUT' ? '⚔️ JUGGERNAUT PATH: PR QUEST' : 'STRENGTH FOCUS: LANDMINE',
                sessionId: 'session_a',
                targetExercise: 'Landmine Press',
                rationale: activePath === 'IRON_JUGGERNAUT'
                    ? `As a Juggernaut, strength is your PRIMARY stat. Strength Index (${ttb.strength}) demands attention. Time to move some iron!`
                    : `Strength Index (${ttb.strength}) has decayed. You are primed for a PR attempt.`,
                priorityScore: 90 + priorityBoost
            };
        }

        // --- PRIORITY 3: LIBRARY SELECTION (The Oracle's Choice) ---
        // If no high-priority overrides (Race, Injury, Titan Protocol), select best workout from library.

        // 1. Filter candidates
        let candidates = WORKOUT_LIBRARY.filter(w => {
            // Equipment check (Mock: assume full access or filter by type if needed)
            // Ideally: canPerformExercise(w.type, ...);
            return true;
        });

        // Survival Mode Filter
        if (survivalMode) {
            candidates = candidates.filter(w => w.intensity === 'LOW');
        }

        // 2. Score candidates
        const rankedCandidates = candidates.map(workout => {
            let score = 0;

            // Factor A: Path Alignment (Weight: 40%)
            if (workout.recommendedPaths?.includes(activePath)) {
                score += 40;
            }

            // Factor B: Fatigue State / Intensity Match (Weight: 30%)
            // TSB < -10 => Prefer LOW intensity
            // TSB > 10 => Prefer HIGH intensity
            const currentTsb = wellness.tsb || 0;
            if (currentTsb < -10) {
                if (workout.intensity === 'LOW') score += 30;
                else if (workout.intensity === 'HIGH') score -= 20; // Penalize High Int when tired
            } else if (currentTsb > 10) {
                if (workout.intensity === 'HIGH') score += 30;
                else if (workout.intensity === 'LOW') score -= 10; // Slightly penalize Low Int when fresh
            } else {
                // Neutral TSB (-10 to 10) - Prefer MEDIUM
                if (workout.intensity === 'MEDIUM') score += 20;
            }

            // Factor C: Duration Constraint (Weight: 10%)
            // (Placeholder: Prefer 45-60 min default)
            if (workout.durationMin >= 45 && workout.durationMin <= 60) {
                score += 10;
            }

            // Factor D: History / Variety (Weight: 20%)
            // Check recency in events (if available)
            const recentlyDone = events.some(e =>
                e.start_date_local &&
                new Date(e.start_date_local) < today && // Past event
                e.name?.includes(workout.code) // Simple code match
            );
            if (recentlyDone) {
                score -= 20; // Variety penalty
            }

            return { workout, score };
        });

        // 3. Sort and Pick
        rankedCandidates.sort((a, b) => b.score - a.score);
        const topPick = rankedCandidates[0];

        if (topPick) {
            const w = topPick.workout;

            // Convert to Session format for UI
            const generatedSession: Session = {
                id: `oracle_gen_${w.id}_${Date.now()}`,
                name: `${w.code}: ${w.name}`,
                zoneName: w.type === 'RUN' ? 'The Treadmill' : w.type === 'BIKE' ? 'The Turbo' : 'The Pool',
                difficulty: w.intensity === 'HIGH' ? 'Mythic' : w.intensity === 'LOW' ? 'Normal' : 'Heroic',
                isGenerated: true,
                blocks: [
                    {
                        id: 'main_block',
                        name: 'Main Set',
                        type: BlockType.STATION,
                        exercises: [
                            {
                                id: 'ex_1',
                                name: w.name,
                                logic: ExerciseLogic.FIXED_REPS,
                                instructions: w.intervalsIcuString ? [w.intervalsIcuString] : [w.description],
                                sets: [{ id: 's1', reps: w.durationLabel || `${w.durationMin} min`, completed: false }]
                            }
                        ]
                    }
                ]
            };

            // Enhanced Rationale with Weekly Targets
            const target = BUILD_VOLUME_TARGETS[activePath];
            let progressContext = "";
            if (weeklyMastery) {
                const cardioRemaining = Math.max(0, target.cardioTss - weeklyMastery.cardioTss);
                if (w.type === 'RUN' || w.type === 'BIKE' || w.type === 'SWIM') {
                    progressContext = cardioRemaining > 0
                        ? `Focusing on Cardio Mastery (${cardioRemaining} TSS remaining).`
                        : `Cardio Mastery achieved! This session maintains your base.`;
                }
            }

            return {
                type: 'GRIND',
                title: `${pathInfo.icon} ${pathInfo.name.toUpperCase()}: DAILY MISSION`,
                generatedSession: generatedSession,
                rationale: `Oracle Analysis: Best fit for ${activePath} path (Score: ${topPick.score}). ${w.intensity} intensity selected based on TSB (${wellness.tsb || 0}). ${progressContext}`,
                priorityScore: 80
            };
        }

        // Fallback if no specific workout found (should rarely happen with full library)
        return {
            type: 'GRIND',
            title: `${pathInfo.icon} ${pathInfo.name.toUpperCase()}: DAILY MISSION`,
            sessionId: 'session_b',
            targetExercise: 'Belt Squat',
            rationale: `All systems balanced. Focus on ${activePath} fundamentals.`,
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
