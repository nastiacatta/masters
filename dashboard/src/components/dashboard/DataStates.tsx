import type { ReactNode } from 'react';

interface DataStatesProps {
  message?: string;
  children?: ReactNode;
}

export function LoadingState({ message = 'Loading…' }: DataStatesProps) {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[200px]">
      <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-3" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function EmptyState({ message = 'No data available.', children }: DataStatesProps) {
  return (
    <div className="p-8 bg-white border border-slate-200 rounded-xl text-center min-h-[120px] flex flex-col items-center justify-center">
      <p className="text-sm text-slate-500 mb-2">{message}</p>
      {children}
    </div>
  );
}

export function ErrorState({
  message = 'Something went wrong loading the data.',
  error,
  children,
}: DataStatesProps & { error?: Error | null }) {
  return (
    <div className="p-4 mb-4 bg-slate-100 border border-slate-200 rounded-xl">
      <p className="text-sm font-medium text-slate-800">{message}</p>
      {error?.message && (
        <p className="text-xs text-slate-600 mt-1 font-mono">{error.message}</p>
      )}
      {children}
    </div>
  );
}
