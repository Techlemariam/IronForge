/**
 * Mock Registry
 * 
 * Central definition of all E2E test mocks used in the IronForge project.
 * This ensures consistency between test setup and component expectations.
 * 
 * Usage in tests:
 *   import { MOCK_REGISTRY, createMockUser } from '../mocks/registry';
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface MockUser {
    id: string;
    heroName: string;
    email?: string;
    level?: number;
    gold?: number;
}

export interface MockCoOpSession {
    id: string;
    hostId: string;
    status: 'waiting' | 'active' | 'completed';
    inviteCode?: string;
    participants?: Array<{ id: string; heroName: string }>;
    maxParticipants?: number;
}

export interface MockGhostEvent {
    type: 'SET_COMPLETE' | 'PR' | 'BERSERKER' | 'EXERCISE_COMPLETE';
    userId: string;
    heroName: string;
    damage?: number;
    timestamp: number;
}

// ============================================================================
// MOCK REGISTRY - Single Source of Truth
// ============================================================================

export const MOCK_REGISTRY = {
    /**
     * User mock for useUser hook
     * Window key: window.__mockUser
     * Used in: src/hooks/useUser.ts
     */
    user: {
        windowKey: '__mockUser',
        usedIn: ['src/hooks/useUser.ts'],
        defaultValue: {
            id: 'test-user-123',
            heroName: 'Test Hero',
            email: 'test@ironforge.app',
            level: 10,
            gold: 5000,
        } as MockUser,
    },

    /**
     * Auto check-in mock for useMiningSession hook
     * Window key: window.__mockAutoCheckIn
     * Used in: src/features/strength/hooks/useMiningSession.ts
     */
    autoCheckIn: {
        windowKey: '__mockAutoCheckIn',
        usedIn: ['src/features/strength/hooks/useMiningSession.ts'],
        defaultValue: true,
    },

    /**
     * Active Co-Op session mock
     * Window key: window.__mockCoOpSession
     * Used in: src/services/coop/CoOpService.ts, src/features/coop/LiveSessionHUD.tsx
     */
    coopSession: {
        windowKey: '__mockCoOpSession',
        usedIn: ['src/services/coop/CoOpService.ts', 'src/features/coop/LiveSessionHUD.tsx'],
        defaultValue: {
            id: 'test-session-456',
            hostId: 'test-user-123',
            status: 'active',
            inviteCode: 'IRON-TEST',
            participants: [
                { id: 'test-user-123', heroName: 'Test Hero' },
                { id: 'teammate-789', heroName: 'Teammate' },
            ],
            maxParticipants: 4,
        } as MockCoOpSession,
    },

    /**
     * Session list mock for CoOpService.listSessions
     * Window key: window.__mockSessions
     * Used in: src/services/coop/CoOpService.ts
     */
    sessions: {
        windowKey: '__mockSessions',
        usedIn: ['src/services/coop/CoOpService.ts'],
        defaultValue: [] as MockCoOpSession[],
    },

    /**
     * Ghost events mock for GhostOverlay
     * Window key: window.__mockGhostEvents
     * Used in: src/features/coop/GhostOverlay.tsx
     */
    ghostEvents: {
        windowKey: '__mockGhostEvents',
        usedIn: ['src/features/coop/GhostOverlay.tsx'],
        defaultValue: [
            {
                type: 'SET_COMPLETE',
                userId: 'teammate-789',
                heroName: 'Iron Breaker',
                damage: 150,
                timestamp: Date.now(),
            },
        ] as MockGhostEvent[],
    },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a mock user with optional overrides
 */
export function createMockUser(overrides?: Partial<MockUser>): MockUser {
    return { ...MOCK_REGISTRY.user.defaultValue, ...overrides };
}

/**
 * Creates a mock Co-Op session with optional overrides
 */
export function createMockSession(overrides?: Partial<MockCoOpSession>): MockCoOpSession {
    return { ...MOCK_REGISTRY.coopSession.defaultValue, ...overrides };
}

/**
 * Generates the addInitScript content for all standard mocks
 */
export function generateMockScript(options?: {
    user?: MockUser | null;
    autoCheckIn?: boolean;
    coopSession?: MockCoOpSession | null;
    sessions?: MockCoOpSession[];
    ghostEvents?: MockGhostEvent[];
}): string {
    const user = options?.user ?? MOCK_REGISTRY.user.defaultValue;
    const autoCheckIn = options?.autoCheckIn ?? MOCK_REGISTRY.autoCheckIn.defaultValue;
    const coopSession = options?.coopSession ?? null;
    const sessions = options?.sessions ?? MOCK_REGISTRY.sessions.defaultValue;
    const ghostEvents = options?.ghostEvents ?? [];

    return `
    // Mock User (useUser hook)
    ${user ? `window.__mockUser = ${JSON.stringify(user)};` : ''}
    
    // Mock Auto Check-In (useMiningSession hook)
    window.__mockAutoCheckIn = ${autoCheckIn};
    
    // Mock Co-Op Session (CoOpService)
    ${coopSession ? `window.__mockCoOpSession = ${JSON.stringify(coopSession)};` : ''}
    
    // Mock Session List (CoOpService.listSessions)
    window.__mockSessions = ${JSON.stringify(sessions)};
    
    // Mock Ghost Events (GhostOverlay)
    ${ghostEvents.length > 0 ? `window.__mockGhostEvents = ${JSON.stringify(ghostEvents)};` : ''}
    
    // Mock localStorage API key
    localStorage.setItem('hevy_api_key', 'e2e-mock-key');
    
    console.log('[E2E-MOCK] All mocks initialized');
  `;
}

/**
 * Validates that all mocks are properly defined on the window object
 * Call this from page.evaluate() in tests to verify setup
 */
export function validateMocksScript(): string {
    return `
    const errors = [];
    const registry = ${JSON.stringify(Object.entries(MOCK_REGISTRY).map(([name, config]) => ({
        name,
        key: config.windowKey,
    })))};
    
    for (const { name, key } of registry) {
      if (window[key] === undefined) {
        errors.push('Missing mock: ' + key + ' (' + name + ')');
      }
    }
    
    if (errors.length > 0) {
      console.error('[E2E-MOCK] Validation failed:', errors);
      return { valid: false, errors };
    }
    
    console.log('[E2E-MOCK] All mocks validated');
    return { valid: true, errors: [] };
  `;
}

// ============================================================================
// TYPE AUGMENTATION for Window
// ============================================================================

declare global {
    interface Window {
        __mockUser?: MockUser;
        __mockAutoCheckIn?: boolean;
        __mockCoOpSession?: MockCoOpSession;
        __mockSessions?: MockCoOpSession[];
        __mockGhostEvents?: MockGhostEvent[];
    }
}
