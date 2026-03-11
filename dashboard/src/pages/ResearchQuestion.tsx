import { useState, useMemo, useCallback, useEffect } from 'react';
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
import { runPipeline, type PipelineResult } from '@/lib/coreMechanism/runPipeline';
import { DGP_OPTIONS, type DGPId } from '@/lib/coreMechanism/dgpSimulator';
import { PRESET_META, type BehaviourPresetId } from '@/lib/behaviour/scenarioSimulator';
import type { WeightingMode } from '@/lib/coreMechanism/runRound';
import PageHeader from '@/components/dashboard/PageHeader';
import MetricCard from '@/components/dashboard/MetricCard';
import ChartCard from '@/components/dashboard/ChartCard';
import { fmtNum } from '@/lib/formatters';

const WEIGHTING_OPTIONS: { id: WeightingMode; label: string }[] = [
  { id: 'uniform', label: 'Uniform' },
  { id: 'deposit', label: 'Deposit only' },
  { id: 'skill', label: 'Skill only' },
  { id: 'full', label: 'Skill × stake' },
];

const WEIGHTING_ORDER: WeightingMode[] = ['uniform', 'deposit', 'skill', 'full'];
const CHART_COLORS: Record<WeightingMode, string> = {
  uniform: '#94a3b8',
  deposit: '#0d9488',
  skill: '#8b5cf6',
  full: '#2563eb',
};

export default function ResearchQuestion() {
  const [dgpId, setDgpId] = useState<DGPId>('baseline');
  const [scenario, setScenario] = useState<BehaviourPresetId>('baseline');
  const [rounds, setRounds] = useState(10000);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Record<WeightingMode, PipelineResult | null>>({
    uniform: null,
    deposit: null,
    skill: null,
    full: null,
  });

  const runBenchmark = useCallback(() => {
    setRunning(true);
    setResults({ uniform: null, deposit: null, skill: null, full: null });
    const opts = { dgpId, behaviourPreset: scenario, rounds, seed: 42, n: 6 };
    const next: Record<WeightingMode, PipelineResult | null> = {
      uniform: runPipeline({ ...opts, weighting: 'uniform' }),
      deposit: runPipeline({ ...opts, weighting: 'deposit' }),
      skill: runPipeline({ ...opts, weighting: 'skill' }),
      full: runPipeline({ ...opts, weighting: 'full' }),
    };
    setResults(next);
    setRunning(false);
  }, [dgpId, scenario, rounds]);

  useEffect(() => {
    runBenchmark();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- run once on mount

  const chartData = useMemo(() => {
    const full = results.full;
    if (!full?.rounds.length) return [];
    return full.rounds.map((_, i) => {
      const point: Record<string, number | string> = { round: i + 1 };
      WEIGHTING_ORDER.forEach((w) => {
        const r = results[w];
        if (r?.rounds[i]) point[w] = r.rounds[i].error;
      });
      return point;
    });
  }, [results]);

  const uniformMean = results.uniform?.summary.meanError ?? null;
  const fullMean = results.full?.summary.meanError ?? null;
  const deltaCrps = uniformMean != null && fullMean != null ? uniformMean - fullMean : null;
  const fullGini = results.full?.summary.finalGini ?? null;
  const meanParticipation = results.full?.summary.meanParticipation ?? null;

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <PageHeader
        hero
        title="Adaptive skill and stake in forecast markets"
        subtitle="This dashboard tests whether online skill updates improve aggregate forecast quality while keeping market concentration and participation stable."
        question="Can adaptive skill updates improve aggregate forecasts without letting wealthy or strategic agents dominate?"
        controls={
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2">
              <span className="text-xs text-slate-500">DGP</span>
              <select
                value={dgpId}
                onChange={(e) => setDgpId(e.target.value as DGPId)}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              >
                {DGP_OPTIONS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Scenario</span>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value as BehaviourPresetId)}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              >
                {(Object.keys(PRESET_META) as BehaviourPresetId[]).map((p) => (
                  <option key={p} value={p}>
                    {PRESET_META[p].label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Rounds</span>
              <input
                type="range"
                min={500}
                max={10000}
                step={500}
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                className="w-24 accent-blue-600"
              />
              <span className="text-xs text-slate-600 tabular-nums">{rounds}</span>
            </label>
            <button
              type="button"
              onClick={runBenchmark}
              disabled={running}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {running ? 'Running…' : 'Run comparison'}
            </button>
          </div>
        }
      />

      <section aria-labelledby="question-cards">
        <h2 id="question-cards" className="sr-only">
          Research questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            Does the full mechanism beat uniform and static weighting?
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            Does it remain robust under intermittent and strategic behaviour?
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            Does better accuracy come at the cost of concentration?
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Relative CRPS improvement"
          value={deltaCrps != null ? (deltaCrps >= 0 ? fmtNum(deltaCrps, 4) : `−${fmtNum(-deltaCrps, 4)}`) : '—'}
          subtitle="Δ vs uniform (positive = better)"
          accent={deltaCrps != null && deltaCrps > 0}
        />
        <MetricCard
          label="Calibration error"
          value="—"
          subtitle="Placeholder (not in pipeline yet)"
        />
        <MetricCard
          label="Wealth concentration"
          value={fullGini != null ? fmtNum(fullGini, 3) : '—'}
          subtitle="Final Gini"
        />
        <MetricCard
          label="Effective active base"
          value={meanParticipation != null ? fmtNum(meanParticipation, 2) : '—'}
          subtitle="Mean active per round"
        />
      </section>

      <ChartCard
        title="Benchmark: forecast error by weighting"
        subtitle="Uniform vs deposit-only vs skill-only vs skill × stake. Lower is better."
      >
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
            Run comparison to see the chart.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="round" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => (typeof v === 'number' ? fmtNum(v, 4) : String(v))} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {WEIGHTING_ORDER.map((w) => (
                <Line
                  key={w}
                  type="monotone"
                  dataKey={w}
                  name={WEIGHTING_OPTIONS.find((o) => o.id === w)?.label ?? w}
                  stroke={CHART_COLORS[w]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <p className="text-sm text-slate-600 max-w-2xl">
        Success is judged by CRPS or calibration on the prediction side, and by concentration and participation stability on the market side. Explore the <Link to="/mechanism" className="text-blue-600 hover:underline">mechanism</Link> and <Link to="/experiments" className="text-blue-600 hover:underline">experiments</Link> for details.
      </p>
    </div>
  );
}
