"use client";

import { useState } from "react";
import { Exercise } from "@prisma/client";
import ExerciseSelector from "./ExerciseSelector";
import SetLogger from "./SetLogger";
import { Dumbbell } from "lucide-react";
import ForgeCard from "@/components/ui/ForgeCard";
import DungeonInterface from "@/components/game/dungeon/DungeonInterface";
import { EquipmentType } from "@/data/equipmentDb";
import { logExerciseSetsAction } from "@/actions/logger";
import { toast } from "sonner";

interface QuickLogSessionProps {
    activeCombatSession?: any;
    boss?: any;
    capabilities?: EquipmentType[];
}

export default function QuickLogSession({ activeCombatSession, boss, capabilities }: QuickLogSessionProps) {
    const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);

    // Local Combat State (for optimistic updates)
    const [localHp, setLocalHp] = useState(activeCombatSession?.bossHp || 0);
    const [lastDamage, setLastDamage] = useState(0);

    // Sync if server prop changes (revalidation)
    if (activeCombatSession?.bossHp && localHp !== activeCombatSession.bossHp && lastDamage === 0) {
        setLocalHp(activeCombatSession.bossHp);
    }

    async function handleSaveExercise(sets: any[], exercise: Exercise) {
        const res = await logExerciseSetsAction({
            exerciseId: exercise.id,
            sets: sets.map(s => ({ weight: s.weight, reps: s.reps, rpe: s.rpe })),
            notes: ""
        });

        if (res.success) {
            // @ts-ignore
            let message = `Logged ${sets.length} sets! +${res.energyGained} Energy${res.oracleBuff || ""}`;

            // @ts-ignore
            if (res.combatStats) {
                // @ts-ignore
                const stats = res.combatStats;
                message += `\n⚔️ Dealt ${stats.damageDealt} Damage!`;
                if (stats.isVictory) message += ` 💀 BOSS DEFEATED!`;

                setLocalHp(stats.bossHpRemaining);
                setLastDamage(stats.damageDealt);
                setTimeout(() => setLastDamage(0), 3000);
            }

            // @ts-ignore
            if (res.context) {
                // @ts-ignore
                const ctx = res.context;
                const muscle = exercise.muscleGroup?.toUpperCase() || "UNKNOWN";
                // @ts-ignore
                const vol = ctx.volume[muscle] || Object.values(ctx.volume).find(v => v.muscleGroup === muscle);

                if (vol) {
                    message += `\n📊 ${vol.muscleGroup}: ${vol.weeklySets}/${vol.mrv} Sets (${vol.status})`;
                }

                // @ts-ignore
                if (ctx.warnings && ctx.warnings.length > 0) {
                    // @ts-ignore
                    message += `\n⚠️ ${ctx.warnings[0]}`;
                }
            }

            toast.success(message, { duration: 5000 });
        } else {
            toast.error(res.error || "Failed to save logs");
        }
    }

    return (
        <div className="space-y-6">
            {/* Combat HUD */}
            {activeCombatSession && boss && (
                <div className="animate-in fade-in slide-in-from-top-4">
                    <DungeonInterface
                        bossName={boss.name}
                        level={boss.level}
                        totalHp={activeCombatSession.bossMaxHp}
                        currentHp={localHp}
                        onDamage={lastDamage}
                        className="shadow-xl shadow-red-900/20"
                    />
                </div>
            )}

            {!activeExercise ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    {!activeCombatSession && (
                        <div className="text-center space-y-2 mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-magma to-orange-600 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-magma/20">
                                <Dumbbell className="h-8 w-8 text-black" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white uppercase font-heading">
                                Iron Logger
                            </h1>
                            <p className="text-zinc-400 text-sm max-w-sm mx-auto">
                                Select an exercise to begin logging. New exercises are added to your library automatically.
                            </p>
                        </div>
                    )}

                    <ForgeCard className="max-w-md mx-auto relative overflow-visible">
                        <ExerciseSelector onSelect={setActiveExercise} capabilities={capabilities} />
                    </ForgeCard>
                </div>
            ) : (
                <div className="max-w-md mx-auto">
                    <SetLogger
                        exercise={activeExercise}
                        onFinish={() => setActiveExercise(null)}
                        onCancel={() => setActiveExercise(null)}
                        onSave={async (sets) => {
                            if (activeExercise) {
                                handleSaveExercise(sets, activeExercise);
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
}
