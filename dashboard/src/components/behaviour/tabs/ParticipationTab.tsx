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
  AGENT_PALETTE, CHART_MARGIN_LABELED, GRID_PROPS, AXIS_TICK, AXIS_STROKE,
  fmt, downsample, agentName,
} from '@/components/lab/shared';
import { SmartTooltip } from '@/components/dashboard/SmartTooltip';
import { useChartZoom } from '@/hooks/useChartZoom';
import ZoomBadge from '@/components/charts/ZoomBadge';
import MathBlock from '@/components/dashboard/MathBlock';
import { compare } from '@/hooks/useBehaviourSimulations';
import { SEED, N, T, VERDICT_VARIANT, cumulativeAverage } from '@/lib/behaviour/helpers';

export default function ParticipationTab({ bursty, baseline }: {
  bursty: PipelineResult; baseline: PipelineResult;
}) {
  const skillZoom = useChartZoom();
  const cumZoomInter = useChartZoom();
  const { deltaPct } = compare(bursty, baseline);
  const degradesGracefully = Math.abs(deltaPct) < 15;

  const skillData = useMemo(() => downsample(bursty.traces.map((t, i) => {
    const pt: Record<string, number> = { round: i + 1 };
    for (let j = 0; j < N; j++) pt[`F${j + 1}`] = t.sigma_t[j];
    return pt;
  }), 300), [bursty.traces]);

  const partData = useMemo(() => downsample(bursty.rounds.map(r => ({
    round: r.round, active: r.participation, rate: r.participation / N,
  })), 300), [bursty.rounds]);

  const cumData = useMemo(() => cumulativeAverage({
    baseline: baseline.rounds,
    bursty: bursty.rounds,
  }), [baseline.rounds, bursty.rounds]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        What happens when agents go offline? The EWMA freezes during absences, preventing drift.
      </p>
      <MathBlock accent label="EWMA skill update" latex="L_{i,t} = \\begin{cases} (1-\\rho)L_{i,t-1} + \\rho\\,\\ell_{i,t} & \\text{if present} \\\\ (1-\\kappa)L_{i,t-1} + \\kappa L_0 & \\text{if absent, } \\kappa > 0 \\\\ L_{i,t-1} & \\text{if absent, } \\kappa = 0 \\end{cases}" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricDisplay label="Degrades gracefully?" value={degradesGracefully ? 'Yes' : 'No'}
          detail={`Error ${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(1)}% vs baseline`}
          variant={VERDICT_VARIANT[degradesGracefully ? 'good' : 'bad']} />
        <MetricDisplay label="Mean CRPS (bursty)" value={fmt(bursty.summary.meanError, 4)} />
        <MetricDisplay label="Avg participation" value={`${(bursty.summary.meanParticipation / N * 100).toFixed(0)}%`} detail={`of ${N} agents`} />
        <MetricDisplay label="Final Gini" value={fmt(bursty.summary.finalGini, 3)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Participation per round" subtitle="Green ≥ 80%, amber ≥ 50%, red < 50%. Bursty pattern with ~22-round period." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={partData} margin={CHART_MARGIN_LABELED}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, N]} />
              <Tooltip content={<SmartTooltip />} />
              <Bar dataKey="active" name="Active" radius={[2, 2, 0, 0]} maxBarSize={4}>
                {partData.map((d, i) => <Cell key={i} fill={d.rate >= 0.8 ? '#10b981' : d.rate >= 0.5 ? '#f59e0b' : '#ef4444'} opacity={0.7} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Skill stability under intermittency</h3>
            <ZoomBadge isZoomed={skillZoom.state.isZoomed} onReset={skillZoom.reset} />
          </div>
          <p className="text-xs text-slate-500 mb-2">σ stays flat during absences (EWMA freezes). No drift or corruption.</p>
          <div className="cursor-crosshair">
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={skillData} margin={CHART_MARGIN_LABELED}
                onMouseDown={skillZoom.onMouseDown} onMouseMove={skillZoom.onMouseMove} onMouseUp={skillZoom.onMouseUp}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[skillZoom.state.left, skillZoom.state.right]} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]} />
                <Tooltip content={<SmartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, lineHeight: '18px', maxHeight: 40, overflow: 'hidden' }} iconSize={8} />
                {Array.from({ length: N }, (_, i) => (
                  <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={agentName(i)}
                    stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={1.5} dot={false} />
                ))}
                {skillZoom.state.refLeft && skillZoom.state.refRight && (
                  <ReferenceArea x1={skillZoom.state.refLeft} x2={skillZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <ChartCard title="Cumulative error: bursty vs baseline" subtitle="If lines track closely, intermittency doesn't hurt the aggregate. Drag to zoom." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={cumData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
            onMouseDown={cumZoomInter.onMouseDown} onMouseMove={cumZoomInter.onMouseMove} onMouseUp={cumZoomInter.onMouseUp}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[cumZoomInter.state.left, cumZoomInter.state.right]} />
            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
              label={{ value: 'Cumulative CRPS', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
            <Tooltip content={<SmartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="baseline" name="Baseline" stroke="#94a3b8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="bursty" name="Bursty" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            {cumZoomInter.state.refLeft && cumZoomInter.state.refRight && (
              <ReferenceArea x1={cumZoomInter.state.refLeft} x2={cumZoomInter.state.refRight} fillOpacity={0.1} fill="#6366f1" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Participation-error correlation */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">Why does intermittency hurt?</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-center">
            <div className="text-2xl font-bold font-mono text-red-600">{(bursty.summary.meanParticipation / N * 100).toFixed(0)}%</div>
            <div className="text-[11px] text-red-700 mt-1">Average participation</div>
            <div className="text-[11px] text-slate-500 mt-0.5">vs 100% baseline</div>
          </div>
          <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-center">
            <div className="text-2xl font-bold font-mono text-amber-600">{(N - bursty.summary.meanParticipation).toFixed(1)}</div>
            <div className="text-[11px] text-amber-700 mt-1">Agents missing per round</div>
            <div className="text-[11px] text-slate-500 mt-0.5">= lost information</div>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
            <div className="text-2xl font-bold font-mono text-slate-700">{deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(1)}%</div>
            <div className="text-[11px] text-slate-600 mt-1">CRPS degradation</div>
            <div className="text-[11px] text-slate-500 mt-0.5">cost of missing agents</div>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          Each missing agent removes one forecast from the aggregate. With {N} agents, losing {(N - bursty.summary.meanParticipation).toFixed(1)} per round
          means the aggregate is based on {bursty.summary.meanParticipation.toFixed(1)} signals instead of {N}.
          The mechanism preserves skill estimates during absences (EWMA freezes), but can't compensate for the missing information itself.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        On real data (Notes page), the mechanism still improves by +4.4% at 60% missingness.
        This aligns with Vitali &amp; Pinson's robust regression approach, which handles missing forecasts
        via a linear correction matrix D that compensates for absent sellers.
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 space-y-1">
        <div className="font-semibold text-amber-800">Taxonomy note: Selective entry</div>
        <p>
          The taxonomy also includes <em>selective entry</em>: agents who participate only when they
          believe their signal is strong (selection on confidence) or when the market spread is wide
          (selection on edge). These patterns are not simulated here but are structurally similar to
          bursty participation. The EWMA freeze handles both cases identically since the mechanism
          never observes <em>why</em> an agent is absent, only <em>that</em> they are absent.
        </p>
      </div>
    </div>
  );
}
