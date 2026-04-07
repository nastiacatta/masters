import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
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
import MathBlock from '@/components/dashboard/MathBlock';

const SEED = 42;
const N = 6;
const T = 300;

const TABS = ['Taxonomy', 'Intermittency', 'Adversarial', 'Hedging', 'Seasonality', 'Sensitivity'] as const;
type Tab = (typeof TABS)[number];

const FAMILIES = [
  { label: 'Participation', color: 'bg-sky-100 text-sky-700 border-sky-200',
    items: ['Baseline', 'Bursty', 'Selective entry'],
    desc: 'When and whether agents submit forecasts.' },
  { label: 'Reporting', color: 'bg-violet-100 text-violet-700 border-violet-200',
    items: ['Truthful', 'Hedged', 'Strategic', 'Noisy'],
    desc: 'What agents report — truthful belief or distorted.' },
  { label: 'Staking', color: 'bg-teal-100 text-teal-700 border-teal-200',
    items: ['Fixed', 'Kelly-like', 'Risk-averse'],
    desc: 'How much agents wager — bankroll management.' },
  { label: 'Identity', color: 'bg-amber-100 text-amber-700 border-amber-200',
    items: ['Single', 'Sybil (clone)', 'Collusion'],
    desc: 'Whether agents split into multiple accounts.' },
  { label: 'Adversarial', color: 'bg-red-100 text-red-700 border-red-200',
    items: ['Manipulation', 'Arbitrage', 'Evasion'],
    desc: 'Attacks optimised against the mechanism rules.' },
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

type Verdict = 'good' | 'neutral' | 'bad';
const VB: Record<Verdict, string> = { good: 'border-l-emerald-500', neutral: 'border-l-amber-400', bad: 'border-l-red-400' };
const VT: Record<Verdict, string> = { good: 'text-emerald-600', neutral: 'text-amber-600', bad: 'text-red-600' };
const VBG: Record<Verdict, string> = { good: 'bg-emerald-50', neutral: 'bg-amber-50', bad: 'bg-red-50' };

function VerdictCard({ question, answer, detail, verdict }: { question: string; answer: string; detail: string; verdict: Verdict }) {
  return (
    <div className={`rounded-xl border border-slate-200 border-l-4 ${VB[verdict]} ${VBG[verdict]} p-4`}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{question}</div>
      <div className={`text-xl font-bold font-mono mt-1 ${VT[verdict]}`}>{answer}</div>
      <div className="text-xs text-slate-500 mt-1">{detail}</div>
    </div>
  );
}

/** Compare two pipelines: returns {deltaPct, deltaAbs, verdict}. */
function compare(test: PipelineResult, base: PipelineResult) {
  const d = test.summary.meanError - base.summary.meanError;
  const pct = base.summary.meanError > 0 ? (d / base.summary.meanError * 100) : 0;
  return { deltaAbs: d, deltaPct: pct };
}


export default function BehaviourPage() {
  const [tab, setTab] = useState<Tab>('Taxonomy');

  // ── Core experiments (all paired against baseline, same seed/DGP) ──
  const baseline = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'baseline', rounds: T, seed: SEED, n: N }), []);
  const bursty = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'bursty', rounds: T, seed: SEED, n: N }), []);
  const sybil = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'sybil', rounds: T, seed: SEED, n: N }), []);
  const manipulator = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'manipulator', rounds: T, seed: SEED, n: N }), []);
  const arbitrageur = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'arbitrageur', rounds: T, seed: SEED, n: N }), []);
  const riskAverse = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'risk_averse', rounds: T, seed: SEED, n: N }), []);
  const collusion = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'collusion', rounds: T, seed: SEED, n: N }), []);
  const repReset = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'reputation_reset', rounds: T, seed: SEED, n: N }), []);
  const evader = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'evader', rounds: T, seed: SEED, n: N }), []);

  // ── Deposit policy comparison ──
  const depositFixed = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'baseline', rounds: T, seed: SEED, n: N, builder: { depositPolicy: 'fixed_unit' } }), []);
  const depositBankroll = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'baseline', rounds: T, seed: SEED, n: N, builder: { depositPolicy: 'wealth_fraction' } }), []);
  const depositSigma = useMemo(() => runPipeline({ dgpId: 'baseline', behaviourPreset: 'baseline', rounds: T, seed: SEED, n: N, builder: { depositPolicy: 'sigma_scaled' } }), []);

  // ── Sensitivity sweep ──
  const sweep = useMemo(() => {
    const lams = [0.0, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0];
    const sigs = [0.05, 0.1, 0.2, 0.3, 0.5];
    return lams.flatMap(lam => sigs.map(sig => {
      const p = runPipeline({ dgpId: 'baseline', behaviourPreset: 'baseline', rounds: T, seed: SEED, n: N, mechanism: { lam, sigma_min: sig } as Record<string, number> });
      return { lam, sig, error: p.summary.meanError, gini: p.summary.finalGini };
    }));
  }, []);

  // ── Summary table for all behaviours ──
  const behaviourSummary = useMemo(() => {
    const runs: { name: string; pipeline: PipelineResult; color: string }[] = [
      { name: 'Baseline', pipeline: baseline, color: '#94a3b8' },
      { name: 'Bursty', pipeline: bursty, color: '#0ea5e9' },
      { name: 'Risk-averse', pipeline: riskAverse, color: '#8b5cf6' },
      { name: 'Manipulator', pipeline: manipulator, color: '#ef4444' },
      { name: 'Arbitrageur', pipeline: arbitrageur, color: '#f59e0b' },
      { name: 'Sybil', pipeline: sybil, color: '#f97316' },
      { name: 'Collusion', pipeline: collusion, color: '#ec4899' },
      { name: 'Rep. reset', pipeline: repReset, color: '#dc2626' },
      { name: 'Evader', pipeline: evader, color: '#a855f7' },
    ];
    return runs.map(r => ({
      ...r,
      error: r.pipeline.summary.meanError,
      gini: r.pipeline.summary.finalGini,
      nEff: r.pipeline.summary.meanNEff,
      participation: r.pipeline.summary.meanParticipation,
      ...compare(r.pipeline, baseline),
    }));
  }, [baseline, bursty, riskAverse, manipulator, arbitrageur, sybil, collusion, repReset, evader]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <header>
          <div className="inline-block px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-[11px] font-semibold tracking-wide mb-4">
            Behaviour & Robustness
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Behaviour &amp; Robustness</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            The core mechanism is a pure state machine: it sees deposits, reports, and participation — never motives.
            This page tests what happens when agents deviate from truthful, full-participation behaviour.
            All experiments use paired comparison (same seed, same DGP, only behaviour changes).
          </p>
        </header>

        <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${tab === t ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              {t}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.15 }}>
            {tab === 'Taxonomy' && <TaxonomyTab summary={behaviourSummary} depositFixed={depositFixed} depositBankroll={depositBankroll} depositSigma={depositSigma} />}
            {tab === 'Intermittency' && <IntermittencyTab bursty={bursty} baseline={baseline} />}
            {tab === 'Adversarial' && <AdversarialTab manipulator={manipulator} arbitrageur={arbitrageur} sybil={sybil} collusion={collusion} repReset={repReset} evader={evader} baseline={baseline} />}
            {tab === 'Hedging' && <HedgingTab riskAverse={riskAverse} baseline={baseline} />}
            {tab === 'Seasonality' && <SeasonalityTab />}
            {tab === 'Sensitivity' && <SensitivityTab data={sweep} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════
   TAXONOMY — overview + cross-behaviour comparison table + deposit policy
   ══════════════════════════════════════════════════════════════════════ */
function TaxonomyTab({ summary, depositFixed, depositBankroll, depositSigma }: {
  summary: Array<{ name: string; color: string; error: number; gini: number; nEff: number; participation: number; deltaPct: number }>;
  depositFixed: PipelineResult; depositBankroll: PipelineResult; depositSigma: PipelineResult;
}) {
  const depositData = [
    { name: 'Fixed (b=1)', error: depositFixed.summary.meanError, gini: depositFixed.summary.finalGini, color: '#6366f1' },
    { name: 'Bankroll (f·W)', error: depositBankroll.summary.meanError, gini: depositBankroll.summary.finalGini, color: '#0d9488' },
    { name: 'σ-scaled', error: depositSigma.summary.meanError, gini: depositSigma.summary.finalGini, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-600 max-w-2xl">
        Following Lambert et al. (2008), the mechanism treats each agent as a policy π that outputs
        (participate, report, deposit). The core never depends on motives — only on observable actions.
        This separation lets us swap behaviours without touching the settlement logic.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FAMILIES.map(f => (
          <div key={f.label} className={`rounded-xl border p-5 ${f.color}`}>
            <div className="text-sm font-semibold mb-1">{f.label}</div>
            <div className="text-[11px] opacity-80 mb-2">{f.desc}</div>
            <div className="flex flex-wrap gap-1.5">
              {f.items.map(item => (
                <span key={item} className="text-[11px] bg-white/60 rounded px-2 py-0.5">{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Cross-behaviour comparison table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Cross-behaviour comparison</h3>
        <p className="text-xs text-slate-500 mb-3">
          All runs: {T} rounds, {N} agents, seed {SEED}, baseline DGP. Paired against truthful baseline.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-3 text-slate-400 font-medium">Behaviour</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">Mean CRPS</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">Δ vs base</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">Gini</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">N_eff</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">Participation</th>
              </tr>
            </thead>
            <tbody>
              {summary.map(r => (
                <tr key={r.name} className="border-b border-slate-50">
                  <td className="py-2 pr-3 font-medium" style={{ color: r.color }}>{r.name}</td>
                  <td className="text-right py-2 px-2 font-mono">{fmt(r.error, 4)}</td>
                  <td className={`text-right py-2 px-2 font-mono ${r.deltaPct > 1 ? 'text-red-500' : r.deltaPct < -1 ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {r.name === 'Baseline' ? '—' : `${r.deltaPct >= 0 ? '+' : ''}${r.deltaPct.toFixed(1)}%`}
                  </td>
                  <td className="text-right py-2 px-2 font-mono">{fmt(r.gini, 3)}</td>
                  <td className="text-right py-2 px-2 font-mono">{fmt(r.nEff, 1)}</td>
                  <td className="text-right py-2 px-2 font-mono">{fmt(r.participation / N * 100, 0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deposit policy comparison */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Deposit policy comparison</h3>
        <p className="text-xs text-slate-500 mb-3">
          The deposit policy determines how much of the skill signal reaches the aggregate.
          Fixed deposits isolate skill; wealth-scaled deposits introduce feedback loops.
        </p>
        <MathBlock accent label="Effective wager" latex="m_i = b_i \\cdot g(\\sigma_i), \\quad g(\\sigma) = \\lambda + (1-\\lambda)\\sigma^\\eta" />
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={depositData} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="name" tick={{ ...AXIS_TICK, fontSize: 11 }} stroke={AXIS_STROKE} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="error" name="Mean CRPS" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {depositData.map(d => <Cell key={d.name} fill={d.color} opacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════
   INTERMITTENCY — bursty participation + skill stability
   ══════════════════════════════════════════════════════════════════════ */
function IntermittencyTab({ bursty, baseline }: { bursty: PipelineResult; baseline: PipelineResult }) {
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

  // Cumulative error comparison
  const cumData = useMemo(() => {
    let sB = 0, sBu = 0;
    return downsample(Array.from({ length: Math.min(baseline.rounds.length, bursty.rounds.length) }, (_, i) => {
      sB += baseline.rounds[i].error; sBu += bursty.rounds[i].error;
      return { round: i + 1, baseline: sB / (i + 1), bursty: sBu / (i + 1) };
    }), 300);
  }, [baseline.rounds, bursty.rounds]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600 max-w-2xl">
        Real forecasters go offline — sensors fail, models retrain, participants skip rounds.
        Following Vitali & Pinson (2024), the mechanism must handle missing submissions without
        corrupting skill estimates. The EWMA update freezes when an agent is absent:
      </p>
      <MathBlock accent label="EWMA skill update" latex="L_{i,t} = \\begin{cases} (1-\\rho)L_{i,t-1} + \\rho\\,\\ell_{i,t} & \\text{if present} \\\\ L_{i,t-1} & \\text{if absent} \\end{cases}" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <VerdictCard question="Degrades gracefully?" answer={degradesGracefully ? 'Yes' : 'No'}
          detail={`Error ${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(1)}% vs baseline`}
          verdict={degradesGracefully ? 'good' : 'bad'} />
        <Metric label="Mean CRPS (bursty)" value={fmt(bursty.summary.meanError, 4)} />
        <Metric label="Avg participation" value={`${(bursty.summary.meanParticipation / N * 100).toFixed(0)}%`} sub={`of ${N} agents`} />
        <Metric label="Final Gini" value={fmt(bursty.summary.finalGini, 3)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Participation per round" subtitle="Green ≥ 80%, amber ≥ 50%, red < 50%. Bursty pattern with ~22-round period.">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={partData} margin={CHART_MARGIN_LABELED}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, N]} />
              <Tooltip content={<SmartTooltip />} />
              <Bar dataKey="active" name="Active" radius={[2, 2, 0, 0]} maxBarSize={4}>
                {partData.map((d, i) => <Cell key={i} fill={d.rate >= 0.8 ? '#10b981' : d.rate >= 0.5 ? '#f59e0b' : '#ef4444'} opacity={0.7} />)}
              </Bar>
              <Brush dataKey="round" {...BRUSH_PROPS} />
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
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={skillData} margin={CHART_MARGIN_LABELED}
                onMouseDown={skillZoom.onMouseDown} onMouseMove={skillZoom.onMouseMove} onMouseUp={skillZoom.onMouseUp}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[skillZoom.state.left, skillZoom.state.right]} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]} />
                <Tooltip content={<SmartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 9 }} />
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

      <ChartCard title="Cumulative error: bursty vs baseline" subtitle="If lines track closely, intermittency doesn't hurt the aggregate. Drag to zoom.">
        <ResponsiveContainer width="100%" height={260}>
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
            <Brush dataKey="round" {...BRUSH_PROPS} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        On real data (Notes page), the mechanism still improves by +4.4% at 60% missingness.
        This aligns with Vitali & Pinson's robust regression approach, which handles missing forecasts
        via a linear correction matrix D that compensates for absent sellers.
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════
   ADVERSARIAL — manipulation, arbitrage, sybil
   ══════════════════════════════════════════════════════════════════════ */
function AdversarialTab({ manipulator, arbitrageur, sybil, collusion, repReset, evader, baseline }: {
  manipulator: PipelineResult; arbitrageur: PipelineResult; sybil: PipelineResult;
  collusion: PipelineResult; repReset: PipelineResult; evader: PipelineResult; baseline: PipelineResult;
}) {
  const sigDecayZoom = useChartZoom();

  // Attacker profits (F1 = attacker for most, F6 = arbitrageur)
  const W0 = 20;
  const manipProfit = manipulator.finalState[0].wealth - W0;
  const baseProfit0 = baseline.finalState[0].wealth - W0;
  const arbIdx = arbitrageur.finalState.length - 1;
  const arbProfit = arbitrageur.finalState[arbIdx].wealth - W0;
  const arbBaseline = baseline.finalState[arbIdx].wealth - W0;
  const sybilProfit = sybil.finalState.slice(0, 2).reduce((a, s) => a + s.wealth, 0);
  const baselinePairProfit = baseline.finalState.slice(0, 2).reduce((a, s) => a + s.wealth, 0);
  const sybilRatio = baselinePairProfit > 0 ? sybilProfit / baselinePairProfit : 1;

  const attacks = [
    { name: 'Baseline', error: baseline.summary.meanError, gini: baseline.summary.finalGini, color: '#94a3b8' },
    { name: 'Manipulator', error: manipulator.summary.meanError, gini: manipulator.summary.finalGini, color: '#ef4444' },
    { name: 'Arbitrageur', error: arbitrageur.summary.meanError, gini: arbitrageur.summary.finalGini, color: '#f59e0b' },
    { name: 'Sybil', error: sybil.summary.meanError, gini: sybil.summary.finalGini, color: '#f97316' },
    { name: 'Collusion', error: collusion.summary.meanError, gini: collusion.summary.finalGini, color: '#ec4899' },
    { name: 'Rep. reset', error: repReset.summary.meanError, gini: repReset.summary.finalGini, color: '#dc2626' },
    { name: 'Evader', error: evader.summary.meanError, gini: evader.summary.finalGini, color: '#a855f7' },
  ];

  // Sigma trajectories for manipulator and reputation reset (F1)
  const sigmaTraces = useMemo(() => downsample(
    Array.from({ length: Math.min(manipulator.traces.length, repReset.traces.length, baseline.traces.length) }, (_, i) => ({
      round: i + 1,
      honest: baseline.traces[i].sigma_t[0],
      manipulator: manipulator.traces[i].sigma_t[0],
      rep_reset: repReset.traces[i].sigma_t[0],
      evader: evader.traces[i]?.sigma_t[0] ?? 0,
    })), 300),
  [manipulator.traces, repReset.traces, baseline.traces, evader.traces]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600 max-w-2xl">
        Six attack types from the thesis, each optimised against the mechanism's rules.
        The weighted-score payoff (Lambert 2008) is:
      </p>
      <MathBlock accent label="Payoff" latex="\\Pi_i = m_i\\left(1 + s(r_i, \\omega) - \\frac{\\sum_j m_j\\, s(r_j, \\omega)}{\\sum_j m_j}\\right)" />
      <p className="text-sm text-slate-600 max-w-2xl">
        Chen et al. (2014) proved WSWMs admit an arbitrage interval: any prediction
        within a certain range yields nonneg payoff for both outcomes.
        The arbitrageur uses the simplest strategy: report the mean of others' reports.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <VerdictCard question="Manipulation profitable?" answer={manipProfit > baseProfit0 + 0.5 ? 'Yes' : 'No'}
          detail={`F1: ${fmt(manipProfit, 2)} vs ${fmt(baseProfit0, 2)} honest`}
          verdict={manipProfit > baseProfit0 + 0.5 ? 'bad' : 'good'} />
        <VerdictCard question="Arbitrage profitable?" answer={arbProfit > arbBaseline + 0.5 ? 'Yes' : 'No'}
          detail={`F6: ${fmt(arbProfit, 2)} vs ${fmt(arbBaseline, 2)} honest`}
          verdict={arbProfit > arbBaseline + 0.5 ? 'bad' : 'good'} />
        <VerdictCard question="Sybil-resistant?" answer={sybilRatio <= 1.05 ? 'Yes' : 'No'}
          detail={`Clone pair ratio: ${fmt(sybilRatio, 3)}`}
          verdict={sybilRatio <= 1.05 ? 'good' : 'bad'} />
      </div>

      {/* Attack comparison table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Attack impact comparison</h3>
        <p className="text-xs text-slate-500 mb-3">
          Each attack runs on the same DGP/seed. Only the attacker's behaviour changes.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-3 text-slate-400 font-medium">Attack</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">Mean CRPS</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">Δ vs base</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">Gini</th>
                <th className="text-left py-2 px-2 text-slate-400 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                { ...attacks[0], desc: 'All agents truthful' },
                { ...attacks[1], desc: 'F1 pushes aggregate toward 0.5' },
                { ...attacks[2], desc: 'F6 reports mean of others (Chen arb.)' },
                { ...attacks[3], desc: 'F1–F2 clone with split deposit' },
                { ...attacks[4], desc: 'F1–F2 coordinate participation + reports' },
                { ...attacks[5], desc: 'F1 honest 100 rounds, then manipulates' },
                { ...attacks[6], desc: 'F1 adapts misreport to dispersion' },
              ].map((r, i) => {
                const delta = i === 0 ? 0 : (r.error - attacks[0].error) / attacks[0].error * 100;
                return (
                  <tr key={r.name} className="border-b border-slate-50">
                    <td className="py-2 pr-3 font-medium" style={{ color: r.color }}>{r.name}</td>
                    <td className="text-right py-2 px-2 font-mono">{fmt(r.error, 4)}</td>
                    <td className={`text-right py-2 px-2 font-mono ${delta > 1 ? 'text-red-500' : delta < -1 ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {i === 0 ? '—' : `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`}
                    </td>
                    <td className="text-right py-2 px-2 font-mono">{fmt(r.gini, 3)}</td>
                    <td className="py-2 px-2 text-slate-500">{r.desc}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Accuracy impact by attack" subtitle="Mean CRPS. Higher = worse aggregate.">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={attacks} margin={{ ...CHART_MARGIN_LABELED, bottom: 32 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="name" tick={{ ...AXIS_TICK, fontSize: 9 }} stroke={AXIS_STROKE} angle={-20} textAnchor="end" />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <Tooltip content={<SmartTooltip />} />
              <Bar dataKey="error" name="Mean CRPS" radius={[4, 4, 0, 0]} maxBarSize={36}>
                {attacks.map(d => <Cell key={d.name} fill={d.color} opacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Attacker σ decay</h3>
            <ZoomBadge isZoomed={sigDecayZoom.state.isZoomed} onReset={sigDecayZoom.reset} />
          </div>
          <p className="text-xs text-slate-500 mb-2">F1's skill estimate under different attacks. Misreporting erodes σ. Drag to zoom.</p>
          <div className="cursor-crosshair">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={sigmaTraces} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
                onMouseDown={sigDecayZoom.onMouseDown} onMouseMove={sigDecayZoom.onMouseMove} onMouseUp={sigDecayZoom.onMouseUp}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[sigDecayZoom.state.left, sigDecayZoom.state.right]} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]}
                  label={{ value: 'σ (F1)', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<SmartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                <Line type="monotone" dataKey="honest" name="Honest" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="manipulator" name="Manipulator" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="rep_reset" name="Rep. reset" stroke="#dc2626" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                <Line type="monotone" dataKey="evader" name="Evader" stroke="#a855f7" strokeWidth={1.5} dot={false} />
                {sigDecayZoom.state.refLeft && sigDecayZoom.state.refRight && (
                  <ReferenceArea x1={sigDecayZoom.state.refLeft} x2={sigDecayZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
                )}
                <Brush dataKey="round" {...BRUSH_PROPS} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 space-y-2">
        <p>
          The skill gate is the primary defence. Misreporting increases CRPS loss → raises L → lowers σ → reduces m_i.
          The reputation reset attack (honest then exploit) shows the mechanism recovers: once F1 starts manipulating,
          σ drops within ~20 rounds (EWMA half-life ≈ 7 rounds with ρ = 0.1).
        </p>
        <p>
          The Chen arbitrageur reports the mean of others' predictions — guaranteed nonneg payoff per round.
          But in the repeated setting, this strategy earns mediocre scores (it can't beat the best forecaster),
          so σ stays moderate and the arbitrageur doesn't dominate.
        </p>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════
   HEDGING — risk-averse reporting and staking
   ══════════════════════════════════════════════════════════════════════ */
function HedgingTab({ riskAverse, baseline }: { riskAverse: PipelineResult; baseline: PipelineResult }) {
  const { deltaPct } = compare(riskAverse, baseline);
  const cumZoom = useChartZoom();
  const sigZoom = useChartZoom();

  const cumData = useMemo(() => {
    let sB = 0, sH = 0;
    return downsample(Array.from({ length: Math.min(baseline.rounds.length, riskAverse.rounds.length) }, (_, i) => {
      sB += baseline.rounds[i].error; sH += riskAverse.rounds[i].error;
      return { round: i + 1, baseline: sB / (i + 1), hedged: sH / (i + 1) };
    }), 300);
  }, [baseline.rounds, riskAverse.rounds]);

  // Compare sigma trajectories: hedged agents should have lower sigma (less accurate reports)
  const sigmaData = useMemo(() => downsample(
    Array.from({ length: Math.min(baseline.traces.length, riskAverse.traces.length) }, (_, i) => ({
      round: i + 1,
      baseline_avg: baseline.traces[i].sigma_t.reduce((a, b) => a + b, 0) / N,
      hedged_avg: riskAverse.traces[i].sigma_t.reduce((a, b) => a + b, 0) / N,
    })), 300),
  [baseline.traces, riskAverse.traces]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600 max-w-2xl">
        Risk-averse agents shrink reports toward the centre and stake less.
        This is rational under concave utility — it reduces payoff variance at the cost of informativeness.
        The hedged report is:
      </p>
      <MathBlock accent label="Hedged report" latex="\\hat{r}_i = 0.7 \\cdot r_i^{\\text{true}} + 0.3 \\cdot 0.5, \\quad f_{\\text{risk}} \\leftarrow 0.55 \\cdot f_{\\text{risk}}" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <VerdictCard question="Accuracy hurt?" answer={Math.abs(deltaPct) < 5 ? 'Minimal' : deltaPct > 0 ? 'Yes' : 'Improved'}
          detail={`Error ${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(1)}% vs baseline`}
          verdict={Math.abs(deltaPct) < 5 ? 'good' : deltaPct > 5 ? 'bad' : 'good'} />
        <Metric label="Mean CRPS (hedged)" value={fmt(riskAverse.summary.meanError, 4)} />
        <Metric label="Mean CRPS (baseline)" value={fmt(baseline.summary.meanError, 4)} />
        <Metric label="Gini (hedged)" value={fmt(riskAverse.summary.finalGini, 3)} sub={`vs ${fmt(baseline.summary.finalGini, 3)}`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Cumulative error: hedged vs truthful" subtitle="Close tracking means hedging doesn't break the aggregate. Drag to zoom.">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={cumData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
              onMouseDown={cumZoom.onMouseDown} onMouseMove={cumZoom.onMouseMove} onMouseUp={cumZoom.onMouseUp}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[cumZoom.state.left, cumZoom.state.right]} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                label={{ value: 'Cumulative CRPS', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="baseline" name="Truthful" stroke="#94a3b8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="hedged" name="Hedged" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              {cumZoom.state.refLeft && cumZoom.state.refRight && (
                <ReferenceArea x1={cumZoom.state.refLeft} x2={cumZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
              )}
              <Brush dataKey="round" {...BRUSH_PROPS} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Average skill estimate (σ)" subtitle="Hedged agents get lower σ because their reports are less accurate. Drag to zoom.">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={sigmaData} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
              onMouseDown={sigZoom.onMouseDown} onMouseMove={sigZoom.onMouseMove} onMouseUp={sigZoom.onMouseUp}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[sigZoom.state.left, sigZoom.state.right]} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]}
                label={{ value: 'Avg σ', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="baseline_avg" name="Truthful avg σ" stroke="#94a3b8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="hedged_avg" name="Hedged avg σ" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              {sigZoom.state.refLeft && sigZoom.state.refRight && (
                <ReferenceArea x1={sigZoom.state.refLeft} x2={sigZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
              )}
              <Brush dataKey="round" {...BRUSH_PROPS} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        The mechanism tolerates hedging because the skill layer measures actual forecast quality,
        not boldness. Hedged agents get lower σ (less influence) but don't break the system.
        This is consistent with Lambert's individual rationality property: agents always prefer
        participating (even cautiously) to not participating.
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════
   SEASONALITY — real-data regime shifts
   ══════════════════════════════════════════════════════════════════════ */
function SeasonalityTab() {
  const SEASON_DATA = [
    { season: 'Winter', pct: 17.3, color: '#6366f1' },
    { season: 'Spring', pct: 14.3, color: '#0ea5e9' },
    { season: 'Autumn', pct: 14.6, color: '#f59e0b' },
    { season: 'Summer', pct: 11.8, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600 max-w-2xl">
        Wind patterns change across seasons. The EWMA skill layer adapts automatically —
        no explicit regime detection needed. Data: Elia Belgian offshore wind, 17,544 hourly points,
        5 forecasting models. All improvements significant (DM test, p &lt; 0.001).
      </p>

      <div className="grid sm:grid-cols-4 gap-3">
        {SEASON_DATA.map(s => (
          <div key={s.season} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <div className="text-xs text-slate-400 font-medium">{s.season}</div>
            <div className="text-2xl font-bold font-mono mt-1" style={{ color: s.color }}>+{s.pct}%</div>
            <div className="text-[10px] text-slate-400 mt-1">vs equal weighting</div>
          </div>
        ))}
      </div>

      <ChartCard title="Mechanism improvement by season" subtitle="% CRPS improvement over equal weighting on real wind data.">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={SEASON_DATA} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="season" tick={{ ...AXIS_TICK, fontSize: 12 }} stroke={AXIS_STROKE} />
            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 20]}
              label={{ value: '% improvement', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
            <Tooltip contentStyle={TOOLTIP_STYLE as React.CSSProperties} formatter={(v: unknown) => [`+${Number(v).toFixed(1)}%`, 'vs equal']} />
            <Bar dataKey="pct" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {SEASON_DATA.map(s => <Cell key={s.season} fill={s.color} opacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        Winter gains are largest (+17.3%) because wind variability is highest and model quality
        differences are most pronounced. The EWMA with ρ = 0.1 has a half-life of ~7 rounds,
        fast enough to track seasonal shifts without overfitting to noise.
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SENSITIVITY — λ × σ_min parameter sweep
   ══════════════════════════════════════════════════════════════════════ */
function SensitivityTab({ data }: { data: { lam: number; sig: number; error: number; gini: number }[] }) {
  const best = data.reduce((a, b) => a.error < b.error ? a : b);
  const worst = data.reduce((a, b) => a.error > b.error ? a : b);
  const range = worst.error - best.error;
  const relRange = best.error > 0 ? (range / best.error * 100) : 0;
  const notBrittle = relRange < 30;

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
        The skill gate g(σ) = λ + (1−λ)σ^η has two key parameters.
        λ controls the floor (how much influence an unskilled agent retains).
        σ_min sets the minimum skill estimate. A robust mechanism should vary smoothly.
      </p>
      <MathBlock accent label="Skill gate" latex="g(\\sigma_i) = \\lambda + (1-\\lambda)\\,\\sigma_i^\\eta, \\quad \\sigma_i = \\sigma_{\\min} + (1-\\sigma_{\\min})\\,e^{-\\gamma L_i}" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <VerdictCard question="Brittle?" answer={notBrittle ? 'No' : 'Yes'}
          detail={`Error varies ${relRange.toFixed(0)}% across ${data.length} configs`}
          verdict={notBrittle ? 'good' : 'bad'} />
        <Metric label="Best" value={`λ=${best.lam}, σ=${best.sig}`} sub={`CRPS ${fmt(best.error, 4)}`} />
        <Metric label="Worst" value={`λ=${worst.lam}, σ=${worst.sig}`} sub={`CRPS ${fmt(worst.error, 4)}`} />
        <Metric label="Gini range" value={fmt(Math.max(...data.map(d => d.gini)) - Math.min(...data.map(d => d.gini)), 3)} />
      </div>

      <ChartCard title="Mean CRPS by λ and σ_min" subtitle={`${data.length} configs, ${T} rounds each. Lower is better.`}>
        <ResponsiveContainer width="100%" height={320}>
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

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        Error varies smoothly — no cliff edges. λ = 0 (pure skill, no floor) performs worst because
        it gives zero influence to new agents. High σ_min reduces differentiation.
        The production config (λ = 0.3, σ_min = 0.1) is near-optimal.
      </div>
    </div>
  );
}
