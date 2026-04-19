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
import MathBlock from '@/components/dashboard/MathBlock';
import { compare } from '@/hooks/useBehaviourSimulations';
import { SEED, N, T, VERDICT_VARIANT, cumulativeAverage } from '@/lib/behaviour/helpers';

export default function ReportingTab({ riskAverse, noisyReporter, reputationGamer, sandbagger, baseline }: {
  riskAverse: PipelineResult; noisyReporter: PipelineResult;
  reputationGamer: PipelineResult; sandbagger: PipelineResult; baseline: PipelineResult;
}) {
  const hedgeDelta = compare(riskAverse, baseline);
  const noisyDelta = compare(noisyReporter, baseline);
  const repGamerDelta = compare(reputationGamer, baseline);
  const sandbagDelta = compare(sandbagger, baseline);

  const cumZoomHedge = useChartZoom();
  const sigZoomHedge = useChartZoom();
  const cumZoomNoisy = useChartZoom();
  const sigZoomRepGamer = useChartZoom();
  const cumZoomSandbag = useChartZoom();

  // ── Hedging data ─────────────────────────────────────────────────────
  const cumHedgeData = useMemo(() => cumulativeAverage({
    baseline: baseline.rounds,
    hedged: riskAverse.rounds,
  }), [baseline.rounds, riskAverse.rounds]);

  const sigmaHedgeData = useMemo(() => downsample(
    Array.from({ length: Math.min(baseline.traces.length, riskAverse.traces.length) }, (_, i) => ({
      round: i + 1,
      baseline_avg: baseline.traces[i].sigma_t.reduce((a: number, b: number) => a + b, 0) / N,
      hedged_avg: riskAverse.traces[i].sigma_t.reduce((a: number, b: number) => a + b, 0) / N,
    })), 300),
  [baseline.traces, riskAverse.traces]);

  // ── Noisy reporting data ─────────────────────────────────────────────
  const cumNoisyData = useMemo(() => cumulativeAverage({
    baseline: baseline.rounds,
    noisy: noisyReporter.rounds,
  }), [baseline.rounds, noisyReporter.rounds]);

  // ── Reputation gamer σ trajectory ────────────────────────────────────
  const sigRepGamerData = useMemo(() => {
    const len = Math.min(baseline.traces.length, reputationGamer.traces.length);
    return downsample(Array.from({ length: len }, (_, i) => ({
      round: i + 1,
      baseline: baseline.traces[i].sigma_t[0],
      gamer: reputationGamer.traces[i].sigma_t[0],
    })), 300);
  }, [baseline.traces, reputationGamer.traces]);

  // ── Sandbagging cumulative error ─────────────────────────────────────
  const cumSandbagData = useMemo(() => cumulativeAverage({
    baseline: baseline.rounds,
    sandbagger: sandbagger.rounds,
  }), [baseline.rounds, sandbagger.rounds]);

  return (
    <div className="space-y-8">
      {/* ── Section 1: Hedging ────────────────────────────────────────── */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-800">Risk-averse hedging</h3>
        <p className="text-sm text-slate-600">
          <strong>What it means:</strong> A risk-averse agent prefers a certain outcome over a gamble with the same expected value.
          In this mechanism, risk aversion manifests in two ways: (1) the agent <em>shrinks</em> their forecast toward the
          uninformative prior (0.5), reducing potential losses from extreme predictions, and (2) they <em>reduce</em> their
          deposit, limiting financial exposure. This is rational under concave utility (e.g. CRRA with γ &gt; 0), where
          the marginal value of gains is less than the marginal pain of losses.
        </p>
        <p className="text-sm text-slate-600 mt-2">
          <strong>Mechanism impact:</strong> Hedged reports are less informative and carry less signal about the true outcome.
          The skill layer detects this: hedged agents score worse on average, so their σ drops and they receive less weight
          in the aggregate. The mechanism tolerates hedging without breaking because it measures actual forecast quality,
          not boldness. This is consistent with Lambert&apos;s individual rationality property.
        </p>
        <MathBlock accent label="Hedged report" latex="\\hat{r}_i = 0.7 \\cdot r_i^{\\text{true}} + 0.3 \\cdot 0.5, \\quad f_{\\text{risk}} \\leftarrow 0.55 \\cdot f_{\\text{risk}}" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricDisplay label="Accuracy hurt?" value={Math.abs(hedgeDelta.deltaPct) < 5 ? 'Minimal' : hedgeDelta.deltaPct > 0 ? 'Yes' : 'Improved'}
            detail={`Error ${hedgeDelta.deltaPct >= 0 ? '+' : ''}${hedgeDelta.deltaPct.toFixed(1)}% vs baseline`}
            variant={VERDICT_VARIANT[Math.abs(hedgeDelta.deltaPct) < 5 ? 'good' : hedgeDelta.deltaPct > 5 ? 'bad' : 'good']} />
          <MetricDisplay label="Mean CRPS (hedged)" value={fmt(riskAverse.summary.meanError, 4)} />
          <MetricDisplay label="Mean CRPS (baseline)" value={fmt(baseline.summary.meanError, 4)} />
          <MetricDisplay label="Gini (hedged)" value={fmt(riskAverse.summary.finalGini, 3)} detail={`vs ${fmt(baseline.summary.finalGini, 3)}`} />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <ChartCard title="Cumulative error: hedged vs truthful" subtitle="Close tracking means hedging doesn't break the aggregate. Drag to zoom." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={cumHedgeData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
                onMouseDown={cumZoomHedge.onMouseDown} onMouseMove={cumZoomHedge.onMouseMove} onMouseUp={cumZoomHedge.onMouseUp}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[cumZoomHedge.state.left, cumZoomHedge.state.right]} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                  label={{ value: 'Cumulative CRPS', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<SmartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="baseline" name="Truthful" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="hedged" name="Hedged" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                {cumZoomHedge.state.refLeft && cumZoomHedge.state.refRight && (
                  <ReferenceArea x1={cumZoomHedge.state.refLeft} x2={cumZoomHedge.state.refRight} fillOpacity={0.1} fill="#6366f1" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Average skill estimate (σ)" subtitle="Hedged agents get lower σ because their reports are less accurate. Drag to zoom." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={sigmaHedgeData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
                onMouseDown={sigZoomHedge.onMouseDown} onMouseMove={sigZoomHedge.onMouseMove} onMouseUp={sigZoomHedge.onMouseUp}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[sigZoomHedge.state.left, sigZoomHedge.state.right]} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]}
                  label={{ value: 'Avg σ', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<SmartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="baseline_avg" name="Truthful avg σ" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="hedged_avg" name="Hedged avg σ" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                {sigZoomHedge.state.refLeft && sigZoomHedge.state.refRight && (
                  <ReferenceArea x1={sigZoomHedge.state.refLeft} x2={sigZoomHedge.state.refRight} fillOpacity={0.1} fill="#6366f1" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          The mechanism tolerates hedging because the skill layer measures actual forecast quality,
          not boldness. Hedged agents get lower σ (less influence) but don't break the system.
          This is consistent with Lambert's individual rationality property.
        </div>
      </div>

      {/* ── Section 2: Noisy reporting ────────────────────────────────── */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-800">Noisy reporting</h3>
        <p className="text-sm text-slate-600">
          Random noise added to truthful reports. The skill layer should detect lower signal quality.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricDisplay label="Noise hurts accuracy?" value={noisyDelta.deltaPct > 1 ? 'Yes' : 'Minimal'}
            detail={`Error ${noisyDelta.deltaPct >= 0 ? '+' : ''}${noisyDelta.deltaPct.toFixed(1)}% vs baseline`}
            variant={VERDICT_VARIANT[noisyDelta.deltaPct > 3 ? 'bad' : noisyDelta.deltaPct > 1 ? 'neutral' : 'good']} />
          <MetricDisplay label="Mean CRPS (noisy)" value={fmt(noisyReporter.summary.meanError, 4)} />
          <MetricDisplay label="Gini (noisy)" value={fmt(noisyReporter.summary.finalGini, 3)} detail={`vs ${fmt(baseline.summary.finalGini, 3)}`} />
          <MetricDisplay label="Participation" value={`${(noisyReporter.summary.meanParticipation / N * 100).toFixed(0)}%`} />
        </div>

        <ChartCard title="Cumulative error: noisy vs baseline" subtitle="Noise degrades accuracy but the skill layer limits aggregate damage. Drag to zoom." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={cumNoisyData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
              onMouseDown={cumZoomNoisy.onMouseDown} onMouseMove={cumZoomNoisy.onMouseMove} onMouseUp={cumZoomNoisy.onMouseUp}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[cumZoomNoisy.state.left, cumZoomNoisy.state.right]} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                label={{ value: 'Cumulative CRPS', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="noisy" name="Noisy reporter" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              {cumZoomNoisy.state.refLeft && cumZoomNoisy.state.refRight && (
                <ReferenceArea x1={cumZoomNoisy.state.refLeft} x2={cumZoomNoisy.state.refRight} fillOpacity={0.1} fill="#6366f1" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Section 3: Reputation gaming ──────────────────────────────── */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-800">Reputation gaming</h3>
        <p className="text-sm text-slate-600">
          Anchors reports near the aggregate to inflate σ. If EWMA is fooled, the gamer gains disproportionate influence.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricDisplay label="Gaming inflates σ?" value={repGamerDelta.deltaPct > 1 ? 'Partially' : 'No'}
            detail={`Error ${repGamerDelta.deltaPct >= 0 ? '+' : ''}${repGamerDelta.deltaPct.toFixed(1)}% vs baseline`}
            variant={VERDICT_VARIANT[repGamerDelta.deltaPct > 3 ? 'bad' : repGamerDelta.deltaPct > 1 ? 'neutral' : 'good']} />
          <MetricDisplay label="Mean CRPS (gamer)" value={fmt(reputationGamer.summary.meanError, 4)} />
          <MetricDisplay label="Gini (gamer)" value={fmt(reputationGamer.summary.finalGini, 3)} detail={`vs ${fmt(baseline.summary.finalGini, 3)}`} />
          <MetricDisplay label="N_eff (gamer)" value={fmt(reputationGamer.summary.meanNEff, 2)} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-slate-800">σ trajectory: gamer vs honest</h3>
            <ZoomBadge isZoomed={sigZoomRepGamer.state.isZoomed} onReset={sigZoomRepGamer.reset} />
          </div>
          <p className="text-xs text-slate-500 mb-2">Does the gamer's σ stay artificially high? Compare agent 0 across both runs.</p>
          <div className="cursor-crosshair">
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={sigRepGamerData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
                onMouseDown={sigZoomRepGamer.onMouseDown} onMouseMove={sigZoomRepGamer.onMouseMove} onMouseUp={sigZoomRepGamer.onMouseUp}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[sigZoomRepGamer.state.left, sigZoomRepGamer.state.right]} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]}
                  label={{ value: 'σ (agent 0)', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<SmartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="baseline" name="Honest" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="gamer" name="Rep. gamer" stroke="#7c3aed" strokeWidth={2} dot={false} />
                {sigZoomRepGamer.state.refLeft && sigZoomRepGamer.state.refRight && (
                  <ReferenceArea x1={sigZoomRepGamer.state.refLeft} x2={sigZoomRepGamer.state.refRight} fillOpacity={0.1} fill="#6366f1" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Section 4: Sandbagging ────────────────────────────────────── */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-800">Sandbagging</h3>
        <p className="text-sm text-slate-600">
          Deliberately underperforms to lower expectations, then outperforms for outsized payoffs.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricDisplay label="Sandbagging hurts?" value={sandbagDelta.deltaPct > 1 ? 'Yes' : 'Minimal'}
            detail={`Error ${sandbagDelta.deltaPct >= 0 ? '+' : ''}${sandbagDelta.deltaPct.toFixed(1)}% vs baseline`}
            variant={VERDICT_VARIANT[sandbagDelta.deltaPct > 3 ? 'bad' : sandbagDelta.deltaPct > 1 ? 'neutral' : 'good']} />
          <MetricDisplay label="Mean CRPS (sandbag)" value={fmt(sandbagger.summary.meanError, 4)} />
          <MetricDisplay label="Gini (sandbag)" value={fmt(sandbagger.summary.finalGini, 3)} detail={`vs ${fmt(baseline.summary.finalGini, 3)}`} />
          <MetricDisplay label="Participation" value={`${(sandbagger.summary.meanParticipation / N * 100).toFixed(0)}%`} />
        </div>

        <ChartCard title="Cumulative error: sandbagger vs baseline" subtitle="Deliberate underperformance degrades the aggregate. Drag to zoom." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={cumSandbagData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
              onMouseDown={cumZoomSandbag.onMouseDown} onMouseMove={cumZoomSandbag.onMouseMove} onMouseUp={cumZoomSandbag.onMouseUp}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[cumZoomSandbag.state.left, cumZoomSandbag.state.right]} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                label={{ value: 'Cumulative CRPS', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sandbagger" name="Sandbagger" stroke="#9333ea" strokeWidth={2} dot={false} />
              {cumZoomSandbag.state.refLeft && cumZoomSandbag.state.refRight && (
                <ReferenceArea x1={cumZoomSandbag.state.refLeft} x2={cumZoomSandbag.state.refRight} fillOpacity={0.1} fill="#6366f1" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
