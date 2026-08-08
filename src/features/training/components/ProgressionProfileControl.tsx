'use client';

import {
  getProgressionProfileAction,
  setProgressionProfileAction,
  type ProgressionProfile,
} from '@/actions/training/progressionDecision';
import { getDefaultEquipmentConstraints } from '@/services/training/progressionDefaults';
import type { ProgressionMethod } from '@/services/training/progressionEngine';
import type { Exercise } from '@/types';
import { Settings2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const METHODS: Array<{ value: ProgressionMethod; label: string }> = [
  { value: 'DOUBLE_PROGRESSION', label: 'Dubbel progression' },
  { value: 'REP_GOAL', label: 'Rep goal' },
  { value: 'RPT', label: 'RPT' },
  { value: 'TOP_SET_BACKOFF', label: 'Top set + backoff' },
  { value: 'TRAINING_MAX', label: 'Training max' },
  { value: 'FIXED', label: 'Fast' },
  { value: 'MANUAL', label: 'Manuell' },
];

interface ProgressionProfileControlProps {
  exercise: Pick<Exercise, 'id' | 'name'>;
}

function parseLoads(value: string): number[] | undefined {
  const loads = value
    .split(/[;,]/)
    .map((part) => Number.parseFloat(part.trim()))
    .filter((value) => Number.isFinite(value) && value >= 0);
  return loads.length ? Array.from(new Set(loads)).sort((a, b) => a - b) : undefined;
}

export function ProgressionProfileControl({ exercise }: ProgressionProfileControlProps) {
  const automaticIncrement = useMemo(
    () => getDefaultEquipmentConstraints(exercise).minimumIncrement,
    [exercise]
  );
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<ProgressionProfile>({
    method: 'DOUBLE_PROGRESSION',
    useRecovery: true,
  });
  const [customIncrement, setCustomIncrement] = useState(false);
  const [showCustomIncrementInput, setShowCustomIncrementInput] = useState(false);
  const [loadsText, setLoadsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProgressionProfileAction(exercise.id)
      .then((saved) => {
        if (cancelled || !saved) return;
        setProfile(saved);
        const hasCustom = saved.minimumIncrement !== undefined;
        setCustomIncrement(hasCustom);
        setShowCustomIncrementInput(
          hasCustom && ![1.25, 2.5, 5].includes(saved.minimumIncrement as number)
        );
        setLoadsText(saved.availableLoads?.join(', ') ?? '');
      })
      .catch((error) => console.error('Failed to load progression profile:', error));
    return () => {
      cancelled = true;
    };
  }, [exercise.id]);

  const effectiveIncrement = customIncrement ? profile.minimumIncrement ?? automaticIncrement : automaticIncrement;

  const save = async () => {
    setSaving(true);
    setStatus(null);
    const availableLoads = parseLoads(loadsText);
    const next: ProgressionProfile = {
      method: profile.method,
      useRecovery: profile.useRecovery,
      minimumIncrement: customIncrement ? effectiveIncrement : undefined,
      availableLoads,
    };
    const result = await setProgressionProfileAction(exercise.id, next);
    setSaving(false);
    if (result.success) {
      setProfile(result.profile);
      setStatus('Sparat');
    } else {
      setStatus('Kunde inte spara');
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="text-zinc-500 transition-colors hover:text-magma"
        title="Progressionsinställningar"
      >
        <Settings2 className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="absolute left-0 top-6 z-50 w-72 rounded-lg border border-white/10 bg-zinc-950 p-3 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-300">Progression</div>
              <div className="text-[10px] text-zinc-500">{exercise.name}</div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <label className="mb-3 block text-xs text-zinc-400">
            Metod
            <select
              value={profile.method}
              onChange={(event) =>
                setProfile((current) => ({ ...current, method: event.target.value as ProgressionMethod }))
              }
              className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white"
            >
              {METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </label>

          <div className="mb-3 rounded border border-white/10 bg-black/20 p-2">
            <div className="mb-2 text-xs text-zinc-400">Viktsteg</div>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => {
                  setCustomIncrement(false);
                  setShowCustomIncrementInput(false);
                }}
                className={`rounded px-2 py-1 text-[11px] ${!customIncrement ? 'bg-magma/20 text-magma' : 'bg-white/5 text-zinc-400'}`}
              >
                Auto {automaticIncrement} kg
              </button>
              {[1.25, 2.5, 5].map((increment) => (
                <button
                  key={increment}
                  type="button"
                  onClick={() => {
                    setCustomIncrement(true);
                    setShowCustomIncrementInput(false);
                    setProfile((current) => ({ ...current, minimumIncrement: increment }));
                  }}
                  className={`rounded px-2 py-1 text-[11px] ${customIncrement && !showCustomIncrementInput && effectiveIncrement === increment ? 'bg-magma/20 text-magma' : 'bg-white/5 text-zinc-400'}`}
                >
                  {increment} kg
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setCustomIncrement(true);
                  setShowCustomIncrementInput(true);
                  setProfile((current) => ({
                    ...current,
                    minimumIncrement: current.minimumIncrement ?? automaticIncrement,
                  }));
                }}
                className={`rounded px-2 py-1 text-[11px] ${showCustomIncrementInput ? 'bg-magma/20 text-magma' : 'bg-white/5 text-zinc-400'}`}
              >
                Annat
              </button>
            </div>
            {showCustomIncrementInput && (
              <input
                type="number"
                min="0.1"
                step="0.05"
                value={effectiveIncrement}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    minimumIncrement: Math.max(0.1, Number.parseFloat(event.target.value) || automaticIncrement),
                  }))
                }
                className="mt-2 w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-white"
              />
            )}
          </div>

          <label className="mb-3 block text-xs text-zinc-400">
            Tillgängliga vikter, valfritt
            <input
              value={loadsText}
              onChange={(event) => setLoadsText(event.target.value)}
              placeholder="t.ex. 70, 75, 80, 85"
              className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white"
            />
          </label>

          <label className="mb-3 flex items-center justify-between text-xs text-zinc-400">
            <span>Ta hänsyn till återhämtning</span>
            <input
              type="checkbox"
              checked={profile.useRecovery}
              onChange={(event) =>
                setProfile((current) => ({ ...current, useRecovery: event.target.checked }))
              }
            />
          </label>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500">{status}</span>
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="rounded bg-magma/20 px-3 py-1.5 text-xs text-magma disabled:opacity-50"
            >
              {saving ? 'Sparar…' : 'Spara'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
