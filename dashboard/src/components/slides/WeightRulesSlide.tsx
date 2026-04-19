import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, LabelList, ReferenceLine } from 'recharts';
import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 11: Weight Rules — Recharts grouped BarChart comparing weight rules
 * under Fixed and Bankroll deposit regimes.
 * Wider bars, value labels on top, prominent annotation, reference line.
 */

interface WeightData {
  rule: string;
  fixed: number;
  bankroll: number;
  annotation?: string;
  fixedLabel: string;
  bankrollLabel: string;
}

const FALLBACK_DATA: WeightData[] = [
  { rule: 'Uniform', fixed: 0.0434, bankroll: 0.0230, fixedLabel: '0.043', bankrollLabel: '0.023' },
  { rule: 'Skill', fixed: 0.0419, bankroll: 0.0225, annotation: '−3.5%', fixedLabel: '0.042', bankrollLabel: '0.023' },
  { rule: 'Mechanism', fixed: 0.0415, bankroll: 0.0220, fixedLabel: '0.042', bankrollLabel: '0.022' },
  { rule: 'Best-Single', fixed: 0.0450, bankroll: 0.0240, fixedLabel: '0.045', bankrollLabel: '0.024' },
];

export default function WeightRulesSlide() {
  return (
    <SlideShell title="Weight Rules">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p
            style={{
              fontSize: TYPOGRAPHY.chartTitle.fontSize,
              fontWeight: TYPOGRAPHY.chartTitle.fontWeight,
              color: PALETTE.navy,
              fontFamily: TYPOGRAPHY.fontFamily,
              margin: 0,
            }}
          >
            CRPS by Weight Rule × Deposit Regime
          </p>
          {/* Prominent −3.5% badge */}
          <div
            style={{
              background: PALETTE.teal,
              color: PALETTE.white,
              fontSize: '1.2rem',
              fontWeight: 700,
              padding: '8px 20px',
              borderRadius: 20,
              fontFamily: TYPOGRAPHY.fontFamily,
            }}
          >
            Skill: −3.5% vs Uniform
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={FALLBACK_DATA} margin={{ top: 36, right: 40, left: 24, bottom: 36 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={PALETTE.lightGrey} vertical={false} />
              <XAxis
                dataKey="rule"
                tick={{ fontSize: 16, fill: PALETTE.warmGrey, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 600 }}
                axisLine={{ strokeWidth: 2 }}
              />
              <YAxis
                domain={[0, 0.05]}
                tick={{ fontSize: 15, fill: PALETTE.warmGrey }}
                label={{ value: 'CRPS', angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: '16px', fill: PALETTE.warmGrey, fontFamily: TYPOGRAPHY.fontFamily } }}
                axisLine={{ strokeWidth: 2 }}
              />
              {/* Horizontal reference line at Uniform fixed baseline */}
              <ReferenceLine
                y={0.0434}
                stroke={PALETTE.warmGrey}
                strokeDasharray="6 4"
                strokeWidth={2}
                label={{ value: 'Uniform baseline', position: 'right', fill: PALETTE.warmGrey, fontSize: 12 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 15, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 600 }}
              />
              <Bar dataKey="fixed" name="Fixed Deposits" fill={PALETTE.navy} radius={[6, 6, 0, 0]} barSize={40}>
                <LabelList
                  dataKey="fixedLabel"
                  position="top"
                  style={{ fontSize: 13, fontWeight: 600, fill: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily }}
                />
              </Bar>
              <Bar dataKey="bankroll" name="Bankroll Deposits" fill={PALETTE.teal} radius={[6, 6, 0, 0]} barSize={40}>
                <LabelList
                  dataKey="bankrollLabel"
                  position="top"
                  style={{ fontSize: 13, fontWeight: 600, fill: PALETTE.teal, fontFamily: TYPOGRAPHY.fontFamily }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SlideShell>
  );
}
