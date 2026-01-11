import { createClient } from "@supabase/supabase-js";
import { type ActiveSession, type SessionParticipant } from "@prisma/client";

// Initialize client (Assuming environment variables are available)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface CoOpSession extends ActiveSession {
    participants: SessionParticipant[];
}

export const CoOpService = {
    /**
     * Create a new Co-Op session
     */
    async createSession(hostId: string, workoutName?: string): Promise<string | null> {
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
        return data as any as CoOpSession[];
    },

    /**
     * Leave a session
     */
    async leaveSession(sessionId: string, userId: string) {
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
