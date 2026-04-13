import type { InsightCardProps } from '../../../lib/comparison/types';

const COLOR_MAP: Record<InsightCardProps['color'], { border: string; bg: string; text: string }> = {
  green:  { border: 'border-l-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  amber:  { border: 'border-l-amber-500',   bg: 'bg-amber-50',    text: 'text-amber-700'   },
  red:    { border: 'border-l-red-500',      bg: 'bg-red-50',      text: 'text-red-700'     },
  blue:   { border: 'border-l-indigo-500',   bg: 'bg-indigo-50',   text: 'text-indigo-700'  },
};

export default function InsightCard({ icon, color, title, description }: InsightCardProps) {
  const c = COLOR_MAP[color];

  return (
    <div
      className={`rounded-xl border border-slate-200 ${c.border} border-l-4 ${c.bg} p-5 flex gap-3 items-start`}
    >
      {icon && (
        <span className={`text-lg leading-none mt-0.5 shrink-0 ${c.text}`}>{icon}</span>
      )}
      <div>
        <p className="text-sm font-bold text-slate-800">{title}</p>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
