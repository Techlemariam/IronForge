import prisma from '@/lib/prisma';
import { AnalyticsService } from '@/services/analytics';
import { PlannerService } from '@/services/planner';
import { describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@/lib/prisma', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
    },
    weeklyPlan: {
      create: vi.fn(),
    },
  };
  return {
    __esModule: true,
    default: mockPrisma,
    prisma: mockPrisma,
  };
});
vi.mock('@/services/auditor-orchestrator', () => {
  return {
    __esModule: true,
    runFullAudit: vi.fn(() =>
      Promise.resolve({
        highestPriorityGap: null,
        muscleAudits: [],
        ratios: [],
        overallScore: 100,
        timestamp: new Date().toISOString(),
      })
    ),
  };
});
vi.mock('@/lib/intervals', () => ({
  getWellness: vi.fn().mockResolvedValue({ tsb: 0, ctl: 50, atl: 50 }),
}));
vi.mock('@/services/analytics', () => ({
  AnalyticsService: {
    calculateTTB: vi.fn().mockReturnValue({
      strength: 50,
      endurance: 50,
      wellness: 50,
      lowest: 'strength',
    }),
  },
}));
vi.mock('@/services/oracle', () => ({
  OracleService: {
    consult: vi.fn().mockResolvedValue({
      id: 'mock-rec',
      title: 'mock-title',
      rationale: 'mock-rationale',
      playlist: [],
      generatedSession: null,
    }),
  },
}));

type FindUniqueMock = {
  mockResolvedValue: (value: unknown) => void;
};

const findUniqueMock = prisma.user.findUnique as unknown as FindUniqueMock;

describe('PlannerService', () => {
  it('should generate a plan for a valid user', async () => {
    // Setup mock user
    findUniqueMock.mockResolvedValue({
      id: 'user1',
      hevyApiKey: 'test-key',
      intervalsApiKey: 'test-key',
      intervalsAthleteId: 'test-id',
      exerciseLogs: [],
      cardioLogs: [],
      activePath: 'IRON_JUGGERNAUT',
    });

    const plan = await PlannerService.triggerWeeklyPlanGeneration('user1');

    expect(plan).toBeDefined();
    expect(plan.id).toMatch(/^plan_/);
    expect(prisma.weeklyPlan.create).toHaveBeenCalled();
  });

  it('passes only real strength evidence to TTB without synthetic RPE or e1RM', async () => {
    const loggedAt = new Date('2026-09-01T18:30:00.000Z');
    findUniqueMock.mockResolvedValue({
      id: 'user1',
      intervalsApiKey: null,
      intervalsAthleteId: null,
      exerciseLogs: [
        {
          id: 'log-1',
          date: loggedAt,
          isPersonalRecord: true,
        },
      ],
      cardioLogs: [],
      activePath: 'HYBRID_WARDEN',
    });

    await PlannerService.triggerWeeklyPlanGeneration('user1');

    const calls = vi.mocked(AnalyticsService.calculateTTB).mock.calls;
    const strengthHistory = calls[calls.length - 1]?.[0];

    expect(strengthHistory).toEqual([{ date: loggedAt.toISOString(), isEpic: true }]);
    expect(strengthHistory?.[0]).not.toHaveProperty('rpe');
    expect(strengthHistory?.[0]).not.toHaveProperty('e1rm');
  });
});
