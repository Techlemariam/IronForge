import type {
  EquipmentProfile,
  LiveForgeSession,
  NextSetRecommendation,
  SetPrescription,
  SetResult,
} from './domain';

export interface NextSetPolicy {
  clearIncreaseRpeMax: number;
  cautiousIncreaseRpeMax: number;
  holdRpeMax: number;
  finishRpeMin: number;
  defaultRepTarget: number;
}

export const DEFAULT_NEXT_SET_POLICY: NextSetPolicy = {
  clearIncreaseRpeMax: 5,
  cautiousIncreaseRpeMax: 7,
  holdRpeMax: 8,
  finishRpeMin: 9,
  defaultRepTarget: 10,
};

function nextAvailableLoad(
  equipment: EquipmentProfile,
  currentLoadKg: number,
): number | undefined {
  return equipment.availableLoadStepsKg
    .filter((load) => load > currentLoadKg)
    .sort((a, b) => a - b)[0];
}

function createPrescription(
  session: LiveForgeSession,
  loadKg: number,
  reps: number,
): SetPrescription {
  return {
    id: `${session.id}-set-${session.setHistory.length + 1}`,
    sequence: session.setHistory.length + 1,
    targetLoadKg: loadKg,
    targetReps: reps,
  };
}

export function resolveNextSet(
  session: LiveForgeSession,
  latestResult: SetResult | undefined,
  policy: NextSetPolicy = DEFAULT_NEXT_SET_POLICY,
): NextSetRecommendation {
  if (session.stopRequestedAt || session.status === 'COMPLETED') {
    return {
      action: 'FINISH',
      reason: 'EXPLICIT_STOP',
      explanationKey: 'liveForge.recommendation.explicitStop',
      safetyFlags: ['STOP_REQUESTED'],
    };
  }

  if (!latestResult) {
    const first = session.currentPrescription;
    return first
      ? {
          action: 'HOLD',
          prescription: first,
          reason: 'TARGET_MET',
          explanationKey: 'liveForge.recommendation.start',
          safetyFlags: [],
        }
      : {
          action: 'FINISH',
          reason: 'CHALLENGE_COMPLETE',
          explanationKey: 'liveForge.recommendation.complete',
          safetyFlags: [],
        };
  }

  const target = session.currentPrescription;
  const missedTarget = target ? latestResult.actualReps < target.targetReps : false;

  if (missedTarget) {
    return {
      action: 'HOLD',
      prescription: createPrescription(
        session,
        latestResult.actualLoadKg,
        latestResult.actualReps,
      ),
      reason: 'MISSED_REPS',
      explanationKey: 'liveForge.recommendation.missedReps',
      safetyFlags: ['NO_LOAD_INCREASE'],
    };
  }

  if ((latestResult.rpe ?? 0) >= policy.finishRpeMin) {
    return {
      action: 'FINISH',
      reason: 'HIGH_RPE',
      explanationKey: 'liveForge.recommendation.highRpeFinish',
      safetyFlags: ['HIGH_RPE'],
    };
  }

  if ((latestResult.rpe ?? 0) <= policy.cautiousIncreaseRpeMax) {
    const nextLoad = nextAvailableLoad(
      session.equipmentProfile,
      latestResult.actualLoadKg,
    );

    if (nextLoad !== undefined) {
      return {
        action: 'INCREASE',
        prescription: createPrescription(
          session,
          nextLoad,
          policy.defaultRepTarget,
        ),
        reason: 'LOW_RPE',
        explanationKey:
          (latestResult.rpe ?? 0) <= policy.clearIncreaseRpeMax
            ? 'liveForge.recommendation.clearIncrease'
            : 'liveForge.recommendation.cautiousIncrease',
        safetyFlags: [],
      };
    }
  }

  if ((latestResult.rpe ?? 0) <= policy.holdRpeMax) {
    return {
      action: 'HOLD',
      prescription: createPrescription(
        session,
        latestResult.actualLoadKg,
        policy.defaultRepTarget,
      ),
      reason: 'TARGET_MET',
      explanationKey: 'liveForge.recommendation.hold',
      safetyFlags: [],
    };
  }

  return {
    action: 'BACKOFF',
    prescription: createPrescription(
      session,
      session.equipmentProfile.availableLoadStepsKg
        .filter((load) => load < latestResult.actualLoadKg)
        .sort((a, b) => b - a)[0] ?? latestResult.actualLoadKg,
      policy.defaultRepTarget,
    ),
    reason: 'HIGH_RPE',
    explanationKey: 'liveForge.recommendation.backoff',
    safetyFlags: ['HIGH_RPE'],
  };
}
