
export enum BlockType {
  WARMUP = 'warmup',
  STATION = 'station',
  TRANSITION = 'transition',
  COOLDOWN = 'cooldown',
}

export enum ExerciseLogic {
  FIXED_REPS = 'fixed_reps',
  TM_PERCENT = '531_tm_percent',
}

export type Rarity = 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Set {
  id: string;
  reps: number | string; // Target: string for "AMRAP"
  completedReps?: number; // Actual performed reps
  weightPct?: number; // For TM logic
  weight?: number; // Resolved weight
  completed: boolean;
  isPrZone?: boolean;
  rarity?: Rarity; // Visual style
}

export interface Exercise {
  id: string;
  name: string;
  logic: ExerciseLogic;
  trainingMax?: number; // Default TM for calc
  sets: Set[];
  notes?: string;
  instructions?: string[];
  demoUrl?: string;
  lootTable?: string[]; // Flavor text for rewards
}

export interface Block {
  id: string;
  name: string;
  type: BlockType;
  exercises?: Exercise[]; // For Station/Warmup
  setupInstructions?: string[]; // For Transition
  targetSetupName?: string; // For Transition
  estimatedDurationSec?: number;
}

export type QuestDifficulty = 'Normal' | 'Heroic' | 'Mythic';

export interface Session {
  id: string;
  name: string; // "Quest Name"
  zoneName?: string; // e.g., "The Iron Mines"
  difficulty?: QuestDifficulty;
  levelReq?: number;
  blocks: Block[];
  isGenerated?: boolean; // Flag for dynamic quests
  isCustom?: boolean; // Flag for user-created dungeons
}

// --- EQUIPMENT / ARMORY ---
export type EquipmentCategory = 'Barbell' | 'Weights' | 'Machine' | 'Cardio' | 'Accessory' | 'Rack';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  isOwned: boolean;
}

// --- GUILDS & RAIDS ---
export interface Guild {
    id: string;
    name: string;
    memberCount: number;
    activeRaid?: RaidBoss;
}

export interface RaidBoss {
    id: string;
    name: string;
    totalHp: number;
    currentHp: number;
    image: string;
    description: string;
    rewards: string[];
}

export interface ChatMessage {
    id: string;
    user: string;
    message: string;
    timestamp: string;
    type: 'CHAT' | 'LOG';
}

// --- SKILLS & TALENTS ---
export enum SkillStatus {
    LOCKED = 'LOCKED',
    UNLOCKED = 'UNLOCKED',
    MASTERED = 'MASTERED'
}

export type SkillCategory = 'push' | 'pull' | 'legs' | 'core' | 'endurance';

export interface SkillRequirement {
    type: 'achievement_count' | 'vo2max_value' | '1rm_weight' | 'rep_count';
    exercise_id: string; // 'any' or specific ID
    value: number;
    comparison: 'gte' | 'lte';
}

export interface SkillNode {
    id: string;
    title: string;
    description: string;
    category: SkillCategory;
    parents: string[];
    x: number;
    y: number;
    currency: 'talent_point' | 'kinetic_shard';
    cost: number;
    requirements: SkillRequirement[];
}

// --- ACHIEVEMENTS ---
export type AchievementCategory = 'general' | 'dungeons' | 'professions' | 'cardio' | 'feats';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    category: AchievementCategory;
    points: number;
}

export interface TitanRank {
    id: number;
    name: string;
    minTp: number;
    minKs: number;
    gateDescription?: string;
}

// --- ANALYTICS & LOGGING ---
export interface ExerciseLog {
    id?: number;
    date: string; // ISO
    exerciseId: string;
    e1rm: number;
    rpe: number;
    isEpic?: boolean;
}

export interface MeditationLog {
    id?: number;
    date: string;
    durationMinutes: number;
    source: 'Headspace' | 'Calm' | 'Other';
}

export interface IntervalsWellness {
    id?: string;
    bodyBattery?: number;
    sleepScore?: number;
    hrv?: number;
    restingHR?: number;
    vo2max?: number;
    ctl?: number;
    atl?: number;
    tsb?: number;
    sleepSecs?: number;
}

export interface IntervalsActivity {
    id?: string;
    icu_intensity?: number;
    moving_time: number;
}

export interface IntervalsEvent {
    id: number;
    start_date_local: string;
    name: string;
    description?: string;
    category: 'RACE' | 'WORKOUT' | 'NOTE';
    type?: string; // e.g. "Run", "Ride"
}

export interface AppSettings {
    intervalsApiKey: string;
    intervalsAthleteId: string;
    hevyApiKey?: string;
    supabaseUrl?: string;
    supabaseKey?: string;
    valhallaId?: string;
    heroName?: string;
    hueBridgeIp?: string;
    hueUsername?: string;
}

export interface TitanAttributes {
    strength: number;
    endurance: number;
    technique: number;
    recovery: number;
    mental: number;
    hypertrophy: number;
}

export interface WeaknessAudit {
    detected: boolean;
    type: 'NONE' | 'AEROBIC_INTERFERENCE' | 'RECOVERY_DEBT';
    message: string;
    confidence: number;
    correlationData?: { metric: string, trend: 'UP' | 'DOWN' };
}

export interface TSBForecast {
    dayOffset: number;
    tsb: number;
    label: string;
}

export interface TTBIndices {
    strength: number;
    endurance: number;
    wellness: number;
    lowest: 'strength' | 'endurance' | 'wellness';
}

export interface TitanLoadCalculation {
    standardTss: number;
    titanLoad: number;
    discrepancy: number;
    advice: string;
}

export interface OracleRecommendation {
    type: 'RECOVERY' | 'PR_ATTEMPT' | 'CARDIO_VALIDATION' | 'GRIND' | 'TAPER' | 'COMPETITION_PREP';
    title: string;
    rationale: string;
    priorityScore: number;
    generatedSession?: Session;
    sessionId?: string;
    targetExercise?: string;
}

export interface ValhallaPayload {
    heroName: string;
    level: number;
    achievements: string[];
    skills: string[];
    historyCount: number;
    lastSync: string;
}

export interface ValhallaSyncResult {
    success: boolean;
    message: string;
    timestamp: string;
}
