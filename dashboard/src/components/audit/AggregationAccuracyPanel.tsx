/**
 * AggregationAccuracyPanel — Method comparison, oracle gap, Vitali OGD gap,
 * calibration reliability diagram, per-quantile CRPS, alternative approaches,
 * and Ranjan-Gneiting explanation for the audit page.
 */

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useAuditData } from '@/hooks/useAuditData';

// ── Static content ─────────────────────────────────────────────────────────

const ALTERNATIVE_APPROACHES = [
  {
    id: 'vitali-ogd',
    title: 'Per-quantile Online Gradient Descent (OGD) — Vitali et al.',
    description:
      'Learns a separate weight vector for each quantile level using online gradient descent, so the aggregation can adapt to forecasters that excel at different parts of the distribution.',
  },
  {
    id: 'kernel-pool',
    title: 'Kernel-embedded probabilistic forecast pooling (Bassetti et al.)',
    description:
      'Embeds each forecast in a reproducing kernel Hilbert space before pooling, preserving calibration properties that the linear pool destroys.',
  },
  {
    id: 'quasi-arith',
    title: 'Quasi-arithmetic pooling with a proper scoring rule',
    description:
      'Uses a generalised mean (logarithmic or power mean) in place of the arithmetic mean. Under certain conditions this preserves calibration.',
  },
  {
    id: 'recalibration',
    title: 'Empirical recalibration transform',
    description:
      'Post-processes the linear-pool CDF with a learned recalibration function (for example, isotonic regression on the probability integral transform) to correct systematic tail miscalibration.',
  },
];

// ── Method display names ───────────────────────────────────────────────────

const METHOD_LABELS: Record<string, string> = {
  uniform: 'Uniform',
  skill: 'Skill-weighted',
  mechanism: 'Mechanism',
  best_single: 'Best Single',
  inverse_variance: 'Inverse Variance',
  trimmed_mean: 'Trimmed Mean',
  median: 'Median',
  oracle: 'Oracle',
};

// ════════════════════════════════════════════════════════════════════════════

export default function AggregationAccuracyPanel() {
  const { comparison, baselines } = useAuditData();

  const comparisonRows = comparison?.rows ?? [];
  const calibration = comparison?.calibration ?? [];
  const baselineSummary = baselines?.summary ?? [];

  // ── Method comparison table (8 methods) ────────────────────────
  const methodTable = useMemo(() => {
    // Combine comparison rows and baselines summary
    const methods = new Map<string, { mean_crps: number; delta: number }>();

    // From comparison.json rows
    for (const row of comparisonRows) {
      methods.set(row.method, {
        mean_crps: row.mean_crps,
        delta: row.delta_crps_vs_equal,
      });
    }

    // From baselines.json summary (may add inverse_variance, trimmed_mean, median, oracle)
    for (const row of baselineSummary) {
      if (!methods.has(row.method)) {
        methods.set(row.method, {
          mean_crps: row.mean_crps,
          delta: row.delta_vs_uniform,
        });
      }
    }

    const targetOrder = [
      'uniform',
      'skill',
      'mechanism',
      'best_single',
      'inverse_variance',
      'trimmed_mean',
      'median',
      'oracle',
    ];

    return targetOrder
      .filter((m) => methods.has(m))
      .map((m) => ({
        method: m,
        label: METHOD_LABELS[m] ?? m,
        ...methods.get(m)!,
      }));
  }, [comparisonRows, baselineSummary]);

  // ── Oracle gap ─────────────────────────────────────────────────
  const oracleGap = useMemo(() => {
    const mechanism = methodTable.find((m) => m.method === 'mechanism');
    const oracle = methodTable.find((m) => m.method === 'oracle');
    if (!mechanism || !oracle || oracle.mean_crps === 0) return null;
    const gap =
      ((mechanism.mean_crps - oracle.mean_crps) / oracle.mean_crps) * 100;
    return { gap, mechanismCrps: mechanism.mean_crps, oracleCrps: oracle.mean_crps };
  }, [methodTable]);

  // ── Vitali OGD gap ─────────────────────────────────────────────
  const vitaliGap = useMemo(() => {
    const vitali = baselineSummary.find(
      (r) => r.method === 'vitali_ogd' || r.method === 'vitali',
    );
    const mechanism = baselineSummary.find((r) => r.method === 'mechanism');
    if (!vitali || !mechanism) return null;
    return {
      vitaliPct: vitali.pct_vs_uniform,
      mechanismPct: mechanism.pct_vs_uniform,
      gap: vitali.pct_vs_uniform - mechanism.pct_vs_uniform,
    };
  }, [baselineSummary]);

  // ── Calibration reliability diagram data ───────────────────────
  const calibrationData = useMemo(() => {
    return calibration.map((c) => ({
      nominal: c.nominal ?? c.tau,
      empirical: c.empirical,
      gap: c.gap,
    }));
  }, [calibration]);

  // ── Per-quantile CRPS data (from calibration gaps) ─────────────
  const perQuantileData = useMemo(() => {
    return calibration.map((c) => ({
      tau: (c.tau ?? c.nominal)?.toFixed(2),
      gap: Math.abs(c.gap),
    }));
  }, [calibration]);

  if (!comparison) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
        <p className="text-sm text-slate-400">
          Aggregation accuracy data unavailable — comparison.json could not be
          loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ── Method comparison table ──────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="panel-heading">
          Method Comparison
        </h2>
        <p className="text-xs text-slate-500">
          Mean CRPS for each aggregation method and the difference versus
          equal (uniform) weighting. Lower CRPS is better; a negative delta is
          an improvement over equal weighting.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="text-right py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Mean CRPS
                </th>
                <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Δ vs Uniform
                </th>
              </tr>
            </thead>
            <tbody>
              {methodTable.map((row) => (
                <tr
                  key={row.method}
                  className={`border-b border-slate-100 last:border-0 ${
                    row.method === 'mechanism'
                      ? 'bg-indigo-50'
                      : row.method === 'oracle'
                        ? 'bg-emerald-50'
                        : ''
                  }`}
                >
                  <td className="py-2 pr-4 text-slate-800 font-medium">
                    {row.label}
                  </td>
                  <td className="py-2 pr-4 text-right text-slate-700 tabular-nums">
                    {row.mean_crps.toFixed(4)}
                  </td>
                  <td
                    className={`py-2 text-right tabular-nums ${
                      row.delta < 0 ? 'text-emerald-600' : 'text-slate-600'
                    }`}
                  >
                    {row.delta > 0 ? '+' : ''}
                    {row.delta.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Oracle gap badge ──────────────────────────────────────── */}
      {oracleGap && (
        <section className="space-y-4">
          <h2 className="panel-heading">Oracle Gap</h2>
          <div className="flex items-center gap-4">
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${
                oracleGap.gap < 10
                  ? 'bg-emerald-100 text-emerald-800'
                  : oracleGap.gap < 25
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {oracleGap.gap.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500">
              Mechanism ({oracleGap.mechanismCrps.toFixed(4)}) vs Oracle (
              {oracleGap.oracleCrps.toFixed(4)})
            </span>
          </div>
        </section>
      )}

      {/* ── Vitali OGD gap comparison ────────────────────────────── */}
      {vitaliGap && (
        <section className="space-y-4">
          <h2 className="panel-heading">
            Vitali OGD Comparison
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Mechanism vs Uniform
              </p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {vitaliGap.mechanismPct.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">
                Vitali OGD vs Uniform
              </p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {vitaliGap.vitaliPct.toFixed(1)}%
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            The {Math.abs(vitaliGap.gap).toFixed(1)}-percentage-point gap
            represents the cost of using a single weight vector across all
            quantiles vs per-quantile adaptation.
          </p>
        </section>
      )}

      {/* ── Calibration reliability diagram ──────────────────────── */}
      <section className="space-y-4">
        <h2 className="panel-heading">
          Calibration Reliability Diagram
        </h2>
        <p className="text-xs text-slate-500">
          Probability integral transform (PIT) coverage by nominal quantile
          level. Perfect calibration tracks the 45° diagonal.
        </p>
        {calibrationData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={calibrationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="nominal"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                label={{
                  value: 'Nominal',
                  position: 'insideBottom',
                  offset: -5,
                  style: { fontSize: 10, fill: '#94a3b8' },
                }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                width={50}
                label={{
                  value: 'Empirical',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 10, fill: '#94a3b8' },
                }}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              />
              {/* Perfect calibration diagonal */}
              <ReferenceLine
                segment={[
                  { x: 0, y: 0 },
                  { x: 1, y: 1 },
                ]}
                stroke="#94a3b8"
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="empirical"
                stroke="#6366f1"
                dot={{ r: 3, fill: '#6366f1' }}
                strokeWidth={2}
                name="Empirical coverage"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-slate-400 py-8 text-center">
            Calibration data not available.
          </p>
        )}
      </section>

      {/* ── Per-quantile CRPS chart ──────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="panel-heading">
          Per-Quantile Calibration Gap
        </h2>
        <p className="text-xs text-slate-500">
          Absolute calibration gap |empirical − nominal| by quantile level τ.
        </p>
        {perQuantileData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={perQuantileData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="tau"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
                formatter={(value: unknown) => Number(value).toFixed(4)}
              />
              <Bar
                dataKey="gap"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                name="|Gap|"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            Per-quantile data not available.
          </p>
        )}
      </section>

      {/* ── Alternative approaches ───────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="panel-heading">
          Alternative Approaches
        </h2>
        <div className="space-y-3">
          {ALTERNATIVE_APPROACHES.map((approach) => (
            <div
              key={approach.id}
              className="rounded-lg border border-slate-200 bg-white p-4 space-y-1"
            >
              <h3 className="text-sm font-medium text-slate-800">
                {approach.title}
              </h3>
              <p className="text-xs text-slate-600">{approach.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ranjan-Gneiting explanation ──────────────────────────── */}
      <section className="space-y-4">
        <h2 className="panel-heading">
          Why the Linear Pool is Uncalibrated
        </h2>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
          <p className="text-xs text-slate-700 leading-relaxed">
            <span className="font-semibold">Ranjan &amp; Gneiting (2010)</span>{' '}
            proved that any nontrivial weighted average (linear pool) of
            individually calibrated probabilistic forecasts is itself
            uncalibrated. The pooled forecast is overdispersed in the centre
            and underdispersed in the tails.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            This is a fundamental limitation of the linear pooling this
            mechanism uses. The reliability diagram above is consistent with
            the theorem: central quantiles (0.25&ndash;0.75) are close to the
            diagonal, but the outer quantiles (0.1 and 0.9) show systematic
            coverage gaps of 3&ndash;5 percentage points. Post-hoc
            recalibration (for example, isotonic regression on the PIT) or a
            non-linear pooling method would be needed to close those gaps.
          </p>
        </div>
      </section>
    </div>
  );
}
