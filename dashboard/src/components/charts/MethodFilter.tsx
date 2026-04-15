import { useChartLinking } from '@/hooks/useChartLinking';

/* ── Types ─────────────────────────────────────────────────────────── */

interface MethodDef {
  /** Unique method key (matches ChartLinkingContext keys) */
  key: string;
  /** Display label */
  label: string;
  /** Method colour */
  color: string;
}

interface MethodFilterProps {
  methods: MethodDef[];
}

/* ── Hex → rgba helper ─────────────────────────────────────────────── */

function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
}

/* ── Component ─────────────────────────────────────────────────────── */

/**
 * Row of toggle pills for filtering visible methods.
 *
 * Active pills: filled background at 15% opacity of the method colour,
 * coloured text. Inactive pills: outlined with slate border, slate text.
 *
 * State is managed externally via `ChartLinkingContext`.
 */
export default function MethodFilter({ methods }: MethodFilterProps) {
  const { visibleMethods, toggleMethod } = useChartLinking();

  return (
    <div
      className="flex flex-wrap gap-2 mb-3"
      role="group"
      aria-label="Method filter"
    >
      {methods.map((m) => {
        const active = visibleMethods.has(m.key);

        return (
          <button
            key={m.key}
            type="button"
            onClick={() => toggleMethod(m.key)}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors"
            style={{
              fontSize: '12px',
              lineHeight: '16px',
              fontWeight: 500,
              border: active ? `1px solid ${hexToRgba(m.color, 0.4)}` : '1px solid #cbd5e1',
              backgroundColor: active ? hexToRgba(m.color, 0.15) : 'transparent',
              color: active ? m.color : '#64748b',
            }}
            aria-pressed={active}
          >
            {/* Colour dot */}
            <span
              className="inline-block rounded-full flex-shrink-0"
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: active ? m.color : '#94a3b8',
              }}
            />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
