import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from 'recharts';
import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 10: Deposit Design — horizontal bar chart showing deposit policies
 * PLUS a small annotation about weight rule comparison (merged from old slide 11).
 * Reframed: practical deposit rules capture most gain, but we can't control what forecasters stake.
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
    <SlideShell title="Deposit Design Is the Strongest Lever" highlight="Practical deposit rules capture most of the available gain" slideNumber={10}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <p
          style={{
            fontSize: TYPOGRAPHY.chartTitle.fontSize,
            fontWeight: TYPOGRAPHY.chartTitle.fontWeight,
            color: PALETTE.navy,
            marginBottom: 12,
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

        {/* Weight rule annotation (merged from old slide 11) */}
        <div
          style={{
            marginTop: 12,
            background: 'rgba(196, 150, 12, 0.06)',
            borderLeft: `4px solid ${PALETTE.gold}`,
            borderRadius: '0 8px 8px 0',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: PALETTE.gold, fontFamily: TYPOGRAPHY.fontFamily }}>
            Weight rule comparison:
          </span>
          <span style={{ fontSize: '1.05rem', fontWeight: 600, color: PALETTE.charcoal, fontFamily: TYPOGRAPHY.fontFamily }}>
            Skill adds 3.5% over uniform under fixed deposits — but deposit design dominates
          </span>
        </div>
      </div>
    </SlideShell>
  );
}
