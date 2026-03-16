import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { useExperimentData } from '@/lib/useExperimentData';
import { fmtNum, AGENT_COLORS, ACCENT, agentDisplayName } from '@/lib/formatters';
import {
  getRoundData,
  getMaxRound,
  getRoundMetrics,
} from '@/lib/selectors';
import { runPipeline } from '@/lib/coreMechanism/runPipeline';
import type { DGPId } from '@/lib/coreMechanism/dgpSimulator';
import PageHeader from '@/components/dashboard/PageHeader';
import MetricCard from '@/components/dashboard/MetricCard';
import ChartCard from '@/components/dashboard/ChartCard';
import ExperimentContext from '@/components/dashboard/ExperimentContext';
import { LoadingState, EmptyState, ErrorState } from '@/components/dashboard/DataStates';
import AgentStateTable from '@/components/tables/AgentStateTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const MECHANISM_STEP_LABELS = [
  'Prior skill',
  'Participation',
  'Reports',
  'Deposits',
  'Aggregate',
  'Outcome',
  'Settlement',
  'Skill update',
] as const;

export default function RoundReplay() {
  const { selectedExperiment, currentRound, setCurrentRound, isPlaying, setIsPlaying } = useStore();
  const { skillWagerData, loading, error } = useExperimentData();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nAgents = selectedExperiment?.nAgents ?? 3;
  const maxRound = getMaxRound(skillWagerData, selectedExperiment?.rounds ?? 10000);
  const roundData = getRoundData(skillWagerData, currentRound);
  const { activeCount, totalWager, avgProfit, participationPct } = getRoundMetrics(
    roundData,
    nAgents,
  );

  const pipelineRounds = Math.min(selectedExperiment?.rounds ?? 500, 500);
  const pipeline = useMemo(() => {
    if (!selectedExperiment) return null;
    const dgpId: DGPId = ['baseline', 'latent_fixed', 'aggregation_method1', 'aggregation_method3'].includes(selectedExperiment.dgp as DGPId)
      ? (selectedExperiment.dgp as DGPId)
      : 'baseline';
    return runPipeline({
      dgpId,
      behaviourPreset: 'baseline',
      rounds: pipelineRounds,
      seed: 42,
      n: nAgents,
    });
  }, [selectedExperiment, nAgents, pipelineRounds]);

  const traceIndex = pipeline?.traces.length
    ? Math.min(currentRound, pipeline.traces.length - 1)
    : -1;
  const trace = traceIndex >= 0 ? pipeline!.traces[traceIndex] : null;

  const wagerChartData = roundData.map((d, i) => ({
    name: agentDisplayName(d.agent),
    wager: d.missing ? 0 : d.wager,
    profit: d.profit,
    active: !d.missing,
    idx: i,
  }));

  const handlePrev = useCallback(() => setCurrentRound(Math.max(0, currentRound - 1)), [currentRound, setCurrentRound]);
  const handleNext = useCallback(() => setCurrentRound(Math.min(maxRound, currentRound + 1)), [currentRound, maxRound, setCurrentRound]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentRound((prev: number) => {
          if (prev >= maxRound) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 300);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, maxRound, setCurrentRound, setIsPlaying]);

  const mechanismSteps = MECHANISM_STEP_LABELS;

  if (loading) {
    return (
      <div className="p-6 max-w-7xl">
        <PageHeader title="Round Replay" description="Step through the skill × stake pipeline round by round." />
        <LoadingState message="Loading timeseries data…" />
      </div>
    );
  }

  if (!selectedExperiment) {
    return (
      <div className="p-6 max-w-7xl">
        <PageHeader title="Round Replay" description="Step through the skill × stake pipeline round by round." />
        <EmptyState message="Select an experiment from the sidebar." />
      </div>
    );
  }

  if (skillWagerData.length === 0) {
    return (
      <div className="p-6 max-w-7xl">
        <PageHeader title="Round Replay" description="Step through the skill × stake pipeline round by round." />
        <ExperimentContext experiment={selectedExperiment} dataSource="timeseries" />
        <EmptyState message="No timeseries data for this experiment. Round-by-round view requires timeseries.csv." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl">
      <PageHeader
        title="Round Replay"
        description="Round-by-round view reconstructed from timeseries data. Step through participation, wagers, and settlement-driven skill updates."
      />
      {error && <ErrorState message="Data load failed; showing fallback." error={error} />}
      <ExperimentContext
        experiment={selectedExperiment}
        dataSource="timeseries (reconstructed by round)"
        className="mb-4"
      />

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button onClick={handlePrev} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm hover:bg-slate-200 transition-colors">
              ◀ Prev
            </button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors">
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button onClick={handleNext} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm hover:bg-slate-200 transition-colors">
              Next ▶
            </button>
          </div>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-xs text-slate-500 shrink-0">Round</span>
            <input
              type="range"
              min={0}
              max={maxRound}
              value={currentRound}
              onChange={(e) => setCurrentRound(Number(e.target.value))}
              className="flex-1 accent-blue-600"
            />
            <span className="text-sm font-mono text-slate-700 tabular-nums w-16 text-right">{currentRound} / {maxRound}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <MetricCard label="Round" value={String(currentRound)} accent />
        <MetricCard label="Active Agents" value={`${activeCount} / ${nAgents}`} />
        <MetricCard label="Total Wagers" value={fmtNum(totalWager, 2)} />
        <MetricCard label="Avg Profit" value={fmtNum(avgProfit)} />
        <MetricCard label="Participation" value={`${participationPct.toFixed(0)}%`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Effective Wagers This Round" subtitle="Bar height = wager size, colour = agent">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={wagerChartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <Bar dataKey="wager" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {wagerChartData.map((d, i) => (
                  <Cell key={i} fill={d.active ? AGENT_COLORS[d.idx % AGENT_COLORS.length] : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Agent State" subtitle="Detailed view of each agent's state this round">
          <AgentStateTable data={skillWagerData} round={currentRound} />
        </ChartCard>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Skill × stake pipeline</h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {mechanismSteps.map((step, i) => (
            <div key={step} className="flex items-center gap-1 shrink-0">
              <div
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: i <= 4 ? `${ACCENT}15` : i <= 6 ? '#0d948815' : '#10b98115',
                  color: i <= 4 ? ACCENT : i <= 6 ? '#d97706' : '#059669',
                  border: `1px solid ${i <= 4 ? ACCENT + '30' : i <= 6 ? '#0d948830' : '#10b98130'}`,
                }}
              >
                {step}
              </div>
              {i < mechanismSteps.length - 1 && <span className="text-slate-300 text-xs">→</span>}
            </div>
          ))}
        </div>
        {trace && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
            <p className="text-xs text-slate-500">Mechanism values for this round (report → influence → pooled output):</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="font-medium text-slate-600 mb-1">Prior skill σ</p>
                <p className="font-mono text-slate-800">{trace.sigma_t.map((s, i) => `${agentDisplayName(i)} ${fmtNum(s, 3)}`).join(', ')}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="font-medium text-slate-600 mb-1">Participation</p>
                <p className="font-mono text-slate-800">{trace.participated.map((p, i) => (p ? agentDisplayName(i) : null)).filter(Boolean).join(', ') || '—'}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="font-medium text-slate-600 mb-1">Reports r_i</p>
                <p className="font-mono text-slate-800">{trace.reports.map((r, i) => trace.participated[i] ? `${agentDisplayName(i)} ${fmtNum(r, 3)}` : null).filter(Boolean).join(', ') || '—'}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="font-medium text-slate-600 mb-1">Deposits b_i</p>
                <p className="font-mono text-slate-800">{trace.deposits.map((d, i) => `${agentDisplayName(i)} ${fmtNum(d, 2)}`).join(', ')}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="font-medium text-slate-600 mb-1">Influence (effective)</p>
                <p className="font-mono text-slate-800">{trace.influence.map((v, i) => `${agentDisplayName(i)} ${fmtNum(v, 2)}`).join(', ')}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="font-medium text-slate-600 mb-1">Weights w_i</p>
                <p className="font-mono text-slate-800">{trace.weights.map((w, i) => `${agentDisplayName(i)} ${(w * 100).toFixed(1)}%`).join(', ')}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="font-medium text-slate-600 mb-1">Aggregate r̂</p>
                <p className="font-mono text-slate-800">{fmtNum(trace.r_hat, 4)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="font-medium text-slate-600 mb-1">Outcome y</p>
                <p className="font-mono text-slate-800">{fmtNum(trace.y, 4)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="font-medium text-slate-600 mb-1">Settlement π_i</p>
                <p className="font-mono text-slate-800">{trace.profit.map((p, i) => `${agentDisplayName(i)} ${fmtNum(p, 2)}`).join(', ')}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="font-medium text-slate-600 mb-1">Skill update σ_new</p>
                <p className="font-mono text-slate-800">{trace.sigma_new.map((s, i) => `${agentDisplayName(i)} ${fmtNum(s, 3)}`).join(', ')}</p>
              </div>
            </div>
          </div>
        )}
        {!trace && selectedExperiment && (
          <p className="mt-3 text-xs text-slate-500">Select a round within the pipeline range to see report → influence → pooled output.</p>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">Round Summary</h3>
        <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
          <p>
            <span className="font-medium text-slate-700">{activeCount} of {nAgents} agents</span> participated this round
            ({participationPct.toFixed(0)}% participation rate).
          </p>
          {roundData.filter(d => d.profit > 0.001).length > 0 && (
            <p>
              <span className="text-emerald-600 font-medium">Gained:</span>{' '}
              {roundData.filter(d => d.profit > 0.001).map(d => `${agentDisplayName(d.agent)} (+${fmtNum(d.profit)})`).join(', ')}
            </p>
          )}
          {roundData.filter(d => d.profit < -0.001).length > 0 && (
            <p>
              <span className="text-red-500 font-medium">Lost:</span>{' '}
              {roundData.filter(d => d.profit < -0.001).map(d => `${agentDisplayName(d.agent)} (${fmtNum(d.profit)})`).join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
