import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

const BASE = import.meta.env.BASE_URL;

/**
 * Slide 7 right panel: Skill Signal visual.
 * Uses the skill_wager.png plot which shows learned skill (σ) trajectories
 * over time for forecasters with different noise levels — a clear empirical result.
 */
export default function SkillSignalSlide() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: 16 }}>
      <p style={{
        fontSize: TYPOGRAPHY.chartTitle.fontSize,
        fontWeight: TYPOGRAPHY.chartTitle.fontWeight,
        color: PALETTE.navy,
        fontFamily: TYPOGRAPHY.fontFamily,
        margin: '0 0 8px 0',
      }}>
        Skill Trajectories Over Time
      </p>

      {/* Experimental plot */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={`${BASE}presentation-plots/skill_wager.png`}
          alt="Learned skill trajectories: low-noise forecasters converge to high σ, high-noise to low σ"
          style={{ maxWidth: '100%', maxHeight: '88%', objectFit: 'contain', borderRadius: 10 }}
        />
      </div>

      {/* Property badges */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
        {['Absolute', 'Pre-round', 'Handles Intermittency'].map(prop => (
          <div key={prop} style={{
            background: PALETTE.white,
            border: `2px solid ${PALETTE.teal}`,
            borderRadius: 8,
            padding: '6px 14px',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: PALETTE.teal,
            fontFamily: TYPOGRAPHY.fontFamily,
          }}>
            {prop}
          </div>
        ))}
      </div>
    </div>
  );
}
