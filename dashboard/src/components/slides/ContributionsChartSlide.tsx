import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from 'recharts';
import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 13: Real Data Validation — bar chart showing Equal Weights vs Mechanism.
 * Clear framing: "Mechanism achieves −21% CRPS improvement on Elia wind data"
 */

interface MethodData {
  method: string;
  crps: number;
  label: string;
}

const DATA: MethodData[] = [
  { method: 'Equal Weights', crps: 0.0456, label: '0.0456' },
  { method: 'Mechanism', crps: 0.0360, label: '0.0360' },
];

export default function ContributionsChartSlide() {
  return (
    <SlideShell title="Real Data Validation" slideNumber={13}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Header with key finding */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              background: 'rgba(46, 139, 139, 0.06)',
              border: `1.5px solid ${PALETTE.teal}`,
              borderRadius: 12,
              padding: '16px 24px',
              marginBottom: 12,
            }}
          >
            <p
              style={{
                fontSize: '1.3rem',
                fontWeight: 700,
                color: PALETTE.teal,
                fontFamily: TYPOGRAPHY.fontFamily,
                margin: 0,
              }}
            >
              Mechanism achieves −21% CRPS improvement on Elia wind data
            </p>
            <p
              style={{
                fontSize: '1rem',
                color: PALETTE.charcoal,
                fontFamily: TYPOGRAPHY.fontFamily,
                margin: '6px 0 0 0',
              }}
            >
              17,544 rounds, 5 forecasters
            </p>
          </div>
          <p
            style={{
              fontSize: '1rem',
              color: PALETTE.slate,
              fontFamily: TYPOGRAPHY.fontFamily,
              margin: 0,
            }}
          >
            Forecasters: ARIMA, XGBoost, MLP, Moving Average, Naive
          </p>
        </div>

        {/* Chart: Equal Weights baseline vs Mechanism */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DATA} margin={{ top: 30, right: 60, left: 24, bottom: 40 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={PALETTE.border} vertical={false} />
              <XAxis
                dataKey="method"
                tick={{ fontSize: 18, fill: PALETTE.charcoal, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 600 }}
                axisLine={{ strokeWidth: 2 }}
              />
              <YAxis
                domain={[0, 0.055]}
                tick={{ fontSize: 15, fill: PALETTE.slate }}
                label={{ value: 'CRPS (lower is better)', angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: '16px', fill: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily } }}
                axisLine={{ strokeWidth: 2 }}
              />
              <Bar dataKey="crps" name="CRPS" radius={[8, 8, 0, 0]} barSize={80}>
                {DATA.map((_, i) => (
                  <Cell key={i} fill={i === 1 ? PALETTE.teal : PALETTE.imperial} />
                ))}
                <LabelList
                  dataKey="label"
                  position="top"
                  style={{ fontSize: 16, fontWeight: 700, fill: PALETTE.charcoal, fontFamily: TYPOGRAPHY.fontFamily }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Key findings row */}
        <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
          <div style={{ flex: 1, background: 'rgba(46, 139, 139, 0.06)', borderLeft: `6px solid ${PALETTE.teal}`, borderRadius: '0 12px 12px 0', padding: '12px 16px' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily }}>
              Wind: −21% CRPS improvement over equal weights
            </span>
          </div>
          <div style={{ flex: 1, background: 'rgba(232, 93, 74, 0.06)', borderLeft: `6px solid ${PALETTE.coral}`, borderRadius: '0 12px 12px 0', padding: '12px 16px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: PALETTE.charcoal, fontFamily: TYPOGRAPHY.fontFamily }}>
              Limitation: gains conditional on forecaster heterogeneity
            </span>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
