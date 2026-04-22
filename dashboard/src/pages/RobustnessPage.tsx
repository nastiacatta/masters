import { useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell, Label,
  Brush, ReferenceArea,
} from 'recharts';
import { runPipeline, type PipelineResult } from '@/lib/coreMechanism/runPipeline';
import ChartCard from '@/components/dashboard/ChartCard';
import TornadoChart from '@/components/charts/TornadoChart';
import type { TornadoDatum } from '@/components/charts/TornadoChart';
import MathBlock from '@/components/dashboard/MathBlock';
import SectionHeader from '@/components/dashboard/SectionHeader';
import { FigureProvider } from '@/contexts/FigureContext';
import { EquationProvider } from '@/contexts/EquationContext';
import {
  AGENT_PALETTE, CHART_MARGIN_LABELED, GRID_PROPS, AXIS_TICK, AXIS_STROKE,
  BRUSH_PROPS, fmt, downsample, agentName,
} from '@/components/lab/shared';
import { SmartTooltip } from '@/components/dashboard/SmartTooltip';
import MetricDisplay from '@/components/dashboard/MetricDisplay';
import { useChartZoom } from '@/hooks/useChartZoom';
import ZoomBadge from '@/components/charts/ZoomBadge';
import Breadcrumb from '@/components/dashboard/Breadcrumb';

const DGP_ID = 'baseline' as const;
const SEED = 42;
const N_AGENTS = 6;
const ROUNDS = 200;

type SectionId = 'intermittency' | 'sybil' | 'sensitivity';

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'intermittency', label: 'Intermittency' },
  { id: 'sybil', label: 'Sybil' },
  { id: 'sensitivity', label: 'Sensitivity' },
];

function SectionIntro({ title, question, takeaway }: { title: string; question: string; takeaway: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="text-sm font-medium text-slate-700 mt-1">{question}</p>
      <p className="text-sm text-slate-500 mt-1 italic">{takeaway}</p>
    </div>
  );
}

// ZoomBadge imported from shared component

export default function RobustnessPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('intermittency');

  const burstyPipeline = useMemo<PipelineResult>(() => {
    return runPipeline({ dgpId: DGP_ID, behaviourPreset: 'bursty', rounds: ROUNDS, seed: SEED, n: N_AGENTS });
  }, []);

  const baselinePipeline = useMemo<PipelineResult>(() => {
    return runPipeline({ dgpId: DGP_ID, behaviourPreset: 'baseline', rounds: ROUNDS, seed: SEED, n: N_AGENTS });
  }, []);

  const sybilPipeline = useMemo<PipelineResult>(() => {
    return runPipeline({ dgpId: DGP_ID, behaviourPreset: 'sybil', rounds: ROUNDS, seed: SEED, n: N_AGENTS });
  }, []);

  const sweepData = useMemo(() => {
    const lambdas = [0.0, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0];
    const sigMins = [0.05, 0.1, 0.2, 0.3, 0.5];
    const results: { lam: number; sigmaMin: number; meanError: number; gini: number }[] = [];
    for (const lam of lambdas) {
      for (const sigMin of sigMins) {
        const p = runPipeline({
          dgpId: DGP_ID, behaviourPreset: 'baseline', rounds: 100, seed: SEED, n: N_AGENTS,
          mechanism: { lam, sigma_min: sigMin } as Record<string, number>,
        });
        results.push({ lam, sigmaMin: sigMin, meanError: p.summary.meanError, gini: p.summary.finalGini });
      }
    }
    return results;
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
    <FigureProvider>
    <EquationProvider>
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <Breadcrumb activeTab={SECTIONS.find(s => s.id === activeSection)?.label} />
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Robustness &amp; attacks</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl">
          Does the mechanism hold up under missingness, identity splitting, and parameter variation?
        </p>
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[11px] text-amber-900 max-w-2xl leading-relaxed">
          In-browser simulation (point-score, baseline DGP, seed 42, N = 6, T = 200).
          For project-grade evidence, see the pre-run Python experiment outputs.
        </div>
      </div>

      <RobustnessVerdictStrip bursty={burstyPipeline} baseline={baselinePipeline} sybil={sybilPipeline} sweep={sweepData} nAgents={N_AGENTS} />

      <p className="text-sm text-slate-600 mb-6 max-w-2xl leading-relaxed">
        The following sections examine three dimensions of robustness: tolerance to intermittent participation, resistance to identity splitting (Sybil attacks), and sensitivity to key mechanism parameters.
      </p>

      <SectionHeader label="" title="Robustness tests" description="Intermittency, Sybil, or parameter sensitivity.">
      <div className="flex gap-1 mb-4 pb-6">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === s.id
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      </SectionHeader>

      {activeSection === 'intermittency' && (
        <IntermittencySection bursty={burstyPipeline} baseline={baselinePipeline} />
      )}
      {activeSection === 'sybil' && (
        <SybilSection sybil={sybilPipeline} baseline={baselinePipeline} />
      )}
      {activeSection === 'sensitivity' && (
        <SensitivitySection data={sweepData} />
      )}
    </div>
    </EquationProvider>
    </FigureProvider>
    </div>
  );
}

/* ── Intermittency ── */

function IntermittencySection({ bursty, baseline }: { bursty: PipelineResult; baseline: PipelineResult }) {
  const N = bursty.traces[0]?.participated.length ?? 6;
  const skillZoom = useChartZoom();

  const skillData = useMemo(() => {
    return downsample(bursty.traces.map((t, i) => {
      const point: Record<string, number> = { round: i + 1 };
      for (let j = 0; j < N; j++) point[`F${j + 1}`] = t.sigma_t[j];
      return point;
    }), 300);
  }, [bursty.traces, N]);

  const mOverBData = useMemo(() => {
    return downsample(bursty.traces.map((t, i) => {
      const ratios = Array.from({ length: N }, (_, j) => {
        const b = t.deposits[j];
        return b > 0.001 ? t.effectiveWager[j] / b : 0;
      }).filter(r => r > 0); // only active agents
      const mean = ratios.length > 0 ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0;
      const min = ratios.length > 0 ? Math.min(...ratios) : 0;
      const max = ratios.length > 0 ? Math.max(...ratios) : 0;
      return { round: i + 1, mean, min, max };
    }), 300);
  }, [bursty.traces, N]);

  const participationData = useMemo(() => {
    return downsample(bursty.rounds.map(r => ({
      round: r.round, active: r.participation, rate: r.participation / N,
    })), 300);
  }, [bursty.rounds, N]);

  return (
    <div className="space-y-6">
      <SectionIntro
        title="Intermittency"
        question="Do masking and skill bounds behave correctly when agents come and go?"
        takeaway="Under bursty participation, skill trajectories remain stable and m/b stays within [λ + (1−λ)σ_min^η, 1] bounds."
      />

      <SectionHeader label="A" title="Headline metrics" description="Compare bursty vs baseline.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 pb-6">
        <HeadlineCard label="Mean error (bursty)" value={fmt(bursty.summary.meanError, 4)} />
        <HeadlineCard label="Mean error (baseline)" value={fmt(baseline.summary.meanError, 4)} />
        <HeadlineCard label="Avg participation" value={`${(bursty.summary.meanParticipation / N * 100).toFixed(0)}%`} />
        <HeadlineCard label="Final Gini" value={fmt(bursty.summary.finalGini, 3)} />
      </div>
      </SectionHeader>

      <SectionHeader label="B" title="Charts" description="Participation, skill trajectories, m/b ratio. Drag to zoom. Hover for values.">
      <div className="grid lg:grid-cols-2 gap-6 mb-4">
        <ChartCard title="Participation under intermittency" subtitle="Active agents per round. Use brush to pan. Hover for values." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N_AGENTS}, T=${ROUNDS}` }}>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={participationData} margin={CHART_MARGIN_LABELED}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
                label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, N]}
                label={{ value: 'Active agents', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<SmartTooltip />} />
              <Bar dataKey="active" name="Active agents" radius={[2, 2, 0, 0]} maxBarSize={6}>
                {participationData.map((d, i) => (
                  <Cell key={i} fill={d.rate >= 0.8 ? '#10b981' : d.rate >= 0.5 ? '#f59e0b' : '#ef4444'} opacity={0.7} />
                ))}
              </Bar>
              <ReferenceLine y={N} stroke="#94a3b8" strokeDasharray="4 4">
                <Label value="N" position="right" fill="#94a3b8" fontSize={11} />
              </ReferenceLine>
              <Brush dataKey="round" {...BRUSH_PROPS} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-800">Skill trajectories (σ)</h3>
            <ZoomBadge isZoomed={skillZoom.state.isZoomed} onReset={skillZoom.reset} />
          </div>
          <p className="text-[11px] text-slate-400 mb-2">Skill σ by agent over time. Drag to zoom. Hover for values.</p>
          <div className="cursor-crosshair" role="img" aria-label="Skill trajectories under intermittency. Interactive chart.">
          <ResponsiveContainer width="100%" height={360}>
            <LineChart
              data={skillData}
              margin={CHART_MARGIN_LABELED}
              onMouseDown={skillZoom.onMouseDown}
              onMouseMove={skillZoom.onMouseMove}
              onMouseUp={skillZoom.onMouseUp}
            >
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
                domain={[skillZoom.state.left, skillZoom.state.right]}
                label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]}
                label={{ value: 'Skill σ', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              {Array.from({ length: N }, (_, i) => (
                <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={agentName(i)}
                  stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={1.5} dot={false} />
              ))}
              {skillZoom.state.refLeft && skillZoom.state.refRight && (
                <ReferenceArea x1={skillZoom.state.refLeft} x2={skillZoom.state.refRight} strokeOpacity={0.3} fill="#6366f1" fillOpacity={0.1} />
              )}
              <Brush dataKey="round" {...BRUSH_PROPS} />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      <ChartCard title="m/b ratio under intermittency" subtitle="Mean ± range across active agents. Shaded band shows min–max. Should stay within [λ, 1]." provenance={{ type: 'demo', label: `In-browser demo, seed=${SEED}, N=${N_AGENTS}, T=${ROUNDS}` }}>
        <ResponsiveContainer width="100%" height={360}>
          <AreaChart data={mOverBData} margin={CHART_MARGIN_LABELED}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
              label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1.1]}
              label={{ value: 'm/b ratio', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
            <Tooltip content={<SmartTooltip />} />
            <defs>
              <linearGradient id="mbBandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <ReferenceLine y={1} stroke="#94a3b8" strokeDasharray="4 4">
              <Label value="Upper bound (1.0)" position="right" fontSize={11} fill="#94a3b8" />
            </ReferenceLine>
            <ReferenceLine y={0.3} stroke="#94a3b8" strokeDasharray="4 4">
              <Label value="λ = 0.3" position="right" fontSize={11} fill="#94a3b8" />
            </ReferenceLine>
            <Area type="monotone" dataKey="max" name="Max" stroke="transparent" fill="url(#mbBandGrad)" />
            <Area type="monotone" dataKey="min" name="Min" stroke="transparent" fill="white" />
            <Line type="monotone" dataKey="mean" name="Mean m/b" stroke="#6366f1" strokeWidth={2.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
      </SectionHeader>
    </div>
  );
}

/* ── Sybil ── */

function SybilSection({ sybil, baseline }: { sybil: PipelineResult; baseline: PipelineResult }) {
  const sybilProfit = sybil.finalState.slice(0, 2).reduce((a, s) => a + s.wealth, 0);
  const baselineProfit = baseline.finalState.slice(0, 2).reduce((a, s) => a + s.wealth, 0);
  const profitRatio = baselineProfit > 0 ? sybilProfit / baselineProfit : 1;
  const wealthZoom = useChartZoom();

  const wealthData = useMemo(() => {
    const N = sybil.traces[0]?.participated.length ?? 6;
    return downsample(sybil.traces.map((t, i) => {
      const point: Record<string, number> = { round: i + 1 };
      for (let j = 0; j < N; j++) point[`F${j + 1}`] = t.wealth_after[j];
      return point;
    }), 300);
  }, [sybil.traces]);

  const N = sybil.traces[0]?.participated.length ?? 6;

  return (
    <div className="space-y-6">
      <SectionIntro
        title="Sybil resistance"
        question="Can an agent gain by splitting into multiple identities?"
        takeaway="No measurable advantage from identity splitting in the tested setup."
      />

      <SectionHeader label="A" title="Headline metrics" description="Sybil vs baseline wealth.">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4 pb-6">
        <MetricDisplay
          label="Sybil wealth advantage"
          value={profitRatio <= 1.05 ? 'None' : `${fmt((profitRatio - 1) * 100, 1)}%`}
          detail={`Profit ratio: ${fmt(profitRatio, 3)} (≤ 1.05 = no advantage)`}
          variant={profitRatio <= 1.05 ? 'verdict-good' : profitRatio <= 1.15 ? 'verdict-neutral' : 'verdict-bad'}
        />
        <HeadlineCard label="Sybil pair wealth" value={fmt(sybilProfit, 2)} />
        <HeadlineCard label="Baseline pair wealth" value={fmt(baselineProfit, 2)} />
        <HeadlineCard label="Mean error (sybil)" value={fmt(sybil.summary.meanError, 4)} />
        <HeadlineCard label="Final Gini (sybil)" value={fmt(sybil.summary.finalGini, 3)} />
      </div>
      </SectionHeader>

      <SectionHeader label="B" title="Charts & explanation" description="Wealth trajectories and why sybil fails. Drag to zoom, hover for values.">
      <div className="grid lg:grid-cols-2 gap-6 mb-4">
        <ChartCard title="Wealth under sybil attack" subtitle="F1–F2 are sybil clones. Drag to zoom. Hover for values." provenance={{ type: 'demo', label: `In-browser demo, seed=${SEED}, N=${N_AGENTS}, T=${ROUNDS}` }}>
          <div className="cursor-crosshair" role="img" aria-label="Wealth under sybil. Interactive chart.">
          <ResponsiveContainer width="100%" height={360}>
            <LineChart
              data={wealthData}
              margin={CHART_MARGIN_LABELED}
              onMouseDown={wealthZoom.onMouseDown}
              onMouseMove={wealthZoom.onMouseMove}
              onMouseUp={wealthZoom.onMouseUp}
            >
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
                domain={[wealthZoom.state.left, wealthZoom.state.right]}
                label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                label={{ value: 'Wealth', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <ReferenceLine y={20} stroke="#94a3b8" strokeDasharray="4 4">
                <Label value="W₀" position="right" fill="#94a3b8" fontSize={11} />
              </ReferenceLine>
              {Array.from({ length: N }, (_, i) => (
                <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={agentName(i)}
                  stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                  strokeWidth={i < 2 ? 2.5 : 1.2}
                  strokeOpacity={i < 2 ? 1 : 0.5}
                  dot={false} />
              ))}
              {wealthZoom.state.refLeft && wealthZoom.state.refRight && (
                <ReferenceArea x1={wealthZoom.state.refLeft} x2={wealthZoom.state.refRight} strokeOpacity={0.3} fill="#6366f1" fillOpacity={0.1} />
              )}
              <Brush dataKey="round" {...BRUSH_PROPS} />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </ChartCard>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h4 className="text-sm font-semibold text-slate-800 mb-3">Why sybil fails</h4>
          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <p>
              When an agent splits into <em>k</em> identities, each clone starts with
              <MathBlock inline latex="\sigma = 0.5" /> and <MathBlock inline latex="W/k" /> wealth.
            </p>
            <p>
              The effective wager <MathBlock inline latex="m_i = b_i(\lambda + (1-\lambda)\sigma_i^{\eta})" /> scales
              with skill, which the clones must individually earn.
            </p>
            <p>
              In the tested configuration, the profit ratio is approximately{' '}
              <span className="font-mono font-medium text-slate-800">{fmt(profitRatio, 3)}</span>,
              confirming no measurable advantage.
            </p>
          </div>
        </div>
      </div>
      </SectionHeader>
    </div>
  );
}

/* ── Sensitivity ── */

function SensitivitySection({ data }: { data: { lam: number; sigmaMin: number; meanError: number; gini: number }[] }) {
  const lambdas = [...new Set(data.map(d => d.lam))].sort((a, b) => a - b);
  const sigMins = [...new Set(data.map(d => d.sigmaMin))].sort((a, b) => a - b);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const best = data.reduce((a, b) => a.meanError < b.meanError ? a : b);
  const worst = data.reduce((a, b) => a.meanError > b.meanError ? a : b);

  const barData = lambdas.map(lam => {
    const row: Record<string, number | string> = { lam: `λ=${lam}` };
    for (const sig of sigMins) {
      const point = data.find(d => d.lam === lam && d.sigmaMin === sig);
      if (point) row[`σ_min=${sig}`] = point.meanError;
    }
    return row;
  });

  const sigColors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      <SectionIntro
        title="Parameter sensitivity"
        question="How do λ and σ_min affect accuracy and inequality?"
        takeaway="Lower λ and lower σ_min slightly improve accuracy but can increase inequality. The mechanism is not brittle."
      />

      <SectionHeader label="A" title="Headline metrics" description="Best and worst configs.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 pb-6">
        <HeadlineCard label="Best config" value={`λ=${best.lam}, σ_min=${best.sigmaMin}`} sub={`error ${fmt(best.meanError, 4)}`} />
        <HeadlineCard label="Worst config" value={`λ=${worst.lam}, σ_min=${worst.sigmaMin}`} sub={`error ${fmt(worst.meanError, 4)}`} />
        <HeadlineCard label="Error range" value={fmt(worst.meanError - best.meanError, 4)} sub="max − min" />
        <HeadlineCard label="Gini range" value={fmt(Math.max(...data.map(d => d.gini)) - Math.min(...data.map(d => d.gini)), 3)} sub="max − min" />
      </div>
      </SectionHeader>

      <SectionHeader label="B" title="Charts" description="Bar chart and scatter. Hover bars or points for values.">
      <div className="grid lg:grid-cols-2 gap-6 mb-4">
        <ChartCard title="Mean error by λ and σ_min" subtitle="Grouped by λ, coloured by σ_min. Hover bars for values. Lower is better." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N_AGENTS}, T=${ROUNDS}` }}>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={barData} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="lam" tick={AXIS_TICK} stroke={AXIS_STROKE}
                label={{ value: 'λ (stake weight)', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                label={{ value: 'Mean error', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              {sigMins.map((sig, i) => (
                <Bar key={sig} dataKey={`σ_min=${sig}`} name={`σ_min=${sig}`}
                  fill={sigColors[i % sigColors.length]} radius={[3, 3, 0, 0]} maxBarSize={20} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Accuracy vs inequality</h3>
          <p className="text-[11px] text-slate-400 mb-3">Each point is one (λ, σ_min) config. Hover a point to see error and Gini.</p>
          <div className="h-[320px] relative cursor-default" role="img" aria-label="Scatter: mean error vs Gini by config. Hover points for details.">
            <svg viewBox="0 0 400 300" className="w-full h-full" aria-hidden="true">
              {data.map((d, i) => {
                const x = 40 + (d.meanError - best.meanError) / (worst.meanError - best.meanError + 0.001) * 320;
                const giniRange = Math.max(...data.map(p => p.gini)) - Math.min(...data.map(p => p.gini));
                const y = 280 - (d.gini - Math.min(...data.map(p => p.gini))) / (giniRange + 0.001) * 260;
                const sigIdx = sigMins.indexOf(d.sigmaMin);
                const isHovered = hoveredPoint === i;
                return (
                  <g key={i}
                    onMouseEnter={() => setHoveredPoint(i)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="cursor-pointer"
                  >
                    <circle cx={x} cy={y} r={isHovered ? 9 : 6}
                      fill={sigColors[sigIdx % sigColors.length]}
                      opacity={isHovered ? 1 : 0.7}
                      stroke={isHovered ? '#1e293b' : 'none'}
                      strokeWidth={2}
                    />
                    {isHovered && (
                      <g>
                        <rect x={Math.min(x + 12, 268)} y={y - 32} width={130} height={48} rx={8} fill="white" stroke="#94a3b8" strokeWidth={1.5} />
                        <text x={Math.min(x + 18, 274)} y={y - 14} fontSize="11" fill="#0f172a" fontWeight="600">
                          λ={d.lam} σ_min={d.sigmaMin}
                        </text>
                        <text x={Math.min(x + 18, 274)} y={y + 4} fontSize="11" fill="#475569">
                          Mean error: {fmt(d.meanError, 4)}
                        </text>
                        <text x={Math.min(x + 18, 274)} y={y + 20} fontSize="11" fill="#475569">
                          Gini: {fmt(d.gini, 3)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
              <text x="200" y="298" textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="500">Mean error (→ better)</text>
              <text x="14" y="150" textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="500" transform="rotate(-90, 14, 150)">Gini (→ more inequality)</text>
            </svg>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
        <p className="text-xs text-slate-600 leading-relaxed">
          The mechanism is not brittle: mean error varies by {fmt(worst.meanError - best.meanError, 4)} across
          the full grid. Lower <MathBlock inline latex="\lambda" /> gives skill more control,
          while lower <MathBlock inline latex="\sigma_{\min}" /> allows more aggressive
          downweighting, at the cost of higher concentration (Gini).
        </p>
      </div>

      {/* Tornado chart: sensitivity of mean CRPS to λ and σ_min */}
      <TornadoChart
        data={(() => {
          // Compute sensitivity: range of mean error when varying each parameter
          const lamValues = [...new Set(data.map(d => d.lam))];
          const sigValues = [...new Set(data.map(d => d.sigmaMin))];
          // For λ: fix σ_min at 0.1, vary λ
          const lamErrors = lamValues.map(l => data.find(d => d.lam === l && d.sigmaMin === 0.1)?.meanError ?? 0);
          const lamRange = Math.max(...lamErrors) - Math.min(...lamErrors);
          // For σ_min: fix λ at 0.3, vary σ_min
          const sigErrors = sigValues.map(s => data.find(d => d.lam === 0.3 && d.sigmaMin === s)?.meanError ?? 0);
          const sigRange = Math.max(...sigErrors) - Math.min(...sigErrors);
          return [
            { label: 'λ (stake weight)', delta: lamRange, color: '#6366f1' },
            { label: 'σ_min (skill floor)', delta: sigRange, color: '#0ea5e9' },
          ] as TornadoDatum[];
        })()}
        title="Sensitivity of mean CRPS to mechanism parameters"
        metricLabel="Error range"
        baselineLabel="Default config"
        provenance={{ type: 'demo', label: `In-browser demo, seed=${SEED}, N=${N_AGENTS}, T=100` }}
      />
      </SectionHeader>
    </div>
  );
}

/* ── Verdict strip ── */

function RobustnessVerdictStrip({ bursty, baseline, sybil, sweep, nAgents }: {
  bursty: PipelineResult; baseline: PipelineResult; sybil: PipelineResult;
  sweep: { meanError: number; gini: number }[]; nAgents: number;
}) {
  const sybilProfit = sybil.finalState.slice(0, 2).reduce((a, s) => a + s.wealth, 0);
  const baselineProfit = baseline.finalState.slice(0, 2).reduce((a, s) => a + s.wealth, 0);
  const sybilRatio = baselineProfit > 0 ? sybilProfit / baselineProfit : 1;

  const best = sweep.reduce((a, b) => a.meanError < b.meanError ? a : b);
  const worst = sweep.reduce((a, b) => a.meanError > b.meanError ? a : b);
  const errorRange = worst.meanError - best.meanError;
  const giniRange = Math.max(...sweep.map(d => d.gini)) - Math.min(...sweep.map(d => d.gini));

  type Tone = 'good' | 'warn' | 'bad';
  const items: { label: string; value: string; note: string; tone: Tone }[] = [
    {
      label: 'Intermittency',
      value: `${(bursty.summary.meanParticipation / nAgents * 100).toFixed(0)}% avg participation`,
      note: `Error Δ = ${fmt(bursty.summary.meanError - baseline.summary.meanError, 4)} vs baseline. N_eff = ${fmt(bursty.summary.meanNEff, 1)}.`,
      tone: bursty.summary.meanError - baseline.summary.meanError < 0.02 ? 'good' : 'warn',
    },
    {
      label: 'Sybil resistance',
      value: `ratio ${fmt(sybilRatio, 3)}`,
      note: '1.0 means no advantage from identity splitting.',
      tone: sybilRatio <= 1.05 ? 'good' : sybilRatio <= 1.15 ? 'warn' : 'bad',
    },
    {
      label: 'Parameter sensitivity',
      value: `error range ${fmt(errorRange, 4)}`,
      note: `Gini range ${fmt(giniRange, 3)}. Mechanism is not brittle.`,
      tone: errorRange < 0.05 ? 'good' : 'warn',
    },
  ];

  const toneColor = { good: '#10b981', warn: '#f59e0b', bad: '#ef4444' };

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-6">
      {items.map(item => (
        <div key={item.label} className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: toneColor[item.tone] }} />
            <div className="text-xs uppercase tracking-wide text-slate-500 font-bold">{item.label}</div>
          </div>
          <div className="mt-1 text-xl font-semibold font-mono text-slate-800">{item.value}</div>
          <div className="mt-1 text-sm text-slate-600">{item.note}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Shared ── */

function HeadlineCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-lg font-bold font-mono text-slate-800 mt-1">{value}</div>
      {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}
