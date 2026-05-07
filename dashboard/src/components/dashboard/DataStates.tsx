import type { ReactNode } from 'react';

interface DataStatesProps {
  message?: string;
  children?: ReactNode;
}

export function LoadingState({ message = 'Loading…' }: DataStatesProps) {
  return (
    <div
      className="p-8 flex flex-col items-center justify-center min-h-[200px]"
      role="status"
      aria-live="polite"
    >
      <div className="relative w-8 h-8 mb-3">
        <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-teal-500 animate-spin" />
      </div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function EmptyState({ message = 'No data available.', children }: DataStatesProps) {
  return (
    <div className="p-8 bg-white border border-dashed border-slate-300 rounded-xl text-center min-h-[140px] flex flex-col items-center justify-center gap-2">
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="text-slate-300"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className="text-sm text-slate-500">{message}</p>
      {children}
    </div>
  );
}

export function ErrorState({
  message = 'Something went wrong loading the data.',
  error,
  onRetry,
  children,
}: DataStatesProps & { error?: Error | null; onRetry?: () => void }) {
  return (
    <div className="p-4 mb-4 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-50/40">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-white shadow-sm mt-0.5"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 2L1.5 13.5H14.5L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M8 7V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="12" r="0.75" fill="currentColor" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-amber-900">{message}</p>
          {error?.message && (
            <p className="text-xs text-amber-800/80 mt-1 font-mono break-words">{error.message}</p>
          )}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-900 text-white text-xs font-medium hover:bg-amber-800 transition-colors shadow-sm"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 8a6 6 0 1011-3.5L14 4M14 4V1M14 4H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Retry
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
