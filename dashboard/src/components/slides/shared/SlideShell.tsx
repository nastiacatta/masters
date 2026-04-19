import { PALETTE, TYPOGRAPHY, DARK_GRADIENT } from './presentationConstants';

export interface SlideShellProps {
  title: string;
  dark?: boolean;
  refText?: string;
  highlight?: string;
  children: React.ReactNode;
}

/** Accent bar under slide titles */
function AccentBar({ dark }: { dark?: boolean }) {
  return (
    <div
      style={{
        width: 60,
        height: 4,
        background: dark ? PALETTE.lightGrey : PALETTE.teal,
        borderRadius: 2,
        marginTop: 14,
      }}
    />
  );
}

/** Footer — left: name, right: optional reference */
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
          color: dark ? PALETTE.lightGrey : PALETTE.warmGrey,
          textAlign: 'left',
        }}
      >
        Anastasia Cattaneo — Imperial College London
      </span>
      {refText && (
        <span
          style={{
            fontSize: '0.72rem',
            color: dark ? PALETTE.lightGrey : PALETTE.warmGrey,
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

/** Warm teal highlight bar with left border accent */
function HighlightBar({ text }: { text: string }) {
  return (
    <div
      style={{
        flexShrink: 0,
        marginTop: 20,
        background: 'rgba(0, 132, 127, 0.07)',
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
 * Provides title with accent bar, consistent padding, footer, and optional highlight bar.
 */
export default function SlideShell({ title, dark, refText, highlight, children }: SlideShellProps) {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '52px 56px',
        background: dark ? DARK_GRADIENT : PALETTE.lightBg,
        fontFamily: TYPOGRAPHY.fontFamily,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ flexShrink: 0, marginBottom: 24 }}>
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
