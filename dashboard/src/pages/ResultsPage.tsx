import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  Brush,
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

const DEMO_SEED = 42;
const DEMO_N = 6;
const DEMO_T = 200;

const CORE_METHOD_KEYS = ['uniform', 'deposit', 'skill', 'mechanism'] as const;
const ACCURACY_EPS = 1e-4;

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
  uniform: 'Equal', deposit: 'Stake-only', skill: 'Skill-only', mechanism: 'Skill \u00d7 stake', best_single: 'Best single',
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

  const expSkill = expCoreMethods.find((m) => m.method === 'skill') ?? null;
  const expMech = expCoreMethods.find((m) => m.method === 'mechanism') ?? null;
  const expMechVsSkillX1e4 = expSkill && expMech
    ? ((expMech.deltaCrps ?? 0) - (expSkill.deltaCrps ?? 0)) * 1e4
    : null;
  const expMechVsEqualX1e4 = expMech ? (expMech.deltaCrps ?? 0) * 1e4 : null;

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

  const demoSorted = useMemo(() => [...demoMethods].sort((a, b) => a.pipeline.summary.meanError - b.pipeline.summary.meanError), [demoMethods]);
  const demoBest = demoSorted[0];
  const demoEqual = demoMethods.find((x) => x.key === 'equal')!;
  const demoBlended = demoMethods.find((x) => x.key === 'blended')!;
  const demoDelta = demoBlended.pipeline.summary.meanError - demoEqual.pipeline.summary.meanError;
  const demoDeltaGini = demoBlended.pipeline.summary.finalGini - demoEqual.pipeline.summary.finalGini;

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
      { key: 'oracle', label: 'Wealth fraction \u00d7 skill', depositPolicy: 'sigma_scaled' },
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

  // --- which mode ---
  const useExp = hasExpData && !loading;
  const tabs = useExp ? EXP_TABS : DEMO_TABS;
  const deltaCrps = useExp ? (expMechanism?.deltaCrps ?? null) : demoDelta;
  const gini = useExp ? (expMechanism?.finalGini ?? null) : demoBlended.pipeline.summary.finalGini;

  const accuracyVerdict: Verdict = deltaCrps == null ? 'neutral' : deltaCrps < -ACCURACY_EPS ? 'good' : deltaCrps > ACCURACY_EPS ? 'bad' : 'neutral';
  const concentrationVerdict: Verdict = gini == null ? 'neutral' : gini < 0.55 ? 'good' : gini > 0.7 ? 'bad' : 'neutral';

  if (!tabs.includes(activeTab as never)) setActiveTab(tabs[0]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Main results</h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
            {useExp
              ? 'This view shows results from a large, pre-generated comparison using the same scenarios across all methods for a fair ranking.'
              : `This view is a quick interactive demo with a smaller sample (seed ${DEMO_SEED}, ${DEMO_N} participants, ${DEMO_T} rounds).`}
          </p>
          {!useExp && !loading && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[11px] text-amber-900 max-w-2xl leading-relaxed">
              <strong>Illustrative only.</strong> Use this as a quick visual guide; final ranking should be read from the experiment-backed view.
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
                  ? `\u0394CRPS vs equal${expMechVsEqualX1e4 != null ? ` (\u00d710\u2074\u202f=\u202f${expMechVsEqualX1e4.toFixed(2)})` : ''}`
                  : '\u0394 mean error vs equal'
              }
              verdict={accuracyVerdict}
              interpretation={
                deltaCrps == null ? 'Data not loaded yet.'
                  : deltaCrps < 0
                    ? `Skill \u00d7 stake improves accuracy by ${fmt(Math.abs(deltaCrps), 4)}.`
                    : 'Equal weights match or beat Skill \u00d7 stake.'
              }
              caveat={useExp ? 'Based on the full pre-generated comparison view.' : 'Demo values are directional and based on a smaller sample.'}
            />
            <AnswerCard
              title="Does wealth dominate?"
              metric={gini == null ? '\u2014' : fmt(gini, 3)}
              metricLabel="Final Gini (blended)"
              verdict={concentrationVerdict}
              interpretation={
                useExp ? 'Shows how concentrated influence becomes under each method.'
                  : `\u0394Gini vs equal: ${demoDeltaGini >= 0 ? '+' : ''}${fmt(demoDeltaGini, 3)}. ${Math.abs(demoDeltaGini) < 0.05 ? 'Concentration stays controlled.' : 'Concentration shifts under skill weighting.'}`
              }
              caveat="Concentration can vary across environments."
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
                ['What this is', useExp ? 'A large, offline comparison designed for fair method ranking.' : 'A lightweight interactive demo for intuition.'],
                ['Metric', useExp ? 'CRPS and \u0394CRPS for accuracy; Gini/HHI/N_eff for concentration.' : 'Mean absolute error (point score) and Gini for concentration.'],
                ['What to read first', 'Start from the ranked list in Accuracy, then use the charts to see distance between methods.'],
                ['What to keep in mind', useExp ? 'Small gaps indicate near-ties; larger negative values indicate better accuracy.' : 'Demo results are informative but less stable than the full experiment-backed view.'],
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
            <div className="space-y-5">
              {expAccuracyDisplay.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-[11px] text-slate-600">
                  No comparison data is currently available for the four main methods.
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-800">Accuracy ranking</h3>
                    <InfoToggle
                      term="Average accuracy gap"
                      definition="Average difference versus Equal across the same scenarios for all methods."
                      interpretation="Lower is better. Zero means the same accuracy as Equal."
                      axes={{ x: 'difference vs Equal', y: 'method' }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mb-1 leading-relaxed">
                    <strong>How results are generated:</strong> the same sequence of scenarios is used for all four methods, then outcomes are averaged over{' '}
                    {expAccuracyDisplay[0]?.n != null ? `${expAccuracyDisplay[0].n} scenarios` : 'all scenarios'}.
                    {expBestCore && <> <strong>Current top method:</strong> {expBestCore.label}.</>}
                    {expMechVsSkillX1e4 != null && (
                      <> Skill\u00d7stake is{' '}
                        <span className="font-mono">{expMechVsSkillX1e4 >= 0 ? '+' : ''}{expMechVsSkillX1e4.toFixed(2)}</span>
                        {' points'} vs skill-only.
                      </>
                    )}
                  </p>
                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[11px] font-semibold text-slate-700 mb-2">Ranking at a glance</div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      {expAccuracyDisplay.map((d, i) => (
                        <div key={`rank-${d.method}`} className="rounded-md border border-slate-200 bg-white px-2.5 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-semibold text-slate-500">#{i + 1}</span>
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                          </div>
                          <div className="text-[11px] font-medium text-slate-800 mt-1 truncate">{d.name}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-1">
                            {d.deltaCrpsX1e4 >= 0 ? '+' : ''}{d.deltaLabel} points
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">Lower values indicate better average accuracy.</p>
                  </div>
                  <div className="mt-4">
                    <div className="text-[11px] font-semibold text-slate-600 mb-2">Method comparison (vs Equal)</div>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={expAccuracyDisplay} layout="vertical" margin={{ top: 4, right: 52, bottom: 4, left: 8 }}>
                        <CartesianGrid {...GRID_PROPS} />
                        <XAxis type="number" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                        <YAxis type="category" dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE} width={140} />
                        <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="4 4" />
                        <Tooltip
                          formatter={(value) => [
                            `${Number.isFinite(Number(value)) ? Number(value).toFixed(2) : '—'} points`,
                            'Difference vs Equal',
                          ]}
                          contentStyle={TOOLTIP_STYLE}
                        />
                        <Bar dataKey="deltaCrpsX1e4" radius={[0, 4, 4, 0]} maxBarSize={30}>
                          {expAccuracyDisplay.map((d) => <Cell key={d.method} fill={d.color} opacity={0.9} />)}
                          <LabelList dataKey="deltaLabel" position="right" style={{ fontSize: 10, fill: '#64748b' }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
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
                  Calibration data is not available in this view.
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
                  Robustness comparison data is not available in this view.
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
                {demoMethods.map((m) => (
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
                  <strong>Verdict:</strong> {demoBest.label} is best ({fmt(demoBest.pipeline.summary.meanError, 4)} mean error).
                  {demoDelta < 0 ? ` Skill \u00d7 stake beats equal by ${fmt(Math.abs(demoDelta), 4)}.` : ' Equal weights match or lead.'}
                </p>
                <div className="cursor-crosshair" role="img" aria-label="Forecast quality by method">
                  <ResponsiveContainer width="100%" height={360}>
                    <LineChart data={demoCumError} margin={CHART_MARGIN_LABELED}
                      onMouseDown={cumErrorZoom.onMouseDown} onMouseMove={cumErrorZoom.onMouseMove} onMouseUp={cumErrorZoom.onMouseUp}>
                      <CartesianGrid {...GRID_PROPS} />
                      <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[cumErrorZoom.state.left, cumErrorZoom.state.right]} />
                      <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                      <Tooltip content={<SmartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                      {demoMethods.map((m) => enabledMethods[m.key] && (
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

      </div>
    </div>
  );
}
