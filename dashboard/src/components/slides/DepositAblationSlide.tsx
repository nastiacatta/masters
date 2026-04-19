import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList, ReferenceLine } from 'recharts';
import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 10: Deposit Design — Recharts BarChart comparing 4 deposit policies.
 * Much wider bars, values on bars, reference line at Fixed baseline, rounded CRPS.
 */

interface PolicyData {
  policy: string;
  crps: number;
  improvement: string;
  highlight?: boolean;
  displayCrps: string;
}

const FALLBACK_DATA: PolicyData[] = [
  { policy: 'Random', crps: 0.0456, improvement: '', displayCrps: '0.046' },
  { policy: 'Fixed', crps: 0.0423, improvement: '', displayCrps: '0.042' },
  { policy: 'Bankroll+Conf', crps: 0.0375, improvement: '−11%', highlight: true, displayCrps: '0.038' },
  { policy: 'Oracle', crps: 0.0227, improvement: '−46%', displayCrps: '0.023' },
];

export default function DepositAblationSlide() {
  return (
    <SlideShell title="Deposit Design" highlight="Deposit design is the strongest lever">
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
          CRPS by Deposit Policy
        </p>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={FALLBACK_DATA} margin={{ top: 40, right: 40, left: 24, bottom: 36 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={PALETTE.lightGrey} vertical={false} />
              <XAxis
                dataKey="policy"
                tick={{ fontSize: 16, fill: PALETTE.warmGrey, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 600 }}
                axisLine={{ strokeWidth: 2 }}
              />
              <YAxis
                domain={[0, 0.05]}
                tick={{ fontSize: 15, fill: PALETTE.warmGrey }}
                label={{ value: 'CRPS', angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: '16px', fill: PALETTE.warmGrey, fontFamily: TYPOGRAPHY.fontFamily } }}
                axisLine={{ strokeWidth: 2 }}
              />
              {/* Horizontal reference line at Fixed baseline */}
              <ReferenceLine
                y={0.0423}
                stroke={PALETTE.warmGrey}
                strokeDasharray="6 4"
                strokeWidth={2}
                label={{ value: 'Fixed baseline', position: 'right', fill: PALETTE.warmGrey, fontSize: 13 }}
              />
              <Bar dataKey="crps" radius={[8, 8, 0, 0]} barSize={80}>
                {FALLBACK_DATA.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.highlight ? PALETTE.teal : PALETTE.navy}
                  />
                ))}
                {/* Values displayed ON the bars (white text) */}
                <LabelList
                  dataKey="displayCrps"
                  position="inside"
                  style={{ fontSize: 15, fontWeight: 700, fill: PALETTE.white, fontFamily: TYPOGRAPHY.fontFamily }}
                />
                {/* Improvement labels above bars */}
                <LabelList
                  dataKey="improvement"
                  position="top"
                  style={{ fontSize: 17, fontWeight: 700, fill: PALETTE.teal, fontFamily: TYPOGRAPHY.fontFamily }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SlideShell>
  );
}
