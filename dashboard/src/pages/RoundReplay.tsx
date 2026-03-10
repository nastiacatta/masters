import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { useExperimentData } from '@/lib/useExperimentData';
import { fmtNum, AGENT_COLORS, ACCENT } from '@/lib/formatters';
import PageHeader from '@/components/dashboard/PageHeader';
import MetricCard from '@/components/dashboard/MetricCard';
import ChartCard from '@/components/dashboard/ChartCard';
import AgentStateTable from '@/components/tables/AgentStateTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

export default function RoundReplay() {
  const { selectedExperiment, currentRound, setCurrentRound, isPlaying, setIsPlaying } = useStore();
  const { skillWagerData, loading } = useExperimentData();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nAgents = selectedExperiment?.nAgents ?? 3;
  const maxRound = skillWagerData.length > 0
    ? Math.max(...skillWagerData.map(d => d.t))
    : (selectedExperiment?.rounds ?? 50) - 1;

  const roundData = skillWagerData.filter(d => d.t === currentRound);
  const activeCount = roundData.filter(d => !d.missing).length;
  const totalWager = roundData.reduce((s, d) => s + (d.missing ? 0 : d.wager), 0);
  const avgProfit = roundData.length > 0
    ? roundData.reduce((s, d) => s + d.profit, 0) / roundData.length
    : 0;

  const wagerChartData = roundData.map((d, i) => ({
    name: `A${d.agent}`,
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

  const mechanismSteps = [
    'Prior skill', 'Participation', 'Reports', 'Deposits',
    'Aggregate', 'Outcome', 'Settlement', 'Skill update',
  ];

  if (loading) {
    return <div className="p-8"><p className="text-slate-400">Loading…</p></div>;
  }

  return (
    <div className="p-6 max-w-7xl">
      <PageHeader
        title="Round Replay"
        description="Step through the mechanism round by round. Observe how agents participate, wager, and how the settlement updates skills."
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
        <MetricCard label="Participation" value={`${nAgents > 0 ? ((activeCount / nAgents) * 100).toFixed(0) : 0}%`} />
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
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Mechanism Pipeline</h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {mechanismSteps.map((step, i) => (
            <div key={step} className="flex items-center gap-1 shrink-0">
              <div
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: i <= 4 ? `${ACCENT}15` : i <= 6 ? '#f59e0b15' : '#10b98115',
                  color: i <= 4 ? ACCENT : i <= 6 ? '#d97706' : '#059669',
                  border: `1px solid ${i <= 4 ? ACCENT + '30' : i <= 6 ? '#f59e0b30' : '#10b98130'}`,
                }}
              >
                {step}
              </div>
              {i < mechanismSteps.length - 1 && <span className="text-slate-300 text-xs">→</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">Round Summary</h3>
        <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
          <p>
            <span className="font-medium text-slate-700">{activeCount} of {nAgents} agents</span> participated this round
            ({nAgents > 0 ? ((activeCount / nAgents) * 100).toFixed(0) : 0}% participation rate).
          </p>
          {roundData.filter(d => d.profit > 0.001).length > 0 && (
            <p>
              <span className="text-emerald-600 font-medium">Gained:</span>{' '}
              {roundData.filter(d => d.profit > 0.001).map(d => `Agent ${d.agent} (+${fmtNum(d.profit)})`).join(', ')}
            </p>
          )}
          {roundData.filter(d => d.profit < -0.001).length > 0 && (
            <p>
              <span className="text-red-500 font-medium">Lost:</span>{' '}
              {roundData.filter(d => d.profit < -0.001).map(d => `Agent ${d.agent} (${fmtNum(d.profit)})`).join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
