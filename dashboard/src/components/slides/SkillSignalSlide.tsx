import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 7: The Skill Signal — visual explanation (no chart).
 * Shows gradient bar with 3 example forecasters, property badges, staleness note.
 */

const PROPERTIES = ['Absolute', 'Pre-round', 'Handles Intermittency'] as const;

interface ForecasterExample {
  label: string;
  skill: number;
  loss: string;
  colour: string;
}

const EXAMPLES: ForecasterExample[] = [
  { label: 'Strong forecaster', skill: 0.96, loss: 'Low loss', colour: PALETTE.teal },
  { label: 'Average forecaster', skill: 0.85, loss: 'Medium loss', colour: PALETTE.gold },
  { label: 'Weak forecaster', skill: 0.55, loss: 'High loss', colour: PALETTE.coral },
];

export default function SkillSignalSlide() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 20, padding: 16, justifyContent: 'center' }}>
      {/* Visual explanation: gradient bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 700, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily, margin: 0 }}>
          Skill Mapping: Loss → Skill
        </p>

        {/* Gradient bar */}
        <div style={{ position: 'relative', height: 36, borderRadius: 18, background: `linear-gradient(to right, ${PALETTE.teal}, ${PALETTE.gold}, ${PALETTE.coral})`, overflow: 'hidden', border: `1.5px solid ${PALETTE.border}` }}>
          {/* Labels on gradient */}
          <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', fontWeight: 700, color: PALETTE.white, fontFamily: TYPOGRAPHY.fontFamily }}>
            Low loss → σ ≈ 1
          </div>
          <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: '0.85rem', fontWeight: 700, color: PALETTE.white, fontFamily: TYPOGRAPHY.fontFamily }}>
            High loss → σ → σ_min
          </div>
        </div>
      </div>

      {/* 3 example forecasters */}
      <div style={{ display: 'flex', gap: 14 }}>
        {EXAMPLES.map((ex) => (
          <div
            key={ex.label}
            style={{
              flex: 1,
              background: PALETTE.white,
              border: `1.5px solid ${PALETTE.border}`,
              borderRadius: 12,
              padding: '16px 14px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {/* Skill circle */}
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: `rgba(${ex.colour === PALETTE.teal ? '46,139,139' : ex.colour === PALETTE.gold ? '196,150,12' : '232,93,74'}, 0.12)`,
              border: `3px solid ${ex.colour}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontWeight: 700, color: ex.colour, fontFamily: TYPOGRAPHY.fontFamily,
            }}>
              {ex.skill.toFixed(2)}
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily, textAlign: 'center' }}>
              {ex.label}
            </span>
            <span style={{ fontSize: '0.75rem', color: PALETTE.slate, fontFamily: TYPOGRAPHY.fontFamily }}>
              {ex.loss}
            </span>
          </div>
        ))}
      </div>

      {/* Property badges */}
      <div style={{ display: 'flex', gap: 10 }}>
        {PROPERTIES.map((prop) => (
          <div
            key={prop}
            style={{
              flex: 1,
              background: 'rgba(46, 139, 139, 0.06)',
              border: `2px solid ${PALETTE.teal}`,
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: PALETTE.teal,
              fontFamily: TYPOGRAPHY.fontFamily,
              textAlign: 'center',
            }}
          >
            {prop}
          </div>
        ))}
      </div>

      {/* Staleness decay note */}
      <div
        style={{
          background: 'rgba(196, 150, 12, 0.06)',
          borderLeft: `4px solid ${PALETTE.gold}`,
          borderRadius: '0 8px 8px 0',
          padding: '10px 14px',
        }}
      >
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily, margin: 0 }}>
          Staleness decay: absent forecasters revert toward baseline — no gaming by disappearing
        </p>
      </div>
    </div>
  );
}
