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
import {
  AGENT_PALETTE,
  AXIS_STROKE,
  AXIS_TICK,
  BRUSH_PROPS,
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
import { AnimatePresence, motion } from 'framer-motion';
import type { InfluenceRule, DepositPolicy } from '@/lib/coreMechanism/runRoundComposable';
import Breadcrumb from '@/components/dashboard/Breadcrumb';
import MathBlock from '@/components/dashboard/MathBlock';
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

const EXPERIMENT_DESCRIPTIONS = [
  {
    title: 'Real data — Elia Offshore Wind',
    tab: 'Real data',
    setup: '5 causal forecasting models on 17,544 hourly Belgian wind power observations (2024–2025). Online: each hour the mechanism scores, updates skills, and re-weights.',
    compared: '4 weighting rules: Equal (1/N), Skill-only (w ∝ g(σ)), Stake-only (w ∝ deposit), Skill × stake (full mechanism). Plus Best single (oracle).',
    lookFor: 'Δ CRPS bar chart: negative = better than equal. CRPS-over-time: gap between lines = cumulative accuracy gain. DM test p < 0.001.',
  },
  {
    title: 'Real data — Elia Electricity Prices',
    tab: 'Real data',
    setup: 'Same 5 models on Belgian electricity imbalance prices (15-min, 2024). More volatile with spikes — harder forecasting task.',
    compared: 'Same 4 weighting rules. Tests whether the mechanism generalises beyond wind.',
    lookFor: 'Does Skill × stake still beat Equal on a different domain?',
  },
  {
    title: 'Weight learning — LMS vs Core mechanism',
    tab: 'Real data',
    setup: 'LMS: T=15k, endogenous DGP, true w=[0.8, 0.1, 0.5]. Core: T=500, exogenous DGP, 3 agents with τ=[0.2, 0.6, 1.5], fixed deposits.',
    compared: 'LMS directly minimises (y−w·r)². Core uses CRPS → EWMA → σ → g(σ) → weight. Different objectives.',
    lookFor: 'LMS recovers structural weights (MAE≈0.02). Core gets ranking right but modest separation (~0.32–0.35) due to skill floor λ=0.3.',
  },
  {
    title: 'Cumulative forecast error',
    tab: 'Accuracy',
    setup: '6 synthetic agents, baseline DGP (y~U(0,1)), 200 rounds, seed 42. All agents truthful, full participation.',
    compared: '4 weighting methods on identical data — only the influence rule changes.',
    lookFor: 'Lines diverge after ~50 rounds (EWMA half-life ≈ 7). Skill × stake should stay below Equal. Gap at round 200 = total accuracy gain.',
  },
  {
    title: 'Skill recognition',
    tab: 'Accuracy',
    setup: '3 agents: Good (τ=0.2), Okay (τ=0.6), Bad (τ=1.5). Latent-fixed DGP, 500 rounds, fixed deposits (b=1), no weight cap.',
    compared: 'σ trajectory (left) and weight trajectory (right). Dashed = steady-state targets.',
    lookFor: 'Good agent gets highest σ and weight. Bad agent gets lowest. Separation is modest due to skill floor λ=0.3.',
  },
  {
    title: 'Wealth concentration',
    tab: 'Concentration',
    setup: 'Same 6 agents, 200 rounds. Measures Gini (wealth inequality) and N_eff (effective participants) per method.',
    compared: '4 weighting methods. Equal: Gini≈0, N_eff=6. Skill×stake: higher Gini, lower N_eff.',
    lookFor: 'The accuracy–concentration trade-off. More concentration = better accuracy but less fairness.',
  },
  {
    title: 'Deposit policy comparison',
    tab: 'Deposit policy',
    setup: 'Same 6 agents, 200 rounds, all Skill×stake. Only the deposit rule changes.',
    compared: 'Fixed (b=1), Wealth fraction (b=0.18·W), σ-scaled (b=f·W·σ). Mean CRPS and Gini for each.',
    lookFor: 'Stronger deposit rules improve accuracy but increase concentration. Wealth fraction is the default trade-off.',
  },
];

function ExperimentGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-50 transition-colors">
        <div>
          <span className="text-xs font-semibold text-slate-700">Experiment guide</span>
          <span className="text-[10px] text-slate-400 ml-2">7 experiments explained</span>
        </div>
        <span className={`text-slate-400 text-sm transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-100">
          {EXPERIMENT_DESCRIPTIONS.map((exp, i) => (
            <div key={i} className="rounded-lg border border-slate-100 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-white bg-slate-500 rounded-full w-5 h-5 flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-xs font-semibold text-slate-700">{exp.title}</span>
                <span className="text-[10px] text-slate-400 ml-auto">{exp.tab}</span>
              </div>
              <div className="grid sm:grid-cols-3 gap-2 text-[11px]">
                <div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Setup</div>
                  <p className="text-slate-600 leading-relaxed">{exp.setup}</p>
                </div>
                <div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">What's compared</div>
                  <p className="text-slate-600 leading-relaxed">{exp.compared}</p>
                </div>
                <div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">What to look for</div>
                  <p className="text-slate-600 leading-relaxed">{exp.lookFor}</p>
                </div>
              </div>
            </div>
          ))}
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
          Fixed deposits give the mechanism the most room to work — a 21% CRPS improvement over equal weighting.
          Exponential deposits reduce the advantage to 15%, and bankroll-fraction deposits to just 5%.
          The deposit policy determines how much of the skill signal reaches the aggregate weights.
        </p>
      </div>
      <ResponsiveContainer width="100%" height={320}>
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
              <div className="text-[10px] font-semibold text-slate-700">{policyLabels[p]}</div>
              <div className="text-lg font-bold font-mono text-indigo-600">−{entry.pct_mech.toFixed(0)}%</div>
              <div className="text-[10px] text-slate-500">CRPS improvement vs equal</div>
            </div>
          );
        })}
      </div>
    </div>
  );
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
  const [weightRecovery, setWeightRecovery] = useState<WeightRecoveryRow[]>([]);

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

  // Skill convergence: 3 agents with controlled noise levels
  // Good (τ=0.2), Okay (τ=0.6), Bad (τ=1.5) — the mechanism should rank them correctly
  const CONV_N = 3;
  const CONV_T = 500;
  const CONV_TAU = [0.2, 0.6, 1.5]; // Good, Okay, Bad
  const CONV_LABELS = ['Good (τ=0.2)', 'Okay (τ=0.6)', 'Bad (τ=1.5)'];

  const convPipeline = useMemo(() => {
    // Generate DGP with controlled noise levels
    const dgp = generateLatentFixed(DEMO_SEED, CONV_T, CONV_N, 1, CONV_TAU);
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

        {/* ── Experiment guide (collapsible) ── */}
        <ExperimentGuide />

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
                  Running average CRPS (lower = better) for each weighting method over {realData.config.T.toLocaleString()} hourly rounds.
                  If the Skill × stake line stays below Equal weighting, the online skill layer adds value.
                  The gap between lines grows over time as the mechanism learns — early rounds are noisy because
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
                      <Brush dataKey="t" {...BRUSH_PROPS} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ═══ Deposit sensitivity on real wind data ═══ */}
              {realData && (
                <DepositSensitivityPanel />
              )}

              {/* ═══ Weight Learning: Two Approaches ═══ */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">Weight learning — two approaches</h3>
                  <p className="text-xs text-slate-500">
                    The core question: does the mechanism correctly identify who is skilled? We test two approaches.
                    The LMS learner (left) directly recovers structural weights from an endogenous DGP (w = [0.8, 0.1, 0.5]).
                    The core mechanism (right) uses EWMA skill estimation on an exogenous DGP with 3 agents of known quality:
                    Good (τ=0.2, low noise), Okay (τ=0.6, medium), Bad (τ=1.5, high). All start equal — the mechanism must learn the ranking.
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Left: LMS direct weight recovery */}
                  {weightRecovery.length > 0 && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-emerald-700">LMS direct regression</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">T = 15,000</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Directly minimises (y − w·r)² via gradient descent. Sees the outcome and all reports,
                          adjusts weights to make the linear combination match. Recovers structural weights precisely.
                        </p>
                      </div>
                      <ResponsiveContainer width="100%" height={200}>
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
                          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
                          <Bar dataKey="target" name="True w" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={28} opacity={0.5} />
                          <Bar dataKey="learned" name="LMS learned" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} opacity={0.9} />
                        </BarChart>
                      </ResponsiveContainer>
                      <p className="text-[10px] text-slate-500">
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
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-semibold">T = 500</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-1">
                        3 agents with controlled noise: Good (τ=0.2), Okay (τ=0.6), Bad (τ=1.5).
                        Fixed deposits (b=1) isolate the skill signal.
                      </p>
                      <MathBlock
                        latex="\\ell_i \\;\\xrightarrow{\\text{CRPS}}\\; L_i = (1{-}\\rho)L + \\rho\\ell \\;\\xrightarrow{\\text{EWMA}}\\; \\sigma_i = \\sigma_{\\min} + (1{-}\\sigma_{\\min})e^{-\\gamma L} \\;\\xrightarrow{\\text{gate}}\\; g(\\sigma) = \\lambda + (1{-}\\lambda)\\sigma^\\eta \\;\\xrightarrow{\\text{wager}}\\; w_i = \\frac{b_i \\cdot g(\\sigma_i)}{\\sum_j b_j \\cdot g(\\sigma_j)}"
                        caption="The mechanism chain: CRPS loss → EWMA smoothing → skill estimate → skill gate → normalised weight"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {/* σ trajectory */}
                      <div>
                        <div className="text-[10px] font-semibold text-slate-600 mb-1">Skill estimate σ</div>
                        <ResponsiveContainer width="100%" height={180}>
                          <LineChart data={skillConvergence} margin={{ top: 4, right: 8, bottom: 4, left: 36 }}>
                            <CartesianGrid {...GRID_PROPS} />
                            <XAxis dataKey="round" tick={{ ...AXIS_TICK, fontSize: 9 }} stroke={AXIS_STROKE} />
                            <YAxis tick={{ ...AXIS_TICK, fontSize: 9 }} stroke={AXIS_STROKE} domain={[0, 1]}
                              label={{ value: 'σ', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10, fill: '#64748b' }} />
                            <Tooltip content={<SmartTooltip />} />
                            {Array.from({ length: CONV_N }, (_, i) => (
                              <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={CONV_LABELS[i]}
                                stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={2} dot={false} />
                            ))}
                            {targetSigmas.map((ts, i) => (
                              <ReferenceLine key={`ts-${i}`} y={ts}
                                stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                                strokeDasharray="6 3" strokeOpacity={0.4} />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                        <p className="text-[9px] text-slate-400">Good → high σ, Bad → low σ. Dashed = steady state.</p>
                      </div>
                      {/* Weight trajectory */}
                      <div>
                        <div className="text-[10px] font-semibold text-slate-600 mb-1">Normalised weight</div>
                        <ResponsiveContainer width="100%" height={180}>
                          <LineChart data={weightConvergence} margin={{ top: 4, right: 8, bottom: 4, left: 36 }}>
                            <CartesianGrid {...GRID_PROPS} />
                            <XAxis dataKey="round" tick={{ ...AXIS_TICK, fontSize: 9 }} stroke={AXIS_STROKE} />
                            <YAxis tick={{ ...AXIS_TICK, fontSize: 9 }} stroke={AXIS_STROKE} domain={[0.2, 0.5]}
                              label={{ value: 'w', angle: -90, position: 'insideLeft', offset: 0, fontSize: 10, fill: '#64748b' }} />
                            <Tooltip content={<SmartTooltip />} />
                            {Array.from({ length: CONV_N }, (_, i) => (
                              <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={CONV_LABELS[i]}
                                stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={2} dot={false} />
                            ))}
                            {targetWeights.map((tw, i) => (
                              <ReferenceLine key={`tw-${i}`} y={tw}
                                stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                                strokeDasharray="6 3" strokeOpacity={0.4} />
                            ))}
                            <ReferenceLine y={1 / CONV_N} stroke="#94a3b8" strokeDasharray="2 2" strokeOpacity={0.3} />
                          </LineChart>
                        </ResponsiveContainer>
                        <p className="text-[9px] text-slate-400">Weights start at 1/3, diverge via g(σ). Dashed = steady state.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis callout */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-2">
                  <div className="font-semibold text-slate-700">Why the difference matters</div>
                  <p>
                    The LMS learner directly regresses y on [r₁, r₂, r₃] — it solves a linear system and recovers
                    the structural weights (MAE ≈ 0.02). The core mechanism does something different: it measures
                    each agent's individual CRPS, maps that to a skill estimate σ via EWMA, then derives weights
                    from σ × deposit. It never optimises the aggregation weights directly.
                  </p>
                  <p>
                    This is by design. The mechanism's goal is not to recover structural weights — it's to
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
              {/* Experiment setup */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 mb-1">Experiment setup</div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  {DEMO_N} synthetic agents, baseline DGP (y ~ U(0,1), reports = y + agent-specific noise), {DEMO_T} rounds, seed {DEMO_SEED}.
                  Four weighting methods run on identical data — only the influence rule changes.
                  Equal (w = 1/N), Stake-only (w ∝ deposit), Skill-only (w ∝ g(σ)), Skill × stake (w ∝ deposit · g(σ)).
                  All agents participate every round and report truthfully. This isolates the effect of the weighting rule.
                </p>
              </div>

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

              {/* Skill convergence (demo) — mechanism skill-based weights */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">Skill recognition</h3>
                <p className="text-xs text-slate-500 mb-3">
                  3 forecasters with controlled noise: Good (τ=0.2), Okay (τ=0.6), Bad (τ=1.5).
                  The EWMA skill gate learns who is good and assigns σ accordingly. Fixed deposits isolate the skill signal.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={skillConvergence} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}>
                      <CartesianGrid {...GRID_PROPS} />
                      <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
                        label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]}
                        label={{ value: 'Skill σ', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                      <Tooltip content={<SmartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
                      {Array.from({ length: CONV_N }, (_, i) => (
                        <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={CONV_LABELS[i]}
                          stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={2} dot={false} />
                      ))}
                      {targetSigmas.map((ts, i) => (
                        <ReferenceLine key={`ts-${i}`} y={ts}
                          stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                          strokeDasharray="6 3" strokeOpacity={0.4} />
                      ))}
                      <Brush dataKey="round" {...BRUSH_PROPS} />
                    </LineChart>
                  </ResponsiveContainer>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={weightConvergence} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}>
                      <CartesianGrid {...GRID_PROPS} />
                      <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
                        label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0.2, 0.5]}
                        label={{ value: 'Weight', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                      <Tooltip content={<SmartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
                      {Array.from({ length: CONV_N }, (_, i) => (
                        <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={CONV_LABELS[i]}
                          stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]} strokeWidth={2} dot={false} />
                      ))}
                      {targetWeights.map((tw, i) => (
                        <ReferenceLine key={`tw-${i}`} y={tw}
                          stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                          strokeDasharray="6 3" strokeOpacity={0.4} />
                      ))}
                      <ReferenceLine y={1 / CONV_N} stroke="#94a3b8" strokeDasharray="2 2" strokeOpacity={0.3} />
                      <Brush dataKey="round" {...BRUSH_PROPS} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Left: σ separates agents by forecast quality (Good → high σ, Bad → low σ).
                  Right: weights diverge from 1/3 via the skill gate g(σ) = λ + (1−λ)σ. Dashed = steady state.
                </p>

              </div>
            </div>
          )}

          {!useExp && !loading && activeTab === 'Concentration' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              {/* Experiment setup */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 mb-1">Experiment setup</div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Same {DEMO_N} agents and {DEMO_T} rounds as the Accuracy tab. For each weighting method, we measure
                  final wealth Gini (how unequally wealth is distributed) and mean N_eff (how many agents have meaningful
                  influence). The question: does skill-weighting concentrate wealth too much?
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Wealth concentration by method</h3>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3 mt-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Metrics explained</div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <MathBlock latex="\\text{Gini} = \\frac{\\sum_{i<j} |w_i - w_j|}{n \\sum w_i}" label="Gini coefficient" caption="0 = equal, 1 = monopoly" />
                    </div>
                    <div>
                      <MathBlock latex="N_{\\text{eff}} = \\frac{1}{\\text{HHI}} = \\frac{1}{\\sum_i \\hat{w}_i^2}" label="Effective participants" caption="How many agents have real influence" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Equal weighting: Gini ≈ 0, N_eff = N — fair but ignores skill differences.
                    Skill × stake: higher Gini, lower N_eff — concentrates influence in skilled agents, improving accuracy.
                    The mechanism targets N_eff ≈ 4–5 out of 6: enough concentration to reward skill,
                    not so much that one agent controls the aggregate. This is Lambert's (2008) design property —
                    the settlement rule ensures skilled agents profit while the aggregate stays diversified.
                  </p>
                </div>
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
              {/* Experiment setup */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 mb-1">Experiment setup</div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  Same {DEMO_N} agents and {DEMO_T} rounds. All use Skill × stake influence rule — only the deposit policy changes.
                  Three deposit rules tested: Fixed (b=1), Wealth fraction (b=0.18·W), σ-scaled (b=f·W·(0.25+0.85σ)).
                  The question: how does the deposit rule affect the accuracy–concentration trade-off?
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
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Deposit rules in detail</div>
                <MathBlock latex="m_i = b_i \\cdot g(\\sigma_i), \\quad g(\\sigma) = \\lambda + (1{-}\\lambda)\\sigma^\\eta" label="Effective wager" caption="The deposit b_i determines how much of the skill signal reaches the aggregate" />

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="text-[10px] font-semibold text-slate-700 mb-1">Fixed (b = 1)</div>
                    <MathBlock latex="b_i = 1 \\;\\; \\forall i" />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Isolates skill signal. Weight differences come only from σ. Fairest — no wealth feedback.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="text-[10px] font-semibold text-slate-700 mb-1">Wealth fraction</div>
                    <MathBlock latex="b_i = f \\cdot W_i, \\quad f \\approx 0.18" />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Feedback loop: winners deposit more → more weight → more profit. Amplifies skill differences.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="text-[10px] font-semibold text-slate-700 mb-1">σ-scaled</div>
                    <MathBlock latex="b_i = f \\cdot W_i \\cdot (0.25 + 0.85\\,\\sigma_i)" />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Strongest amplification: confident agents stake more. Most accurate but highest concentration.
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  The chart shows mean CRPS (accuracy, lower = better) and Gini (concentration, lower = fairer)
                  for each rule. The thesis uses wealth_fraction as the default — it balances accuracy improvement
                  against concentration risk. Fixed deposits are used for the skill recognition experiment above
                  to isolate the pure skill signal without wealth confounds.
                </p>
              </div>
            </div>
          )}

          </motion.div>
          </AnimatePresence>
        </section>

      </div>
    </div>
  );
}
