import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
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

  /** Illustrative ΔCRPS vs equal when experiment files are not linked (static snapshot). */
  const demoFallbackAccuracyBar = useMemo(
    () =>
      [...DEMO_BENCHMARK_DELTA_VS_EQUAL]
        .sort((a, b) => a.delta - b.delta)
        .map((d) => ({
          name: METHOD_LABEL[d.method],
          method: d.method,
          deltaCrps: d.delta,
          color: METHOD_COLOR[d.method],
        })),
    [],
  );

  const demoMechanismDelta = useMemo(
    () => DEMO_BENCHMARK_DELTA_VS_EQUAL.find((d) => d.method === 'mechanism')?.delta ?? null,
    [],
  );

  // --- which mode ---
  const useExp = hasExpData && !loading;
  const tabs = useExp ? EXP_TABS : DEMO_TABS;
  const deltaCrps = useExp ? (expMechanism?.deltaCrps ?? null) : demoMechanismDelta;
  const gini = useExp ? (expMechanismConcentration?.finalGini ?? null) : null;

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
              : 'Preview uses a static snapshot of the canonical four-method benchmark (exogenous IID deposits, latent-fixed DGP). Link outputs for full charts and concentration metrics.'}
          </p>
          {!useExp && !loading && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[11px] text-amber-900 max-w-2xl leading-relaxed">
              <strong>Illustrative snapshot.</strong> Run <code className="bg-amber-100 px-1 rounded">python -m onlinev2.experiments.cli --exp master_comparison --block core --outdir outputs</code> then <code className="bg-amber-100 px-1 rounded">./scripts/link-dashboard-data.sh</code> for measured CRPS, CIs, and Gini/HHI.
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
              metricLabel={useExp ? `\u0394CRPS vs equal (S=${expAccuracyStats.nSeeds})` : '\u0394CRPS vs equal (Skill \u00d7 stake, illustrative)'}
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

          {/* ========== DEMO FALLBACK (static benchmark preview) ========== */}

          {!useExp && !loading && activeTab === 'Accuracy' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-sm font-semibold text-slate-800">Accuracy (\u0394CRPS vs equal)</h3>
                <InfoToggle
                  term="\u0394CRPS vs equal"
                  definition="Illustrative mean paired difference vs equal weighting from the last offline master_comparison (exogenous IID deposits)."
                  interpretation="Negative is better. Link JSON for standard errors and seed-level wins."
                  axes={{ x: 'method', y: '\u0394CRPS' }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Four core methods on the <strong>same</strong> latent DGP path per seed: equal weights; stake-only weights from <strong>exogenous</strong> IID deposits; skill-only from learned \u03c3; Skill \u00d7 stake uses <strong>those same deposits</strong> through the skill gate (\u03bb, \u03b7). Ranking below is a fixed snapshot—regenerate and update <code className="bg-slate-100 px-1 rounded text-[10px]">DEMO_BENCHMARK_DELTA_VS_EQUAL</code> or link data.
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={demoFallbackAccuracyBar} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE} interval={0} angle={-18} textAnchor="end" height={68} />
                  <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
                  <Tooltip content={<SmartTooltip />} />
                  <Bar dataKey="deltaCrps" name="\u0394CRPS vs equal" radius={[4, 4, 0, 0]} maxBarSize={44}>
                    {demoFallbackAccuracyBar.map((d) => (
                      <Cell key={d.method} fill={d.color} opacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {!useExp && !loading && activeTab === 'About' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 text-[11px] text-slate-600 leading-relaxed">
              <h3 className="text-sm font-semibold text-slate-800">What this preview shows</h3>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-slate-700">Equal</strong> — uniform weights over active forecasters.</li>
                <li><strong className="text-slate-700">Stake-only (exogenous deposits)</strong> — weights proportional to IID exponential deposits (missing agents get zero stake).</li>
                <li><strong className="text-slate-700">Skill-only</strong> — weights proportional to learned skill \u03c3 from past losses.</li>
                <li><strong className="text-slate-700">Skill \u00d7 stake</strong> — same exogenous deposits as stake-only, multiplied by the skill gate: m \u221d b\u00b7(\u03bb + (1\u2212\u03bb)\u03c3^\u03b7).</li>
              </ul>
              <p className="text-slate-500">
                The live dashboard walkthrough uses a different toy pipeline. For thesis numbers, always use linked <code className="bg-slate-100 px-1 rounded">master_comparison</code> outputs.
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
