import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard from '@/components/dashboard/ChartCard';
import {
  AXIS_STROKE,
  AXIS_TICK,
  GRID_PROPS,
  TOOLTIP_STYLE,
  fmt,
} from '@/components/lab/shared';

export interface DeltaBarDatum {
  label: string;
  delta: number;
  se?: number;
  color: string;
}

interface DeltaBarChartProps {
  data: DeltaBarDatum[];
  /** Label for the zero reference line */
  baselineLabel?: string;
  /** X-axis label */
  metricLabel?: string;
}

/** Sorted data row with rank badge text for the Y-axis label. */
interface SortedRow {
  name: string;
  delta: number;
  se: number;
  color: string;
  rank: string;
}

export default function DeltaBarChart({
  data,
  baselineLabel = 'Baseline (equal)',
  metricLabel = 'Δ CRPS (×10⁴)',
}: DeltaBarChartProps) {
  // Sort ascending by delta (most negative = best accuracy first)
  const sorted: SortedRow[] = [...data]
    .sort((a, b) => a.delta - b.delta)
    .map((d, i) => ({
      name: `#${i + 1}  ${d.label}`,
      delta: d.delta,
      se: d.se ?? 0,
      color: d.color,
      rank: `#${i + 1}`,
    }));

  return (
    <ChartCard
      title="Accuracy Ranking"
      subtitle="Bars show Δ vs baseline — left of zero is better."
      help={{
        term: 'Delta Bar Chart',
        definition:
          'Horizontal bars showing the difference in accuracy (ΔCRPS) relative to the equal-weight baseline for each method.',
        interpretation:
          'Negative values (bars extending left) indicate better accuracy than the baseline. Methods are ranked from best (top) to worst (bottom).',
        axes: { x: metricLabel, y: 'Method (ranked)' },
      }}
    >
      <ResponsiveContainer width="100%" height={Math.max(250, sorted.length * 52 + 40)}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 8, right: 48, bottom: 8, left: 8 }}
        >
          <CartesianGrid {...GRID_PROPS} horizontal={false} />
          <XAxis
            type="number"
            tick={AXIS_TICK}
            stroke={AXIS_STROKE}
            label={{
              value: metricLabel,
              position: 'insideBottom',
              offset: -2,
              fontSize: 10,
              fill: '#94a3b8',
            }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={AXIS_TICK}
            stroke={AXIS_STROKE}
            width={140}
          />
          <ReferenceLine
            x={0}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            label={{
              value: baselineLabel,
              position: 'top',
              fontSize: 9,
              fill: '#94a3b8',
            }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE as React.CSSProperties}
            formatter={(value: unknown, _name: unknown, props: { payload?: SortedRow }) => {
              const v = Number(value);
              const se = props.payload?.se;
              const seStr = se && se > 0 ? ` ± ${fmt(se * 1.96, 2)}` : '';
              return [
                `${Number.isFinite(v) ? fmt(v, 2) : '—'}${seStr} points`,
                'Δ vs baseline',
              ];
            }}
          />
          <Bar
            dataKey="delta"
            radius={[0, 4, 4, 0]}
            maxBarSize={28}
            isAnimationActive={true}
            animationDuration={300}
          >
            {sorted.map((d) => (
              <Cell key={d.name} fill={d.color} opacity={0.9} />
            ))}
            <LabelList
              dataKey="delta"
              position="right"
              formatter={(v: string | number | boolean | null | undefined) => {
                const n = Number(v);
                return Number.isFinite(n) ? fmt(n, 2) : '—';
              }}
              style={{ fontSize: 10, fill: '#64748b' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
