import katex from 'katex';
import 'katex/dist/katex.min.css';
import { PALETTE, TYPOGRAPHY, DARK_GRADIENT } from './shared/presentationConstants';

/**
 * Slide 5: My Contribution — dark background with KaTeX equation
 * and three property badges.
 */
export default function ContributionSlide() {
  const equationHtml = katex.renderToString('m_i = b_i \\times g(\\sigma_i)', {
    throwOnError: false,
    displayMode: true,
  });

  const properties = ['Absolute', 'Pre-round', 'Handles Intermittency'] as const;

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
      }}
    >
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
          color: PALETTE.lightGrey,
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
          background: 'rgba(0, 132, 127, 0.12)',
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
            color: PALETTE.lightGrey,
          }}
        >
          effective wager = deposit × learned skill
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
          color: PALETTE.lightGrey,
        }}
      >
        Preserves budget balance and sybilproofness
      </p>
    </div>
  );
}
