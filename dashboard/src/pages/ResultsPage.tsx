import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
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
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: p.color }}
            />
            <span className="text-slate-500">{p.name}</span>
            <span className="font-mono font-medium ml-auto">{fmt(p.value, 4)}</span>
          </div>
        ))}
    </div>
  );
}

function AnswerCard({
  title,
  metric,
  metricLabel,
  verdict,
  interpretation,
  caveat,
}: {
  title: string;
  metric: string;
  metricLabel: string;
  verdict: Verdict;
  interpretation: string;
  caveat: string;
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

type EvidenceTab = 'Accuracy' | 'Concentration' | 'Calibration' | 'Ablation';
const EVIDENCE_TABS: EvidenceTab[] = ['Accuracy', 'Concentration', 'Calibration', 'Ablation'];

const METHOD_LABEL: Record<string, string> = {
  uniform: 'Equal',
  deposit: 'Stake-only',
  skill: 'Skill-only',
  mechanism: 'Skill × stake',
  best_single: 'Best single',
};

const METHOD_COLOR: Record<string, string> = {
  uniform: '#94a3b8',
  deposit: '#0d9488',
  skill: '#8b5cf6',
  mechanism: '#6366f1',
  best_single: '#f59e0b',
};

function meanFinite(values: Array<number | undefined | null>): number | null {
  const xs = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState<EvidenceTab>('Accuracy');
  const [howToReadOpen, setHowToReadOpen] = useState(false);

  const [masterRows, setMasterRows] = useState<MasterComparisonRow[]>([]);
  const [ablationRows, setAblationRows] = useState<BankrollAblationRow[]>([]);
  const [calibration, setCalibration] = useState<CalibrationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [missingData, setMissingData] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setMissingData(false);
      try {
        const [master, ablation, exps] = await Promise.all([
          loadMasterComparison(),
          loadBankrollAblation(),
          loadExperimentList(),
        ]);

        const calibrationExp = exps.find((e: ExperimentMeta) => e.name === 'calibration');
        const cal = calibrationExp ? await loadCalibration(calibrationExp) : [];

        if (cancelled) return;
        setMasterRows(master?.rows ?? []);
        setAblationRows(ablation?.rows ?? []);
        setCalibration(cal);
      } catch {
        if (!cancelled) setMissingData(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const defaultExperiment = masterRows[0]?.experiment;

  const rows = useMemo(() => {
    if (!defaultExperiment) return [];
    return masterRows.filter((r) => r.experiment === defaultExperiment);
  }, [masterRows, defaultExperiment]);

  const methodAgg = useMemo(() => {
    const byMethod = new Map<string, MasterComparisonRow[]>();
    for (const r of rows) {
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
  }, [rows]);

  const mechanism = methodAgg.find((m) => m.method === 'mechanism') ?? null;
  const deltaCrps = mechanism?.deltaCrps ?? null;
  const finalGini = mechanism?.finalGini ?? null;

  const accuracyVerdict: Verdict =
    deltaCrps == null ? 'neutral' : deltaCrps < -0.001 ? 'good' : deltaCrps > 0.001 ? 'bad' : 'neutral';

  const concentrationVerdict: Verdict =
    finalGini == null ? 'neutral' : finalGini < 0.55 ? 'good' : finalGini > 0.7 ? 'bad' : 'neutral';

  const accuracyBarData = useMemo(() => {
    return [...methodAgg]
      .filter((m) => m.deltaCrps != null)
      .sort((a, b) => (a.deltaCrps ?? 0) - (b.deltaCrps ?? 0))
      .map((m) => ({
        name: m.label,
        method: m.method,
        deltaCrps: m.deltaCrps as number,
        color: m.color,
      }));
  }, [methodAgg]);

  const giniBarData = useMemo(() => {
    return [...methodAgg]
      .filter((m) => m.finalGini != null)
      .sort((a, b) => (a.finalGini ?? 0) - (b.finalGini ?? 0))
      .map((m) => ({
        name: m.label,
        method: m.method,
        finalGini: m.finalGini as number,
        color: m.color,
      }));
  }, [methodAgg]);

  const influenceBarData = useMemo(() => {
    return [...methodAgg]
      .filter((m) => m.meanHHI != null || m.meanNEff != null)
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((m) => ({
        name: m.label,
        method: m.method,
        meanHHI: m.meanHHI ?? null,
        meanNEff: m.meanNEff ?? null,
      }));
  }, [methodAgg]);

  const calibrationData = useMemo(() => {
    return calibration
      .filter((p) => Number.isFinite(p.tau) && Number.isFinite(p.pHat))
      .map((p) => ({ tau: p.tau, pHat: p.pHat, ideal: p.tau, nValid: p.nValid }))
      .sort((a, b) => a.tau - b.tau);
  }, [calibration]);

  const ablationData = useMemo(() => {
    return [...ablationRows].slice().sort((a, b) => a.delta_crps_vs_full - b.delta_crps_vs_full);
  }, [ablationRows]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Main results</h1>
          <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
            Evidence from pre-run experiment outputs. This page does not use the live walkthrough state.
          </p>
        </div>

        {missingData && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] text-amber-900 leading-relaxed">
            <strong>Data not found.</strong> Link or copy experiment outputs into{' '}
            <code className="bg-amber-100 px-1 rounded">dashboard/public/data</code>. Run{' '}
            <code className="bg-amber-100 px-1 rounded">./scripts/link-dashboard-data.sh</code> from repo root.
          </div>
        )}

        <section aria-label="Headline answers">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Headline answers</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <AnswerCard
              title="Does skill improve accuracy?"
              metric={deltaCrps == null ? '—' : `${deltaCrps >= 0 ? '+' : ''}${fmt(deltaCrps, 4)}`}
              metricLabel="ΔCRPS vs equal (mechanism)"
              verdict={accuracyVerdict}
              interpretation={
                deltaCrps == null
                  ? 'Master comparison data not loaded yet.'
                  : deltaCrps < 0
                    ? 'Skill × stake improves accuracy relative to equal weights in this benchmark.'
                    : 'Equal weights match or beat Skill × stake in this benchmark.'
              }
              caveat="Health checks live on Robustness; this page reports benchmark evidence only."
            />
            <AnswerCard
              title="Does wealth dominate?"
              metric={finalGini == null ? '—' : fmt(finalGini, 3)}
              metricLabel="Final Gini (mechanism)"
              verdict={concentrationVerdict}
              interpretation="Concentration is assessed via Gini, HHI, and N_eff under the benchmark configuration."
              caveat="Concentration depends on DGP and deposit policy; interpret alongside ablations."
            />
          </div>
        </section>

        <section>
          <button
            type="button"
            onClick={() => setHowToReadOpen(!howToReadOpen)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span className={`transition-transform ${howToReadOpen ? 'rotate-90' : ''}`}>&#x25B6;</span>
            How to read the results
          </button>
          {howToReadOpen && (
            <div className="mt-3 grid sm:grid-cols-4 gap-3">
              {([
                ['Benchmark', 'The canonical configuration that produced these outputs (DGP, T, N, seeds).'],
                ['Metric', 'CRPS and ΔCRPS for accuracy; Gini/HHI/N_eff for concentration; reliability for calibration.'],
                ['Comparison', 'Master comparison reports paired deltas vs equal.'],
                ['Takeaway', 'Use the one-line verdict above each tab.'],
              ] as const).map(([label, desc]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="text-[11px] font-semibold text-slate-700">{label}</div>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex gap-1 border-b border-slate-200 mb-5">
            {EVIDENCE_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-teal-500 text-teal-700'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              Loading experiment outputs…
            </div>
          )}

          {!loading && !missingData && activeTab === 'Accuracy' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-slate-800">Accuracy (ΔCRPS vs equal)</h3>
                <InfoToggle
                  term="ΔCRPS vs equal"
                  definition="Paired difference in mean CRPS relative to equal weighting."
                  interpretation="Negative values mean better accuracy than equal weights."
                  axes={{ x: 'method', y: 'ΔCRPS' }}
                />
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                <strong>Verdict:</strong> Skill × stake is favourable if its bar is below 0.
              </p>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={accuracyBarData} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
                  <Tooltip content={<SmartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                  <Bar dataKey="deltaCrps" name="ΔCRPS vs equal" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {accuracyBarData.map((d) => (
                      <Cell key={d.method} fill={d.color} opacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {!loading && !missingData && activeTab === 'Concentration' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-slate-800">Final Gini by method</h3>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={giniBarData} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
                    <CartesianGrid {...GRID_PROPS} />
                    <XAxis dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE} />
                    <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]} />
                    <Tooltip content={<SmartTooltip />} />
                    <Bar dataKey="finalGini" name="Final Gini" radius={[4, 4, 0, 0]} maxBarSize={36}>
                      {giniBarData.map((d) => (
                        <Cell key={d.method} fill={d.color} opacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-slate-800">HHI and N_eff by method</h3>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={influenceBarData} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
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

          {!loading && !missingData && activeTab === 'Calibration' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-slate-800">Calibration (reliability)</h3>
                <InfoToggle
                  term="Reliability diagram"
                  definition="Compares nominal quantile τ against empirical coverage p̂(τ)."
                  interpretation="Perfect calibration lies on the diagonal p̂ = τ."
                  axes={{ x: 'nominal τ', y: 'empirical p̂' }}
                />
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
                    <Line type="monotone" dataKey="ideal" name="Ideal (p̂=τ)" stroke="#94a3b8" strokeDasharray="4 4" dot={false} />
                    <Line type="monotone" dataKey="pHat" name="Empirical p̂" stroke="#0d9488" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {!loading && !missingData && activeTab === 'Ablation' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-slate-800">Bankroll ablation (ΔCRPS vs Full)</h3>
              </div>
              {ablationData.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-[11px] text-slate-600">
                  No ablation data found. Run the <code className="bg-slate-200 px-1 rounded">bankroll_ablation</code> experiment and link outputs.
                </div>
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
        </section>
      </div>
    </div>
  );
}

