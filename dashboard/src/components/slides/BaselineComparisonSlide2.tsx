import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY } from './shared/presentationConstants';

/**
 * Slide 15: Benchmark Key Takeaways — the three takeaway cards
 * extracted from the original BaselineComparisonSlide.
 */
export default function BaselineComparisonSlide2() {
  return (
    <SlideShell
      title="Benchmark: Key Takeaways"
      slideNumber={15}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          fontFamily: TYPOGRAPHY.fontFamily,
          gap: 24,
        }}
      >
        {/* Raja card */}
        <div
          style={{
            flex: 1,
            background: 'rgba(0, 62, 116, 0.06)',
            border: `1.5px solid ${PALETTE.imperial}`,
            borderRadius: 12,
            padding: '24px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: PALETTE.imperial, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Raja et&nbsp;al. (history-free)
          </div>
          <div style={{ fontSize: '1.25rem', color: PALETTE.charcoal, lineHeight: 1.55, marginTop: 10 }}>
            Self-financed but history-free. Small gains relative to equal weights (−2.5% wind, −2.3% electricity).
          </div>
        </div>

        {/* Vitali card */}
        <div
          style={{
            flex: 1,
            background: 'rgba(124, 58, 237, 0.06)',
            border: `1.5px solid ${PALETTE.purple}`,
            borderRadius: 12,
            padding: '24px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: PALETTE.purple, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Vitali & Pinson (OGD)
          </div>
          <div style={{ fontSize: '1.25rem', color: PALETTE.charcoal, lineHeight: 1.55, marginTop: 10 }}>
            Lowest CRPS in this benchmark. Not self-financed; weights are relative on a simplex.
          </div>
        </div>

        {/* This project card */}
        <div
          style={{
            flex: 1,
            background: 'rgba(232, 93, 74, 0.08)',
            border: `1.5px solid ${PALETTE.coral}`,
            borderRadius: 12,
            padding: '24px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: PALETTE.coral, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            This project (skill + self-financed)
          </div>
          <div style={{ fontSize: '1.25rem', color: PALETTE.charcoal, lineHeight: 1.55, marginTop: 10 }}>
            −44% wind, −8% electricity relative to equal weights. Retains Lambert&apos;s properties and reports absolute skill.
          </div>
        </div>
      </div>
    </SlideShell>
  );
}
