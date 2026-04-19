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
import { compare } from '@/hooks/useBehaviourSimulations';
import { SEED, N, T, VERDICT_VARIANT, cumulativeAverage } from '@/lib/behaviour/helpers';

export default function OperationalTab({ latencyExploiter, baseline }: {
  latencyExploiter: PipelineResult; baseline: PipelineResult;
}) {
  const cumZoom = useChartZoom();
  const latDelta = compare(latencyExploiter, baseline);

  const cumData = useMemo(() => cumulativeAverage({
    baseline: baseline.rounds,
    latency: latencyExploiter.rounds,
  }), [baseline.rounds, latencyExploiter.rounds]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span className="text-sm font-semibold text-slate-700">
            In-browser simulation: latency exploitation
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Additional operational frictions (interface errors, automation patterns)
          are documented in the taxonomy but not yet simulated.
        </p>
      </div>
      <p className="text-sm text-slate-600">
        Latency exploiters submit reports with partial outcome information  - they observe
        a noisy signal of the realisation before the submission deadline. This creates an unfair
        information advantage that concentrates wealth.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricDisplay label="Latency exploitable?" value={latDelta.deltaPct < -1 ? 'Yes' : 'Minimal'}
          detail={`Error ${latDelta.deltaPct >= 0 ? '+' : ''}${latDelta.deltaPct.toFixed(1)}% vs baseline`}
          variant={VERDICT_VARIANT[latDelta.deltaPct < -3 ? 'bad' : 'neutral']} />
        <MetricDisplay label="Mean CRPS (latency)" value={fmt(latencyExploiter.summary.meanError, 4)} />
        <MetricDisplay label="Gini (latency)" value={fmt(latencyExploiter.summary.finalGini, 3)} detail={`vs ${fmt(baseline.summary.finalGini, 3)}`} />
        <MetricDisplay label="Gini delta" value={fmt(latencyExploiter.summary.finalGini - baseline.summary.finalGini, 4)}
          detail={latencyExploiter.summary.finalGini > baseline.summary.finalGini ? 'More concentrated' : 'Less concentrated'} />
      </div>

      <ChartCard title="Cumulative error: latency exploiter vs baseline" subtitle="Lower CRPS for the exploiter means they have an unfair advantage. Drag to zoom." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
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
            <Line type="monotone" dataKey="latency" name="Latency exploiter" stroke="#64748b" strokeWidth={2} dot={false} />
            {cumZoom.state.refLeft && cumZoom.state.refRight && (
              <ReferenceArea x1={cumZoom.state.refLeft} x2={cumZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 space-y-1">
        <div className="font-semibold text-amber-800">Taxonomy note  - Interface errors &amp; automation patterns</div>
        <p>
          The full taxonomy also includes <em>interface errors</em> (accidental misreports due to
          UI bugs or fat-finger mistakes) and <em>automation patterns</em> (bot-like agents that
          submit at fixed intervals with algorithmic reports). These are not simulated here but
          represent important operational frictions in real-world prediction market deployments.
        </p>
      </div>
    </div>
  );
}
