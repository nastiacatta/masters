import { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { useExperimentData } from '@/lib/useExperimentData';
import PageHeader from '@/components/dashboard/PageHeader';
import TabGroup from '@/components/dashboard/TabGroup';
import ForecastQualityChart from '@/components/charts/ForecastQualityChart';
import CalibrationChart from '@/components/charts/CalibrationChart';
import SweepHeatmap from '@/components/charts/SweepHeatmap';
import ChartCard from '@/components/dashboard/ChartCard';
import MetricCard from '@/components/dashboard/MetricCard';
import { fmtNum, fmtPct } from '@/lib/formatters';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';

const diagTabs = [
  { id: 'forecast', label: 'Forecast Quality' },
  { id: 'calibration', label: 'Calibration' },
  { id: 'intermittency', label: 'Intermittency' },
  { id: 'robustness', label: 'Robustness' },
];

export default function Diagnostics() {
  const { selectedExperiment } = useStore();
  const { forecastSeries, calibrationData, skillWagerData, sweepData, loading } = useExperimentData();
  const [activeTab, setActiveTab] = useState('forecast');
  const nAgents = selectedExperiment?.nAgents ?? 6;

  const activePerRound = useMemo(() => {
    const rounds: Record<number, { total: number; active: number }> = {};
    for (const d of skillWagerData) {
      if (!rounds[d.t]) rounds[d.t] = { total: 0, active: 0 };
      rounds[d.t].total++;
      if (!d.missing) rounds[d.t].active++;
    }
    return Object.entries(rounds).map(([t, v]) => ({
      t: Number(t),
      activeRate: v.active / v.total,
      activeCount: v.active,
    }));
  }, [skillWagerData]);

  const sampled = activePerRound.length > 200
    ? activePerRound.filter((_, i) => i % Math.ceil(activePerRound.length / 200) === 0)
    : activePerRound;

  const avgCalError = calibrationData.length > 0
    ? calibrationData.reduce((s, d) => s + Math.abs(d.pHat - d.tau), 0) / calibrationData.length
    : 0;

  const lastForecast = forecastSeries[forecastSeries.length - 1];

  if (loading) {
    return <div className="p-8"><p className="text-slate-400">Loading…</p></div>;
  }

  return (
    <div className="p-6 max-w-7xl">
      <PageHeader
        title="Diagnostics"
        description="Detailed diagnostic panels supporting the thesis claims: forecast quality, calibration, intermittency, and robustness to strategic behaviour."
      />

      <TabGroup tabs={diagTabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'forecast' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <MetricCard label="Final Cum. CRPS (Mechanism)" value={fmtNum(lastForecast?.crpsMechanismCum, 5)} accent />
            <MetricCard label="Final Cum. CRPS (Equal)" value={fmtNum(lastForecast?.crpsUniformCum, 5)} />
            <MetricCard label="Final Cum. CRPS (Skill)" value={fmtNum(lastForecast?.crpsSkillCum, 5)} />
            <MetricCard
              label="Improvement vs Equal"
              value={lastForecast ? fmtPct(1 - lastForecast.crpsMechanismCum / (lastForecast.crpsUniformCum || 1)) : '—'}
            />
          </div>
          <ForecastQualityChart data={forecastSeries} />
        </div>
      )}

      {activeTab === 'calibration' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <MetricCard label="Avg Calibration Error" value={fmtNum(avgCalError, 4)} />
            <MetricCard label="Quantiles Tested" value={String(calibrationData.length)} />
            <MetricCard label="Observations per τ" value={String(calibrationData[0]?.nValid ?? '—')} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CalibrationChart data={calibrationData} />

            <ChartCard title="PIT Histogram" subtitle="Probability Integral Transform — uniform is ideal">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={calibrationData.map(d => ({ tau: d.tau.toFixed(2), deviation: Math.abs(d.pHat - d.tau) }))}
                  margin={{ top: 5, right: 10, bottom: 20, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="tau" tick={{ fontSize: 10 }} stroke="#94a3b8" label={{ value: 'τ', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" label={{ value: '|p̂ − τ|', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="deviation" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {calibrationData.map((d, i) => (
                      <Cell key={i} fill={Math.abs(d.pHat - d.tau) < 0.05 ? '#10b981' : Math.abs(d.pHat - d.tau) < 0.1 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {activeTab === 'intermittency' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <MetricCard label="Avg Active Rate" value={sampled.length > 0 ? fmtPct(sampled.reduce((s, d) => s + d.activeRate, 0) / sampled.length) : '—'} />
            <MetricCard label="Min Active" value={sampled.length > 0 ? String(Math.min(...sampled.map(d => d.activeCount))) : '—'} />
            <MetricCard label="Max Active" value={sampled.length > 0 ? String(Math.max(...sampled.map(d => d.activeCount))) : '—'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Active Forecasters over Time" subtitle="Number of agents participating each round">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={sampled} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" domain={[0, nAgents]} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Line type="stepAfter" dataKey="activeCount" stroke="#2563eb" strokeWidth={1.5} dot={false} name="Active agents" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Participation Rate over Time" subtitle="Fraction of agents active each round">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={sampled} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" domain={[0, 1]} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={(v: unknown) => typeof v === 'number' ? fmtPct(v) : String(v ?? '')} />
                  <Line type="monotone" dataKey="activeRate" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="Participation rate" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {activeTab === 'robustness' && (
        <div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Robustness to Strategic Behaviour</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This panel examines whether the mechanism is robust to adversarial agents: sybil splits,
              arbitrageurs, colluders, and manipulators. The parameter sweep below maps the trade-off
              between forecast quality (CRPS) and market concentration (Gini) across λ and σ_min.
            </p>
          </div>

          <SweepHeatmap data={sweepData} />

          <div className="mt-6 bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
              <div>
                <span className="font-medium text-slate-700">Sybil resilience:</span>{' '}
                Under the mechanism, sybil splits do not systematically gain; the effective wager
                scales with skill, neutralising identity fragmentation.
              </div>
              <div>
                <span className="font-medium text-slate-700">Arbitrage:</span>{' '}
                No consistent arbitrage profit was found across the parameter grid. The settlement
                ensures budget balance and non-negative payouts.
              </div>
              <div>
                <span className="font-medium text-slate-700">Concentration:</span>{' '}
                Higher λ increases skill learning speed but can increase Gini. The σ_min floor
                prevents any agent from being completely silenced.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
