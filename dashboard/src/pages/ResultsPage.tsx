import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
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
import InfoToggle from '@/components/dashboard/InfoToggle';
import {
  AXIS_STROKE,
  AXIS_TICK,
  CHART_MARGIN_LABELED,
  GRID_PROPS,
  TOOLTIP_STYLE,
  fmt,
} from '@/components/lab/shared';

const EPS = 1e-4;
/** Verdict band for mechanism ΔCRPS vs equal (raw units); smaller than 1e-3 so near-ties stay neutral. */
const ACCURACY_EPS = 1e-4;

/**
 * When experiment JSON is not linked, show this illustrative snapshot of mean ΔCRPS vs equal
 * for the canonical exogenous-deposit `master_comparison` (latent_fixed DGP, matched seeds).
 * Update after regenerating offline outputs.
 */
const DEMO_BENCHMARK_DELTA_VS_EQUAL: Array<{ method: 'uniform' | 'deposit' | 'skill' | 'mechanism'; delta: number }> = [
  { method: 'skill', delta: -0.0015226 },
  { method: 'mechanism', delta: -0.0000056 },
  { method: 'uniform', delta: 0 },
  { method: 'deposit', delta: 0.0026007 },
];

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

const EXP_TABS = ['Accuracy', 'Concentration', 'Calibration', 'Ablation'] as const;
const DEMO_TABS = ['Accuracy', 'About'] as const;

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

/** Core four-method benchmark (exclude oracle `best_single` from primary accuracy views). */
const CORE_METHOD_KEYS = ['uniform', 'deposit', 'skill', 'mechanism'] as const;

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
      meanCrps: meanFinite(rs.map((x) => x.mean_crps)),
      deltaCrps: meanFinite(rs.map((x) => x.delta_crps_vs_equal)),
      deltaCrpsSE: seFinite(rs.map((x) => x.delta_crps_vs_equal)),
      meanHHI: meanFinite(rs.map((x) => x.mean_HHI)),
      meanNEff: meanFinite(rs.map((x) => x.mean_N_eff)),
      finalGini: meanFinite(rs.map((x) => x.final_gini)),
      n: rs.length,
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
    const coreSet = new Set<string>(CORE_METHOD_KEYS);
    seedMethodCrps.forEach((methods) => {
      const rows = Array.from(methods.entries()).filter(
        ([method, crps]) => coreSet.has(method) && Number.isFinite(crps),
      );
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

  const expCoreMethods = useMemo(
    () =>
      methodAgg.filter(
        (m) =>
          (CORE_METHOD_KEYS as readonly string[]).includes(m.method) &&
          m.deltaCrps != null,
      ),
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
          deltaLabel: `${deltaX1e4.toFixed(2)}`,
          gapToBestX1e4,
          gapLabel: `${gapToBestX1e4.toFixed(2)}`,
          seX1e4: (m.deltaCrpsSE ?? 0) * 1e4,
        };
      });
  }, [expCoreMethods, expBestCore]);

  const expSkill = expCoreMethods.find((m) => m.method === 'skill') ?? null;
  const expMech = expCoreMethods.find((m) => m.method === 'mechanism') ?? null;
  const expEqual = expCoreMethods.find((m) => m.method === 'uniform') ?? null;

  const expMechVsSkillX1e4 =
    expSkill && expMech ? ((expMech.deltaCrps ?? 0) - (expSkill.deltaCrps ?? 0)) * 1e4 : null;

  const expMechVsEqualX1e4 =
    expEqual && expMech ? ((expMech.deltaCrps ?? 0) - (expEqual.deltaCrps ?? 0)) * 1e4 : null;

  const expCoreFirstPlaceItems = useMemo(
    () => expAccuracyStats.items.filter((m) => (CORE_METHOD_KEYS as readonly string[]).includes(m.method)),
    [expAccuracyStats.items],
  );

  const expGiniBar = useMemo(() =>
    [...methodAgg]
      .filter((m) => (CORE_METHOD_KEYS as readonly string[]).includes(m.method) && m.finalGini != null)
      .sort((a, b) => (a.finalGini ?? 0) - (b.finalGini ?? 0))
      .map((m) => ({ name: m.label, method: m.method, finalGini: m.finalGini as number, color: m.color })),
    [methodAgg]);

  const expInfluenceBar = useMemo(() =>
    [...methodAgg]
      .filter((m) => (CORE_METHOD_KEYS as readonly string[]).includes(m.method) && (m.meanHHI != null || m.meanNEff != null))
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

  /** Illustrative scaled rows for the static preview (same logic as experiment-backed charts). */
  const demoFallbackDisplay = useMemo(() => {
    const core = DEMO_BENCHMARK_DELTA_VS_EQUAL.map((d) => ({
      method: d.method,
      label: METHOD_LABEL[d.method],
      color: METHOD_COLOR[d.method],
      deltaCrps: d.delta,
    }));
    const best = [...core].sort((a, b) => a.deltaCrps - b.deltaCrps)[0];
    if (!best) return [];
    return [...core]
      .sort((a, b) => a.deltaCrps - b.deltaCrps)
      .map((m) => {
        const deltaX1e4 = m.deltaCrps * 1e4;
        const gapToBestX1e4 = (m.deltaCrps - best.deltaCrps) * 1e4;
        return {
          name: m.label,
          method: m.method,
          color: m.color,
          deltaCrpsX1e4: deltaX1e4,
          deltaLabel: deltaX1e4.toFixed(2),
          gapToBestX1e4,
          gapLabel: gapToBestX1e4.toFixed(2),
          seX1e4: 0,
        };
      });
  }, []);

  const demoBestCore = useMemo(() => {
    const first = demoFallbackDisplay[0];
    return first ? { label: first.name, method: first.method } : null;
  }, [demoFallbackDisplay]);

  const demoMechanismDelta = useMemo(
    () => DEMO_BENCHMARK_DELTA_VS_EQUAL.find((d) => d.method === 'mechanism')?.delta ?? null,
    [],
  );

  // --- which mode ---
  const useExp = hasExpData && !loading;
  const tabs = useExp ? EXP_TABS : DEMO_TABS;
  const deltaCrps = useExp ? (expMechanism?.deltaCrps ?? null) : demoMechanismDelta;
  const gini = useExp ? (expMechanismConcentration?.finalGini ?? null) : null;

  const accuracyVerdict: Verdict =
    deltaCrps == null
      ? 'neutral'
      : deltaCrps < -ACCURACY_EPS
        ? 'good'
        : deltaCrps > ACCURACY_EPS
          ? 'bad'
          : 'neutral';
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
              : 'Preview uses a static snapshot of the canonical four-method benchmark (exogenous IID deposits, latent-fixed DGP). Link outputs for full charts and concentration metrics.'}
          </p>
          {!useExp && !loading && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[11px] text-amber-900 max-w-2xl leading-relaxed space-y-2">
              <p>
                <strong>Illustrative snapshot.</strong> Charts use the same benchmark definitions as linked data; values are a fixed placeholder until you regenerate.
              </p>
              <p>
                <strong>Run it locally (faster, fewer seeds):</strong>{' '}
                <code className="bg-amber-100 px-1 rounded break-all">
                  cd onlinev2 &amp;&amp; python -c &quot;from onlinev2.experiments.runners.runner_module import run_master_comparison; run_master_comparison(seeds=list(range(42,62)), T=500, outdir=&apos;outputs&apos;)&quot;
                </code>
                {' '}(20 seeds, same DGP/deposit mode as full run) then{' '}
                <code className="bg-amber-100 px-1 rounded">./scripts/link-dashboard-data.sh</code>
                {' '}from the repo root.
              </p>
              <p className="text-amber-800/90">
                Full thesis run:{' '}
                <code className="bg-amber-100 px-1 rounded">python -m onlinev2.experiments.cli --exp master_comparison --block core --outdir outputs</code>
                {' '}(uses canonical 1000 seeds from <code className="bg-amber-100 px-1 rounded">benchmark_config.py</code>).
              </p>
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
              metricLabel={
                useExp
                  ? `\u0394CRPS vs equal (S=${expAccuracyStats.nSeeds}); mech \u00d7 10\u2074 = ${expMechanism?.deltaCrps != null ? (expMechanism.deltaCrps * 1e4).toFixed(2) : '\u2014'}`
                  : `\u0394CRPS vs equal (Skill \u00d7 stake); \u00d7 10\u2074 = ${demoMechanismDelta != null ? (demoMechanismDelta * 1e4).toFixed(2) : '\u2014'} (illustrative)`
              }
              verdict={accuracyVerdict}
              interpretation={
                deltaCrps == null ? 'Data not loaded yet.'
                  : deltaCrps < 0
                    ? `Skill \u00d7 stake improves accuracy vs equal by ${fmt(Math.abs(deltaCrps), 4)} (mean CRPS).`
                    : 'Equal weights match or beat Skill \u00d7 stake on average CRPS.'
              }
              caveat={useExp ? 'Identifiable benchmark; strategic settings on Robustness.' : 'Static snapshot; link master_comparison for live SEs and paired seed counts.'}
            />
            <AnswerCard
              title="Does wealth dominate?"
              metric={gini == null ? '\u2014' : fmt(gini, 3)}
              metricLabel={useExp ? 'Final Gini (mechanism path)' : 'Final Gini'}
              verdict={concentrationVerdict}
              interpretation={
                useExp ? 'Concentration via Gini, HHI, and N_eff under benchmark configuration.'
                  : 'Link experiment outputs to see Gini, HHI, and N_eff from the same run.'
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
                ['Benchmark', useExp ? `The canonical config that produced these outputs (DGP, T, N, seeds, deposit preset: ${expPreset || 'n/a'}).` : 'Preview: four methods with exogenous IID deposits (same path per seed); illustrative \u0394CRPS bar below.'],
                ['Metric', useExp ? 'CRPS and \u0394CRPS for accuracy; Gini/HHI/N_eff for concentration.' : '\u0394CRPS vs equal from static snapshot; link data for SEs and concentration.'],
                ['Comparison', useExp ? 'Paired deltas vs equal from master_comparison.' : 'Equal, exogenous stake-only, skill-only, Skill \u00d7 stake (skill gate \u00d7 same deposits).'],
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
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                {expAccuracyDisplay.length === 0 && (
                  <p className="text-sm text-slate-500 mb-4">No core-method rows found in master_comparison output.</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-slate-800">Accuracy summary</h3>
                  <InfoToggle
                    term="\u0394CRPS \u00d7 10\u2074"
                    definition="Mean paired \u0394CRPS versus equal weighting, multiplied by 10\u2074 so small differences are visible on the axis."
                    interpretation="More negative is better. Zero matches equal weights. Core four methods only (oracle best-single excluded here)."
                    axes={{ x: 'scaled \u0394CRPS', y: 'method' }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                  <strong>Setup:</strong> latent-fixed DGP, quantile CRPS scoring, exogenous IID exponential deposits (
                  {expPreset || 'exponential_deposits'}
                  ), matched seeds S={expAccuracyStats.nSeeds}, warm-start averaging as in{' '}
                  <code className="bg-slate-100 px-1 rounded text-[10px]">master_comparison</code>.
                </p>

                <p className="text-[11px] text-slate-600 mb-4 leading-relaxed">
                  <strong>Headline:</strong>{' '}
                  {expBestCore ? (
                    <span>
                      <span className="text-slate-800 font-medium">{expBestCore.label}</span> has the best mean \u0394CRPS vs equal among the four methods.
                    </span>
                  ) : (
                    'Could not compute core-method summary (check master_comparison CSV).'
                  )}
                  {expAccuracyDisplay.length > 0 && expMechVsSkillX1e4 != null && (
                    <>
                      {' '}
                      Skill \u00d7 stake is{' '}
                      <span className="font-mono">{Math.abs(expMechVsSkillX1e4).toFixed(2)}</span>
                      {' '}
                      scaled CRPS points (\u00d7 10\u2074){' '}
                      {expMechVsSkillX1e4 > 0 ? 'worse' : expMechVsSkillX1e4 < 0 ? 'better' : 'tied with'}
                      {' '}
                      Skill-only on average.
                    </>
                  )}
                  {expAccuracyDisplay.length > 0 && expMechVsEqualX1e4 != null && (
                    <>
                      {' '}
                      Versus equal, Skill \u00d7 stake is{' '}
                      <span className="font-mono">{expMechVsEqualX1e4.toFixed(2)}</span>
                      {' '}
                      on the same scale (negative \u003d improvement vs equal).
                    </>
                  )}
                </p>

                {expAccuracyDisplay.length > 0 && (
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-700 mb-2">
                      Relative to equal (\u0394CRPS \u00d7 10\u2074)
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={expAccuracyDisplay}
                        layout="vertical"
                        margin={{ top: 8, right: 36, bottom: 8, left: 8 }}
                      >
                        <CartesianGrid {...GRID_PROPS} />
                        <XAxis type="number" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={AXIS_TICK}
                          stroke={AXIS_STROKE}
                          width={168}
                        />
                        <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="4 4" />
                        <Tooltip
                          formatter={(value) => {
                            const v = Number(value);
                            return [`${Number.isFinite(v) ? v.toFixed(2) : '\u2014'} (\u0394CRPS \u00d7 10\u2074)`, '\u0394CRPS vs equal'];
                          }}
                          contentStyle={TOOLTIP_STYLE}
                        />
                        <Bar dataKey="deltaCrpsX1e4" name="\u0394CRPS vs equal" radius={[0, 4, 4, 0]} maxBarSize={28}>
                          {expAccuracyDisplay.map((d) => (
                            <Cell key={d.method} fill={d.color} opacity={0.92} />
                          ))}
                          <LabelList
                            dataKey="deltaLabel"
                            position="right"
                            className="fill-slate-600 text-[10px] font-mono"
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <div className="text-[11px] font-semibold text-slate-700 mb-2">
                      Gap to best method (\u00d7 10\u2074)
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={expAccuracyDisplay}
                        layout="vertical"
                        margin={{ top: 8, right: 36, bottom: 8, left: 8 }}
                      >
                        <CartesianGrid {...GRID_PROPS} />
                        <XAxis type="number" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={AXIS_TICK}
                          stroke={AXIS_STROKE}
                          width={168}
                        />
                        <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="4 4" />
                        <Tooltip
                          formatter={(value) => {
                            const v = Number(value);
                            return [`${Number.isFinite(v) ? v.toFixed(2) : '\u2014'} (\u00d7 10\u2074)`, 'Gap to best'];
                          }}
                          contentStyle={TOOLTIP_STYLE}
                        />
                        <Bar dataKey="gapToBestX1e4" radius={[0, 4, 4, 0]} maxBarSize={28} fill="#334155">
                          <LabelList
                            dataKey="gapLabel"
                            position="right"
                            className="fill-slate-200 text-[10px] font-mono"
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                )}

                {expAccuracyDisplay.length > 0 && (
                  <ol className="mt-4 list-decimal pl-5 text-[11px] text-slate-600 space-y-1">
                    {expAccuracyDisplay.map((d, i) => (
                      <li key={d.method}>
                        <span className="font-medium text-slate-800">{d.name}</span>
                        {' — ranked '}
                        {i + 1}
                        {' of 4 by mean \u0394CRPS vs equal; '}
                        <span className="font-mono">\u0394\u00d710\u2074 = {d.deltaLabel}</span>
                      </li>
                    ))}
                  </ol>
                )}

                <div className="mt-4 grid sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <strong className="text-slate-700">Skill \u00d7 stake vs Skill-only (mean CRPS):</strong>{' '}
                    {expPairwise.mechVsSkill.mean == null
                      ? 'insufficient data.'
                      : `${expPairwise.mechVsSkill.mean < -EPS ? 'better' : expPairwise.mechVsSkill.mean > EPS ? 'worse' : 'effectively tied'} by ${fmt(Math.abs(expPairwise.mechVsSkill.mean), 6)} on average; ${expPairwise.mechVsSkill.wins}/${expPairwise.mechVsSkill.n} wins, ${expPairwise.mechVsSkill.losses}/${expPairwise.mechVsSkill.n} losses, ${expPairwise.mechVsSkill.ties}/${expPairwise.mechVsSkill.n} ties.`}
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <strong className="text-slate-700">First-place share (core four, lowest mean CRPS per seed):</strong>{' '}
                    {expCoreFirstPlaceItems.map((d) => `${d.label} ${fmt((d.firstPlaceShare ?? 0) * 100, 0)}%`).join(' \u00b7 ') || '\u2014'}
                  </div>
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

          {/* ========== DEMO FALLBACK (static benchmark preview) ========== */}

          {!useExp && !loading && activeTab === 'Accuracy' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-slate-800">Accuracy preview</h3>
                <InfoToggle
                  term="\u0394CRPS \u00d7 10\u2074"
                  definition="Same scaling as linked experiment view. Values here are a static placeholder array."
                  interpretation="More negative is better. Regenerate offline or link JSON for measured results."
                  axes={{ x: 'scaled \u0394CRPS', y: 'method' }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                <strong>What this benchmark is:</strong> same latent-fixed DGP and quantile CRPS scoring as{' '}
                <code className="bg-slate-100 px-1 rounded text-[10px]">master_comparison</code>
                : exogenous IID exponential deposits, \u03bb / \u03b7 skill gate for Skill \u00d7 stake, random missingness.{' '}
                {demoBestCore && (
                  <>
                    Illustrative best here: <span className="font-medium text-slate-700">{demoBestCore.label}</span>.
                  </>
                )}{' '}
                Update <code className="bg-slate-100 px-1 rounded text-[10px]">DEMO_BENCHMARK_DELTA_VS_EQUAL</code> after a local run, or link outputs.
              </p>

              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <div className="text-[11px] font-semibold text-slate-700 mb-2">Relative to equal (\u0394CRPS \u00d7 10\u2074)</div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={demoFallbackDisplay}
                      layout="vertical"
                      margin={{ top: 8, right: 36, bottom: 8, left: 8 }}
                    >
                      <CartesianGrid {...GRID_PROPS} />
                      <XAxis type="number" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                      <YAxis type="category" dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE} width={168} />
                      <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="4 4" />
                      <Tooltip
                        formatter={(value) => {
                          const v = Number(value);
                          return [`${Number.isFinite(v) ? v.toFixed(2) : '\u2014'}`, '\u0394CRPS \u00d7 10\u2074'];
                        }}
                        contentStyle={TOOLTIP_STYLE}
                      />
                      <Bar dataKey="deltaCrpsX1e4" radius={[0, 4, 4, 0]} maxBarSize={28}>
                        {demoFallbackDisplay.map((d) => (
                          <Cell key={d.method} fill={d.color} opacity={0.92} />
                        ))}
                        <LabelList dataKey="deltaLabel" position="right" className="fill-slate-600 text-[10px] font-mono" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-700 mb-2">Gap to best (\u00d7 10\u2074)</div>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={demoFallbackDisplay}
                      layout="vertical"
                      margin={{ top: 8, right: 36, bottom: 8, left: 8 }}
                    >
                      <CartesianGrid {...GRID_PROPS} />
                      <XAxis type="number" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                      <YAxis type="category" dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE} width={168} />
                      <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="4 4" />
                      <Tooltip
                        formatter={(value) => {
                          const v = Number(value);
                          return [`${Number.isFinite(v) ? v.toFixed(2) : '\u2014'}`, 'Gap to best'];
                        }}
                        contentStyle={TOOLTIP_STYLE}
                      />
                      <Bar dataKey="gapToBestX1e4" radius={[0, 4, 4, 0]} maxBarSize={28} fill="#334155">
                        <LabelList dataKey="gapLabel" position="right" className="fill-slate-200 text-[10px] font-mono" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {!useExp && !loading && activeTab === 'About' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 text-[11px] text-slate-600 leading-relaxed">
              <h3 className="text-sm font-semibold text-slate-800">Benchmark definition (four methods)</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-slate-700">Equal</strong> — uniform weights over active forecasters.</li>
                <li><strong className="text-slate-700">Stake-only (exogenous deposits)</strong> — weights proportional to IID exponential deposits; missing rounds zeroed.</li>
                <li><strong className="text-slate-700">Skill-only</strong> — weights proportional to learned \u03c3 (EWMA losses, quantile CRPS).</li>
                <li><strong className="text-slate-700">Skill \u00d7 stake</strong> — same deposit draws as stake-only, effective wager m \u221d b\u00b7(\u03bb + (1\u2212\u03bb)\u03c3^\u03b7); \u03c9_max=0 in the headline benchmark so aggregation is not cap-asymmetric.</li>
              </ul>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                <div className="font-semibold text-slate-800">Inputs (matches offline runner)</div>
                <p>
                  DGP <code className="bg-white px-1 rounded">latent_fixed</code>, scoring{' '}
                  <code className="bg-white px-1 rounded">quantiles_crps</code>, deposits{' '}
                  <code className="bg-white px-1 rounded">exponential</code>, paired seeds across methods, warm-start window for reported means.
                </p>
                <p className="text-slate-500">
                  Fast local check (20 seeds): use the one-liner in the amber box above, then link. Full panel: canonical seeds in <code className="bg-white px-1 rounded">benchmark_config.py</code> via CLI.
                </p>
              </div>
              <p className="text-slate-500">
                The Walkthrough lab uses a separate toy pipeline. Thesis claims should cite linked <code className="bg-slate-100 px-1 rounded">master_comparison</code> outputs.
              </p>
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
