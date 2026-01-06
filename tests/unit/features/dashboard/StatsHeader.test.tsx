import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsHeader } from '@/features/dashboard/components/StatsHeader';
import { DashboardState } from '@/features/dashboard/types';

// Mocks
vi.mock('@/features/titan/TitanAvatar', () => ({
    TitanAvatar: ({ titan }: { titan: any }) => <div data-testid="titan-avatar">{titan?.name}</div>
}));

vi.mock('@/components/dashboard/BioStatusWidget', () => ({
    default: ({ context }: { context: any }) => <div data-testid="bio-status">{context.readiness}</div>
}));

describe('StatsHeader', () => {
    const mockState: DashboardState = {
        activePath: 'WARDEN',
        level: 1,
        totalExperience: 0,
        weeklyMastery: { strengthSets: 5, cardioTss: 100, mobilitySets: 2 },
        wellnessData: {
            restingHR: 60,
            sleepScore: 80
        },
        challenges: [],
        forecast: [
            { dayOffset: 0, tsb: 5, label: 'Today' }
        ],
        events: [],
        oracleRecommendation: null,
        titanAnalysis: null,
        trainingContext: {
            readiness: 'HIGH',
            cnsFatigue: 'LOW',
            cardioStress: 'LOW',
            volume: {},
            warnings: []
        },
        isCodexLoading: false,
        ttb: null,
        activeQuest: null,
        questTitle: '',
        exerciseNameMap: new Map(),
        startTime: null,
        currentView: 'citadel',
        auditReport: null,
        weaknessAudit: null,
        isCoachOpen: false,
        activeBossId: null,
        mobilityLevel: 'NONE',
        recoveryLevel: 'NONE',
        returnView: null,
        faction: 'ALLIANCE'
    };

    it('renders TitanAvatar when not in liteMode', () => {
        const titanState = { name: 'Helios' };
        render(<StatsHeader state={mockState} titanState={titanState} />);
        expect(screen.getByTestId('titan-avatar')).toBeDefined();
        expect(screen.getByText('Helios')).toBeDefined();
    });

    it('does NOT render TitanAvatar when in liteMode', () => {
        render(<StatsHeader state={mockState} liteMode={true} />);
        expect(screen.queryByTestId('titan-avatar')).toBeNull();
    });

    it('renders BioStatusWidget when trainingContext is present', () => {
        render(<StatsHeader state={mockState} />);
        expect(screen.getByTestId('bio-status')).toBeDefined();
        expect(screen.getByText('HIGH')).toBeDefined();
    });

    it('does NOT render BioStatusWidget when trainingContext is missing', () => {
        const stateNoContext = { ...mockState, trainingContext: undefined };
        render(<StatsHeader state={stateNoContext} />);
        expect(screen.queryByTestId('bio-status')).toBeNull();
    });
});
