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
        'rounded-xl border bg-white transition-colors',
        isActive ? 'border-slate-200 shadow-sm' : 'border-slate-100 bg-slate-50/50'
      )}
      aria-labelledby={`step-${stepNumber}-title`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div
            className={clsx(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
              isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            )}
          >
            {stepNumber}
          </div>
          <div className="min-w-0 flex-1">
            <h2 id={`step-${stepNumber}-title`} className="text-base font-semibold text-slate-800">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-xs text-slate-500">{description}</p>
            )}
            <div className="mt-3">{children}</div>
            {expandable && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setExpanded((e) => !e)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  {expanded ? 'Hide details' : 'Show sub-components'}
                </button>
                {expanded && (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-600">
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
