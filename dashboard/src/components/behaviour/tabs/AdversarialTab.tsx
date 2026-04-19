import { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
  ReferenceArea,
} from 'recharts';
import type { PipelineResult } from '@/lib/coreMechanism/runPipeline';
import ChartCard from '@/components/dashboard/ChartCard';
import MetricDisplay from '@/components/dashboard/MetricDisplay';
import {
  CHART_MARGIN_LABELED, GRID_PROPS, AXIS_TICK, AXIS_STROKE,
  fmt, downsample,
} from '@/components/lab/shared';
import { SmartTooltip } from '@/components/dashboard/SmartTooltip';
import { useChartZoom } from '@/hooks/useChartZoom';
import ZoomBadge from '@/components/charts/ZoomBadge';
import MathBlock from '@/components/dashboard/MathBlock';
import MechanismResponseCard from '@/components/behaviour/MechanismResponseCard';
import { useMechanismMetrics } from '@/hooks/useMechanismMetrics';
import { compare } from '@/hooks/useBehaviourSimulations';
import { SEED, N, T, VERDICT_VARIANT } from '@/lib/behaviour/helpers';

export default function AdversarialTab({ manipulator, arbitrageur, sybil, collusion, repReset, evader, baseline }: {
  manipulator: PipelineResult; arbitrageur: PipelineResult; sybil: PipelineResult;
  collusion: PipelineResult; repReset: PipelineResult; evader: PipelineResult; baseline: PipelineResult;
}) {
  const sigDecayZoom = useChartZoom();

  const W0 = 20;
  const manipProfit = manipulator.finalState[0].wealth - W0;
  const baseProfit0 = baseline.finalState[0].wealth - W0;
  const arbIdx = arbitrageur.finalState.length - 1;
  const arbProfit = arbitrageur.finalState[arbIdx].wealth - W0;
  const arbBaseline = baseline.finalState[arbIdx].wealth - W0;
  const sybilProfit = sybil.finalState.slice(0, 2).reduce((a, s) => a + s.wealth, 0);
  const baselinePairProfit = baseline.finalState.slice(0, 2).reduce((a, s) => a + s.wealth, 0);
  const sybilRatio = baselinePairProfit > 0 ? sybilProfit / baselinePairProfit : 1;

  const attacks = [
    { name: 'Baseline', error: baseline.summary.meanError, gini: baseline.summary.finalGini, color: '#94a3b8' },
    { name: 'Manipulator', error: manipulator.summary.meanError, gini: manipulator.summary.finalGini, color: '#ef4444' },
    { name: 'Arbitrageur', error: arbitrageur.summary.meanError, gini: arbitrageur.summary.finalGini, color: '#f59e0b' },
    { name: 'Sybil', error: sybil.summary.meanError, gini: sybil.summary.finalGini, color: '#f97316' },
    { name: 'Collusion', error: collusion.summary.meanError, gini: collusion.summary.finalGini, color: '#ec4899' },
    { name: 'Rep. reset', error: repReset.summary.meanError, gini: repReset.summary.finalGini, color: '#dc2626' },
    { name: 'Evader', error: evader.summary.meanError, gini: evader.summary.finalGini, color: '#a855f7' },
  ];

  const sigmaTraces = useMemo(() => downsample(
    Array.from({ length: Math.min(manipulator.traces.length, repReset.traces.length, baseline.traces.length) }, (_, i) => ({
      round: i + 1,
      honest: baseline.traces[i].sigma_t[0],
      manipulator: manipulator.traces[i].sigma_t[0],
      rep_reset: repReset.traces[i].sigma_t[0],
      evader: evader.traces[i]?.sigma_t[0] ?? 0,
    })), 300),
  [manipulator.traces, repReset.traces, baseline.traces, evader.traces]);

  // Mechanism response metrics for each attack
  const manipMetrics = useMechanismMetrics(manipulator, baseline, 0);
  const arbMetrics = useMechanismMetrics(arbitrageur, baseline, arbIdx);
  const evaderMetrics = useMechanismMetrics(evader, baseline, 0);
  const evaderDelta = compare(evader, baseline);

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Six attack types, each optimised against the mechanism's rules.
      </p>
      <MathBlock accent label="Payoff" latex="\\Pi_i = m_i\\left(1 + s(r_i, \\omega) - \\frac{\\sum_j m_j\\, s(r_j, \\omega)}{\\sum_j m_j}\\right)" />
      <p className="text-sm text-slate-600">
        The arbitrageur exploits the Chen (2014) arbitrage interval by reporting the mean of others.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <MetricDisplay label="Manipulation profitable?" value={manipProfit > baseProfit0 + 0.5 ? 'Yes' : 'No'}
          detail={`F1: ${fmt(manipProfit, 2)} vs ${fmt(baseProfit0, 2)} honest`}
          variant={VERDICT_VARIANT[manipProfit > baseProfit0 + 0.5 ? 'bad' : 'good']} />
        <MetricDisplay label="Arbitrage profitable?" value={arbProfit > arbBaseline + 0.5 ? 'Yes' : 'No'}
          detail={`F6: ${fmt(arbProfit, 2)} vs ${fmt(arbBaseline, 2)} honest`}
          variant={VERDICT_VARIANT[arbProfit > arbBaseline + 0.5 ? 'bad' : 'good']} />
        <MetricDisplay label="Sybil-resistant?" value={sybilRatio <= 1.05 ? 'Yes' : 'No'}
          detail={`Clone pair ratio: ${fmt(sybilRatio, 3)}`}
          variant={VERDICT_VARIANT[sybilRatio <= 1.05 ? 'good' : 'bad']} />
      </div>

      {/* Attack comparison table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-1">Attack impact comparison</h3>
        <p className="text-xs text-slate-500 mb-3">
          Each attack runs on the same DGP/seed. Only the attacker's behaviour changes.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-3 text-slate-400 font-medium">Attack</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">Mean CRPS</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">Δ vs base</th>
                <th className="text-right py-2 px-2 text-slate-400 font-medium">Gini</th>
                <th className="text-left py-2 px-2 text-slate-400 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                { ...attacks[0], desc: 'All agents truthful' },
                { ...attacks[1], desc: 'F1 pushes aggregate toward 0.5' },
                { ...attacks[2], desc: 'F6 reports mean of others (Chen arb.)' },
                { ...attacks[3], desc: 'F1–F2 clone with split deposit' },
                { ...attacks[4], desc: 'F1–F2 coordinate participation + reports' },
                { ...attacks[5], desc: 'F1 honest 100 rounds, then manipulates' },
                { ...attacks[6], desc: 'F1 adapts misreport to dispersion' },
              ].map((r, i) => {
                const delta = i === 0 ? 0 : (r.error - attacks[0].error) / attacks[0].error * 100;
                return (
                  <tr key={r.name} className="border-b border-slate-50">
                    <td className="py-2 pr-3 font-medium" style={{ color: r.color }}>{r.name}</td>
                    <td className="text-right py-2 px-2 font-mono">{fmt(r.error, 4)}</td>
                    <td className={`text-right py-2 px-2 font-mono ${delta > 1 ? 'text-red-500' : delta < -1 ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {i === 0 ? '-' : `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`}
                    </td>
                    <td className="text-right py-2 px-2 font-mono">{fmt(r.gini, 3)}</td>
                    <td className="py-2 px-2 text-slate-500">{r.desc}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Accuracy impact by attack" subtitle="Mean CRPS. Higher = worse aggregate." provenance={{ type: "demo", label: `In-browser demo, seed=${SEED}, N=${N}, T=${T}` }}>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={attacks} margin={{ ...CHART_MARGIN_LABELED, bottom: 32 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="name" tick={{ ...AXIS_TICK, fontSize: 11 }} stroke={AXIS_STROKE} angle={-20} textAnchor="end" />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <Tooltip content={<SmartTooltip />} />
              <Bar dataKey="error" name="Mean CRPS" radius={[4, 4, 0, 0]} maxBarSize={36}>
                {attacks.map(d => <Cell key={d.name} fill={d.color} opacity={0.85} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-slate-800">Attacker σ decay</h3>
            <ZoomBadge isZoomed={sigDecayZoom.state.isZoomed} onReset={sigDecayZoom.reset} />
          </div>
          <p className="text-xs text-slate-500 mb-2">F1's skill estimate under different attacks. Misreporting erodes σ. Drag to zoom.</p>
          <div className="cursor-crosshair">
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={sigmaTraces} margin={{ ...CHART_MARGIN_LABELED, left: 52 }}
                onMouseDown={sigDecayZoom.onMouseDown} onMouseMove={sigDecayZoom.onMouseMove} onMouseUp={sigDecayZoom.onMouseUp}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[sigDecayZoom.state.left, sigDecayZoom.state.right]} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]}
                  label={{ value: 'σ (F1)', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<SmartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="honest" name="Honest" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="manipulator" name="Manipulator" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="rep_reset" name="Rep. reset" stroke="#dc2626" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
                <Line type="monotone" dataKey="evader" name="Evader" stroke="#a855f7" strokeWidth={1.5} dot={false} />
                {sigDecayZoom.state.refLeft && sigDecayZoom.state.refRight && (
                  <ReferenceArea x1={sigDecayZoom.state.refLeft} x2={sigDecayZoom.state.refRight} fillOpacity={0.1} fill="#6366f1" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mechanism response cards */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-800">Mechanism response metrics</h3>
        <p className="text-xs text-slate-500">
          EWMA half-life: ln(2)/0.1 &asymp; 6.9 rounds. This determines how quickly the skill layer responds to behaviour changes.
        </p>
        <div className="grid lg:grid-cols-3 gap-4">
          <MechanismResponseCard metrics={manipMetrics}
            attackVector="Push aggregate toward 0.5 with inflated stake"
            defenceMechanism="EWMA skill decay: misreports raise L, lowering σ and influence"
            effectiveness={manipProfit <= baseProfit0 + 0.5 ? 90 : 40} />
          <MechanismResponseCard metrics={arbMetrics}
            attackVector="Report mean of others (Chen arbitrage interval)"
            defenceMechanism="Mediocre scores keep σ moderate; can't outperform best forecaster"
            effectiveness={arbProfit <= arbBaseline + 0.5 ? 85 : 35} />
          <MechanismResponseCard metrics={evaderMetrics}
            attackVector="Adapt misreport magnitude to dispersion (stealth evasion)"
            defenceMechanism="EWMA still detects persistent errors; stealth only slows detection"
            effectiveness={evaderDelta.deltaPct < 3 ? 80 : 45} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 space-y-2">
        <p>
          The skill gate is the primary defence. Misreporting increases CRPS loss &rarr; raises L &rarr; lowers &sigma; &rarr; reduces m_i.
          The reputation reset attack (honest then exploit) shows the mechanism recovers: once F1 starts manipulating,
          &sigma; drops within ~20 rounds (EWMA half-life &asymp; 7 rounds with &rho; = 0.1).
        </p>
        <p>
          The Chen arbitrageur reports the mean of others&apos; predictions  - guaranteed nonneg payoff per round.
          But in the repeated setting, this strategy earns mediocre scores (it can&apos;t beat the best forecaster),
          so &sigma; stays moderate and the arbitrageur doesn&apos;t dominate.
        </p>
      </div>
    </div>
  );
}
