import { PALETTE, TYPOGRAPHY, DARK_GRADIENT } from './shared/presentationConstants';

const BASE = import.meta.env.BASE_URL;

/**
 * Slide 1: Title slide — dark, centred layout.
 *
 * Displays presenter name, project title, institution, and supervisor
 * acknowledgements. Includes a subtle abstract SVG showing three
 * individual forecast arrows converging into one aggregated arrow
 * (prediction market concept).
 *
 * No technical content, research questions, or bullet points.
 */
export default function TitleSlide() {
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
        padding: '60px 80px',
        backgroundImage: `linear-gradient(180deg, rgba(7, 15, 35, 0.78) 0%, rgba(7, 15, 35, 0.82) 100%), url(${BASE}presentation-plots/title_background.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: DARK_GRADIENT,
        fontFamily: TYPOGRAPHY.fontFamily,
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background glow */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${PALETTE.imperial}15 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Abstract prediction market SVG — 3 forecast arrows converging into 1 */}
      <div style={{ marginBottom: 40, opacity: 0.7 }}>
        <svg
          width="200"
          height="80"
          viewBox="0 0 200 80"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Three forecast arrows converging into one aggregated arrow"
        >
          <defs>
            <marker
              id="title-arrow-small"
              markerWidth="6"
              markerHeight="4"
              refX="6"
              refY="2"
              orient="auto"
            >
              <polygon points="0 0, 6 2, 0 4" fill={PALETTE.teal} opacity="0.5" />
            </marker>
            <marker
              id="title-arrow-big"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill={PALETTE.teal} />
            </marker>
          </defs>

          {/* Three individual forecast arrows (left side) */}
          <line
            x1="20" y1="15" x2="80" y2="35"
            stroke={PALETTE.teal}
            strokeWidth="1.5"
            opacity="0.45"
            markerEnd="url(#title-arrow-small)"
          />
          <line
            x1="20" y1="40" x2="80" y2="40"
            stroke={PALETTE.teal}
            strokeWidth="1.5"
            opacity="0.45"
            markerEnd="url(#title-arrow-small)"
          />
          <line
            x1="20" y1="65" x2="80" y2="45"
            stroke={PALETTE.teal}
            strokeWidth="1.5"
            opacity="0.45"
            markerEnd="url(#title-arrow-small)"
          />

          {/* Small convergence circle */}
          <circle
            cx="95"
            cy="40"
            r="8"
            fill="none"
            stroke={PALETTE.teal}
            strokeWidth="1.5"
            opacity="0.5"
          />

          {/* Single aggregated arrow (right side) */}
          <line
            x1="108" y1="40" x2="180" y2="40"
            stroke={PALETTE.teal}
            strokeWidth="2.5"
            markerEnd="url(#title-arrow-big)"
          />
        </svg>
      </div>

      {/* Presenter name */}
      <p
        style={{
          fontSize: '1.3rem',
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: PALETTE.teal,
          marginBottom: 28,
        }}
      >
        Anastasia Cattaneo
      </p>

      {/* Thesis title */}
      <h1
        style={{
          fontSize: '3.4rem',
          fontWeight: TYPOGRAPHY.heading.fontWeight,
          color: PALETTE.white,
          lineHeight: 1.2,
          marginBottom: 20,
          maxWidth: 800,
        }}
      >
        Adaptive Skill and Stake{'\n'}in Prediction Markets
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: '1.4rem',
          color: PALETTE.darkText,
          lineHeight: 1.6,
          maxWidth: 650,
          marginBottom: 36,
          opacity: 0.85,
        }}
      >
        Coupling Self-Financed Wagering with Online Skill Learning
      </p>

      {/* Institution */}
      <p
        style={{
          fontSize: '1.15rem',
          color: PALETTE.darkText,
          fontWeight: 500,
          marginBottom: 12,
        }}
      >
        Imperial College London
      </p>

      {/* Supervisor acknowledgements */}
      <p
        style={{
          fontSize: '1rem',
          color: PALETTE.slate,
          lineHeight: 1.6,
        }}
      >
        Supervised by Pierre Pinson and Michael Vitali
      </p>
    </div>
  );
}
