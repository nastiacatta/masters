import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { PipelineResult } from '@/lib/coreMechanism/runPipeline';
import { CHART_MARGIN_LABELED, GRID_PROPS, AXIS_TICK, AXIS_STROKE, TOOLTIP_STYLE, fmt, downsample } from './shared';

interface Props {
  pipeline: PipelineResult;
}

interface InvariantCheck {
  id: string;
  label: string;
  description: string;
  pass: boolean;
  detail: string;
  severity: 'critical' | 'warning' | 'info';
}

function SmartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string; dataKey: string }>; label?: number }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE}>
      <div className="font-medium text-slate-700 text-[11px] mb-1">Round {label}</div>
      {payload.filter(p => p.value != null).map((p) => (
        <div key={p.dataKey} className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}</span>
          <span className="font-mono font-medium ml-auto">{fmt(p.value, 6)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ValidationPanel({ pipeline }: Props) {
  const checks = useMemo((): InvariantCheck[] => {
    const traces = pipeline.traces;
    const EPS = 1e-6;
    const results: InvariantCheck[] = [];

    // 1. Weight normalization
    let weightViolations = 0;
    let worstWeightSum = 0;
    for (const t of traces) {
      if (t.activeCount === 0) continue;
      const wSum = t.weights.reduce((a, b) => a + b, 0);
      if (Math.abs(wSum - 1) > EPS) {
        weightViolations++;
        if (Math.abs(wSum - 1) > Math.abs(worstWeightSum - 1)) worstWeightSum = wSum;
      }
    }
    results.push({
      id: 'weights',
      label: 'Weight normalization',
      description: 'Σwᵢ = 1 for active agents each round',
      pass: weightViolations === 0,
      detail: weightViolations === 0
        ? `All ${traces.length} rounds: Σwᵢ = 1.000 ± ${EPS}`
        : `${weightViolations} violations. Worst: Σw = ${worstWeightSum.toFixed(6)}`,
      severity: 'critical',
    });

    // 2. Non-negative wealth
    let wealthViolations = 0;
    let minWealth = Infinity;
    for (const t of traces) {
      for (const w of t.wealth_after) {
        if (w < -EPS) { wealthViolations++; minWealth = Math.min(minWealth, w); }
      }
    }
    results.push({
      id: 'wealth',
      label: 'Non-negative wealth',
      description: 'Wᵢ ≥ 0 for all agents at all times',
      pass: wealthViolations === 0,
      detail: wealthViolations === 0
        ? 'All wealth values non-negative across all rounds'
        : `${wealthViolations} violations. Min wealth: ${minWealth.toFixed(4)}`,
      severity: 'critical',
    });

    // 3. Score bounds
    let scoreViolations = 0;
    for (const t of traces) {
      for (let i = 0; i < t.scores.length; i++) {
        if (t.participated[i] && (t.scores[i] < -EPS || t.scores[i] > 1 + EPS)) {
          scoreViolations++;
        }
      }
    }
    results.push({
      id: 'scores',
      label: 'Score bounds',
      description: '0 ≤ sᵢ ≤ 1 for all participating agents',
      pass: scoreViolations === 0,
      detail: scoreViolations === 0
        ? 'All scores within [0, 1] bounds'
        : `${scoreViolations} out-of-bounds scores detected`,
      severity: 'critical',
    });

    // 4. Skill bounds
    let skillViolations = 0;
    const sigmaMin = pipeline.params.sigma_min;
    for (const t of traces) {
      for (const s of t.sigma_new) {
        if (s < sigmaMin - EPS || s > 1 + EPS) skillViolations++;
      }
    }
    results.push({
      id: 'skill',
      label: 'Skill bounds',
      description: `σ_min (${sigmaMin}) ≤ σᵢ ≤ 1 for all agents`,
      pass: skillViolations === 0,
      detail: skillViolations === 0
        ? `All σ values within [${sigmaMin}, 1]`
        : `${skillViolations} violations detected`,
      severity: 'warning',
    });

    // 5. Deposit feasibility
    let depositViolations = 0;
    for (const t of traces) {
      for (let i = 0; i < t.deposits.length; i++) {
        if (t.deposits[i] > t.wealth_before[i] + EPS) depositViolations++;
        if (t.deposits[i] < -EPS) depositViolations++;
      }
    }
    results.push({
      id: 'deposits',
      label: 'Deposit feasibility',
      description: '0 ≤ bᵢ ≤ Wᵢ — agents cannot deposit more than their wealth',
      pass: depositViolations === 0,
      detail: depositViolations === 0
        ? 'All deposits feasible (within agent wealth)'
        : `${depositViolations} infeasible deposits detected`,
      severity: 'critical',
    });

    // 6. Participation masking
    let maskViolations = 0;
    for (const t of traces) {
      for (let i = 0; i < t.participated.length; i++) {
        if (!t.participated[i] && t.effectiveWager[i] > EPS) maskViolations++;
      }
    }
    results.push({
      id: 'masking',
      label: 'Participation masking',
      description: 'Absent agents have zero influence mᵢ = 0',
      pass: maskViolations === 0,
      detail: maskViolations === 0
        ? 'All absent agents correctly masked'
        : `${maskViolations} violations: absent agents with non-zero influence`,
      severity: 'critical',
    });

    // 7. EWMA consistency
    let ewmaViolations = 0;
    for (let r = 1; r < traces.length; r++) {
      const prev = traces[r - 1];
      const curr = traces[r];
      for (let i = 0; i < curr.L_prev.length; i++) {
        const expectedL = prev.L_new[i];
        if (Math.abs(curr.L_prev[i] - expectedL) > EPS) ewmaViolations++;
      }
    }
    results.push({
      id: 'ewma',
      label: 'EWMA continuity',
      description: 'L_{i,t} at round start equals L_{i,t-1} at previous round end',
      pass: ewmaViolations === 0,
      detail: ewmaViolations === 0
        ? 'Loss state perfectly continuous across rounds'
        : `${ewmaViolations} discontinuities in loss tracking`,
      severity: 'warning',
    });

    return results;
  }, [pipeline]);

  const passCount = checks.filter((c) => c.pass).length;
  const totalChecks = checks.length;
  const allPass = passCount === totalChecks;

  // Budget gap time series
  const budgetData = useMemo(() => {
    return downsample(
      pipeline.traces.map((t, i) => {
        const totalIn = t.effectiveWager.reduce((a, b) => a + b, 0);
        const totalOut = t.totalPayoff.reduce((a, b) => a + b, 0);
        return {
          round: i + 1,
          gap: totalOut - totalIn,
          totalIn,
          totalOut,
        };
      }),
      300,
    );
  }, [pipeline.traces]);

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className={`rounded-xl border-2 p-5 ${allPass ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${allPass ? 'bg-emerald-100' : 'bg-red-100'}`}>
            {allPass ? '✓' : '✗'}
          </div>
          <div>
            <h3 className={`text-lg font-bold ${allPass ? 'text-emerald-800' : 'text-red-800'}`}>
              {allPass ? 'All invariants pass' : `${totalChecks - passCount} invariant${totalChecks - passCount > 1 ? 's' : ''} failed`}
            </h3>
            <p className="text-sm text-slate-600">
              {passCount} / {totalChecks} checks passed across {pipeline.traces.length} rounds
            </p>
          </div>
        </div>
      </div>

      {/* Invariant check cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {checks.map((check, idx) => (
          <motion.div
            key={check.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`rounded-xl border p-4 ${
              check.pass
                ? 'bg-white border-emerald-200'
                : check.severity === 'critical'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5 ${
                check.pass ? 'bg-emerald-100 text-emerald-700' : check.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {check.pass ? '✓' : '✗'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-800">{check.label}</h4>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                    check.severity === 'critical' ? 'bg-red-100 text-red-600' : check.severity === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {check.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{check.description}</p>
                <p className={`text-xs font-medium mt-1.5 ${check.pass ? 'text-emerald-700' : 'text-red-700'}`}>
                  {check.detail}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Budget balance chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h4 className="text-sm font-semibold text-slate-800">Budget balance over time</h4>
        <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
          Gap = total payout − total influence per round (should be near 0). Hover for values.
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={budgetData} margin={CHART_MARGIN_LABELED}>
            <defs>
              <linearGradient id="budgetGradPos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="budgetGradNeg" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
              label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
              label={{ value: 'Budget gap', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
            <Tooltip content={<SmartTooltip />} />
            <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1.5} />
            <Area
              type="monotone"
              dataKey="gap"
              name="Budget gap"
              stroke="#6366f1"
              fill="url(#budgetGradPos)"
              strokeWidth={1.5}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
