import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell, Label,
  Brush, ReferenceArea,
} from 'recharts';
import { runPipeline, type PipelineResult } from '@/lib/coreMechanism/runPipeline';
import ChartCard from '@/components/dashboard/ChartCard';
import {
  AGENT_PALETTE, CHART_MARGIN_LABELED, GRID_PROPS, AXIS_TICK, AXIS_STROKE,
  TOOLTIP_STYLE, BRUSH_PROPS, fmt, downsample, agentName,
} from '@/components/lab/shared';
import { useChartZoom } from '@/hooks/useChartZoom';
import ZoomBadge from '@/components/charts/ZoomBadge';

const SEED = 42;
const N = 6;
const T = 200;

const TABS = ['Taxonomy', 'Intermittency', 'Sybil', 'Sensitivity'] as const;
type Tab = (typeof TABS)[number];

const FAMILIES = [
  { label: 'Participation', color: 'bg-sky-100 text-sky-700 border-sky-200', items: ['Intermittent', 'Bursty', 'Selective entry'] },
  { label: 'Reporting', color: 'bg-violet-100 text-violet-700 border-violet-200', items: ['Truthful', 'Hedged', 'Strategic', 'Noisy'] },
  { label: 'Staking', color: 'bg-teal-100 text-teal-700 border-teal-200', items: ['Fixed', 'Kelly-like', 'House-money'] },
  { label: 'Identity', color: 'bg-amber-100 text-amber-700 border-amber-200', items: ['Single', 'Sybil', 'Collusion'] },
  { label: 'Adversarial', color: 'bg-red-100 text-red-700 border-red-200', items: ['Arbitrage', 'Manipulation', 'Evasion', 'Insider'] },
] as const;

function SmartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: number | string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE}>
      <div className="font-medium text-slate-700 text-[11px] mb-1">{typeof label === 'number' ? `Round ${label}` : label}</div>
      {payload.filter(p => p.value != null).map(p => (
        <div key={p.dataKey} className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}</span>
          <span className="font-mono font-medium ml-auto">{fmt(p.value, 4)}</span>
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-lg font-bold font-mono text-slate-800 mt-1">{value}</div>
      {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}


export default function BehaviourPage() {
  const [tab, setTab] = useState<Tab>('Taxonomy');

  const baseline = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'baseline', rounds: T, seed: SEED, n: N }), []);
  const bursty = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'bursty', rounds: T, seed: SEED, n: N }), []);
  const sybil = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'sybil', rounds: T, seed: SEED, n: N }), []);

  const sweep = useMemo(() => {
    const lams = [0.0, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0];
    const sigs = [0.05, 0.1, 0.2, 0.3, 0.5];
    return lams.flatMap(lam => sigs.map(sig => {
      const p = runPipeline({ dgpId: 'baseline', behaviourPreset: 'baseline', rounds: 100, seed: SEED, n: N, mechanism: { lam, sigma_min: sig } as Record<string, number> });
      return { lam, sig, error: p.summary.meanError, gini: p.summary.finalGini };
    }));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        <header>
          <div className="inline-block px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-[11px] font-semibold tracking-wide mb-4">
            Behaviour & Robustness
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            How do agents behave, and does the mechanism hold up?
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            The mechanism separates deterministic core from strategic behaviour. This page explores both.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${tab === t ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              {t}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.15 }}>
            {tab === 'Taxonomy' && <TaxonomyTab />}
            {tab === 'Intermittency' && <IntermittencyTab bursty={bursty} baseline={baseline} />}
            {tab === 'Sybil' && <SybilTab sybil={sybil} baseline={baseline} />}
            {tab === 'Sensitivity' && <SensitivityTab data={sweep} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Taxonomy ── */
function TaxonomyTab() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600 max-w-2xl">
        The mechanism treats each user as a policy that outputs actions. The core never depends on motives — it only sees deposits, reports, and participation. This lets us swap behaviours without touching the mechanism.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FAMILIES.map(f => (
          <div key={f.label} className={`rounded-xl border p-5 ${f.color}`}>
            <div className="text-sm font-semibold mb-2">{f.label}</div>
            <div className="flex flex-wrap gap-1.5">
              {f.items.map(item => (
                <span key={item} className="text-[10px] bg-white/60 rounded px-2 py-0.5">{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        Each family is tested via dedicated experiments. Select a tab above to see intermittency, sybil, or sensitivity results.
      </div>
    </div>
  );
}

/* ── Intermittency ── */
function IntermittencyTab({ bursty, baseline }: { bursty: PipelineResult; baseline: PipelineResult }) {
  const skillZoom = useChartZoom();
  const skillData = useMemo(() => {
    return downsample(bursty.traces.map((t, i) => {
      const pt: Record<string, number> = { round: i + 1 };
      for (let j = 0; j < N; j++) pt[`F${j + 1}`] = t.sigma_t[j];
      return pt;
    }), 300);
  }, [bursty.traces]);

  const partData = useMemo(() => downsample(bursty.rounds.map(r => ({
    round: r.round, active: r.participation, rate: r.participation / N,
  })), 300), [bursty.rounds]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600 max-w-2xl">
        Agents may participate intermittently — bursty sessions, selective entry, or random absence. The mechanism must handle missing forecasters without breaking skill estimates or budget balance.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="Mean error (bursty)" value={fmt(bursty.summary.meanError, 4)} />
        <Metric label="Mean error (baseline)" value={fmt(baseline.summary.meanError, 4)} />
        <Metric label="Avg participation" value={`${(bursty.summary.meanParticipation / N * 100).toFixed(0)}%`} />
        <Metric label="Final Gini" value={fmt(bursty.summary.finalGini, 3)} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Participation" subtitle="Active agents per round under bursty behaviour.">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={partData} margin={CHART_MARGIN_LABELED}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, N]} />
              <Tooltip content={<SmartTooltip />} />
              <Bar dataKey="active" name="Active" radius={[2, 2, 0, 0]} maxBarSize={6}>
                {partData.map((d, i) => <Cell key={i} fill={d.rate >= 0.8 ? '#10b981' : d.rate >= 0.5 ? '#f59e0b' : '#ef4444'} opacity={0.7} />)}
              </Bar>
              <Brush dataKey="round" {...BRUSH_PROPS} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Skill trajectories</h3>
            <ZoomBadge isZoomed={skillZoom.state.isZoomed} onReset={skillZoom.reset} />
          </div>
          <p className="text-xs text-slate-500 mb-2">σ by agent. Skill stays stable despite intermittent participation.</p>
          <div className="cursor-crosshair">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={skillData} margin={CHART_MARGIN_LABELED}
                onMouseDown={skillZoom.onMouseDown} onMouseMove={skillZoom.onMouseMove} onMouseUp={skillZoom.onMouseUp}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[skillZoom.state.left, skillZoom.state.right]} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]} />
                <Tooltip content={<SmartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                {Array.from({ length: N }, (_, i) => (
                  <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={agentName(i)}
                    stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={1.5} dot={false} />
                ))}
                {skillZoom.state.refLeft && skillZoom.state.refRight && (
                  <ReferenceArea x1={skillZoom.state.refLeft} x2={skillZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
                )}
                <Brush dataKey="round" {...BRUSH_PROPS} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sybil ── */
function SybilTab({ sybil, baseline }: { sybil: PipelineResult; baseline: PipelineResult }) {
  const wealthZoom = useChartZoom();
  const sybilProfit = sybil.finalState.slice(0, 2).reduce((a, s) => a + s.wealth, 0);
  const baselineProfit = baseline.finalState.slice(0, 2).reduce((a, s) => a + s.wealth, 0);
  const ratio = baselineProfit > 0 ? sybilProfit / baselineProfit : 1;

  const wealthData = useMemo(() => {
    const n = sybil.traces[0]?.participated.length ?? N;
    return downsample(sybil.traces.map((t, i) => {
      const pt: Record<string, number> = { round: i + 1 };
      for (let j = 0; j < n; j++) pt[`F${j + 1}`] = t.wealth_after[j];
      return pt;
    }), 300);
  }, [sybil.traces]);

  const nAgents = sybil.traces[0]?.participated.length ?? N;

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600 max-w-2xl">
        Can an agent gain by splitting into multiple identities? The skill gate means each clone must individually earn its skill estimate, so splitting doesn't help.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="Profit ratio" value={fmt(ratio, 3)} sub={ratio <= 1 ? '≤ 1 → no advantage' : '> 1 → advantage'} />
        <Metric label="Sybil pair wealth" value={fmt(sybilProfit, 2)} />
        <Metric label="Baseline pair wealth" value={fmt(baselineProfit, 2)} />
        <Metric label="Final Gini" value={fmt(sybil.summary.finalGini, 3)} />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-semibold text-slate-800">Wealth under sybil</h3>
          <ZoomBadge isZoomed={wealthZoom.state.isZoomed} onReset={wealthZoom.reset} />
        </div>
        <p className="text-xs text-slate-500 mb-2">F1–F2 are sybil clones. Their combined wealth doesn't exceed the baseline.</p>
        <div className="cursor-crosshair">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={wealthData} margin={CHART_MARGIN_LABELED}
              onMouseDown={wealthZoom.onMouseDown} onMouseMove={wealthZoom.onMouseMove} onMouseUp={wealthZoom.onMouseUp}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[wealthZoom.state.left, wealthZoom.state.right]} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <ReferenceLine y={20} stroke="#94a3b8" strokeDasharray="4 4"><Label value="W₀" position="right" fill="#94a3b8" fontSize={9} /></ReferenceLine>
              {Array.from({ length: nAgents }, (_, i) => (
                <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={agentName(i)}
                  stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                  strokeWidth={i < 2 ? 2.5 : 1.2} strokeOpacity={i < 2 ? 1 : 0.5} dot={false} />
              ))}
              {wealthZoom.state.refLeft && wealthZoom.state.refRight && (
                <ReferenceArea x1={wealthZoom.state.refLeft} x2={wealthZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
              )}
              <Brush dataKey="round" {...BRUSH_PROPS} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ── Sensitivity ── */
function SensitivityTab({ data }: { data: { lam: number; sig: number; error: number; gini: number }[] }) {
  const best = data.reduce((a, b) => a.error < b.error ? a : b);
  const worst = data.reduce((a, b) => a.error > b.error ? a : b);
  const lams = [...new Set(data.map(d => d.lam))].sort((a, b) => a - b);
  const sigs = [...new Set(data.map(d => d.sig))].sort((a, b) => a - b);
  const sigColors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

  const barData = lams.map(lam => {
    const row: Record<string, number | string> = { lam: `λ=${lam}` };
    for (const sig of sigs) {
      const pt = data.find(d => d.lam === lam && d.sig === sig);
      if (pt) row[`σ=${sig}`] = pt.error;
    }
    return row;
  });

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600 max-w-2xl">
        How sensitive is the mechanism to its two key parameters? λ controls how much stake matters vs skill. σ_min sets the floor on skill estimates. The mechanism is not brittle — accuracy varies smoothly.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="Best config" value={`λ=${best.lam}, σ=${best.sig}`} sub={`error ${fmt(best.error, 4)}`} />
        <Metric label="Worst config" value={`λ=${worst.lam}, σ=${worst.sig}`} sub={`error ${fmt(worst.error, 4)}`} />
        <Metric label="Error range" value={fmt(worst.error - best.error, 4)} />
        <Metric label="Gini range" value={fmt(Math.max(...data.map(d => d.gini)) - Math.min(...data.map(d => d.gini)), 3)} />
      </div>
      <ChartCard title="Mean error by λ and σ_min" subtitle="Grouped by λ, coloured by σ_min. Lower is better.">
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={barData} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="lam" tick={{ ...AXIS_TICK, fontSize: 12 }} stroke={AXIS_STROKE} />
            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
            <Tooltip content={<SmartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {sigs.map((sig, i) => (
              <Bar key={sig} dataKey={`σ=${sig}`} name={`σ_min=${sig}`}
                fill={sigColors[i % sigColors.length]} radius={[3, 3, 0, 0]} maxBarSize={20} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
