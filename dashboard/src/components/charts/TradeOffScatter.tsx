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

/** Simple greedy label placement: track used Y positions and nudge labels to avoid overlap. */
const _usedPositions: number[] = [];
const LABEL_HEIGHT = 14; // approximate height of a label in px

function resetLabelPositions() {
  _usedPositions.length = 0;
}

function findNonOverlappingY(desiredY: number): number {
  const y = desiredY;
  // Try the desired position first, then nudge up/down
  for (let attempt = 0; attempt < 20; attempt++) {
    const offset = attempt === 0 ? 0 : (attempt % 2 === 1 ? Math.ceil(attempt / 2) : -Math.ceil(attempt / 2)) * LABEL_HEIGHT;
    const candidate = y + offset;
    if (_usedPositions.every((used) => Math.abs(used - candidate) >= LABEL_HEIGHT)) {
      _usedPositions.push(candidate);
      return candidate;
    }
  }
  // Fallback: just use the desired position
  _usedPositions.push(y);
  return y;
}

function renderPointLabel(props: LabelProps & { index?: number }, data: TradeOffPoint[]) {
  const { x, y, index } = props;
  if (index == null || !data[index]) return null;
  const point = data[index];
  const px = Number(x);
  const py = Number(y);

  // Reset positions on first label of each render pass
  if (index === 0) resetLabelPositions();

  const adjustedY = findNonOverlappingY(py + 4);

  return (
    <text
      x={px + 14}
      y={adjustedY}
      textAnchor="start"
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
        <ScatterChart margin={{ top: 24, right: 100, bottom: 24, left: 16 }}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis
            type="number"
            dataKey="crpsImprovement"
            name="CRPS Improvement"
            tick={AXIS_TICK}
            stroke={AXIS_STROKE}
            domain={['dataMin - 0.001', 'dataMax + 0.001']}
            tickFormatter={(v: number) => fmt(v, 3)}
            label={{
              value: 'Accuracy gain →',
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
            tickFormatter={(v: number) => fmt(v, 2)}
            label={{
              value: '← Fairer',
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
