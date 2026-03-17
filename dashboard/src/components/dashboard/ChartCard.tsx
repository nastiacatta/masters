import type { ReactNode } from 'react';
import InfoToggle, { type InfoToggleContent } from '@/components/dashboard/InfoToggle';

interface ChartCardProps {
  title: string;
  subtitle?: ReactNode;
  /** Optional chart-specific help; renders an info icon next to the title */
  help?: InfoToggleContent;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({ title, subtitle, help, children, className = '' }: ChartCardProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-4 ${className}`}>
      <div className="mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {help && <InfoToggle {...help} />}
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
