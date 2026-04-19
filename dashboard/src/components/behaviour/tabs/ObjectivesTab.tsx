import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  ReferenceArea,
} from 'recharts';
import type { PipelineResult } from '@/lib/coreMechanism/runPipeline';
import ChartCard from '@/components/dashboard/ChartCard';
import MetricDisplay from '@/components/dashboard/MetricDisplay';
import {
  CHART_MARGIN_LABELED, GRID_PROPS, AXIS_TICK, AXIS_STROKE,
  fmt,
} from '@/components/lab/shared';
import { SmartTooltip } from '@/components/dashboard/SmartTooltip';
import { useChartZoom } from '@/hooks/useChartZoom';
import MathBlock from '@/components/dashboard/MathBlock';
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

export default function ObjectivesTab({ riskAverse, baseline }: {
  riskAverse: PipelineResult; baseline: PipelineResult;
}) {
  const cumZoom = useChartZoom();
  const raDelta = compare(riskAverse, baseline);

  const cumData = useMemo(() => cumulativeAverage({
    baseline: baseline.rounds,
    risk_averse: riskAverse.rounds,
  }), [baseline.rounds, riskAverse.rounds]);

  return (
    <div className="space-y-6">
      <PlaceholderBanner family="Objectives" description={PLACEHOLDER_DESCRIPTIONS.Objectives} />
      <p className="text-sm text-slate-600">
        Not all agents maximise expected value. Under CRRA (Constant Relative Risk Aversion)
        utility, agents with higher &gamma; stake less and hedge reports toward the centre.
        The mechanism should tolerate diverse objectives without breaking the aggregate.
      </p>
      <MathBlock accent label="CRRA utility" latex="u(w) = \\begin{cases} \\frac{w^{1-\\gamma}}{1-\\gamma} & \\gamma \\neq 1 \\\\ \\ln(w) & \\gamma = 1 \\end{cases}" />

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-700">&gamma; mapping</div>
        <p>&gamma; = 0: risk-neutral (maximises expected value)</p>
        <p>&gamma; &gt; 0: risk-averse (concave utility, prefers certainty)</p>
        <p>&gamma; &lt; 0: risk-seeking (convex utility, prefers gambles)</p>
        <p>The risk_averse preset uses &gamma; = 2, producing hedged reports and lower deposits.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricDisplay label="Risk aversion hurts?" value={Math.abs(raDelta.deltaPct) < 5 ? 'Minimal' : 'Yes'}
          detail={`Error ${raDelta.deltaPct >= 0 ? '+' : ''}${raDelta.deltaPct.toFixed(1)}% vs baseline`}
          variant={VERDICT_VARIANT[Math.abs(raDelta.deltaPct) < 5 ? 'good' : raDelta.deltaPct > 5 ? 'bad' : 'good']} />
        <MetricDisplay label="Mean CRPS (risk-averse)" value={fmt(riskAverse.summary.meanError, 4)} />
        <MetricDisplay label="Mean CRPS (baseline)" value={fmt(baseline.summary.meanError, 4)} />
        <MetricDisplay label="Gini (risk-averse)" value={fmt(riskAverse.summary.finalGini, 3)} detail={`vs ${fmt(baseline.summary.finalGini, 3)}`} />
      </div>

      <ChartCard title="Cumulative error: risk-averse vs baseline" subtitle="CRRA agents hedge and stake less. If lines track closely, the mechanism tolerates diverse objectives." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
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
            <Line type="monotone" dataKey="risk_averse" name="Risk-averse" stroke="#6366f1" strokeWidth={2} dot={false} />
            {cumZoom.state.refLeft && cumZoom.state.refRight && (
              <ReferenceArea x1={cumZoom.state.refLeft} x2={cumZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 space-y-1">
        <div className="font-semibold text-amber-800">Taxonomy note  - Loss aversion, signalling, leaderboard motives</div>
        <p>
          The full taxonomy also includes <em>loss aversion</em> (asymmetric weighting of gains vs losses,
          Kahneman &amp; Tversky 1979), <em>signalling</em> (agents who participate to demonstrate
          competence rather than earn payoffs), and <em>leaderboard motives</em> (agents who optimise
          rank rather than wealth). These are not simulated here but represent important real-world
          objective functions that could interact with the mechanism&apos;s incentive structure.
        </p>
      </div>
    </div>
  );
}
