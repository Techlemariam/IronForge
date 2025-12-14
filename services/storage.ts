
import { ExerciseLog, AppSettings, Achievement, MeditationLog, Equipment, Session } from '../types';

const DB_NAME = 'ironforge_db';
const DB_VERSION = 3; // Incremented for active_session store

interface UserState {
    achievements: string[]; 
    skills: string[]; 
    settings: AppSettings;
    equipment: Equipment[];
}

export interface ActiveSessionState {
    sessionId: string;
    startTime: string;
    currentBlockIndex: number;
    exercises: any[]; // Serialized state of current block exercises
    sessionData: Session; // The full session template
}

export const StorageService = {
    db: null as IDBDatabase | null,

    async init(): Promise<void> {
        if (this.db) return;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error("IndexedDB error:", request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                if (!db.objectStoreNames.contains('logs')) {
                    const logStore = db.createObjectStore('logs', { keyPath: 'id', autoIncrement: true });
                    logStore.createIndex('date', 'date', { unique: false });
                }

                if (!db.objectStoreNames.contains('meditation')) {
                    const medStore = db.createObjectStore('meditation', { keyPath: 'id', autoIncrement: true });
                    medStore.createIndex('date', 'date', { unique: false });
                }

                if (!db.objectStoreNames.contains('state')) {
                    db.createObjectStore('state', { keyPath: 'key' });
                }

                // NEW: Active Session Store (Singleton pattern, key usually 'current')
                if (!db.objectStoreNames.contains('active_session')) {
                    db.createObjectStore('active_session', { keyPath: 'key' });
                }
            };
        });
    },

    async saveLog(log: ExerciseLog): Promise<void> {
        await this.ensureInit();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['logs'], 'readwrite');
            const store = transaction.objectStore('logs');
            const request = store.add(log);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async saveMeditation(log: MeditationLog): Promise<void> {
        await this.ensureInit();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['meditation'], 'readwrite');
            const store = transaction.objectStore('meditation');
            const request = store.add(log);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async getMeditationHistory(): Promise<MeditationLog[]> {
        await this.ensureInit();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['meditation'], 'readonly');
            const store = transaction.objectStore('meditation');
            const request = store.getAll();
            request.onsuccess = () => {
                const logs = request.result as MeditationLog[];
                logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                resolve(logs);
            };
            request.onerror = () => reject(request.error);
        });
    },

    async getHistory(): Promise<ExerciseLog[]> {
        await this.ensureInit();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['logs'], 'readonly');
            const store = transaction.objectStore('logs');
            const request = store.getAll();
            request.onsuccess = () => {
                const logs = request.result as ExerciseLog[];
                logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                resolve(logs);
            };
            request.onerror = () => reject(request.error);
        });
    },

    async saveState(key: 'achievements' | 'skills' | 'settings' | 'equipment', data: any): Promise<void> {
        await this.ensureInit();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['state'], 'readwrite');
            const store = transaction.objectStore('state');
            const request = store.put({ key, value: data });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async getState<T>(key: 'achievements' | 'skills' | 'settings' | 'equipment'): Promise<T | null> {
        await this.ensureInit();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['state'], 'readonly');
            const store = transaction.objectStore('state');
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result ? request.result.value : null);
            request.onerror = () => reject(request.error);
        });
    },

    // --- ACTIVE SESSION PERSISTENCE ---
    async saveActiveSession(state: ActiveSessionState): Promise<void> {
        await this.ensureInit();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['active_session'], 'readwrite');
            const store = transaction.objectStore('active_session');
            const request = store.put({ key: 'current', ...state });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async getActiveSession(): Promise<ActiveSessionState | null> {
        await this.ensureInit();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['active_session'], 'readonly');
            const store = transaction.objectStore('active_session');
            const request = store.get('current');
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    },

    async clearActiveSession(): Promise<void> {
        await this.ensureInit();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['active_session'], 'readwrite');
            const store = transaction.objectStore('active_session');
            const request = store.delete('current');
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    async migrateFromLocalStorage() {
        await this.ensureInit();
        const localAch = localStorage.getItem('ironforge_achievements');
        if (localAch) await this.saveState('achievements', JSON.parse(localAch));
        const localSkills = localStorage.getItem('ironforge_skills');
        if (localSkills) await this.saveState('skills', JSON.parse(localSkills));
        const localSettings = localStorage.getItem('ironforge_settings');
        if (localSettings) await this.saveState('settings', JSON.parse(localSettings));
    },

    async ensureInit() {
        if (!this.db) await this.init();
    }
};
