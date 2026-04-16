import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  type LabelProps,
} from 'recharts';
import ChartCard from '@/components/dashboard/ChartCard';
import type { DataProvenance } from '@/components/dashboard/ChartCard';
import {
  AXIS_STROKE,
  AXIS_TICK,
  GRID_PROPS,
  TOOLTIP_STYLE,
  fmt,
} from '@/components/lab/shared';

/* ── Types ─────────────────────────────────────────────────────────── */

export interface TradeOffPoint {
  /** Internal method key */
  method: string;
  /** Display label */
  label: string;
  /** X-axis: CRPS improvement (positive = better) */
  crpsImprovement: number;
  /** Y-axis: Gini coefficient (lower = better) */
  gini: number;
  /** Point colour */
  color: string;
}

interface TradeOffScatterProps {
  data: TradeOffPoint[];
  /** Optional title override */
  title?: string;
  /** Data provenance badge */
  provenance?: DataProvenance;
}

/* ── Custom label renderer for scatter points ──────────────────────── */

function renderPointLabel(props: LabelProps & { index?: number }, data: TradeOffPoint[]) {
  const { x, y, index } = props;
  if (index == null || !data[index]) return null;
  const point = data[index];
  // Alternate above/below to reduce overlap
  const above = index % 2 === 0;
  return (
    <text
      x={Number(x)}
      y={above ? Number(y) - 16 : Number(y) + 20}
      textAnchor="middle"
      fill={point.color}
      fontSize={11}
      fontWeight={600}
    >
      {point.label}
    </text>
  );
}

/* ── Custom active shape for scatter dots ──────────────────────────── */

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: TradeOffPoint;
}

function renderDot(props: DotProps) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={8}
      fill={payload.color}
      stroke="#fff"
      strokeWidth={2}
      opacity={0.9}
    />
  );
}

/* ── Component ─────────────────────────────────────────────────────── */

export default function TradeOffScatter({
  data,
  title = 'Accuracy vs Concentration Trade-off',
  provenance,
}: TradeOffScatterProps) {
  // Compute midpoints for quadrant reference lines
  const xValues = data.map((d) => d.crpsImprovement);
  const yValues = data.map((d) => d.gini);
  const xMid = xValues.length > 0 ? (Math.min(...xValues) + Math.max(...xValues)) / 2 : 0;
  const yMid = yValues.length > 0 ? (Math.min(...yValues) + Math.max(...yValues)) / 2 : 0.5;

  return (
    <ChartCard
      title={title}
      subtitle="Each point is one aggregation method. Right = more accurate, down = less concentrated. Bottom-right is ideal."
      provenance={provenance}
      help={{
        term: 'Trade-off Scatter',
        definition:
          'A scatter plot showing the trade-off between forecast accuracy (CRPS improvement) and weight concentration (Gini coefficient) for each aggregation method.',
        interpretation:
          'Points in the bottom-right quadrant achieve high accuracy with low concentration — the ideal outcome. Points in the top-left are both less accurate and more concentrated.',
        axes: {
          x: 'CRPS improvement (positive = better)',
          y: 'Gini coefficient (lower = better)',
        },
      }}
      chartType="Scatter chart"
    >
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 40, right: 32, bottom: 24, left: 16 }}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis
            type="number"
            dataKey="crpsImprovement"
            name="CRPS Improvement"
            tick={AXIS_TICK}
            stroke={AXIS_STROKE}
            domain={['dataMin - 0.001', 'dataMax + 0.001']}
            label={{
              value: 'CRPS improvement (positive = better)',
              position: 'insideBottom',
              offset: -4,
              fontSize: 11,
              fill: '#94a3b8',
            }}
          />
          <YAxis
            type="number"
            dataKey="gini"
            name="Gini"
            tick={AXIS_TICK}
            stroke={AXIS_STROKE}
            domain={['dataMin - 0.02', 'dataMax + 0.02']}
            label={{
              value: 'Gini (lower = better)',
              angle: -90,
              position: 'insideLeft',
              offset: 4,
              fontSize: 11,
              fill: '#94a3b8',
            }}
          />
          {/* Quadrant dividers */}
          <ReferenceLine x={xMid} stroke="#e2e8f0" strokeDasharray="4 4" />
          <ReferenceLine y={yMid} stroke="#e2e8f0" strokeDasharray="4 4" />
          <Tooltip
            contentStyle={TOOLTIP_STYLE as React.CSSProperties}
            formatter={(value: unknown, name: unknown) => {
              const v = Number(value);
              const label = name === 'CRPS Improvement' ? 'CRPS Δ' : 'Gini';
              return [Number.isFinite(v) ? fmt(v, 4) : '—', label];
            }}
            labelFormatter={(_label, payload) => {
              const items = payload as ReadonlyArray<{ payload?: TradeOffPoint }>;
              const point = items?.[0]?.payload;
              return point?.label ?? '';
            }}
          />
          <Scatter
            data={data}
            shape={renderDot}
            label={(props: LabelProps & { index?: number }) => renderPointLabel(props, data)}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
