import { useMemo, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '@/lib/store';
import ThesisHeader from '@/components/thesis/ThesisHeader';
import WalkthroughStepper from '@/components/thesis/WalkthroughStepper';
import StepDetailPanel from '@/components/thesis/StepDetailPanel';
import InputsStep from '@/components/thesis/steps/InputsStep';
import DGPStep from '@/components/thesis/steps/DGPStep';
import CoreStep from '@/components/thesis/steps/CoreStep';
import BehaviourStep from '@/components/thesis/steps/BehaviourStep';
import ResultsStep from '@/components/thesis/steps/ResultsStep';
import NextStateStep from '@/components/thesis/steps/NextStateStep';
import type { WalkthroughStepId } from '@/lib/thesis';
import { WALKTHROUGH_STEPS, WALKTHROUGH_STEP_LABELS } from '@/lib/thesis';
import {
  getDGPMetaFromExperiment,
  getInputsFromExperiment,
  getResultFromRoundRecords,
  getNextStateFromRoundRecords,
} from '@/lib/walkthroughSelectors';
import { loadSkillWagerData } from '@/lib/adapters';
import type { SkillWagerPoint } from '@/lib/types';
import { PRESET_META, type BehaviourPresetId } from '@/lib/behaviour/scenarioSimulator';
import { fmtNum } from '@/lib/formatters';

const STEP_DETAIL: Record<
  WalkthroughStepId,
  { formula?: string; interpretation?: string }
> = {
  inputs: {
    interpretation: 'Everything that enters round t: task, agents, reports, wagers, and state from t−1.',
  },
  dgp: {
    formula: 'y_t \\sim \\text{DGP};\\; \\text{signals} \\rightarrow r_i',
    interpretation: 'The data generating process fixes how the outcome and agent signals are produced. Non-stationarity and correlation enter here.',
  },
  behaviour: {
    interpretation: 'How agents choose participation, reports, and deposits. Acts on private signals to produce actions (a_i, r_i, b_i) before the core mechanism runs.',
  },
  core: {
    formula: 'm_i = b_i \\cdot g(\\sigma_i),\\; \\hat{r} = \\sum \\hat{m}_i r_i,\\; \\sigma_{t+1} = f(L_t)',
    interpretation: 'Deterministic mechanism applied to the submitted actions: effective wager, aggregation, settlement, skill update.',
  },
  results: {
    formula: '\\hat{r}_t,\\; y_t,\\; \\pi_i,\\; \\Delta W_i,\\; \\Delta\\sigma_i',
    interpretation: 'Round outputs: aggregate forecast, outcome, payoffs, wealth and skill changes. Diagnostics: N_eff, Gini, calibration.',
  },
  next_state: {
    formula: 'W_{i,t+1},\\; \\sigma_{i,t+1},\\; \\text{eligibility}',
    interpretation: 'State carried to t+1. The mechanism is Markovian in this state.',
  },
};

export default function Walkthrough() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { experiments, selectedExperiment, setSelectedExperiment } = useStore();
  const stepParam = searchParams.get('step') as WalkthroughStepId | null;
  const currentStep: WalkthroughStepId = stepParam && WALKTHROUGH_STEPS.includes(stepParam)
    ? stepParam
    : 'inputs';
  const roundParam = searchParams.get('round');
  const roundIndex = roundParam != null ? Math.max(0, parseInt(roundParam, 10)) : 0;
  const scenarioParam = searchParams.get('scenario') as BehaviourPresetId | null;

  const [roundRecords, setRoundRecords] = useState<SkillWagerPoint[] | null>(null);
  const outcome: number | undefined = undefined;

  useEffect(() => {
    if (!selectedExperiment) return;
    loadSkillWagerData(selectedExperiment).then((data) => {
      setRoundRecords(data.length ? data : null);
    });
  }, [selectedExperiment]);

  const maxRound = useMemo(() => {
    if (!roundRecords?.length) return 0;
    return Math.max(...roundRecords.map((r) => r.t));
  }, [roundRecords]);

  const safeRoundIndex = Math.min(roundIndex, maxRound);

  const dgpMeta = useMemo(
    () => getDGPMetaFromExperiment(selectedExperiment),
    [selectedExperiment]
  );
  const inputs = useMemo(
    () =>
      selectedExperiment
        ? getInputsFromExperiment(selectedExperiment, safeRoundIndex, roundRecords)
        : null,
    [selectedExperiment, safeRoundIndex, roundRecords]
  );
  const result = useMemo(
    () => getResultFromRoundRecords(safeRoundIndex, roundRecords, outcome),
    [safeRoundIndex, roundRecords, outcome]
  );
  const nextState = useMemo(
    () => getNextStateFromRoundRecords(safeRoundIndex, roundRecords),
    [safeRoundIndex, roundRecords]
  );

  const scenarioLabel = scenarioParam && PRESET_META[scenarioParam]
    ? PRESET_META[scenarioParam].label
    : scenarioParam ?? undefined;

  const getStepUrl = (step: WalkthroughStepId) => {
    const p = new URLSearchParams(searchParams);
    p.set('step', step);
    return `/walkthrough?${p.toString()}`;
  };

  const summaryMetrics = useMemo(() => {
    if (!roundRecords?.length || !selectedExperiment) return null;
    const atT = roundRecords.filter((r) => r.t === safeRoundIndex);
    const nEff = atT.length;
    const gini = (() => {
      const w = atT.map((r) => r.cumProfit).filter((x) => x >= 0);
      if (w.length === 0) return 0;
      const sorted = [...w].sort((a, b) => a - b);
      const total = sorted.reduce((a, b) => a + b, 0);
      if (total <= 0) return 0;
      let sum = 0;
      sorted.forEach((x, i) => {
        sum += (i + 1) * x;
      });
      return (2 * sum - (sorted.length + 1) * total) / (sorted.length * total);
    })();
    return { nEff, gini, round: safeRoundIndex + 1, totalRounds: maxRound + 1 };
  }, [roundRecords, selectedExperiment, safeRoundIndex, maxRound]);

  return (
    <div className="flex flex-col h-full">
      <ThesisHeader
        experimentBadge={selectedExperiment?.displayName}
        scenarioBadge={scenarioLabel}
        controls={
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-slate-500">
              Experiment
              <select
                value={selectedExperiment?.name ?? ''}
                onChange={(e) => {
                  const exp = experiments.find((x) => x.name === e.target.value) ?? null;
                  setSelectedExperiment(exp);
                  setSearchParams((p) => {
                    const next = new URLSearchParams(p);
                    if (exp) next.set('experiment', exp.name);
                    return next;
                  });
                }}
                className="ml-1.5 rounded border border-slate-200 px-2 py-1 text-sm"
              >
                {experiments.map((exp) => (
                  <option key={exp.name} value={exp.name}>
                    {exp.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-slate-500">
              Scenario
              <select
                value={scenarioParam ?? 'baseline'}
                onChange={(e) => {
                  const id = e.target.value as BehaviourPresetId;
                  setSearchParams((p) => {
                    const next = new URLSearchParams(p);
                    next.set('scenario', id);
                    return next;
                  });
                }}
                className="ml-1.5 rounded border border-slate-200 px-2 py-1 text-sm"
              >
                {(Object.keys(PRESET_META) as BehaviourPresetId[]).map((id) => (
                  <option key={id} value={id}>
                    {PRESET_META[id].label}
                  </option>
                ))}
              </select>
            </label>
            {maxRound >= 0 && (
              <label className="text-xs text-slate-500 flex items-center gap-1">
                Round
                <input
                  type="range"
                  min={0}
                  max={maxRound}
                  value={safeRoundIndex}
                  onChange={(e) => {
                    const r = parseInt(e.target.value, 10);
                    setSearchParams((p) => {
                      const next = new URLSearchParams(p);
                      next.set('round', String(r));
                      return next;
                    });
                  }}
                  className="w-24 accent-blue-600"
                />
                <span className="tabular-nums">{safeRoundIndex + 1}</span> / {maxRound + 1}
              </label>
            )}
          </div>
        }
      />

      <WalkthroughStepper currentStep={currentStep} getStepUrl={getStepUrl} />

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto p-4">
          {currentStep === 'inputs' && (
            <InputsStep
              inputs={inputs}
              experimentName={selectedExperiment?.displayName}
              scenarioLabel={scenarioLabel}
            />
          )}
          {currentStep === 'dgp' && <DGPStep dgpMeta={dgpMeta} />}
          {currentStep === 'core' && <CoreStep />}
          {currentStep === 'behaviour' && (
            <BehaviourStep behaviourPresetId={scenarioParam ?? 'baseline'} />
          )}
          {currentStep === 'results' && <ResultsStep result={result} />}
          {currentStep === 'next_state' && <NextStateStep nextState={nextState} />}
        </div>
        <StepDetailPanel
          title={WALKTHROUGH_STEP_LABELS[currentStep]}
          formula={STEP_DETAIL[currentStep].formula}
          interpretation={STEP_DETAIL[currentStep].interpretation}
        />
      </div>

      {summaryMetrics && (
        <div className="border-t border-slate-200 bg-white px-4 py-2 flex flex-wrap gap-4 text-xs">
          <span className="text-slate-500">
            Round <strong className="text-slate-700">{summaryMetrics.round}</strong> / {summaryMetrics.totalRounds}
          </span>
          <span className="text-slate-500">
            N_eff <strong className="text-slate-700">{fmtNum(summaryMetrics.nEff, 2)}</strong>
          </span>
          <span className="text-slate-500">
            Gini <strong className="text-slate-700">{fmtNum(summaryMetrics.gini, 3)}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
