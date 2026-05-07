import type { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
  /**
   * Layout width:
   *  - "narrow" (960px) for reading-heavy pages: Home, Notes, Audit
   *  - "wide"   (1360px) for data-dense pages:  Evidence, Robustness, Explorer
   */
  width?: 'narrow' | 'wide';
  className?: string;
}

/**
 * Consistent page shell used by every top-level page in the main app.
 *
 *  - Uniform horizontal padding: 24px on small, 40px on ≥sm
 *  - Uniform vertical rhythm:    48px top, 80px bottom, 48px between sections
 *  - Two canonical widths only   (keeps the visual system predictable)
 *
 * Presentation slides have their own design system and do not use this shell.
 */
export default function PageShell({
  children,
  width = 'wide',
  className = '',
}: PageShellProps) {
  const maxW = width === 'narrow' ? 'max-w-[960px]' : 'max-w-[1360px]';
  return (
    <div className="flex-1 overflow-y-auto">
      <div
        className={`${maxW} mx-auto px-6 sm:px-10 pt-12 pb-20 space-y-12 ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
