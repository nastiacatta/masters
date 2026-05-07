/**
 * WagerAllocationPanel — Effective wager breakdown, weight distribution,
 * deposit policy comparison, concentration metrics, and textual explanation
 * for the audit page.
 */

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useAuditData } from '@/hooks/useAuditData';
import { giniCoefficient, effectiveN } from '@/lib/audit/auditUtils';
import { FORECASTER_COLOURS, PALETTE } from '@/lib/palette';

function getColour(name: string): string {
  return FORECASTER_COLOURS[name] ?? PALETTE.slate;
}

// ════════════════════════════════════════════════════════════════════════════

export default function WagerAllocationPanel() {
  const { comparison, depositSensitivity } = useAuditData();

  const steadyState = useMemo(() => comparison?.steady_state ?? [], [comparison]);

  // ── Effective wager data (deposit + skill gate) ────────────────
  const wagerBarData = useMemo(() => {
    return [...steadyState]
      .sort((a, b) => b.mean_weight - a.mean_weight)
      .map((s) => ({
        name: s.forecaster,
        deposit: 1.0, // normalised base deposit
        skillGate: s.mean_sigma,
        totalWeight: s.mean_weight,
      }));
  }, [steadyState]);

  // ── Normalised weights ─────────────────────────────────────────
  const weightData = useMemo(() => {
    const totalWeight = steadyState.reduce((s, v) => s + v.mean_weight, 0);
    if (totalWeight === 0) return [];
    return [...steadyState]
      .sort((a, b) => b.mean_weight - a.mean_weight)
      .map((s) => ({
        name: s.forecaster,
        weight: s.mean_weight / totalWeight,
        fill: getColour(s.forecaster),
      }));
  }, [steadyState]);

  // ── Concentration metrics ──────────────────────────────────────
  const weights = steadyState.map((s) => s.mean_weight);
  const gini = giniCoefficient(weights);
  const nEff = effectiveN(weights);

  // ── Deposit policy comparison ──────────────────────────────────
  const depositPolicies = useMemo(() => {
    if (!depositSensitivity?.deposit_sensitivity) return [];
    const ds = depositSensitivity.deposit_sensitivity;
    return Object.entries(ds).map(([policy, data]) => ({
      policy: policy.charAt(0).toUpperCase() + policy.slice(1),
      uniform: data.uniform,
      skill: data.skill,
      mechanism: data.mechanism,
      gini: giniCoefficient([data.uniform, data.skill, data.mechanism]),
      nEff: effectiveN([data.uniform, data.skill, data.mechanism]),
    }));
  }, [depositSensitivity]);

  // ── Per-policy Gini and N_eff from deposit sensitivity ─────────
  const policyMetrics = useMemo(() => {
    if (!depositSensitivity?.deposit_sensitivity) return [];
    const ds = depositSensitivity.deposit_sensitivity;
    return Object.entries(ds).map(([policy, data]) => ({
      policy: policy.charAt(0).toUpperCase() + policy.slice(1),
      deltaMech: data.delta_mech,
      pctMech: data.pct_mech,
      deltaSk: data.delta_skill,
      pctSk: data.pct_skill,
    }));
  }, [depositSensitivity]);

  if (!comparison) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
        <p className="text-sm text-slate-400">
          Wager allocation data unavailable — comparison.json could not be
          loaded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ── High-concentration warning ───────────────────────────── */}
      {gini > 0.5 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-medium text-amber-800">
            ⚠ High concentration warning: Gini coefficient is{' '}
            {gini.toFixed(3)} (&gt; 0.5). Wager allocation is heavily
            concentrated on a few forecasters.
          </p>
        </div>
      )}

      {/* ── Effective wager stacked bar chart ────────────────────── */}
      <section className="space-y-4">
        <h2 className="panel-heading">
          Effective Wager Breakdown
        </h2>
        <p className="text-xs text-slate-500">
          Each forecaster&apos;s effective wager m<sub>i</sub> = b<sub>i</sub> &middot; g(σ<sub>i</sub>) decomposes into a deposit b<sub>i</sub> (held constant here, normalised to 1) and a skill-gate factor g(σ<sub>i</sub>). The stacked bars show the two contributions side by side so it is clear how much of each forecaster&apos;s weight comes from their deposit versus their skill estimate.
        </p>
        {wagerBarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={wagerBarData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={PALETTE.border}
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: PALETTE.slate }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: PALETTE.charcoal }}
                tickLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: `1px solid ${PALETTE.border}`,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="deposit"
                stackId="wager"
                fill={PALETTE.slate}
                name="Deposit"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="skillGate"
                stackId="wager"
                fill={PALETTE.teal}
                name="Skill Gate (σ)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            Steady-state data not available.
          </p>
        )}
      </section>

      {/* ── Normalised weight chart ──────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="panel-heading">
          Normalised Weights
        </h2>
        <p className="text-xs text-slate-500">
          w<sub>i</sub> = m<sub>i</sub> / Σ<sub>j</sub> m<sub>j</sub> &mdash; the fraction of the total effective wager held by each forecaster. These are the weights the mechanism puts on each forecaster in the aggregate.
        </p>
        {weightData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weightData} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={PALETTE.border}
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 1]}
                tick={{ fontSize: 10, fill: PALETTE.slate }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: PALETTE.charcoal }}
                tickLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: `1px solid ${PALETTE.border}`,
                }}
                formatter={(value: unknown) => (Number(value) * 100).toFixed(1) + '%'}
              />
              <Bar
                dataKey="weight"
                fill={PALETTE.teal}
                radius={[0, 4, 4, 0]}
                name="Weight"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            Weight data not available.
          </p>
        )}
      </section>

      {/* ── Concentration metrics ────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="panel-heading">
          Concentration Metrics
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              Gini Coefficient
            </p>
            <p
              className={`text-2xl font-bold mt-1 ${
                gini > 0.5 ? 'text-amber-600' : 'text-slate-800'
              }`}
            >
              {gini.toFixed(3)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              0 = equal, 1 = maximally concentrated
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              Effective N
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              {nEff.toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              of {steadyState.length} forecasters
            </p>
          </div>
        </div>
      </section>

      {/* ── Deposit policy comparison ────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="panel-heading">
          Deposit Policy Comparison
        </h2>
        {depositPolicies.length > 0 ? (
          <>
            <p className="text-xs text-slate-500">
              Mean CRPS under three deposit policies &mdash; fixed, exponential, and bankroll-fraction &mdash; under equal weighting, pure-skill weighting, and the full skill &times; stake mechanism. Lower is better. The chart uses the pre-audit deposit-sensitivity pipeline, so absolute CRPS values are on an earlier normalisation than the headline comparison; the ordering between policies is the durable finding.
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={depositPolicies}>
                <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.border} />
                <XAxis
                  dataKey="policy"
                  tick={{ fontSize: 11, fill: PALETTE.charcoal }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: PALETTE.slate }}
                  tickLine={false}
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 11,
                    borderRadius: 8,
                    border: `1px solid ${PALETTE.border}`,
                  }}
                  formatter={(value: unknown) => Number(value).toFixed(4)}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  dataKey="uniform"
                  fill={PALETTE.slate}
                  name="Uniform"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="skill"
                  fill={PALETTE.purple}
                  name="Skill"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="mechanism"
                  fill={PALETTE.teal}
                  name="Mechanism"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Per-policy metrics table */}
            {policyMetrics.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Policy
                      </th>
                      <th className="text-right py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Δ Mechanism
                      </th>
                      <th className="text-right py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        % Mechanism
                      </th>
                      <th className="text-right py-2 pr-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Δ Skill
                      </th>
                      <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        % Skill
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {policyMetrics.map((row) => (
                      <tr
                        key={row.policy}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-2 pr-4 text-slate-800 font-medium">
                          {row.policy}
                        </td>
                        <td className="py-2 pr-4 text-right text-slate-700 tabular-nums">
                          {row.deltaMech.toFixed(4)}
                        </td>
                        <td className="py-2 pr-4 text-right text-slate-700 tabular-nums">
                          {row.pctMech.toFixed(1)}%
                        </td>
                        <td className="py-2 pr-4 text-right text-slate-700 tabular-nums">
                          {row.deltaSk.toFixed(4)}
                        </td>
                        <td className="py-2 text-right text-slate-700 tabular-nums">
                          {row.pctSk.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            Deposit sensitivity data not available.
          </p>
        )}
      </section>

      {/* ── Textual explanation ───────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="panel-heading">
          Why fixed deposits give the mechanism the most headroom
        </h2>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
          <p className="text-xs text-slate-600 leading-relaxed">
            Fixed deposits work well because they keep every forecaster participating at the same scale. With exponential deposits, small wealth differences compound into very different stake sizes, so poorly-performing forecasters quickly contribute a negligible share of the effective wager and effectively exit the mechanism. Bankroll-fraction deposits are milder but still create a feedback loop: poor performance reduces deposits, which reduces influence, which prevents recovery.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            With fixed deposits, only the skill gate g(σ) differentiates forecasters, so the mechanism can separate skill cleanly from wealth dynamics. The split between a deposit layer (which controls participation) and a skill layer (which controls weighting) is what makes the mechanism&apos;s aggregation robust: every forecaster keeps contributing a signal, and the mechanism re-weights them on the basis of accuracy rather than bankroll.
          </p>
        </div>
      </section>
    </div>
  );
}
