import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { CalibrationPoint } from '@/lib/types';
import ChartCard from '../dashboard/ChartCard';

interface Props {
  data: CalibrationPoint[];
}

export default function CalibrationChart({ data }: Props) {
  return (
    <ChartCard title="Reliability Diagram" subtitle="Coverage vs nominal quantile — perfect calibration follows the diagonal">
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="tau"
            type="number"
            domain={[0, 1]}
            tick={{ fontSize: 10 }}
            stroke="#94a3b8"
            label={{ value: 'Nominal τ', position: 'insideBottom', offset: -5, fontSize: 10 }}
          />
          <YAxis
            dataKey="pHat"
            type="number"
            domain={[0, 1]}
            tick={{ fontSize: 10 }}
            stroke="#94a3b8"
            label={{ value: 'Observed p̂', angle: -90, position: 'insideLeft', fontSize: 10 }}
          />
          <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="#94a3b8" strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
            formatter={(value: unknown) => typeof value === 'number' ? value.toFixed(3) : String(value ?? '')}
          />
          <Scatter data={data} fill="#2563eb" r={5} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
