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
  fmt, downsample,
} from '@/components/lab/shared';
import { SmartTooltip } from '@/components/dashboard/SmartTooltip';
import { useChartZoom } from '@/hooks/useChartZoom';
import ZoomBadge from '@/components/charts/ZoomBadge';
import { compare } from '@/hooks/useBehaviourSimulations';
import { SEED, N, T, VERDICT_VARIANT, cumulativeAverage } from '@/lib/behaviour/helpers';

export default function InformationTab({ biased, miscalibrated, baseline }: {
  biased: PipelineResult; miscalibrated: PipelineResult; baseline: PipelineResult;
}) {
  const cumZoom = useChartZoom();
  const sigZoom = useChartZoom();

  const biasDelta = compare(biased, baseline);
  const miscalDelta = compare(miscalibrated, baseline);
  const biasHurts = biasDelta.deltaPct > 1;
  const miscalHurts = miscalDelta.deltaPct > 1;

  // Check if biased agent's σ drops below 0.5 within 50 rounds
  const biasedSigmaDropped = useMemo(() => {
    for (let i = 0; i < Math.min(50, biased.traces.length); i++) {
      if (biased.traces[i].sigma_t[0] < 0.5) return true;
    }
    return false;
  }, [biased.traces]);

  // Cumulative error: 3 lines
  const cumData = useMemo(() => cumulativeAverage({
    baseline: baseline.rounds,
    biased: biased.rounds,
    miscalibrated: miscalibrated.rounds,
  }), [baseline.rounds, biased.rounds, miscalibrated.rounds]);

  // σ trajectory for agent 0 across all three presets
  const sigData = useMemo(() => {
    const len = Math.min(baseline.traces.length, biased.traces.length, miscalibrated.traces.length);
    return downsample(Array.from({ length: len }, (_, i) => ({
      round: i + 1,
      baseline: baseline.traces[i].sigma_t[0],
      biased: biased.traces[i].sigma_t[0],
      miscalibrated: miscalibrated.traces[i].sigma_t[0],
    })), 300);
  }, [baseline.traces, biased.traces, miscalibrated.traces]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Biased and miscalibrated agents degrade signal quality. The skill layer should detect and downweight them.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricDisplay label="Does bias hurt?" value={biasHurts ? 'Yes' : 'Minimal'}
          detail={`Error ${biasDelta.deltaPct >= 0 ? '+' : ''}${biasDelta.deltaPct.toFixed(1)}% vs baseline`}
          variant={VERDICT_VARIANT[biasHurts ? 'bad' : 'good']} />
        <MetricDisplay label="Does miscalibration hurt?" value={miscalHurts ? 'Yes' : 'Minimal'}
          detail={`Error ${miscalDelta.deltaPct >= 0 ? '+' : ''}${miscalDelta.deltaPct.toFixed(1)}% vs baseline`}
          variant={VERDICT_VARIANT[miscalHurts ? 'bad' : 'good']} />
        <MetricDisplay label="Mean CRPS (biased)" value={fmt(biased.summary.meanError, 4)} />
        <MetricDisplay label="Mean CRPS (miscal.)" value={fmt(miscalibrated.summary.meanError, 4)} />
      </div>

      {!biasedSigmaDropped && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
          <span className="text-red-500 text-base">⚠</span>
          Biased agent's σ did not drop below 0.5 within 50 rounds. Skill layer may be slow to downweight.
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Cumulative error comparison" subtitle="Biased vs miscalibrated vs baseline. Lower is better. Drag to zoom." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
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
              <Line type="monotone" dataKey="biased" name="Biased" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="miscalibrated" name="Miscalibrated" stroke="#f59e0b" strokeWidth={2} dot={false} />
              {cumZoom.state.refLeft && cumZoom.state.refRight && (
                <ReferenceArea x1={cumZoom.state.refLeft} x2={cumZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-slate-800">σ trajectory (agent 0)</h3>
            <ZoomBadge isZoomed={sigZoom.state.isZoomed} onReset={sigZoom.reset} />
          </div>
          <p className="text-xs text-slate-500 mb-2">How quickly the skill layer detects and downweights biased/miscalibrated agents.</p>
          <div className="cursor-crosshair">
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={sigData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
                onMouseDown={sigZoom.onMouseDown} onMouseMove={sigZoom.onMouseMove} onMouseUp={sigZoom.onMouseUp}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[sigZoom.state.left, sigZoom.state.right]} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]}
                  label={{ value: 'σ (agent 0)', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<SmartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="biased" name="Biased" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="miscalibrated" name="Miscalibrated" stroke="#f59e0b" strokeWidth={2} dot={false} />
                {sigZoom.state.refLeft && sigZoom.state.refRight && (
                  <ReferenceArea x1={sigZoom.state.refLeft} x2={sigZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 space-y-2">
        <div className="font-semibold text-amber-800">Taxonomy note: Correlated errors &amp; costly information</div>
        <p>
          <strong>Correlated errors:</strong> When multiple agents share the same flawed data source (e.g. all using
          the same weather model), their errors are correlated. This reduces the effective diversity of the panel —
          even with N=10 agents, if they all share the same bias, the effective N<sub>eff</sub> may be much lower.
          The aggregation gains from combining forecasts depend on error <em>independence</em>; correlated errors
          erode this benefit and can make the aggregate no better than a single forecaster.
        </p>
        <p>
          <strong>Costly information:</strong> When agents must pay to acquire better signals (e.g. buying proprietary
          data), only well-funded agents invest in quality. This creates adverse selection: the agents with the best
          information are also the wealthiest, potentially concentrating influence. In the mechanism, this interacts
          with the deposit layer. Wealthy agents can afford both better signals <em>and</em> larger deposits,
          compounding their advantage.
        </p>
        <p>
          Neither pattern is simulated here, but both are structurally important for real-world deployments where
          forecasters often share common data sources and face different information acquisition costs.
        </p>
      </div>
    </div>
  );
}
