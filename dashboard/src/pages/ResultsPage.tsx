import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { METHOD_COLORS } from '@/lib/palette';
import {
  Bar,
  BarChart,

  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
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
  loadWeightRecoveryMethod1,
  type RealDataResult,
} from '@/lib/adapters';
import type {
  BankrollAblationRow,
  CalibrationPoint,
  ExperimentMeta,
  MasterComparisonRow,
  WeightRecoveryRow,
} from '@/lib/types';
import { runPipeline } from '@/lib/coreMechanism/runPipeline';
import { generateLatentFixed } from '@/lib/coreMechanism/dgpSimulator';
import { runComposableRound, type ComposableParams, type RoundTrace } from '@/lib/coreMechanism/runRoundComposable';
import type { AgentState } from '@/lib/coreMechanism/runRound';
import { METHOD, SEM } from '@/lib/tokens';
import { SmartTooltip } from '@/components/dashboard/SmartTooltip';
import {
  AGENT_PALETTE,
  AXIS_STROKE,
  AXIS_TICK,

  CHART_MARGIN_LABELED,
  GRID_PROPS,
  TOOLTIP_STYLE,
  downsample,
  fmt,
} from '@/components/lab/shared';
import { useChartZoom } from '@/hooks/useChartZoom';
import ZoomBadge from '@/components/charts/ZoomBadge';
import DeltaBarChart from '@/components/charts/DeltaBarChart';
import ConcentrationPanel from '@/components/charts/ConcentrationPanel';
import FourPanelLayout from '@/components/charts/FourPanelLayout';
import TradeOffScatter from '@/components/charts/TradeOffScatter';
import { getDefaultForecaster, sortSteadyState, computeSigmaDomain, buildBarData, buildLineRenderOrder, getLineStyle } from '@/components/charts/skillRecognitionHelpers';
import ForecasterSelector from '@/components/charts/ForecasterSelector';
import type { TradeOffPoint } from '@/components/charts/TradeOffScatter';
import WaterfallChart from '@/components/charts/WaterfallChart';
import type { WaterfallDatum } from '@/components/charts/WaterfallChart';
import CalibrationChart from '@/components/charts/CalibrationChart';
import EliaOperationalBaseline from '@/components/charts/EliaOperationalBaseline';
import RecalibrationPanel from '@/components/charts/RecalibrationPanel';
import { AnimatePresence, motion } from 'framer-motion';
import { ChartLinkingProvider } from '@/contexts/ChartLinkingContext';
import type { InfluenceRule, DepositPolicy } from '@/lib/coreMechanism/runRoundComposable';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import TabBar from '@/components/dashboard/TabBar';
import MathBlock from '@/components/dashboard/MathBlock';
import Skeleton from '@/components/dashboard/Skeleton';
import PageShell from '@/components/dashboard/PageShell';
import PageHeader from '@/components/dashboard/PageHeader';
import { FigureProvider } from '@/contexts/FigureContext';
import { EquationProvider } from '@/contexts/EquationContext';

// ── Analysis hooks and components ──────────────────────────────────
import {
  useClaimValidation,
  useEffectSizes,
  useResultConsistency,
  useSensitivityData,
  useFailureModes,
  useBaselineCoverage,
  useAblationInterpretation,
  useRealDataContext,
  useRegimeBreakdownFromAdapter,
  useDepositInteraction,
  usePanelSizeSensitivity,
} from '@/hooks/useAnalysis';
import ClaimEvidenceCard from '@/components/analysis/ClaimEvidenceCard';
import ResultConsistencyMatrix from '@/components/analysis/ResultConsistencyMatrix';
import SensitivityPanel from '@/components/analysis/SensitivityPanel';
import FailureModePanel from '@/components/analysis/FailureModePanel';
import BaselineCoverageTable from '@/components/analysis/BaselineCoverageTable';
import AblationInterpretPanel from '@/components/analysis/AblationInterpretPanel';
import RealDataContextPanel from '@/components/analysis/RealDataContextPanel';
import RegimeBreakdownTable from '@/components/analysis/RegimeBreakdownTable';
import DepositInteractionPanel from '@/components/analysis/DepositInteractionPanel';
import PanelSizeChart from '@/components/analysis/PanelSizeChart';

const DEMO_SEED = 42;
const DEMO_N = 6;
const DEMO_T = 200;

const CORE_METHOD_KEYS = ['uniform', 'deposit', 'skill', 'mechanism'] as const;
const ACCURACY_EPS = 1e-4;

// Skill convergence demo: 3 agents with controlled noise levels
const CONV_N = 3;
const CONV_T = 500;
const CONV_TAU = [0.2, 0.6, 1.5] as const; // Good, Okay, Bad
const CONV_LABELS = ['F1: Good (τ=0.2)', 'F2: Okay (τ=0.6)', 'F3: Bad (τ=1.5)'] as const;

// ── Method chart colors & labels for real-data comparison ───────────
// Single source of truth lives in `@/lib/palette`.
const METHOD_CHART_COLORS: Record<string, string> = METHOD_COLORS;

const METHOD_CHART_LABELS: Record<string, string> = {
  uniform: 'Equal',
  skill: 'Skill-only',
  mechanism: 'Skill × stake',
  best_single: 'Best single',
  inverse_variance: 'Inv-variance',
  trimmed_mean: 'Trimmed mean',
  median: 'Median',
  oracle: 'Oracle',
};

type Verdict = 'good' | 'neutral' | 'bad';


const VERDICT_CONFIG: Record<Verdict, {
  border: string;
  tint: string;
  fg: string;
  iconBg: string;
  title: string;
  body: string;
  path: ReactNode;
}> = {
  good: {
    border: 'var(--teal)',
    tint:   'var(--teal-tint)',
    fg:     'var(--teal-deep)',
    iconBg: 'var(--teal)',
    title:  '#134f48',
    body:   '#1e5c55',
    path:   <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />,
  },
  neutral: {
    border: 'var(--amber)',
    tint:   'var(--amber-tint)',
    fg:     '#78350f',
    iconBg: 'var(--amber)',
    title:  '#78350f',
    body:   '#5c2a07',
    path:   <path d="M4 8H12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />,
  },
  bad: {
    border: 'var(--crimson)',
    tint:   'var(--crimson-tint)',
    fg:     'var(--crimson)',
    iconBg: 'var(--crimson)',
    title:  '#6a1221',
    body:   '#7a1628',
    path:   <><path d="M4 4L12 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /><path d="M12 4L4 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></>,
  },
};

function AnswerCard({
  question, answer, detail, verdict, explanation,
}: {
  question: string; answer: string; detail: string; verdict: Verdict; explanation: string;
}) {
  const cfg = VERDICT_CONFIG[verdict];
  return (
    <div
      className="p-5 space-y-3 transition-colors"
      style={{
        background: cfg.tint,
        border: '1px solid var(--border)',
        borderLeft: `3px solid ${cfg.border}`,
        borderRadius: 4,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="font-serif"
          style={{ fontSize: 13.5, fontWeight: 600, color: cfg.title, lineHeight: 1.55 }}
        >
          {question}
        </div>
        <span
          className="inline-flex items-center justify-center shrink-0"
          aria-hidden="true"
          style={{
            width: 24, height: 24,
            borderRadius: '50%',
            background: cfg.iconBg,
            color: '#fff',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            {cfg.path}
          </svg>
        </span>
      </div>
      <div className="flex items-baseline gap-3 flex-wrap">
        <span
          className="font-serif font-mono tabular-nums"
          style={{ fontSize: 28, fontWeight: 700, color: cfg.fg, lineHeight: 1.1 }}
        >
          {answer}
        </span>
        <span
          className="font-mono"
          style={{ fontSize: 12, color: cfg.body, opacity: 0.8 }}
        >
          {detail}
        </span>
      </div>
      <p style={{ fontSize: 13, color: cfg.body, lineHeight: 1.6 }}>
        {explanation}
      </p>
    </div>
  );
}

const EXP_TABS = ['Real data', 'Accuracy', 'Concentration', 'Calibration', 'Ablation', 'Scientific Analysis'] as const;
const DEMO_TABS = ['Accuracy', 'Concentration', 'Deposit policy', 'Scientific Analysis'] as const;

const METHOD_LABEL: Record<string, string> = {
  uniform: 'Equal', deposit: 'Stake-only', skill: 'Skill-only', mechanism: 'Skill × stake', best_single: 'Best single',
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

const EXPERIMENT_CARDS = [
  { title: 'Elia Wind', tab: 'Real data', color: '#10b981', desc: '17,344 evaluation rounds, 7 forecasting models', key: 'Mechanism reduces mean CRPS by about 7% vs equal weighting' },
  { title: 'Elia Electricity', tab: 'Real data', color: '#0ea5e9', desc: '15-minute clearing prices, 10,000 rounds', key: 'Null result: mechanism tied with equal weighting (t = 0.008)' },
  { title: 'Weight Learning', tab: 'Real data', color: '#8b5cf6', desc: 'LMS vs EWMA skill layer', key: 'Correct ranking, modest separation' },
  { title: 'Method Race', tab: 'Accuracy', color: '#6366f1', desc: '6 agents, 200 rounds, 4 weighting rules', key: 'Skill \u00d7 stake wins after \u224850 rounds' },
  { title: 'Skill Recognition', tab: 'Accuracy', color: '#f59e0b', desc: '3 agents with known quality', key: 'Good \u2192 high \u03c3, bad \u2192 low \u03c3' },
  { title: 'Concentration', tab: 'Concentration', color: '#ef4444', desc: 'Gini and effective-N by method', key: 'Accuracy\u2013fairness trade-off' },
  { title: 'Deposit Policy', tab: 'Deposit policy', color: '#64748b', desc: 'Fixed vs wealth-fraction vs \u03c3-scaled', key: 'Deposit policy is the main lever' },
] as const;

function ExperimentGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="inline-block w-1 h-4 rounded bg-indigo-500" />
          <span className="text-xs font-semibold text-slate-700">Experiment guide</span>
          <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-500 text-[10px] font-mono font-semibold px-1.5 py-0.5">
            {EXPERIMENT_CARDS.length}
          </span>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-3">
            {EXPERIMENT_CARDS.map((exp) => (
              <div
                key={exp.title}
                className="rounded-lg border border-slate-100 p-3 hover:bg-slate-50 hover:border-slate-200 transition-all duration-150"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: exp.color }} />
                  <span className="text-xs font-semibold text-slate-800 truncate">{exp.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{exp.desc}</p>
                <div className="mt-1.5 text-[11px] font-medium" style={{ color: exp.color }}>{exp.key}</div>
                <div className="mt-1 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{exp.tab}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Deposit Sensitivity Panel (real wind data) ── */

interface DepositSensEntry {
  uniform: number;
  skill: number;
  mechanism: number;
  delta_skill: number;
  delta_mech: number;
  pct_skill: number;
  pct_mech: number;
}

interface DepositSensData {
  deposit_sensitivity: Record<string, DepositSensEntry>;
}

function DepositSensitivityPanel() {
  const [data, setData] = useState<DepositSensData | null>(null);
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/real_data/elia_wind/data/deposit_sensitivity.json`)
      .then((r) => r.json())
      .then((d: DepositSensData) => setData(d))
      .catch(() => {});
  }, []);

  if (!data) return null;

  const policies = ['fixed', 'exponential', 'bankroll'] as const;
  const policyLabels: Record<string, string> = { fixed: 'Fixed', exponential: 'Exponential', bankroll: 'Bankroll' };
  const methods = ['uniform', 'skill', 'mechanism'] as const;
  const methodLabels: Record<string, string> = { uniform: 'Equal', skill: 'Skill-only', mechanism: 'Skill × stake' };
  const methodColors: Record<string, string> = { uniform: '#94a3b8', skill: '#8b5cf6', mechanism: '#6366f1' };

  const chartData = policies.map((p) => {
    const entry = data.deposit_sensitivity[p];
    return {
      policy: policyLabels[p],
      uniform: entry.uniform,
      skill: entry.skill,
      mechanism: entry.mechanism,
      pct_mech: entry.pct_mech,
    };
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">How deposit policy affects accuracy (Elia Wind)</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          The ordering between deposit rules is consistent across pipelines: fixed deposits give
          the mechanism the most headroom, bankroll-fraction deposits the least. The absolute
          percentages on this chart come from an earlier deposit-sensitivity run that used the
          pre-audit normalisation, so they are larger than the post-audit headline (&sim;7.9%
          vs equal on the 1h-ahead comparison run). Read the bars as the <em>relative</em> effect
          of the deposit rule rather than the absolute gain of the mechanism.
        </p>
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={chartData} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="policy" tick={{ ...AXIS_TICK, fontSize: 12 }} stroke={AXIS_STROKE}
            label={{ value: 'Deposit policy', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
          <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
            label={{ value: 'Mean CRPS', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
          <Tooltip content={<SmartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          {methods.map((m) => (
            <Bar key={m} dataKey={m} name={methodLabels[m]} fill={methodColors[m]}
              radius={[4, 4, 0, 0]} maxBarSize={36} opacity={0.85} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="grid sm:grid-cols-3 gap-3">
        {policies.map((p) => {
          const entry = data.deposit_sensitivity[p];
          return (
            <div key={p} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="text-[11px] font-semibold text-slate-700">{policyLabels[p]}</div>
              <div className="text-lg font-bold font-mono text-indigo-600">−{entry.pct_mech.toFixed(0)}%</div>
              <div className="text-[11px] text-slate-500">CRPS improvement vs equal</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState<string>('Real data');
  const [skillSource, setSkillSource] = useState<'real' | 'dgp'>('real');
  const [selectedForecaster, setSelectedForecaster] = useState<number>(-1);

  // --- adapter-backed data ---
  const [masterRows, setMasterRows] = useState<MasterComparisonRow[]>([]);
  const [ablationRows, setAblationRows] = useState<BankrollAblationRow[]>([]);
  const [calibration, setCalibration] = useState<CalibrationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasExpData, setHasExpData] = useState(false);
  const [realData, setRealData] = useState<RealDataResult | null>(null);
  const [realDataElec, setRealDataElec] = useState<RealDataResult | null>(null);
  const [weightRecovery, setWeightRecovery] = useState<WeightRecoveryRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
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
        const wr = await loadWeightRecoveryMethod1().catch(() => []);
        if (!cancelled) setWeightRecovery(wr);
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
      color: METHOD_COLORS[method] ?? '#64748b',
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

  // Experiment-backed trade-off scatter data
  const expTradeOffData: TradeOffPoint[] = useMemo(() => {
    return expCoreMethods.map(m => ({
      method: m.method,
      label: m.label,
      crpsImprovement: -(m.deltaCrps ?? 0),
      gini: m.finalGini ?? 0,
      color: m.color,
    }));
  }, [expCoreMethods]);

  // Experiment-backed waterfall data
  const expWaterfallData: WaterfallDatum[] = useMemo(() => {
    const getError = (method: string) => methodAgg.find(m => m.method === method)?.meanCrps ?? 0;
    const uniformCrps = getError('uniform');
    const depositCrps = getError('deposit');
    const skillCrps = getError('skill');
    const mechCrps = getError('mechanism');
    return [
      { label: 'Uniform (baseline)', value: uniformCrps, delta: 0, isTotal: true },
      { label: '+ Deposits', value: depositCrps, delta: depositCrps - uniformCrps },
      { label: '+ Skill', value: skillCrps, delta: skillCrps - depositCrps },
      { label: 'Full Mechanism', value: mechCrps, delta: mechCrps - skillCrps, isTotal: true },
    ];
  }, [methodAgg]);

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

  // Trade-off scatter data: accuracy improvement vs concentration for each method
  const tradeOffData: TradeOffPoint[] = useMemo(() => {
    const equalError = demoMethods.find(m => m.key === 'equal')?.pipeline.summary.meanError ?? 0;
    return demoMethods.map(m => ({
      method: m.key,
      label: m.label,
      crpsImprovement: equalError - m.pipeline.summary.meanError,
      gini: m.pipeline.summary.finalGini,
      color: m.color,
    }));
  }, [demoMethods]);

  // Waterfall data: incremental CRPS change from uniform → deposit → skill → mechanism
  const waterfallData: WaterfallDatum[] = useMemo(() => {
    const getError = (key: string) => demoMethods.find(m => m.key === key)?.pipeline.summary.meanError ?? 0;
    const uniformCrps = getError('equal');
    const stakeCrps = getError('stake_only');
    const skillCrps = getError('skill_only');
    const mechCrps = getError('blended');
    return [
      { label: 'Uniform (baseline)', value: uniformCrps, delta: 0, isTotal: true },
      { label: '+ Deposits', value: stakeCrps, delta: stakeCrps - uniformCrps },
      { label: '+ Skill', value: skillCrps, delta: skillCrps - stakeCrps },
      { label: 'Full Mechanism', value: mechCrps, delta: mechCrps - skillCrps, isTotal: true },
    ];
  }, [demoMethods]);

  // Skill convergence: 3 agents with controlled noise levels
  // Good (τ=0.2), Okay (τ=0.6), Bad (τ=1.5) — the mechanism should rank them correctly

  const convPipeline = useMemo(() => {
    // Generate DGP with controlled noise levels
    const dgp = generateLatentFixed(DEMO_SEED, CONV_T, CONV_N, 1, [...CONV_TAU]);
    // Run the mechanism manually using runComposableRound
    const params: ComposableParams = {
      lam: 0.3, eta: 1, sigma_min: 0.1, gamma: 4, rho: 0.1,
      omegaMax: 1.0, utilityPool: 0, scoreThreshold: 0.7,
      fixedDeposit: 1, baseDepositFraction: 0.18, sigmaDepositScale: 0.85,
      builder: { depositPolicy: 'fixed_unit', influenceRule: 'skill_stake', aggregationRule: 'linear', settlementRule: 'skill_only' },
    };
    const initialL = 0.5;
    let state: AgentState[] = Array.from({ length: CONV_N }, (_, i) => ({
      accountId: i, L: initialL,
      sigma: params.sigma_min + (1 - params.sigma_min) * Math.exp(-params.gamma * initialL),
      wealth: 20,
    }));
    const traces: RoundTrace[] = [];
    for (let i = 0; i < dgp.rounds.length; i++) {
      const { y, qReports } = dgp.rounds[i];
      const decisions = state.map((_s, j) => ({
        accountId: j, participate: true,
        report: dgp.rounds[i].reports[j],
        qReport: qReports[j],
      }));
      const trace = runComposableRound(i + 1, state, decisions, y, params);
      traces.push(trace);
      state = state.map((_s, j) => ({
        accountId: j, L: trace.L_new[j], sigma: trace.sigma_new[j], wealth: trace.wealth_after[j],
      }));
    }
    return { traces, finalState: state, tauTrue: CONV_TAU };
  }, []);

  // Skill (σ) trajectory — shows the mechanism learning who is good/okay/bad
  const skillConvergence = useMemo(() => {
    const raw = convPipeline.traces.map((t, i) => {
      const pt: Record<string, number> = { round: i + 1 };
      for (let j = 0; j < CONV_N; j++) pt[`F${j + 1}`] = t.sigma_t[j];
      return pt;
    });
    return downsample(raw, 300);
  }, [convPipeline]);

  // Weight trajectory — derived from σ via the skill gate
  const weightConvergence = useMemo(() => {
    const raw = convPipeline.traces.map((t, i) => {
      const pt: Record<string, number> = { round: i + 1 };
      for (let j = 0; j < CONV_N; j++) pt[`F${j + 1}`] = t.weights[j];
      return pt;
    });
    return downsample(raw, 300);
  }, [convPipeline]);

  // Steady-state target weights from the last 100 rounds
  const targetWeights = useMemo(() => {
    const last100 = convPipeline.traces.slice(-100);
    return Array.from({ length: CONV_N }, (_, j) => {
      return last100.reduce((s, t) => s + t.weights[j], 0) / last100.length;
    });
  }, [convPipeline]);

  // Steady-state target σ from the last 100 rounds
  const targetSigmas = useMemo(() => {
    const last100 = convPipeline.traces.slice(-100);
    return Array.from({ length: CONV_N }, (_, j) => {
      return last100.reduce((s, t) => s + t.sigma_t[j], 0) / last100.length;
    });
  }, [convPipeline]);

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
  // ── Real skill history data (from comparison.json) ──
  const hasRealSkill = !!(realData?.skill_history?.length && realData?.forecaster_names?.length);
  const realForecasterCount = realData?.forecaster_names?.length ?? 0;
  const realForecasterNames = realData?.forecaster_names ?? [];

  // Skill (σ) trajectory from real forecaster data
  const realSkillConvergence = useMemo(() => {
    if (!hasRealSkill) return [];
    const raw = realData!.skill_history!.map((entry) => {
      const pt: Record<string, number> = { t: entry.t };
      for (let j = 0; j < realForecasterCount; j++) pt[`sigma_${j}`] = entry[`sigma_${j}`];
      return pt;
    });
    return downsample(raw, 600);
  }, [hasRealSkill, realData, realForecasterCount]);

  // Weight trajectory from real forecaster data
  const realWeightConvergence = useMemo(() => {
    if (!hasRealSkill) return [];
    const raw = realData!.skill_history!.map((entry) => {
      const pt: Record<string, number> = { t: entry.t };
      for (let j = 0; j < realForecasterCount; j++) pt[`weight_${j}`] = entry[`weight_${j}`];
      return pt;
    });
    return downsample(raw, 600);
  }, [hasRealSkill, realData, realForecasterCount]);

  // Steady-state σ and weight targets from real data
  const realSteadyState = useMemo(() => realData?.steady_state ?? [], [realData]);

  // Build lookup: index → steady-state values
  const realTargetSigmas = useMemo(() => {
    if (!hasRealSkill) return [];
    const map = new Map(realSteadyState.map((s) => [s.index, s.mean_sigma]));
    return Array.from({ length: realForecasterCount }, (_, i) => map.get(i) ?? 0);
  }, [hasRealSkill, realSteadyState, realForecasterCount]);

  const realTargetWeights = useMemo(() => {
    if (!hasRealSkill) return [];
    const map = new Map(realSteadyState.map((s) => [s.index, s.mean_weight]));
    return Array.from({ length: realForecasterCount }, (_, i) => map.get(i) ?? 0);
  }, [hasRealSkill, realSteadyState, realForecasterCount]);

  const sortedSteadyState = useMemo(() => sortSteadyState(realData?.steady_state ?? []), [realData]);

  const sigmaDomain = useMemo(() => computeSigmaDomain(realSkillConvergence, realForecasterCount), [realSkillConvergence, realForecasterCount]);

  const forecasterItems = useMemo(() => sortedSteadyState.map(s => ({
    name: s.forecaster,
    index: s.index,
    color: AGENT_PALETTE[s.index % AGENT_PALETTE.length],
  })), [sortedSteadyState]);

  useEffect(() => {
    if (sortedSteadyState.length > 0 && selectedForecaster === -1) {
      setSelectedForecaster(getDefaultForecaster(sortedSteadyState));
    }
  }, [sortedSteadyState, selectedForecaster]);

  const useExp = hasExpData && !loading && isFullPanel;
  const tabs = useExp ? EXP_TABS : DEMO_TABS;

  // ── Analysis hooks ──────────────────────────────────────────────
  const claimValidation = useClaimValidation();
  const effectSizes = useEffectSizes();
  const resultConsistency = useResultConsistency();
  const sensitivityData = useSensitivityData();
  const failureModes = useFailureModes();
  const baselineCoverage = useBaselineCoverage();
  const ablationInterpretation = useAblationInterpretation();
  const realDataContext = useRealDataContext();
  const regimeBreakdownData = useRegimeBreakdownFromAdapter();
  const depositInteraction = useDepositInteraction();
  const panelSizeSensitivity = usePanelSizeSensitivity();

  const deltaCrps = realData
    ? (realData.rows.find(r => r.method === 'mechanism')?.delta_crps_vs_equal ?? null)
    : useExp ? (expMechanism?.deltaCrps ?? null) : demoDelta;
  const gini = useExp ? (expMechanism?.finalGini ?? null) : demoBlended.pipeline.summary.finalGini;

  const accuracyVerdict: Verdict = deltaCrps == null ? 'neutral' : deltaCrps < -ACCURACY_EPS ? 'good' : deltaCrps > ACCURACY_EPS ? 'bad' : 'neutral';
  const concentrationVerdict: Verdict = gini == null ? 'neutral' : gini < 0.55 ? 'good' : gini > 0.7 ? 'bad' : 'neutral';

  if (!tabs.includes(activeTab as never)) setActiveTab(tabs[0]);

  return (
    <FigureProvider>
    <EquationProvider>
    <PageShell width="wide">
        <Breadcrumb activeTab={activeTab} />

        {/* ── Header ── */}
        <PageHeader
          hero
          eyebrow="Step 2 · Empirical results"
          title="Results"
          description={useExp
            ? `${expSeedCount} scenarios, paired comparison across all methods.`
            : `Seed ${DEMO_SEED} · ${DEMO_N} agents · ${DEMO_T} rounds`}
        />

        {/* ── Experiment guide (collapsible) ── */}
        <ExperimentGuide />

        {/* ── Headline cards ── */}
        <section className="grid sm:grid-cols-2 gap-4">
          <AnswerCard
            question="Does skill improve accuracy?"
            answer={deltaCrps == null ? '-' : deltaCrps < 0 ? 'Yes' : 'No'}
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
            answer={gini == null ? '-' : gini < 0.4 ? 'Low' : gini < 0.6 ? 'Moderate' : 'High'}
            detail={gini == null ? '' : `Gini = ${fmt(gini, 3)}`}
            verdict={concentrationVerdict}
            explanation={
              gini == null ? 'Loading data.'
                : `Gini measures wealth inequality (0 = equal, 1 = monopoly). ${fmt(gini, 3)} means ${gini < 0.4 ? 'influence stays well-distributed' : gini < 0.6 ? 'moderate concentration, multiple agents retain influence' : 'a few agents dominate'}.`
            }
          />
        </section>

        {/* ── Tabs ── */}
        <section>
          <TabBar
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(t) => setActiveTab(t as typeof activeTab)}
            progressLabel={`Section ${tabs.indexOf(activeTab as never) + 1} of ${tabs.length}: ${activeTab}`}
          />
          <div className="mt-6" />

          <ChartLinkingProvider initialMethods={['uniform', 'deposit', 'skill', 'mechanism']}>

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
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-semibold">Real data</span>
                  <h3 className="text-sm font-semibold text-indigo-900">Elia Offshore Wind: {realData.config.T.toLocaleString()} hourly points</h3>
                </div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  {realData.config.n_forecasters} forecasting models ({realData.config.forecasters.join(', ')}) run on Belgian offshore wind power, 2024&ndash;2025.
                  Every model is strictly causal and is retrained on a rolling window. The mechanism does not see future information;
                  it learns which model is performing best so far and adjusts the aggregate weights accordingly.
                  Improvement over equal weighting is statistically significant at the 0.1% level (Diebold&ndash;Mariano test, HAC-corrected).
                </p>
              </div>

              <DeltaBarChart
                data={realData.rows
                  .filter(r => r.method !== 'uniform')
                  .sort((a, b) => a.delta_crps_vs_equal - b.delta_crps_vs_equal)
                  .map(r => ({
                    label: METHOD_CHART_LABELS[r.method] ?? r.method,
                    delta: r.delta_crps_vs_equal * 1e4,
                    color: METHOD_CHART_COLORS[r.method] ?? '#64748b',
                  }))}
                baselineLabel="Equal weighting"
                metricLabel="Δ CRPS (×10⁴)"
                title="Method comparison: Wind power"
                provenance={{ type: 'real', label: 'Real data, Elia wind' }}
              />

              {/* DM test significance badge */}
              {realData?.dm_test && (
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    realData.dm_test.significant_at_001 ? 'bg-green-100 text-green-700' :
                    realData.dm_test.significant_at_005 ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    Diebold&ndash;Mariano test: p {realData.dm_test.significant_at_001 ? '< 0.001 ***' :
                      realData.dm_test.significant_at_005 ? '< 0.05 *' : `= ${realData.dm_test.p_value.toFixed(4)}`}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Mechanism vs equal weighting, Newey&ndash;West (HAC) standard errors
                  </span>
                </div>
              )}

              {/* Mechanism vs alternatives interpretive callout */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-2">
                <h4 className="text-xs font-semibold text-indigo-900">Why simpler methods can still beat the mechanism on raw CRPS</h4>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Median and inverse-variance weighting reach slightly lower CRPS on this dataset because they optimise
                  pure forecast quality with no other constraints. The mechanism gives up a small amount of aggregation
                  quality in exchange for properties those methods lack:
                  <strong> incentive-compatible settlement</strong> (agents are paid for being accurate),
                  <strong> budget balance</strong> (no external funding is needed),
                  <strong> sybil resistance</strong> (identical clones gain nothing; diversified sybil strategies gain only a small margin), and
                  <strong> online adaptivity</strong> (skill is learned from scratch, with no prior information).
                  The contribution of this project is the complete economic structure, not just the aggregate accuracy.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-slate-800">CRPS over time</h3>
                  <ZoomBadge isZoomed={cumErrorZoom.state.isZoomed} onReset={cumErrorZoom.reset} />
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Running average of CRPS (lower is better) for each weighting method over the
                  {' '}{realData.config.T.toLocaleString()} hourly rounds. If the skill &times; stake line
                  stays below the equal-weighting line, the online skill layer is adding value.
                  The gap widens as the mechanism learns. Early rounds are noisy because the EWMA has
                  not yet converged (half-life &asymp; 7 rounds at ρ = 0.1); the ranking stabilises
                  after roughly 50 rounds.
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
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ═══ Deposit sensitivity on real wind data ═══ */}
              {realData && (
                <DepositSensitivityPanel />
              )}

              {/* ═══ External validation: Elia operational forecasts (Claim 10) ═══ */}
              <EliaOperationalBaseline />

              {/* ═══ Calibration + recalibration layer (Claims 6 & 7) ═══ */}
              <RecalibrationPanel />

              {/* ═══ Skill Recognition ═══ */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      How the mechanism learns forecaster quality
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      The EWMA skill layer observes each forecaster&apos;s CRPS every round and updates a
                      running skill estimate σ. Higher σ means a better forecaster, which in turn means
                      a larger weight in the aggregate.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSkillSource('real')}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        skillSource === 'real'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      Real data
                    </button>
                    <button
                      onClick={() => setSkillSource('dgp')}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        skillSource === 'dgp'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      Synthetic
                    </button>
                  </div>
                </div>

                {skillSource === 'real' && hasRealSkill ? (
                  <>
                    <ForecasterSelector
                      forecasters={forecasterItems}
                      selectedIndex={selectedForecaster}
                      onSelect={setSelectedForecaster}
                    />

                    {/* 1. Horizontal bar chart: final σ ranking (the key result) */}
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-3">Learned skill ranking (steady-state σ)</div>
                      <ResponsiveContainer width="100%" height={sortedSteadyState.length * 36 + 40}>
                        <BarChart
                          data={buildBarData(sortedSteadyState, AGENT_PALETTE)}
                          layout="vertical"
                          margin={{ top: 4, right: 60, bottom: 4, left: 140 }}
                        >
                          <CartesianGrid {...GRID_PROPS} horizontal={false} />
                          <XAxis type="number" domain={[0.6, 1]} tick={AXIS_TICK} stroke={AXIS_STROKE}
                            label={{ value: 'Skill σ (higher = better)', position: 'insideBottom', offset: -4, fontSize: 11, fill: '#64748b' }} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#334155' }} stroke={AXIS_STROKE} width={130} />
                          <Tooltip content={<SmartTooltip />} />
                          <Bar dataKey="sigma" name="Skill σ" radius={[0, 4, 4, 0]} maxBarSize={28}>
                            {buildBarData(sortedSteadyState, AGENT_PALETTE).map((entry) => (
                              <Cell
                                key={entry.originalIndex}
                                fill={entry.fill}
                                opacity={entry.originalIndex === selectedForecaster ? 0.95 : 0.5}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSelectedForecaster(entry.originalIndex)}
                              />
                            ))}
                            <LabelList dataKey="sigma" position="right"
                              formatter={(v: string | number | boolean | null | undefined) => {
                                const n = Number(v);
                                return Number.isFinite(n) ? n.toFixed(3) : '';
                              }}
                              style={{ fontSize: 11, fill: '#334155', fontFamily: 'monospace' }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Naive (last value) ranks highest because wind power is highly autocorrelated
                        hour to hour, so the previous value is a strong predictor. ARIMA ranks lowest
                        because its quantile predictions are poorly calibrated on this series.
                      </p>
                    </div>

                    {/* 2. σ trajectory over time (full width, single chart) */}
                    <div>
                      <div className="text-xs font-semibold text-slate-600 mb-2">
                        σ trajectory over {realData!.config.T.toLocaleString()} hours
                        <span className="text-xs text-slate-500 ml-2">
                          Showing: {realForecasterNames[selectedForecaster]} (σ = {fmt(realTargetSigmas[selectedForecaster], 3)})
                        </span>
                      </div>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={realSkillConvergence} margin={{ top: 8, right: 24, bottom: 28, left: 52 }}>
                          <CartesianGrid {...GRID_PROPS} />
                          <XAxis dataKey="t" tick={AXIS_TICK} stroke={AXIS_STROKE}
                            tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                            label={{ value: 'Hour', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                          <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={sigmaDomain}
                            tickFormatter={(v: number) => v.toFixed(2)}
                            label={{ value: 'Skill σ', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                          <Tooltip content={<SmartTooltip />} />
                          {buildLineRenderOrder(realForecasterCount, selectedForecaster).map((i) => {
                            const style = getLineStyle(selectedForecaster, i);
                            return (
                              <Line key={i} type="monotone" dataKey={`sigma_${i}`} name={realForecasterNames[i]}
                                stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                                strokeWidth={style.strokeWidth}
                                strokeOpacity={style.opacity}
                                dot={false} />
                            );
                          })}
                          <ReferenceLine y={realTargetSigmas[selectedForecaster]}
                            stroke={AGENT_PALETTE[selectedForecaster % AGENT_PALETTE.length]}
                            strokeDasharray="6 3" strokeOpacity={0.6}>
                            <Label value={fmt(realTargetSigmas[selectedForecaster], 3)} position="right" fontSize={11} fill="#334155" />
                          </ReferenceLine>
                        </LineChart>
                      </ResponsiveContainer>
                      <p className="text-[11px] text-slate-400 mt-1">
                        The lines separate during the first few hundred hours as the EWMA converges,
                        then stay in order &mdash; Naive (last-value) is the top line throughout.
                        Hover for numerical values.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Three synthetic forecasters with controlled noise: Good (τ = 0.2, low noise),
                      Okay (τ = 0.6, medium noise), and Bad (τ = 1.5, high noise). The EWMA skill layer
                      has to learn which is which from their CRPS scores alone. Deposits are held fixed
                      so the skill signal is isolated from any wealth feedback.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[11px] font-semibold text-slate-600 mb-1">Skill estimate σ</div>
                        <ResponsiveContainer width="100%" height={400}>
                          <LineChart data={skillConvergence} margin={{ top: 4, right: 8, bottom: 24, left: 52 }}>
                            <CartesianGrid {...GRID_PROPS} />
                            <XAxis dataKey="round" tick={{ ...AXIS_TICK, fontSize: 11 }} stroke={AXIS_STROKE}
                              label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                            <YAxis tick={{ ...AXIS_TICK, fontSize: 11 }} stroke={AXIS_STROKE} domain={[0, 1]}
                              label={{ value: 'σ', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11, fill: '#64748b' }} />
                            <Tooltip content={<SmartTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
                            {Array.from({ length: CONV_N }, (_, i) => (
                              <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={CONV_LABELS[i]}
                                stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={2} dot={false} />
                            ))}
                            {targetSigmas.map((ts, i) => (
                              <ReferenceLine key={`ts-${i}`} y={ts}
                                stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                                strokeDasharray="6 3" strokeOpacity={0.4}>
                                <Label value={fmt(ts, 3)} position="right" fontSize={10} fill="#334155" />
                              </ReferenceLine>
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                        <p className="text-[11px] text-slate-400 mt-1">Good → high σ, Bad → low σ. Dashed = steady state.</p>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-slate-600 mb-1">Normalised weight</div>
                        <ResponsiveContainer width="100%" height={400}>
                          <LineChart data={weightConvergence} margin={{ top: 4, right: 8, bottom: 24, left: 52 }}>
                            <CartesianGrid {...GRID_PROPS} />
                            <XAxis dataKey="round" tick={{ ...AXIS_TICK, fontSize: 11 }} stroke={AXIS_STROKE}
                              label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                            <YAxis tick={{ ...AXIS_TICK, fontSize: 11 }} stroke={AXIS_STROKE} domain={[0.2, 0.5]}
                              label={{ value: 'w', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11, fill: '#64748b' }} />
                            <Tooltip content={<SmartTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
                            {Array.from({ length: CONV_N }, (_, i) => (
                              <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={CONV_LABELS[i]}
                                stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={2} dot={false} />
                            ))}
                            {targetWeights.map((tw, i) => (
                              <ReferenceLine key={`tw-${i}`} y={tw}
                                stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                                strokeDasharray="6 3" strokeOpacity={0.4}>
                                <Label value={fmt(tw, 3)} position="right" fontSize={10} fill="#334155" />
                              </ReferenceLine>
                            ))}
                            <ReferenceLine y={1 / CONV_N} stroke="#94a3b8" strokeDasharray="2 2" strokeOpacity={0.3} />
                          </LineChart>
                        </ResponsiveContainer>
                        <p className="text-[11px] text-slate-400 mt-1">Weights start at 1/3, diverge via g(σ). Dashed = steady state.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ═══ Weight Learning: Two Approaches ═══ */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">Weight learning: two approaches</h3>
                  <p className="text-xs text-slate-500">
                    The core question: does the mechanism correctly identify which forecasters are skilled?
                    Two approaches are compared here. The least-mean-squares (LMS) learner on the left
                    regresses the outcome on the reports directly, so it recovers the structural weights
                    by construction (here w = [0.8, 0.1, 0.5]). The core mechanism on the right works
                    differently: it scores each forecaster individually with CRPS, smooths that score with
                    an EWMA, and maps the smoothed loss to a skill estimate σ. It is tested on an exogenous
                    data-generating process with three forecasters of known quality &mdash; Good (τ = 0.2,
                    low noise), Okay (τ = 0.6, medium noise), and Bad (τ = 1.5, high noise). All three start
                    with equal weight, and the mechanism has to learn the ranking from scratch.
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Left: LMS direct weight recovery */}
                  {weightRecovery.length > 0 && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-emerald-700">LMS direct regression</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold">T = 15,000</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Minimises the squared error (y − w &middot; r)² by gradient descent. It sees the
                          outcome and all the reports and adjusts the weight vector so that the linear
                          combination matches. Under this set-up it recovers the structural weights
                          almost exactly.
                        </p>
                      </div>
                      <ResponsiveContainer width="100%" height={360}>
                        <BarChart
                          data={weightRecovery.map(r => ({
                            name: `F${r.forecaster + 1}`,
                            target: r.wTarget,
                            learned: r.wLearned,
                          }))}
                          margin={{ top: 8, right: 24, bottom: 24, left: 24 }}
                        >
                          <CartesianGrid {...GRID_PROPS} />
                          <XAxis dataKey="name" tick={{ ...AXIS_TICK, fontSize: 12 }} stroke={AXIS_STROKE} />
                          <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]} />
                          <Tooltip contentStyle={TOOLTIP_STYLE as React.CSSProperties}
                            formatter={(v: unknown) => [fmt(Number(v), 4), '']} />
                          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                          <Bar dataKey="target" name="True w" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={28} opacity={0.5} />
                          <Bar dataKey="learned" name="LMS learned" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} opacity={0.9} />
                        </BarChart>
                      </ResponsiveContainer>
                      <p className="text-[11px] text-slate-500">
                        Mean absolute error (MAE) = {fmt(weightRecovery.reduce((s, r) => s + r.absError, 0) / weightRecovery.length, 4)}.
                        The LMS learner recovers the true weights almost exactly because it optimises
                        for them directly.
                      </p>
                    </div>
                  )}

                  {/* Right: Core mechanism skill-based weights */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-indigo-700">Core mechanism (EWMA skill layer)</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-semibold">T = 500</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-1">
                        3 agents with controlled noise: Good (τ=0.2), Okay (τ=0.6), Bad (τ=1.5).
                        Fixed deposits (b=1) isolate the skill signal.
                      </p>
                      <div className="space-y-2">
                        <MathBlock accent label="1. CRPS loss" latex="\\ell_{i,t} = \\frac{2}{K} \\sum_{k=1}^{K} L^{\\tau_k}(y_t, q_{i,t}^{(k)})" />
                        <MathBlock accent label="2. EWMA smoothing" latex="L_{i,t} = (1 - \\rho)\\, L_{i,t-1} + \\rho\\, \\ell_{i,t}" />
                        <MathBlock accent label="3. Skill estimate" latex="\\sigma_{i,t} = \\sigma_{\\min} + (1 - \\sigma_{\\min})\\, e^{-\\gamma L_{i,t}}" />
                        <MathBlock accent label="4. Normalised weight" latex="w_{i,t} = \\frac{b_{i,t} \\cdot g(\\sigma_{i,t})}{\\sum_j b_{j,t} \\cdot g(\\sigma_{j,t})}, \\quad g(\\sigma) = \\lambda + (1-\\lambda)\\sigma^\\eta" />
                      </div>
                      <MathBlock
                        caption="The mechanism chain: each round, CRPS loss feeds into EWMA smoothing, which produces a skill estimate σ that gates the effective wager."
                      />
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                        <strong>Absent agents:</strong> When an agent is absent, the EWMA update depends on the decay parameter κ.
                        If κ &gt; 0, the loss decays toward the prior L₀: L<sub>i,t</sub> = (1−κ)L<sub>i,t−1</sub> + κL₀.
                        If κ = 0, the loss freezes: L<sub>i,t</sub> = L<sub>i,t−1</sub>.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {/* σ trajectory */}
                      <div>
                        <div className="text-[11px] font-semibold text-slate-600 mb-1">Skill estimate σ</div>
                        <ResponsiveContainer width="100%" height={360}>
                          <LineChart data={skillConvergence} margin={{ top: 4, right: 8, bottom: 4, left: 36 }}>
                            <CartesianGrid {...GRID_PROPS} />
                            <XAxis dataKey="round" tick={{ ...AXIS_TICK, fontSize: 11 }} stroke={AXIS_STROKE} />
                            <YAxis tick={{ ...AXIS_TICK, fontSize: 11 }} stroke={AXIS_STROKE} domain={[0, 1]}
                              label={{ value: 'σ', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11, fill: '#64748b' }} />
                            <Tooltip content={<SmartTooltip />} />
                            {Array.from({ length: CONV_N }, (_, i) => (
                              <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={CONV_LABELS[i]}
                                stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={2} dot={false} />
                            ))}
                            {targetSigmas.map((ts, i) => (
                              <ReferenceLine key={`ts-${i}`} y={ts}
                                stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                                strokeDasharray="6 3" strokeOpacity={0.4}>
                                <Label value={fmt(ts, 3)} position="right" fontSize={11} fill="#334155" />
                              </ReferenceLine>
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                        <p className="text-[11px] text-slate-400">Good → high σ, Bad → low σ. Dashed = steady state.</p>
                      </div>
                      {/* Weight trajectory */}
                      <div>
                        <div className="text-[11px] font-semibold text-slate-600 mb-1">Normalised weight</div>
                        <ResponsiveContainer width="100%" height={360}>
                          <LineChart data={weightConvergence} margin={{ top: 4, right: 8, bottom: 4, left: 36 }}>
                            <CartesianGrid {...GRID_PROPS} />
                            <XAxis dataKey="round" tick={{ ...AXIS_TICK, fontSize: 11 }} stroke={AXIS_STROKE} />
                            <YAxis tick={{ ...AXIS_TICK, fontSize: 11 }} stroke={AXIS_STROKE} domain={[0.2, 0.5]}
                              label={{ value: 'w', angle: -90, position: 'insideLeft', offset: 0, fontSize: 11, fill: '#64748b' }} />
                            <Tooltip content={<SmartTooltip />} />
                            {Array.from({ length: CONV_N }, (_, i) => (
                              <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={CONV_LABELS[i]}
                                stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={2} dot={false} />
                            ))}
                            {targetWeights.map((tw, i) => (
                              <ReferenceLine key={`tw-${i}`} y={tw}
                                stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                                strokeDasharray="6 3" strokeOpacity={0.4}>
                                <Label value={fmt(tw, 3)} position="right" fontSize={11} fill="#334155" />
                              </ReferenceLine>
                            ))}
                            <ReferenceLine y={1 / CONV_N} stroke="#94a3b8" strokeDasharray="2 2" strokeOpacity={0.3} />
                          </LineChart>
                        </ResponsiveContainer>
                        <p className="text-[11px] text-slate-400">Weights start at 1/3, diverge via g(σ). Dashed = steady state.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis callout */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-2">
                  <div className="font-semibold text-slate-700">Why the difference matters</div>
                  <p>
                    The LMS learner regresses y on the report vector [r₁, r₂, r₃] directly, so it solves
                    a linear system and recovers the structural weights (MAE &asymp; 0.02). The core
                    mechanism does something different: it measures each forecaster&apos;s individual CRPS,
                    smooths it with an EWMA, converts the smoothed loss to a skill estimate σ, and then
                    derives weights as σ &times; deposit. It never optimises the aggregation weights
                    directly.
                  </p>
                  <p>
                    That is by design. The mechanism&apos;s goal is not to recover structural weights,
                    it is to <span className="font-semibold">identify skilled forecasters and give them
                    more influence</span> in a setting where agents hold deposits, face strategic
                    incentives, and participate intermittently. Going through individual CRPS gives the
                    mechanism robustness to manipulation (σ falls when an agent misreports) at the cost
                    of precise weight recovery.
                  </p>
                  <p>
                    On the exogenous data-generating process used here (latent-fixed, where &ldquo;skill&rdquo;
                    means low noise), the mechanism correctly gives more weight to the low-noise
                    forecasters. On an endogenous data-generating process (where &ldquo;skill&rdquo; means
                    structural contribution to the outcome), it approximates but does not exactly recover
                    the true weights, because individual CRPS does not map perfectly to structural
                    importance.
                  </p>
                </div>
              </div>

              {/* ═══ Per-forecaster CRPS over time ═══ */}
              {realData?.per_agent_crps && realData.per_agent_crps.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800">Per-forecaster CRPS over time</h3>
                  <p className="text-xs text-slate-500">
                    Individual CRPS for each forecaster at each round. Lower is better. Useful for
                    seeing which forecaster is leading at different points in the run.
                  </p>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={realData.per_agent_crps} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}>
                      <CartesianGrid {...GRID_PROPS} />
                      <XAxis dataKey="t" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                      <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                        label={{ value: 'CRPS', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                      <Tooltip content={<SmartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {(realData.forecaster_names ?? []).slice(0, 5).map((name, i) => (
                        <Line key={i} type="monotone" dataKey={`crps_${i}`} name={name}
                          stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={i < 3 ? 2.5 : 1.5} dot={false} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* ═══ Rolling improvement over time ═══ */}
              {realData?.rolling_improvement && realData.rolling_improvement.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800">Rolling improvement over time</h3>
                  <p className="text-xs text-slate-500">
                    CRPS improvement of the mechanism over equal weighting, measured in sliding
                    1&thinsp;000-hour windows. A negative value means the mechanism is better in that
                    window. The chart gives a sense of how stable the advantage is across the run.
                  </p>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={realData.rolling_improvement} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}>
                      <CartesianGrid {...GRID_PROPS} />
                      <XAxis dataKey="t_start" tick={AXIS_TICK} stroke={AXIS_STROKE}
                        label={{ value: 'Window start (hour)', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                        label={{ value: 'Δ CRPS %', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                      <Tooltip content={<SmartTooltip />} />
                      <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="pct_improvement" name="Improvement %"
                        stroke="#6366f1" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* ═══ Aggregate calibration ═══ */}
              {realData?.calibration && realData.calibration.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800">Aggregate calibration (mechanism)</h3>
                  <p className="text-xs text-slate-500">
                    Probability integral transform (PIT) coverage: the empirical fraction of outcomes
                    that fall below each nominal quantile level. Perfect calibration means the
                    empirical coverage equals the nominal level.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-1.5 text-slate-500 font-medium">τ</th>
                          <th className="text-right py-1.5 text-slate-500 font-medium">Nominal</th>
                          <th className="text-right py-1.5 text-slate-500 font-medium">Empirical</th>
                          <th className="text-right py-1.5 text-slate-500 font-medium">Gap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {realData.calibration.map((c: { tau: number; nominal: number; empirical: number; gap: number }) => (
                          <tr key={c.tau} className="border-b border-slate-100">
                            <td className="py-1.5 font-mono">{c.tau.toFixed(2)}</td>
                            <td className="text-right py-1.5 font-mono">{c.nominal.toFixed(2)}</td>
                            <td className="text-right py-1.5 font-mono">{c.empirical.toFixed(4)}</td>
                            <td className={`text-right py-1.5 font-mono ${c.gap > 0.03 ? 'text-amber-600' : 'text-green-600'}`}>
                              {c.gap.toFixed(4)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ═══ Train/test split validation ═══ */}
              {realData?.train_test_split && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800">Train/test split validation</h3>
                  <p className="text-xs text-slate-500">
                    First {realData.train_test_split.train_rounds.toLocaleString()} rounds for learning,
                    last {realData.train_test_split.test_rounds.toLocaleString()} for evaluation.
                    Consistent results = no overfitting.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-1.5 text-slate-500 font-medium">Method</th>
                          <th className="text-right py-1.5 text-slate-500 font-medium">Train CRPS</th>
                          <th className="text-right py-1.5 text-slate-500 font-medium">Test CRPS</th>
                          <th className="text-right py-1.5 text-slate-500 font-medium">Train Δ</th>
                          <th className="text-right py-1.5 text-slate-500 font-medium">Test Δ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(realData.train_test_split.methods)
                          .sort(([,a], [,b]) => a.test_crps - b.test_crps)
                          .map(([method, vals]) => (
                            <tr key={method} className="border-b border-slate-100">
                              <td className="py-1.5 font-medium text-slate-700">{METHOD_CHART_LABELS[method] ?? method}</td>
                              <td className="text-right py-1.5 font-mono">{vals.train_crps.toFixed(6)}</td>
                              <td className="text-right py-1.5 font-mono">{vals.test_crps.toFixed(6)}</td>
                              <td className={`text-right py-1.5 font-mono ${vals.train_delta_vs_uniform < 0 ? 'text-green-600' : 'text-slate-500'}`}>
                                {vals.train_delta_vs_uniform >= 0 ? '+' : ''}{vals.train_delta_vs_uniform.toFixed(6)}
                              </td>
                              <td className={`text-right py-1.5 font-mono ${vals.test_delta_vs_uniform < 0 ? 'text-green-600' : 'text-slate-500'}`}>
                                {vals.test_delta_vs_uniform >= 0 ? '+' : ''}{vals.test_delta_vs_uniform.toFixed(6)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Electricity results */}
          {activeTab === 'Real data' && realDataElec && (
            <div className="space-y-6 mt-8">
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[11px] font-semibold">Dataset 2</span>
                  <h3 className="text-sm font-semibold text-teal-900">Elia imbalance prices: {realDataElec.config.T.toLocaleString()} points</h3>
                </div>
                <p className="text-xs text-teal-700 leading-relaxed">
                  The same seven forecasting models, run on Belgian electricity imbalance prices at
                  15-minute resolution (2024). Prices are volatile and spike frequently, which makes
                  this a harder forecasting task and a useful generalisation check.
                </p>
              </div>
              <DeltaBarChart
                data={realDataElec.rows
                  .filter(r => r.method !== 'uniform')
                  .sort((a, b) => a.delta_crps_vs_equal - b.delta_crps_vs_equal)
                  .map(r => ({
                    label: METHOD_CHART_LABELS[r.method] ?? r.method,
                    delta: r.delta_crps_vs_equal * 1e4,
                    color: METHOD_CHART_COLORS[r.method] ?? '#64748b',
                  }))}
                baselineLabel="Equal weighting"
                metricLabel="Δ CRPS (×10⁴)"
                title="Method comparison: Electricity prices"
                provenance={{ type: 'real', label: 'Real data, Elia electricity' }}
              />
            </div>
          )}

          {activeTab === 'Real data' && !realData && !loading && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-500">Real-data comparison is not available. Run the forecaster models on the Elia data first, then reload this page.</p>
            </div>
          )}

          {/* ═══ EXPERIMENT-BACKED TABS ═══ */}

          {useExp && !loading && activeTab === 'Accuracy' && (
            expAccuracyDisplay.length > 0 && calibrationData.length > 0 && ablationData.length > 0 ? (
              <div className="space-y-6">
              <FourPanelLayout
                title="Master Comparison"
                thesisPoint="Accuracy, calibration, weight concentration, and ablation evidence at a glance."
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
                    <ResponsiveContainer width="100%" height={360}>
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
                    <ResponsiveContainer width="100%" height={360}>
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

              {/* Trade-off scatter: accuracy vs concentration */}
              <TradeOffScatter
                data={expTradeOffData}
                title="Accuracy vs Concentration Trade-off"
                provenance={{ type: 'synthetic', label: `Synthetic, ${defaultExperiment}` }}
              />

              {/* Waterfall: incremental CRPS change */}
              <WaterfallChart
                data={expWaterfallData}
                title="Incremental CRPS Improvement"
                metricLabel="Mean CRPS"
                provenance={{ type: 'synthetic', label: `Synthetic, ${defaultExperiment}` }}
              />
              </div>
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
            calibrationData.length === 0 ? (
              <div
                className="p-5"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="panel-heading">Calibration</h3>
                </div>
                <p style={{ fontSize: 12, color: 'var(--ink-faint)' }}>Calibration data not available.</p>
              </div>
            ) : (
              <CalibrationChart
                data={calibration}
              />
            )
          )}

          {useExp && activeTab === 'Ablation' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Bankroll ablation (ΔCRPS vs Full)</h3>
              {ablationData.length === 0 ? (
                <p className="text-[11px] text-slate-500">Ablation data not available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={360}>
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
              {/* Experiment setup */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 mb-1">Experiment setup</div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  {DEMO_N} synthetic forecasters, baseline data-generating process
                  (y &sim; U(0, 1); each agent reports y plus independent noise), {DEMO_T} rounds,
                  seed {DEMO_SEED}. Four weighting methods are run on identical data; only the
                  influence rule changes:
                  equal (w<sub>i</sub> = 1/N), stake-only (w<sub>i</sub> &prop; b<sub>i</sub>),
                  skill-only (w<sub>i</sub> &prop; g(σ<sub>i</sub>)), and
                  skill &times; stake (w<sub>i</sub> &prop; b<sub>i</sub> &middot; g(σ<sub>i</sub>)).
                  Every agent participates every round and reports truthfully, so the only thing
                  changing is the weighting rule.
                </p>
              </div>

              {/* Method race — cumulative error with interactive annotations */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Method comparison: cumulative forecast error</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Running average CRPS by method. Lower = better. Gap between lines = mechanism's advantage.
                  </p>
                </div>

                {/* Live stats strip — shows final values */}
                <div className="grid grid-cols-4 gap-2">
                  {demoMethods.map(m => {
                    const finalError = m.pipeline.summary.meanError;
                    const equalError = demoMethods.find(x => x.key === 'equal')!.pipeline.summary.meanError;
                    const delta = finalError - equalError;
                    const pct = equalError > 0 ? (delta / equalError * 100) : 0;
                    return (
                      <div key={m.key} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: m.color }} />
                          <span className="text-[11px] font-medium text-slate-600 truncate">{m.label}</span>
                        </div>
                        <div className="text-sm font-bold font-mono text-slate-800 mt-0.5">{fmt(finalError, 4)}</div>
                        {m.key !== 'equal' && (
                          <div className={`text-[11px] font-mono ${delta < 0 ? 'text-emerald-600' : delta > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                            {delta >= 0 ? '+' : ''}{pct.toFixed(1)}% vs equal
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <ResponsiveContainer width="100%" height={450}>
                  <LineChart data={demoCumError} margin={{ ...CHART_MARGIN_LABELED, left: 52, right: 24 }}>
                    <defs>
                      <linearGradient id="mechAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.08} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...GRID_PROPS} />
                    <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
                      label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={['auto', 'auto']}
                      label={{ value: 'Cumulative mean error (lower = better)', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                    <Tooltip content={<SmartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                    {/* Phase annotation: EWMA convergence zone */}
                    <ReferenceArea x1={1} x2={50} fill="#f1f5f9" fillOpacity={0.5} />
                    <ReferenceLine x={50} stroke="#cbd5e1" strokeDasharray="4 4">
                      <Label value="EWMA converges (~50 rounds)" position="top" fontSize={11} fill="#94a3b8" offset={8} />
                    </ReferenceLine>
                    {demoMethods.map((m) => (
                      <Line key={m.key} type="monotone" dataKey={m.key} name={m.label} stroke={m.color}
                        strokeWidth={m.key === 'blended' ? 3.5 : 2}
                        dot={false}
                        strokeDasharray={m.key === 'equal' ? '8 4' : m.key === 'stake_only' ? '6 3' : m.key === 'skill_only' ? '3 3' : undefined}
                        activeDot={{ r: 5, strokeWidth: 2 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>

                {/* Insight callout */}
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    <span className="font-semibold">Key insight:</span> Lines converge during the first ~50 rounds while the EWMA skill estimates are still learning.
                    After convergence, Skill × stake consistently tracks below equal weighting. The gap is the mechanism's value.
                    The advantage is {fmt(Math.abs(demoDelta), 4)} mean CRPS ({(Math.abs(demoDelta) / demoEqual.pipeline.summary.meanError * 100).toFixed(1)}% improvement).
                  </p>
                </div>
              </div>

              {/* Skill convergence (demo) — with Real/DGP toggle */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  {skillSource === 'real' && hasRealSkill
                    ? `Skill recognition: Elia wind (${realForecasterCount} real forecasters)`
                    : 'Skill recognition: Synthetic DGP (3 controlled agents)'}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-slate-500">Data source:</span>
                  <button
                    onClick={() => setSkillSource('real')}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      skillSource === 'real'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Real forecasters
                  </button>
                  <button
                    onClick={() => setSkillSource('dgp')}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      skillSource === 'dgp'
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    Synthetic DGP
                  </button>
                </div>

                {skillSource === 'real' && hasRealSkill ? (
                  <>
                    <ForecasterSelector
                      forecasters={forecasterItems}
                      selectedIndex={selectedForecaster}
                      onSelect={setSelectedForecaster}
                    />
                    <p className="text-xs text-slate-500 mb-3">
                      Left: skill estimate σ (higher = better forecaster). Right: normalised weight.
                      Dashed line shows steady-state average for the selected model.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[11px] font-semibold text-slate-600 mb-1">Skill estimate σ</div>
                        <ResponsiveContainer width="100%" height={360}>
                          <LineChart data={realSkillConvergence} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}>
                            <CartesianGrid {...GRID_PROPS} />
                            <XAxis dataKey="t" tick={AXIS_TICK} stroke={AXIS_STROKE}
                              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                              label={{ value: 'Hour', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={sigmaDomain}
                              tickFormatter={(v: number) => v.toFixed(2)}
                              label={{ value: 'Skill σ', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                            <Tooltip content={<SmartTooltip />} />
                            {buildLineRenderOrder(realForecasterCount, selectedForecaster).map((i) => {
                              const style = getLineStyle(selectedForecaster, i);
                              return (
                                <Line key={i} type="monotone" dataKey={`sigma_${i}`} name={realForecasterNames[i]}
                                  stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                                  strokeWidth={style.strokeWidth}
                                  strokeOpacity={style.opacity}
                                  dot={false} />
                              );
                            })}
                            <ReferenceLine y={realTargetSigmas[selectedForecaster]}
                              stroke={AGENT_PALETTE[selectedForecaster % AGENT_PALETTE.length]}
                              strokeDasharray="6 3" strokeOpacity={0.6}>
                              <Label value={fmt(realTargetSigmas[selectedForecaster], 3)} position="right" fontSize={11} fill="#334155" />
                            </ReferenceLine>
                          </LineChart>
                        </ResponsiveContainer>
                        <p className="text-[11px] text-slate-400">Higher σ = better forecaster. Dashed = steady-state average.</p>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-slate-600 mb-1">Normalised weight</div>
                        <ResponsiveContainer width="100%" height={360}>
                          <LineChart data={realWeightConvergence} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}>
                            <CartesianGrid {...GRID_PROPS} />
                            <XAxis dataKey="t" tick={AXIS_TICK} stroke={AXIS_STROKE}
                              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                              label={{ value: 'Hour', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                              tickFormatter={(v: number) => v.toFixed(2)}
                              label={{ value: 'Weight', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                            <Tooltip content={<SmartTooltip />} />
                            {buildLineRenderOrder(realForecasterCount, selectedForecaster).map((i) => {
                              const style = getLineStyle(selectedForecaster, i);
                              return (
                                <Line key={i} type="monotone" dataKey={`weight_${i}`} name={realForecasterNames[i]}
                                  stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                                  strokeWidth={style.strokeWidth}
                                  strokeOpacity={style.opacity}
                                  dot={false} />
                              );
                            })}
                            <ReferenceLine y={realTargetWeights[selectedForecaster]}
                              stroke={AGENT_PALETTE[selectedForecaster % AGENT_PALETTE.length]}
                              strokeDasharray="6 3" strokeOpacity={0.6}>
                              <Label value={fmt(realTargetWeights[selectedForecaster], 3)} position="right" fontSize={11} fill="#334155" />
                            </ReferenceLine>
                            <ReferenceLine y={1 / realForecasterCount} stroke="#94a3b8" strokeDasharray="2 2" strokeOpacity={0.3} />
                          </LineChart>
                        </ResponsiveContainer>
                        <p className="text-[11px] text-slate-400">Weights start near 1/{realForecasterCount}, diverge via g(σ). Dashed = steady state.</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-slate-500 mb-3">
                      Three synthetic forecasters with controlled noise: Good (τ = 0.2), Okay (τ = 0.6),
                      Bad (τ = 1.5). The EWMA skill layer has to recover that ranking from individual
                      CRPS scores alone, with fixed deposits so there is no wealth feedback.
                    </p>
                <div className="grid grid-cols-2 gap-4">
                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart data={skillConvergence} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}>
                      <CartesianGrid {...GRID_PROPS} />
                      <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
                        label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]}
                        label={{ value: 'Skill σ', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                      <Tooltip content={<SmartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                      {Array.from({ length: CONV_N }, (_, i) => (
                        <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={CONV_LABELS[i]}
                          stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={2} dot={false} />
                      ))}
                      {targetSigmas.map((ts, i) => (
                        <ReferenceLine key={`ts-${i}`} y={ts}
                          stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                          strokeDasharray="6 3" strokeOpacity={0.4}>
                          <Label value={fmt(ts, 3)} position="right" fontSize={11} fill="#334155" />
                        </ReferenceLine>
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart data={weightConvergence} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}>
                      <CartesianGrid {...GRID_PROPS} />
                      <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
                        label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0.2, 0.5]}
                        label={{ value: 'Weight', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                      <Tooltip content={<SmartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                      {Array.from({ length: CONV_N }, (_, i) => (
                        <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={CONV_LABELS[i]}
                          stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={2} dot={false} />
                      ))}
                      {targetWeights.map((tw, i) => (
                        <ReferenceLine key={`tw-${i}`} y={tw}
                          stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                          strokeDasharray="6 3" strokeOpacity={0.4}>
                          <Label value={fmt(tw, 3)} position="right" fontSize={11} fill="#334155" />
                        </ReferenceLine>
                      ))}
                      <ReferenceLine y={1 / CONV_N} stroke="#94a3b8" strokeDasharray="2 2" strokeOpacity={0.3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                  </>
                )}
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 mt-3">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    The mechanism recovers the correct ranking: F1 (Good, low noise) ends up with the
                    highest σ, F3 (Bad, high noise) with the lowest. Weights fan out from the equal
                    starting point (1/3) through the skill gate g(σ) = λ + (1−λ)σ; the dashed lines
                    mark the steady-state targets measured over the final 100 rounds.
                  </p>
                </div>

              </div>

              {/* Trade-off scatter: accuracy vs concentration */}
              <TradeOffScatter
                data={tradeOffData}
                title="Accuracy vs Concentration Trade-off"
                provenance={{ type: 'demo', label: `In-browser demo, seed=${DEMO_SEED}, N=${DEMO_N}, T=${DEMO_T}` }}
              />

              {/* Waterfall: incremental CRPS change */}
              <WaterfallChart
                data={waterfallData}
                title="Incremental CRPS Improvement"
                metricLabel="Mean CRPS"
                provenance={{ type: 'demo', label: `In-browser demo, seed=${DEMO_SEED}, N=${DEMO_N}, T=${DEMO_T}` }}
              />
            </div>
          )}

          {!useExp && !loading && activeTab === 'Concentration' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              {/* Experiment setup */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 mb-1">Experiment setup</div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Same {DEMO_N} forecasters and {DEMO_T} rounds as the Accuracy tab. For each weighting
                  method we measure the final wealth Gini (how unequally wealth is distributed at the
                  end of the run) and the mean effective panel size N<sub>eff</sub> (how many
                  forecasters carry meaningful weight in the aggregate each round). The question is
                  whether skill weighting concentrates wealth too aggressively.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Influence distribution by method</h3>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3 mt-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Metrics explained</div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <MathBlock latex="\\text{Gini} = \\frac{\\sum_{i<j} |w_i - w_j|}{n \\sum w_i}" label="Gini coefficient" caption="0 = perfectly equal; 1 = a single agent gets everything" />
                    </div>
                    <div>
                      <MathBlock latex="N_{\\text{eff}} = \\frac{1}{\\text{HHI}} = \\frac{1}{\\sum_i \\hat{w}_i^2}" label="Effective number of forecasters" caption="How many agents carry meaningful weight" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Equal weighting gives Gini &asymp; 0 and N<sub>eff</sub> = N: perfectly fair, but
                    it ignores skill differences.
                    Skill &times; stake gives a higher Gini and a lower N<sub>eff</sub>: it concentrates
                    influence on the more skilled forecasters, which is what improves accuracy.
                    The mechanism is tuned so that N<sub>eff</sub> lands around 4&ndash;5 out of 6 &mdash;
                    enough concentration to reward skill, but not so much that one agent drives the
                    aggregate on its own. This balance comes from Lambert&apos;s (2008) design property:
                    the settlement rule ensures skilled agents profit without letting the aggregate
                    collapse onto a single participant.
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={demoConcentrationBar} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="name" tick={{ ...AXIS_TICK, fontSize: 12 }} stroke={AXIS_STROKE} />
                  <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <Tooltip content={<SmartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="gini" name="Final Gini" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {demoConcentrationBar.map((d) => <Cell key={d.key} fill={d.color} opacity={0.85} />)}
                    <LabelList
                      dataKey="gini"
                      position="top"
                      formatter={(v: string | number | boolean | null | undefined) => {
                        const n = Number(v);
                        return Number.isFinite(n) ? fmt(n, 3) : '-';
                      }}
                      style={{ fontSize: 11, fill: '#334155' }}
                    />
                  </Bar>
                  <Bar dataKey="nEff" name="Mean N_eff" radius={[4, 4, 0, 0]} maxBarSize={32} fill="#0ea5e9" opacity={0.85}>
                    <LabelList
                      dataKey="nEff"
                      position="top"
                      formatter={(v: string | number | boolean | null | undefined) => {
                        const n = Number(v);
                        return Number.isFinite(n) ? fmt(n, 3) : '-';
                      }}
                      style={{ fontSize: 11, fill: '#334155' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {!useExp && !loading && activeTab === 'Deposit policy' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              {/* Experiment setup */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 mb-1">Experiment setup</div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Same {DEMO_N} forecasters and {DEMO_T} rounds. All runs use the skill &times; stake
                  influence rule; only the deposit policy changes. Three rules are tested:
                  fixed (b = 1 every round), wealth fraction (b = 0.18 &middot; W), and
                  σ-scaled (b = f &middot; W &middot; (0.25 + 0.85 σ), where confident agents stake more).
                  The question is how the deposit rule shifts the trade-off between accuracy and concentration.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={demoDeposits} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="name" tick={{ ...AXIS_TICK, fontSize: 12 }} stroke={AXIS_STROKE} />
                  <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <Tooltip content={<SmartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="meanError" name="Mean error" radius={[4, 4, 0, 0]} maxBarSize={36} fill={SEM.outcome.main} opacity={0.85}>
                    <LabelList
                      dataKey="meanError"
                      position="top"
                      formatter={(v: string | number | boolean | null | undefined) => {
                        const n = Number(v);
                        return Number.isFinite(n) ? fmt(n, 3) : '-';
                      }}
                      style={{ fontSize: 11, fill: '#334155' }}
                    />
                  </Bar>
                  <Bar dataKey="gini" name="Final Gini" radius={[4, 4, 0, 0]} maxBarSize={36} fill={SEM.wealth.main} opacity={0.85}>
                    <LabelList
                      dataKey="gini"
                      position="top"
                      formatter={(v: string | number | boolean | null | undefined) => {
                        const n = Number(v);
                        return Number.isFinite(n) ? fmt(n, 3) : '-';
                      }}
                      style={{ fontSize: 11, fill: '#334155' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Deposit rules in detail</div>
                <MathBlock latex="m_i = b_i \\cdot g(\\sigma_i), \\quad g(\\sigma) = \\lambda + (1-\\lambda)\\sigma^{\\eta}" label="Effective wager" caption="The deposit b_i determines how much of the skill signal reaches the aggregate" />

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="text-[11px] font-semibold text-slate-700 mb-1">Fixed (b = 1)</div>
                    <MathBlock latex="b_i = 1 \\;\\; \\forall i" />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Isolates the skill signal &mdash; weight differences come only from σ. Fairest
                      rule because wealth never feeds back into influence.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="text-[11px] font-semibold text-slate-700 mb-1">Wealth fraction</div>
                    <MathBlock latex="b_i = f \\cdot W_i, \\quad f \\approx 0.18" />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Adds a feedback loop: winners deposit more, which gives them more weight, which
                      earns them more profit. Amplifies skill differences.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="text-[11px] font-semibold text-slate-700 mb-1">σ-scaled</div>
                    <MathBlock latex="b_i = f \\cdot W_i \\cdot (0.25 + 0.85\\,\\sigma_i)" />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Strongest amplification: confident agents stake more on top of the wealth
                      feedback. Highest accuracy in this demo, but also the highest concentration.
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  The chart shows mean CRPS (accuracy, lower is better) and final Gini (concentration,
                  lower is fairer) for each rule. The project uses the wealth-fraction rule as the
                  default because it balances accuracy against concentration risk. Fixed deposits
                  are used for the skill-recognition experiment above to isolate the pure skill
                  signal without any wealth feedback.
                </p>
              </div>
            </div>
          )}

          {/* ═══ SCIENTIFIC ANALYSIS TAB ═══ */}

          {activeTab === 'Scientific Analysis' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
                <h3 className="text-sm font-semibold text-indigo-900 mb-1">Scientific analysis</h3>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Automated checks on the project&apos;s claims: each headline statement is recomputed from
                  the underlying data, cross-experiment rankings are compared, parameter sensitivity is
                  summarised, failure modes are catalogued, and known analysis gaps are tracked. This
                  section is the interpretive layer that holds the results to scientific rigour.
                </p>
              </div>

              {/* ── Claim Evidence Cards ── */}
              <section>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Project Claims</h3>
                {claimValidation.loading ? (
                  <p className="text-xs text-slate-400">Loading claim validation…</p>
                ) : claimValidation.error ? (
                  <p className="text-xs text-slate-400">Data not yet available for this analysis.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {claimValidation.claims.map((claim) => {
                      const validation = claimValidation.results.find((r) => r.claimId === claim.id) ?? null;
                      const es = effectSizes.byMethod.get(claim.evidence?.comparison_method ?? '') ?? null;
                      return (
                        <ClaimEvidenceCard
                          key={claim.id}
                          claim={claim}
                          validation={validation}
                          effectSize={es}
                        />
                      );
                    })}
                  </div>
                )}
              </section>

              {/* ── Result Consistency Matrix ── */}
              <section>
                {resultConsistency.loading ? (
                  <p className="text-xs text-slate-400">Loading consistency matrix…</p>
                ) : resultConsistency.error ? (
                  <p className="text-xs text-slate-400">Data not yet available for this analysis.</p>
                ) : resultConsistency.data ? (
                  <ResultConsistencyMatrix result={resultConsistency.data} />
                ) : null}
              </section>

              {/* ── Sensitivity Panel ── */}
              <section>
                {sensitivityData.loading ? (
                  <p className="text-xs text-slate-400">Loading sensitivity analysis…</p>
                ) : sensitivityData.error ? (
                  <p className="text-xs text-slate-400">Data not yet available for this analysis.</p>
                ) : sensitivityData.data ? (
                  <SensitivityPanel summary={sensitivityData.data} />
                ) : null}
              </section>

              {/* ── Failure Mode Panel ── */}
              <section>
                {failureModes.loading ? (
                  <p className="text-xs text-slate-400">Loading failure modes…</p>
                ) : failureModes.error ? (
                  <p className="text-xs text-slate-400">Data not yet available for this analysis.</p>
                ) : failureModes.data ? (
                  <FailureModePanel failureModes={failureModes.data} />
                ) : (
                  <FailureModePanel failureModes={[]} />
                )}
              </section>

              {/* ── Baseline Coverage Table ── */}
              <section>
                {baselineCoverage.loading ? (
                  <p className="text-xs text-slate-400">Loading baseline coverage…</p>
                ) : baselineCoverage.error ? (
                  <p className="text-xs text-slate-400">Data not yet available for this analysis.</p>
                ) : baselineCoverage.data ? (
                  <BaselineCoverageTable entries={baselineCoverage.data} />
                ) : null}
              </section>

              {/* ── When Does Skill Help Panel ── */}
              {/* Placeholder removed — needs real experiment data to be meaningful */}

              {/* ── Ablation Interpretation Panel ── */}
              <section>
                {ablationInterpretation.loading ? (
                  <p className="text-xs text-slate-400">Loading ablation interpretation…</p>
                ) : ablationInterpretation.error ? (
                  <p className="text-xs text-slate-400">Data not yet available for this analysis.</p>
                ) : ablationInterpretation.data ? (
                  <AblationInterpretPanel interpretation={ablationInterpretation.data} />
                ) : null}
              </section>

              {/* ── Regime Breakdown Table ── */}
              <section>
                {regimeBreakdownData.loading ? (
                  <p className="text-xs text-slate-400">Loading regime breakdown…</p>
                ) : regimeBreakdownData.error ? (
                  <p className="text-xs text-slate-400">Data not yet available for this analysis.</p>
                ) : regimeBreakdownData.data ? (
                  <RegimeBreakdownTable regimes={regimeBreakdownData.data} />
                ) : null}
              </section>

              {/* ── Deposit Interaction Panel ── */}
              <section>
                {depositInteraction.loading ? (
                  <p className="text-xs text-slate-400">Loading deposit interaction…</p>
                ) : depositInteraction.error ? (
                  <p className="text-xs text-slate-400">Data not yet available for this analysis.</p>
                ) : depositInteraction.data ? (
                  <DepositInteractionPanel analysis={depositInteraction.data} />
                ) : null}
              </section>

              {/* ── Panel Size Sensitivity Chart ── */}
              <section>
                {panelSizeSensitivity.loading ? (
                  <p className="text-xs text-slate-400">Loading panel size sensitivity…</p>
                ) : panelSizeSensitivity.error ? (
                  <p className="text-xs text-slate-400">Data not yet available for this analysis.</p>
                ) : panelSizeSensitivity.data ? (
                  <PanelSizeChart sweep={panelSizeSensitivity.data} />
                ) : null}
              </section>

              {/* ── Real Data Context Panel ── */}
              <section>
                {realDataContext.loading ? (
                  <p className="text-xs text-slate-400">Loading real-data context…</p>
                ) : realDataContext.error ? (
                  <p className="text-xs text-slate-400">Data not yet available for this analysis.</p>
                ) : realDataContext.data ? (
                  <RealDataContextPanel
                    realData={realDataContext.data.realData}
                    realDataElectricity={realDataContext.data.realDataElectricity}
                    syntheticDeltaCrps={realDataContext.data.syntheticDeltaCrps}
                  />
                ) : null}
              </section>
            </div>
          )}

          </motion.div>
          </AnimatePresence>
          </ChartLinkingProvider>
        </section>

    </PageShell>
    </EquationProvider>
    </FigureProvider>
  );
}