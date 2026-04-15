import type { FC } from 'react';

/* 16×16 inline SVG icons — stroke-based, currentColor, consistent with Sidebar icon style */

const LightbulbIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 1.5V2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12.5 4L11.8 4.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3.5 4L4.2 4.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5.5 11V10.5C5.5 9.5 4.5 8.5 4.5 7C4.5 5.1 6.1 3.5 8 3.5C9.9 3.5 11.5 5.1 11.5 7C11.5 8.5 10.5 9.5 10.5 10.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6.5 11H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CheckIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WarningIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2L1.5 13.5H14.5L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M8 7V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8" cy="12" r="0.75" fill="currentColor" />
  </svg>
);

const ICONS = {
  info: LightbulbIcon,
  success: CheckIcon,
  warning: WarningIcon,
} as const;

interface InsightCalloutProps {
  title: string;
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning';
}

export default function InsightCallout({ title, children, variant = 'info' }: InsightCalloutProps) {
  const styles = {
    info: 'border-indigo-200 bg-indigo-50 text-indigo-900',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
  };
  const iconStyles = {
    info: 'bg-indigo-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
  };

  const Icon = ICONS[variant];

  return (
    <div className={`rounded-xl border ${styles[variant]} p-4 flex gap-3 items-start`}>
      <div className={`w-6 h-6 rounded-full ${iconStyles[variant]} flex items-center justify-center text-white shrink-0 mt-0.5`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div>
        <div className="text-xs font-semibold mb-1">{title}</div>
        <div className="text-[11px] leading-relaxed opacity-80">{children}</div>
      </div>
    </div>
  );
}
