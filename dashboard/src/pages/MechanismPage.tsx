import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, Label, Brush,
  ReferenceArea,
} from 'recharts';
import { useStore } from '@/lib/store';
import { runPipeline } from '@/lib/coreMechanism/runPipeline';
import { DEFAULT_BUILDER_SELECTIONS, type BuilderSelections } from '@/lib/coreMechanism/runRoundComposable';
import type { SimParams } from '@/lib/mechanismExplorer/types';
import { SEM } from '@/lib/tokens';
import MathBlock from '@/components/dashboard/MathBlock';
import ScenarioBuilder from '@/components/lab/ScenarioBuilder';
import RoundRibbon from '@/components/inspector/RoundRibbon';
import ValidationPanel from '@/components/lab/ValidationPanel';
import {
  AGENT_PALETTE, CHART_MARGIN, GRID_PROPS, AXIS_TICK, AXIS_STROKE,
  TOOLTIP_STYLE, BRUSH_PROPS, agentName, fmt, downsample, movingAvg,
} from '@/components/lab/shared';
import { useChartZoom } from '@/hooks/useChartZoom';

const INVARIANTS = [
  { label: 'Budget balanced', desc: 'Total payouts equal total effective wagers.', color: SEM.payoff.main },
  { label: 'Cashflow identity', desc: 'Wealth change = payoff − deposit for every agent.', color: SEM.wealth.main },
  { label: 'Profit bounded', desc: 'No agent gains more than the total pool.', color: SEM.wager.main },
  { label: 'Absent excluded', desc: 'Missing agents get mᵢ = 0, no payoff.', color: SEM.score.main },
];

function PipelineArrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="shrink-0 text-slate-300">
      <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function PipelineNode({ label, sym, color, bgColor }: { label: string; sym: string; color: string; bgColor: string }) {
  return (
    <div className="shrink-0 rounded-xl border-2 px-3 py-2 text-center min-w-[72px]" style={{ borderColor: color + '40', background: bgColor }}>
      <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: color + 'bb' }}>{label}</div>
      <div className="text-sm font-mono font-semibold mt-0.5" style={{ color }}>{sym}</div>
    </div>
  );
}

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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Mechanism</h2>
          <p className="text-sm font-medium text-slate-700 mt-2">
            How does one round work, and why is the mechanism well-defined?
          </p>
        </div>

        {/* ── Pipeline diagram (compact) ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-4 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max">
            <PipelineNode label="Forecast" sym="rᵢ" color={SEM.outcome.main} bgColor={SEM.outcome.light} />
            <PipelineArrow />
            <PipelineNode label="Deposit" sym="bᵢ" color={SEM.deposit.main} bgColor={SEM.deposit.light} />
            <PipelineArrow />
            <PipelineNode label="Skill" sym="σᵢ" color={SEM.skill.main} bgColor={SEM.skill.light} />
            <PipelineArrow />
            <PipelineNode label="Eff. wager" sym="mᵢ" color={SEM.wager.main} bgColor={SEM.wager.light} />
            <PipelineArrow />
            <PipelineNode label="Aggregate" sym="r̂" color={SEM.aggregate.main} bgColor={SEM.aggregate.light} />
            <PipelineArrow />
            <PipelineNode label="Settlement" sym="Πᵢ" color={SEM.payoff.main} bgColor={SEM.payoff.light} />
            <PipelineArrow />
            <PipelineNode label="Wealth" sym="Wᵢ′" color={SEM.wealth.main} bgColor={SEM.wealth.light} />
          </div>
        </div>

        {/* ── Core equations + invariants row ── */}
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <MathBlock
            label="Effective wager"
            latex="m_{i,t} = b_{i,t}\bigl(\lambda + (1-\lambda)\,\sigma_{i,t}\bigr)"
            caption="Deposit filtered through the skill gate."
            accent
          />
          <MathBlock
            label="Skill-pool payoff"
            latex="\Pi^{\text{skill}}_{i,t} = m_{i,t}\left(1 + s_{i,t} - \bar{s}_t\right)"
            caption="Zero-sum redistribution: better-than-average scorers gain."
            accent
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {INVARIANTS.map(({ label, color }) => (
            <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium" style={{ background: color + '12', color }}>
              <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: color }}>✓</span>
              {label}
            </span>
          ))}
        </div>

        {/* ── Controls & View mode toggle ── */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setControlsOpen(!controlsOpen)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
          <div className="flex-1 min-w-0 space-y-4">

            {/* ══ ROUND SCRUBBER (always visible) ══ */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-0 z-20 shadow-sm">
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
                <div className="grid grid-cols-4 gap-2 mt-3">
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
                </div>
              )}
            </div>

            {/* ══ TIMELINE VIEW ══ */}
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
                    <span className="text-[11px] text-slate-400 italic">Click a point to jump to that round. Drag to zoom.</span>
                    <ZoomBadge isZoomed={errorZoom.state.isZoomed} onReset={errorZoom.reset} />
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart
                      data={errorData}
                      margin={CHART_MARGIN}
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
                        domain={[errorZoom.state.left, errorZoom.state.right]} />
                      <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
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

                {/* Skill + Wealth side by side */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-slate-800">Skill trajectories</h4>
                      <ZoomBadge isZoomed={skillZoom.state.isZoomed} onReset={skillZoom.reset} />
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart
                        data={skillData}
                        margin={CHART_MARGIN}
                        onClick={handleChartClick}
                        onMouseDown={skillZoom.onMouseDown}
                        onMouseMove={skillZoom.onMouseMove}
                        onMouseUp={skillZoom.onMouseUp}
                      >
                        <CartesianGrid {...GRID_PROPS} />
                        <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
                          domain={[skillZoom.state.left, skillZoom.state.right]} />
                        <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]} />
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

                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-slate-800">Wealth evolution</h4>
                      <ZoomBadge isZoomed={wealthZoom.state.isZoomed} onReset={wealthZoom.reset} />
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart
                        data={wealthData}
                        margin={CHART_MARGIN}
                        onClick={handleChartClick}
                        onMouseDown={wealthZoom.onMouseDown}
                        onMouseMove={wealthZoom.onMouseMove}
                        onMouseUp={wealthZoom.onMouseUp}
                      >
                        <CartesianGrid {...GRID_PROPS} />
                        <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE}
                          domain={[wealthZoom.state.left, wealthZoom.state.right]} />
                        <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
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

                <AgentBarCharts trace={trace} N={N} selectedAgent={selectedAgent} />
              </div>
            )}

            {/* ══ VALIDATION VIEW ══ */}
            {viewMode === 'validation' && (
              <ValidationPanel pipeline={pipeline} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Agent bar charts for round detail ── */

function AgentBarCharts({ trace, N, selectedAgent }: {
  trace: { deposits: number[]; influence: number[]; scores: number[]; profit: number[]; wealth_after: number[]; wealth_before: number[]; participated: boolean[]; activeCount: number };
  N: number;
  selectedAgent: number | null;
}) {
  const agentBarData = useMemo(() => Array.from({ length: N }, (_, i) => ({
    name: agentName(i), deposit: trace.deposits[i], influence: trace.influence[i],
    score: trace.scores[i], payoff: trace.profit[i], wealth: trace.wealth_after[i],
    active: trace.participated[i], idx: i,
  })), [trace, N]);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h4 className="text-sm font-semibold text-slate-800 mb-1">Deposits vs Wagers</h4>
        <p className="text-[11px] text-slate-400 mb-2">Deposit bᵢ (light) vs effective wager mᵢ (dark)</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={agentBarData} margin={CHART_MARGIN}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE} />
            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
            <Tooltip />
            <Bar dataKey="deposit" name="Deposit bᵢ" radius={[4, 4, 0, 0]} maxBarSize={28} opacity={0.4}>
              {agentBarData.map(d => <Cell key={d.idx} fill={d.active ? AGENT_PALETTE[d.idx % AGENT_PALETTE.length] : '#e2e8f0'} />)}
            </Bar>
            <Bar dataKey="influence" name="Wager mᵢ" radius={[4, 4, 0, 0]} maxBarSize={28}>
              {agentBarData.map(d => <Cell key={d.idx} fill={d.active ? AGENT_PALETTE[d.idx % AGENT_PALETTE.length] : '#e2e8f0'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h4 className="text-sm font-semibold text-slate-800 mb-1">Scores & Profit</h4>
        <p className="text-[11px] text-slate-400 mb-2">Score sᵢ (bars) and profit πᵢ (green = gain, red = loss)</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={agentBarData} margin={CHART_MARGIN}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="name" tick={AXIS_TICK} stroke={AXIS_STROKE} />
            <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
            <Tooltip />
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

/* recharts re-exports for the BarChart used in AgentBarCharts */
import { BarChart, Bar, Cell } from 'recharts';
