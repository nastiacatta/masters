import { useStore } from '@/lib/store';
import { useExperimentData } from '@/lib/useExperimentData';
import { fmtNum, scenarioLabel } from '@/lib/formatters';
import PageHeader from '@/components/dashboard/PageHeader';
import ParticipationHeatmap from '@/components/charts/ParticipationHeatmap';
import SkillTrajectoryChart from '@/components/charts/SkillTrajectoryChart';
import BehaviourComparisonChart from '@/components/charts/BehaviourComparisonChart';
import ChartCard from '@/components/dashboard/ChartCard';
import MetricCard from '@/components/dashboard/MetricCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = ['#64748b', '#6366f1', '#f59e0b', '#10b981', '#ec4899', '#ef4444'];

export default function Behaviour() {
  const { selectedExperiment } = useStore();
  const { skillWagerData, behaviourScenarios, loading } = useExperimentData();
  const nAgents = selectedExperiment?.nAgents ?? 6;
  const T = selectedExperiment?.rounds ?? 100;

  const agents = [...new Set(skillWagerData.map(d => d.agent))];

  const participationFreq = agents.map(a => {
    const agentRounds = skillWagerData.filter(d => d.agent === a);
    const active = agentRounds.filter(d => !d.missing).length;
    return { agent: `A${a}`, frequency: agentRounds.length > 0 ? active / agentRounds.length : 0 };
  });

  const finalWealth = agents.map(a => {
    const last = skillWagerData.filter(d => d.agent === a).slice(-1)[0];
    return { agent: `A${a}`, wealth: last?.cumProfit ?? 0 };
  });

  const overallParticipation = skillWagerData.length > 0
    ? skillWagerData.filter(d => !d.missing).length / skillWagerData.length
    : 0;

  if (loading) {
    return <div className="p-8"><p className="text-slate-400">Loading…</p></div>;
  }

  return (
    <div className="p-6 max-w-7xl">
      <PageHeader
        title="Behaviour"
        description="Examine participation patterns, staking strategies, and the impact of adversarial behaviour on market outcomes."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Overall Participation" value={`${(overallParticipation * 100).toFixed(1)}%`} />
        <MetricCard label="Agents" value={String(nAgents)} />
        <MetricCard label="Rounds" value={String(T)} />
        <MetricCard label="Scenarios" value={String(behaviourScenarios.length)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ParticipationHeatmap data={skillWagerData} />
        <SkillTrajectoryChart data={skillWagerData} title="Online Skill Trajectories" yKey="sigma" yLabel="σ (skill)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <SkillTrajectoryChart data={skillWagerData} title="Wealth Trajectories" yKey="cumProfit" yLabel="Cumulative profit" />
        <SkillTrajectoryChart data={skillWagerData} title="Effective Wager over Time" yKey="wager" yLabel="Wager" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Final Wealth Distribution" subtitle="Cumulative profit at the end of the simulation">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={finalWealth} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="agent" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="wealth" radius={[4, 4, 0, 0]} maxBarSize={30}>
                {finalWealth.map((d, i) => (
                  <Cell key={i} fill={d.wealth >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Participation Frequency" subtitle="Fraction of rounds each agent was active">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={participationFreq} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="agent" tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" domain={[0, 1]} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={(v: unknown) => typeof v === 'number' ? `${(v * 100).toFixed(1)}%` : String(v ?? '')} />
              <Bar dataKey="frequency" radius={[4, 4, 0, 0]} maxBarSize={30}>
                {participationFreq.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <BehaviourComparisonChart data={behaviourScenarios} />

        <ChartCard title="Scenario Notes" subtitle="Summary of behaviour models tested">
          <div className="space-y-2 text-xs text-slate-600 max-h-64 overflow-y-auto">
            {behaviourScenarios.map((s, i) => (
              <div key={s.scenario} className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50">
                <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <div>
                  <span className="font-medium text-slate-700">{scenarioLabel(s.scenario)}</span>
                  <span className="text-slate-400 ml-2">Gini={fmtNum(s.finalGini, 3)} · N_eff={fmtNum(s.finalNEff, 1)}</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
