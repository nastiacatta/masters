import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { generateMockForecastSeries, generateMockSummary } from '@/lib/mock-data';
import { mockExperiments } from '@/lib/mock-data';
import { metricLabel, WEIGHTING_COLORS } from '@/lib/formatters';
import ChartCard from '@/components/dashboard/ChartCard';

const DGP_OPTIONS = ['baseline', 'drift', 'regime_shift'] as const;
const SCENARIO_OPTIONS = ['honest', 'bursty', 'hedged', 'sybil'] as const;
const WEIGHTING_OPTIONS = ['uniform', 'deposit', 'skill', 'full'] as const;

export default function DashboardHome() {
  const [dgp, setDgp] = useState<typeof DGP_OPTIONS[number]>('baseline');
  const [scenario, setScenario] = useState<typeof SCENARIO_OPTIONS[number]>('honest');
  const [weighting, setWeighting] = useState<typeof WEIGHTING_OPTIONS[number]>('full');
  const [roundMax, setRoundMax] = useState(200);

  const forecastExperiment = mockExperiments.find((e) => e.name === 'forecast_aggregation');
  const summary = useMemo(
    () => (forecastExperiment ? generateMockSummary(forecastExperiment) : null),
    [forecastExperiment]
  );
  const forecastSeries = useMemo(
    () => generateMockForecastSeries(Math.min(roundMax, 200)),
    [roundMax]
  );

  const sampled =
    forecastSeries.length > 150
      ? forecastSeries.filter((_, i) => i % Math.ceil(forecastSeries.length / 150) === 0)
      : forecastSeries;

  const deltaCrps =
    summary && forecastSeries.length > 0
      ? (
          (forecastSeries[forecastSeries.length - 1].crpsUniformCum -
            forecastSeries[forecastSeries.length - 1].crpsMechanismCum) *
          100
        ).toFixed(2)
      : '—';
  const calibrationGap = summary ? '0.02' : '—';
  const finalGini = summary ? summary.finalGini?.toFixed(3) ?? '—' : '—';
  const meanActive = summary ? summary.meanNt?.toFixed(1) ?? '—' : '—';

  const keys = [
    'crpsUniformCum',
    'crpsDepositCum',
    'crpsSkillCum',
    'crpsMechanismCum',
  ] as const;

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">
          Adaptive skill and stake in forecast markets
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          This dashboard tests whether online skill updates improve aggregate forecast
          quality while keeping market concentration and participation stable.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">
            Does skill × stake beat uniform and static weighting?
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">
            Does it remain robust under intermittent and strategic behaviour?
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">
            Does better accuracy come at the cost of concentration?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Relative CRPS improvement
          </p>
          <p className="text-lg font-semibold text-slate-900 mt-0.5">
            {deltaCrps === '—' ? deltaCrps : `${deltaCrps}%`}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Δ vs uniform</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Calibration error
          </p>
          <p className="text-lg font-semibold text-slate-900 mt-0.5">{calibrationGap}</p>
          <p className="text-xs text-slate-500 mt-0.5">Gap from nominal</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Wealth concentration
          </p>
          <p className="text-lg font-semibold text-slate-900 mt-0.5">{finalGini}</p>
          <p className="text-xs text-slate-500 mt-0.5">Final Gini</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Effective active base
          </p>
          <p className="text-lg font-semibold text-slate-900 mt-0.5">{meanActive}</p>
          <p className="text-xs text-slate-500 mt-0.5">Mean N_t</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 py-2">
        <label className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">DGP</span>
          <select
            value={dgp}
            onChange={(e) => setDgp(e.target.value as typeof DGP_OPTIONS[number])}
            className="rounded border border-slate-200 px-2 py-1 text-xs"
          >
            {DGP_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">Scenario</span>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value as typeof SCENARIO_OPTIONS[number])}
            className="rounded border border-slate-200 px-2 py-1 text-xs"
          >
            {SCENARIO_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">Weighting rule</span>
          <select
            value={weighting}
            onChange={(e) => setWeighting(e.target.value as typeof WEIGHTING_OPTIONS[number])}
            className="rounded border border-slate-200 px-2 py-1 text-xs"
          >
            {WEIGHTING_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">Rounds</span>
          <input
            type="range"
            min={50}
            max={500}
            step={10}
            value={roundMax}
            onChange={(e) => setRoundMax(Number(e.target.value))}
            className="w-24 accent-blue-600"
          />
          <span className="text-xs text-slate-600 w-10">{roundMax}</span>
        </label>
      </div>

      <ChartCard
        title="Benchmark comparison"
        subtitle="Uniform vs deposit-only vs skill-only vs skill × stake. Lower CRPS is better."
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sampled} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="t"
              tick={{ fontSize: 10 }}
              stroke="#94a3b8"
              label={{ value: 'Round', position: 'insideBottom', offset: -2, fontSize: 10 }}
            />
            <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
              formatter={(value: unknown, name: unknown) => [
                typeof value === 'number' ? value.toFixed(5) : String(value ?? ''),
                metricLabel(String(name ?? '')),
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} formatter={(v: string) => metricLabel(v)} />
            {keys.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={WEIGHTING_COLORS[key]}
                strokeWidth={key.includes('Mechanism') ? 2.5 : 1.2}
                dot={false}
                strokeOpacity={key.includes('Mechanism') ? 1 : 0.6}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
