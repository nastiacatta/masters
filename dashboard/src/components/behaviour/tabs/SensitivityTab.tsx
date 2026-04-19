import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import ChartCard from '@/components/dashboard/ChartCard';
import MetricDisplay from '@/components/dashboard/MetricDisplay';
import {
  CHART_MARGIN_LABELED, GRID_PROPS, AXIS_TICK, AXIS_STROKE,
  fmt,
} from '@/components/lab/shared';
import { SmartTooltip } from '@/components/dashboard/SmartTooltip';
import MathBlock from '@/components/dashboard/MathBlock';
import { SEED, N, T, VERDICT_VARIANT } from '@/lib/behaviour/helpers';
import type { SweepPoint } from '@/hooks/useBehaviourSimulations';

export default function SensitivityTab({ data }: { data: SweepPoint[] }) {
  const best = data.reduce((a, b) => a.error < b.error ? a : b);
  const worst = data.reduce((a, b) => a.error > b.error ? a : b);
  const range = worst.error - best.error;
  const relRange = best.error > 0 ? (range / best.error * 100) : 0;
  const notBrittle = relRange < 30;

  const lams = [...new Set(data.map(d => d.lam))].sort((a, b) => a - b);
  const sigs = [...new Set(data.map(d => d.sig))].sort((a, b) => a - b);
  const sigColors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

  const barData = lams.map(lam => {
    const row: Record<string, number | string> = { lam: `λ=${lam}` };
    for (const sig of sigs) {
      const pt = data.find(d => d.lam === lam && d.sig === sig);
      if (pt) row[`σ=${sig}`] = pt.error;
    }
    return row;
  });

  // Seasonality data (previously its own tab, now included here)
  const SEASON_DATA = [
    { season: 'Winter', pct: 17.3, color: '#6366f1' },
    { season: 'Spring', pct: 14.3, color: '#0ea5e9' },
    { season: 'Autumn', pct: 14.6, color: '#f59e0b' },
    { season: 'Summer', pct: 11.8, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        The skill gate g(σ) = λ + (1−λ)σ^η has two key parameters.
        λ controls the floor (how much influence an unskilled agent retains).
        σ_min sets the minimum skill estimate. A robust mechanism should vary smoothly.
      </p>
      <MathBlock accent label="Skill gate" latex="g(\\sigma_i) = \\lambda + (1-\\lambda)\\,\\sigma_i^\\eta, \\quad \\sigma_i = \\sigma_{\\min} + (1-\\sigma_{\\min})\\,e^{-\\gamma L_i}" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricDisplay label="Brittle?" value={notBrittle ? 'No' : 'Yes'}
          detail={`Error varies ${relRange.toFixed(0)}% across ${data.length} configs`}
          variant={VERDICT_VARIANT[notBrittle ? 'good' : 'bad']} />
        <MetricDisplay label="Best" value={`λ=${best.lam}, σ=${best.sig}`} detail={`CRPS ${fmt(best.error, 4)}`} />
        <MetricDisplay label="Worst" value={`λ=${worst.lam}, σ=${worst.sig}`} detail={`CRPS ${fmt(worst.error, 4)}`} />
        <MetricDisplay label="Gini range" value={fmt(Math.max(...data.map(d => d.gini)) - Math.min(...data.map(d => d.gini)), 3)} />
      </div>

      <ChartCard title="Mean CRPS by λ and σ_min" subtitle={`${data.length} configs, ${T} rounds each. Lower is better.`} provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={barData} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="lam" tick={{ ...AXIS_TICK, fontSize: 12 }} stroke={AXIS_STROKE} />
            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
            <Tooltip content={<SmartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {sigs.map((sig, i) => (
              <Bar key={sig} dataKey={`σ=${sig}`} name={`σ_min=${sig}`}
                fill={sigColors[i % sigColors.length]} radius={[3, 3, 0, 0]} maxBarSize={20} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Seasonality section (folded in from old Seasonality tab) */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">Seasonal robustness (real data)</h3>
        <p className="text-sm text-slate-600">
          Wind patterns change across seasons. The EWMA skill layer adapts automatically —
          no explicit regime detection needed. Data: Elia Belgian offshore wind, 17,544 hourly points,
          5 forecasting models. All improvements significant (DM test, p &lt; 0.001).
        </p>
        <div className="grid sm:grid-cols-4 gap-3">
          {SEASON_DATA.map(s => (
            <div key={s.season} className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <div className="text-xs text-slate-400 font-medium">{s.season}</div>
              <div className="text-2xl font-bold font-mono mt-1" style={{ color: s.color }}>+{s.pct}%</div>
              <div className="text-[11px] text-slate-400 mt-1">vs equal weighting</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        Error varies smoothly — no cliff edges. λ = 0 (pure skill, no floor) performs worst because
        it gives zero influence to new agents. High σ_min reduces differentiation.
        The production config (λ = 0.3, σ_min = 0.1) is near-optimal.
        Winter gains are largest (+17.3%) because wind variability is highest and model quality
        differences are most pronounced.
      </div>
    </div>
  );
}
