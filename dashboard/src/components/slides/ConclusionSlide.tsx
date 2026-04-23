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
  'Test against a wider range of strategic adversaries',
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
        padding: '28px 32px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      {children}
    </div>
  );
}

export default function ConclusionSlide() {
  return (
    <SlideShell title="Conclusion + Future Work" dark slideNumber={13}>
      {/* Use flex column with justify-content to spread content evenly */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

        {/* ── CRPS Comparison Cards — flex:1 so they grow ── */}
        <div style={{ flex: 1, display: 'flex', gap: 20, alignItems: 'stretch' }}>
          {comparisons.map((c) => (
            <DarkCard key={c.label} accent={c.tagColour}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: PALETTE.white, fontFamily: TYPOGRAPHY.fontFamily }}>
                  {c.label}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: PALETTE.white, background: c.tagColour, borderRadius: 20, padding: '4px 14px' }}>
                  {c.tag}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: '1.2rem', color: PALETTE.darkText, fontFamily: TYPOGRAPHY.fontFamily, fontVariantNumeric: 'tabular-nums' }}>
                <span>Wind: <strong style={{ color: PALETTE.white }}>{c.wind}</strong></span>
                <span>Elec: <strong style={{ color: PALETTE.white }}>{c.elec}</strong></span>
              </div>
              <p style={{ marginTop: 10, fontSize: '1.05rem', color: PALETTE.darkText, lineHeight: 1.55, fontFamily: TYPOGRAPHY.fontFamily }}>
                {c.note}
              </p>
            </DarkCard>
          ))}
        </div>

        {/* ── Key Takeaway — bigger, more breathing room ── */}
        <div
          style={{
            background: 'rgba(46, 139, 139, 0.12)',
            borderLeft: `4px solid ${PALETTE.teal}`,
            borderRadius: '0 12px 12px 0',
            padding: '20px 28px',
            marginTop: 28,
          }}
        >
          <p style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700, color: PALETTE.white, lineHeight: 1.5, fontFamily: TYPOGRAPHY.fontFamily }}>
            Adaptation, self-financing, and an absolute skill signal can coexist in a single mechanism.
          </p>
        </div>

        {/* ── Future Work — spread with bigger text ── */}
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: PALETTE.teal, marginBottom: 14, fontFamily: TYPOGRAPHY.fontFamily, letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
            Future Work
          </h3>
          <ul style={{ margin: 0, paddingLeft: 24, listStyleType: 'disc' }}>
            {futureWork.map((item) => (
              <li key={item} style={{ fontSize: '1.3rem', color: PALETTE.darkText, lineHeight: 1.7, fontFamily: TYPOGRAPHY.fontFamily, marginBottom: 10 }}>
                {item}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </SlideShell>
  );
}
