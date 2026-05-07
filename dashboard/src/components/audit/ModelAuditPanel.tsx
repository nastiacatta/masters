/**
 * ModelAuditPanel — Per-model CRPS breakdown, regime analysis,
 * XGBoost deep dive, and model annotations for the audit page.
 */

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useAuditData } from '@/hooks/useAuditData';
import {
  computeForecasterStats,
  regimeBreakdown,
  rollingDifference,
  rowValue,
} from '@/lib/audit/auditUtils';
import {
  MODEL_ANNOTATIONS,
  XGBOOST_SUGGESTIONS,
} from '@/lib/audit/auditContent';

// ── Colour palette for forecasters ─────────────────────────────────────────

const FORECASTER_COLOURS: Record<string, string> = {
  Naive: '#64748b',
  'EWMA(5)': '#0ea5e9',
  'ARIMA(2,1,1)': '#8b5cf6',
  XGBoost: '#f59e0b',
  'Neural Net': '#ef4444',
  Theta: '#10b981',
  Ensemble: '#6366f1',
};

function getColour(name: string): string {
  return FORECASTER_COLOURS[name] ?? '#94a3b8';
}

// ════════════════════════════════════════════════════════════════════════════

export default function ModelAuditPanel() {
  const { comparison } = useAuditData();
  const [selectedForecaster, setSelectedForecaster] = useState<string>('all');

  const forecasters = useMemo(
    () => comparison?.config?.forecasters ?? comparison?.forecaster_names ?? [],
    [comparison],
  );

  const perAgentCrps = useMemo(() => comparison?.per_agent_crps ?? [], [comparison]);
  const perRound = useMemo(() => comparison?.per_round ?? [], [comparison]);
  const nRounds = perRound.length;

  // ── Derived metrics ────────────────────────────────────────────────
  const forecasterStats = useMemo(
    () => computeForecasterStats(perAgentCrps, forecasters),
    [perAgentCrps, forecasters],
  );

  const regimeData = useMemo(
    () => regimeBreakdown(perRound, perAgentCrps, forecasters),
    [perRound, perAgentCrps, forecasters],
  );

  // XGBoost deep-dive data
  // Forecaster names in comparison.json are the full display names
  // (e.g. 'Naive (last value)', 'EWMA (5)', 'Ensemble (Naive+EWMA)'),
  // not their short labels. Match by prefix to stay resilient to future
  // name changes.
  const findForecaster = (prefix: string): string | null =>
    forecasters.find((name) => name.startsWith(prefix)) ?? null;

  const xgbName = findForecaster('XGBoost');
  const naiveName = findForecaster('Naive');

  const xgbComparison = useMemo(() => {
    if (!forecasterStats.length) return [];
    const targetPrefixes = ['XGBoost', 'Naive', 'EWMA', 'Ensemble'];
    return targetPrefixes
      .map((prefix) => {
        const stat = forecasterStats.find((s) => s.forecaster.startsWith(prefix));
        return stat ? { name: stat.forecaster, meanCrps: stat.meanCrps } : null;
      })
      .filter(Boolean) as Array<{ name: string; meanCrps: number }>;
  }, [forecasterStats]);

  const rollingXgbNaive = useMemo(() => {
    if (!xgbName || !naiveName || perAgentCrps.length === 0) return [];
    const xgbSeries = perAgentCrps.map((row) =>
      rowValue(row, xgbName, forecasters, 'crps') ?? 0,
    );
    const naiveSeries = perAgentCrps.map((row) =>
      rowValue(row, naiveName, forecasters, 'crps') ?? 0,
    );
    return rollingDifference(xgbSeries, naiveSeries, 168);
  }, [perAgentCrps, forecasters, xgbName, naiveName]);

  // Per-round chart data
  const perRoundChartData = useMemo(() => {
    if (selectedForecaster === 'all') {
      return perAgentCrps.map((row, i) => ({ t: i, ...row }));
    }
    return perAgentCrps.map((row, i) => ({
      t: i,
      // Use rowValue so the series works with both name-keyed (new)
      // and indexed-keyed (legacy) per_agent_crps rows.
      [selectedForecaster]: rowValue(row, selectedForecaster, forecasters, 'crps'),
    }));
  }, [perAgentCrps, selectedForecaster, forecasters]);

  if (!comparison) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
        <p className="text-sm text-slate-400">
          Model audit data unavailable — comparison.json could not be loaded.
        </p>
      </div>
    );
  }

  const visibleForecasters =
    selectedForecaster === 'all' ? forecasters : [selectedForecaster];

  return (
    <div className="space-y-10">
      {/* ── Sample-size warning ──────────────────────────────────── */}
      {nRounds < 100 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-medium text-amber-800">
            ⚠ Sample size warning: Only {nRounds} evaluation rounds available.
            Results may be unreliable with fewer than 100 rounds.
          </p>
        </div>
      )}

      {/* ── Forecaster ranking table ─────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="panel-heading">
          Forecaster Ranking
        </h2>
        <p className="text-xs text-slate-500">
          Mean, median, and standard deviation of per-round CRPS across all
          evaluation rounds. Lower CRPS is better.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Forecaster
                </th>
                <th className="text-right py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Mean CRPS
                </th>
                <th className="text-right py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Median CRPS
                </th>
                <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Std CRPS
                </th>
              </tr>
            </thead>
            <tbody>
              {[...forecasterStats]
                .sort((a, b) => a.meanCrps - b.meanCrps)
                .map((row, i) => (
                  <tr
                    key={row.forecaster}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-2 pr-4 text-slate-400 text-xs">
                      {i + 1}
                    </td>
                    <td className="py-2 pr-4 text-slate-800 font-medium">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: getColour(row.forecaster) }}
                      />
                      {row.forecaster}
                    </td>
                    <td className="py-2 pr-4 text-right text-slate-700 tabular-nums">
                      {row.meanCrps.toFixed(4)}
                    </td>
                    <td className="py-2 pr-4 text-right text-slate-700 tabular-nums">
                      {row.medianCrps.toFixed(4)}
                    </td>
                    <td className="py-2 text-right text-slate-700 tabular-nums">
                      {row.stdCrps.toFixed(4)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Per-round CRPS time-series ───────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="panel-heading">
            Per-Round CRPS
          </h2>
          <select
            value={selectedForecaster}
            onChange={(e) => setSelectedForecaster(e.target.value)}
            className="text-xs border border-slate-200 rounded px-2 py-1 text-slate-600 bg-white"
          >
            <option value="all">All forecasters</option>
            {forecasters.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
        {perRoundChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={perRoundChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="t"
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
              />
              {visibleForecasters.map((f) => (
                <Line
                  key={f}
                  type="monotone"
                  dataKey={f}
                  stroke={getColour(f)}
                  dot={false}
                  strokeWidth={1.5}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-slate-400 py-8 text-center">
            Per-agent CRPS data not available.
          </p>
        )}
      </section>

      {/* ── Regime breakdown table ───────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="panel-heading">
          Regime Breakdown
        </h2>
        <p className="text-xs text-slate-500">
          CRPS split by wind regime: high-wind (top quartile of observed y) vs
          low-wind (bottom quartile).
        </p>
        {regimeData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Forecaster
                  </th>
                  <th className="text-right py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Overall
                  </th>
                  <th className="text-right py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    High Wind
                  </th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Low Wind
                  </th>
                </tr>
              </thead>
              <tbody>
                {regimeData
                  .sort((a, b) => a.meanCrps - b.meanCrps)
                  .map((row) => (
                    <tr
                      key={row.forecaster}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-2 pr-4 text-slate-800 font-medium">
                        {row.forecaster}
                      </td>
                      <td className="py-2 pr-4 text-right text-slate-700 tabular-nums">
                        {row.meanCrps.toFixed(4)}
                      </td>
                      <td className="py-2 pr-4 text-right text-slate-700 tabular-nums">
                        {Number.isFinite(row.highWindCrps)
                          ? row.highWindCrps.toFixed(4)
                          : '—'}
                      </td>
                      <td className="py-2 text-right text-slate-700 tabular-nums">
                        {Number.isFinite(row.lowWindCrps)
                          ? row.lowWindCrps.toFixed(4)
                          : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            Insufficient data for regime breakdown (need ≥ 4 rounds).
          </p>
        )}
      </section>

      {/* ── Model annotations ────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="panel-heading">
          Model Annotations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODEL_ANNOTATIONS.map((ann) => (
            <div
              key={ann.forecaster}
              className="rounded-lg border border-slate-200 bg-white p-4 space-y-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getColour(ann.forecaster) }}
                />
                <h3 className="text-sm font-semibold text-slate-900">
                  {ann.forecaster}
                </h3>
              </div>
              <p className="text-xs text-slate-700">
                <span className="font-medium text-slate-800">Strengths: </span>
                {ann.strengths}
              </p>
              <p className="text-xs text-slate-600">
                <span className="font-medium text-slate-700">
                  Weaknesses:{' '}
                </span>
                {ann.weaknesses}
              </p>
              <p className="text-xs text-slate-500">
                <span className="font-medium text-slate-600">Theory: </span>
                {ann.theoryNote}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── XGBoost Deep Dive ────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="panel-heading">
          XGBoost deep dive
        </h2>
        <p className="text-xs text-slate-500">
          On this 1h-ahead slice, XGBoost ranks first among the seven forecasters
          by mean CRPS and is correctly identified as top-skill by the EWMA
          layer. Its lead over the naive and ARIMA persistence baselines is
          modest, however, because wind power is strongly autocorrelated hour
          to hour, which makes a simple persistence forecast a strong
          benchmark. This section unpacks why the gap is small and where
          XGBoost can be improved.
        </p>

        {/* Comparison bar chart */}
        {xgbComparison.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">
              XGBoost versus key baselines
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={xgbComparison} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  tickLine={false}
                  width={90}
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
                  dataKey="meanCrps"
                  fill="#f59e0b"
                  radius={[0, 4, 4, 0]}
                  name="Mean CRPS"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Rolling CRPS difference chart */}
        {rollingXgbNaive.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700">
              Rolling CRPS difference (XGBoost &minus; Naive, 168-hour window)
            </h3>
            <p className="text-xs text-slate-500">
              Positive values mean XGBoost is worse than the naive persistence
              forecast in that window. A mostly-negative series means XGBoost
              is reliably ahead; any sustained positive excursion flags a
              period where it loses to the simple baseline.
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={rollingXgbNaive}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="t"
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
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="diff"
                  stroke="#f59e0b"
                  dot={false}
                  strokeWidth={1.5}
                  name="XGB − Naive"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Textual explanation */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
          <h3 className="text-sm font-semibold text-slate-800">
            Why the lead over persistence is narrow
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            At the 1h-ahead horizon, hourly wind power has an autocorrelation
            above 0.95, which makes the naive &ldquo;last-value&rdquo; forecast
            very hard to beat. XGBoost&apos;s lag-based features capture the
            same autocorrelation structure but also add estimation noise from
            the rolling 168-hour training window. That short window limits the
            effective sample size for learning stable non-linear patterns, and
            fitting separate pinball-loss quantile models can produce crossing
            quantiles that degrade CRPS. The result is that XGBoost does come
            out on top here, but only marginally.
          </p>
        </div>

        {/* Improvement suggestions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">
            Improvement suggestions
          </h3>
          {XGBOOST_SUGGESTIONS.map((sug) => (
            <div
              key={sug.id}
              className="rounded-lg border border-slate-200 bg-white p-4 space-y-1"
            >
              <h4 className="text-sm font-medium text-slate-800">
                {sug.title}
              </h4>
              <p className="text-xs text-slate-600">{sug.description}</p>
              {sug.reference && (
                <p className="text-[10px] text-slate-400">
                  Ref: {sug.reference}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
