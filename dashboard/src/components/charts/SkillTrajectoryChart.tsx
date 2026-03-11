import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SkillWagerPoint, FixedDepositPoint } from '@/lib/types';
import { AGENT_COLORS, agentDisplayName } from '@/lib/formatters';
import ChartCard from '../dashboard/ChartCard';

interface Props {
  data: (SkillWagerPoint | FixedDepositPoint)[];
  title?: string;
  yKey?: 'sigma' | 'cumProfit' | 'wager' | 'mOverB';
  yLabel?: string;
}

export default function SkillTrajectoryChart({
  data,
  title = 'Online Skill Trajectories',
  yKey = 'sigma',
  yLabel = 'σ (skill)',
}: Props) {
  const agents = [...new Set(data.map(d => d.agent))];
  const maxT = Math.max(...data.map(d => d.t));

  const pivoted: Record<string, Record<number, number>>[] = [];
  const chartData: Record<string, number | null>[] = [];

  for (let t = 0; t <= maxT; t++) {
    const row: Record<string, number | null> = { t };
    for (const a of agents) {
      const pt = data.find(d => d.agent === a && d.t === t);
      row[`agent_${a}`] = pt ? (pt as unknown as Record<string, number>)[yKey] ?? null : null;
    }
    chartData.push(row);
  }

  void pivoted;

  const sampled = chartData.length > 200
    ? chartData.filter((_, i) => i % Math.ceil(chartData.length / 200) === 0)
    : chartData;

  return (
    <ChartCard title={title} subtitle={`${yLabel} over time by agent`}>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={sampled} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="t" tick={{ fontSize: 10 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {agents.map((a, i) => (
            <Line
              key={a}
              type="monotone"
              dataKey={`agent_${a}`}
              name={agentDisplayName(a)}
              stroke={AGENT_COLORS[i % AGENT_COLORS.length]}
              strokeWidth={1.2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
