import React, { useEffect, useState } from "react";
import { CoOpService, CoOpSession } from "@/services/coop/CoOpService";
import { useUser } from "@/hooks/useUser";
import { Users, Wifi, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LiveSessionHUDProps {
    onSessionJoin?: (sessionId: string) => void;
}

export const LiveSessionHUD: React.FC<LiveSessionHUDProps> = ({ onSessionJoin }) => {
    const { user } = useUser();
    const [activeSession, setActiveSession] = useState<CoOpSession | null>(null);
    const [availableSessions, setAvailableSessions] = useState<CoOpSession[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    // Initial load & Restoration & Refresh on Open
    // Initial load & Restoration & Refresh on Open
    useEffect(() => {
        refreshSessions();

        // Debug Mock Visibility
        if (typeof window !== 'undefined') {
            // Checked for mock
        }

        if (user && (isExpanded || !activeSession)) {
            CoOpService.getActiveSession(user.id).then(session => {
                if (session) setActiveSession(session);
            });
        }
        const interval = setInterval(refreshSessions, 10000); // Polling for now for list
        return () => clearInterval(interval);
    }, [user?.id, isExpanded]);

    // Subscribe to active session updates
    useEffect(() => {
        if (!activeSession) return;

        const channel = CoOpService.subscribeToSession(activeSession.id, (_payload) => {
            // Refetch full session state on changes for simplicity
            // In a pro version, we'd patch state via payload
            refreshActiveSession(activeSession.id);
        });

        return () => {
            channel.unsubscribe();
        }
    }, [activeSession?.id]);

    const refreshSessions = async () => {
        const sessions = await CoOpService.listSessions();
        setAvailableSessions(sessions);
    }

    const refreshActiveSession = async (sessionId: string) => {
        // This would require a getSession method in service, or re-finding in list
        const sessions = await CoOpService.listSessions();
        const found = sessions.find(s => s.id === sessionId);
        if (found) setActiveSession(found);
    }

    const handleCreate = async () => {
        if (!user) return;
        const sessionId = await CoOpService.createSession(user.id, "Iron Mines Run");
        if (sessionId) {
            refreshActiveSession(sessionId);
            onSessionJoin?.(sessionId);
        }
    };

    const handleJoin = async (session: CoOpSession) => {
        if (!user) return;
        await CoOpService.joinSession(session.id, user.id, user.heroName || "Hero");
        setActiveSession(session);
        onSessionJoin?.(session.id);
    };

    const handleLeave = async () => {
        if (!user || !activeSession) return;
        await CoOpService.leaveSession(activeSession.id, user.id);
        setActiveSession(null);
    };

    if (!user) {
        if (typeof window !== 'undefined') {
            // Log aborted if needed? No, silent.
        }
        // Fallback for E2E/Loading: Render disabled button to prevent timeout and show state
        return (
            <div className="fixed top-4 right-4 z-50 flex flex-col items-end pointer-events-auto">
                <button
                    disabled
                    className="flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-md border border-white/10 bg-black/40 text-zinc-600 cursor-not-allowed"
                    data-testid="coop-toggle-button"
                    data-user-status="missing"
                >
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Loading...</span>
                </button>
            </div>
        );
    }



    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col items-end pointer-events-auto">
            {/* Toggle Button */}
            <motion.button
                layout
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-md border border-white/10 transition-colors ${activeSession ? "bg-green-500/20 text-green-400" : "bg-black/40 text-zinc-400 hover:text-white"
                    }`}
                data-testid="coop-toggle-button"
            >
                <Users className="w-4 h-4" />
                {activeSession ? (
                    <span className="text-xs font-mono font-bold">
                        {activeSession.participants.length}/{activeSession.maxParticipants}
                    </span>
                ) : (
                    <span className="text-xs">Multiplayer</span>
                )}
            </motion.button>

            {/* Expanded Panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="mt-2 w-64 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-lg p-4 shadow-2xl"
                    >
                        {activeSession ? (
                            // Active Session View
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                    <h3 className="text-sm font-bold text-white">Squad</h3>
                                    <div className="flex items-center gap-1 text-[10px] text-green-400">
                                        <Wifi className="w-3 h-3" />
                                        <span>LIVE</span>
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {activeSession.participants.map(p => (
                                        <div key={p.id} className="flex items-center justify-between text-xs" data-testid="participant-row">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${p.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="text-zinc-200">{p.heroName || "Unknown"}</span>
                                            </div>
                                            {/* Could show set % here later */}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleLeave}
                                    className="w-full py-1 text-xs text-red-400 hover:bg-red-500/10 rounded border border-red-500/20"
                                    data-testid="leave-session-button"
                                >
                                    Leave Squad
                                </button>
                            </div>
                        ) : (
                            // Lobby Browser
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-white mb-2">Find Squad</h3>

                                {availableSessions.length === 0 ? (
                                    <div className="text-center py-4 text-zinc-500 text-xs">
                                        No active squads found.
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-40 overflow-y-auto" data-testid="session-list">
                                        {availableSessions.map(session => (
                                            <div key={session.id} className="flex items-center justify-between bg-white/5 p-2 rounded hover:bg-white/10 cursor-pointer" onClick={() => handleJoin(session)}>
                                                <div>
                                                    <div className="text-xs font-bold text-white">{session.workoutName || "Workout"}</div>
                                                    <div className="text-[10px] text-zinc-400">Host: {session.hostId.slice(0, 4)}...</div>
                                                </div>
                                                <div className="text-xs text-zinc-400">
                                                    {session.participants.length}/{session.maxParticipants}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={handleCreate}
                                    className="w-full flex items-center justify-center gap-2 py-2 bg-magma/20 hover:bg-magma/30 text-magma text-xs font-bold rounded border border-magma/50 transition-colors"
                                    data-testid="create-session-button"
                                >
                                    <UserPlus className="w-3 h-3" />
                                    Start New Squad
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
