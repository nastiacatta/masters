import SlideShell from './shared/SlideShell';
import { PALETTE, TYPOGRAPHY, CARD_STYLE } from './shared/presentationConstants';
import { FORECASTERS } from './forecasterData';

/** Type badge colour mapping */
function badgeColour(type: string): { bg: string; text: string } {
  switch (type) {
    case 'Statistical':
      return { bg: 'rgba(0, 62, 116, 0.10)', text: PALETTE.imperial };
    case 'Machine Learning':
      return { bg: 'rgba(46, 139, 139, 0.10)', text: PALETTE.teal };
    case 'Ensemble':
      return { bg: 'rgba(124, 58, 237, 0.10)', text: PALETTE.purple };
    case 'Baseline':
      return { bg: 'rgba(100, 116, 139, 0.10)', text: PALETTE.slate };
    default:
      return { bg: 'rgba(100, 116, 139, 0.10)', text: PALETTE.slate };
  }
}

const ELIA_DATASETS = [
  {
    label: 'Wind',
    colour: PALETTE.teal,
    text: 'Elia Wind Power — 17,544 hourly observations from the Belgian grid operator',
  },
  {
    label: 'Electricity',
    colour: PALETTE.coral,
    text: 'Elia Electricity Prices — 10,000 hourly observations',
  },
];

/**
 * Slide 9 — Models, Data, and Synthetic Setup.
 *
 * Three sections:
 *  1. Compact 7-model grid (name + type badge + one-line description)
 *  2. Two Elia dataset cards
 *  3. One-line motivation for synthetic-then-real validation
 */
export default function ModelsDataOverviewSlide() {
  return (
    <SlideShell title="Models, Data, and Synthetic Setup" slideNumber={9}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          fontFamily: TYPOGRAPHY.fontFamily,
          minHeight: 0,
        }}
      >
        {/* ── Top: 7-model grid ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
          }}
        >
          {FORECASTERS.map((f) => {
            const badge = badgeColour(f.type);
            return (
              <div
                key={f.name}
                style={{
                  ...CARD_STYLE,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: PALETTE.navy,
                    }}
                  >
                    {f.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: badge.text,
                      background: badge.bg,
                      padding: '2px 8px',
                      borderRadius: 10,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {f.type}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '1.05rem',
                    color: PALETTE.charcoal,
                    lineHeight: 1.35,
                  }}
                >
                  {f.description}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Middle: Elia dataset cards ── */}
        <div style={{ display: 'flex', gap: 16 }}>
          {ELIA_DATASETS.map((ds) => (
            <div
              key={ds.label}
              style={{
                ...CARD_STYLE,
                flex: 1,
                padding: '16px 20px',
                borderLeft: `4px solid ${ds.colour}`,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: ds.colour,
                  whiteSpace: 'nowrap',
                }}
              >
                {ds.label}
              </span>
              <span
                style={{
                  fontSize: '1rem',
                  color: PALETTE.charcoal,
                  lineHeight: 1.4,
                }}
              >
                {ds.text}
              </span>
            </div>
          ))}
        </div>

        {/* ── Bottom: motivation line ── */}
        <div
          style={{
            background: 'rgba(46, 139, 139, 0.07)',
            borderLeft: `4px solid ${PALETTE.teal}`,
            padding: '12px 20px',
            borderRadius: '0 10px 10px 0',
          }}
        >
          <span
            style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: PALETTE.navy,
              lineHeight: 1.5,
            }}
          >
            Synthetic cases validate correctness with known ground truth → Real data tests
            practical performance
          </span>
        </div>
      </div>
    </SlideShell>
  );
}
