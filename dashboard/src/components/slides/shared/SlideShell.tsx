import { PALETTE, TYPOGRAPHY, DARK_GRADIENT, getSectionForSlide } from './presentationConstants';

export interface SlideShellProps {
  title: string;
  subtitle?: string;
  dark?: boolean;
  refText?: string;
  highlight?: string;
  slideNumber?: number;
  totalSlides?: number;
  children: React.ReactNode;
}

/** Section bar at the top of each slide — 4px tall, full width */
function SectionBar({ slideNumber }: { slideNumber?: number }) {
  if (!slideNumber) return null;
  const section = getSectionForSlide(slideNumber);
  if (!section.colour || section.colour === 'transparent') return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: section.colour,
        zIndex: 10,
      }}
    />
  );
}

/** Section indicator label — small caps at top */
function SectionLabel({ slideNumber, dark }: { slideNumber?: number; dark?: boolean }) {
  if (!slideNumber) return null;
  const section = getSectionForSlide(slideNumber);
  if (!section.label) return null;
  return (
    <div
      style={{
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase' as const,
        color: dark ? PALETTE.darkText : PALETTE.slate,
        marginBottom: 8,
        fontFamily: TYPOGRAPHY.fontFamily,
        opacity: 0.8,
      }}
    >
      {section.label}
    </div>
  );
}

/** Slide number indicator — top-right corner */
function SlideNumber({ slideNumber, totalSlides, dark }: { slideNumber?: number; totalSlides?: number; dark?: boolean }) {
  if (!slideNumber) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        right: 24,
        fontSize: '0.8rem',
        fontWeight: 500,
        color: dark ? PALETTE.darkText : PALETTE.slate,
        fontFamily: TYPOGRAPHY.fontFamily,
        zIndex: 10,
      }}
    >
      {slideNumber} / {totalSlides || 15}
    </div>
  );
}

/** Accent bar under slide titles */
function AccentBar({ dark }: { dark?: boolean }) {
  return (
    <div
      style={{
        width: 60,
        height: 4,
        background: dark ? PALETTE.border : PALETTE.teal,
        borderRadius: 2,
        marginTop: 14,
      }}
    />
  );
}

/** Footer */
function SlideFooter({ refText, dark }: { refText?: string; dark?: boolean }) {
  return (
    <div
      style={{
        flexShrink: 0,
        paddingTop: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}
    >
      <span
        style={{
          fontSize: '0.8rem',
          color: dark ? PALETTE.darkText : PALETTE.slate,
          textAlign: 'left',
        }}
      >
        Anastasia Cattaneo — Imperial College London
      </span>
      {refText && (
        <span
          style={{
            fontSize: '0.72rem',
            color: dark ? PALETTE.darkText : PALETTE.slate,
            maxWidth: '55%',
            textAlign: 'right',
            lineHeight: 1.4,
          }}
        >
          {refText}
        </span>
      )}
    </div>
  );
}

/** Highlight bar with left border accent */
function HighlightBar({ text }: { text: string }) {
  return (
    <div
      style={{
        flexShrink: 0,
        marginTop: 20,
        background: 'rgba(46, 139, 139, 0.07)',
        borderLeft: `4px solid ${PALETTE.teal}`,
        color: PALETTE.navy,
        fontSize: '1.35rem',
        fontWeight: 700,
        padding: '0.9rem 1.5rem',
        borderRadius: '0 10px 10px 0',
        lineHeight: 1.4,
      }}
    >
      {text}
    </div>
  );
}

/**
 * SlideShell — common wrapper for custom slide components.
 */
export default function SlideShell({ title, subtitle, dark, refText, highlight, slideNumber, totalSlides, children }: SlideShellProps) {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '52px 56px',
        paddingTop: 56,
        background: dark ? DARK_GRADIENT : PALETTE.offWhite,
        fontFamily: TYPOGRAPHY.fontFamily,
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <SectionBar slideNumber={slideNumber} />
      <SlideNumber slideNumber={slideNumber} totalSlides={totalSlides} dark={dark} />

      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: 24 }}>
        <SectionLabel slideNumber={slideNumber} dark={dark} />
        <h2
          style={{
            fontSize: TYPOGRAPHY.heading.fontSize,
            fontWeight: TYPOGRAPHY.heading.fontWeight,
            color: dark ? PALETTE.white : PALETTE.navy,
            lineHeight: TYPOGRAPHY.heading.lineHeight,
            margin: 0,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '1.3rem', color: dark ? PALETTE.darkText : PALETTE.slate, marginTop: 8, lineHeight: 1.5 }}>
            {subtitle}
          </p>
        )}
        <AccentBar dark={dark} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {children}
      </div>

      {highlight && <HighlightBar text={highlight} />}
      <SlideFooter refText={refText} dark={dark} />
    </div>
  );
}
