import type {
  LiveForgeSession,
  NextSetRecommendation,
  SessionOutcome,
} from './domain';

export type SystemicCapacity = 'READY' | 'REDUCED' | 'RECOVERY' | 'UNKNOWN';
export type LocalCapacity = 'READY' | 'CAUTION' | 'AVOID' | 'UNKNOWN';

export interface SafetyContext {
  explicitStop?: boolean;
  systemicCapacity: SystemicCapacity;
  localCapacity: LocalCapacity;
  missedPreviousSession?: boolean;
}

export interface SafetyDecision {
  recommendation: NextSetRecommendation;
  outcome?: SessionOutcome;
  createsMakeUpDebt: false;
}

function finish(
  reason: 'EXPLICIT_STOP' | 'RECOVERY_CONSTRAINT',
  flag: string,
  outcome: SessionOutcome = 'QUIT_SMART',
): SafetyDecision {
  return {
    recommendation: {
      action: 'FINISH',
      reason,
      explanationKey:
        reason === 'EXPLICIT_STOP'
          ? 'liveForge.safety.explicitStop'
          : 'liveForge.safety.recoveryFirst',
      safetyFlags: [flag],
    },
    outcome,
    createsMakeUpDebt: false,
  };
}

export function applySafetyPolicy(
  session: LiveForgeSession,
  proposed: NextSetRecommendation,
  context: SafetyContext,
): SafetyDecision {
  if (
    context.explicitStop ||
    session.stopRequestedAt ||
    session.status === 'COMPLETED'
  ) {
    return finish('EXPLICIT_STOP', 'STOP_REQUESTED');
  }

  if (context.localCapacity === 'AVOID') {
    return finish('RECOVERY_CONSTRAINT', 'LOCAL_AVOID');
  }

  if (context.systemicCapacity === 'RECOVERY') {
    return finish('RECOVERY_CONSTRAINT', 'SYSTEMIC_RECOVERY');
  }

  if (
    context.systemicCapacity === 'REDUCED' &&
    proposed.action === 'INCREASE'
  ) {
    return {
      recommendation: {
        ...proposed,
        action: 'HOLD',
        reason: 'RECOVERY_CONSTRAINT',
        explanationKey: 'liveForge.safety.reducedHold',
        safetyFlags: [...proposed.safetyFlags, 'SYSTEMIC_REDUCED'],
      },
      createsMakeUpDebt: false,
    };
  }

  if (context.localCapacity === 'CAUTION' && proposed.action === 'INCREASE') {
    return {
      recommendation: {
        ...proposed,
        action: 'HOLD',
        reason: 'RECOVERY_CONSTRAINT',
        explanationKey: 'liveForge.safety.localCautionHold',
        safetyFlags: [...proposed.safetyFlags, 'LOCAL_CAUTION'],
      },
      createsMakeUpDebt: false,
    };
  }

  return {
    recommendation: proposed,
    createsMakeUpDebt: false,
  };
}
