import { createClient } from "@supabase/supabase-js";
import { type ActiveSession, type SessionParticipant } from "@prisma/client";

// Initialize client safely (handle missing env vars in CI/Test)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
const supabase = createClient(supabaseUrl, supabaseKey);

export interface CoOpSession extends ActiveSession {
    participants: SessionParticipant[];
}

export const CoOpService = {
    /**
     * Get active session for user (restoration)
     */
    async getActiveSession(userId: string): Promise<CoOpSession | null> {
        // E2E Mock
        if (typeof window !== 'undefined' && (window as any).__mockCoOpSession) {
            return (window as any).__mockCoOpSession;
        }

        const { data } = await supabase
            .from("active_sessions")
            .select(`
                *,
                participants:session_participants(*)
            `)
            .eq("participants.user_id", userId)
            // Note: This query is a bit simplified; typically we query session_participants first
            .maybeSingle(); // Use maybeSingle to avoid 406 on multiple matches (though strict relation should prevent)

        // Better approach for Supabase: Query participants table then join
        if (!data) {
            const { data: partData } = await supabase
                .from("session_participants")
                .select("session_id")
                .eq("user_id", userId)
                .maybeSingle();

            if (partData) {
                const { data: sessionData } = await supabase
                    .from("active_sessions")
                    .select(`*, participants:session_participants(*)`)
                    .eq("id", partData.session_id)
                    .single();
                return sessionData as any as CoOpSession;
            }
            return null;
        }

        const sessionData = data as any;
        return {
            ...sessionData,
            hostId: sessionData.host_id,
            workoutName: sessionData.workout_name,
            maxParticipants: sessionData.max_participants,
            inviteCode: sessionData.invite_code,
            participants: (sessionData.participants || []).map((p: any) => ({
                ...p,
                userId: p.user_id,
                heroName: p.hero_name,
                sessionId: p.session_id,
                lastHeartbeat: p.last_heartbeat,
                joinedAt: p.joined_at
            }))
        } as CoOpSession;
    },

    /**
     * Create a new Co-Op session
     */
    async createSession(hostId: string, workoutName?: string): Promise<string | null> {
        // E2E Mock
        if (typeof window !== 'undefined' && (window as any).__mockInviteCode) {
            return "test-session-id";
        }

        // 1. Generate unique 6-char code
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        const { data, error } = await supabase
            .from("active_sessions")
            .insert({
                host_id: hostId,
                status: "waiting",
                workout_name: workoutName,
                invite_code: inviteCode,
                max_participants: 4
            })
            .select("id")
            .single();

        if (error) {
            console.error("Failed to create session:", error);
            return null;
        }

        // Auto-join host
        await this.joinSession(data.id, hostId, "Host");

        return data.id;
    },

    /**
     * Join an existing session
     */
    async joinSession(sessionId: string, userId: string, heroName?: string) {
        // E2E Mock
        if (typeof window !== 'undefined' && (window as any).__mockCoOpSession) {
            return;
        }

        const { error } = await supabase
            .from("session_participants")
            .insert({
                session_id: sessionId,
                user_id: userId,
                hero_name: heroName,
                status: "active"
            });

        if (error) {
            console.error("Failed to join session:", error);
            throw error;
        }
    },

    /**
     * List available waiting sessions
     */
    async listSessions(): Promise<CoOpSession[]> {
        // E2E Mock
        if (typeof window !== 'undefined' && (window as any).__mockSessions) {
            return (window as any).__mockSessions;
        }

        const { data, error } = await supabase
            .from("active_sessions")
            .select(`
        *,
        participants:session_participants(*)
      `)
            .eq("status", "waiting")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Failed to list sessions:", error);
            return [];
        }

        // Type casting needed because Prisma types vs Supabase JSON result
        const raw = data as any[];
        return raw.map(s => ({
            ...s,
            hostId: s.host_id,
            workoutName: s.workout_name,
            maxParticipants: s.max_participants,
            inviteCode: s.invite_code,
            participants: (s.participants || []).map((p: any) => ({
                ...p,
                userId: p.user_id,
                heroName: p.hero_name,
                sessionId: p.session_id,
                lastHeartbeat: p.last_heartbeat,
                joinedAt: p.joined_at
            }))
        })) as CoOpSession[];
    },

    /**
     * Leave a session
     */
    async leaveSession(sessionId: string, userId: string) {
        // E2E Mock
        if (typeof window !== 'undefined' && (window as any).__mockCoOpSession) {
            return;
        }

        await supabase
            .from("session_participants")
            .delete()
            .match({ session_id: sessionId, user_id: userId });

        // If host leaves, arguably we should close the session or migrate host
        // For MVP 15/10: Just remove participant.
    },

    /**
     * Get realtime subscription channel
     */
    subscribeToSession(sessionId: string, onUpdate: (payload: any) => void) {
        // E2E Mock
        if (typeof window !== 'undefined' && (window as any).__mockCoOpSession) {
            return { unsubscribe: () => { } };
        }

        return supabase
            .channel(`session:${sessionId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'session_participants', filter: `session_id=eq.${sessionId}` },
                (payload) => onUpdate(payload)
            )
            .subscribe();
    },

    // --- GHOST MODE ---

    /**
     * Broadcast a "Ghost Event" (Set Completion, Rep, etc.) to squad
     */
    broadcastGhostEvent(sessionId: string, event: GhostEvent) {
        if (typeof window !== 'undefined' && (window as any).__mockGhostEvents) return Promise.resolve();

        return supabase.channel(`ghost:${sessionId}`).send({
            type: 'broadcast',
            event: 'ghost_event',
            payload: event
        });
    },

    /**
     * Subscribe to Ghost Events in a Session
     */
    subscribeToGhostEvents(sessionId: string, onEvent: (event: GhostEvent) => void) {
        // E2E Mock - Dispatch mock events if present
        if (typeof window !== 'undefined' && (window as any).__mockGhostEvents) {
            // Dispatch events on a slight delay to simulate realtime
            setTimeout(() => {
                (window as any).__mockGhostEvents.forEach((e: GhostEvent) => onEvent(e));
            }, 500);
            return { unsubscribe: () => { } };
        }

        return supabase
            .channel(`ghost:${sessionId}`)
            .on('broadcast', { event: 'ghost_event' }, (payload) => {
                onEvent(payload.payload as GhostEvent);
            })
            .subscribe();
    }
};

// --- TYPES ---

export interface GhostEvent {
    type: 'SET_COMPLETE' | 'REP' | 'PR' | 'BERSERKER';
    userId: string;
    heroName: string;
    exerciseName?: string;
    weight?: number;
    reps?: number;
    damage?: number;
    timestamp: number;
}
