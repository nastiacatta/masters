import { TOOLTIP_STYLE, fmt } from '@/components/lab/shared';

export interface SmartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string | number;
  formatter?: (value: number, name: string) => string;
}

export function SmartTooltip({ active, payload, label, formatter }: SmartTooltipProps) {
  if (!active || !payload?.length) return null;

  const filtered = payload.filter(p => p.value != null);
  if (!filtered.length) return null;

  const format = formatter ?? ((v: number) => fmt(v, 4));

  return (
    <div style={TOOLTIP_STYLE}>
      {label != null && (
        <div className="font-medium text-slate-700 text-[11px] mb-1">
          {typeof label === 'number' ? `Round ${label}` : label}
        </div>
      )}
      {filtered.map(p => (
        <div key={p.dataKey} className="flex items-center gap-1.5 text-[11px]">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: p.color }}
          />
          <span className="text-slate-500">{p.name}</span>
          <span className="font-mono font-medium ml-auto">
            {format(p.value, p.name)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default SmartTooltip;
