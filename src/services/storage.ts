import {
  ExerciseLog,
  AppSettings,
  Achievement,
  MeditationLog,
  Equipment,
  Session,
  Exercise,
} from "../types";

const DB_NAME = "ironforge_db";
const DB_VERSION = 4; // Incremented for Grimoire/Bestiary

interface UserState {
  achievements: string[];
  skills: string[];
  settings: AppSettings;
  equipment: Equipment[];
  gold: number;
}

export interface ActiveSessionState {
  sessionId: string;
  startTime: string;
  currentBlockIndex: number;
  exercises: Exercise[]; // Serialized state of current block exercises
  sessionData: Session; // The full session template
}

export const StorageService = {
  db: null as IDBDatabase | null,

  async init(): Promise<void> {
    // SSR SAFEGUARD: If running on server, do nothing.
    if (typeof window === "undefined" || !window.indexedDB) {
      return;
    }

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

        if (!db.objectStoreNames.contains("logs")) {
          const logStore = db.createObjectStore("logs", {
            keyPath: "id",
            autoIncrement: true,
          });
          logStore.createIndex("date", "date", { unique: false });
        }

        if (!db.objectStoreNames.contains("meditation")) {
          const medStore = db.createObjectStore("meditation", {
            keyPath: "id",
            autoIncrement: true,
          });
          medStore.createIndex("date", "date", { unique: false });
        }

        if (!db.objectStoreNames.contains("state")) {
          db.createObjectStore("state", { keyPath: "key" });
        }

        // NEW: Active Session Store (Singleton pattern, key usually 'current')
        if (!db.objectStoreNames.contains("active_session")) {
          db.createObjectStore("active_session", { keyPath: "key" });
        }

        // NEW: Auditor Reports (Cache)
        if (!db.objectStoreNames.contains("auditor_reports")) {
          const auditorStore = db.createObjectStore("auditor_reports", {
            keyPath: "id",
            autoIncrement: true,
          });
          auditorStore.createIndex("timestamp", "timestamp", { unique: false });
        }

        // NEW (v4): Grimoire Store
        if (!db.objectStoreNames.contains("grimoire")) {
          const grimoireStore = db.createObjectStore("grimoire", {
            keyPath: "id",
          });
          grimoireStore.createIndex("date", "date", { unique: false });
          grimoireStore.createIndex("type", "type", { unique: false });
        }
      };
    });
  },

  // --- SYNC HELPERS (MIGRATION BRIDGE) ---
  async syncToServer(endpoint: string, action: string, payload: unknown) {
    try {
      // Basic fetch wrapper - in real app, use a queue for offline sync
      const userId = localStorage.getItem("ironforge_user_id") || "default";
      await fetch(`/api/sync/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId, payload }),
      });
    } catch (e) {
      console.warn("Sync failed:", e);
    }
  },

  async saveLog(log: ExerciseLog): Promise<void> {
    await this.ensureInit();
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["logs"], "readwrite");
      const store = transaction.objectStore("logs");
      const request = store.add(log);
      request.onsuccess = () => {
        this.syncToServer("logs", "SAVE_LOG", log);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  },

  async saveMeditation(log: MeditationLog): Promise<void> {
    await this.ensureInit();
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["meditation"], "readwrite");
      const store = transaction.objectStore("meditation");
      const request = store.add(log);
      request.onsuccess = () => {
        this.syncToServer("logs", "SAVE_MEDITATION", log);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  },

  async getMeditationHistory(): Promise<MeditationLog[]> {
    await this.ensureInit();
    if (!this.db) return [];
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["meditation"], "readonly");
      const store = transaction.objectStore("meditation");
      const request = store.getAll();
      request.onsuccess = () => {
        const logs = request.result as MeditationLog[];
        logs.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        resolve(logs);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async getHistory(): Promise<ExerciseLog[]> {
    await this.ensureInit();
    if (!this.db) return [];
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["logs"], "readonly");
      const store = transaction.objectStore("logs");
      const request = store.getAll();
      request.onsuccess = () => {
        const logs = request.result as ExerciseLog[];
        logs.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        resolve(logs);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async saveState(
    key:
      | "achievements"
      | "skills"
      | "skills_v2"
      | "settings"
      | "equipment"
      | "gold"
      | "inventory"
      | "unlocked_monsters"
      | "active_keystone",
    data: unknown,
  ): Promise<void> {
    await this.ensureInit();
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["state"], "readwrite");
      const store = transaction.objectStore("state");
      const request = store.put({ key, value: data });
      request.onsuccess = () => {
        if (key === "gold") this.syncToServer("user", "UPDATE_GOLD", data);
        if (key === "settings")
          this.syncToServer("user", "UPDATE_SETTINGS", data);
        if (key === "equipment")
          this.syncToServer("user", "UPDATE_EQUIPMENT", data);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  },

  async getState<T>(
    key:
      | "achievements"
      | "skills"
      | "skills_v2"
      | "settings"
      | "equipment"
      | "gold"
      | "inventory"
      | "unlocked_monsters"
      | "active_keystone",
  ): Promise<T | null> {
    await this.ensureInit();
    if (!this.db) return null;
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["state"], "readonly");
      const store = transaction.objectStore("state");
      const request = store.get(key);
      request.onsuccess = () =>
        resolve(request.result ? (request.result.value as T) : null);
      request.onerror = () => reject(request.error);
    });
  },

  // --- ECONOMY ---
  async saveGold(amount: number): Promise<void> {
    return this.saveState("gold", amount);
  },

  async getGold(): Promise<number> {
    const gold = (await this.getState("gold")) as number;
    return gold || 0;
  },

  // --- EQUIPMENT SETTINGS ---
  async saveOwnedEquipment(equipment: Equipment[]): Promise<void> {
    return this.saveState("equipment", equipment);
  },

  async getOwnedEquipment(): Promise<Equipment[] | null> {
    return this.getState<Equipment[]>("equipment");
  },

  async saveHyperProPriority(enabled: boolean): Promise<void> {
    const settings =
      ((await this.getState("settings")) as AppSettings) || ({} as AppSettings);
    settings.prioritizeHyperPro = enabled;
    return this.saveState("settings", settings);
  },

  async getHyperProPriority(): Promise<boolean> {
    const settings = (await this.getState("settings")) as AppSettings;
    return settings?.prioritizeHyperPro || false;
  },

  // --- AUDITOR REPORTS PERSISTENCE ---
  async saveAuditorReport(report: unknown): Promise<void> {
    await this.ensureInit();
    if (!this.db) return; // Server-side or init failed safely

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        ["auditor_reports"],
        "readwrite",
      );
      const store = transaction.objectStore("auditor_reports");
      const request = store.add(report);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getLatestAuditorReport(): Promise<unknown | null> {
    await this.ensureInit();
    if (!this.db) return null; // Server-side or init failed safely

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["auditor_reports"], "readonly");
      const store = transaction.objectStore("auditor_reports");
      const index = store.index("timestamp");
      const request = index.openCursor(null, "prev"); // Get latest by timestamp
      request.onsuccess = () => {
        const cursor = request.result;
        resolve(cursor ? cursor.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  },

  // --- ACTIVE SESSION PERSISTENCE ---
  async saveActiveSession(state: ActiveSessionState): Promise<void> {
    await this.ensureInit();
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["active_session"], "readwrite");
      const store = transaction.objectStore("active_session");
      const request = store.put({ key: "current", ...state });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getActiveSession(): Promise<ActiveSessionState | null> {
    await this.ensureInit();
    if (!this.db) return null;
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["active_session"], "readonly");
      const store = transaction.objectStore("active_session");
      const request = store.get("current");
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async clearActiveSession(): Promise<void> {
    await this.ensureInit();
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["active_session"], "readwrite");
      const store = transaction.objectStore("active_session");
      const request = store.delete("current");
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // --- GRIMOIRE & BESTIARY ---
  async getGrimoireEntries(): Promise<import("../types").GrimoireEntry[]> {
    await this.ensureInit();
    if (!this.db) return [];
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["grimoire"], "readonly");
      const store = transaction.objectStore("grimoire");
      const request = store.getAll();
      request.onsuccess = () => {
        const entries = request.result as import("../types").GrimoireEntry[];
        entries.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        resolve(entries);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async saveGrimoireEntry(
    entry: import("../types").GrimoireEntry,
  ): Promise<void> {
    await this.ensureInit();
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["grimoire"], "readwrite");
      const store = transaction.objectStore("grimoire");
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getUnlockedMonsters(): Promise<string[]> {
    return ((await this.getState("unlocked_monsters")) as string[]) || [];
  },

  async unlockMonster(monsterId: string): Promise<void> {
    const current = await this.getUnlockedMonsters();
    if (!current.includes(monsterId)) {
      await this.saveState("unlocked_monsters", [...current, monsterId]);
    }
  },

  async migrateFromLocalStorage() {
    await this.ensureInit();
    const localAch = localStorage.getItem("ironforge_achievements");
    if (localAch) await this.saveState("achievements", JSON.parse(localAch));
    const localSkills = localStorage.getItem("ironforge_skills");
    if (localSkills) await this.saveState("skills", JSON.parse(localSkills));
    const localSettings = localStorage.getItem("ironforge_settings");
    if (localSettings)
      await this.saveState("settings", JSON.parse(localSettings));
  },

  async ensureInit() {
    if (!this.db) await this.init();
  },
};
