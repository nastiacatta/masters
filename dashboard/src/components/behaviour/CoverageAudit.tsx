import { useMemo } from 'react';

interface CoverageItem {
  name: string;
  status: 'experiment' | 'taxonomy-only' | 'not-covered';
  experimentTab?: string;
}

interface CoverageFamily {
  family: string;
  items: CoverageItem[];
}

interface CoverageAuditProps {
  families: CoverageFamily[];
  onNavigate?: (tab: string) => void;
}

const STATUS_DOT: Record<string, string> = {
  experiment: 'bg-emerald-400',
  'taxonomy-only': 'bg-amber-400',
  'not-covered': 'bg-slate-300',
};

export default function CoverageAudit({ families, onNavigate }: CoverageAuditProps) {
  const stats = useMemo(() => {
    const all = families.flatMap((f) => f.items);
    const experiment = all.filter((i) => i.status === 'experiment').length;
    const taxonomyOnly = all.filter((i) => i.status === 'taxonomy-only').length;
    const notCovered = all.filter((i) => i.status === 'not-covered').length;
    const total = all.length;
    const pct = total > 0 ? ((experiment / total) * 100).toFixed(1) : '0.0';
    return { experiment, taxonomyOnly, notCovered, total, pct };
  }, [families]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {/* Aggregate stats */}
      <div className="flex flex-wrap items-center gap-4 text-xs mb-4">
        <span className="font-semibold text-slate-700">{stats.total} items</span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          {stats.experiment} experiment
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          {stats.taxonomyOnly} taxonomy-only
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          {stats.notCovered} not covered
        </span>
        <span className="ml-auto font-mono font-semibold text-slate-800">{stats.pct}% coverage</span>
      </div>

      {/* Per-family sections */}
      <div className="space-y-3">
        {families.map((fam) => {
          const exp = fam.items.filter((i) => i.status === 'experiment').length;
          const tax = fam.items.filter((i) => i.status === 'taxonomy-only').length;
          const nc = fam.items.filter((i) => i.status === 'not-covered').length;
          const total = fam.items.length;

          return (
            <div key={fam.family}>
              <p className="text-[11px] font-semibold capitalize text-slate-600 mb-1">{fam.family}</p>

              {/* Coverage bar */}
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
                {exp > 0 && (
                  <div className="bg-emerald-400" style={{ width: `${(exp / total) * 100}%` }} />
                )}
                {tax > 0 && (
                  <div className="bg-amber-400" style={{ width: `${(tax / total) * 100}%` }} />
                )}
                {nc > 0 && (
                  <div className="bg-slate-300" style={{ width: `${(nc / total) * 100}%` }} />
                )}
              </div>

              {/* Item list */}
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {fam.items.map((item) => {
                  const clickable = item.status === 'experiment' && item.experimentTab;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      disabled={!clickable}
                      onClick={() => clickable && onNavigate?.(item.experimentTab!)}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border border-slate-200 ${
                        clickable
                          ? 'cursor-pointer hover:border-slate-400 hover:bg-slate-50'
                          : 'cursor-default opacity-70'
                      }`}
                    >
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${STATUS_DOT[item.status]}`} />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
