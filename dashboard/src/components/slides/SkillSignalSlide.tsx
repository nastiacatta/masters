import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer } from 'recharts';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 7: The Skill Signal — LineChart showing sigma vs accumulated loss
 * (exponential decay curve) with sigma_min reference line and property badges.
 */

const SIGMA_MIN = 0.1;
const GAMMA = 0.5;
const FALLBACK_DATA = Array.from({ length: 50 }, (_, i) => {
  const loss = i * 0.2;
  const sigma = SIGMA_MIN + (1 - SIGMA_MIN) * Math.exp(-GAMMA * loss);
  return { loss: parseFloat(loss.toFixed(1)), sigma: parseFloat(sigma.toFixed(4)) };
});

const STALENESS_DATA = Array.from({ length: 20 }, (_, i) => {
  const rounds = i;
  const sigma = SIGMA_MIN + (0.95 - SIGMA_MIN) * Math.exp(-0.15 * rounds);
  return { rounds, sigma: parseFloat(sigma.toFixed(3)) };
});

const PROPERTIES = ['Absolute', 'Pre-round', 'Handles Intermittency'] as const;

export default function SkillSignalSlide() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', gap: 16, padding: 12 }}>
      {/* Chart area */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <p
          style={{
            fontSize: TYPOGRAPHY.chartTitle.fontSize,
            fontWeight: TYPOGRAPHY.chartTitle.fontWeight,
            color: PALETTE.navy,
            marginBottom: 8,
            fontFamily: TYPOGRAPHY.fontFamily,
          }}
        >
          Skill Mapping: sigma vs Accumulated Loss
        </p>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={FALLBACK_DATA} margin={{ top: 12, right: 28, left: 20, bottom: 44 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={PALETTE.border} />
              <XAxis
                dataKey="loss"
                label={{ value: 'Accumulated Loss (L)', position: 'bottom', offset: 20, style: { fontSize: '14px', fill: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily } }}
                tick={{ fontSize: 13, fill: PALETTE.slate }}
              />
              <YAxis
                domain={[0, 1]}
                label={{ value: 'sigma (skill)', angle: -90, position: 'insideLeft', offset: -5, style: { fontSize: '14px', fill: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily } }}
                tick={{ fontSize: 13, fill: PALETTE.slate }}
              />
              <ReferenceLine
                y={SIGMA_MIN}
                stroke={PALETTE.coral}
                strokeDasharray="6 4"
                strokeWidth={3}
                label={{ value: 'sigma_min', position: 'right', fill: PALETTE.coral, fontSize: 12, fontWeight: 600 }}
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
          width: 220,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        <p
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: PALETTE.navy,
            fontFamily: TYPOGRAPHY.fontFamily,
            marginBottom: 4,
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
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: '1rem',
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
            marginTop: 12,
            padding: '10px 12px',
            background: 'rgba(46, 139, 139, 0.04)',
            borderRadius: 10,
            borderLeft: `3px solid ${PALETTE.teal}`,
          }}
        >
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily, margin: '0 0 4px 0' }}>
            Staleness Decay (absent)
          </p>
          <div style={{ height: 70 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={STALENESS_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <XAxis dataKey="rounds" tick={{ fontSize: 9, fill: PALETTE.slate }} tickCount={5} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 9, fill: PALETTE.slate }} tickCount={3} />
                <ReferenceLine y={SIGMA_MIN} stroke={PALETTE.coral} strokeDasharray="3 3" strokeWidth={1.5} />
                <Line type="monotone" dataKey="sigma" stroke={PALETTE.slate} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '0.7rem', color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily, margin: '4px 0 0 0', textAlign: 'center' }}>
            Rounds absent: sigma decays to sigma_min
          </p>
        </div>
      </div>
    </div>
  );
}
