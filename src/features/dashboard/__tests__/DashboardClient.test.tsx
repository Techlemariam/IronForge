import { render, screen } from '@testing-library/react';
import React from 'react';
// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardClient from '../DashboardClient';

// Mock dynamic imports
vi.mock('next/dynamic', () => ({
  default: () => {
    return function MockDynamicComponent() {
      return <div data-testid="mock-dynamic-component" />;
    };
  },
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => (
    <a href={href} data-testid="next-link">
      {children}
    </a>
  ),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));

// Mock Lucide React
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('lucide-react')>();
  return {
    ...actual,
  };
});

// Mock Child Components to simplify testing

vi.mock('@/features/oracle/components/OracleCard', () => ({
  default: () => <div data-testid="oracle-card">Oracle Card</div>,
}));
vi.mock('@/features/dashboard/components/UltrathinkDashboard', () => ({
  default: () => <div data-testid="ultrathink-dashboard">Ultrathink Dashboard</div>,
}));
vi.mock('@/features/game/components/campaign/CampaignTracker', () => ({
  CampaignTracker: () => <div data-testid="campaign-tracker">Campaign Tracker</div>,
}));
vi.mock('@/features/training/components/GeminiLiveCoach', () => ({
  default: () => <div data-testid="gemini-live-coach">Gemini Live Coach</div>,
}));
vi.mock('@/features/oracle/components/OracleChat', () => ({
  OracleChat: () => <div data-testid="oracle-chat">Oracle Chat</div>,
  default: () => <div data-testid="oracle-chat">Oracle Chat</div>,
}));
vi.mock('@/features/dashboard/CitadelHub', () => ({
  CitadelHub: () => <div data-testid="citadel-hub">Citadel Hub</div>,
  default: () => <div data-testid="citadel-hub">Citadel Hub</div>,
}));

// Mock Actions
vi.mock('@/actions/integrations/hevy', () => ({
  saveWorkoutAction: vi.fn(),
}));
vi.mock('@/actions/progression/core', () => ({
  getProgressionAction: vi.fn(),
}));
vi.mock('@/hooks/useAmbientSound', () => ({
  useAmbientSound: vi.fn(),
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
      stats: {},
    } as any,
    auditReport: {} as any,
    forecast: [],
    titanAnalysis: null,
    activePath: 'WARDEN',
    weeklyMastery: {} as any,
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
    challenges: [],
    pocketCastsConnected: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the settings link by default', async () => {
    render(<DashboardClient {...mockProps} />);

    // Check for at least one settings link
    const links = screen.getAllByTestId('next-link');
    const settingsLink = links.find((l) => l.getAttribute('href') === '/settings');
    expect(settingsLink).toBeTruthy();
  });

  it('renders dashboard content even if not configured (gate removed)', () => {
    const unconfiguredProps = {
      ...mockProps,
      userData: { id: 'test-user', hevyApiKey: null },
    };
    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    render(<DashboardClient {...unconfiguredProps} />);

    // Should render TodaysMission by default (mission_control view)
    expect(screen.getByTestId('todays-mission')).toBeTruthy();
  });
});
