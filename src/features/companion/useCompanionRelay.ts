import { useEffect, useRef, useCallback, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

// Channel Name (Deprecated for direct session usage, but keeping if needed for default)
const COMPANION_CHANNEL = 'iron_forge_companion_v1';

// Event Types
export type CompanionEvent =
    | { type: 'HEART_RATE'; payload: number }
    | { type: 'POWER'; payload: number }
    | { type: 'ZONE_CHANGE'; payload: number }
    | { type: 'TITAN_SPEAK'; payload: { text: string; mood: string } }
    | { type: 'COMMAND'; payload: 'PAUSE' | 'RESUME' | 'SKIP' }
    | { type: 'SYNC'; payload: { startTime: number } };

export const useCompanionRelay = (role: 'CONTROLLER' | 'RECEIVER', sessionId?: string) => {
    const channelRef = useRef<RealtimeChannel | null>(null);
    const [lastEvent, setLastEvent] = useState<CompanionEvent | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [status, setStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'>('DISCONNECTED');

    // Initialize Channel
    useEffect(() => {
        if (typeof window === 'undefined' || !sessionId) return;

        console.log(`[Companion] Initializing as ${role} on session ${sessionId}`);
        setStatus('CONNECTING');

        const supabase = createClient();
        const channel = supabase.channel(`iron-companion-${sessionId}`, {
            config: {
                broadcast: { self: true } // Receive own messages if needed, mostly for ack
            }
        });

        channel
            .on(
                'broadcast',
                { event: 'relay' },
                (payload) => {
                    console.log(`[Companion] Received:`, payload.payload);
                    setLastEvent(payload.payload as CompanionEvent);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`[Companion] Connected to channel`);
                    setIsConnected(true);
                    setStatus('CONNECTED');
                } else {
                    console.log(`[Companion] Status: ${status}`);
                    setIsConnected(false);
                    setStatus('DISCONNECTED');
                }
            });

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
            setIsConnected(false);
        };
    }, [role, sessionId]);

    // Send Message
    const broadcast = useCallback(async (event: CompanionEvent) => {
        if (!channelRef.current || !sessionId) return;

        await channelRef.current.send({
            type: 'broadcast',
            event: 'relay',
            payload: event
        });
    }, [sessionId]);

    return {
        broadcast,
        lastEvent,
        isConnected,
        status
    };
};
