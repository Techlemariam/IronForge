import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUserStatsAction } from "@/actions/guild/core";

export interface IronUser {
    id: string;
    heroName: string | null;
    email?: string;
    kineticEnergy?: number;
}

export function useUser() {
    // Lazy init to synchronously pick up E2E mocks
    const [user, setUser] = useState<IronUser | null>(() => {
        if (typeof window !== 'undefined' && (window as any).__mockUser) {
            return (window as any).__mockUser;
        }
        return null;
    });

    const [loading, setLoading] = useState(() => {
        if (typeof window !== 'undefined' && (window as any).__mockUser) {
            return false;
        }
        return true;
    });

    useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                // E2E Mock Override - Return early if already handled by lazy init
                if (typeof window !== 'undefined' && (window as any).__mockUser) {
                    return;
                }

                const supabase = createClient();

                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (authUser && mounted) {
                    // Fetch stats (heroName) from server action
                    // Note: getUserStatsAction internal logic uses authUser.id to find public.User
                    const stats = await getUserStatsAction();

                    setUser({
                        id: authUser.id,
                        heroName: stats?.heroName || "Hero",
                        email: authUser.email,
                        kineticEnergy: stats?.kineticEnergy || 0
                    });
                }
            } catch (e) {
                console.error("Failed to load user", e);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();

        return () => { mounted = false; };
    }, []);

    return { user, loading };
}
