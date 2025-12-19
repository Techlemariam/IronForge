
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageService } from '../services/storage';
import { AppSettings } from '../types';

let supabase: SupabaseClient | null = null;

export const getSupabase = async (): Promise<SupabaseClient | null> => {
    if (supabase) return supabase;

    // Fetch creds from local storage
    const settings = await StorageService.getState<AppSettings>('settings');
    if (settings && settings.supabaseUrl && settings.supabaseKey) {
        try {
            supabase = createClient(settings.supabaseUrl, settings.supabaseKey, {
                realtime: {
                    params: {
                        eventsPerSecond: 10,
                    },
                },
            });
            return supabase;
        } catch (e) {
            console.error("Supabase init failed", e);
            return null;
        }
    }
    return null;
};
