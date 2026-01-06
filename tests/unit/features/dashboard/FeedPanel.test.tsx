import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedPanel } from '@/features/dashboard/components/FeedPanel';
import { DashboardState } from '@/features/dashboard/types';

// Mocks
vi.mock('@/features/oracle/components/OracleVerdict', () => ({
    default: ({ decree }: { decree: any }) => <div data-testid="oracle-verdict">{decree.title}</div>
}));

vi.mock('@/features/oracle/components/OracleCard', () => ({
    default: ({ recommendation, onAccept }: { recommendation: any, onAccept: any }) => (
        <div data-testid="oracle-card">
            <button onClick={() => onAccept(recommendation)}>Accept</button>
            {recommendation.mode}
        </div>
    )
}));

vi.mock('@/features/oracle/components/PushSubscriptionToggle', () => ({
    PushSubscriptionToggle: () => <div data-testid="push-toggle">Push Toggle</div>
}));

vi.mock('@/components/ui/GameToast', () => ({
    toast: {
        info: vi.fn(),
    }
}));

import { toast } from '@/components/ui/GameToast';

describe('FeedPanel', () => {
    const mockDispatch = vi.fn();
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
        ttb: null,
        trainingContext: {
            readiness: 'HIGH',
            cnsFatigue: 'LOW',
            cardioStress: 'LOW',
            volume: {},
            warnings: []
        },
        isCodexLoading: false,
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

    it('renders "Oracle is contemplating" when no recommendation or decree', () => {
        render(<FeedPanel state={mockState} dispatch={mockDispatch} />);
        expect(screen.getByText(/The Oracle is contemplating the cosmos/i)).toBeDefined();
    });

    it('renders OracleVerdict when titanState has dailyDecree', () => {
        const titanState = { dailyDecree: { title: 'Decree Title' } };
        render(<FeedPanel state={mockState} dispatch={mockDispatch} titanState={titanState} />);
        expect(screen.getByTestId('oracle-verdict')).toBeDefined();
        expect(screen.getByText('Decree Title')).toBeDefined();
    });

    it('renders OracleCard when state has oracleRecommendation', () => {
        const stateWithRec = {
            ...mockState,
            oracleRecommendation: {
                mode: 'Quest',
                type: 'GRIND',
                title: 'Daily Grind',
                rationale: 'Keep pushing',
                priorityScore: 80,
                generatedSession: { id: '123' }
            } as any
        };
        render(<FeedPanel state={stateWithRec} dispatch={mockDispatch} />);
        expect(screen.getByTestId('oracle-card')).toBeDefined();
    });

    it('dispatches START_GENERATED_QUEST when quest is accepted with generatedSession', () => {
        const session = { id: '123' };
        const stateWithRec = {
            ...mockState,
            oracleRecommendation: {
                mode: 'Quest',
                type: 'GRIND',
                title: 'Daily Grind',
                rationale: 'Keep pushing',
                priorityScore: 80,
                generatedSession: session
            } as any
        };
        render(<FeedPanel state={stateWithRec} dispatch={mockDispatch} />);

        fireEvent.click(screen.getByText('Accept'));
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'START_GENERATED_QUEST',
            payload: session,
        });
    });

    it('shows toast when quest is accepted with sessionId only', () => {
        const stateWithRec = {
            ...mockState,
            oracleRecommendation: {
                mode: 'Quest',
                type: 'GRIND',
                title: 'Daily Grind',
                rationale: 'Keep pushing',
                priorityScore: 80,
                sessionId: 'fixed-quest-1'
            } as any
        };
        render(<FeedPanel state={stateWithRec} dispatch={mockDispatch} />);

        fireEvent.click(screen.getByText('Accept'));
        expect(toast.info).toHaveBeenCalledWith(expect.stringContaining('Traveling to Static Quest'));
    });
});
