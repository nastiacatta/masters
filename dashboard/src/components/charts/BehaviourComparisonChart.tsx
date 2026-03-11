import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { BehaviourScenario } from '@/lib/types';
import { scenarioLabel } from '@/lib/formatters';
import ChartCard from '../dashboard/ChartCard';
import { useState } from 'react';
import TabGroup from '../dashboard/TabGroup';

interface Props {
  data: BehaviourScenario[];
}

const COLORS = ['#64748b', '#6366f1', '#0d9488', '#10b981', '#ec4899', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function BehaviourComparisonChart({ data }: Props) {
  const [metric, setMetric] = useState<'finalGini' | 'finalNEff'>('finalGini');

  const chartData = data.map((d, i) => ({
    name: scenarioLabel(d.scenario),
    value: d[metric],
    idx: i,
  }));

  return (
    <ChartCard title="Behaviour Scenario Comparison" subtitle="How different agent behaviours affect market concentration">
      <TabGroup
        tabs={[
          { id: 'finalGini', label: 'Gini' },
          { id: 'finalNEff', label: 'N_eff' },
        ]}
        active={metric}
        onChange={(v) => setMetric(v as 'finalGini' | 'finalNEff')}
      />
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 100 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" width={95} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
