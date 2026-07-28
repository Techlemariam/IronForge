import { calculateE1rmEpley, calculateRequiredRepsForE1rm } from '@/utils/oneRepMaxCalculator';

export type ProgressionMethod =
  | 'FIXED'
  | 'DOUBLE_PROGRESSION'
  | 'REP_GOAL'
  | 'RPT'
  | 'TOP_SET_BACKOFF'
  | 'TRAINING_MAX'
  | 'MANUAL';

export type ProgressionAction = 'INCREASE' | 'HOLD' | 'REDUCE' | 'DELOAD';
export type SetRole = 'TOP' | 'BACKOFF' | 'VOLUME' | 'AMRAP' | 'WARMUP';

export interface EquipmentConstraints {
  minimumIncrement: number;
  availableLoads?: number[];
}

export interface RecoveryContext {
  sleepScore?: number;
  bodyBattery?: number;
  hrvTrend?: 'UP' | 'STABLE' | 'DOWN';
  systemicFailures?: number;
}

export interface SetPrescription {
  targetWeight: number;
  minimumReps: number;
  targetReps?: number;
  maximumReps?: number;
  targetRpe?: number;
  setRole: SetRole;
}

export interface CompletedSet {
  weight: number;
  reps: number;
  rpe?: number;
  setRole?: SetRole;
  isWarmup?: boolean;
}

export interface ProgressionInput {
  method: ProgressionMethod;
  prescription: SetPrescription[];
  completedSets: CompletedSet[];
  previousFailures?: number;
  repGoal?: number;
  equipment: EquipmentConstraints;
  recovery?: RecoveryContext;
}

export interface SetGoal {
  repGoal: number;
  e1rmGoalReps?: number;
  e1rmTarget?: number;
}

export interface ProgressionDecision {
  nextPrescription: SetPrescription[];
  action: ProgressionAction;
  reason: string;
  confidence: number;
  setGoals: SetGoal[];
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function roundToAvailableLoad(weight: number, equipment: EquipmentConstraints): number {
  const available = equipment.availableLoads?.filter((load) => load >= 0).sort((a, b) => a - b);
  if (available?.length) {
    return available.reduce((closest, candidate) =>
      Math.abs(candidate - weight) < Math.abs(closest - weight) ? candidate : closest
    );
  }

  const increment = equipment.minimumIncrement > 0 ? equipment.minimumIncrement : 1;
  return Math.round(weight / increment) * increment;
}

function isRecoverySuppressed(recovery?: RecoveryContext): boolean {
  if (!recovery) return false;
  const lowSleep = recovery.sleepScore !== undefined && recovery.sleepScore < 60;
  const lowBattery = recovery.bodyBattery !== undefined && recovery.bodyBattery < 35;
  const fallingHrv = recovery.hrvTrend === 'DOWN';
  return [lowSleep, lowBattery, fallingHrv].filter(Boolean).length >= 2;
}

function isSystemicFatigue(recovery?: RecoveryContext): boolean {
  return isRecoverySuppressed(recovery) && (recovery?.systemicFailures ?? 0) >= 2;
}

function buildSetGoals(
  prescription: SetPrescription[],
  completedSets: CompletedSet[]
): SetGoal[] {
  const bestHistoricalE1rm = completedSets
    .filter((set) => !set.isWarmup)
    .reduce((best, set) => Math.max(best, calculateE1rmEpley(set.weight, set.reps)), 0);

  return prescription.map((set) => ({
    repGoal: set.targetReps ?? set.minimumReps,
    e1rmTarget: bestHistoricalE1rm || undefined,
    e1rmGoalReps:
      bestHistoricalE1rm > 0
        ? calculateRequiredRepsForE1rm(set.targetWeight, bestHistoricalE1rm)
        : undefined,
  }));
}

function increasePrescription(
  prescription: SetPrescription[],
  equipment: EquipmentConstraints
): SetPrescription[] {
  return prescription.map((set) => ({
    ...set,
    targetWeight: roundToAvailableLoad(
      set.targetWeight + equipment.minimumIncrement,
      equipment
    ),
  }));
}

function reducePrescription(
  prescription: SetPrescription[],
  equipment: EquipmentConstraints,
  percentage = 0.075
): SetPrescription[] {
  return prescription.map((set) => ({
    ...set,
    targetWeight: roundToAvailableLoad(set.targetWeight * (1 - percentage), equipment),
  }));
}

function evaluateDoubleProgression(input: ProgressionInput): ProgressionDecision {
  const workSets = input.completedSets.filter((set) => !set.isWarmup);
  const upperTargetsReached = input.prescription.every((target, index) => {
    const actual = workSets[index];
    if (!actual) return false;
    const upper = target.maximumReps ?? target.targetReps ?? target.minimumReps;
    const rpeOk = target.targetRpe === undefined || actual.rpe === undefined || actual.rpe <= target.targetRpe;
    return actual.reps >= upper && rpeOk;
  });

  if (upperTargetsReached && !isRecoverySuppressed(input.recovery)) {
    return {
      action: 'INCREASE',
      nextPrescription: increasePrescription(input.prescription, input.equipment),
      reason: 'Alla arbetsset nådde övre repgränsen inom tillåten ansträngning.',
      confidence: 0.95,
      setGoals: buildSetGoals(input.prescription, input.completedSets),
    };
  }

  return {
    action: 'HOLD',
    nextPrescription: input.prescription,
    reason: upperTargetsReached
      ? 'Prestationsmålet nåddes, men återhämtningen talar för att behålla vikten en gång till.'
      : 'Behåll vikten tills samtliga arbetsset når övre repgränsen.',
    confidence: upperTargetsReached ? 0.8 : 0.9,
    setGoals: buildSetGoals(input.prescription, input.completedSets),
  };
}

function evaluateRepGoal(input: ProgressionInput): ProgressionDecision {
  const workSets = input.completedSets.filter((set) => !set.isWarmup);
  const totalReps = workSets.reduce((sum, set) => sum + set.reps, 0);
  const goal = input.repGoal ?? input.prescription.reduce((sum, set) => sum + set.minimumReps, 0);

  if (totalReps >= goal && !isRecoverySuppressed(input.recovery)) {
    return {
      action: 'INCREASE',
      nextPrescription: increasePrescription(input.prescription, input.equipment),
      reason: `Repmålet nåddes med ${totalReps}/${goal} reps.`,
      confidence: 0.95,
      setGoals: buildSetGoals(input.prescription, input.completedSets),
    };
  }

  const failures = input.previousFailures ?? 0;
  if (failures >= 2 && totalReps < goal * 0.9) {
    return {
      action: isSystemicFatigue(input.recovery) ? 'DELOAD' : 'REDUCE',
      nextPrescription: reducePrescription(input.prescription, input.equipment),
      reason: isSystemicFatigue(input.recovery)
        ? 'Flera missade exponeringar sammanfaller med låg återhämtning; en lättare vecka rekommenderas.'
        : 'Repmålet har missats flera gånger; belastningen sänks för att återställa progressionen.',
      confidence: 0.85,
      setGoals: buildSetGoals(input.prescription, input.completedSets),
    };
  }

  return {
    action: 'HOLD',
    nextPrescription: input.prescription,
    reason: `Repmålet är ${goal}; utfallet blev ${totalReps}. Behåll vikten.`,
    confidence: 0.9,
    setGoals: buildSetGoals(input.prescription, input.completedSets),
  };
}

function evaluateRpt(input: ProgressionInput): ProgressionDecision {
  const topTarget = input.prescription.find((set) => set.setRole === 'TOP') ?? input.prescription[0];
  const topSet = input.completedSets.find((set) => set.setRole === 'TOP') ?? input.completedSets[0];

  if (!topTarget || !topSet) {
    return {
      action: 'HOLD',
      nextPrescription: input.prescription,
      reason: 'Top set saknas; progressionen hålls oförändrad.',
      confidence: 0.55,
      setGoals: buildSetGoals(input.prescription, input.completedSets),
    };
  }

  const upper = topTarget.maximumReps ?? topTarget.targetReps ?? topTarget.minimumReps;
  const rpeOk = topTarget.targetRpe === undefined || topSet.rpe === undefined || topSet.rpe <= topTarget.targetRpe;

  if (topSet.reps >= upper && rpeOk && !isRecoverySuppressed(input.recovery)) {
    return {
      action: 'INCREASE',
      nextPrescription: increasePrescription(input.prescription, input.equipment),
      reason: 'RPT-toppsetet nådde övre repmålet inom tillåten RPE.',
      confidence: 0.95,
      setGoals: buildSetGoals(input.prescription, input.completedSets),
    };
  }

  const failures = input.previousFailures ?? 0;
  if (failures >= 2 && topSet.reps < topTarget.minimumReps) {
    return {
      action: isSystemicFatigue(input.recovery) ? 'DELOAD' : 'REDUCE',
      nextPrescription: reducePrescription(input.prescription, input.equipment),
      reason: isSystemicFatigue(input.recovery)
        ? 'Toppsetet har missats upprepade gånger under låg återhämtning; deload rekommenderas.'
        : 'Toppsetet har missats upprepade gånger; vikten sänks.',
      confidence: 0.85,
      setGoals: buildSetGoals(input.prescription, input.completedSets),
    };
  }

  return {
    action: 'HOLD',
    nextPrescription: input.prescription,
    reason: 'Behåll vikten tills toppsetet når övre repmålet med kontrollerad ansträngning.',
    confidence: 0.9,
    setGoals: buildSetGoals(input.prescription, input.completedSets),
  };
}

export function decideProgression(input: ProgressionInput): ProgressionDecision {
  if (isSystemicFatigue(input.recovery)) {
    return {
      action: 'DELOAD',
      nextPrescription: reducePrescription(input.prescription, input.equipment),
      reason: 'Låg återhämtning och flera samtidiga prestationsfall indikerar systemisk trötthet.',
      confidence: 0.9,
      setGoals: buildSetGoals(input.prescription, input.completedSets),
    };
  }

  switch (input.method) {
    case 'DOUBLE_PROGRESSION':
      return evaluateDoubleProgression(input);
    case 'REP_GOAL':
      return evaluateRepGoal(input);
    case 'RPT':
    case 'TOP_SET_BACKOFF':
      return evaluateRpt(input);
    case 'FIXED':
    case 'TRAINING_MAX':
    case 'MANUAL':
    default:
      return {
        action: 'HOLD',
        nextPrescription: input.prescription,
        reason: 'Progressionsmetoden kräver manuell eller programspecifik belastningsändring.',
        confidence: clamp(input.completedSets.length > 0 ? 0.75 : 0.5, 0, 1),
        setGoals: buildSetGoals(input.prescription, input.completedSets),
      };
  }
}
