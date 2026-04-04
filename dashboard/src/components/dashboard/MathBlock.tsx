import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathBlockProps {
  /** LaTeX equation to render. Use this for proper math typesetting. */
  latex?: string;
  /** Inline math (span) instead of display block; use inside paragraphs */
  inline?: boolean;
  /** Fallback: plain text / Unicode when latex is not provided */
  children?: React.ReactNode;
  /** Optional label above (e.g. "Effective wager") */
  label?: string;
  /** Optional small caption below */
  caption?: string;
  className?: string;
  /** Highlight as key design choice */
  accent?: boolean;
}

export default function MathBlock({ latex, inline, children, label, caption, className, accent }: MathBlockProps) {
  const containerRef = useRef<HTMLDivElement | HTMLSpanElement>(null);

  useEffect(() => {
    if (latex != null && latex !== '' && containerRef.current) {
      try {
        katex.render(latex, containerRef.current, { displayMode: !inline, throwOnError: false });
      } catch {
        containerRef.current.textContent = latex;
      }
    }
  }, [latex, inline]);

  if (inline && latex != null && latex !== '') {
    return <span ref={containerRef as React.RefObject<HTMLSpanElement>} className={clsx('katex-inline', className)} />;
  }

  return (
    <div
      className={clsx(
        'text-center',
        accent
          ? 'rounded-xl border border-blue-300 bg-blue-50/50 text-slate-800 px-4 py-3'
          : '',
        className
      )}
    >
      {label && (
        <p className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          {label}
        </p>
      )}
      {latex != null && latex !== '' ? (
        <div ref={containerRef as React.RefObject<HTMLDivElement>} className="katex-block text-sm min-h-[1.5em]" />
      ) : (
        <div className="font-mono text-sm break-all">{children}</div>
      )}
      {caption && (
        <p className="text-xs font-sans text-slate-500 mt-1.5">{caption}</p>
      )}
    </div>
  );
}
