'use client';

import React, { useState } from 'react';
import { StorageService } from '@/services/storage';
import { RefreshCw, CheckCircle, Database } from 'lucide-react';

export const MigrationTool = () => {
    const [status, setStatus] = useState<'IDLE' | 'MIGRATING' | 'DONE' | 'ERROR'>('IDLE');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const runMigration = async () => {
        setStatus('MIGRATING');
        setLogs([]);
        addLog("Starting migration from Local Storage / IndexedDB...");

        try {
            // 1. Sync User State
            addLog("Migrating User State (Settings, Gold, Equipment)...");
            const settings = await StorageService.getState('settings');
            const gold = await StorageService.getState('gold');
            const equipment = await StorageService.getOwnedEquipment();

            if (settings) {
                await StorageService.syncToServer('user', 'UPDATE_SETTINGS', settings);
                addLog("✅ Settings synced.");
            }
            if (gold !== null) {
                await StorageService.syncToServer('user', 'UPDATE_GOLD', gold);
                addLog("✅ Gold synced.");
            }
            if (equipment) {
                await StorageService.syncToServer('user', 'UPDATE_EQUIPMENT', equipment);
                addLog("✅ Equipment synced.");
            }

            // 2. Sync Logs
            addLog("Migrating Exercise History...");
            const history = await StorageService.getHistory();
            if (history && history.length > 0) {
                let successCount = 0;
                // Batch this in reality, but for now simple loop
                for (const log of history) {
                    await StorageService.syncToServer('logs', 'SAVE_LOG', log);
                    successCount++;
                }
                addLog(`✅ Synced ${successCount} exercise logs.`);
            } else {
                addLog("No exercise logs found locally.");
            }

            addLog("Migrating Meditation History...");
            const meditation = await StorageService.getMeditationHistory();
            if (meditation && meditation.length > 0) {
                for (const log of meditation) {
                    await StorageService.syncToServer('logs', 'SAVE_MEDITATION', log);
                }
                addLog("✅ Meditation history synced.");
            }

            // 3. Mark Complete
            setStatus('DONE');
            addLog("Migration Complete! Your data is now safe in the cloud.");

        } catch (error: any) {
            console.error("Migration failed:", error);
            setStatus('ERROR');
            addLog(`❌ ERROR: ${error.message || 'Unknown error'}`);
        }
    };

    return (
        <div className="p-6 bg-forge-900 border border-forge-border rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-warrior" />
                <h2 className="text-xl font-serif text-white uppercase tracking-wider">Cloud Migration</h2>
            </div>

            <p className="text-forge-muted text-sm mb-6">
                Move your local data to the secure IronForge Vault (PostgreSQL). This ensures you can access your progress across devices.
            </p>

            <div className="bg-black/50 rounded p-4 h-48 overflow-y-auto mb-4 font-mono text-xs border border-white/5 custom-scrollbar">
                {logs.length === 0 ? <span className="text-gray-600">Waiting to start...</span> : logs.map((log, i) => (
                    <div key={i} className="mb-1">{log}</div>
                ))}
            </div>

            <button
                onClick={runMigration}
                disabled={status === 'MIGRATING'}
                className={`w-full py-3 px-4 rounded font-bold uppercase tracking-wider transition-all
                    ${status === 'DONE' ? 'bg-green-600 hover:bg-green-700 text-white' :
                        status === 'MIGRATING' ? 'bg-gray-600 text-gray-300 cursor-wait' :
                            'bg-warrior hover:bg-warrior-light text-black'}
                `}
            >
                {status === 'MIGRATING' && <RefreshCw className="w-5 h-5 animate-spin mx-auto" />}
                {status === 'DONE' && <div className="flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> Migration Complete</div>}
                {status === 'IDLE' && 'Start Migration'}
                {status === 'ERROR' && 'Retry Migration'}
            </button>
        </div>
    );
};

export default MigrationTool;
