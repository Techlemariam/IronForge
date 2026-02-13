import type { Meta, StoryObj } from '@storybook/react';
import { DashboardPresenter } from './components/DashboardPresenter';
import { Faction } from '@/types/training';

const meta: Meta<typeof DashboardPresenter> = {
  title: 'Features/Dashboard/DashboardPresenter',
  component: DashboardPresenter,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof DashboardPresenter>;

const mockState: any = {
  level: 10,
  totalExperience: 15400,
  faction: Faction.HORDE,
  currentView: 'citadel',
  isCoachOpen: false,
  isCodexLoading: false,
  questTitle: 'Daily Grind',
  wellnessData: { hrv: 65, readiness: 85 },
  activePath: 'WARDEN',
};

export const Default: Story = {
  args: {
    state: mockState,
    userData: { id: 'user-123', gold: 500 },
    dispatch: () => { },
    platform: 'desktop',
    leaderboardData: [],
    showOnboarding: false,
    pocketCastsConnected: true,
    hasCompletedOnboarding: true,
    onSaveWorkout: async () => { },
    onShowOnboardingComplete: () => { },
    onToggleCoach: () => { },
  },
};

export const TVMode: Story = {
  args: {
    ...Default.args,
    platform: 'tv',
  },
};
