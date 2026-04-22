import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/* ── CRPS comparison data ── */
const comparisons = [
  {
    label: 'Equal Weights',
    tag: 'Baseline',
    tagColour: PALETTE.slate,
    wind: '—',
    elec: '—',
    note: 'Reference CRPS (no skill weighting)',
  },
  {
    label: 'Mechanism',
    tag: '34 % ↓ wind',
    tagColour: PALETTE.teal,
    wind: '−34 %',
    elec: '~−4 %',
    note: 'Conditional improvement when heterogeneity exists',
  },
  {
    label: 'Best Single (Naïve)',
    tag: '−47 % wind',
    tagColour: PALETTE.coral,
    wind: '−47 %',
    elec: 'varies',
    note: 'Still wins on wind due to high autocorrelation — direction for improvement',
  },
] as const;

/* ── Future-work bullets ── */
const futureWork = [
  'Compare against Raja et al. implementation — investigate what differences exist',
  'Improve tail calibration (currently ~5 pp under-dispersion)',
  'Test with richer strategic adversaries',
] as const;

/* ── Card wrapper (dark-mode) ── */
function DarkCard({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: 'rgba(255,255,255,0.05)',
        border: `1.5px solid ${accent ?? PALETTE.border}`,
        borderRadius: 12,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Slide 14 — Conclusion + Future Work
 *
 * Dark background layout with three CRPS comparison cards,
 * a key-takeaway highlight, and a future-work section.
 */
export default function ConclusionSlide() {
  return (
    <SlideShell
      title="Conclusion + Future Work"
      dark
      slideNumber={14}
    >
      {/* ── CRPS Comparison Cards ── */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 28 }}>
        {comparisons.map((c) => (
          <DarkCard key={c.label} accent={c.tagColour}>
            {/* Header row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: PALETTE.white,
                  fontFamily: TYPOGRAPHY.fontFamily,
                }}
              >
                {c.label}
              </span>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: PALETTE.white,
                  background: c.tagColour,
                  borderRadius: 20,
                  padding: '3px 12px',
                }}
              >
                {c.tag}
              </span>
            </div>

            {/* Metrics row */}
            <div
              style={{
                display: 'flex',
                gap: 16,
                marginTop: 8,
                fontSize: '1rem',
                color: PALETTE.darkText,
                fontFamily: TYPOGRAPHY.fontFamily,
              }}
            >
              <span>
                Wind: <strong style={{ color: PALETTE.white }}>{c.wind}</strong>
              </span>
              <span>
                Elec: <strong style={{ color: PALETTE.white }}>{c.elec}</strong>
              </span>
            </div>

            {/* Note */}
            <p
              style={{
                marginTop: 6,
                fontSize: '0.88rem',
                color: PALETTE.darkText,
                lineHeight: 1.45,
                fontFamily: TYPOGRAPHY.fontFamily,
              }}
            >
              {c.note}
            </p>
          </DarkCard>
        ))}
      </div>

      {/* ── Key Takeaway ── */}
      <div
        style={{
          background: 'rgba(46, 139, 139, 0.12)',
          borderLeft: `4px solid ${PALETTE.teal}`,
          borderRadius: '0 10px 10px 0',
          padding: '14px 22px',
          marginBottom: 24,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '1.2rem',
            fontWeight: 700,
            color: PALETTE.white,
            lineHeight: 1.45,
            fontFamily: TYPOGRAPHY.fontFamily,
          }}
        >
          Influence depends on earned value, not deposit alone. Gains are real
          when forecaster heterogeneity exists.
        </p>
      </div>

      {/* ── Future Work ── */}
      <div>
        <h3
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: PALETTE.teal,
            marginBottom: 10,
            fontFamily: TYPOGRAPHY.fontFamily,
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
          }}
        >
          Future Work
        </h3>
        <ul
          style={{
            margin: 0,
            paddingLeft: 22,
            listStyleType: 'disc',
          }}
        >
          {futureWork.map((item) => (
            <li
              key={item}
              style={{
                fontSize: '1.05rem',
                color: PALETTE.darkText,
                lineHeight: 1.6,
                fontFamily: TYPOGRAPHY.fontFamily,
                marginBottom: 4,
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Qualified-language footer note ── */}
      <p
        style={{
          marginTop: 'auto',
          paddingTop: 12,
          fontSize: '0.9rem',
          fontStyle: 'italic',
          color: PALETTE.slate,
          fontFamily: TYPOGRAPHY.fontFamily,
          lineHeight: 1.5,
        }}
      >
        The mechanism satisfies formal guarantees to machine precision.
        Best-single dominance highlights a direction for improvement, not a
        failure of the approach.
      </p>
    </SlideShell>
  );
}
