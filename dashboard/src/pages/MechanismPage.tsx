import { useMemo, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ReferenceLine, Label, Brush, ReferenceArea,
} from 'recharts';
import { useStore } from '@/lib/store';
import { runPipeline } from '@/lib/coreMechanism/runPipeline';
import { DEFAULT_BUILDER_SELECTIONS, type BuilderSelections } from '@/lib/coreMechanism/runRoundComposable';
import type { SimParams } from '@/lib/mechanismExplorer/types';
import { SEM } from '@/lib/tokens';
import InfoToggle from '@/components/dashboard/InfoToggle';
import SystemArchitecture from '@/components/mechanism/SystemArchitecture';
import ScenarioBuilder from '@/components/lab/ScenarioBuilder';
import RoundRibbon from '@/components/inspector/RoundRibbon';
import ValidationPanel from '@/components/lab/ValidationPanel';
import StepSection from '@/components/dashboard/StepSection';
import {
  AGENT_PALETTE, CHART_MARGIN_LABELED, GRID_PROPS, AXIS_TICK, AXIS_STROKE,
  TOOLTIP_STYLE, BRUSH_PROPS, agentName, fmt, downsample, movingAvg,
} from '@/components/lab/shared';
import { useChartZoom } from '@/hooks/useChartZoom';

const INVARIANTS = [
  { label: 'Budget balanced', desc: 'Total payouts equal total effective wagers.', color: SEM.payoff.main },
  { label: 'Cashflow identity', desc: 'Wealth change = profit = total payoff − effective wager; cashout = refund + total payoff.', color: SEM.wealth.main },
  { label: 'Profit bounded', desc: 'For active agents, −mᵢ ≤ πᵢ ≤ mᵢ because scores and the weighted mean score lie in [0, 1].', color: SEM.wager.main },
  { label: 'Absent excluded', desc: 'Missing agents get mᵢ = 0, no payoff.', color: SEM.score.main },
];


function SmartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE} className="max-w-xs">
      <div className="font-medium text-slate-700 text-[11px] mb-1">Round {label}</div>
      <div className="space-y-0.5 max-h-48 overflow-y-auto">
        {payload.filter(p => p.value != null && p.name !== '').map(p => (
          <div key={p.dataKey} className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-slate-500 truncate">{p.name}</span>
            <span className="font-mono font-medium text-slate-700 ml-auto">{fmt(p.value, 4)}</span>
          </div>
        ))}
      </div>
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

type ViewMode = 'timeline' | 'inspect' | 'validation';

export default function MechanismPage() {
  const {
    selectedDGP, setSelectedDGP,
    selectedBehaviourPreset, setSelectedBehaviourPreset,
    rounds, nAgents, seed, setSeed,
    setRounds, setNAgents,
    selectedRound, setSelectedRound,
    setLastPipelineResult,
  } = useStore();

  const [builder, setBuilder] = useState<BuilderSelections>(DEFAULT_BUILDER_SELECTIONS);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');

  const [simParams, setSimParams] = useState<SimParams>({
    T: rounds, N: nAgents, gamma: 1.5, lambda: 0.3, eta: 1.0, f: 0.4, U: 50,
  });

  const params: SimParams = useMemo(
    () => ({ ...simParams, T: rounds, N: nAgents }),
    [simParams, rounds, nAgents],
  );

  const setParams = (next: SimParams) => {
    if (next.T !== rounds) setRounds(next.T);
    if (next.N !== nAgents) setNAgents(next.N);
    setSimParams(next);
  };

  const pipeline = useMemo(() => {
    return runPipeline({
      dgpId: selectedDGP,
      behaviourPreset: selectedBehaviourPreset,
      rounds,
      seed,
      n: nAgents,
      builder,
      mechanism: {
        gamma: simParams.gamma,
        lam: simParams.lambda,
        eta: simParams.eta,
        baseDepositFraction: simParams.f,
        utilityPool: simParams.U,
      },
    });
  }, [selectedDGP, selectedBehaviourPreset, rounds, seed, nAgents, builder,
      simParams.gamma, simParams.lambda, simParams.eta, simParams.f, simParams.U]);

  // Single source of truth: store holds the current scenario result for the app
  useEffect(() => {
    setLastPipelineResult(pipeline);
    return () => setLastPipelineResult(null);
  }, [pipeline, setLastPipelineResult]);

  const currentRound = Math.max(0, Math.min(selectedRound, pipeline.traces.length - 1));
  const trace = pipeline.traces[currentRound] ?? null;
  const N = pipeline.traces[0]?.participated.length ?? 6;
  const T = pipeline.traces.length;
  const maxRound = T - 1;

  const errorZoom = useChartZoom();
  const skillZoom = useChartZoom();
  const wealthZoom = useChartZoom();

  const errorData = useMemo(() => {
    const errors = pipeline.rounds.map(r => r.error);
    const ma = movingAvg(errors, Math.max(5, Math.floor(T / 20)));
    return downsample(pipeline.rounds.map((r, i) => ({ round: r.round, error: r.error, ma: ma[i] })), 400);
  }, [pipeline.rounds, T]);

  const skillData = useMemo(() => {
    return downsample(pipeline.traces.map((t, i) => {
      const point: Record<string, number> = { round: i + 1 };
      for (let j = 0; j < N; j++) point[`F${j + 1}`] = t.sigma_t[j];
      return point;
    }), 400);
  }, [pipeline.traces, N]);

  const wealthData = useMemo(() => {
    return downsample(pipeline.traces.map((t, i) => {
      const point: Record<string, number> = { round: i + 1 };
      for (let j = 0; j < N; j++) point[`F${j + 1}`] = t.wealth_after[j];
      return point;
    }), 400);
  }, [pipeline.traces, N]);

  const handleChartClick = useCallback((e: { activeLabel?: string | number } | null) => {
    if (e?.activeLabel) {
      const r = Number(e.activeLabel) - 1;
      setSelectedRound(Math.max(0, Math.min(maxRound, r)));
    }
  }, [maxRound, setSelectedRound]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ── Header ── */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Mechanism</h2>
          <p className="text-sm font-medium text-slate-700 mt-2">
            How does one round work, and why is the mechanism well-defined?
          </p>
          <p className="text-xs text-slate-500 mt-2 rounded-lg bg-indigo-50 border border-indigo-200/60 px-3 py-2 max-w-2xl">
            These controls update the live walkthrough. Round outputs (outcome, forecast, error, skill, wealth) reflect the current setup.
          </p>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            This page is an interactive point-forecast demo using \( s = 1 - |y-r| \)
            to make one round of the mechanism easy to inspect.
            Thesis results are shown separately on Results and Robustness using
            probabilistic metrics such as CRPS, calibration, and concentration.
          </p>
        </div>

        {/* ── Step 1: Understand the system ── */}
        <StepSection step={1} title="Understand the system" description="Not a flat pipeline — a layered repeated system with feedback.">
          <div className="space-y-4 pb-6">
            <SystemArchitecture />

            <div className="flex flex-wrap gap-2">
              {INVARIANTS.map(({ label, color }) => (
                <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium" style={{ background: color + '12', color }}>
                  <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: color }}>✓</span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </StepSection>

        {/* ── Step 2: Set inputs ── */}
        <StepSection step={2} title="Set inputs" description="Optional: change DGP, behaviour, or parameters.">
          <div className="flex items-center gap-2 mb-4 flex-wrap pb-6">
          <button
            onClick={() => setControlsOpen(!controlsOpen)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              controlsOpen ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {controlsOpen ? '✕ Hide inputs' : '⚙ Inputs'}
          </button>

          <div className="flex rounded-lg border border-slate-200 overflow-hidden ml-auto">
            {(['timeline', 'inspect', 'validation'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {mode === 'timeline' ? 'Timeline' : mode === 'inspect' ? 'Round detail' : 'Invariants'}
              </button>
            ))}
          </div>
          </div>
        </StepSection>

        <div className="flex gap-4">
          {/* ── Controls sidebar ── */}
          <AnimatePresence initial={false}>
            {controlsOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 264, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0 overflow-hidden"
              >
                <ScenarioBuilder
                  dgp={selectedDGP}
                  setDGP={setSelectedDGP}
                  builder={builder}
                  setBuilder={setBuilder}
                  behaviourPreset={selectedBehaviourPreset}
                  setBehaviourPreset={setSelectedBehaviourPreset}
                  params={params}
                  setParams={setParams}
                  seed={seed}
                  setSeed={setSeed}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main content area ── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* ── Step 3: Pick a round ── */}
            <StepSection step={3} title="Pick a round" description="Use the slider or click a chart point to jump.">
            <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-0 z-20 shadow-sm -mt-1">
              <div className="flex items-center gap-3 flex-wrap">
                <button type="button" onClick={() => setSelectedRound(Math.max(0, currentRound - 1))}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors">
                  ←
                </button>
                <button type="button" onClick={() => setSelectedRound(Math.min(maxRound, currentRound + 1))}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors">
                  →
                </button>
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <input
                    type="range"
                    min={0}
                    max={maxRound}
                    value={currentRound}
                    onChange={e => setSelectedRound(+e.target.value)}
                    className="flex-1 accent-indigo-600 h-1.5"
                  />
                  <span className="font-mono text-sm font-bold text-slate-700 tabular-nums w-20 text-right">
                    {currentRound + 1} / {maxRound + 1}
                  </span>
                </div>
              </div>

              {/* Key metrics for current round */}
              {trace && (
                <>
                <div className="grid grid-cols-4 lg:grid-cols-7 gap-2 mt-3">
                  <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Outcome y</div>
                    <div className="text-sm font-bold font-mono text-slate-800">{fmt(trace.y, 4)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Forecast r̂</div>
                    <div className="text-sm font-bold font-mono" style={{ color: SEM.aggregate.main }}>{fmt(trace.r_hat, 4)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Error</div>
                    <div className={`text-sm font-bold font-mono ${Math.abs(trace.y - trace.r_hat) < 0.1 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {fmt(Math.abs(trace.y - trace.r_hat), 4)}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Active</div>
                    <div className="text-sm font-bold font-mono text-slate-800">{trace.activeCount}/{N}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">N_eff</div>
                    <div className="text-sm font-bold font-mono text-slate-800">{fmt(trace.nEff, 2)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Top share</div>
                    <div className="text-sm font-bold font-mono text-slate-800">{fmt(trace.topShare, 3)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Deposited / paid / refund</div>
                    <div className="text-sm font-bold font-mono text-slate-800">
                      {fmt(trace.deposits.reduce((a, b) => a + b, 0), 1)} / {fmt(trace.totalPayoff.reduce((a, b) => a + Math.max(0, b), 0), 1)} / {fmt(trace.refunds.reduce((a, b) => a + b, 0), 1)}
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Round {currentRound + 1}: {trace.activeCount} agent{trace.activeCount !== 1 ? 's' : ''} participated.
                  Influence concentration {fmt(trace.topShare, 3)}.
                  {(() => {
                    const best = trace.totalPayoff.map((v, i) => ({ i, v })).sort((a, b) => b.v - a.v)[0];
                    return best && best.v > 0 ? ` Largest payoff went to ${agentName(best.i)}.` : '';
                  })()}
                </p>
                </>
              )}
            </div>
            </StepSection>

            {/* ── Step 4: Explore ── */}
            <StepSection step={4} title="Explore" description="Timeline, round detail, or invariant checks.">
            {viewMode === 'timeline' && (
              <div className="space-y-4">
                {/* Agent selector */}
                <div className="flex items-center gap-1.5 flex-wrap bg-white rounded-xl border border-slate-200 p-3">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">Highlight agent:</span>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className={`px-2 py-1 rounded-full text-[11px] font-medium transition-all ${
                      selectedAgent == null ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >All</button>
                  {Array.from({ length: N }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedAgent(selectedAgent === i ? null : i)}
                      className={`px-2 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
                        selectedAgent === i ? 'text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      style={selectedAgent === i ? { background: AGENT_PALETTE[i % AGENT_PALETTE.length] } : undefined}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: AGENT_PALETTE[i % AGENT_PALETTE.length] }} />
                      {agentName(i)}
                    </button>
                  ))}
                </div>

                {/* Error chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-slate-800">Forecast error</h4>
                    <InfoToggle
                      term="Forecast error"
                      definition="The distance between the realised outcome (y_t) and the aggregate forecast (r̂_t) in round t."
                      interpretation="e_t = 0 means the forecast hit the outcome exactly. Smaller is better."
                      latex="e_t = \\left| y_t - \\hat{r}_t \\right|"
                      axes={{ x: 'round', y: 'absolute error' }}
                    />
                    <span className="text-[11px] text-slate-400">Click a point to jump to that round. Drag to zoom.</span>
                    <ZoomBadge isZoomed={errorZoom.state.isZoomed} onReset={errorZoom.reset} />
                  </div>
                  <div className="cursor-crosshair" role="img" aria-label="Forecast error over rounds. Interactive chart.">
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart
                      data={errorData}
                      margin={CHART_MARGIN_LABELED}
                      onClick={handleChartClick}
                      onMouseDown={errorZoom.onMouseDown}
                      onMouseMove={errorZoom.onMouseMove}
                      onMouseUp={errorZoom.onMouseUp}
                    >
                      <defs>
                        <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid {...GRID_PROPS} />
                      <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
                        domain={[errorZoom.state.left, errorZoom.state.right]}
                        label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                        label={{ value: 'Error |y − r̂|', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                      <Tooltip content={<SmartTooltip />} />
                      <ReferenceLine y={pipeline.summary.meanError} stroke="#94a3b8" strokeDasharray="4 4">
                        <Label value={`μ = ${fmt(pipeline.summary.meanError, 4)}`} position="right" fill="#94a3b8" fontSize={9} />
                      </ReferenceLine>
                      <ReferenceLine x={currentRound + 1} stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 2" />
                      <Area type="monotone" dataKey="error" name="Per-round error" stroke="#ef4444" fill="url(#errGrad)" strokeWidth={1} dot={false} />
                      <Line type="monotone" dataKey="ma" name="Moving avg" stroke="#dc2626" strokeWidth={2} dot={false} />
                      {errorZoom.state.refLeft && errorZoom.state.refRight && (
                        <ReferenceArea x1={errorZoom.state.refLeft} x2={errorZoom.state.refRight} strokeOpacity={0.3} fill="#6366f1" fillOpacity={0.1} />
                      )}
                      <Brush dataKey="round" {...BRUSH_PROPS} />
                    </AreaChart>
                  </ResponsiveContainer>
                  </div>
                </div>

                {/* Skill + Wealth side by side */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-slate-800">Skill trajectories (σ)</h4>
                      <InfoToggle
                        term="Skill trajectories (σ)"
                        definition="The mechanism's current online estimate of forecaster i's recent forecasting quality."
                        interpretation="Higher σ means that forecaster currently gets more influence from the same deposit. It is learned over time, so it is not a fixed trait."
                        latex="\\sigma_{i,t} \\in [\\sigma_{\\min}, 1]"
                        axes={{ x: 'round', y: 'skill weight σ' }}
                      />
                      <ZoomBadge isZoomed={skillZoom.state.isZoomed} onReset={skillZoom.reset} />
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2">Skill σ by agent over time. Click or drag to zoom.</p>
                    <div className="cursor-crosshair" role="img" aria-label="Skill trajectories by agent. Interactive chart.">
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart
                        data={skillData}
                        margin={CHART_MARGIN_LABELED}
                        onClick={handleChartClick}
                        onMouseDown={skillZoom.onMouseDown}
                        onMouseMove={skillZoom.onMouseMove}
                        onMouseUp={skillZoom.onMouseUp}
                      >
                        <CartesianGrid {...GRID_PROPS} />
                        <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
                          domain={[skillZoom.state.left, skillZoom.state.right]}
                          label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                        <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]}
                          label={{ value: 'Skill σ', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                        <Tooltip content={<SmartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                        <ReferenceLine y={pipeline.params.sigma_min} stroke="#94a3b8" strokeDasharray="4 4">
                          <Label value="σ_min" position="right" fill="#94a3b8" fontSize={9} />
                        </ReferenceLine>
                        <ReferenceLine x={currentRound + 1} stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 2" />
                        {Array.from({ length: N }, (_, i) => (
                          <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={agentName(i)}
                            stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                            strokeWidth={selectedAgent == null ? 1.5 : selectedAgent === i ? 2.5 : 0.5}
                            strokeOpacity={selectedAgent == null ? 0.85 : selectedAgent === i ? 1 : 0.15}
                            dot={false} connectNulls />
                        ))}
                        {skillZoom.state.refLeft && skillZoom.state.refRight && (
                          <ReferenceArea x1={skillZoom.state.refLeft} x2={skillZoom.state.refRight} strokeOpacity={0.3} fill="#6366f1" fillOpacity={0.1} />
                        )}
                        <Brush dataKey="round" {...BRUSH_PROPS} />
                      </LineChart>
                    </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-slate-800">Wealth evolution</h4>
                      <InfoToggle
                        term="Wealth evolution"
                        definition="Agent i's bankroll after settlement at round t."
                        interpretation="Rising line means cumulative gains, falling line means cumulative losses."
                        latex="W_{i,t}"
                        axes={{ x: 'round', y: 'wealth' }}
                      />
                      <ZoomBadge isZoomed={wealthZoom.state.isZoomed} onReset={wealthZoom.reset} />
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2">Wealth by agent over time. Click or drag to zoom.</p>
                    <div className="cursor-crosshair" role="img" aria-label="Wealth evolution by agent. Interactive chart.">
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart
                        data={wealthData}
                        margin={CHART_MARGIN_LABELED}
                        onClick={handleChartClick}
                        onMouseDown={wealthZoom.onMouseDown}
                        onMouseMove={wealthZoom.onMouseMove}
                        onMouseUp={wealthZoom.onMouseUp}
                      >
                        <CartesianGrid {...GRID_PROPS} />
                        <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
                          domain={[wealthZoom.state.left, wealthZoom.state.right]}
                          label={{ value: 'Round', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
                        <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
                          label={{ value: 'Wealth', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
                        <Tooltip content={<SmartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                        <ReferenceLine y={20} stroke="#94a3b8" strokeDasharray="4 4">
                          <Label value="W₀" position="right" fill="#94a3b8" fontSize={9} />
                        </ReferenceLine>
                        <ReferenceLine x={currentRound + 1} stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 2" />
                        {Array.from({ length: N }, (_, i) => (
                          <Line key={i} type="monotone" dataKey={`F${i + 1}`} name={agentName(i)}
                            stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                            strokeWidth={selectedAgent == null ? 1.5 : selectedAgent === i ? 2.5 : 0.5}
                            strokeOpacity={selectedAgent == null ? 0.85 : selectedAgent === i ? 1 : 0.15}
                            dot={false} connectNulls />
                        ))}
                        {wealthZoom.state.refLeft && wealthZoom.state.refRight && (
                          <ReferenceArea x1={wealthZoom.state.refLeft} x2={wealthZoom.state.refRight} strokeOpacity={0.3} fill="#6366f1" fillOpacity={0.1} />
                        )}
                        <Brush dataKey="round" {...BRUSH_PROPS} />
                      </LineChart>
                    </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ ROUND DETAIL VIEW ══ */}
            {viewMode === 'inspect' && trace && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                    Transformation ribbon — Round {currentRound + 1}
                  </h4>
                  <RoundRibbon
                    trace={trace}
                    selectedAgent={selectedAgent}
                    onSelectAgent={setSelectedAgent}
                  />
                </div>

                <AgentBarCharts trace={trace} N={N} />
              </div>
            )}

            {viewMode === 'validation' && (
              <ValidationPanel pipeline={pipeline} />
            )}
            </StepSection>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Agent bar charts for round detail ── */

function AgentBarCharts({ trace, N }: {
  trace: { deposits: number[]; effectiveWager: number[]; scores: number[]; profit: number[]; wealth_after: number[]; wealth_before: number[]; participated: boolean[]; activeCount: number };
  N: number;
}) {
  const agentBarData = useMemo(() => Array.from({ length: N }, (_, i) => ({
    name: agentName(i), deposit: trace.deposits[i], effectiveWager: trace.effectiveWager[i],
    score: trace.scores[i], payoff: trace.profit[i], wealth: trace.wealth_after[i],
    active: trace.participated[i], idx: i,
  })), [trace, N]);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-1.5 mb-1">
          <h4 className="text-sm font-semibold text-slate-800">Deposits vs effective wagers</h4>
          <InfoToggle
            term="Deposits vs effective wagers"
            definition="b_i is the posted deposit. m_i is the part that actually counts after skill adjustment."
            interpretation="If two agents deposit the same amount, the one with higher σ_i gets higher effective wager."
            latex="m_i = b_i\\bigl(\\lambda + (1-\\lambda)\\sigma_i^{\\eta}\\bigr)"
            axes={{ x: 'agent', y: 'amount' }}
          />
        </div>
        <p className="text-[11px] text-slate-400 mb-2">Deposit b (light) vs effective wager m (dark). Hover for values.</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={agentBarData} margin={CHART_MARGIN_LABELED}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE}
              label={{ value: 'Agent', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
              label={{ value: 'b / m', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="deposit" name="Deposit bᵢ" radius={[4, 4, 0, 0]} maxBarSize={28} opacity={0.4}>
              {agentBarData.map(d => <Cell key={d.idx} fill={d.active ? AGENT_PALETTE[d.idx % AGENT_PALETTE.length] : '#e2e8f0'} />)}
            </Bar>
            <Bar dataKey="effectiveWager" name="Wager mᵢ" radius={[4, 4, 0, 0]} maxBarSize={28}>
              {agentBarData.map(d => <Cell key={d.idx} fill={d.active ? AGENT_PALETTE[d.idx % AGENT_PALETTE.length] : '#e2e8f0'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-1.5 mb-1">
          <h4 className="text-sm font-semibold text-slate-800">Profit by agent</h4>
          <InfoToggle
            term="Profit by agent"
            definition="Total payoff minus effective wager."
            interpretation="Positive means the agent gained on that round, negative means a loss. Bounded by ±mᵢ."
            latex="\\pi_i = \\Pi^{\\mathrm{skill}}_i - m_i"
            axes={{ x: 'agent', y: 'profit' }}
          />
        </div>
        <p className="text-[11px] text-slate-400 mb-2">Profit π (green = gain, red = loss). Hover for values.</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={agentBarData} margin={CHART_MARGIN_LABELED}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE}
              label={{ value: 'Agent', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE}
              label={{ value: 'Profit π', angle: -90, position: 'insideLeft', offset: 8, fontSize: 11, fill: '#64748b' }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="payoff" name="Profit πᵢ" radius={[4, 4, 4, 4]} maxBarSize={28}>
              {agentBarData.map(d => (
                <Cell key={d.idx} fill={d.payoff >= 0 ? '#10b981' : '#ef4444'} opacity={d.active ? 1 : 0.3} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
