import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard from '@/components/dashboard/ChartCard';
import {
  AXIS_STROKE,
  AXIS_TICK,
  CHART_MARGIN_LABELED,
  GRID_PROPS,
  TOOLTIP_STYLE,
  fmt,
} from '@/components/lab/shared';

export interface ConcentrationDatum {
  method: string;
  label: string;
  color: string;
  gini?: number;
  hhi?: number;
  nEff?: number;
}

interface ConcentrationPanelProps {
  data: ConcentrationDatum[];
}

const METRIC_COLORS = {
  gini: '#8b5cf6',
  hhi: '#ec4899',
  nEff: '#0d9488',
} as const;

function SmartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={TOOLTIP_STYLE as React.CSSProperties}>
      {label != null && (
        <div className="font-medium text-slate-700 text-[11px] mb-1">{label}</div>
      )}
      {payload
        .filter((p) => p.value != null)
        .map((p) => (
          <div key={p.dataKey} className="flex items-center gap-1.5 text-[11px]">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: p.color }}
            />
            <span className="text-slate-500">{p.name}</span>
            <span className="font-mono font-medium ml-auto">
              {fmt(p.value, 3)}
            </span>
          </div>
        ))}
    </div>
  );
}

export default function ConcentrationPanel({ data }: ConcentrationPanelProps) {
  const hasGini = data.some((d) => d.gini != null);
  const hasHHI = data.some((d) => d.hhi != null);
  const hasNEff = data.some((d) => d.nEff != null);

  return (
    <ChartCard
      title="Influence Distribution"
      subtitle="How evenly influence is spread across forecasters. Lower Gini = fairer. Higher N_eff = more diverse."
      help={{
        term: 'Concentration Metrics',
        definition:
          'Gini measures wealth inequality (0 = equal, 1 = one agent holds all). HHI measures influence concentration. N_eff is the effective number of participants.',
        interpretation:
          'Lower Gini and HHI indicate healthier market structure. Higher N_eff means more diverse participation. Compare across methods to see which concentrates influence.',
        axes: { x: 'Method', y: 'Metric value' },
      }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ ...CHART_MARGIN_LABELED, bottom: 24 }}
        >
          <CartesianGrid {...GRID_PROPS} />
          <XAxis
            dataKey="label"
            tick={{ ...AXIS_TICK, fontSize: 12 }}
            stroke={AXIS_STROKE}
          />
          <YAxis tick={AXIS_TICK} stroke={AXIS_STROKE} />
          <Tooltip content={<SmartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          {hasGini && (
            <Bar
              dataKey="gini"
              name="Gini"
              fill={METRIC_COLORS.gini}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              opacity={0.9}
              isAnimationActive={true}
              animationDuration={300}
            />
          )}
          {hasHHI && (
            <Bar
              dataKey="hhi"
              name="HHI"
              fill={METRIC_COLORS.hhi}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              opacity={0.9}
              isAnimationActive={true}
              animationDuration={300}
            />
          )}
          {hasNEff && (
            <Bar
              dataKey="nEff"
              name="N_eff"
              fill={METRIC_COLORS.nEff}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              opacity={0.9}
              isAnimationActive={true}
              animationDuration={300}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
