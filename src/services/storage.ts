import type {
  AppSettings,
  Equipment,
  Exercise,
  ExerciseLog,
  MeditationLog,
  Session,
} from '../types';

const DB_NAME = 'ironforge_db';
const DB_VERSION = 5; // Incremented for generic KV store

export interface ActiveSessionState {
  sessionId: string;
  startTime: string;
  currentBlockIndex: number;
  exercises: Exercise[]; // Serialized state of current block exercises
  sessionData: Session; // The full session template
}

export class StorageService {
  private static _db: IDBDatabase | null = null;

  public static get db(): IDBDatabase | null {
    return StorageService._db;
  }

  public static async init(): Promise<void> {
    // SSR SAFEGUARD: If running on server, do nothing.
    if (typeof window === 'undefined' || !window.indexedDB) {
      return;
    }

    if (StorageService._db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        StorageService._db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const upgradeDb = (event.target as IDBOpenDBRequest).result;

        if (!upgradeDb.objectStoreNames.contains('logs')) {
          const logStore = upgradeDb.createObjectStore('logs', {
            keyPath: 'id',
            autoIncrement: true,
          });
          logStore.createIndex('date', 'date', { unique: false });
        }

        if (!upgradeDb.objectStoreNames.contains('meditation')) {
          const medStore = upgradeDb.createObjectStore('meditation', {
            keyPath: 'id',
            autoIncrement: true,
          });
          medStore.createIndex('date', 'date', { unique: false });
        }

        if (!upgradeDb.objectStoreNames.contains('state')) {
          upgradeDb.createObjectStore('state', { keyPath: 'key' });
        }

        // NEW: Active Session Store (Singleton pattern, key usually 'current')
        if (!upgradeDb.objectStoreNames.contains('active_session')) {
          upgradeDb.createObjectStore('active_session', { keyPath: 'key' });
        }

        // NEW: Auditor Reports (Cache)
        if (!upgradeDb.objectStoreNames.contains('auditor_reports')) {
          const auditorStore = upgradeDb.createObjectStore('auditor_reports', {
            keyPath: 'id',
            autoIncrement: true,
          });
          auditorStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // NEW (v4): Grimoire Store
        if (!upgradeDb.objectStoreNames.contains('grimoire')) {
          const grimoireStore = upgradeDb.createObjectStore('grimoire', {
            keyPath: 'id',
          });
          grimoireStore.createIndex('date', 'date', { unique: false });
          grimoireStore.createIndex('type', 'type', { unique: false });
        }

        // NEW (v5): Generic Key-Value Store
        if (!upgradeDb.objectStoreNames.contains('kv')) {
          upgradeDb.createObjectStore('kv', { keyPath: 'key' });
        }
      };
    });
  }

  // --- SYNC HELPERS (MIGRATION BRIDGE) ---
  public static async syncToServer(endpoint: string, action: string, payload: unknown) {
    try {
      // Basic fetch wrapper - in real app, use a queue for offline sync
      const userId = localStorage.getItem('ironforge_user_id') || 'default';
      await fetch(`/api/sync/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId, payload }),
      });
    } catch (e) {
      console.warn('Sync failed:', e);
    }
  }

  public static async saveLog(log: ExerciseLog): Promise<void> {
    await StorageService.ensureInit();
    const database = StorageService._db;
    if (!database) throw new Error('Storage: Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['logs'], 'readwrite');
      const store = transaction.objectStore('logs');
      const request = store.add(log);
      request.onsuccess = () => {
        StorageService.syncToServer('logs', 'SAVE_LOG', log);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  public static async saveMeditation(log: MeditationLog): Promise<void> {
    await StorageService.ensureInit();
    const database = StorageService._db;
    if (!database) throw new Error('Storage: Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['meditation'], 'readwrite');
      const store = transaction.objectStore('meditation');
      const request = store.add(log);
      request.onsuccess = () => {
        StorageService.syncToServer('logs', 'SAVE_MEDITATION', log);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  public static async getMeditationHistory(): Promise<MeditationLog[]> {
    await StorageService.ensureInit();
    const database = StorageService._db;
    if (!database) return [];
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['meditation'], 'readonly');
      const store = transaction.objectStore('meditation');
      const request = store.getAll();
      request.onsuccess = () => {
        const logs = request.result as MeditationLog[];
        logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(logs);
      };
      request.onerror = () => reject(request.error);
    });
  }

  public static async getHistory(): Promise<ExerciseLog[]> {
    await StorageService.ensureInit();
    const database = StorageService._db;
    if (!database) return [];
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['logs'], 'readonly');
      const store = transaction.objectStore('logs');
      const request = store.getAll();
      request.onsuccess = () => {
        const logs = request.result as ExerciseLog[];
        logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        resolve(logs);
      };
      request.onerror = () => reject(request.error);
    });
  }

  public static async saveState(
    key:
      | 'achievements'
      | 'skills'
      | 'skills_v2'
      | 'settings'
      | 'equipment'
      | 'gold'
      | 'inventory'
      | 'unlocked_monsters'
      | 'active_keystone',
    data: unknown
  ): Promise<void> {
    await StorageService.ensureInit();
    const database = StorageService._db;
    if (!database) throw new Error('Storage: Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['state'], 'readwrite');
      const store = transaction.objectStore('state');
      const request = store.put({ key, value: data });
      request.onsuccess = () => {
        if (key === 'gold') StorageService.syncToServer('user', 'UPDATE_GOLD', data);
        if (key === 'settings') StorageService.syncToServer('user', 'UPDATE_SETTINGS', data);
        if (key === 'equipment') StorageService.syncToServer('user', 'UPDATE_EQUIPMENT', data);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  public static async getState<T>(
    key:
      | 'achievements'
      | 'skills'
      | 'skills_v2'
      | 'settings'
      | 'equipment'
      | 'gold'
      | 'inventory'
      | 'unlocked_monsters'
      | 'active_keystone'
  ): Promise<T | null> {
    await StorageService.ensureInit();
    const database = StorageService._db;
    if (!database) return null;
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['state'], 'readonly');
      const store = transaction.objectStore('state');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ? (request.result.value as T) : null);
      request.onerror = () => reject(request.error);
    });
  }

  // --- GENERIC KEY-VALUE STORE ---
  public static async setItem(key: string, value: unknown): Promise<void> {
    await StorageService.ensureInit();
    const database = StorageService._db;
    if (!database) throw new Error('Storage: Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['kv'], 'readwrite');
      const store = transaction.objectStore('kv');
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public static async getItem<T>(key: string): Promise<T | null> {
    await StorageService.ensureInit();
    const database = StorageService._db;
    if (!database) return null;
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['kv'], 'readonly');
      const store = transaction.objectStore('kv');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ? (request.result.value as T) : null);
      request.onerror = () => reject(request.error);
    });
  }

  public static async removeItem(key: string): Promise<void> {
    await StorageService.ensureInit();
    const database = StorageService._db;
    if (!database) throw new Error('Storage: Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['kv'], 'readwrite');
      const store = transaction.objectStore('kv');
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- ECONOMY ---
  public static async saveGold(amount: number): Promise<void> {
    return StorageService.saveState('gold', amount);
  }

  public static async getGold(): Promise<number> {
    const gold = (await StorageService.getState('gold')) as number;
    return gold || 0;
  }

  // --- EQUIPMENT SETTINGS ---
  public static async saveOwnedEquipment(equipment: Equipment[]): Promise<void> {
    return StorageService.saveState('equipment', equipment);
  }

  public static async getOwnedEquipment(): Promise<Equipment[] | null> {
    return StorageService.getState<Equipment[]>('equipment');
  }

  public static async saveHyperProPriority(enabled: boolean): Promise<void> {
    const settings =
      ((await StorageService.getState('settings')) as AppSettings) || ({} as AppSettings);
    settings.prioritizeHyperPro = enabled;
    return StorageService.saveState('settings', settings);
  }

  public static async getHyperProPriority(): Promise<boolean> {
    const settings = (await StorageService.getState('settings')) as AppSettings;
    return settings?.prioritizeHyperPro || false;
  }

  // --- AUDITOR REPORTS PERSISTENCE ---
  public static async saveAuditorReport(report: unknown): Promise<void> {
    await StorageService.ensureInit();
    const database = StorageService._db;
    if (!database) throw new Error('Storage: Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['auditor_reports'], 'readwrite');
      const store = transaction.objectStore('auditor_reports');
      const request = store.add(report);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public static async getLatestAuditorReport(): Promise<unknown | null> {
    await StorageService.ensureInit();
    const database = StorageService._db;
    if (!database) return null;

    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['auditor_reports'], 'readonly');
      const store = transaction.objectStore('auditor_reports');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev'); // Get latest by timestamp
      request.onsuccess = () => {
        const cursor = request.result;
        resolve(cursor ? cursor.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // --- ACTIVE SESSION PERSISTENCE ---
  public static async saveActiveSession(state: ActiveSessionState): Promise<void> {
    await StorageService.ensureInit();
    const database = StorageService._db;
    if (!database) throw new Error('Storage: Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['active_session'], 'readwrite');
      const store = transaction.objectStore('active_session');
      const request = store.put({ key: 'current', ...state });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public static async getActiveSession(): Promise<ActiveSessionState | null> {
    await StorageService.ensureInit();
    const database = StorageService._db;
    if (!database) return null;
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['active_session'], 'readonly');
      const store = transaction.objectStore('active_session');
      const request = store.get('current');
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  public static async clearActiveSession(): Promise<void> {
    await StorageService.ensureInit();
    const database = StorageService._db;
    if (!database) throw new Error('Storage: Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['active_session'], 'readwrite');
      const store = transaction.objectStore('active_session');
      const request = store.delete('current');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // --- GRIMOIRE & BESTIARY ---
  public static async getGrimoireEntries(): Promise<import('../types').GrimoireEntry[]> {
    await StorageService.ensureInit();
    const database = StorageService._db;
    if (!database) return [];
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['grimoire'], 'readonly');
      const store = transaction.objectStore('grimoire');
      const request = store.getAll();
      request.onsuccess = () => {
        const entries = request.result as import('../types').GrimoireEntry[];
        entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        resolve(entries);
      };
      request.onerror = () => reject(request.error);
    });
  }

  public static async saveGrimoireEntry(entry: import('../types').GrimoireEntry): Promise<void> {
    await StorageService.ensureInit();
    const database = StorageService._db;
    if (!database) throw new Error('Storage: Database not initialized');
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(['grimoire'], 'readwrite');
      const store = transaction.objectStore('grimoire');
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public static async getUnlockedMonsters(): Promise<string[]> {
    return ((await StorageService.getState('unlocked_monsters')) as string[]) || [];
  }

  public static async unlockMonster(monsterId: string): Promise<void> {
    const current = await StorageService.getUnlockedMonsters();
    if (!current.includes(monsterId)) {
      await StorageService.saveState('unlocked_monsters', [...current, monsterId]);
    }
  }

  public static async migrateFromLocalStorage() {
    await StorageService.ensureInit();
    const localAch = localStorage.getItem('ironforge_achievements');
    if (localAch) await StorageService.saveState('achievements', JSON.parse(localAch));
    const localSkills = localStorage.getItem('ironforge_skills');
    if (localSkills) await StorageService.saveState('skills', JSON.parse(localSkills));
    const localSettings = localStorage.getItem('ironforge_settings');
    if (localSettings) await StorageService.saveState('settings', JSON.parse(localSettings));
  }

  public static async ensureInit() {
    if (!StorageService._db) await StorageService.init();
  }
}
