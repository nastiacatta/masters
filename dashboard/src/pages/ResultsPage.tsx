import { useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell, Brush, ReferenceArea,
} from 'recharts';
import { runPipeline, type PipelineResult } from '@/lib/coreMechanism/runPipeline';
import { METHOD, SEM } from '@/lib/tokens';
import ChartCard from '@/components/dashboard/ChartCard';
import MathBlock from '@/components/dashboard/MathBlock';
import {
  CHART_MARGIN, GRID_PROPS, AXIS_TICK, AXIS_STROKE, TOOLTIP_STYLE, BRUSH_PROPS, fmt, downsample,
} from '@/components/lab/shared';
import { useChartZoom } from '@/hooks/useChartZoom';
import type { InfluenceRule, DepositPolicy } from '@/lib/coreMechanism/runRoundComposable';

const DGP_ID = 'baseline' as const;
const SEED = 42;
const N_AGENTS = 6;
const ROUNDS = 200;

interface MethodResult {
  key: string;
  label: string;
  color: string;
  influenceRule: InfluenceRule;
  pipeline: PipelineResult;
}

interface DepositResult {
  key: string;
  label: string;
  depositPolicy: DepositPolicy;
  pipeline: PipelineResult;
}

function SmartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE}>
      <div className="font-medium text-slate-700 text-[11px] mb-1">Round {label}</div>
      {payload.filter(p => p.value != null).map((p) => (
        <div key={p.dataKey} className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}</span>
          <span className="font-mono font-medium ml-auto">{fmt(p.value, 4)}</span>
        </div>
      ))}
    </div>
  );
}

function HeadlineMetric({ label, value, sub, better }: { label: string; value: string; sub?: string; better?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`text-xl font-bold font-mono mt-1 ${better === true ? 'text-emerald-600' : better === false ? 'text-red-500' : 'text-slate-800'}`}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function ZoomBadge({ isZoomed, onReset }: { isZoomed: boolean; onReset: () => void }) {
  if (!isZoomed) return null;
  return (
    <button
      onClick={onReset}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-medium hover:bg-indigo-200 transition-colors"
    >
      <span>⟲</span> Reset zoom
    </button>
  );
}

export default function ResultsPage() {
  const [enabledMethods, setEnabledMethods] = useState<Record<string, boolean>>({
    equal: true, skill_only: true, blended: true, stake_only: true,
  });

  const cumErrorZoom = useChartZoom();
  const skillLeverZoom = useChartZoom();

  const methods: MethodResult[] = useMemo(() => {
    const entries: { key: string; label: string; color: string; influenceRule: InfluenceRule }[] = [
      { key: 'equal',      label: METHOD.equal.label,      color: METHOD.equal.color,      influenceRule: 'uniform' },
      { key: 'skill_only', label: METHOD.skill_only.label, color: METHOD.skill_only.color, influenceRule: 'skill_only' },
      { key: 'blended',    label: METHOD.blended.label,    color: METHOD.blended.color,    influenceRule: 'skill_stake' },
      { key: 'stake_only', label: METHOD.stake_only.label, color: METHOD.stake_only.color, influenceRule: 'deposit_only' },
    ];
    return entries.map(e => ({
      ...e,
      pipeline: runPipeline({
        dgpId: DGP_ID, behaviourPreset: 'baseline', rounds: ROUNDS, seed: SEED, n: N_AGENTS,
        builder: { influenceRule: e.influenceRule },
      }),
    }));
  }, []);

  const deposits: DepositResult[] = useMemo(() => {
    const entries: { key: string; label: string; depositPolicy: DepositPolicy }[] = [
      { key: 'fixed',    label: 'Fixed unit',       depositPolicy: 'fixed_unit' },
      { key: 'bankroll', label: 'Bankroll × conf',  depositPolicy: 'wealth_fraction' },
      { key: 'oracle',   label: 'Oracle precision',  depositPolicy: 'sigma_scaled' },
    ];
    return entries.map(e => ({
      ...e,
      pipeline: runPipeline({
        dgpId: DGP_ID, behaviourPreset: 'baseline', rounds: ROUNDS, seed: SEED, n: N_AGENTS,
        builder: { depositPolicy: e.depositPolicy, influenceRule: 'skill_stake' },
      }),
    }));
  }, []);

  const sorted = useMemo(
    () => [...methods].sort((a, b) => a.pipeline.summary.meanError - b.pipeline.summary.meanError),
    [methods],
  );

  const cumErrorData = useMemo(() => {
    const maxLen = Math.max(...methods.map(m => m.pipeline.rounds.length));
    const raw = Array.from({ length: maxLen }, (_, i) => {
      const point: Record<string, number> = { round: i + 1 };
      for (const m of methods) {
        const errors = m.pipeline.rounds.slice(0, i + 1).map(r => r.error);
        point[m.key] = errors.reduce((a, b) => a + b, 0) / errors.length;
      }
      return point;
    });
    return downsample(raw, 300);
  }, [methods]);

  const fixedDepPipeline = useMemo(() => {
    return runPipeline({
      dgpId: DGP_ID, behaviourPreset: 'baseline', rounds: ROUNDS, seed: SEED, n: N_AGENTS,
      builder: { depositPolicy: 'fixed_unit', influenceRule: 'skill_stake' },
    });
  }, []);

  const skillLeverData = useMemo(() => {
    return downsample(
      fixedDepPipeline.traces.map((t, i) => {
        const avgSigma = t.sigma_t.reduce((a, b) => a + b, 0) / t.sigma_t.length;
        const totalDeposit = t.deposits.reduce((a, b) => a + b, 0);
        const totalInfluence = t.influence.reduce((a, b) => a + b, 0);
        const mOverB = totalDeposit > 0 ? totalInfluence / totalDeposit : 1;
        return { round: i + 1, mOverB, sigma: avgSigma };
      }),
      300,
    );
  }, [fixedDepPipeline]);

  const depositBarData = useMemo(() => {
    return deposits.map(d => ({
      name: d.label,
      meanError: d.pipeline.summary.meanError,
      gini: d.pipeline.summary.finalGini,
    })).sort((a, b) => a.meanError - b.meanError);
  }, [deposits]);

  const bestMethod = sorted[0];
  const worstMethod = sorted[sorted.length - 1];

  const toggleMethod = (key: string) => {
    setEnabledMethods(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex-1 overflow-y-auto">
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Results</h2>
        <p className="text-sm font-medium text-slate-700 mt-2">
          What changes when skill enters the weighting?
        </p>
      </div>

      {/* Baseline toggles */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-xs text-slate-500 font-medium mr-1">Show:</span>
        {methods.map(m => (
          <button
            key={m.key}
            onClick={() => toggleMethod(m.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              enabledMethods[m.key]
                ? 'text-white shadow-sm'
                : 'bg-slate-100 text-slate-400'
            }`}
            style={enabledMethods[m.key] ? { background: m.color } : undefined}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: m.color }} />
            {m.label}
          </button>
        ))}
      </div>

      {/* Headline metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {sorted.map((m, i) => (
          <HeadlineMetric
            key={m.key}
            label={`#${i + 1} ${m.label}`}
            value={fmt(m.pipeline.summary.meanError, 4)}
            sub={`Gini ${fmt(m.pipeline.summary.finalGini, 3)}`}
            better={i === 0}
          />
        ))}
      </div>

      {/* Chart 1: Forecast quality comparison */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-slate-800">Forecast quality comparison</h3>
          <span className="text-[11px] text-slate-400 italic">Drag to zoom</span>
          <ZoomBadge isZoomed={cumErrorZoom.state.isZoomed} onReset={cumErrorZoom.reset} />
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          Cumulative mean error. {bestMethod.label} is best ({fmt(bestMethod.pipeline.summary.meanError, 4)}); {worstMethod.label} is worst ({fmt(worstMethod.pipeline.summary.meanError, 4)}).
        </p>
        <ResponsiveContainer width="100%" height={340}>
          <LineChart
            data={cumErrorData}
            margin={CHART_MARGIN}
            onMouseDown={cumErrorZoom.onMouseDown}
            onMouseMove={cumErrorZoom.onMouseMove}
            onMouseUp={cumErrorZoom.onMouseUp}
          >
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
              domain={[cumErrorZoom.state.left, cumErrorZoom.state.right]} />
            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
            <Tooltip content={<SmartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
            {methods.map(m => enabledMethods[m.key] && (
              <Line
                key={m.key}
                type="monotone"
                dataKey={m.key}
                name={m.label}
                stroke={m.color}
                strokeWidth={m.key === 'blended' ? 2.5 : 1.5}
                dot={false}
                strokeOpacity={m.key === 'blended' ? 1 : 0.7}
              />
            ))}
            {cumErrorZoom.state.refLeft && cumErrorZoom.state.refRight && (
              <ReferenceArea x1={cumErrorZoom.state.refLeft} x2={cumErrorZoom.state.refRight} strokeOpacity={0.3} fill="#6366f1" fillOpacity={0.1} />
            )}
            <Brush dataKey="round" {...BRUSH_PROPS} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charts 2 & 3 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Chart 2: Skill lever */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-800">Skill lever in isolation</h3>
            <ZoomBadge isZoomed={skillLeverZoom.state.isZoomed} onReset={skillLeverZoom.reset} />
          </div>
          <p className="text-[11px] text-slate-400 mb-3">Fixed deposit: m/b tracks σ when stake noise is removed.</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={skillLeverData}
              margin={CHART_MARGIN}
              onMouseDown={skillLeverZoom.onMouseDown}
              onMouseMove={skillLeverZoom.onMouseMove}
              onMouseUp={skillLeverZoom.onMouseUp}
            >
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
                domain={[skillLeverZoom.state.left, skillLeverZoom.state.right]} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1.1]} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
              <Line type="monotone" dataKey="mOverB" name="m/b ratio" stroke={SEM.wager.main} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sigma" name="Avg σ" stroke={SEM.skill.main} strokeWidth={2} dot={false} strokeDasharray="4 4" />
              {skillLeverZoom.state.refLeft && skillLeverZoom.state.refRight && (
                <ReferenceArea x1={skillLeverZoom.state.refLeft} x2={skillLeverZoom.state.refRight} strokeOpacity={0.3} fill="#6366f1" fillOpacity={0.1} />
              )}
              <Brush dataKey="round" {...BRUSH_PROPS} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Deposit policy */}
        <ChartCard
          title="Deposit policy comparison"
          subtitle="Mean error by deposit rule. Noisy stake hurts; meaningful deposits help."
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={depositBarData} margin={{ ...CHART_MARGIN, bottom: 20 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <Tooltip content={<SmartTooltip />} />
              <Bar dataKey="meanError" name="Mean error" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {depositBarData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#10b981' : i === depositBarData.length - 1 ? '#ef4444' : SEM.deposit.main} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Evidence summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Evidence summary</h3>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
          <EvidencePoint
            icon="↓"
            text={`${worstMethod.label} is the weakest weighting rule in this run (mean error ${fmt(worstMethod.pipeline.summary.meanError, 4)}).`}
            color="#ef4444"
          />
          <EvidencePoint
            icon="★"
            text={`${bestMethod.label} is the strongest (mean error ${fmt(bestMethod.pipeline.summary.meanError, 4)}). The ordering may change with different DGPs.`}
            color="#10b981"
          />
          <EvidencePoint
            icon="σ"
            text="Skill helps most clearly by reducing noisy stake influence. When deposits are fixed, m/b closely tracks σ."
            color={SEM.skill.main}
          />
          <EvidencePoint
            icon="⚠"
            text="Calibration is still a weakness, especially in the tails. Tail miscalibration is the main modelling limitation."
            color="#f59e0b"
          />
        </div>
      </div>

      {/* Key equation */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
        <MathBlock
          inline
          latex="m_{i,t} = b_{i,t}\bigl(\lambda + (1-\lambda)\,\sigma_{i,t}\bigr)"
        />
        <p className="text-xs text-slate-500 mt-2">
          The effective wager gates deposit through skill. With noisy deposits,
          skill attenuates bad bets. With informative deposits (bankroll×confidence, oracle),
          the mechanism compounds both signals.
        </p>
      </div>
    </div>
    </div>
  );
}

function EvidencePoint({ icon, text, color }: { icon: string; text: string; color: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
        style={{ background: color + '18', color }}
      >
        {icon}
      </span>
      <p className="text-xs text-slate-600 leading-relaxed">{text}</p>
    </div>
  );
}
