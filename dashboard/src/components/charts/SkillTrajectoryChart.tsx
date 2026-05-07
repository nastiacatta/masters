import { useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { SkillWagerPoint, FixedDepositPoint } from '@/lib/types';
import { AGENT_COLORS, agentDisplayName } from '@/lib/formatters';
import ChartCard from '../dashboard/ChartCard';

interface Props {
  data: (SkillWagerPoint | FixedDepositPoint)[];
  title?: string;
  yKey?: 'sigma' | 'cumProfit' | 'wager' | 'mOverB';
  yLabel?: string;
  targetValues?: number[];
}

export default function SkillTrajectoryChart({
  data,
  title = 'Online Skill Trajectories',
  yKey = 'sigma',
  yLabel = 'σ (skill)',
  targetValues,
}: Props) {
  const agents = [...new Set(data.map(d => d.agent))];
  const maxT = Math.max(...data.map(d => d.t));

  const chartData: Record<string, number | null>[] = [];

  for (let t = 0; t <= maxT; t++) {
    const row: Record<string, number | null> = { t };
    for (const a of agents) {
      const pt = data.find(d => d.agent === a && d.t === t);
      row[`agent_${a}`] = pt ? (pt as unknown as Record<string, number>)[yKey] ?? null : null;
    }
    chartData.push(row);
  }

  const [hiddenAgents, setHiddenAgents] = useState<Set<string>>(new Set());
  const toggleAgent = useCallback((dataKey: string) => {
    setHiddenAgents(prev => {
      const next = new Set(prev);
      if (next.has(dataKey)) next.delete(dataKey);
      else next.add(dataKey);
      return next;
    });
  }, []);

  return (
    <ChartCard
      title={title}
      subtitle={`${yLabel} over time by agent`}
      help={{
        term: title,
        definition: 'Tracks each agent\'s online skill estimate (σ) or related metric over rounds.',
        interpretation: 'Rising lines indicate improving skill estimates. Click legend items to toggle individual agents.',
        axes: { x: 'Round', y: yLabel },
      }}
    >
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          syncId="round-window"
          margin={{ top: 10, right: 24, bottom: 10, left: 28 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e4dfd3" strokeOpacity={0.8} />
          <XAxis dataKey="t" tick={{ fontSize: 12, fill: '#5a6175' }} stroke="#8c92a3" />
          <YAxis
            tick={{ fontSize: 12, fill: '#5a6175' }}
            stroke="#8c92a3"
            label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 8, fontSize: 12, fill: '#5a6175' }}
          />
          <Tooltip contentStyle={{
            fontSize: 12, borderRadius: 6,
            border: '1px solid #d1d5db',
            background: 'rgba(255, 253, 248, 0.98)',
            boxShadow: '0 12px 32px -8px rgba(15, 23, 42, 0.18)',
          }} />
          <Legend
            wrapperStyle={{ fontSize: 11, cursor: 'pointer' }}
            onClick={(e) => {
              if (e?.dataKey) toggleAgent(String(e.dataKey));
            }}
          />
          {agents.map((a, i) => (
            <Line
              key={a}
              type="monotone"
              dataKey={`agent_${a}`}
              name={agentDisplayName(a)}
              stroke={AGENT_COLORS[i % AGENT_COLORS.length]}
              strokeWidth={1.8}
              dot={false}
              connectNulls
              hide={hiddenAgents.has(`agent_${a}`)}
              isAnimationActive={true}
              animationDuration={300}
            />
          ))}
          {targetValues && targetValues.map((target, i) => {
            if (i >= agents.length) return null;
            const agentKey = `agent_${agents[i]}`;
            if (hiddenAgents.has(agentKey)) return null;
            const color = AGENT_COLORS[i % AGENT_COLORS.length];
            return (
              <ReferenceLine
                key={`target_${agents[i]}`}
                y={target}
                stroke={color}
                strokeOpacity={0.4}
                strokeDasharray="4 4"
                ifOverflow="extendDomain"
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
