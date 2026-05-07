import { useState, type ReactNode } from 'react';
import clsx from 'clsx';

interface StepCardProps {
  stepNumber: number;
  title: string;
  description?: string;
  children: ReactNode;
  /** Optional expandable content (e.g. Core sub-components) */
  expandable?: ReactNode;
  /** Whether this step is complete/selected */
  isActive?: boolean;
}

export default function StepCard({
  stepNumber,
  title,
  description,
  children,
  expandable,
  isActive = true,
}: StepCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      className={clsx(
        'rounded-xl border bg-white transition-all duration-150',
        isActive
          ? 'border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.03)] hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)] hover:border-slate-300'
          : 'border-slate-100 bg-slate-50/40',
      )}
      aria-labelledby={`step-${stepNumber}-title`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div
            className={clsx(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold shadow-sm',
            )}
            style={{
              background: isActive ? 'var(--navy)' : 'var(--cream)',
              color: isActive ? '#fbf9f4' : 'var(--ink-soft)',
              fontFamily: 'var(--font-serif)',
              border: isActive ? 'none' : '1px solid var(--border-strong)',
            }}
          >
            {stepNumber}
          </div>
          <div className="min-w-0 flex-1">
            <h2 id={`step-${stepNumber}-title`} className="text-base font-semibold text-slate-800 tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{description}</p>
            )}
            <div className="mt-3">{children}</div>
            {expandable && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setExpanded((e) => !e)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 transition-colors"
                  aria-expanded={expanded}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    className={clsx('transition-transform duration-150', expanded && 'rotate-90')}
                  >
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {expanded ? 'Hide details' : 'Show sub-components'}
                </button>
                {expanded && (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-600 animate-in fade-in slide-in-from-top-1 duration-150">
                    {expandable}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
