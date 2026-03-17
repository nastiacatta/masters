import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import type { ForecastSeriesPoint } from '@/lib/types';
import { WEIGHTING_COLORS, metricLabel } from '@/lib/formatters';
import ChartCard from '../dashboard/ChartCard';
import { useState } from 'react';
import TabGroup from '../dashboard/TabGroup';

interface Props {
  data: ForecastSeriesPoint[];
}

export default function ForecastQualityChart({ data }: Props) {
  const [mode, setMode] = useState<'rolling' | 'cumulative'>('cumulative');

  const keys = mode === 'cumulative'
    ? ['crpsUniformCum', 'crpsDepositCum', 'crpsSkillCum', 'crpsMechanismCum', 'crpsBestSingleCum'] as const
    : ['crpsUniform', 'crpsDeposit', 'crpsSkill', 'crpsMechanism', 'crpsBestSingle'] as const;

  const initialStart = Math.max(0, data.length - 120);

  return (
    <ChartCard
      title="Aggregate Forecast Quality"
      subtitle="CRPS across weighting rules: lower is better"
    >
      <TabGroup
        tabs={[
          { id: 'cumulative', label: 'Cumulative' },
          { id: 'rolling', label: 'Per-round' },
        ]}
        active={mode}
        onChange={(v) => setMode(v as 'rolling' | 'cumulative')}
      />
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          syncId="round-window"
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="t" tick={{ fontSize: 12 }} stroke="#94a3b8" label={{ value: 'Round', position: 'insideBottom', offset: -2, fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
            formatter={(value: unknown, name: unknown) => [typeof value === 'number' ? value.toFixed(5) : String(value ?? ''), metricLabel(String(name ?? ''))]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v: string) => metricLabel(v)} />
          {keys.map(key => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={WEIGHTING_COLORS[key]}
              strokeWidth={key.includes('Mechanism') || key.includes('mechanism') ? 2.5 : 1.2}
              dot={false}
              strokeOpacity={key.includes('Mechanism') || key.includes('mechanism') ? 1 : 0.6}
            />
          ))}
          <Brush
            dataKey="t"
            height={28}
            startIndex={initialStart}
            endIndex={data.length - 1}
            travellerWidth={10}
            stroke="#94a3b8"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
