// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardClient, { InitialDataProps } from '../DashboardClient';

// Mock dynamic imports
vi.mock('next/dynamic', () => ({
    default: () => {
        return function MockDynamicComponent() {
            return <div data-testid="mock-dynamic-component" />;
        };
    },
}));

// Mock Lucide React
vi.mock('lucide-react', () => ({
    Mic: () => <div data-testid="icon-mic" />,
    Bike: () => <div data-testid="icon-bike" />,
    Footprints: () => <div data-testid="icon-footprints" />,
}));

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

// Mock Actions
vi.mock('@/actions/hevy', () => ({
    saveWorkoutAction: vi.fn(),
}));
vi.mock('@/actions/progression', () => ({
    getProgressionAction: vi.fn(),
}));

describe('DashboardClient', () => {
    const mockInitialData: InitialDataProps = {
        userId: 'test-user',
        nameMap: new Map(),
        ttb: {} as any,
        wellness: {} as any,
        level: 5,
        auditReport: {} as any,
        oracleRec: null as any,
        weaknessAudit: {} as any,
        forecast: [],
        events: [],
        titanAnalysis: null,
        totalExperience: 1000,
        apiKey: 'valid-api-key', // Configured
        intervalsConnected: true,
        faction: 'HORDE'
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the Citadel view by default when configured', async () => {
        render(<DashboardClient {...mockInitialData} />);

        expect(await screen.findByText("Oracle's Wisdom")).toBeTruthy();
        expect(screen.getByTestId('ultrathink-dashboard')).toBeTruthy();
        expect(screen.getByTestId('campaign-tracker')).toBeTruthy();
        expect(screen.getByText('The Forge')).toBeTruthy();
        expect(screen.getByText('Training Path')).toBeTruthy();
    });

    it('shows configuration scanlines if not configured', () => {
        const unconfiguredData = { ...mockInitialData, apiKey: null };
        // Mock localStorage
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

        render(<DashboardClient {...unconfiguredData} />);

        expect(screen.getByText('Configuration Required')).toBeTruthy();
        expect(screen.getByTestId('settings-cog')).toBeTruthy();
    });
});
