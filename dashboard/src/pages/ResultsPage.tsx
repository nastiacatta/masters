import { useEffect, useMemo, useState } from 'react';
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
import InfoToggle from '@/components/dashboard/InfoToggle';
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
import { AnimatePresence, motion } from 'framer-motion';
import { ChartLinkingProvider } from '@/contexts/ChartLinkingContext';
import type { InfluenceRule, DepositPolicy } from '@/lib/coreMechanism/runRoundComposable';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import MathBlock from '@/components/dashboard/MathBlock';
import Skeleton from '@/components/dashboard/Skeleton';
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
const METHOD_CHART_COLORS: Record<string, string> = {
  uniform: '#94a3b8',
  skill: '#8b5cf6',
  mechanism: '#6366f1',
  best_single: '#f59e0b',
  inverse_variance: '#0ea5e9',
  trimmed_mean: '#14b8a6',
  median: '#10b981',
  oracle: '#64748b',
};

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
  { title: 'Elia Wind', tab: 'Real data', color: '#10b981', desc: '17,544 hourly points, 7 models', key: '44% CRPS improvement (tuned)' },
  { title: 'Elia Electricity', tab: 'Real data', color: '#0ea5e9', desc: '15-min prices, volatile spikes', key: 'Generalisation test' },
  { title: 'Weight Learning', tab: 'Real data', color: '#8b5cf6', desc: 'LMS vs EWMA skill gate', key: 'Ranking correct, modest separation' },
  { title: 'Method Race', tab: 'Accuracy', color: '#6366f1', desc: '6 agents, 200 rounds, 4 methods', key: 'Skill × stake wins after ~50 rounds' },
  { title: 'Skill Recognition', tab: 'Accuracy', color: '#f59e0b', desc: '3 agents with known quality', key: 'Good→high σ, Bad→low σ' },
  { title: 'Concentration', tab: 'Concentration', color: '#ef4444', desc: 'Gini and N_eff by method', key: 'Accuracy–fairness trade-off' },
  { title: 'Deposit Policy', tab: 'Deposit policy', color: '#64748b', desc: 'Fixed vs wealth-fraction vs σ-scaled', key: 'Deposit quality is the key lever' },
] as const;

function ExperimentGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Experiment guide</span>
          <span className="text-[11px] text-slate-400">{EXPERIMENT_CARDS.length} experiments</span>
        </div>
        <span className={`text-slate-400 text-sm transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-slate-100">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-3">
            {EXPERIMENT_CARDS.map((exp) => (
              <div key={exp.title} className="rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: exp.color }} />
                  <span className="text-xs font-semibold text-slate-800 truncate">{exp.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{exp.desc}</p>
                <div className="mt-1.5 text-[11px] font-medium" style={{ color: exp.color }}>{exp.key}</div>
                <div className="mt-1 text-[10px] text-slate-400">{exp.tab}</div>
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
          Fixed deposits give the mechanism the most room to work (~44% CRPS improvement over equal weighting with tuned parameters).
          Exponential deposits reduce the advantage to ~15%, and bankroll-fraction deposits to ~5%.
          The deposit policy determines how much of the skill signal reaches the aggregate weights.
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
    <div className="flex-1 overflow-y-auto">
      <FigureProvider>
      <EquationProvider>
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <Breadcrumb activeTab={activeTab} />

        {/* ── Header ── */}
        <header>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Results</h1>
          <p className="text-sm text-slate-500 mt-1">
            {useExp
              ? `${expSeedCount} scenarios, paired comparison across all methods.`
              : `Seed ${DEMO_SEED} · ${DEMO_N} agents · ${DEMO_T} rounds`}
          </p>
        </header>

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
          <div className="flex gap-1 border-b border-slate-200 mb-6">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                {tab}
              </button>
            ))}
          </div>

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
                  {realData.config.n_forecasters} forecasting models ({realData.config.forecasters.join(', ')}) on Belgian offshore wind power (2024–2025).
                  Each model is strictly causal and retrained periodically. The mechanism learns which model is best and adjusts weights over time.
                  Diebold-Mariano test confirms statistical significance (p &lt; 0.001).
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
                    DM test: p {realData.dm_test.significant_at_001 ? '< 0.001 ***' :
                      realData.dm_test.significant_at_005 ? '< 0.05 *' : `= ${realData.dm_test.p_value.toFixed(4)}`}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Mechanism vs uniform (Diebold-Mariano, HAC-corrected)
                  </span>
                </div>
              )}

              {/* Mechanism vs alternatives interpretive callout */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-2">
                <h4 className="text-xs font-semibold text-indigo-900">Why simpler methods beat the mechanism on pure CRPS</h4>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Median and inverse-variance weighting achieve better CRPS because they directly optimise for forecast quality.
                  The mechanism trades some aggregation quality for properties these methods lack:
                  <strong> incentive-compatible settlement</strong> (agents are rewarded for accuracy),
                  <strong> budget balance</strong> (no external funding),
                  <strong> sybil-proofness</strong> (splitting identity provides zero advantage), and
                  <strong> online adaptivity</strong> (learns skill without prior knowledge).
                  The mechanism's contribution is the complete economic structure, not just the aggregation.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-slate-800">CRPS over time</h3>
                  <ZoomBadge isZoomed={cumErrorZoom.state.isZoomed} onReset={cumErrorZoom.reset} />
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Running average CRPS (lower = better) for each weighting method over {realData.config.T.toLocaleString()} hourly rounds.
                  If the Skill × stake line stays below Equal weighting, the online skill layer adds value.
                  The gap between lines grows over time as the mechanism learns. Early rounds are noisy because
                  the EWMA hasn't converged yet (half-life ≈ 7 rounds with ρ = 0.1). After ~50 rounds the ranking stabilises.
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

              {/* ═══ Skill Recognition ═══ */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      How the mechanism learns forecaster quality
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      The EWMA skill gate observes each model's CRPS each round and updates a skill estimate σ.
                      Higher σ = better forecaster = more weight in the aggregate.
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
                        Naive (last value) ranks highest because wind power is highly autocorrelated.
                        ARIMA ranks lowest due to poor quantile calibration.
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
                        Lines separate within the first ~500 hours as the EWMA converges.
                        The top line (Naive) stays consistently highest. Hover for values.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      3 forecasters with controlled noise: Good (τ=0.2), Okay (τ=0.6), Bad (τ=1.5).
                      The EWMA skill gate learns who is good and assigns σ accordingly. Fixed deposits isolate the skill signal.
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
                    The core question: does the mechanism correctly identify who is skilled? We test two approaches.
                    The LMS learner (left) directly recovers structural weights from an endogenous DGP (w = [0.8, 0.1, 0.5]).
                    The core mechanism (right) uses EWMA skill estimation on an exogenous DGP with 3 agents of known quality:
                    Good (τ=0.2, low noise), Okay (τ=0.6, medium), Bad (τ=1.5, high). All start equal and the mechanism must learn the ranking.
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
                          Directly minimises (y − w·r)² via gradient descent. Sees the outcome and all reports,
                          adjusts weights to make the linear combination match. Recovers structural weights precisely.
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
                        MAE = {fmt(weightRecovery.reduce((s, r) => s + r.absError, 0) / weightRecovery.length, 4)}.
                        The LMS recovers the true weights almost exactly because it directly optimises for them.
                      </p>
                    </div>
                  )}

                  {/* Right: Core mechanism skill-based weights */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-indigo-700">Core mechanism (EWMA skill gate)</span>
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
                    The LMS learner directly regresses y on [r₁, r₂, r₃]. It solves a linear system and recovers
                    the structural weights (MAE ≈ 0.02). The core mechanism does something different: it measures
                    each agent's individual CRPS, maps that to a skill estimate σ via EWMA, then derives weights
                    from σ × deposit. It never optimises the aggregation weights directly.
                  </p>
                  <p>
                    This is by design. The mechanism's goal is not to recover structural weights but to
                    <span className="font-semibold"> identify and upweight skilled forecasters</span> in a setting
                    where agents have deposits, strategic incentives, and intermittent participation. The EWMA
                    skill gate provides robustness to manipulation (σ drops when agents misreport) at the cost
                    of precise weight recovery.
                  </p>
                  <p>
                    In the exogenous DGP (latent_fixed), where "skill" = low noise, the mechanism correctly
                    gives more weight to low-noise agents. In the endogenous DGP (aggregation), where "skill"
                    is structural contribution, the mechanism approximates but doesn't precisely recover the
                    true weights because individual CRPS doesn't perfectly reflect structural importance.
                  </p>
                </div>
              </div>

              {/* ═══ Per-forecaster CRPS over time ═══ */}
              {realData?.per_agent_crps && realData.per_agent_crps.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800">Per-forecaster CRPS over time</h3>
                  <p className="text-xs text-slate-500">
                    Individual CRPS for each forecaster at each round. Lower is better.
                    Shows which forecaster is best at different times.
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
                    Mechanism vs uniform CRPS improvement in sliding 1000-hour windows.
                    Negative = mechanism is better. Shows stability across time.
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
                    PIT coverage: fraction of outcomes below each quantile level.
                    Perfect calibration = empirical matches nominal.
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
                  <h3 className="text-sm font-semibold text-teal-900">Elia Imbalance Prices: {realDataElec.config.T.toLocaleString()} points</h3>
                </div>
                <p className="text-xs text-teal-700 leading-relaxed">
                  Same 7 models on Belgian electricity imbalance prices (15-min, 2024). Prices are volatile with spikes, making this a harder forecasting task.
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
              <p className="text-sm text-slate-500">Real-data comparison not available. Run the forecaster models on your data first.</p>
            </div>
          )}

          {/* ═══ EXPERIMENT-BACKED TABS ═══ */}

          {useExp && !loading && activeTab === 'Accuracy' && (
            expAccuracyDisplay.length > 0 && calibrationData.length > 0 && ablationData.length > 0 ? (
              <div className="space-y-6">
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
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-slate-800">Calibration</h3>
                <InfoToggle term="Reliability diagram" definition="Compares nominal quantile τ against empirical coverage p̂(τ)." interpretation="Perfect calibration lies on the diagonal." axes={{ x: 'nominal τ', y: 'empirical p̂' }} />
              </div>
              {calibrationData.length === 0 ? (
                <p className="text-[11px] text-slate-500">Calibration data not available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={360}>
                  <LineChart data={calibrationData} margin={CHART_MARGIN_LABELED}>
                    <CartesianGrid {...GRID_PROPS} />
                    <XAxis dataKey="tau" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]} />
                    <YAxis dataKey="pHat" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]} />
                    <Tooltip content={<SmartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
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
                  {DEMO_N} synthetic agents, baseline DGP (y ~ U(0,1), reports = y + agent-specific noise), {DEMO_T} rounds, seed {DEMO_SEED}.
                  Four weighting methods run on identical data; only the influence rule changes.
                  Equal (w = 1/N), Stake-only (w ∝ deposit), Skill-only (w ∝ g(σ)), Skill × stake (w ∝ deposit · g(σ)).
                  All agents participate every round and report truthfully. This isolates the effect of the weighting rule.
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
                      3 forecasters with controlled noise: Good (τ=0.2), Okay (τ=0.6), Bad (τ=1.5).
                      The EWMA skill gate learns who is good and assigns σ accordingly. Fixed deposits isolate the skill signal.
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
                    The mechanism correctly identifies forecaster quality: F1 (Good, low noise) gets the highest σ,
                    F3 (Bad, high noise) gets the lowest. Weights diverge from equal (1/3) via the skill gate
                    g(σ) = λ + (1−λ)σ. Dashed lines show steady-state targets.
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
                  Same {DEMO_N} agents and {DEMO_T} rounds as the Accuracy tab. For each weighting method, we measure
                  final wealth Gini (how unequally wealth is distributed) and mean N_eff (how many agents have meaningful
                  influence). The question: does skill-weighting concentrate wealth too much?
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Influence distribution by method</h3>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3 mt-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Metrics explained</div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <MathBlock latex="\\text{Gini} = \\frac{\\sum_{i<j} |w_i - w_j|}{n \\sum w_i}" label="Gini coefficient" caption="0 = equal, 1 = monopoly" />
                    </div>
                    <div>
                      <MathBlock latex="N_{\\text{eff}} = \\frac{1}{\\text{HHI}} = \\frac{1}{\\sum_i \\hat{w}_i^2}" label="Effective participants" caption="How many agents have real influence" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Equal weighting: Gini ≈ 0, N_eff = N, fair but ignores skill differences.
                    Skill × stake: higher Gini, lower N_eff, concentrates influence in skilled agents, improving accuracy.
                    The mechanism targets N_eff ≈ 4–5 out of 6: enough concentration to reward skill,
                    not so much that one agent controls the aggregate. This is Lambert's (2008) design property:
                    the settlement rule ensures skilled agents profit while the aggregate stays diversified.
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
                  Same {DEMO_N} agents and {DEMO_T} rounds. All use Skill × stake influence rule; only the deposit policy changes.
                  Three deposit rules tested: Fixed (b=1), Wealth fraction (b=0.18·W), σ-scaled (b=f·W·(0.25+0.85σ)).
                  The question: how does the deposit rule affect the accuracy–concentration trade-off?
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
                      Isolates skill signal. Weight differences come only from σ. Fairest: no wealth feedback.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="text-[11px] font-semibold text-slate-700 mb-1">Wealth fraction</div>
                    <MathBlock latex="b_i = f \\cdot W_i, \\quad f \\approx 0.18" />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Feedback loop: winners deposit more → more weight → more profit. Amplifies skill differences.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="text-[11px] font-semibold text-slate-700 mb-1">σ-scaled</div>
                    <MathBlock latex="b_i = f \\cdot W_i \\cdot (0.25 + 0.85\\,\\sigma_i)" />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Strongest amplification: confident agents stake more. Most accurate but highest concentration.
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  The chart shows mean CRPS (accuracy, lower = better) and Gini (concentration, lower = fairer)
                  for each rule. The project uses wealth_fraction as the default. It balances accuracy improvement
                  against concentration risk. Fixed deposits are used for the skill recognition experiment above
                  to isolate the pure skill signal without wealth confounds.
                </p>
              </div>
            </div>
          )}

          {/* ═══ SCIENTIFIC ANALYSIS TAB ═══ */}

          {activeTab === 'Scientific Analysis' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5">
                <h3 className="text-sm font-semibold text-indigo-900 mb-1">Scientific Analysis</h3>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Automated validation of project claims, cross-experiment consistency, sensitivity analysis,
                  failure mode documentation, and analysis gap tracking. This section provides the interpretive
                  layer that ensures results are presented with scientific rigour.
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

      </div>
      </EquationProvider>
      </FigureProvider>
    </div>
  );
}