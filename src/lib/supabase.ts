import { type SupabaseClient, createClient } from '@supabase/supabase-js';
import { StorageService as Storage } from '../services/storage';
import type { AppSettings } from '../types';

let supabase: SupabaseClient | null = null;

export const getSupabase = async (): Promise<SupabaseClient | null> => {
  if (supabase) return supabase;

  // Fetch creds from local storage
  const settings = await Storage.getState<AppSettings>('settings');
  if (settings?.supabaseUrl && settings.supabaseKey) {
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
      console.error('Supabase init failed', e);
      return null;
    }
  }
  return null;
};
