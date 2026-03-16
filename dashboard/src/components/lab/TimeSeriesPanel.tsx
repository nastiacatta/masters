import { useMemo, useState } from 'react';
import {
  AreaChart, Area, LineChart, Line, Bar,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, Label, Brush, Cell,
} from 'recharts';
import type { PipelineResult } from '@/lib/coreMechanism/runPipeline';
import {
  AGENT_PALETTE, CHART_MARGIN, GRID_PROPS, AXIS_TICK, AXIS_STROKE,
  TOOLTIP_STYLE, agentName, fmt, downsample, movingAvg,
} from './shared';

interface Props {
  pipeline: PipelineResult;
  selectedAgent: number | null;
  setSelectedAgent: (i: number | null) => void;
  onRoundClick?: (r: number) => void;
}

function Section({ title, question, children }: { title: string; question: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="mb-1">
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        <p className="text-[11px] text-slate-400 mt-0.5 italic">{question}</p>
      </div>
      {children}
    </div>
  );
}

function SmartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string; dataKey: string }>; label?: number }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE} className="max-w-xs">
      <div className="font-medium text-slate-700 text-[11px] mb-1">Round {label}</div>
      <div className="space-y-0.5 max-h-48 overflow-y-auto">
        {payload.filter(p => p.value != null && p.name !== '').map((p) => (
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

export default function TimeSeriesPanel({ pipeline, selectedAgent, setSelectedAgent, onRoundClick }: Props) {
  const [, setBrushRange] = useState<{ startIndex: number; endIndex: number } | null>(null);
  const N = pipeline.traces[0]?.participated.length ?? 6;
  const T = pipeline.traces.length;

  const errorData = useMemo(() => {
    const errors = pipeline.rounds.map((r) => r.error);
    const ma = movingAvg(errors, Math.max(5, Math.floor(T / 20)));
    return downsample(
      pipeline.rounds.map((r, i) => ({
        round: r.round,
        error: r.error,
        ma: ma[i],
      })),
      400,
    );
  }, [pipeline.rounds, T]);

  const skillData = useMemo(() => {
    return downsample(
      pipeline.traces.map((t, i) => {
        const point: Record<string, number> = { round: i + 1 };
        for (let j = 0; j < N; j++) {
          point[`F${j + 1}`] = t.sigma_t[j];
        }
        return point;
      }),
      400,
    );
  }, [pipeline.traces, N]);

  const wealthData = useMemo(() => {
    return downsample(
      pipeline.traces.map((t, i) => {
        const point: Record<string, number> = { round: i + 1 };
        for (let j = 0; j < N; j++) {
          point[`F${j + 1}`] = t.wealth_after[j];
        }
        return point;
      }),
      400,
    );
  }, [pipeline.traces, N]);

  const participationData = useMemo(() => {
    return downsample(
      pipeline.rounds.map((r) => ({
        round: r.round,
        active: r.participation,
        rate: r.participation / N,
      })),
      400,
    );
  }, [pipeline.rounds, N]);

  const concentrationData = useMemo(() => {
    return downsample(
      pipeline.rounds.map((r) => ({
        round: r.round,
        hhi: r.hhi,
        nEff: r.nEff,
        topShare: r.topShare,
      })),
      400,
    );
  }, [pipeline.rounds]);

  const cumulativeErrorData = useMemo(() => {
    let cum = 0;
    return downsample(
      pipeline.rounds.map((r, i) => {
        cum += r.error;
        return { round: r.round, cumError: cum / (i + 1) };
      }),
      400,
    );
  }, [pipeline.rounds]);

  const meanError = pipeline.summary.meanError;

  return (
    <div className="space-y-5">
      {/* Agent selector */}
      <div className="flex items-center gap-1.5 flex-wrap bg-white rounded-xl border border-slate-200 p-3">
        <span className="text-[11px] text-slate-400 font-medium mr-1">Highlight:</span>
        <button
          type="button"
          onClick={() => setSelectedAgent(null)}
          className={`px-2 py-1 rounded-full text-[11px] font-medium transition-all ${
            selectedAgent == null ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          All
        </button>
        {Array.from({ length: N }, (_, i) => (
          <button
            key={i}
            type="button"
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

      {/* Row 1: Error charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Forecast Error" question="How accurate is the aggregate forecast over time?">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={errorData} margin={CHART_MARGIN} onClick={(e) => e?.activeLabel && onRoundClick?.(Number(e.activeLabel) - 1)}>
              <defs>
                <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <Tooltip content={<SmartTooltip />} />
              <ReferenceLine y={meanError} stroke="#94a3b8" strokeDasharray="4 4">
                <Label value={`μ = ${fmt(meanError, 4)}`} position="right" fill="#94a3b8" fontSize={9} />
              </ReferenceLine>
              <Area type="monotone" dataKey="error" name="Per-round error" stroke="#ef4444" fill="url(#errorGradient)" strokeWidth={1} dot={false} />
              <Line type="monotone" dataKey="ma" name="Moving avg" stroke="#dc2626" strokeWidth={2} dot={false} strokeDasharray="0" />
              {errorData.length > 40 && (
                <Brush dataKey="round" height={24} stroke="#cbd5e1" fill="#f8fafc" travellerWidth={8}
                  onChange={(range) => setBrushRange(range as { startIndex: number; endIndex: number })} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Cumulative Mean Error" question="Is the forecast improving over time?">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cumulativeErrorData} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id="cumErrorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <Tooltip content={<SmartTooltip />} />
              <Area type="monotone" dataKey="cumError" name="Cumulative mean error" stroke="#0ea5e9" fill="url(#cumErrorGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* Row 2: Skill & Wealth trajectories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Skill Trajectories" question="How does each agent's estimated skill evolve?">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={skillData} margin={CHART_MARGIN}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, 1]} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
              <ReferenceLine y={pipeline.params.sigma_min} stroke="#94a3b8" strokeDasharray="4 4">
                <Label value="σ_min" position="right" fill="#94a3b8" fontSize={9} />
              </ReferenceLine>
              {Array.from({ length: N }, (_, i) => (
                <Line
                  key={i}
                  type="monotone"
                  dataKey={`F${i + 1}`}
                  name={agentName(i)}
                  stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                  strokeWidth={selectedAgent == null ? 1.5 : selectedAgent === i ? 2.5 : 0.5}
                  strokeOpacity={selectedAgent == null ? 0.85 : selectedAgent === i ? 1 : 0.2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Wealth Evolution" question="Who accumulates wealth and who goes bankrupt?">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={wealthData} margin={CHART_MARGIN}>
              <defs>
                {AGENT_PALETTE.map((c, i) => (
                  <linearGradient key={i} id={`wGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
              <ReferenceLine y={20} stroke="#94a3b8" strokeDasharray="4 4">
                <Label value="W₀" position="right" fill="#94a3b8" fontSize={9} />
              </ReferenceLine>
              {Array.from({ length: N }, (_, i) => (
                <Line
                  key={i}
                  type="monotone"
                  dataKey={`F${i + 1}`}
                  name={agentName(i)}
                  stroke={AGENT_PALETTE[i % AGENT_PALETTE.length]}
                  strokeWidth={selectedAgent == null ? 1.5 : selectedAgent === i ? 2.5 : 0.5}
                  strokeOpacity={selectedAgent == null ? 0.85 : selectedAgent === i ? 1 : 0.2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* Row 3: Participation & Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Participation" question="How many agents are active each round?">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={participationData} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id="participationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} domain={[0, N]} />
              <Tooltip content={<SmartTooltip />} />
              <Bar dataKey="active" name="Active agents" fill="url(#participationGrad)" radius={[2, 2, 0, 0]} maxBarSize={8}>
                {participationData.map((d, i) => (
                  <Cell key={i} fill={d.rate >= 0.8 ? '#10b981' : d.rate >= 0.5 ? '#f59e0b' : '#ef4444'} opacity={0.7} />
                ))}
              </Bar>
              <ReferenceLine y={N} stroke="#94a3b8" strokeDasharray="4 4">
                <Label value="N" position="right" fill="#94a3b8" fontSize={9} />
              </ReferenceLine>
            </ComposedChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Market Concentration" question="Is influence distributed fairly or monopolised?">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={concentrationData} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id="hhiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="round" tick={AXIS_TICK} stroke={AXIS_STROKE} />
              <YAxis yAxisId="hhi" tick={AXIS_TICK} stroke={AXIS_STROKE} orientation="left" domain={[0, 1]} />
              <YAxis yAxisId="neff" tick={AXIS_TICK} stroke={AXIS_STROKE} orientation="right" />
              <Tooltip content={<SmartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
              <Area yAxisId="hhi" type="monotone" dataKey="hhi" name="HHI" stroke="#8b5cf6" fill="url(#hhiGrad)" strokeWidth={1.5} dot={false} />
              <Line yAxisId="neff" type="monotone" dataKey="nEff" name="N_eff" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              <Line yAxisId="hhi" type="monotone" dataKey="topShare" name="Top share" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            </ComposedChart>
          </ResponsiveContainer>
        </Section>
      </div>
    </div>
  );
}
