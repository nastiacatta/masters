import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer } from 'recharts';
import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 7: The Skill Signal — Recharts LineChart showing σ vs accumulated loss
 * (exponential decay curve) with σ_min reference line, property badges,
 * and a staleness decay mini-chart.
 */

// Generate exponential decay data: σ = σ_min + (1 - σ_min) * exp(-γ * L)
const SIGMA_MIN = 0.1;
const GAMMA = 0.5;
const FALLBACK_DATA = Array.from({ length: 50 }, (_, i) => {
  const loss = i * 0.2;
  const sigma = SIGMA_MIN + (1 - SIGMA_MIN) * Math.exp(-GAMMA * loss);
  return { loss: parseFloat(loss.toFixed(1)), sigma: parseFloat(sigma.toFixed(4)) };
});

// Staleness decay data: σ decays toward σ_min over rounds of absence
const STALENESS_DATA = Array.from({ length: 20 }, (_, i) => {
  const rounds = i;
  const sigma = SIGMA_MIN + (0.95 - SIGMA_MIN) * Math.exp(-0.15 * rounds);
  return { rounds, sigma: parseFloat(sigma.toFixed(3)) };
});

const PROPERTIES = ['Absolute', 'Pre-round', 'Handles Intermittency'] as const;

export default function SkillSignalSlide() {
  return (
    <SlideShell title="The Skill Signal">
      <div style={{ flex: 1, display: 'flex', gap: 28, minHeight: 0 }}>
        {/* Chart area */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <p
            style={{
              fontSize: TYPOGRAPHY.chartTitle.fontSize,
              fontWeight: TYPOGRAPHY.chartTitle.fontWeight,
              color: PALETTE.navy,
              marginBottom: 12,
              fontFamily: TYPOGRAPHY.fontFamily,
            }}
          >
            Skill Mapping: σ vs Accumulated Loss
          </p>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={FALLBACK_DATA} margin={{ top: 16, right: 36, left: 24, bottom: 56 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={PALETTE.lightGrey} />
                <XAxis
                  dataKey="loss"
                  label={{ value: 'Accumulated Loss (L)', position: 'bottom', offset: 24, style: { fontSize: '16px', fill: PALETTE.warmGrey, fontFamily: TYPOGRAPHY.fontFamily } }}
                  tick={{ fontSize: 15, fill: PALETTE.warmGrey }}
                />
                <YAxis
                  domain={[0, 1]}
                  label={{ value: 'σ (skill)', angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: '16px', fill: PALETTE.warmGrey, fontFamily: TYPOGRAPHY.fontFamily } }}
                  tick={{ fontSize: 15, fill: PALETTE.warmGrey }}
                />
                <ReferenceLine
                  y={SIGMA_MIN}
                  stroke={PALETTE.deepRed}
                  strokeDasharray="6 4"
                  strokeWidth={3}
                  label={{ value: 'σ_min', position: 'right', fill: PALETTE.deepRed, fontSize: 14, fontWeight: 600 }}
                />
                <Line
                  type="monotone"
                  dataKey="sigma"
                  stroke={PALETTE.teal}
                  strokeWidth={4}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right panel: properties + staleness mini-chart */}
        <div
          style={{
            width: 280,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 14,
          }}
        >
          <p
            style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: PALETTE.navy,
              fontFamily: TYPOGRAPHY.fontFamily,
              marginBottom: 6,
            }}
          >
            Properties
          </p>
          {PROPERTIES.map((prop) => (
            <div
              key={prop}
              style={{
                background: PALETTE.white,
                border: `2px solid ${PALETTE.teal}`,
                borderRadius: 12,
                padding: '14px 20px',
                fontSize: '1.2rem',
                fontWeight: 600,
                color: PALETTE.teal,
                fontFamily: TYPOGRAPHY.fontFamily,
                textAlign: 'center',
              }}
            >
              {prop}
            </div>
          ))}

          {/* Staleness decay mini-chart */}
          <div
            style={{
              marginTop: 16,
              padding: '12px 14px',
              background: 'rgba(0, 132, 127, 0.04)',
              borderRadius: 10,
              borderLeft: `3px solid ${PALETTE.teal}`,
            }}
          >
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily, margin: '0 0 6px 0' }}>
              Staleness Decay (absent)
            </p>
            <div style={{ height: 80 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={STALENESS_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <XAxis dataKey="rounds" tick={{ fontSize: 10, fill: PALETTE.warmGrey }} tickCount={5} />
                  <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: PALETTE.warmGrey }} tickCount={3} />
                  <ReferenceLine y={SIGMA_MIN} stroke={PALETTE.deepRed} strokeDasharray="3 3" strokeWidth={1.5} />
                  <Line type="monotone" dataKey="sigma" stroke={PALETTE.warmGrey} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p style={{ fontSize: '0.75rem', color: PALETTE.warmGrey, fontFamily: TYPOGRAPHY.fontFamily, margin: '4px 0 0 0', textAlign: 'center' }}>
              Rounds absent → σ decays to σ_min
            </p>
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
