import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

const BASE = import.meta.env.BASE_URL;

export default function SkillSignalSlide() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: 20 }}>
      <p style={{ fontSize: TYPOGRAPHY.chartTitle.fontSize, fontWeight: TYPOGRAPHY.chartTitle.fontWeight, color: PALETTE.navy, fontFamily: TYPOGRAPHY.fontFamily, margin: '0 0 20px 0' }}>
        Skill Signal: Loss → Skill → Effective Wager
      </p>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, marginBottom: 8 }}>
        <img
          src={`${BASE}presentation-plots/skill_wager.png`}
          alt="Skill signal mapping: accumulated loss to skill score to effective wager"
          style={{ maxWidth: '100%', maxHeight: '70%', objectFit: 'contain', borderRadius: 8 }}
        />
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
        {['Absolute', 'Pre-round', 'Handles Intermittency'].map(prop => (
          <div key={prop} style={{ background: PALETTE.white, border: `2px solid ${PALETTE.teal}`, borderRadius: 8, padding: '6px 14px', fontSize: '0.9rem', fontWeight: 600, color: PALETTE.teal, fontFamily: TYPOGRAPHY.fontFamily }}>
            {prop}
          </div>
        ))}
      </div>
    </div>
  );
}
