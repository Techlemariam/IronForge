import type { User, UserAchievement, UserSkill } from '@prisma/client';
import type { AuditReport } from './auditor';
import type {
  IntervalsActivity,
  IntervalsEvent,
  IntervalsWellness,
  TTBIndices,
  TitanLoadCalculation,
} from './index';
import type { TrainingPath } from './training';

export interface ExtendedUser extends User {
  achievements: UserAchievement[];
  skills: UserSkill[];
  activePath: TrainingPath | null;
  hasCompletedOnboarding: boolean;
  mobilityLevel: string | null;
  recoveryLevel: string | null;
  stravaAccessToken: string | null;
  pocketCastsEnabled: boolean;
}

export interface DashboardInitialData {
  wellness: IntervalsWellness;
  activities: IntervalsActivity[];
  events: IntervalsEvent[];
  ttb: TTBIndices;
  recommendation: any; // TODO: Define Oracle Recommendation type
  auditReport: AuditReport | null;
  forecast: any; // TODO: Define Forecast type
  titanAnalysis: TitanLoadCalculation | null;
  activePath: TrainingPath;
  weeklyMastery: {
    strengthSets: number;
    cardioTss: number;
    mobilitySessions: number;
    mobilityLevel: string;
    recoveryLevel: string;
  };
  activeDuel: any;
  trainingContext: any;
  powerRating: number;
}
