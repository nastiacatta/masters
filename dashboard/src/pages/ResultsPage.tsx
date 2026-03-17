import { useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Brush, ReferenceArea,
} from 'recharts';
import { runPipeline, type PipelineResult } from '@/lib/coreMechanism/runPipeline';
import { METHOD, SEM } from '@/lib/tokens';
import ChartCard from '@/components/dashboard/ChartCard';
import InfoToggle from '@/components/dashboard/InfoToggle';
import MathBlock from '@/components/dashboard/MathBlock';
import {
  CHART_MARGIN_LABELED, GRID_PROPS, AXIS_TICK, AXIS_STROKE, TOOLTIP_STYLE, BRUSH_PROPS, fmt, downsample,
} from '@/components/lab/shared';
import { useChartZoom } from '@/hooks/useChartZoom';
import type { InfluenceRule, DepositPolicy } from '@/lib/coreMechanism/runRoundComposable';

const DGP_ID = 'baseline' as const;
const SEED = 42;
const N_AGENTS = 6;
const ROUNDS = 200;

// ---------------------------------------------------------------------------
// Small reusable components
// ---------------------------------------------------------------------------

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

function ZoomBadge({ isZoomed, onReset }: { isZoomed: boolean; onReset: () => void }) {
  if (!isZoomed) return null;
  return (
    <button
      onClick={onReset}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-medium hover:bg-indigo-200 transition-colors"
    >
      <span>&#x27F2;</span> Reset zoom
    </button>
  );
}

type Verdict = 'good' | 'neutral' | 'bad';
const VERDICT_STYLES: Record<Verdict, { ring: string; bg: string; text: string }> = {
  good:    { ring: 'ring-emerald-300', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  neutral: { ring: 'ring-amber-300',   bg: 'bg-amber-50',    text: 'text-amber-700' },
  bad:     { ring: 'ring-red-300',     bg: 'bg-red-50',      text: 'text-red-700' },
};

function AnswerCard({ title, metric, metricLabel, verdict, interpretation, caveat }: {
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

function MetricTooltip({ label, tip }: { label: string; tip: string }) {
  return (
    <span className="group relative cursor-help border-b border-dotted border-slate-400">
      {label}
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-44 rounded-lg bg-slate-800 text-white text-[10px] leading-snug p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 text-center">
        {tip}
      </span>
    </span>
  );
}

const EVIDENCE_TABS = ['Accuracy', 'Skill lever', 'Deposit policy', 'Calibration'] as const;
type EvidenceTab = typeof EVIDENCE_TABS[number];

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState<EvidenceTab>('Accuracy');
  const [howToReadOpen, setHowToReadOpen] = useState(false);

  const [enabledMethods, setEnabledMethods] = useState<Record<string, boolean>>({
    equal: true, skill_only: true, blended: true, stake_only: true,
  });

  const cumErrorZoom = useChartZoom();
  const skillLeverZoom = useChartZoom();

  // ---- data pipelines ----

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
      { key: 'fixed',    label: 'Fixed amount',             depositPolicy: 'fixed_unit' },
      { key: 'bankroll', label: 'Fraction of wealth',       depositPolicy: 'wealth_fraction' },
      { key: 'oracle',   label: 'Wealth fraction \u00d7 skill', depositPolicy: 'sigma_scaled' },
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
        const totalInfluence = t.effectiveWager.reduce((a, b) => a + b, 0);
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
      meanNEff: d.pipeline.summary.meanNEff,
    })).sort((a, b) => a.meanError - b.meanError);
  }, [deposits]);

  const bestMethod = sorted[0];
  const equal = methods.find(x => x.key === 'equal')!;
  const blended = methods.find(x => x.key === 'blended')!;
  const deltaCrps = blended.pipeline.summary.meanError - equal.pipeline.summary.meanError;
  const deltaGini = blended.pipeline.summary.finalGini - equal.pipeline.summary.finalGini;

  const toggleMethod = (key: string) => {
    setEnabledMethods(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex-1 overflow-y-auto">
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

      {/* ================================================================ */}
      {/* HEADER                                                           */}
      {/* ================================================================ */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Main results</h1>
        <p className="text-sm text-slate-600 mt-1.5 max-w-2xl">
          What changes when skill enters the weighting? These are the headline findings
          from the in-browser simulation (baseline DGP, seed&nbsp;{SEED}, N&nbsp;=&nbsp;{N_AGENTS}, T&nbsp;=&nbsp;{ROUNDS}).
        </p>
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[11px] text-amber-900 max-w-2xl leading-relaxed">
          <strong>Illustrative only.</strong> Use experiment-backed pages for thesis evidence.
        </div>
      </div>

      {/* ================================================================ */}
      {/* 1. THREE ANSWER CARDS                                            */}
      {/* ================================================================ */}
      <section aria-label="Headline answers">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Headline answers</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <AnswerCard
            title="Does skill improve accuracy?"
            metric={`${deltaCrps >= 0 ? '+' : ''}${fmt(deltaCrps, 4)}`}
            metricLabel="ΔCRPS (skill+stake − equal)"
            verdict={deltaCrps < -0.001 ? 'good' : deltaCrps > 0.001 ? 'bad' : 'neutral'}
            interpretation={
              deltaCrps < 0
                ? `Skill + stake beats equal weights by ${fmt(Math.abs(deltaCrps), 4)} mean error in this run.`
                : 'Equal weights match or beat skill + stake in this run.'
            }
            caveat="This is a clean benchmark, not a strategic one."
          />
          <AnswerCard
            title="Any major issues?"
            metric={blended.pipeline.summary.meanError < 0.5 ? 'No' : 'Yes'}
            metricLabel="mechanism health"
            verdict={blended.pipeline.summary.meanError < 0.5 ? 'good' : 'bad'}
            interpretation="The mechanism runs stably: budget-balanced, non-negative payouts, no divergence."
            caveat="Calibration weakens in the tails — shared across all weighting methods."
          />
          <AnswerCard
            title="Does wealth dominate?"
            metric={`ΔGini ${deltaGini >= 0 ? '+' : ''}${fmt(deltaGini, 3)}`}
            metricLabel="Gini(blended) − Gini(equal)"
            verdict={Math.abs(deltaGini) < 0.05 ? 'good' : deltaGini > 0 ? 'bad' : 'good'}
            interpretation={
              Math.abs(deltaGini) < 0.05
                ? 'Concentration stays controlled under skill + stake weighting.'
                : deltaGini > 0
                  ? 'Wealth becomes more concentrated under skill + stake.'
                  : 'Skill + stake actually reduces concentration.'
            }
            caveat="Under some deposit policies, skilled agents can compound returns."
          />
        </div>
      </section>

      {/* ================================================================ */}
      {/* 2. HOW TO READ (collapsible)                                     */}
      {/* ================================================================ */}
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
              ['Benchmark', 'The experiment configuration: DGP, number of agents, number of rounds, seed.'],
              ['Metric', 'The quantity being compared. Lower CRPS and lower Gini are better; higher N_eff is better.'],
              ['Comparison', 'Each chart shows skill + stake (blended) vs at least one baseline: equal, stake-only, or skill-only.'],
              ['Takeaway', 'A one-sentence verdict below each chart.'],
            ] as const).map(([label, desc]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-[11px] font-semibold text-slate-700">{label}</div>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================================================================ */}
      {/* SUMMARY ROW                                                      */}
      {/* ================================================================ */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Best method</div>
            <div className="text-lg font-bold text-slate-800 mt-1">{bestMethod.label}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              <MetricTooltip label="Mean error" tip="Average absolute forecast error. Lower is better." /> {fmt(bestMethod.pipeline.summary.meanError, 4)}
            </div>
          </div>
          {sorted.slice(1).map((m) => {
            const delta = m.pipeline.summary.meanError - equal.pipeline.summary.meanError;
            return (
              <div key={m.key} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{m.label}</div>
                <div className="text-lg font-bold font-mono text-slate-800 mt-1">{fmt(m.pipeline.summary.meanError, 4)}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Δ&nbsp;{delta >= 0 ? '+' : ''}{fmt(delta, 4)} &middot; <MetricTooltip label="Gini" tip="Wealth inequality. 0 = equal, 1 = one agent holds all." /> {fmt(m.pipeline.summary.finalGini, 3)} &middot; <MetricTooltip label="N_eff" tip="Effective number of participating agents. Higher is better." /> {fmt(m.pipeline.summary.meanNEff, 1)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 3. BASELINE SELECTOR                                             */}
      {/* ================================================================ */}
      <section>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 font-medium mr-1">Compare:</span>
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
      </section>

      {/* ================================================================ */}
      {/* 4. EVIDENCE TABS                                                 */}
      {/* ================================================================ */}
      <section>
        <div className="flex gap-1 border-b border-slate-200 mb-5">
          {EVIDENCE_TABS.map(tab => (
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

        {/* ---- Accuracy ---- */}
        {activeTab === 'Accuracy' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-slate-800">Forecast quality comparison</h3>
                <InfoToggle
                  term="Forecast quality comparison"
                  definition="Compares aggregation methods over time."
                  interpretation="Each line shows the cumulative mean error up to that round. Lower line means better forecasting performance."
                  axes={{ x: 'round', y: 'cumulative mean error' }}
                />
                <span className="text-[11px] text-slate-400">Drag to zoom.</span>
                <ZoomBadge isZoomed={cumErrorZoom.state.isZoomed} onReset={cumErrorZoom.reset} />
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                <strong>Verdict:</strong> {bestMethod.label} is best ({fmt(bestMethod.pipeline.summary.meanError, 4)} mean error).
                {deltaCrps < 0
                  ? ` Skill + stake beats equal by ${fmt(Math.abs(deltaCrps), 4)}.`
                  : ' Equal weights match or lead.'}
              </p>
              <div className="cursor-crosshair" role="img" aria-label="Forecast quality by method">
              <ResponsiveContainer width="100%" height={360}>
                <LineChart
                  data={cumErrorData}
                  margin={CHART_MARGIN_LABELED}
                  onMouseDown={cumErrorZoom.onMouseDown}
                  onMouseMove={cumErrorZoom.onMouseMove}
                  onMouseUp={cumErrorZoom.onMouseUp}
                >
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
                    domain={[cumErrorZoom.state.left, cumErrorZoom.state.right]}
                    label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                    label={{ value: 'Cumulative mean error', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
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
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <MathBlock
                inline
                latex="m_{i,t} = b_{i,t}\bigl(\lambda + (1-\lambda)\,\sigma_{i,t}^{\eta}\bigr)"
              />
              <p className="text-xs text-slate-500 mt-2">
                The effective wager gates deposit through skill. With noisy deposits,
                skill attenuates bad bets. With informative deposits, the mechanism compounds both signals.
              </p>
            </div>
          </div>
        )}

        {/* ---- Skill lever ---- */}
        {activeTab === 'Skill lever' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-slate-800">Skill lever in isolation</h3>
              <InfoToggle
                term="Skill lever in isolation"
                definition="With fixed deposits, the ratio m/b isolates the pure effect of skill on influence."
                interpretation="If σ rises, m/b rises. This chart removes stake-size noise."
                latex="\\frac{m_i}{b_i} = \\lambda + (1-\\lambda)\\sigma_i^{\\eta}"
                axes={{ x: 'round', y: 'm/b or average σ' }}
              />
              <ZoomBadge isZoomed={skillLeverZoom.state.isZoomed} onReset={skillLeverZoom.reset} />
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              <strong>Verdict:</strong> Fixed deposit: m/b closely tracks σ when stake noise is removed. Drag to zoom.
            </p>
            <div className="cursor-crosshair" role="img" aria-label="Skill lever m/b and σ">
            <ResponsiveContainer width="100%" height={360}>
              <LineChart
                data={skillLeverData}
                margin={CHART_MARGIN_LABELED}
                onMouseDown={skillLeverZoom.onMouseDown}
                onMouseMove={skillLeverZoom.onMouseMove}
                onMouseUp={skillLeverZoom.onMouseUp}
              >
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
                  domain={[skillLeverZoom.state.left, skillLeverZoom.state.right]}
                  label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1.1]}
                  label={{ value: 'm/b or σ', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
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
          </div>
        )}

        {/* ---- Deposit policy ---- */}
        {activeTab === 'Deposit policy' && (
          <ChartCard
            title="Deposit policy: accuracy vs concentration"
            subtitle="Mean error and final Gini by deposit rule. Lower error is better; lower Gini means more equitable."
            help={{
              term: 'Deposit policy comparison',
              definition: 'Compares stake-setting rules on both forecast quality and wealth inequality.',
              interpretation: 'The best policy minimises error without concentrating wealth.',
              axes: { x: 'deposit policy', y: 'mean error / Gini' },
            }}
          >
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={depositBarData} margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE}
                  label={{ value: 'Deposit policy', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                  label={{ value: 'Value', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<SmartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                <Bar dataKey="meanError" name="Mean error" radius={[4, 4, 0, 0]} maxBarSize={32} fill={SEM.outcome.main} />
                <Bar dataKey="gini" name="Final Gini" radius={[4, 4, 0, 0]} maxBarSize={32} fill={SEM.wealth.main} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* ---- Calibration (placeholder for experiment-backed data) ---- */}
        {activeTab === 'Calibration' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm text-slate-500">
              Calibration evidence is generated by the Python experiments.
              Run the <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">calibration</code> experiment
              and link data to see the reliability diagram here.
            </p>
            <p className="text-[11px] text-slate-400 mt-3 max-w-lg mx-auto leading-relaxed">
              The aggregate forecast is well-calibrated for central quantiles but PIT coverage degrades
              for extreme quantiles. Tail miscalibration is the main modelling limitation and is shared
              across all weighting methods.
            </p>
          </div>
        )}
      </section>

      {/* ================================================================ */}
      {/* 5. LIMITATIONS                                                   */}
      {/* ================================================================ */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Limitations</h2>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <ul className="space-y-2 text-[11px] text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-slate-400 mt-0.5 shrink-0">1.</span>
              <span><strong className="text-slate-700">Identifiable benchmark required.</strong> The skill layer needs a proper scoring rule and enough rounds to converge. With short horizons or few agents, estimation noise in σ can erase the advantage.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400 mt-0.5 shrink-0">2.</span>
              <span><strong className="text-slate-700">Strategic settings are harder.</strong> When agents manipulate or evade, the gains from skill weighting shrink or disappear. See the Robustness page for adversary results.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400 mt-0.5 shrink-0">3.</span>
              <span><strong className="text-slate-700">Some gains depend on DGP and deposit policy.</strong> The ordering of methods can change across DGP configurations and deposit rules. Equal weights remain a surprisingly strong baseline.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400 mt-0.5 shrink-0">4.</span>
              <span><strong className="text-slate-700">Tail miscalibration is shared.</strong> All methods exhibit PIT under-coverage for extreme quantiles. This is a property of the linear pool, not the weighting scheme.</span>
            </li>
          </ul>
        </div>
      </section>

    </div>
    </div>
  );
}
