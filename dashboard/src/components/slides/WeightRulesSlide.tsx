import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList, ReferenceLine } from 'recharts';
import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 11: Weight Rules — horizontal bar chart showing CRPS for each method
 * under FIXED deposits only (isolates the skill signal).
 */

interface WeightData {
  method: string;
  crps: number;
  annotation: string;
  highlight?: boolean;
}

const FALLBACK_DATA: WeightData[] = [
  { method: 'Best Single', crps: 0.0232, annotation: 'ceiling' },
  { method: 'Mechanism', crps: 0.0423, annotation: '' },
  { method: 'Skill-only', crps: 0.0419, annotation: '-3.5%', highlight: true },
  { method: 'Uniform', crps: 0.0434, annotation: 'baseline' },
];

export default function WeightRulesSlide() {
  return (
    <SlideShell title="Weight Rules (Fixed Deposits)" slideNumber={11}>
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
            CRPS by Weight Rule (fixed deposits isolate skill signal)
          </p>
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
            Skill improves over uniform by 3.5%
          </div>
        </div>
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
                dataKey="method"
                tick={{ fontSize: 17, fill: PALETTE.charcoal, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 600 }}
                axisLine={{ strokeWidth: 2 }}
                width={130}
              />
              <ReferenceLine
                x={0.0434}
                stroke={PALETTE.slate}
                strokeDasharray="6 4"
                strokeWidth={2}
                label={{ value: 'Uniform baseline', position: 'top', fill: PALETTE.slate, fontSize: 12 }}
              />
              <Bar dataKey="crps" radius={[0, 8, 8, 0]} barSize={40}>
                {FALLBACK_DATA.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.highlight ? PALETTE.teal : PALETTE.imperial}
                  />
                ))}
                <LabelList
                  dataKey="annotation"
                  position="right"
                  style={{ fontSize: 15, fontWeight: 700, fill: PALETTE.teal, fontFamily: TYPOGRAPHY.fontFamily }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SlideShell>
  );
}
