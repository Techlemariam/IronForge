// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardClient from '../DashboardClient';

// Mock dynamic imports
vi.mock('next/dynamic', () => ({
    default: () => {
        return function MockDynamicComponent() {
            return <div data-testid="mock-dynamic-component" />;
        };
    },
}));

// Mock Lucide React
// Mock Lucide React
vi.mock('lucide-react', () => {
    const MockIcon = () => <div data-testid="mock-icon" />;
    return {
        Mic: MockIcon,
        Bike: MockIcon,
        Footprints: MockIcon,
        Sword: MockIcon,
        Map: MockIcon,
        Castle: MockIcon,
        Dumbbell: MockIcon,
        Scroll: MockIcon,
        Skull: MockIcon,
        ShoppingBag: MockIcon,
        Shield: MockIcon,
        Users: MockIcon,
        Gavel: MockIcon,
    };
});

// Mock Child Components to simplify testing
vi.mock('@/components/core/SettingsCog', () => ({
    default: ({ onClick }: any) => <button onClick={onClick} data-testid="settings-cog">Settings</button>
}));
vi.mock('@/components/core/ConfigModal', () => ({
    default: ({ isOpen }: any) => isOpen ? <div data-testid="config-modal">Config Modal</div> : null
}));
vi.mock('@/components/OracleCard', () => ({
    default: () => <div data-testid="oracle-card">Oracle Card</div>
}));
vi.mock('@/components/UltrathinkDashboard', () => ({
    default: () => <div data-testid="ultrathink-dashboard">Ultrathink Dashboard</div>
}));
vi.mock('@/components/CampaignTracker', () => ({
    CampaignTracker: () => <div data-testid="campaign-tracker">Campaign Tracker</div>
}));
vi.mock('@/components/GeminiLiveCoach', () => ({
    default: () => <div data-testid="gemini-live-coach">Gemini Live Coach</div>
}));
vi.mock('@/components/OracleChat', () => ({
    OracleChat: () => <div data-testid="oracle-chat">Oracle Chat</div>
}));
vi.mock('@/features/dashboard/CitadelHub', () => ({
    CitadelHub: () => <div data-testid="citadel-hub">Citadel Hub</div>
}));

// Mock Actions
vi.mock('@/actions/hevy', () => ({
    saveWorkoutAction: vi.fn(),
}));
vi.mock('@/actions/progression', () => ({
    getProgressionAction: vi.fn(),
}));

describe('DashboardClient', () => {
    // Correctly structure the props based on new DashboardClientProps interface
    const mockDashboardData: any = {
        wellness: {} as any,
        activities: [],
        events: [],
        ttb: {} as any,
        recommendation: {
            id: 'mock-rec',
            type: 'QUEST',
            title: 'Mock Quest',
            description: 'Mock Description',
            confidence: 0.9,
            reasoning: 'AI Logic',
            generatedSession: null,
            sessionId: null,
            stats: {}
        } as any,
        auditReport: {} as any,
        forecast: [],
        titanAnalysis: null,
        activePath: 'HYBRID_WARDEN',
        weeklyMastery: {} as any
    };

    const mockProps = {
        initialData: mockDashboardData,
        userData: { id: 'test-user', hevyApiKey: 'valid-api-key' },
        hevyTemplates: [],
        hevyRoutines: [],
        intervalsConnected: true,
        stravaConnected: false,
        faction: 'HORDE',
        hasCompletedOnboarding: true,
        challenges: []
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the Citadel view by default when configured', async () => {
        render(<DashboardClient {...mockProps} />);

        expect(screen.getByTestId('oracle-card')).toBeTruthy();
        expect(screen.getByTestId('ultrathink-dashboard')).toBeTruthy();
        expect(screen.getByTestId('campaign-tracker')).toBeTruthy();
    });

    it('shows configuration scanlines if not configured', () => {
        const unconfiguredProps = {
            ...mockProps,
            userData: { id: 'test-user', hevyApiKey: null }
        };
        // Mock localStorage
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

        render(<DashboardClient {...unconfiguredProps} />);

        expect(screen.getByText('Configuration Required')).toBeTruthy();
        expect(screen.getByTestId('settings-cog')).toBeTruthy();
    });
});
