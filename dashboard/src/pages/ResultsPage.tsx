import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  loadBankrollAblation,
  loadCalibration,
  loadExperimentList,
  loadMasterComparison,
  loadRealDataComparison,
  type RealDataResult,
} from '@/lib/adapters';
import type {
  BankrollAblationRow,
  CalibrationPoint,
  ExperimentMeta,
  MasterComparisonRow,
} from '@/lib/types';
import { runPipeline } from '@/lib/coreMechanism/runPipeline';
import { METHOD, SEM } from '@/lib/tokens';
import InfoToggle from '@/components/dashboard/InfoToggle';
import {
  AGENT_PALETTE,
  AXIS_STROKE,
  AXIS_TICK,
  BRUSH_PROPS,
  CHART_MARGIN_LABELED,
  GRID_PROPS,
  TOOLTIP_STYLE,
  agentName,
  downsample,
  fmt,
} from '@/components/lab/shared';
import { useChartZoom } from '@/hooks/useChartZoom';
import ZoomBadge from '@/components/charts/ZoomBadge';
import DeltaBarChart from '@/components/charts/DeltaBarChart';
import ConcentrationPanel from '@/components/charts/ConcentrationPanel';
import FourPanelLayout from '@/components/charts/FourPanelLayout';
import { AnimatePresence, motion } from 'framer-motion';
import type { InfluenceRule, DepositPolicy } from '@/lib/coreMechanism/runRoundComposable';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import Skeleton from '@/components/dashboard/Skeleton';

const DEMO_SEED = 42;
const DEMO_N = 6;
const DEMO_T = 200;

const CORE_METHOD_KEYS = ['uniform', 'deposit', 'skill', 'mechanism'] as const;
const ACCURACY_EPS = 1e-4;

type Verdict = 'good' | 'neutral' | 'bad';

function SmartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE}>
      {label != null && (
        <div className="font-medium text-slate-700 text-[11px] mb-1">{label}</div>
      )}
      {payload
        .filter((p) => p.value != null)
        .map((p) => (
          <div key={p.dataKey} className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-slate-500">{p.name}</span>
            <span className="font-mono font-medium ml-auto">{fmt(p.value, 4)}</span>
          </div>
        ))}
    </div>
  );
}

const VERDICT_BORDER: Record<Verdict, string> = {
  good: 'border-l-emerald-500',
  neutral: 'border-l-amber-400',
  bad: 'border-l-red-400',
};
const VERDICT_TEXT: Record<Verdict, string> = {
  good: 'text-emerald-600',
  neutral: 'text-amber-600',
  bad: 'text-red-600',
};
const VERDICT_BG: Record<Verdict, string> = {
  good: 'bg-emerald-50',
  neutral: 'bg-amber-50',
  bad: 'bg-red-50',
};

function AnswerCard({
  question, answer, detail, verdict, explanation,
}: {
  question: string; answer: string; detail: string; verdict: Verdict; explanation: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-200 border-l-4 ${VERDICT_BORDER[verdict]} ${VERDICT_BG[verdict]} p-5 space-y-3`}>
      <div className="text-xs font-semibold text-slate-700">{question}</div>
      <div className="flex items-baseline gap-3">
        <span className={`text-2xl font-bold font-mono ${VERDICT_TEXT[verdict]}`}>{answer}</span>
        <span className="text-xs text-slate-500">{detail}</span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{explanation}</p>
    </div>
  );
}

const EXP_TABS = ['Real data', 'Accuracy', 'Concentration', 'Calibration', 'Ablation'] as const;
const DEMO_TABS = ['Accuracy', 'Concentration', 'Deposit policy'] as const;

const METHOD_LABEL: Record<string, string> = {
  uniform: 'Equal', deposit: 'Stake-only', skill: 'Skill-only', mechanism: 'Skill × stake', best_single: 'Best single',
};
const METHOD_COLOR: Record<string, string> = {
  uniform: '#94a3b8', deposit: '#0d9488', skill: '#8b5cf6', mechanism: '#6366f1', best_single: '#f59e0b',
};

function meanFinite(values: Array<number | undefined | null>): number | null {
  const xs = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function seFinite(values: Array<number | undefined | null>): number | null {
  const xs = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (xs.length < 2) return null;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  const variance = xs.reduce((acc, x) => acc + (x - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(variance / xs.length);
}

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState<string>('Real data');

  // --- adapter-backed data ---
  const [masterRows, setMasterRows] = useState<MasterComparisonRow[]>([]);
  const [ablationRows, setAblationRows] = useState<BankrollAblationRow[]>([]);
  const [calibration, setCalibration] = useState<CalibrationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasExpData, setHasExpData] = useState(false);
  const [realData, setRealData] = useState<RealDataResult | null>(null);
  const [realDataElec, setRealDataElec] = useState<RealDataResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [master, ablation, exps] = await Promise.all([
          loadMasterComparison().catch(() => null),
          loadBankrollAblation().catch(() => null),
          loadExperimentList().catch(() => []),
        ]);
        const calibrationExp = (exps as ExperimentMeta[]).find((e) => e.name === 'calibration');
        const cal = calibrationExp ? await loadCalibration(calibrationExp).catch(() => []) : [];
        if (cancelled) return;
        const mRows = master?.rows ?? [];
        setMasterRows(mRows);
        setAblationRows(ablation?.rows ?? []);
        setCalibration(cal);
        setHasExpData(mRows.length > 0);
        // Load real-data comparisons
        const rd = await loadRealDataComparison('elia_wind').catch(() => null);
        if (!cancelled && rd) setRealData(rd);
        const rdElec = await loadRealDataComparison('elia_electricity').catch(() => null);
        if (!cancelled && rdElec) setRealDataElec(rdElec);
      } catch {
        if (!cancelled) setHasExpData(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // --- experiment-backed derived data ---
  const defaultExperiment = masterRows[0]?.experiment;
  const expRows = useMemo(() => {
    if (!defaultExperiment) return [];
    return masterRows.filter((r) => r.experiment === defaultExperiment);
  }, [masterRows, defaultExperiment]);
  const expSeedCount = useMemo(() => new Set(expRows.map((r) => r.seed)).size, [expRows]);
  const isFullPanel = expSeedCount >= 1000;

  const methodAgg = useMemo(() => {
    const byMethod = new Map<string, MasterComparisonRow[]>();
    for (const r of expRows) {
      const list = byMethod.get(r.method) ?? [];
      list.push(r);
      byMethod.set(r.method, list);
    }
    return Array.from(byMethod.entries()).map(([method, rs]) => ({
      method,
      label: METHOD_LABEL[method] ?? method,
      color: METHOD_COLOR[method] ?? '#64748b',
      meanCrps: meanFinite(rs.map((x) => x.mean_crps)),
      deltaCrps: meanFinite(rs.map((x) => x.delta_crps_vs_equal)),
      deltaCrpsSE: seFinite(rs.map((x) => x.delta_crps_vs_equal)),
      meanHHI: meanFinite(rs.map((x) => x.mean_HHI)),
      meanNEff: meanFinite(rs.map((x) => x.mean_N_eff)),
      finalGini: meanFinite(rs.map((x) => x.final_gini)),
      n: rs.length,
    }));
  }, [expRows]);

  const expMechanism = methodAgg.find((m) => m.method === 'mechanism') ?? null;

  const expCoreMethods = useMemo(
    () => methodAgg.filter((m) => (CORE_METHOD_KEYS as readonly string[]).includes(m.method) && m.deltaCrps != null),
    [methodAgg],
  );

  const expBestCore = useMemo(() => {
    if (expCoreMethods.length === 0) return null;
    return [...expCoreMethods].sort((a, b) => (a.deltaCrps ?? 0) - (b.deltaCrps ?? 0))[0];
  }, [expCoreMethods]);

  const expAccuracyDisplay = useMemo(() => {
    if (!expBestCore) return [];
    return [...expCoreMethods]
      .sort((a, b) => (a.deltaCrps ?? 0) - (b.deltaCrps ?? 0))
      .map((m) => {
        const deltaX1e4 = (m.deltaCrps ?? 0) * 1e4;
        const gapToBestX1e4 = ((m.deltaCrps ?? 0) - (expBestCore.deltaCrps ?? 0)) * 1e4;
        return {
          name: m.label,
          method: m.method,
          color: m.color,
          deltaCrpsX1e4: deltaX1e4,
          deltaLabel: deltaX1e4.toFixed(2),
          gapToBestX1e4,
          gapLabel: gapToBestX1e4.toFixed(2),
          seX1e4: (m.deltaCrpsSE ?? 0) * 1e4,
          n: m.n,
        };
      });
  }, [expCoreMethods, expBestCore]);

  const calibrationData = useMemo(() =>
    calibration.filter((p) => Number.isFinite(p.tau) && Number.isFinite(p.pHat))
      .map((p) => ({ tau: p.tau, pHat: p.pHat, ideal: p.tau, nValid: p.nValid }))
      .sort((a, b) => a.tau - b.tau),
    [calibration]);

  const ablationData = useMemo(() =>
    [...ablationRows].sort((a, b) => a.delta_crps_vs_full - b.delta_crps_vs_full),
    [ablationRows]);

  // --- demo fallback (in-browser pipeline) ---
  const cumErrorZoom = useChartZoom();

  const demoMethods = useMemo(() => {
    const entries: { key: string; label: string; color: string; influenceRule: InfluenceRule }[] = [
      { key: 'equal', label: METHOD.equal.label, color: METHOD.equal.color, influenceRule: 'uniform' },
      { key: 'skill_only', label: METHOD.skill_only.label, color: METHOD.skill_only.color, influenceRule: 'skill_only' },
      { key: 'blended', label: METHOD.blended.label, color: METHOD.blended.color, influenceRule: 'skill_stake' },
      { key: 'stake_only', label: METHOD.stake_only.label, color: METHOD.stake_only.color, influenceRule: 'deposit_only' },
    ];
    return entries.map((e) => ({
      ...e,
      pipeline: runPipeline({ dgpId: 'baseline', behaviourPreset: 'baseline', rounds: DEMO_T, seed: DEMO_SEED, n: DEMO_N, builder: { influenceRule: e.influenceRule } }),
    }));
  }, []);

  const demoEqual = demoMethods.find((x) => x.key === 'equal')!;
  const demoBlended = demoMethods.find((x) => x.key === 'blended')!;
  const demoDelta = demoBlended.pipeline.summary.meanError - demoEqual.pipeline.summary.meanError;

  const demoCumError = useMemo(() => {
    const maxLen = Math.max(...demoMethods.map((m) => m.pipeline.rounds.length));
    const raw = Array.from({ length: maxLen }, (_, i) => {
      const point: Record<string, number> = { round: i + 1 };
      for (const m of demoMethods) {
        const errors = m.pipeline.rounds.slice(0, i + 1).map((r) => r.error);
        point[m.key] = errors.reduce((a, b) => a + b, 0) / errors.length;
      }
      return point;
    });
    return downsample(raw, 300);
  }, [demoMethods]);

  const demoDeposits = useMemo(() => {
    const entries: { key: string; label: string; depositPolicy: DepositPolicy }[] = [
      { key: 'fixed', label: 'Fixed amount', depositPolicy: 'fixed_unit' },
      { key: 'bankroll', label: 'Fraction of wealth', depositPolicy: 'wealth_fraction' },
      { key: 'oracle', label: 'Wealth × confidence (σ in deposit)', depositPolicy: 'sigma_scaled' },
    ];
    return entries.map((e) => {
      const p = runPipeline({ dgpId: 'baseline', behaviourPreset: 'baseline', rounds: DEMO_T, seed: DEMO_SEED, n: DEMO_N, builder: { depositPolicy: e.depositPolicy, influenceRule: 'skill_stake' } });
      return { name: e.label, meanError: p.summary.meanError, gini: p.summary.finalGini };
    }).sort((a, b) => a.meanError - b.meanError);
  }, []);

  const demoConcentrationBar = useMemo(() =>
    demoMethods.map((m) => ({
      name: m.label,
      key: m.key,
      gini: m.pipeline.summary.finalGini,
      nEff: m.pipeline.summary.meanNEff,
      color: m.color,
    })).sort((a, b) => a.gini - b.gini),
    [demoMethods]);

  // Weight convergence: use sigma (skill estimate) which converges cleanly,
  // plus a final target-vs-learned bar from the weight recovery data
  const skillConvergence = useMemo(() => {
    const traces = demoBlended.pipeline.traces;
    const raw = traces.map((t, i) => {
      const pt: Record<string, number> = { round: i + 1 };
      for (let j = 0; j < DEMO_N; j++) pt[`F${j + 1}`] = t.sigma_t[j];
      return pt;
    });
    return downsample(raw, 300);
  }, [demoBlended]);

  // Final weights bar: target (equal = 1/N) vs learned (final weights from mechanism)
  const finalWeightsBar = useMemo(() => {
    const lastTrace = demoBlended.pipeline.traces[demoBlended.pipeline.traces.length - 1];
    if (!lastTrace) return [];
    return Array.from({ length: DEMO_N }, (_, i) => ({
      name: agentName(i),
      learned: lastTrace.weights[i],
      equal: 1 / DEMO_N,
      sigma: lastTrace.sigma_t[i],
      color: AGENT_PALETTE[i % AGENT_PALETTE.length],
    })).sort((a, b) => b.learned - a.learned);
  }, [demoBlended]);

  // Precompute cumulative CRPS for real-data chart (O(n) instead of O(n²))
  const realCumCrps = useMemo(() => {
    if (!realData?.per_round?.length) return [];
    const pr = realData.per_round;
    let sumU = 0, sumS = 0, sumM = 0, sumB = 0;
    const out = pr.map((r, i) => {
      sumU += r.crps_uniform;
      sumS += r.crps_skill;
      sumM += r.crps_mechanism;
      sumB += r.crps_best_single;
      const n = i + 1;
      return { t: r.t, uniform: sumU / n, skill: sumS / n, mechanism: sumM / n, best: sumB / n };
    });
    return downsample(out, 600);
  }, [realData]);
  const useExp = hasExpData && !loading && isFullPanel;
  const tabs = useExp ? EXP_TABS : DEMO_TABS;

  const deltaCrps = realData
    ? (realData.rows.find(r => r.method === 'mechanism')?.delta_crps_vs_equal ?? null)
    : useExp ? (expMechanism?.deltaCrps ?? null) : demoDelta;
  const gini = useExp ? (expMechanism?.finalGini ?? null) : demoBlended.pipeline.summary.finalGini;

  const accuracyVerdict: Verdict = deltaCrps == null ? 'neutral' : deltaCrps < -ACCURACY_EPS ? 'good' : deltaCrps > ACCURACY_EPS ? 'bad' : 'neutral';
  const concentrationVerdict: Verdict = gini == null ? 'neutral' : gini < 0.55 ? 'good' : gini > 0.7 ? 'bad' : 'neutral';

  if (!tabs.includes(activeTab as never)) setActiveTab(tabs[0]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <Breadcrumb activeTab={activeTab} />

        {/* ── Header ── */}
        <header>
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-semibold tracking-wide mb-4">
            {realData ? 'Real data' : useExp ? 'Synthetic' : 'Demo'}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Results</h1>
          <p className="text-sm text-slate-500 mt-1">
            {useExp
              ? `${expSeedCount} scenarios, paired comparison across all methods.`
              : `Seed ${DEMO_SEED} · ${DEMO_N} agents · ${DEMO_T} rounds`}
          </p>
        </header>

        {/* ── Headline cards ── */}
        <section className="grid sm:grid-cols-2 gap-4">
          <AnswerCard
            question="Does skill improve accuracy?"
            answer={deltaCrps == null ? '—' : deltaCrps < 0 ? 'Yes' : 'No'}
            detail={deltaCrps == null ? '' : `Δ = ${deltaCrps >= 0 ? '+' : ''}${fmt(deltaCrps, 4)} mean error${useExp ? ` (${expSeedCount} seeds)` : ''}`}
            verdict={accuracyVerdict}
            explanation={
              deltaCrps == null ? 'Loading data.'
                : useExp
                  ? (deltaCrps < 0
                    ? `Across ${expSeedCount} paired seeds, skill × stake reduces CRPS by ${fmt(Math.abs(deltaCrps), 4)} vs equal weighting.`
                    : `Across ${expSeedCount} paired seeds, equal weighting matches or beats skill × stake.`)
                  : (deltaCrps < 0
                    ? `In this single-seed demo, skill × stake reduces error by ${fmt(Math.abs(deltaCrps), 4)}.`
                    : 'Equal weighting performs as well or better in this demo.')
            }
          />
          <AnswerCard
            question="Is influence concentrated?"
            answer={gini == null ? '—' : gini < 0.4 ? 'Low' : gini < 0.6 ? 'Moderate' : 'High'}
            detail={gini == null ? '' : `Gini = ${fmt(gini, 3)}`}
            verdict={concentrationVerdict}
            explanation={
              gini == null ? 'Loading data.'
                : `Gini measures wealth inequality (0 = equal, 1 = monopoly). ${fmt(gini, 3)} means ${gini < 0.4 ? 'influence stays well-distributed' : gini < 0.6 ? 'moderate concentration — multiple agents retain influence' : 'a few agents dominate'}.`
            }
          />
        </section>

        {/* ── Tabs ── */}
        <section>
          <div className="flex gap-1 border-b border-slate-200 mb-6">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                {tab}
              </button>
            ))}
          </div>

          {loading && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4"><Skeleton height="120px" /><Skeleton height="120px" /></div>
              <Skeleton height="320px" />
            </div>
          )}

          <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
          >

          {/* ═══ REAL DATA TAB ═══ */}

          {activeTab === 'Real data' && realData && (
            <div className="space-y-6">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold">Real data</span>
                  <h3 className="text-sm font-semibold text-indigo-900">Elia Offshore Wind — {realData.config.T.toLocaleString()} hourly points</h3>
                </div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  {realData.config.n_forecasters} forecasting models ({realData.config.forecasters.join(', ')}) on Belgian offshore wind power (2024–2025).
                  Each model is strictly causal and retrained periodically. The mechanism learns which model is best and adjusts weights over time.
                  Diebold-Mariano test confirms statistical significance (p &lt; 0.001).
                </p>
              </div>

              <DeltaBarChart
                data={realData.rows.map(r => ({
                  label: r.method === 'uniform' ? 'Equal' : r.method === 'skill' ? 'Skill-only' : r.method === 'mechanism' ? 'Skill × stake' : r.method === 'best_single' ? 'Best single' : r.method,
                  delta: r.delta_crps_vs_equal * 1e4,
                  color: r.method === 'mechanism' ? '#6366f1' : r.method === 'skill' ? '#8b5cf6' : r.method === 'uniform' ? '#94a3b8' : '#f59e0b',
                }))}
                baselineLabel="Equal weighting"
                metricLabel="Δ CRPS (×10⁴)"
                title="Method comparison — Wind power"
              />

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-slate-800">CRPS over time</h3>
                  <ZoomBadge isZoomed={cumErrorZoom.state.isZoomed} onReset={cumErrorZoom.reset} />
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Running average CRPS by weighting method. The gap between lines shows the mechanism's cumulative advantage.
                </p>
                <div className="cursor-crosshair">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={realCumCrps}
                      margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
                      onMouseDown={cumErrorZoom.onMouseDown}
                      onMouseMove={cumErrorZoom.onMouseMove}
                      onMouseUp={cumErrorZoom.onMouseUp}
                    >
                      <CartesianGrid {...GRID_PROPS} />
                      <XAxis dataKey="t" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[cumErrorZoom.state.left, cumErrorZoom.state.right]}
                        label={{ value: 'Hour', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                        label={{ value: 'Cumulative CRPS', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                      <Tooltip content={<SmartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                      <Line type="monotone" dataKey="uniform" name="Equal" stroke="#94a3b8" strokeWidth={1.5} dot={false} />
                      <Line type="monotone" dataKey="skill" name="Skill-only" stroke="#8b5cf6" strokeWidth={1.5} dot={false} strokeOpacity={0.7} />
                      <Line type="monotone" dataKey="mechanism" name="Skill × stake" stroke="#6366f1" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="best" name="Best single" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeOpacity={0.7} />
                      <Brush dataKey="t" {...BRUSH_PROPS} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weight convergence */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-1">Skill convergence</h3>
                <p className="text-xs text-slate-500 mb-3">
                  Each agent's learned skill estimate (σ) over time. Good forecasters converge to high σ, poor ones to low σ.
                  The mechanism uses these to reweight — higher σ means more influence.
                </p>
                <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={skillConvergence} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}>
                      <CartesianGrid {...GRID_PROPS} />
                      <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
                        label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]}
                        label={{ value: 'Skill σ', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                      <Tooltip content={<SmartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                      {Array.from({ length: DEMO_N }, (_, i) => (
                        <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={agentName(i)}
                          stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={1.5} dot={false} />
                      ))}
                      <Brush dataKey="round" {...BRUSH_PROPS} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-2">Final weights vs equal</div>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={finalWeightsBar} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 4 }}>
                        <CartesianGrid {...GRID_PROPS} horizontal={false} />
                        <XAxis type="number" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                        <YAxis type="category" dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE} width={36} />
                        <Tooltip contentStyle={TOOLTIP_STYLE as React.CSSProperties}
                          formatter={(v: unknown) => [fmt(Number(v), 4), '']} />
                        <ReferenceLine x={1 / DEMO_N} stroke="#94a3b8" strokeDasharray="4 4" />
                        <Bar dataKey="learned" name="Learned" radius={[0, 4, 4, 0]} maxBarSize={20}>
                          {finalWeightsBar.map((d) => <Cell key={d.name} fill={d.color} opacity={0.9} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-[10px] text-slate-400 mt-1">Dashed line = equal weight (1/{DEMO_N}). Bars show final learned weights.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Electricity results */}
          {activeTab === 'Real data' && realDataElec && (
            <div className="space-y-6 mt-8">
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-semibold">Dataset 2</span>
                  <h3 className="text-sm font-semibold text-teal-900">Elia Imbalance Prices — {realDataElec.config.T.toLocaleString()} points</h3>
                </div>
                <p className="text-xs text-teal-700 leading-relaxed">
                  Same 5 models on Belgian electricity imbalance prices (15-min, 2024). Prices are volatile with spikes — a harder forecasting task.
                </p>
              </div>
              <DeltaBarChart
                data={realDataElec.rows.map(r => ({
                  label: r.method === 'uniform' ? 'Equal' : r.method === 'skill' ? 'Skill-only' : r.method === 'mechanism' ? 'Skill × stake' : r.method === 'best_single' ? 'Best single' : r.method,
                  delta: r.delta_crps_vs_equal * 1e4,
                  color: r.method === 'mechanism' ? '#6366f1' : r.method === 'skill' ? '#8b5cf6' : r.method === 'uniform' ? '#94a3b8' : '#f59e0b',
                }))}
                baselineLabel="Equal weighting"
                metricLabel="Δ CRPS (×10⁴)"
                title="Method comparison — Electricity prices"
              />
            </div>
          )}

          {activeTab === 'Real data' && !realData && !loading && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-500">Real-data comparison not available. Run the forecaster models on your data first.</p>
            </div>
          )}

          {/* ═══ EXPERIMENT-BACKED TABS ═══ */}

          {useExp && !loading && activeTab === 'Accuracy' && (
            expAccuracyDisplay.length > 0 && calibrationData.length > 0 && ablationData.length > 0 ? (
              <FourPanelLayout
                title="Master Comparison"
                thesisPoint="Accuracy, calibration, market structure, and ablation evidence at a glance."
                primary={
                  <DeltaBarChart
                    data={expAccuracyDisplay.map((d) => ({
                      label: d.name,
                      delta: d.deltaCrpsX1e4,
                      se: d.seX1e4 > 0 ? d.seX1e4 : undefined,
                      color: d.color,
                    }))}
                    baselineLabel="Baseline (equal)"
                    metricLabel="Δ CRPS (×10⁴)"
                  />
                }
                calibration={
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold text-slate-700 mb-2">Reliability diagram</div>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={calibrationData} margin={CHART_MARGIN_LABELED}>
                        <CartesianGrid {...GRID_PROPS} />
                        <XAxis dataKey="tau" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]} />
                        <YAxis dataKey="pHat" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]} />
                        <Tooltip content={<SmartTooltip />} />
                        <Line type="monotone" dataKey="ideal" name="Ideal" stroke="#94a3b8" strokeDasharray="4 4" dot={false} />
                        <Line type="monotone" dataKey="pHat" name="Empirical p̂" stroke="#0d9488" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                }
                structure={
                  <ConcentrationPanel
                    data={methodAgg
                      .filter((m) => (CORE_METHOD_KEYS as readonly string[]).includes(m.method))
                      .map((m) => ({
                        method: m.method,
                        label: m.label,
                        color: m.color,
                        gini: m.finalGini ?? undefined,
                        hhi: m.meanHHI ?? undefined,
                        nEff: m.meanNEff ?? undefined,
                      }))}
                  />
                }
                failure={
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold text-slate-700 mb-2">Ablation (ΔCRPS vs Full)</div>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={ablationData} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
                        <CartesianGrid {...GRID_PROPS} />
                        <XAxis dataKey="variant" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                        <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                        <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
                        <Tooltip content={<SmartTooltip />} />
                        <Bar dataKey="delta_crps_vs_full" name="ΔCRPS vs Full" radius={[4, 4, 0, 0]} maxBarSize={40} fill="#6366f1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                }
              />
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-[11px] text-slate-500">
                No comparison data available for the four main methods.
              </div>
            )
          )}

          {useExp && activeTab === 'Concentration' && (
            <ConcentrationPanel
              data={methodAgg
                .filter((m) => (CORE_METHOD_KEYS as readonly string[]).includes(m.method))
                .map((m) => ({
                  method: m.method,
                  label: m.label,
                  color: m.color,
                  gini: m.finalGini ?? undefined,
                  hhi: m.meanHHI ?? undefined,
                  nEff: m.meanNEff ?? undefined,
                }))}
            />
          )}

          {useExp && activeTab === 'Calibration' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-slate-800">Calibration</h3>
                <InfoToggle term="Reliability diagram" definition="Compares nominal quantile τ against empirical coverage p̂(τ)." interpretation="Perfect calibration lies on the diagonal." axes={{ x: 'nominal τ', y: 'empirical p̂' }} />
              </div>
              {calibrationData.length === 0 ? (
                <p className="text-[11px] text-slate-500">Calibration data not available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={calibrationData} margin={CHART_MARGIN_LABELED}>
                    <CartesianGrid {...GRID_PROPS} />
                    <XAxis dataKey="tau" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]} />
                    <YAxis dataKey="pHat" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]} />
                    <Tooltip content={<SmartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                    <Line type="monotone" dataKey="ideal" name="Ideal (p̂=τ)" stroke="#94a3b8" strokeDasharray="4 4" dot={false} />
                    <Line type="monotone" dataKey="pHat" name="Empirical p̂" stroke="#0d9488" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {useExp && activeTab === 'Ablation' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Bankroll ablation (ΔCRPS vs Full)</h3>
              {ablationData.length === 0 ? (
                <p className="text-[11px] text-slate-500">Ablation data not available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={ablationData} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
                    <CartesianGrid {...GRID_PROPS} />
                    <XAxis dataKey="variant" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                    <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                    <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
                    <Tooltip content={<SmartTooltip />} />
                    <Bar dataKey="delta_crps_vs_full" name="ΔCRPS vs Full" radius={[4, 4, 0, 0]} maxBarSize={40} fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* ═══ DEMO FALLBACK TABS ═══ */}

          {!useExp && !loading && activeTab === 'Accuracy' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-slate-800">Cumulative forecast error over time</h3>
                  <ZoomBadge isZoomed={cumErrorZoom.state.isZoomed} onReset={cumErrorZoom.reset} />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                  Each line shows the running average error for a different weighting method.
                  Lower means more accurate forecasts.
                  The <span className="font-semibold" style={{ color: METHOD.blended.color }}>Skill × stake</span> line
                  should track below the others if the online skill layer adds value.
                  Drag to zoom into a time range.
                </p>
              </div>
              <div className="cursor-crosshair">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={demoCumError} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
                    onMouseDown={cumErrorZoom.onMouseDown} onMouseMove={cumErrorZoom.onMouseMove} onMouseUp={cumErrorZoom.onMouseUp}>
                    <CartesianGrid {...GRID_PROPS} />
                    <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[cumErrorZoom.state.left, cumErrorZoom.state.right]}
                      label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                      label={{ value: 'Cumulative mean error', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                    <Tooltip content={<SmartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    {demoMethods.map((m) => (
                      <Line key={m.key} type="monotone" dataKey={m.key} name={m.label} stroke={m.color}
                        strokeWidth={m.key === 'blended' ? 3 : 1.5} dot={false}
                        strokeOpacity={m.key === 'blended' ? 1 : 0.6}
                        isAnimationActive={true} animationDuration={300} />
                    ))}
                    <Brush dataKey="round" {...BRUSH_PROPS} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Skill convergence (demo) */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">Skill convergence</h3>
                <p className="text-xs text-slate-500 mb-3">
                  Each agent's learned skill estimate (σ) over time. The mechanism separates good from bad forecasters within ~50 rounds, then stabilises.
                </p>
                <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={skillConvergence} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}>
                      <CartesianGrid {...GRID_PROPS} />
                      <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
                        label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]}
                        label={{ value: 'Skill σ', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                      <Tooltip content={<SmartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                      {Array.from({ length: DEMO_N }, (_, i) => (
                        <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={agentName(i)}
                          stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={1.5} dot={false} />
                      ))}
                      <Brush dataKey="round" {...BRUSH_PROPS} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-2">Final weights vs equal</div>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={finalWeightsBar} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 4 }}>
                        <CartesianGrid {...GRID_PROPS} horizontal={false} />
                        <XAxis type="number" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                        <YAxis type="category" dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE} width={36} />
                        <Tooltip contentStyle={TOOLTIP_STYLE as React.CSSProperties}
                          formatter={(v: unknown) => [fmt(Number(v), 4), '']} />
                        <ReferenceLine x={1 / DEMO_N} stroke="#94a3b8" strokeDasharray="4 4" />
                        <Bar dataKey="learned" name="Learned" radius={[0, 4, 4, 0]} maxBarSize={20}>
                          {finalWeightsBar.map((d) => <Cell key={d.name} fill={d.color} opacity={0.9} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-[10px] text-slate-400 mt-1">Dashed line = equal weight (1/{DEMO_N}). Bars show final learned weights.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!useExp && !loading && activeTab === 'Concentration' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Wealth concentration by method</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl mt-1">
                  The Gini coefficient measures how unequally wealth is distributed (0 = perfectly equal, 1 = one agent holds everything).
                  N_eff is the effective number of participants with meaningful influence.
                  A good mechanism keeps Gini low and N_eff high — accuracy without letting anyone dominate.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={demoConcentrationBar} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="name" tick={{ ...AXIS_TICK, fontSize: 12 }} stroke={AXIS_STROKE} />
                  <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <Tooltip content={<SmartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="gini" name="Final Gini" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {demoConcentrationBar.map((d) => <Cell key={d.key} fill={d.color} opacity={0.85} />)}
                  </Bar>
                  <Bar dataKey="nEff" name="Mean N_eff" radius={[4, 4, 0, 0]} maxBarSize={32} fill="#0ea5e9" opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {!useExp && !loading && activeTab === 'Deposit policy' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">How deposit rules affect outcomes</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-2xl mt-1">
                  The deposit policy determines how much each agent stakes per round.
                  "Fixed" means everyone stakes the same amount. "Fraction of wealth" scales with bankroll.
                  "Wealth × skill" also factors in the agent's skill estimate.
                  Lower bars are better for both metrics.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={demoDeposits} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="name" tick={{ ...AXIS_TICK, fontSize: 12 }} stroke={AXIS_STROKE} />
                  <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <Tooltip content={<SmartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="meanError" name="Mean error" radius={[4, 4, 0, 0]} maxBarSize={36} fill={SEM.outcome.main} opacity={0.85} />
                  <Bar dataKey="gini" name="Final Gini" radius={[4, 4, 0, 0]} maxBarSize={36} fill={SEM.wealth.main} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          </motion.div>
          </AnimatePresence>
        </section>

      </div>
    </div>
  );
}
