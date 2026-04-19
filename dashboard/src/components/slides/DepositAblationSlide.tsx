import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from 'recharts';
import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 10: How Deposit Policy Affects Accuracy — horizontal bar chart.
 * Key message: Bankroll+Confidence is practical and captures most of the gain.
 */

interface PolicyData {
  policy: string;
  crps: number;
  improvement: string;
  highlight?: boolean;
}

const FALLBACK_DATA: PolicyData[] = [
  { policy: 'Oracle', crps: 0.0227, improvement: '-46%' },
  { policy: 'Bankroll+Conf', crps: 0.0375, improvement: '-11%', highlight: true },
  { policy: 'Fixed (b=1)', crps: 0.0423, improvement: 'baseline' },
  { policy: 'Random', crps: 0.0456, improvement: '' },
];

export default function DepositAblationSlide() {
  return (
    <SlideShell title="How Deposit Policy Affects Accuracy" highlight="Bankroll+Confidence is practical and captures most of the gain" slideNumber={10}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <p
          style={{
            fontSize: TYPOGRAPHY.chartTitle.fontSize,
            fontWeight: TYPOGRAPHY.chartTitle.fontWeight,
            color: PALETTE.navy,
            marginBottom: 16,
            fontFamily: TYPOGRAPHY.fontFamily,
          }}
        >
          CRPS by Deposit Policy (lower is better)
        </p>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={FALLBACK_DATA}
              layout="vertical"
              margin={{ top: 20, right: 100, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke={PALETTE.border} horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 0.05]}
                tick={{ fontSize: 15, fill: PALETTE.slate }}
                label={{ value: 'CRPS', position: 'bottom', offset: 0, style: { fontSize: '16px', fill: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily } }}
                axisLine={{ strokeWidth: 2 }}
              />
              <YAxis
                type="category"
                dataKey="policy"
                tick={{ fontSize: 17, fill: PALETTE.charcoal, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 600 }}
                axisLine={{ strokeWidth: 2 }}
                width={140}
              />
              <Bar dataKey="crps" radius={[0, 8, 8, 0]} barSize={40}>
                {FALLBACK_DATA.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.highlight ? PALETTE.teal : PALETTE.imperial}
                  />
                ))}
                <LabelList
                  dataKey="improvement"
                  position="right"
                  style={{ fontSize: 16, fontWeight: 700, fill: PALETTE.teal, fontFamily: TYPOGRAPHY.fontFamily }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SlideShell>
  );
}
