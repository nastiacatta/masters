import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/* ── CRPS comparison data (benchmark on Elia) ── */
const comparisons = [
  {
    label: 'Raja et al.',
    tag: 'History-free',
    tagColour: PALETTE.slate,
    wind: '−2.5 %',
    elec: '−2.3 %',
    note: 'Self-financed but no memory across rounds',
  },
  {
    label: 'Vitali & Pinson',
    tag: 'OGD',
    tagColour: PALETTE.purple,
    wind: '−65 %',
    elec: '−20 %',
    note: 'Lowest CRPS in this benchmark — not self-financed; relative weights',
  },
  {
    label: 'This project',
    tag: 'Skill + Lambert',
    tagColour: PALETTE.teal,
    wind: '−44 %',
    elec: '−8 %',
    note: 'Adaptive and self-financed, with an absolute skill signal',
  },
] as const;

/* ── Future-work bullets ── */
const futureWork = [
  'Close the CRPS gap to Vitali & Pinson without giving up self-financing',
  'Improve tail calibration (currently ~5 pp under-dispersion)',
  'Test against strategic adversaries beyond uniform sybils',
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
        padding: '24px 28px',
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
 * Slide 16 — Conclusion + Future Work
 *
 * Dark background layout with three CRPS comparison cards,
 * a key-takeaway highlight, and a future-work section.
 */
export default function ConclusionSlide() {
  return (
    <SlideShell
      title="Conclusion + Future Work"
      dark
      slideNumber={13}
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
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: PALETTE.white,
                  fontFamily: TYPOGRAPHY.fontFamily,
                }}
              >
                {c.label}
              </span>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: PALETTE.white,
                  background: c.tagColour,
                  borderRadius: 20,
                  padding: '3px 12px',
                  letterSpacing: '0.02em',
                }}
              >
                {c.tag}
              </span>
            </div>

            {/* Metrics row */}
            <div
              style={{
                display: 'flex',
                gap: 18,
                marginTop: 10,
                fontSize: '1.1rem',
                color: PALETTE.darkText,
                fontFamily: TYPOGRAPHY.fontFamily,
                fontVariantNumeric: 'tabular-nums',
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
                marginTop: 8,
                fontSize: '1.0rem',
                color: PALETTE.darkText,
                lineHeight: 1.5,
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
            fontSize: '1.4rem',
            fontWeight: 700,
            color: PALETTE.white,
            lineHeight: 1.5,
            fontFamily: TYPOGRAPHY.fontFamily,
          }}
        >
          In this benchmark, the mechanism jointly provides adaptation across rounds,
          self-financing, and an absolute skill signal.
        </p>
      </div>

      {/* ── Future Work ── */}
      <div style={{ flex: 1 }}>
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
                fontSize: '1.25rem',
                color: PALETTE.darkText,
                lineHeight: 1.6,
                fontFamily: TYPOGRAPHY.fontFamily,
                marginBottom: 6,
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

    </SlideShell>
  );
}
