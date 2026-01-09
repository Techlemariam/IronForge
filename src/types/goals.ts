/**
 * IronForge Goal-Priority Engine Types
 * 
 * Central definitions for the GPE data model.
 */

import { MuscleGroup, VolumeLevel } from '@/types/training';

export type TrainingGoal =
    | "VO2MAX"        // Max aerobic capacity
    | "FTP_BIKE"      // Functional Threshold Power (cycling)
    | "FTP_RUN"       // vVO2max / running economy
    | "STRENGTH"      // 1RM on compound lifts (Wilks)
    | "HYPERTROPHY"   // Muscle mass (volume-driven)
    | "ENDURANCE"     // Long-distance capability
    | "FITNESS"       // Intervals.icu Fitness metric
    | "BODY_COMP";    // Weight management focus

export interface GoalPriority {
    goal: TrainingGoal;
    weight: number;           // 0.0 - 1.0, sum must equal 1.0
    currentValue?: number;    // Latest measurement
    targetValue?: number;     // User's target
    deadline?: Date;          // Optional peak date
}

export type MacroPhase =
    | "CARDIO_BUILD"    // VO2max/FTP focus (MEV strength)
    | "STRENGTH_BUILD"  // Strength/Hypertrophy focus (MEV cardio)
    | "BALANCED"        // 50/50 maintenance
    | "PEAK"            // Competition prep (reduce volume, maintain intensity)
    | "DELOAD";         // Recovery week

export interface WardensManifest {
    userId: string;
    goals: GoalPriority[];    // Ordered by priority
    phase: MacroPhase;
    phaseStartDate: Date;
    phaseWeek: number;
    autoRotate: boolean;      // Let engine decide phase transitions

    // Privacy & Consent
    consents: {
        healthData: boolean;    // Allow processing menstrual/blood-glucose data
        leaderboard: boolean;   // Allow public sharing of PRs
    };
}

export interface SystemMetrics {
    // Physiology
    hrv: number;              // rMSSD 7d avg
    hrvBaseline: number;      // 60d avg
    tsb: number;              // Training Stress Balance (Form)
    atl: number;              // Acute Training Load (Fatigue)
    ctl: number;              // Chronic Training Load (Fitness)
    acwr: number;             // Acute:Chronic Workload Ratio

    // Wellness
    sleepScore: number;       // 0-100
    soreness: number;         // 1-10
    mood: "EXHAUSTED" | "TIRED" | "NORMAL" | "FRESH" | "PEAK" | string;

    // Progress
    consecutiveStalls: number; // Weeks without significant improvement
}

export interface DailyResourceBudget {
    cns: number;        // 0-100 arbitrary "points"
    muscular: number;   // 0-100 arbitrary "points"
    metabolic: number;  // 0-100 arbitrary "points"
}

export interface WeeklyTargets {
    strengthHours: number;
    cardioHours: number;
    mobilityHours: number;
    primaryFocus: TrainingGoal;
    phaseDescription: string;
}

export interface ResourceCost {
    CNS: number;
    MUSCULAR: number;
    METABOLIC: number;
}

export type MuscleHeatmap = Partial<Record<MuscleGroup, {
    status: VolumeLevel;
    currentVolume: number;
    targetVolume: number;
}>>;

