import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Cell } from 'recharts';
import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 14: Contributions — compact bar chart showing CRPS delta (%)
 * for mechanism vs uniform on Elia wind and electricity datasets.
 * Wider bars, bigger badge, bigger fonts, visual separators.
 */

interface ComparisonData {
  forecaster: string;
  wind_delta: number;
  elec_delta: number;
}

const FALLBACK_DATA: ComparisonData[] = [
  { forecaster: 'ARIMA', wind_delta: -21, elec_delta: -8 },
  { forecaster: 'XGBoost', wind_delta: -18, elec_delta: -12 },
  { forecaster: 'MLP', wind_delta: -15, elec_delta: -6 },
  { forecaster: 'LSTM', wind_delta: -14, elec_delta: -9 },
  { forecaster: 'Ensemble', wind_delta: -19, elec_delta: -11 },
];

export default function ContributionsChartSlide() {
  return (
    <SlideShell title="Contributions">
      <div style={{ flex: 1, display: 'flex', gap: 36, minHeight: 0 }}>
        {/* Chart */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
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
              CRPS Improvement (%) — Mechanism vs Uniform
            </p>
            {/* Bigger, more prominent badge */}
            <div
              style={{
                background: PALETTE.teal,
                color: PALETTE.white,
                fontSize: '1.25rem',
                fontWeight: 700,
                padding: '10px 22px',
                borderRadius: 20,
                fontFamily: TYPOGRAPHY.fontFamily,
                boxShadow: '0 2px 8px rgba(0,132,127,0.3)',
              }}
            >
              −21% CRPS on wind
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FALLBACK_DATA} margin={{ top: 24, right: 36, left: 24, bottom: 36 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={PALETTE.lightGrey} vertical={false} />
                <XAxis
                  dataKey="forecaster"
                  tick={{ fontSize: 16, fill: PALETTE.warmGrey, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 600 }}
                  axisLine={{ strokeWidth: 2 }}
                />
                <YAxis
                  domain={[-30, 0]}
                  tick={{ fontSize: 15, fill: PALETTE.warmGrey }}
                  label={{ value: 'CRPS Δ (%)', angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: '16px', fill: PALETTE.warmGrey, fontFamily: TYPOGRAPHY.fontFamily } }}
                  axisLine={{ strokeWidth: 2 }}
                />
                <Legend wrapperStyle={{ fontSize: 15, fontFamily: TYPOGRAPHY.fontFamily, fontWeight: 600 }} />
                <Bar dataKey="wind_delta" name="Elia Wind" fill={PALETTE.teal} radius={[6, 6, 0, 0]} barSize={36}>
                  {FALLBACK_DATA.map((_, i) => (
                    <Cell key={i} fill={PALETTE.teal} />
                  ))}
                </Bar>
                <Bar dataKey="elec_delta" name="Elia Electricity" fill={PALETTE.navy} radius={[6, 6, 0, 0]} barSize={36}>
                  {FALLBACK_DATA.map((_, i) => (
                    <Cell key={i} fill={PALETTE.navy} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right panel: contributions list + limitations — bigger fonts, visual separators */}
        <div
          style={{
            width: 300,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 12,
            fontFamily: TYPOGRAPHY.fontFamily,
          }}
        >
          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: PALETTE.navy, marginBottom: 6 }}>
            Key Contributions
          </p>
          {[
            'Wagering + skill learning',
            'Budget balance < 10⁻¹⁴',
            'Deposit design: −11% CRPS',
            'Spearman = 1.0000',
            'Real data validation',
          ].map((item) => (
            <div key={item} style={{ fontSize: '1.1rem', color: PALETTE.warmGrey, paddingLeft: 14, borderLeft: `4px solid ${PALETTE.teal}`, padding: '6px 14px' }}>
              {item}
            </div>
          ))}

          {/* Visual separator */}
          <div style={{ height: 2, background: PALETTE.lightGrey, margin: '12px 0', borderRadius: 1 }} />

          <p style={{ fontSize: '1.2rem', fontWeight: 700, color: PALETTE.navy, marginBottom: 6 }}>
            Limitations
          </p>
          {[
            'Tail calibration ~5pp',
            'Equal weights competitive',
            'Truthfulness under risk neutrality',
          ].map((item) => (
            <div key={item} style={{ fontSize: '1.1rem', color: PALETTE.deepRed, paddingLeft: 14, borderLeft: `4px solid ${PALETTE.deepRed}`, padding: '6px 14px' }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </SlideShell>
  );
}
