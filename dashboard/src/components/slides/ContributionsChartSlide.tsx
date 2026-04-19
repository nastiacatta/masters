import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList, Legend } from 'recharts';
import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 14: Real Data: CRPS by Method — bar chart showing CRPS for
 * Equal Weights, Mechanism, and Best Single Forecaster on both datasets.
 * Mentions the 5 forecaster models used.
 */

interface MethodData {
  method: string;
  wind: number;
  electricity: number;
}

const DATA: MethodData[] = [
  { method: 'Equal Weights', wind: 0.0456, electricity: 0.0380 },
  { method: 'Mechanism', wind: 0.0360, electricity: 0.0355 },
  { method: 'Best Single', wind: 0.0320, electricity: 0.0340 },
];

export default function ContributionsChartSlide() {
  return (
    <SlideShell title="Real Data: CRPS by Method" slideNumber={14}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Header with annotation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <p
              style={{
                fontSize: TYPOGRAPHY.chartTitle.fontSize,
                fontWeight: TYPOGRAPHY.chartTitle.fontWeight,
                color: PALETTE.navy,
                fontFamily: TYPOGRAPHY.fontFamily,
                margin: 0,
              }}
            >
              Elia Wind and Electricity Datasets
            </p>
            <p
              style={{
                fontSize: '0.95rem',
                color: PALETTE.slate,
                fontFamily: TYPOGRAPHY.fontFamily,
                margin: '4px 0 0 0',
              }}
            >
              5 forecasters: ARIMA, XGBoost, MLP, Moving Average, Naive
            </p>
          </div>
          <div
            style={{
              background: PALETTE.teal,
              color: PALETTE.white,
              fontSize: '1.2rem',
              fontWeight: 700,
              padding: '10px 22px',
              borderRadius: 20,
              fontFamily: TYPOGRAPHY.fontFamily,
            }}
          >
            -21% improvement on wind
          </div>
        </div>

        {/* Chart */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DATA} margin={{ top: 30, right: 40, left: 24, bottom: 40 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={PALETTE.border} vertical={false} />
              <XAxis
                dataKey="method"
                tick={{ fontSize: 17, fill: PALETTE.charcoal, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 600 }}
                axisLine={{ strokeWidth: 2 }}
              />
              <YAxis
                domain={[0, 0.055]}
                tick={{ fontSize: 15, fill: PALETTE.slate }}
                label={{ value: 'CRPS (lower is better)', angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: '16px', fill: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily } }}
                axisLine={{ strokeWidth: 2 }}
              />
              <Legend wrapperStyle={{ fontSize: 15, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 600 }} />
              <Bar dataKey="wind" name="Elia Wind" radius={[6, 6, 0, 0]} barSize={50}>
                {DATA.map((_, i) => (
                  <Cell key={i} fill={i === 1 ? PALETTE.teal : PALETTE.imperial} />
                ))}
                <LabelList
                  dataKey="wind"
                  position="top"
                  formatter={(v: unknown) => typeof v === 'number' ? v.toFixed(3) : String(v)}
                  style={{ fontSize: 14, fontWeight: 600, fill: PALETTE.charcoal, fontFamily: TYPOGRAPHY.fontFamily }}
                />
              </Bar>
              <Bar dataKey="electricity" name="Elia Electricity" radius={[6, 6, 0, 0]} barSize={50}>
                {DATA.map((_, i) => (
                  <Cell key={i} fill={i === 1 ? 'rgba(46, 139, 139, 0.5)' : 'rgba(0, 62, 116, 0.5)'} />
                ))}
                <LabelList
                  dataKey="electricity"
                  position="top"
                  formatter={(v: unknown) => typeof v === 'number' ? v.toFixed(3) : String(v)}
                  style={{ fontSize: 14, fontWeight: 600, fill: PALETTE.charcoal, fontFamily: TYPOGRAPHY.fontFamily }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Key findings */}
        <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
          <div style={{ flex: 1, background: 'rgba(46, 139, 139, 0.06)', borderLeft: `4px solid ${PALETTE.teal}`, borderRadius: '0 8px 8px 0', padding: '10px 16px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily }}>
              Wind: Mechanism beats equal weights by 21%
            </span>
          </div>
          <div style={{ flex: 1, background: 'rgba(100, 116, 139, 0.06)', borderLeft: `4px solid ${PALETTE.slate}`, borderRadius: '0 8px 8px 0', padding: '10px 16px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: PALETTE.charcoal, fontFamily: TYPOGRAPHY.fontFamily }}>
              Electricity: Smaller improvement (gains conditional on heterogeneity)
            </span>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
