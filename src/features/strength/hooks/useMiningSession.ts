import { useState, useEffect, useContext } from "react";
import {
    Session,
    ExerciseLog,
    AppSettings,
    IntervalsWellness,
} from "@/types";
import { useBluetoothHeartRate } from "@/features/bio/hooks/useBluetoothHeartRate";
import { AchievementContext } from "@/context/AchievementContext";
import { useSkills } from "@/context/SkillContext";
import { StorageService, ActiveSessionState } from "@/services/storage";
import { IntegrationService } from "@/services/integration";
import { getWellnessAction } from "@/actions/integrations/intervals";
import { logger } from "@/utils/logger";

interface UseMiningSessionProps {
    initialSession: Session;
    onComplete?: (results?: any) => void;
    onExit: () => void;
}

export const useMiningSession = ({
    initialSession,
    onComplete,
    onExit,
}: UseMiningSessionProps) => {
    const [activeSession, setActiveSession] = useState<Session>(initialSession);
    const [hasCheckedIn, setHasCheckedIn] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);

    const [wellnessData, setWellnessData] = useState<IntervalsWellness | null>(null);
    const [historyLogs, setHistoryLogs] = useState<ExerciseLog[]>([]);
    const [exportStatus, setExportStatus] = useState<"IDLE" | "UPLOADING" | "SUCCESS" | "ERROR">("IDLE");
    const [foundRecovery, setFoundRecovery] = useState<ActiveSessionState | null>(null);
    const [checkingRecovery, setCheckingRecovery] = useState(true);

    const achievementContext = useContext(AchievementContext);
    const { purchasedSkillIds } = useSkills();
    const { bpm } = useBluetoothHeartRate();

    // E2E Auto Check-in
    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).__mockAutoCheckIn) {
            setHasCheckedIn(true);
        }
    }, []);

    // --- CHECK FOR CRASH RECOVERY ---
    useEffect(() => {
        const checkRecovery = async () => {
            try {
                const recovered = await StorageService.getActiveSession();
                if (recovered && !completed) {
                    setFoundRecovery(recovered);
                }
            } catch (err) {
                logger.error(err, "Failed to check recovery session");
            } finally {
                setCheckingRecovery(false);
            }
        };
        checkRecovery();
    }, [completed]);

    // --- LOAD HISTORY & WELLNESS ---
    useEffect(() => {
        const fetchData = async () => {
            if (foundRecovery || checkingRecovery) return;

            try {
                const history = await StorageService.getHistory();
                setHistoryLogs(history);

                const settings = await StorageService.getState<AppSettings>("settings");
                if (settings && settings.intervalsApiKey) {
                    const today = new Date().toISOString().split("T")[0];
                    if (navigator.onLine) {
                        const w = await getWellnessAction(today);
                        setWellnessData({
                            ...w,
                            bodyBattery: w.bodyBattery || 0,
                            sleepScore: w.sleepScore || 0,
                        });
                    } else {
                        setWellnessData({ id: "offline", bodyBattery: 80, sleepScore: 85 });
                    }
                } else {
                    setWellnessData({ id: "sim", bodyBattery: 75, sleepScore: 70 });
                }
            } catch (err) {
                logger.error(err, "Failed to fetch session data");
            }
        };
        fetchData();
    }, [checkingRecovery, foundRecovery]);

    // --- SESSION ACTIONS ---
    const handleRestore = () => {
        if (!foundRecovery) return;
        setActiveSession(foundRecovery.sessionData);
        setHasCheckedIn(true);
        setFoundRecovery(null);
    };

    const handleDiscard = async () => {
        await StorageService.clearActiveSession();
        setFoundRecovery(null);
    };

    const handleExport = async () => {
        setExportStatus("UPLOADING");
        try {
            const settings = await StorageService.getState<AppSettings>("settings");
            if (!settings) throw new Error("No settings found");

            const type = IntegrationService.detectSessionType(activeSession);
            const success = type === "CARDIO"
                ? await IntegrationService.uploadToIntervals(activeSession, settings)
                : await IntegrationService.uploadToHevy(activeSession, settings);

            setExportStatus(success ? "SUCCESS" : "ERROR");
        } catch (e) {
            logger.error(e, "Export failed");
            setExportStatus("ERROR");
        }
    };

    const confirmAbandon = async () => {
        await StorageService.clearActiveSession();
        onExit();
    };

    // --- SAVE LOGIC ---
    useEffect(() => {
        const saveResults = async () => {
            if (!completed || isSaving) return;
            setIsSaving(true);

            try {
                if (achievementContext && activeSession.id === "session_a") {
                    achievementContext.unlockAchievement("clear_deadmines");
                }

                const logs: ExerciseLog[] = [];
                const today = new Date().toISOString();

                activeSession.blocks.forEach((block) => {
                    block.exercises?.forEach((ex) => {
                        const validSets = ex.sets.filter((s) => s.completed && s.weight);
                        if (validSets.length > 0) {
                            const bestSet = validSets.reduce((prev, current) =>
                                (prev.weight || 0) > (current.weight || 0) ? prev : current
                            );
                            const weight = bestSet.weight || 0;
                            const reps = bestSet.completedReps || 0;
                            const e1rm = Math.round(weight * (1 + reps / 30));

                            logs.push({
                                date: today,
                                exerciseId: ex.id,
                                e1rm: e1rm,
                                rpe: 9,
                                isEpic: bestSet.rarity === "legendary",
                            });
                        }
                    });
                });

                for (const log of logs) {
                    await StorageService.saveLog(log);
                }

                await StorageService.clearActiveSession();
            } catch (e) {
                logger.error(e, "Failed to save session");
            } finally {
                setIsSaving(false);
                onComplete?.();
            }
        };

        if (completed) saveResults();
    }, [completed, isSaving, activeSession, achievementContext, onComplete]);

    return {
        activeSession,
        setActiveSession,
        hasCheckedIn,
        setHasCheckedIn,
        completed,
        setCompleted,
        isSaving,
        showAbandonConfirm,
        setShowAbandonConfirm,
        wellnessData,
        exportStatus,
        foundRecovery,
        checkingRecovery,
        bpm,
        handleRestore,
        handleDiscard,
        handleExport,
        confirmAbandon,
    };
};
