'use client';

import {
  getProgressionProfileAction,
  setProgressionProfileAction,
  type ProgressionProfile,
} from '@/actions/training/progressionDecision';
import type { RepGoalExercise } from '@/features/strength/utils/repGoal';
import { getDefaultEquipmentConstraints } from '@/services/training/progressionDefaults';
import type { ProgressionMethod } from '@/services/training/progressionEngine';
import type { Exercise } from '@/types';
import { Settings2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const METHODS: Array<{ value: ProgressionMethod; label: string }> = [
  { value: 'DOUBLE_PROGRESSION', label: 'Dubbel progression' },
  { value: 'REP_GOAL', label: 'Rep goal' },
  { value: 'RPT', label: 'RPT' },
  { value: 'TOP_SET_BACKOFF', label: 'Top set + backoff' },
  { value: 'TRAINING_MAX', label: 'Training max' },
  { value: 'FIXED', label: 'Fast' },
  { value: 'MANUAL', label: 'Manuell' },
];

const PRESET_INCREMENTS = [1.25, 2.5, 5] as const;

type ProfileExercise = Pick<Exercise, 'id' | 'name'> & {
  prescription?: RepGoalExercise['prescription'];
};

interface ProgressionProfileControlProps {
  exercise: ProfileExercise;
}

interface EditorState {
  profile: ProgressionProfile;
  customIncrement: boolean;
  showCustomIncrementInput: boolean;
  loadsText: string;
}

function getDefaultMethod(exercise: ProfileExercise): ProgressionMethod {
  return exercise.prescription?.type === 'TOTAL_REPS' ? 'REP_GOAL' : 'DOUBLE_PROGRESSION';
}

function createDefaultProfile(method: ProgressionMethod): ProgressionProfile {
  return { method, useRecovery: true };
}

function createEditorState(
  saved: ProgressionProfile | null,
  defaultMethod: ProgressionMethod
): EditorState {
  const profile = saved ?? createDefaultProfile(defaultMethod);
  const customIncrement = profile.minimumIncrement !== undefined;
  const showCustomIncrementInput =
    customIncrement &&
    profile.minimumIncrement !== undefined &&
    !PRESET_INCREMENTS.includes(profile.minimumIncrement as (typeof PRESET_INCREMENTS)[number]);

  return {
    profile,
    customIncrement,
    showCustomIncrementInput,
    loadsText: profile.availableLoads?.join(', ') ?? '',
  };
}

function parseLoads(value: string): number[] | undefined {
  const loads = value
    .split(/[;,]/)
    .map((part) => Number.parseFloat(part.trim()))
    .filter((load) => Number.isFinite(load) && load >= 0);
  return loads.length ? Array.from(new Set(loads)).sort((a, b) => a - b) : undefined;
}

function MethodField({
  method,
  disabled,
  onChange,
}: {
  method: ProgressionMethod;
  disabled: boolean;
  onChange: (method: ProgressionMethod) => void;
}) {
  return (
    <label className="mb-3 block text-xs text-zinc-400">
      Metod
      <select
        value={method}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value as ProgressionMethod)}
        className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white disabled:opacity-50"
      >
        {METHODS.map((candidate) => (
          <option key={candidate.value} value={candidate.value}>
            {candidate.label}
          </option>
        ))}
      </select>
    </label>
  );
}

interface IncrementFieldProps {
  automaticIncrement: number;
  effectiveIncrement: number;
  customIncrement: boolean;
  showCustomIncrementInput: boolean;
  disabled: boolean;
  onAuto: () => void;
  onPreset: (increment: number) => void;
  onCustom: () => void;
  onCustomValue: (increment: number) => void;
}

function IncrementField({
  automaticIncrement,
  effectiveIncrement,
  customIncrement,
  showCustomIncrementInput,
  disabled,
  onAuto,
  onPreset,
  onCustom,
  onCustomValue,
}: IncrementFieldProps) {
  return (
    <div className="mb-3 rounded border border-white/10 bg-black/20 p-2">
      <div className="mb-2 text-xs text-zinc-400">Viktsteg</div>
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          disabled={disabled}
          onClick={onAuto}
          className={`rounded px-2 py-1 text-[11px] disabled:opacity-50 ${!customIncrement ? 'bg-magma/20 text-magma' : 'bg-white/5 text-zinc-400'}`}
        >
          Auto {automaticIncrement} kg
        </button>
        {PRESET_INCREMENTS.map((increment) => (
          <button
            key={increment}
            type="button"
            disabled={disabled}
            onClick={() => onPreset(increment)}
            className={`rounded px-2 py-1 text-[11px] disabled:opacity-50 ${customIncrement && !showCustomIncrementInput && effectiveIncrement === increment ? 'bg-magma/20 text-magma' : 'bg-white/5 text-zinc-400'}`}
          >
            {increment} kg
          </button>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={onCustom}
          className={`rounded px-2 py-1 text-[11px] disabled:opacity-50 ${showCustomIncrementInput ? 'bg-magma/20 text-magma' : 'bg-white/5 text-zinc-400'}`}
        >
          Annat
        </button>
      </div>
      {showCustomIncrementInput && (
        <input
          type="number"
          min="0.1"
          step="0.05"
          disabled={disabled}
          value={effectiveIncrement}
          onChange={(event) =>
            onCustomValue(Math.max(0.1, Number.parseFloat(event.target.value) || automaticIncrement))
          }
          className="mt-2 w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-xs text-white disabled:opacity-50"
        />
      )}
    </div>
  );
}

function LoadsField({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mb-3 block text-xs text-zinc-400">
      Tillgängliga vikter, valfritt
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="t.ex. 70, 75, 80, 85"
        className="mt-1 w-full rounded border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white disabled:opacity-50"
      />
    </label>
  );
}

function RecoveryField({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="mb-3 flex items-center justify-between text-xs text-zinc-400">
      <span>Ta hänsyn till återhämtning</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

export function ProgressionProfileControl({ exercise }: ProgressionProfileControlProps) {
  const defaultMethod = getDefaultMethod(exercise);
  const automaticIncrement = useMemo(
    () => getDefaultEquipmentConstraints(exercise).minimumIncrement,
    [exercise]
  );
  const [open, setOpen] = useState(false);
  const [editor, setEditor] = useState<EditorState>(() => createEditorState(null, defaultMethod));
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const profileLoadGeneration = useRef(0);

  useEffect(() => {
    const generation = profileLoadGeneration.current + 1;
    profileLoadGeneration.current = generation;
    const isCurrentLoad = () => profileLoadGeneration.current === generation;

    if (open) {
      setLoading(true);
      setLoaded(false);
      setStatus(null);

      getProgressionProfileAction(exercise.id)
        .then((saved) => {
          if (isCurrentLoad()) {
            setEditor(createEditorState(saved, defaultMethod));
            setLoaded(true);
          }
        })
        .catch((error) => {
          if (isCurrentLoad()) {
            console.error('Failed to load progression profile:', error);
            setStatus('Kunde inte läsa profil');
          }
        })
        .finally(() => {
          if (isCurrentLoad()) setLoading(false);
        });
    }
  }, [defaultMethod, exercise.id, open]);

  const effectiveIncrement = editor.customIncrement
    ? editor.profile.minimumIncrement ?? automaticIncrement
    : automaticIncrement;
  const editingDisabled = loading || !loaded || saving;

  const updateProfile = (updates: Partial<ProgressionProfile>) => {
    setEditor((current) => ({
      ...current,
      profile: { ...current.profile, ...updates },
    }));
  };

  const save = async () => {
    if (loaded && !saving) {
      setSaving(true);
      setStatus(null);
      const next: ProgressionProfile = {
        method: editor.profile.method,
        useRecovery: editor.profile.useRecovery,
        minimumIncrement: editor.customIncrement ? effectiveIncrement : undefined,
        availableLoads: parseLoads(editor.loadsText),
      };

      try {
        const result = await setProgressionProfileAction(exercise.id, next);
        if (result.success) {
          setEditor(createEditorState(result.profile, defaultMethod));
          setStatus('Sparat');
        } else {
          setStatus('Kunde inte spara');
        }
      } catch (error) {
        console.error('Failed to save progression profile:', error);
        setStatus('Kunde inte spara');
      } finally {
        setSaving(false);
      }
    }
  };

  const chooseAutomaticIncrement = () => {
    setEditor((current) => ({
      ...current,
      customIncrement: false,
      showCustomIncrementInput: false,
    }));
  };

  const choosePresetIncrement = (increment: number) => {
    setEditor((current) => ({
      ...current,
      customIncrement: true,
      showCustomIncrementInput: false,
      profile: { ...current.profile, minimumIncrement: increment },
    }));
  };

  const chooseCustomIncrement = () => {
    setEditor((current) => ({
      ...current,
      customIncrement: true,
      showCustomIncrementInput: true,
      profile: {
        ...current.profile,
        minimumIncrement: current.profile.minimumIncrement ?? automaticIncrement,
      },
    }));
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

          {loading && <div className="mb-3 text-xs text-zinc-500">Laddar profil…</div>}

          <MethodField
            method={editor.profile.method}
            disabled={editingDisabled}
            onChange={(method) => updateProfile({ method })}
          />

          <IncrementField
            automaticIncrement={automaticIncrement}
            effectiveIncrement={effectiveIncrement}
            customIncrement={editor.customIncrement}
            showCustomIncrementInput={editor.showCustomIncrementInput}
            disabled={editingDisabled}
            onAuto={chooseAutomaticIncrement}
            onPreset={choosePresetIncrement}
            onCustom={chooseCustomIncrement}
            onCustomValue={(minimumIncrement) => updateProfile({ minimumIncrement })}
          />

          <LoadsField
            value={editor.loadsText}
            disabled={editingDisabled}
            onChange={(loadsText) => setEditor((current) => ({ ...current, loadsText }))}
          />

          <RecoveryField
            checked={editor.profile.useRecovery}
            disabled={editingDisabled}
            onChange={(useRecovery) => updateProfile({ useRecovery })}
          />

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500">{status}</span>
            <button
              type="button"
              disabled={editingDisabled}
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
