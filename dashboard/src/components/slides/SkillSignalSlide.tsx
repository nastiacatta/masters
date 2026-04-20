import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

const BASE = import.meta.env.BASE_URL;

/**
 * Slide 7 right panel: Skill Signal visual.
 * Shows the skill_wager.png experimental result — how learned skill
 * tracks true forecaster quality over time for different forecasters.
 */
export default function SkillSignalSlide() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: 16 }}>
      {/* Title */}
      <p style={{
        fontSize: TYPOGRAPHY.chartTitle.fontSize,
        fontWeight: TYPOGRAPHY.chartTitle.fontWeight,
        color: PALETTE.navy,
        fontFamily: TYPOGRAPHY.fontFamily,
        margin: '0 0 8px 0',
      }}>
        Skill × Wager: Learned Skill Tracks True Quality
      </p>

      {/* Spearman badge */}
      <div style={{
        alignSelf: 'flex-start',
        background: 'rgba(46, 139, 139, 0.08)',
        border: `1.5px solid ${PALETTE.teal}`,
        borderRadius: 20,
        padding: '4px 14px',
        fontSize: '0.85rem',
        fontWeight: 700,
        color: PALETTE.teal,
        fontFamily: TYPOGRAPHY.fontFamily,
        marginBottom: 12,
      }}>
        Spearman ρ = 1.0000
      </div>

      {/* Main image */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={`${BASE}presentation-plots/skill_wager.png`}
          alt="Skill evolution over time for different forecasters — learned skill tracks true quality"
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }}
        />
      </div>

      {/* Property badges */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 10 }}>
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
