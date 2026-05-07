/**
 * SkillAllocationPanel — Sigma bar chart, sigma trajectories,
 * rank correlation, convergence analysis, parameter comparison,
 * and indistinguishable skill warning for the audit page.
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
} from 'recharts';
import { useAuditData } from '@/hooks/useAuditData';
import {
  convergenceRound,
  spearmanRank,
  findIndistinguishable,
} from '@/lib/audit/auditUtils';

// ── Colour palette ─────────────────────────────────────────────────────────

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

export default function SkillAllocationPanel() {
  const { comparison } = useAuditData();

  const forecasters = useMemo(
    () => comparison?.config?.forecasters ?? comparison?.forecaster_names ?? [],
    [comparison],
  );

  const steadyState = useMemo(() => comparison?.steady_state ?? [], [comparison]);
  const skillHistory = useMemo(() => comparison?.skill_history ?? [], [comparison]);

  // ── Sigma bar chart data (sorted highest to lowest) ────────────
  const sigmaBarData = useMemo(() => {
    return [...steadyState]
      .sort((a, b) => b.mean_sigma - a.mean_sigma)
      .map((s) => ({
        name: s.forecaster,
        sigma: s.mean_sigma,
        fill: getColour(s.forecaster),
      }));
  }, [steadyState]);

  // ── Sigma trajectory chart data ────────────────────────────────
  const trajectoryData = useMemo(() => {
    return skillHistory.map((row, i) => ({ t: i, ...row }));
  }, [skillHistory]);

  // ── Rank correlation (Spearman ρ) ──────────────────────────────
  const rankCorrelation = useMemo(() => {
    if (steadyState.length < 2) return NaN;
    // Compare mean_sigma ordering vs mean_score ordering
    const sigmas = steadyState.map((s) => s.mean_sigma);
    const scores = steadyState.map((s) => s.mean_score ?? 0);
    return spearmanRank(sigmas, scores);
  }, [steadyState]);

  // ── Convergence analysis ───────────────────────────────────────
  const convergence = useMemo(
    () => convergenceRound(skillHistory, forecasters, 50),
    [skillHistory, forecasters],
  );

  // ── Indistinguishable skill pairs ──────────────────────────────
  const indistinguishablePairs = useMemo(() => {
    const entries = steadyState.map((s) => ({
      name: s.forecaster,
      sigma: s.mean_sigma,
    }));
    return findIndistinguishable(entries, 0.05);
  }, [steadyState]);

  if (!comparison) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
        <p className="text-sm text-slate-400">
          Skill allocation data unavailable — comparison.json could not be
          loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ── Indistinguishable skill warning ──────────────────────── */}
      {indistinguishablePairs.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-medium text-amber-800">
            ⚠ Indistinguishable skill estimates detected:
          </p>
          <ul className="mt-1 list-disc list-inside text-xs text-amber-700">
            {indistinguishablePairs.map((pair, i) => (
              <li key={i}>
                {pair.forecasterA} ↔ {pair.forecasterB} (|Δσ| ={' '}
                {pair.sigmaDiff.toFixed(4)})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── High-rho warning: skill averaging window too short for noise ─ */}
      {comparison?.config?.rho !== undefined && comparison.config.rho >= 0.3 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-xs font-medium text-amber-900">
            ⚠ EWMA learning rate ρ = {comparison.config.rho} may be too
            reactive for reliable skill ranking
          </p>
          <p className="mt-1 text-xs text-amber-800">
            The effective skill-averaging window is &asymp; 1 / ρ ={' '}
            {Math.round(1 / comparison.config.rho)} rounds. With per-round
            CRPS noise of order 0.05, the induced noise in the skill estimate
            is comparable to (or larger than) the CRPS gaps between the
            top forecasters on this dataset (roughly 0.002 to 0.005). The
            practical consequence is that the ordering of close-performing
            models (for example, XGBoost versus ARIMA) is not stable from
            round to round. A smaller ρ (around 0.05) gives stable rankings
            at the cost of slower adaptation to genuine quality changes.
          </p>
        </div>
      )}

      {/* ── Sigma bar chart ──────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="panel-heading">
          Steady-State Skill Estimates (σ)
        </h2>
        <p className="text-xs text-slate-500">
          Mean sigma values from the EWMA skill layer, sorted highest to
          lowest. Higher σ indicates greater estimated skill.
        </p>
        {sigmaBarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sigmaBarData} layout="vertical">
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
                width={100}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
                formatter={(value: unknown) => Number(value).toFixed(4)}
              />
              <Bar dataKey="sigma" radius={[0, 4, 4, 0]} name="Mean σ">
                {sigmaBarData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            Steady-state data not available.
          </p>
        )}
      </section>

      {/* ── Sigma trajectory chart ───────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="panel-heading">
          Skill Trajectories Over Time
        </h2>
        <p className="text-xs text-slate-500">
          Evolution of sigma estimates for all forecasters across evaluation
          rounds.
        </p>
        {trajectoryData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trajectoryData}>
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
              {forecasters.map((f) => (
                <Line
                  key={f}
                  type="monotone"
                  dataKey={f}
                  stroke={getColour(f)}
                  dot={false}
                  strokeWidth={1.5}
                  name={f}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-slate-400 py-8 text-center">
            Skill history not available.
          </p>
        )}
      </section>

      {/* ── Rank correlation badge ───────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="panel-heading">
          Rank Correlation
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Spearman ρ:</span>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold ${
                Number.isFinite(rankCorrelation) && rankCorrelation >= 0.9
                  ? 'bg-emerald-100 text-emerald-800'
                  : Number.isFinite(rankCorrelation) && rankCorrelation >= 0.7
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {Number.isFinite(rankCorrelation)
                ? rankCorrelation.toFixed(3)
                : 'N/A'}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {Number.isFinite(rankCorrelation) && rankCorrelation >= 0.9
              ? 'Strong agreement between skill estimates and actual scores'
              : Number.isFinite(rankCorrelation) && rankCorrelation >= 0.7
                ? 'Moderate agreement — skill estimates partially track actual performance'
                : 'Weak agreement — skill estimates may not reflect true quality'}
          </span>
        </div>
      </section>

      {/* ── Convergence analysis ─────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="panel-heading">
          Convergence Analysis
        </h2>
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
          {convergence.convergedAtRound !== null ? (
            <>
              <p className="text-sm text-slate-700">
                Rank ordering converged at round{' '}
                <span className="font-bold text-slate-900">
                  {convergence.convergedAtRound}
                </span>{' '}
                and remained stable for{' '}
                <span className="font-bold text-slate-900">
                  {convergence.stableForRounds}
                </span>{' '}
                consecutive rounds.
              </p>
              <p className="text-xs text-slate-500">
                Final ordering:{' '}
                {convergence.finalOrdering.join(' > ')}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-600">
              Rank ordering did not converge for 50 consecutive rounds.
              Longest stable streak:{' '}
              <span className="font-bold">{convergence.stableForRounds}</span>{' '}
              rounds.
            </p>
          )}
        </div>
      </section>

      {/* ── Parameter comparison ──────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="panel-heading">
          Parameter Comparison
        </h2>
        <p className="text-xs text-slate-500">
          Default vs tuned EWMA parameters. Aggressive parameters differentiate
          skill faster but may overreact to noise.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Parameter
                </th>
                <th className="text-right py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Default
                </th>
                <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tuned
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 pr-4 text-slate-700">
                  γ (skill sharpness)
                </td>
                <td className="py-2 pr-4 text-right text-slate-600 tabular-nums">
                  4
                </td>
                <td className="py-2 text-right text-slate-600 tabular-nums">
                  16
                </td>
              </tr>
              <tr className="border-b border-slate-100 last:border-0">
                <td className="py-2 pr-4 text-slate-700">
                  ρ (EWMA learning rate)
                </td>
                <td className="py-2 pr-4 text-right text-slate-600 tabular-nums">
                  0.1
                </td>
                <td className="py-2 text-right text-slate-600 tabular-nums">
                  0.5
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            The tuned parameters (γ = 16, ρ = 0.5) achieve better skill
            differentiation on the stable Elia wind dataset. Higher γ makes the
            loss-to-skill map σ = σ_min + (1−σ_min)·exp(−γL) steeper, so small
            differences in mean loss translate into larger σ gaps between
            high-skill and low-skill forecasters. Higher ρ makes the
            exponentially-weighted loss estimate L react more quickly to recent
            observations. The trade-off is noise: in the σ trajectories,
            occasional rank-order flips appear during regime transitions, which
            suggests the aggressive tuning also overreacts to short-term noise.
          </p>
        </div>
      </section>
    </div>
  );
}
