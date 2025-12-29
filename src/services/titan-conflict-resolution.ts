'use server';

import { TitanState, getAuthoritativeTitanState } from './titan-state-schema';

// ============================================
// UNIFIED TITAN SOUL - CONFLICT RESOLUTION
// Multi-device sync conflict handling
// ============================================

type ConflictStrategy = 'SERVER_WINS' | 'CLIENT_WINS' | 'MERGE' | 'LATEST_WINS';

interface ConflictField {
    path: string;
    serverValue: unknown;
    clientValue: unknown;
    serverTimestamp: Date;
    clientTimestamp: Date;
}

interface ConflictResolution {
    field: string;
    strategy: ConflictStrategy;
    resolvedValue: unknown;
    reason: string;
}

interface MergeResult {
    success: boolean;
    mergedState: Partial<TitanState>;
    resolutions: ConflictResolution[];
    warnings: string[];
}

// Field-specific conflict strategies
const CONFLICT_STRATEGIES: Record<string, ConflictStrategy> = {
    // Economy: Always server (prevent exploits)
    'economy.gold': 'SERVER_WINS',
    'economy.gems': 'SERVER_WINS',

    // Progress: Take highest (no rollback)
    'level': 'MERGE', // Max of both
    'resources.xp': 'MERGE', // Max of both
    'progress.totalWorkouts': 'MERGE',
    'progress.totalVolume': 'MERGE',
    'progress.totalPRs': 'MERGE',

    // Stats: Take highest (buff priority)
    'stats.strength': 'MERGE',
    'stats.vitality': 'MERGE',
    'stats.endurance': 'MERGE',
    'stats.agility': 'MERGE',
    'stats.willpower': 'MERGE',

    // Resources: Latest wins (real-time state)
    'resources.hp': 'LATEST_WINS',
    'resources.energy': 'LATEST_WINS',

    // Equipment: Client wins (user intent)
    'equipment.weapon': 'CLIENT_WINS',
    'equipment.armor': 'CLIENT_WINS',
    'equipment.accessory1': 'CLIENT_WINS',
    'equipment.accessory2': 'CLIENT_WINS',

    // Status effects: Merge arrays
    'statusEffects': 'MERGE',
};

/**
 * Detect conflicts between server and client state.
 */
export function detectConflicts(
    serverState: TitanState,
    clientState: Partial<TitanState>,
    serverTimestamp: Date,
    clientTimestamp: Date
): ConflictField[] {
    const conflicts: ConflictField[] = [];

    function compareRecursive(server: unknown, client: unknown, path: string) {
        if (client === undefined) return;

        if (typeof server === 'object' && server !== null && typeof client === 'object' && client !== null) {
            if (Array.isArray(server) && Array.isArray(client)) {
                if (JSON.stringify(server) !== JSON.stringify(client)) {
                    conflicts.push({
                        path,
                        serverValue: server,
                        clientValue: client,
                        serverTimestamp,
                        clientTimestamp,
                    });
                }
            } else {
                for (const key of Object.keys(client as Record<string, unknown>)) {
                    compareRecursive(
                        (server as Record<string, unknown>)[key],
                        (client as Record<string, unknown>)[key],
                        path ? `${path}.${key}` : key
                    );
                }
            }
        } else if (server !== client) {
            conflicts.push({
                path,
                serverValue: server,
                clientValue: client,
                serverTimestamp,
                clientTimestamp,
            });
        }
    }

    compareRecursive(serverState, clientState, '');
    return conflicts;
}

/**
 * Resolve a single conflict.
 */
function resolveConflict(conflict: ConflictField): ConflictResolution {
    const strategy = CONFLICT_STRATEGIES[conflict.path] || 'SERVER_WINS';
    let resolvedValue: unknown;
    let reason: string;

    switch (strategy) {
        case 'SERVER_WINS':
            resolvedValue = conflict.serverValue;
            reason = 'Server authority (security)';
            break;

        case 'CLIENT_WINS':
            resolvedValue = conflict.clientValue;
            reason = 'User intent priority';
            break;

        case 'LATEST_WINS':
            if (conflict.clientTimestamp > conflict.serverTimestamp) {
                resolvedValue = conflict.clientValue;
                reason = 'Client is more recent';
            } else {
                resolvedValue = conflict.serverValue;
                reason = 'Server is more recent';
            }
            break;

        case 'MERGE':
            if (typeof conflict.serverValue === 'number' && typeof conflict.clientValue === 'number') {
                resolvedValue = Math.max(conflict.serverValue, conflict.clientValue);
                reason = 'Merged: took maximum';
            } else if (Array.isArray(conflict.serverValue) && Array.isArray(conflict.clientValue)) {
                const merged = [...conflict.serverValue];
                for (const item of conflict.clientValue) {
                    const itemId = (item as Record<string, unknown>).id;
                    if (!merged.some(m => (m as Record<string, unknown>).id === itemId)) {
                        merged.push(item);
                    }
                }
                resolvedValue = merged;
                reason = 'Merged: combined arrays';
            } else {
                resolvedValue = conflict.serverValue;
                reason = 'Merge fallback to server';
            }
            break;

        default:
            resolvedValue = conflict.serverValue;
            reason = 'Default: server wins';
    }

    return {
        field: conflict.path,
        strategy,
        resolvedValue,
        reason,
    };
}

/**
 * Merge server and client state with conflict resolution.
 */
export function mergeStates(
    serverState: TitanState,
    clientState: Partial<TitanState>,
    clientTimestamp: Date
): MergeResult {
    const serverTimestamp = serverState.lastModified;
    const conflicts = detectConflicts(serverState, clientState, serverTimestamp, clientTimestamp);
    const resolutions: ConflictResolution[] = [];
    const warnings: string[] = [];

    const mergedState = { ...clientState };

    for (const conflict of conflicts) {
        const resolution = resolveConflict(conflict);
        resolutions.push(resolution);

        // Apply resolution to merged state
        setNestedValue(mergedState, conflict.path, resolution.resolvedValue);

        // Log warnings for security-sensitive resolutions
        if (resolution.strategy === 'SERVER_WINS' && conflict.path.startsWith('economy')) {
            warnings.push(`Economy conflict on ${conflict.path}: server value preserved`);
        }
    }

    return {
        success: true,
        mergedState,
        resolutions,
        warnings,
    };
}

/**
 * Set a nested value by path.
 */
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current)) {
            current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
}

/**
 * Check if states are compatible (no critical conflicts).
 */
export function areStatesCompatible(
    serverState: TitanState,
    clientState: Partial<TitanState>
): boolean {
    const conflicts = detectConflicts(serverState, clientState, new Date(), new Date());

    // Check for critical conflicts
    const criticalPaths = ['economy.gold', 'economy.gems', 'level'];

    for (const conflict of conflicts) {
        if (criticalPaths.includes(conflict.path)) {
            return false;
        }
    }

    return true;
}
