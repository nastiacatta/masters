import katex from 'katex';
import 'katex/dist/katex.min.css';
import { PALETTE, TYPOGRAPHY, DARK_GRADIENT, getSectionForSlide, SECTION_BAR_HEIGHT, MAIN_DECK_SLIDE_COUNT } from './shared/presentationConstants';

/**
 * Slide 6: My Contribution — dark background with KaTeX equation
 * and three property badges. No emojis.
 */
export default function ContributionSlide() {
  const equationHtml = katex.renderToString('m_i = b_i \\times g(\\sigma_i)', {
    throwOnError: false,
    displayMode: true,
  });

  const properties = ['Absolute', 'Pre-round', 'Handles Intermittency'] as const;
  const section = getSectionForSlide(6);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px',
        background: DARK_GRADIENT,
        fontFamily: TYPOGRAPHY.fontFamily,
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* Section bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: SECTION_BAR_HEIGHT, background: section.colour }} />
      {/* Slide number */}
      <div style={{ position: 'absolute', top: 16, right: 24, fontSize: '0.8rem', color: PALETTE.darkText }}>
        {`6 / ${MAIN_DECK_SLIDE_COUNT}`}
      </div>
      {/* Section label */}
      <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: PALETTE.darkText, marginBottom: 16, opacity: 0.8 }}>
        PROBLEM
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: '3.4rem',
          fontWeight: 700,
          color: PALETTE.white,
          lineHeight: 1.2,
          marginBottom: 20,
        }}
      >
        My Contribution
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: '1.6rem',
          color: PALETTE.darkText,
          lineHeight: 1.6,
          maxWidth: 800,
          marginBottom: 48,
        }}
      >
        Coupling self-financed wagering with online skill learning
      </p>

      {/* Equation highlight box */}
      <div
        style={{
          background: 'rgba(46, 139, 139, 0.12)',
          border: `2px solid ${PALETTE.teal}`,
          borderRadius: 16,
          padding: '32px 56px',
          marginBottom: 48,
        }}
      >
        <div
          style={{ fontSize: '2.2rem', color: PALETTE.white }}
          dangerouslySetInnerHTML={{ __html: equationHtml }}
        />
        <p
          style={{
            marginTop: 12,
            fontSize: '1.2rem',
            color: PALETTE.darkText,
          }}
        >
          effective wager = deposit x learned skill
        </p>
      </div>

      {/* Property badges */}
      <div style={{ display: 'flex', gap: 24 }}>
        {properties.map((prop) => (
          <div
            key={prop}
            style={{
              background: PALETTE.teal,
              color: PALETTE.white,
              fontSize: '1.1rem',
              fontWeight: 700,
              padding: '12px 28px',
              borderRadius: 30,
            }}
          >
            {prop}
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p
        style={{
          marginTop: 48,
          fontSize: '1.1rem',
          color: PALETTE.purple,
          fontWeight: 600,
        }}
      >
        Preserves budget balance and sybilproofness
      </p>
    </div>
  );
}
