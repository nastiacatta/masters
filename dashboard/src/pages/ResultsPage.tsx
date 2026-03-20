import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Cell,
  ErrorBar,
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
import MathBlock from '@/components/dashboard/MathBlock';
import {
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
import type { InfluenceRule, DepositPolicy } from '@/lib/coreMechanism/runRoundComposable';

const DEMO_SEEDS = Array.from({ length: 100 }, (_, i) => 42 + i);
const DEMO_N = 6;
const DEMO_T = 200;
const EPS = 1e-4;

type Verdict = 'good' | 'neutral' | 'bad';
const VERDICT_STYLES: Record<Verdict, { ring: string; bg: string; text: string }> = {
  good: { ring: 'ring-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  neutral: { ring: 'ring-amber-300', bg: 'bg-amber-50', text: 'text-amber-700' },
  bad: { ring: 'ring-red-300', bg: 'bg-red-50', text: 'text-red-700' },
};

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

function AnswerCard({
  title, metric, metricLabel, verdict, interpretation, caveat,
}: {
  title: string; metric: string; metricLabel: string; verdict: Verdict; interpretation: string; caveat: string;
}) {
  const v = VERDICT_STYLES[verdict];
  return (
    <div className={`rounded-xl ring-1 ${v.ring} ${v.bg} p-4 flex flex-col gap-2`}>
      <div className="text-xs font-bold text-slate-800">{title}</div>
      <div className="flex items-baseline gap-2">
        <span className={`text-lg font-bold font-mono ${v.text}`}>{metric}</span>
        <span className="text-[10px] text-slate-500">{metricLabel}</span>
      </div>
      <p className="text-[11px] text-slate-600 leading-relaxed">{interpretation}</p>
      <p className="text-[10px] text-slate-400 italic leading-snug">{caveat}</p>
    </div>
  );
}

function ZoomBadge({ isZoomed, onReset }: { isZoomed: boolean; onReset: () => void }) {
  if (!isZoomed) return null;
  return (
    <button onClick={onReset} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-medium hover:bg-indigo-200 transition-colors">
      <span>&#x27F2;</span> Reset zoom
    </button>
  );
}

const EXP_TABS = ['Accuracy', 'Concentration', 'Calibration', 'Ablation'] as const;
const DEMO_TABS = ['Accuracy', 'Concentration', 'Deposit policy'] as const;

const METHOD_LABEL: Record<string, string> = {
  uniform: 'Equal',
  deposit: 'Stake-only (exogenous deposits)',
  skill: 'Skill-only',
  mechanism: 'Skill \u00d7 stake (exogenous deposits + skill gate)',
  best_single: 'Best single',
};
const METHOD_COLOR: Record<string, string> = {
  uniform: '#94a3b8', deposit: '#0d9488', skill: '#8b5cf6', mechanism: '#6366f1', best_single: '#f59e0b',
};

function meanFinite(values: Array<number | undefined | null>): number | null {
  const xs = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdError(values: number[]): number | null {
  if (values.length < 2) return null;
  const m = mean(values);
  if (m == null) return null;
  const variance = values.reduce((acc, x) => acc + (x - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance / values.length);
}

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState<string>('Accuracy');
  const [howToReadOpen, setHowToReadOpen] = useState(false);

  // --- adapter-backed data ---
  const [masterRows, setMasterRows] = useState<MasterComparisonRow[]>([]);
  const [ablationRows, setAblationRows] = useState<BankrollAblationRow[]>([]);
  const [calibration, setCalibration] = useState<CalibrationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasExpData, setHasExpData] = useState(false);

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
  const expPreset = expRows[0]?.preset ?? '';

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
      deltaCrps: meanFinite(rs.map((x) => x.delta_crps_vs_equal)),
      meanHHI: meanFinite(rs.map((x) => x.mean_HHI)),
      meanNEff: meanFinite(rs.map((x) => x.mean_N_eff)),
      finalGini: meanFinite(rs.map((x) => x.final_gini)),
    }));
  }, [expRows]);

  const expAccuracyStats = useMemo(() => {
    const byMethod = new Map<string, number[]>();
    const seedMethodCrps = new Map<number, Map<string, number>>();

    for (const r of expRows) {
      if (Number.isFinite(r.delta_crps_vs_equal)) {
        const list = byMethod.get(r.method) ?? [];
        list.push(r.delta_crps_vs_equal);
        byMethod.set(r.method, list);
      }
      if (Number.isFinite(r.mean_crps)) {
        const methodMap = seedMethodCrps.get(r.seed) ?? new Map<string, number>();
        methodMap.set(r.method, r.mean_crps);
        seedMethodCrps.set(r.seed, methodMap);
      }
    }

    const firstPlaceCounts = new Map<string, number>();
    let firstPlaceSeeds = 0;
    seedMethodCrps.forEach((methods) => {
      const rows = Array.from(methods.entries()).filter(([, crps]) => Number.isFinite(crps));
      if (rows.length === 0) return;
      rows.sort((a, b) => a[1] - b[1]);
      const bestMethod = rows[0][0];
      firstPlaceCounts.set(bestMethod, (firstPlaceCounts.get(bestMethod) ?? 0) + 1);
      firstPlaceSeeds += 1;
    });

    const items = Array.from(byMethod.entries()).map(([method, deltas]) => {
      const deltaCrps = meanFinite(deltas);
      const se = stdError(deltas);
      return {
        method,
        label: METHOD_LABEL[method] ?? method,
        color: METHOD_COLOR[method] ?? '#64748b',
        deltaCrps,
        se,
        ci95: se != null ? 1.96 * se : null,
        firstPlaceShare: firstPlaceSeeds > 0 ? (firstPlaceCounts.get(method) ?? 0) / firstPlaceSeeds : null,
      };
    });

    return {
      items,
      nSeeds: seedMethodCrps.size,
    };
  }, [expRows]);

  const expPairwise = useMemo(() => {
    const bySeed = new Map<number, Record<string, number>>();
    for (const r of expRows) {
      const row = bySeed.get(r.seed) ?? {};
      row[r.method] = r.mean_crps;
      bySeed.set(r.seed, row);
    }

    const paired = (a: string, b: string) => {
      const deltas: number[] = [];
      for (const row of bySeed.values()) {
        const av = row[a];
        const bv = row[b];
        if (typeof av === 'number' && typeof bv === 'number') deltas.push(av - bv);
      }
      return {
        mean: mean(deltas),
        se: stdError(deltas),
        wins: deltas.filter((d) => d < -EPS).length,
        losses: deltas.filter((d) => d > EPS).length,
        ties: deltas.filter((d) => Math.abs(d) <= EPS).length,
        n: deltas.length,
      };
    };

    return {
      mechVsEqual: paired('mechanism', 'uniform'),
      mechVsSkill: paired('mechanism', 'skill'),
      mechVsDeposit: paired('mechanism', 'deposit'),
    };
  }, [expRows]);

  const expMechanism = expAccuracyStats.items.find((m) => m.method === 'mechanism') ?? null;
  const expMechanismConcentration = methodAgg.find((m) => m.method === 'mechanism') ?? null;

  const expAccuracyBar = useMemo(() =>
    [...expAccuracyStats.items].filter((m) => m.deltaCrps != null)
      .sort((a, b) => (a.deltaCrps ?? 0) - (b.deltaCrps ?? 0))
      .map((m) => ({
        name: m.label,
        method: m.method,
        deltaCrps: m.deltaCrps as number,
        color: m.color,
        ci95: m.ci95 ?? 0,
        firstPlaceShare: m.firstPlaceShare ?? 0,
      })),
    [expAccuracyStats]);

  const expGiniBar = useMemo(() =>
    [...methodAgg].filter((m) => m.finalGini != null)
      .sort((a, b) => (a.finalGini ?? 0) - (b.finalGini ?? 0))
      .map((m) => ({ name: m.label, method: m.method, finalGini: m.finalGini as number, color: m.color })),
    [methodAgg]);

  const expInfluenceBar = useMemo(() =>
    [...methodAgg].filter((m) => m.meanHHI != null || m.meanNEff != null)
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((m) => ({ name: m.label, method: m.method, meanHHI: m.meanHHI ?? null, meanNEff: m.meanNEff ?? null })),
    [methodAgg]);

  const calibrationData = useMemo(() =>
    calibration.filter((p) => Number.isFinite(p.tau) && Number.isFinite(p.pHat))
      .map((p) => ({ tau: p.tau, pHat: p.pHat, ideal: p.tau, nValid: p.nValid }))
      .sort((a, b) => a.tau - b.tau),
    [calibration]);

  const ablationData = useMemo(() =>
    [...ablationRows].sort((a, b) => a.delta_crps_vs_full - b.delta_crps_vs_full),
    [ablationRows]);

  // --- demo fallback (in-browser pipeline) ---
  const [enabledMethods, setEnabledMethods] = useState<Record<string, boolean>>({
    equal: true, skill_only: true, blended: true, stake_only: true,
  });
  const cumErrorZoom = useChartZoom();

  const demoMethodDefs: { key: string; label: string; color: string; influenceRule: InfluenceRule }[] = [
    { key: 'equal', label: METHOD.equal.label, color: METHOD.equal.color, influenceRule: 'uniform' },
    { key: 'skill_only', label: METHOD.skill_only.label, color: METHOD.skill_only.color, influenceRule: 'skill_only' },
    { key: 'blended', label: METHOD.blended.label, color: METHOD.blended.color, influenceRule: 'skill_stake' },
    { key: 'stake_only', label: METHOD.stake_only.label, color: METHOD.stake_only.color, influenceRule: 'deposit_only' },
  ];

  const demoRuns = useMemo(() =>
    DEMO_SEEDS.flatMap((seed) =>
      demoMethodDefs.map((m) => {
        const pipeline = runPipeline({
          dgpId: 'baseline',
          behaviourPreset: 'baseline',
          rounds: DEMO_T,
          seed,
          n: DEMO_N,
          builder: { influenceRule: m.influenceRule },
        });
        return {
          seed,
          ...m,
          meanError: pipeline.summary.meanError,
          finalGini: pipeline.summary.finalGini,
          meanNEff: pipeline.summary.meanNEff,
          pipeline,
        };
      })),
    []);

  const demoMethodStats = useMemo(() =>
    demoMethodDefs
      .map((m) => {
        const rows = demoRuns.filter((r) => r.key === m.key);
        const meanErrors = rows.map((r) => r.meanError);
        const ginis = rows.map((r) => r.finalGini);
        const nEffs = rows.map((r) => r.meanNEff);
        return {
          key: m.key,
          label: m.label,
          color: m.color,
          nSeeds: rows.length,
          meanError: mean(meanErrors),
          meanErrorSE: stdError(meanErrors),
          finalGini: mean(ginis),
          finalGiniSE: stdError(ginis),
          meanNEff: mean(nEffs),
          meanNEffSE: stdError(nEffs),
        };
      })
      .sort((a, b) => (a.meanError ?? Infinity) - (b.meanError ?? Infinity)),
    [demoRuns]);

  const demoBySeed = useMemo(() => {
    const bySeed = new Map<number, Record<string, number>>();
    for (const r of demoRuns) {
      const row = bySeed.get(r.seed) ?? {};
      row[r.key] = r.meanError;
      bySeed.set(r.seed, row);
    }
    return bySeed;
  }, [demoRuns]);

  const pairedDelta = (aKey: string, bKey: string) => {
    const deltas: number[] = [];
    for (const row of demoBySeed.values()) {
      const a = row[aKey];
      const b = row[bKey];
      if (typeof a === 'number' && typeof b === 'number') deltas.push(a - b);
    }
    return {
      mean: mean(deltas),
      se: stdError(deltas),
      wins: deltas.filter((d) => d < -EPS).length,
      losses: deltas.filter((d) => d > EPS).length,
      ties: deltas.filter((d) => Math.abs(d) <= EPS).length,
      n: deltas.length,
    };
  };

  const demoBlendVsEqual = useMemo(() => pairedDelta('blended', 'equal'), [demoBySeed]);
  const demoBlendVsSkill = useMemo(() => pairedDelta('blended', 'skill_only'), [demoBySeed]);
  const demoBlendVsStake = useMemo(() => pairedDelta('blended', 'stake_only'), [demoBySeed]);
  const demoBestAvg = demoMethodStats[0] ?? null;
  const demoBlendedStats = demoMethodStats.find((x) => x.key === 'blended') ?? null;

  const demoWinCounts = useMemo(() => {
    const counts: Record<string, number> = {
      equal: 0,
      skill_only: 0,
      blended: 0,
      stake_only: 0,
    };
    for (const row of demoBySeed.values()) {
      const entries = Object.entries(row)
        .filter(([, value]) => typeof value === 'number')
        .sort((a, b) => a[1] - b[1]);
      if (!entries.length) continue;
      const bestValue = entries[0][1];
      const winners = entries.filter(([, value]) => Math.abs(value - bestValue) <= EPS);
      for (const [key] of winners) counts[key] += 1 / winners.length;
    }
    return counts;
  }, [demoBySeed]);

  const demoCumError = useMemo(() => {
    const raw = Array.from({ length: DEMO_T }, (_, i) => {
      const point: Record<string, number> = { round: i + 1 };
      for (const m of demoMethodDefs) {
        const values = DEMO_SEEDS.map((seed) => {
          const run = demoRuns.find((r) => r.seed === seed && r.key === m.key);
          if (!run) return null;
          const errors = run.pipeline.rounds.slice(0, i + 1).map((r) => r.error);
          return errors.reduce((a, b) => a + b, 0) / errors.length;
        }).filter((x): x is number => x != null);
        point[m.key] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      }
      return point;
    });
    return downsample(raw, 300);
  }, [demoRuns]);

  const demoDeposits = useMemo(() => {
    const entries: { key: string; label: string; depositPolicy: DepositPolicy }[] = [
      { key: 'fixed', label: 'Fixed amount', depositPolicy: 'fixed_unit' },
      { key: 'bankroll', label: 'Fraction of wealth', depositPolicy: 'wealth_fraction' },
      { key: 'oracle', label: 'Wealth fraction \u00d7 skill', depositPolicy: 'sigma_scaled' },
    ];
    return entries.map((e) => {
      const runs = DEMO_SEEDS.map((seed) =>
        runPipeline({
          dgpId: 'baseline',
          behaviourPreset: 'baseline',
          rounds: DEMO_T,
          seed,
          n: DEMO_N,
          builder: { depositPolicy: e.depositPolicy, influenceRule: 'skill_stake' },
        }));
      return {
        name: e.label,
        meanError: mean(runs.map((r) => r.summary.meanError)) ?? 0,
        gini: mean(runs.map((r) => r.summary.finalGini)) ?? 0,
      };
    }).sort((a, b) => a.meanError - b.meanError);
  }, []);

  const demoConcentrationBar = useMemo(() =>
    demoMethodStats.map((m) => ({
      name: m.label,
      key: m.key,
      gini: m.finalGini ?? 0,
      nEff: m.meanNEff ?? 0,
      color: m.color,
    })).sort((a, b) => a.gini - b.gini),
    [demoMethodStats]);

  // --- which mode ---
  const useExp = hasExpData && !loading;
  const tabs = useExp ? EXP_TABS : DEMO_TABS;
  const deltaCrps = useExp ? (expMechanism?.deltaCrps ?? null) : (demoBlendVsEqual.mean ?? null);
  const gini = useExp ? (expMechanismConcentration?.finalGini ?? null) : (demoBlendedStats?.finalGini ?? null);

  const accuracyVerdict: Verdict = deltaCrps == null ? 'neutral' : deltaCrps < -0.001 ? 'good' : deltaCrps > 0.001 ? 'bad' : 'neutral';
  const concentrationVerdict: Verdict = gini == null ? 'neutral' : gini < 0.55 ? 'good' : gini > 0.7 ? 'bad' : 'neutral';

  if (!tabs.includes(activeTab as never)) setActiveTab(tabs[0]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Main results</h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
            {useExp
              ? 'Evidence from pre-run experiment outputs. This page does not use the live walkthrough state.'
              : `In-browser demo summary (baseline DGP, ${DEMO_SEEDS.length} matched seeds, N\u00a0=\u00a0${DEMO_N}, T\u00a0=\u00a0${DEMO_T}). Link experiment data for thesis evidence.`}
          </p>
          {!useExp && !loading && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[11px] text-amber-900 max-w-2xl leading-relaxed">
              <strong>Illustrative only.</strong> Run experiments and <code className="bg-amber-100 px-1 rounded">./scripts/link-dashboard-data.sh</code> to see thesis evidence.
            </div>
          )}
        </div>

        {/* Headline answers */}
        <section aria-label="Headline answers">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Headline answers</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <AnswerCard
              title="Does skill improve accuracy?"
              metric={deltaCrps == null ? '\u2014' : `${deltaCrps >= 0 ? '+' : ''}${fmt(deltaCrps, 4)}`}
              metricLabel={useExp ? `\u0394CRPS vs equal (S=${expAccuracyStats.nSeeds})` : '\u0394 mean error vs equal'}
              verdict={accuracyVerdict}
              interpretation={
                deltaCrps == null ? 'Data not loaded yet.'
                  : deltaCrps < 0
                    ? `Skill \u00d7 stake improves accuracy by ${fmt(Math.abs(deltaCrps), 4)}.`
                    : 'Equal weights match or beat Skill \u00d7 stake.'
              }
              caveat={useExp ? 'Identifiable benchmark; strategic settings on Robustness.' : 'In-browser demo with point scores, not CRPS.'}
            />
            <AnswerCard
              title="Does wealth dominate?"
              metric={gini == null ? '\u2014' : fmt(gini, 3)}
              metricLabel="Final Gini (blended)"
              verdict={concentrationVerdict}
              interpretation={
                useExp ? 'Concentration via Gini, HHI, and N_eff under benchmark configuration.'
                  : `Average final Gini for Skill \u00d7 stake is ${fmt(demoBlendedStats?.finalGini ?? 0, 3)} across ${DEMO_SEEDS.length} matched seeds.`
              }
              caveat="Concentration depends on DGP and deposit policy."
            />
          </div>
        </section>

        {/* How to read */}
        <section>
          <button type="button" onClick={() => setHowToReadOpen(!howToReadOpen)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
            <span className={`transition-transform ${howToReadOpen ? 'rotate-90' : ''}`}>&#x25B6;</span>
            How to read the results
          </button>
          {howToReadOpen && (
            <div className="mt-3 grid sm:grid-cols-4 gap-3">
              {([
                ['Benchmark', useExp ? `The canonical config that produced these outputs (DGP, T, N, seeds, deposit preset: ${expPreset || 'n/a'}).` : `Demo: baseline DGP, ${DEMO_SEEDS.length} matched seeds, N=${DEMO_N}, T=${DEMO_T}.`],
                ['Metric', useExp ? 'CRPS and \u0394CRPS for accuracy; Gini/HHI/N_eff for concentration.' : 'Mean absolute error (point score) and Gini for concentration.'],
                ['Comparison', useExp ? 'Paired deltas vs equal from master_comparison.' : 'Four weighting methods run side by side in the browser.'],
                ['Takeaway', 'One-line verdict above each chart.'],
              ] as const).map(([label, desc]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="text-[11px] font-semibold text-slate-700">{label}</div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Tabs */}
        <section>
          <div className="flex gap-1 border-b border-slate-200 mb-5">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${activeTab === tab ? 'border-teal-500 text-teal-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                {tab}
              </button>
            ))}
          </div>

          {loading && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Loading experiment outputs\u2026
            </div>
          )}

          {/* ========== EXPERIMENT-BACKED TABS ========== */}

          {useExp && activeTab === 'Accuracy' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-slate-800">Accuracy (\u0394CRPS vs equal)</h3>
                <InfoToggle term="\u0394CRPS vs equal" definition="Paired difference in mean CRPS relative to equal weighting." interpretation="Negative values mean better accuracy than equal weights." axes={{ x: 'method', y: '\u0394CRPS' }} />
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                <strong>Paired over matched seeds:</strong> bars show mean \u0394CRPS vs equal with 95% CI (\u00b11.96\u00d7SE), using the same seed panel across methods (S={expAccuracyStats.nSeeds}).
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={expAccuracyBar} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
                  <Tooltip content={<SmartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                  <Bar dataKey="deltaCrps" name="\u0394CRPS vs equal" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {expAccuracyBar.map((d) => <Cell key={d.method} fill={d.color} opacity={0.9} />)}
                    <ErrorBar dataKey="ci95" width={4} stroke="#334155" strokeWidth={1.2} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 grid sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <strong className="text-slate-700">Skill \u00d7 stake vs Skill-only:</strong>{' '}
                  {expPairwise.mechVsSkill.mean == null
                    ? 'insufficient data.'
                    : `${expPairwise.mechVsSkill.mean < -EPS ? 'better' : expPairwise.mechVsSkill.mean > EPS ? 'worse' : 'effectively tied'} by ${fmt(Math.abs(expPairwise.mechVsSkill.mean), 4)} CRPS on average; ${expPairwise.mechVsSkill.wins}/${expPairwise.mechVsSkill.n} wins, ${expPairwise.mechVsSkill.losses}/${expPairwise.mechVsSkill.n} losses, ${expPairwise.mechVsSkill.ties}/${expPairwise.mechVsSkill.n} ties.`}
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <strong className="text-slate-700">First-place share:</strong>{' '}
                  {expAccuracyBar.map((d) => `${d.name} ${fmt(d.firstPlaceShare * 100, 0)}%`).join(' \u00b7 ')}
                </div>
              </div>
            </div>
          )}

          {useExp && activeTab === 'Concentration' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Final Gini by method</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={expGiniBar} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
                    <CartesianGrid {...GRID_PROPS} />
                    <XAxis dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                    <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]} />
                    <Tooltip content={<SmartTooltip />} />
                    <Bar dataKey="finalGini" name="Final Gini" radius={[4, 4, 0, 0]} maxBarSize={36}>
                      {expGiniBar.map((d) => <Cell key={d.method} fill={d.color} opacity={0.85} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">HHI and N_eff by method</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={expInfluenceBar} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
                    <CartesianGrid {...GRID_PROPS} />
                    <XAxis dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                    <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                    <Tooltip content={<SmartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                    <Bar dataKey="meanHHI" name="Mean HHI" radius={[4, 4, 0, 0]} maxBarSize={18} fill="#ec4899" />
                    <Bar dataKey="meanNEff" name="Mean N_eff" radius={[4, 4, 0, 0]} maxBarSize={18} fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {useExp && activeTab === 'Calibration' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-slate-800">Calibration (reliability)</h3>
                <InfoToggle term="Reliability diagram" definition="Compares nominal quantile \u03c4 against empirical coverage p\u0302(\u03c4)." interpretation="Perfect calibration lies on the diagonal p\u0302 = \u03c4." axes={{ x: 'nominal \u03c4', y: 'empirical p\u0302' }} />
              </div>
              {calibrationData.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-[11px] text-slate-600">
                  No calibration data found. Run the <code className="bg-slate-200 px-1 rounded">calibration</code> experiment and link outputs.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={calibrationData} margin={CHART_MARGIN_LABELED}>
                    <CartesianGrid {...GRID_PROPS} />
                    <XAxis dataKey="tau" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]} />
                    <YAxis dataKey="pHat" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]} />
                    <Tooltip content={<SmartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                    <Line type="monotone" dataKey="ideal" name="Ideal (p\u0302=\u03c4)" stroke="#94a3b8" strokeDasharray="4 4" dot={false} />
                    <Line type="monotone" dataKey="pHat" name="Empirical p\u0302" stroke="#0d9488" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {useExp && activeTab === 'Ablation' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Bankroll ablation (\u0394CRPS vs Full)</h3>
              {ablationData.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-[11px] text-slate-600">
                  No ablation data. Run the <code className="bg-slate-200 px-1 rounded">bankroll_ablation</code> experiment and link outputs.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={ablationData} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
                    <CartesianGrid {...GRID_PROPS} />
                    <XAxis dataKey="variant" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                    <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                    <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
                    <Tooltip content={<SmartTooltip />} />
                    <Bar dataKey="delta_crps_vs_full" name="\u0394CRPS vs Full" radius={[4, 4, 0, 0]} maxBarSize={40} fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* ========== DEMO FALLBACK TABS ========== */}

          {!useExp && !loading && activeTab === 'Accuracy' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500 font-medium mr-1">Compare:</span>
                {demoMethodDefs.map((m) => (
                  <button key={m.key} onClick={() => setEnabledMethods((prev) => ({ ...prev, [m.key]: !prev[m.key] }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${enabledMethods[m.key] ? 'text-white shadow-sm' : 'bg-slate-100 text-slate-400'}`}
                    style={enabledMethods[m.key] ? { background: m.color } : undefined}>
                    <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-slate-800">Forecast quality comparison</h3>
                  <InfoToggle term="Forecast quality comparison" definition="Compares aggregation methods over time." interpretation="Each line shows the cumulative mean error. Lower is better." axes={{ x: 'round', y: 'cumulative mean error' }} />
                  <ZoomBadge isZoomed={cumErrorZoom.state.isZoomed} onReset={cumErrorZoom.reset} />
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  <strong>Across {DEMO_SEEDS.length} matched seeds:</strong>{' '}
                  {demoBestAvg ? `${demoBestAvg.label} has the lowest average mean error.` : 'No demo summary available.'}
                  {demoBlendVsSkill.mean != null && (
                    <>
                      {' '}Skill \u00d7 stake vs Skill-only:{' '}
                      {demoBlendVsSkill.mean < -EPS
                        ? `better by ${fmt(Math.abs(demoBlendVsSkill.mean), 4)}`
                        : demoBlendVsSkill.mean > EPS
                          ? `worse by ${fmt(Math.abs(demoBlendVsSkill.mean), 4)}`
                          : 'effectively tied'}
                      {' '}over matched seeds.
                    </>
                  )}
                </p>
                <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 leading-relaxed">
                  <strong>Pairwise summary:</strong>{' '}
                  Skill \u00d7 stake beats Equal in {demoBlendVsEqual.wins}/{demoBlendVsEqual.n} seeds,
                  Skill-only in {demoBlendVsSkill.wins}/{demoBlendVsSkill.n},
                  Stake-only in {demoBlendVsStake.wins}/{demoBlendVsStake.n}; tied within \u03b5 in {demoBlendVsEqual.ties + demoBlendVsSkill.ties + demoBlendVsStake.ties} pairwise seed-cases.
                  {' '}First-place share: Equal {fmt((demoWinCounts.equal / DEMO_SEEDS.length) * 100, 0)}%, Skill-only {fmt((demoWinCounts.skill_only / DEMO_SEEDS.length) * 100, 0)}%, Skill \u00d7 stake {fmt((demoWinCounts.blended / DEMO_SEEDS.length) * 100, 0)}%, Stake-only {fmt((demoWinCounts.stake_only / DEMO_SEEDS.length) * 100, 0)}%.
                </div>
                <div className="cursor-crosshair" role="img" aria-label="Forecast quality by method">
                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart data={demoCumError} margin={CHART_MARGIN_LABELED}
                      onMouseDown={cumErrorZoom.onMouseDown} onMouseMove={cumErrorZoom.onMouseMove} onMouseUp={cumErrorZoom.onMouseUp}>
                      <CartesianGrid {...GRID_PROPS} />
                      <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[cumErrorZoom.state.left, cumErrorZoom.state.right]} />
                      <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                      <Tooltip content={<SmartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                      {demoMethodDefs.map((m) => enabledMethods[m.key] && (
                        <Line key={m.key} type="monotone" dataKey={m.key} name={m.label} stroke={m.color}
                          strokeWidth={m.key === 'blended' ? 2.5 : 1.5} dot={false} strokeOpacity={m.key === 'blended' ? 1 : 0.7} />
                      ))}
                      <Brush dataKey="round" {...BRUSH_PROPS} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                <MathBlock inline latex="m_{i,t} = b_{i,t}\bigl(\lambda + (1-\lambda)\,\sigma_{i,t}^{\eta}\bigr)" />
                <p className="text-xs text-slate-500 mt-2">
                  The effective wager gates deposit through skill. With noisy deposits, skill attenuates bad bets.
                </p>
              </div>
            </div>
          )}

          {!useExp && !loading && activeTab === 'Concentration' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Gini and N_eff by weighting method</h3>
              <p className="text-[11px] text-slate-500 mb-3"><strong>Verdict:</strong> Lower Gini and higher N_eff indicate less concentration.</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={demoConcentrationBar} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <Tooltip content={<SmartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                  <Bar dataKey="gini" name="Final Gini" radius={[4, 4, 0, 0]} maxBarSize={24}>
                    {demoConcentrationBar.map((d) => <Cell key={d.key} fill={d.color} opacity={0.8} />)}
                  </Bar>
                  <Bar dataKey="nEff" name="Mean N_eff" radius={[4, 4, 0, 0]} maxBarSize={24} fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {!useExp && !loading && activeTab === 'Deposit policy' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Deposit policy: accuracy vs concentration</h3>
              <p className="text-[11px] text-slate-500 mb-3">Mean error and final Gini by deposit rule. Lower is better for both.</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={demoDeposits} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <Tooltip content={<SmartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                  <Bar dataKey="meanError" name="Mean error" radius={[4, 4, 0, 0]} maxBarSize={32} fill={SEM.outcome.main} />
                  <Bar dataKey="gini" name="Final Gini" radius={[4, 4, 0, 0]} maxBarSize={32} fill={SEM.wealth.main} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Limitations */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Limitations</h2>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <ul className="space-y-2 text-[11px] text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2"><span className="text-slate-400 mt-0.5 shrink-0">1.</span><span><strong className="text-slate-700">Identifiable benchmark required.</strong> The skill layer needs a proper scoring rule and enough rounds to converge.</span></li>
              <li className="flex items-start gap-2"><span className="text-slate-400 mt-0.5 shrink-0">2.</span><span><strong className="text-slate-700">Strategic settings are harder.</strong> Gains from skill weighting shrink under manipulation. See Robustness.</span></li>
              <li className="flex items-start gap-2"><span className="text-slate-400 mt-0.5 shrink-0">3.</span><span><strong className="text-slate-700">Some gains depend on DGP and deposit policy.</strong> Equal weights remain a strong baseline.</span></li>
              <li className="flex items-start gap-2"><span className="text-slate-400 mt-0.5 shrink-0">4.</span><span><strong className="text-slate-700">Tail miscalibration is shared.</strong> All methods under-cover extreme quantiles.</span></li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
