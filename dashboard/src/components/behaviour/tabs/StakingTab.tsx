import { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
  ReferenceArea,
} from 'recharts';
import type { PipelineResult } from '@/lib/coreMechanism/runPipeline';
import ChartCard from '@/components/dashboard/ChartCard';
import MetricDisplay from '@/components/dashboard/MetricDisplay';
import {
  CHART_MARGIN_LABELED, GRID_PROPS, AXIS_TICK, AXIS_STROKE,
  downsample,
} from '@/components/lab/shared';
import { SmartTooltip } from '@/components/dashboard/SmartTooltip';
import { useChartZoom } from '@/hooks/useChartZoom';
import ZoomBadge from '@/components/charts/ZoomBadge';
import { compare } from '@/hooks/useBehaviourSimulations';
import { SEED, N, T, VERDICT_VARIANT, PLACEHOLDER_DESCRIPTIONS, cumulativeAverage } from '@/lib/behaviour/helpers';

function PlaceholderBanner({ description }: { family: string; description: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-4">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-slate-400" />
        <span className="text-sm font-semibold text-slate-700">
          In-browser simulation
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        {description} Results are from a lightweight in-browser simulation (seed={SEED}, N={N}, T={T}).
      </p>
    </div>
  );
}

export default function StakingTab({ budgetConstrained, houseMoney, kellySizer, baseline }: {
  budgetConstrained: PipelineResult; houseMoney: PipelineResult;
  kellySizer: PipelineResult; baseline: PipelineResult;
}) {
  const cumZoom = useChartZoom();
  const depositZoom = useChartZoom();

  const budgetDelta = compare(budgetConstrained, baseline);
  const houseDelta = compare(houseMoney, baseline);
  const kellyDelta = compare(kellySizer, baseline);

  // Ruin count: agents with final wealth < 0.1
  const ruinCount = budgetConstrained.finalState.filter(a => a.wealth < 0.1).length;

  // Cumulative error: budget-constrained vs baseline
  const cumData = useMemo(() => cumulativeAverage({
    baseline: baseline.rounds,
    constrained: budgetConstrained.rounds,
  }), [baseline.rounds, budgetConstrained.rounds]);

  // Deposit-as-fraction comparison: kelly vs baseline (agent 0)
  const depositCompare = useMemo(() => {
    const len = Math.min(baseline.rounds.length, kellySizer.rounds.length);
    return downsample(Array.from({ length: len }, (_, i) => ({
      round: i + 1,
      baseline: baseline.rounds[i].totalDeposited / Math.max(1, baseline.rounds[i].participation),
      kelly: kellySizer.rounds[i].totalDeposited / Math.max(1, kellySizer.rounds[i].participation),
    })), 300);
  }, [baseline.rounds, kellySizer.rounds]);

  // Deposit policy bar chart data
  const depositPolicies = [
    { name: 'Baseline', crps: baseline.summary.meanError, gini: baseline.summary.finalGini, color: '#94a3b8' },
    { name: 'Budget-constrained', crps: budgetConstrained.summary.meanError, gini: budgetConstrained.summary.finalGini, color: '#14b8a6' },
    { name: 'House-money', crps: houseMoney.summary.meanError, gini: houseMoney.summary.finalGini, color: '#0d9488' },
    { name: 'Kelly sizer', crps: kellySizer.summary.meanError, gini: kellySizer.summary.finalGini, color: '#059669' },
  ];

  return (
    <div className="space-y-6">
      <PlaceholderBanner family="Staking" description={PLACEHOLDER_DESCRIPTIONS.Staking} />
      <p className="text-sm text-slate-600">
        How much agents wager determines their influence on the aggregate. Budget constraints
        can cause ruin (agents forced out), the house-money effect increases risk-taking after
        gains, and Kelly-like sizing ties deposits to estimated edge.
      </p>
      <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-700">How the effective wager works</div>
        <p>Each agent's deposit is scaled by a skill gate: <strong>effective wager = deposit × skill factor</strong>.</p>
        <p>The skill factor ranges from λ (minimum, for unskilled agents) to 1 (maximum, for the best).</p>
        <p>This means unskilled agents risk less of their deposit, reducing their influence on the aggregate.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricDisplay label="Ruin events?" value={ruinCount > 0 ? `${ruinCount} agents` : 'None'}
          detail={`Agents with wealth < 0.1 at end`}
          variant={VERDICT_VARIANT[ruinCount > 0 ? 'bad' : 'good']} />
        <MetricDisplay label="House-money hurts?" value={Math.abs(houseDelta.deltaPct) < 5 ? 'Minimal' : 'Yes'}
          detail={`Error ${houseDelta.deltaPct >= 0 ? '+' : ''}${houseDelta.deltaPct.toFixed(1)}% vs baseline`}
          variant={VERDICT_VARIANT[Math.abs(houseDelta.deltaPct) < 5 ? 'good' : 'bad']} />
        <MetricDisplay label="Kelly improves?" value={kellyDelta.deltaPct < -1 ? 'Yes' : 'Minimal'}
          detail={`Error ${kellyDelta.deltaPct >= 0 ? '+' : ''}${kellyDelta.deltaPct.toFixed(1)}% vs baseline`}
          variant={VERDICT_VARIANT[kellyDelta.deltaPct < -1 ? 'good' : 'neutral']} />
        <MetricDisplay label="Budget Δ CRPS" value={`${budgetDelta.deltaPct >= 0 ? '+' : ''}${budgetDelta.deltaPct.toFixed(1)}%`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Cumulative error: budget-constrained vs baseline" subtitle="Ruin removes agents from the pool, potentially degrading the aggregate. Drag to zoom." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={cumData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
              onMouseDown={cumZoom.onMouseDown} onMouseMove={cumZoom.onMouseMove} onMouseUp={cumZoom.onMouseUp}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[cumZoom.state.left, cumZoom.state.right]} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                label={{ value: 'Cumulative CRPS', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="constrained" name="Budget-constrained" stroke="#14b8a6" strokeWidth={2} dot={false} />
              {cumZoom.state.refLeft && cumZoom.state.refRight && (
                <ReferenceArea x1={cumZoom.state.refLeft} x2={cumZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Avg deposit per agent: Kelly vs baseline</h3>
            <ZoomBadge isZoomed={depositZoom.state.isZoomed} onReset={depositZoom.reset} />
          </div>
          <p className="text-xs text-slate-500 mb-2">Kelly sizing ties deposit to σ·(1−σ), producing adaptive stake sizes.</p>
          <div className="cursor-crosshair">
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={depositCompare} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
                onMouseDown={depositZoom.onMouseDown} onMouseMove={depositZoom.onMouseMove} onMouseUp={depositZoom.onMouseUp}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[depositZoom.state.left, depositZoom.state.right]} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                  label={{ value: 'Avg deposit', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<SmartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="kelly" name="Kelly sizer" stroke="#059669" strokeWidth={2} dot={false} />
                {depositZoom.state.refLeft && depositZoom.state.refRight && (
                  <ReferenceArea x1={depositZoom.state.refLeft} x2={depositZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Deposit policy comparison bar chart */}
      <ChartCard title="Deposit policy comparison" subtitle="Mean CRPS across staking strategies. Lower is better." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={depositPolicies} margin={{ ...CHART_MARGIN_LABELED, bottom: 32 }}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="name" tick={{ ...AXIS_TICK, fontSize: 11 }} stroke={AXIS_STROKE} angle={-15} textAnchor="end" />
            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
            <Tooltip content={<SmartTooltip />} />
            <Bar dataKey="crps" name="Mean CRPS" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {depositPolicies.map(d => <Cell key={d.name} fill={d.color} opacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
