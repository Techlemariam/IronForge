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
        activePath: 'SOLDIER',
        level: 1,
        totalExperience: 0,
        weeklyMastery: { weekId: '1', completed: 0, required: 5 },
        wellnessData: {
            heartRate: 60,
            steps: 1000,
            sleepScore: 80,
            lastSync: new Date()
        },
        challenges: [],
        forecast: {
            today: { condition: 'CLEAR', temperature: 20 },
        },
        events: [],
        trainingContext: { readiness: 'High', strain: 'Low' }
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
        expect(screen.getByText('High')).toBeDefined();
    });

    it('does NOT render BioStatusWidget when trainingContext is missing', () => {
        const stateNoContext = { ...mockState, trainingContext: undefined };
        render(<StatsHeader state={stateNoContext} />);
        expect(screen.queryByTestId('bio-status')).toBeNull();
    });
});
