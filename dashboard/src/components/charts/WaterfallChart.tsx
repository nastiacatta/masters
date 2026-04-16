import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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

export interface WaterfallDatum {
  /** Step label */
  label: string;
  /** Absolute value at this step */
  value: number;
  /** Change from previous step */
  delta: number;
  /** If true, bar starts from zero (total bar) */
  isTotal?: boolean;
}

interface WaterfallChartProps {
  data: WaterfallDatum[];
  /** Y-axis label */
  metricLabel?: string;
  /** Optional title override */
  title?: string;
  /** Data provenance badge */
  provenance?: DataProvenance;
}

/* ── Colours ───────────────────────────────────────────────────────── */

const COLOUR_IMPROVE = '#10b981'; // green — improvement (negative delta)
const COLOUR_DEGRADE = '#ef4444'; // red — degradation (positive delta)
const COLOUR_TOTAL = '#6366f1';   // indigo — total bar

/* ── Component ─────────────────────────────────────────────────────── */

export default function WaterfallChart({
  data,
  metricLabel = 'CRPS',
  title = 'Waterfall — Incremental Changes',
  provenance,
}: WaterfallChartProps) {
  /*
   * Stacked bar trick: each bar is composed of an invisible "base" segment
   * and a visible "delta" segment. For total bars, base = 0 and delta = value.
   * For incremental bars, base = min(value, value - delta) and
   * delta = |delta|.
   */
  const chartData = data.map((d) => {
    if (d.isTotal) {
      return {
        name: d.label,
        base: 0,
        delta: d.value,
        rawDelta: d.delta,
        isTotal: true,
      };
    }

    const prevValue = d.value - d.delta;
    const base = Math.min(prevValue, d.value);
    const absDelta = Math.abs(d.delta);

    return {
      name: d.label,
      base,
      delta: absDelta,
      rawDelta: d.delta,
      isTotal: false,
    };
  });

  const getFill = (row: (typeof chartData)[number]) => {
    if (row.isTotal) return COLOUR_TOTAL;
    return row.rawDelta <= 0 ? COLOUR_IMPROVE : COLOUR_DEGRADE;
  };

  return (
    <ChartCard
      title={title}
      subtitle="Each bar shows the incremental change from the previous step."
      provenance={provenance}
      help={{
        term: 'Waterfall Chart',
        definition:
          'A chart showing how an initial value is incrementally increased or decreased by successive factors.',
        interpretation:
          'Green bars indicate improvements (negative Δ, lower CRPS). Red bars indicate degradations (positive Δ, higher CRPS). Indigo bars show totals.',
        axes: { x: 'Step', y: metricLabel },
      }}
      chartType="Bar chart"
    >
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
        >
          <CartesianGrid {...GRID_PROPS} vertical={false} />
          <XAxis
            dataKey="name"
            tick={AXIS_TICK}
            stroke={AXIS_STROKE}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={AXIS_TICK}
            stroke={AXIS_STROKE}
            label={{
              value: metricLabel,
              angle: -90,
              position: 'insideLeft',
              offset: 4,
              fontSize: 11,
              fill: '#94a3b8',
            }}
          />
          <ReferenceLine y={0} stroke={AXIS_STROKE} strokeDasharray="4 4" />
          <Tooltip
            contentStyle={TOOLTIP_STYLE as React.CSSProperties}
            formatter={(_value: unknown, name: unknown, props: { payload?: (typeof chartData)[number] }) => {
              const row = props.payload;
              if (!row) return ['—', ''];
              if (name === 'base') return null;
              const sign = row.rawDelta <= 0 ? '' : '+';
              return [
                `${sign}${fmt(row.rawDelta, 3)} (total: ${fmt(row.base + row.delta, 3)})`,
                row.isTotal ? 'Total' : 'Δ',
              ];
            }}
          />
          {/* Invisible base bar */}
          <Bar dataKey="base" stackId="waterfall" fill="transparent" isAnimationActive={false} />
          {/* Visible delta bar */}
          <Bar
            dataKey="delta"
            stackId="waterfall"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
            isAnimationActive={true}
            animationDuration={300}
          >
            {chartData.map((d, i) => (
              <Cell key={`${d.name}-${i}`} fill={getFill(d)} opacity={0.9} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
