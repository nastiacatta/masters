import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** One-line research question or framing */
  question?: string;
  /** One-line takeaway or key result */
  takeaway?: string;
  /** Control row (selects, sliders, etc.) */
  controls?: ReactNode;
  /** Breadcrumb trail */
  breadcrumbs?: { label: string; to?: string }[];
}

export default function PageHeader({
  title,
  description,
  question,
  takeaway,
  controls,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-slate-300">/</span>}
              {b.to ? (
                <Link to={b.to} className="hover:text-slate-700">
                  {b.label}
                </Link>
              ) : (
                <span className="text-slate-600">{b.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      {description && (
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">{description}</p>
      )}
      {question && (
        <p className="text-sm font-medium text-slate-700 mt-2 max-w-2xl">
          {question}
        </p>
      )}
      {takeaway && (
        <p className="text-sm text-slate-600 mt-1 max-w-2xl italic">
          {takeaway}
        </p>
      )}
      {controls && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          {controls}
        </div>
      )}
    </div>
  );
}
