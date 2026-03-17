import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import PageHeader from '@/components/dashboard/PageHeader';
import StepCard from '@/components/dashboard/StepCard';
import CoreSubComponents from '@/components/dashboard/CoreSubComponents';
import ChartCard from '@/components/dashboard/ChartCard';
import ExperimentsTabBar from '@/components/dashboard/ExperimentsTabBar';
import { runPipeline, type PipelineResult } from '@/lib/coreMechanism/runPipeline';
import { DGP_OPTIONS, type DGPId } from '@/lib/coreMechanism/dgpSimulator';
import { PRESET_META, type BehaviourPresetId } from '@/lib/behaviour/scenarioSimulator';
import type { WeightingMode } from '@/lib/coreMechanism/runRound';
import { fmtNum } from '@/lib/formatters';

const WEIGHTING_OPTIONS: { id: WeightingMode; label: string }[] = [
  { id: 'uniform', label: 'Uniform' },
  { id: 'deposit', label: 'Deposit only' },
  { id: 'skill', label: 'Skill only' },
  { id: 'full', label: 'Skill × stake' },
];

export default function PipelineStepper() {
  const [rounds, setRounds] = useState(10000);
  const [n, setN] = useState(6);
  const [seed, setSeed] = useState(42);
  const [dgpId, setDgpId] = useState<DGPId>('baseline');
  const [weighting, setWeighting] = useState<WeightingMode>('full');
  const [behaviourPreset, setBehaviourPreset] = useState<BehaviourPresetId>('baseline');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);

  const selectedDGP = DGP_OPTIONS.find((d) => d.id === dgpId);
  const selectedBehaviour = PRESET_META[behaviourPreset];

  const handleRun = useCallback(() => {
    setRunning(true);
    setResult(null);
    try {
      const res = runPipeline({
        dgpId,
        weighting,
        behaviourPreset,
        rounds,
        seed,
        n,
      });
      setResult(res);
    } finally {
      setRunning(false);
    }
  }, [dgpId, weighting, behaviourPreset, rounds, seed, n]);

  const chartData = result?.rounds.map((r, i) => ({
    round: i + 1,
    error: r.error,
    participation: r.participation,
    nEff: r.nEff,
  })) ?? [];

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <ExperimentsTabBar activeTab="pipeline" className="mb-4" />
      <PageHeader
        hero
        title="Time-step pipeline"
        subtitle="Step-by-step flow: Inputs → DGP / private signal → Behaviour policy → Core mechanism → Results. Choose components at each step to explore the thesis mechanism."
        question="Can adaptive skill updates improve aggregate forecasts without letting wealthy or strategic agents dominate?"
        controls={
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/experiments"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              View experiments →
            </Link>
          </div>
        }
      />

      <div className="space-y-6">
        <StepCard
          stepNumber={1}
          title="Inputs"
          description="Simulation parameters"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <label className="block">
              <span className="text-xs text-slate-500">Rounds</span>
              <input
                type="number"
                min={100}
                max={10000}
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Agents (n)</span>
              <input
                type="number"
                min={2}
                max={20}
                value={n}
                onChange={(e) => setN(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs text-slate-500">Seed</span>
              <input
                type="number"
                min={0}
                value={seed}
                onChange={(e) => setSeed(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              />
            </label>
          </div>
        </StepCard>

        <StepCard
          stepNumber={2}
          title="DGP (Data Generating Process)"
          description="How truth and signals are generated"
        >
          <label className="block">
            <select
              value={dgpId}
              onChange={(e) => setDgpId(e.target.value as DGPId)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {DGP_OPTIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
            {selectedDGP && (
              <p className="text-xs text-slate-500 mt-1">{selectedDGP.description}</p>
            )}
          </label>
          <Link to="/dgp" className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-700">
            View DGP details →
          </Link>
        </StepCard>

        <StepCard
          stepNumber={3}
          title="Core (Lambert / RAJA mechanism)"
          description="Scoring, effective wager, aggregation, settlement, skill update"
          expandable={<CoreSubComponents />}
        >
          <label className="block">
            <span className="text-xs text-slate-500">Weighting rule</span>
            <select
              value={weighting}
              onChange={(e) => setWeighting(e.target.value as WeightingMode)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {WEIGHTING_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              How reports are combined: uniform, deposit-only, skill-only, or full skill × stake.
            </p>
          </label>
          <Link to="/core" className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-700">
            View Core details →
          </Link>
        </StepCard>

        <StepCard
          stepNumber={4}
          title="Behaviour"
          description="Participation, reporting, deposit, missingness, adversarial"
        >
          <label className="block">
            <span className="text-xs text-slate-500">Behaviour preset</span>
            <select
              value={behaviourPreset}
              onChange={(e) => setBehaviourPreset(e.target.value as BehaviourPresetId)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {(Object.keys(PRESET_META) as BehaviourPresetId[]).map((p) => (
                <option key={p} value={p}>
                  {PRESET_META[p].label}
                </option>
              ))}
            </select>
            {selectedBehaviour && (
              <p className="text-xs text-slate-500 mt-1">{selectedBehaviour.description}</p>
            )}
          </label>
          <Link to="/behaviours" className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-700">
            View Behaviour families →
          </Link>
        </StepCard>

        <StepCard
          stepNumber={5}
          title="Results"
          description="Run the pipeline and inspect outputs"
        >
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRun}
              disabled={running}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {running ? 'Running…' : 'Run pipeline'}
            </button>
            <p className="text-xs text-slate-500">
              Uses {selectedDGP?.label ?? dgpId}, {WEIGHTING_OPTIONS.find((o) => o.id === weighting)?.label ?? weighting}, {selectedBehaviour?.label ?? behaviourPreset}.
            </p>
          </div>

          {result && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Mean |y − r̂|</p>
                  <p className="text-lg font-semibold text-slate-800">{fmtNum(result.summary.meanError, 4)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Rounds</p>
                  <p className="text-lg font-semibold text-slate-800">{result.summary.finalRounds}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Mean participation</p>
                  <p className="text-lg font-semibold text-slate-800">{fmtNum(result.summary.meanParticipation, 2)}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Final Gini</p>
                  <p className="text-lg font-semibold text-slate-800">{fmtNum(result.summary.finalGini, 3)}</p>
                </div>
              </div>
              {chartData.length > 0 && (
                <ChartCard title="Round-by-round error" subtitle="|y − r̂| per round">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="round" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v) => (typeof v === 'number' ? fmtNum(v, 4) : String(v))} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="error" name="Error" stroke="#2563eb" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}
            </div>
          )}
        </StepCard>

        <StepCard
          stepNumber={6}
          title="Experiments"
          description="Pre-run experiments with CSV data"
        >
          <p className="text-sm text-slate-600">
            Explore validation, calibration, behaviour matrix, and other experiments.
          </p>
          <Link
            to="/experiments"
            className="mt-2 inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Open experiments →
          </Link>
        </StepCard>
      </div>
    </div>
  );
}
