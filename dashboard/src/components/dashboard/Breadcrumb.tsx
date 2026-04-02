import { Link, useLocation } from 'react-router-dom';

const ROUTE_LABELS: Record<string, string> = {
  '': 'Overview',
  mechanism: 'Mechanism',
  results: 'Results',
  robustness: 'Robustness',
  appendix: 'Appendix',
  experiments: 'Experiments',
};

interface BreadcrumbProps {
  activeTab?: string;
}

export default function Breadcrumb({ activeTab }: BreadcrumbProps) {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs: { label: string; to: string }[] = [
    { label: 'Overview', to: '/' },
  ];

  let path = '';
  for (const seg of segments) {
    path += `/${seg}`;
    const label = ROUTE_LABELS[seg] ?? seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, to: path });
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-4">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1 && !activeTab;
        return (
          <span key={crumb.to} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {isLast ? (
              <span className="text-slate-600 font-medium">{crumb.label}</span>
            ) : (
              <Link to={crumb.to} className="hover:text-slate-600 transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
      {activeTab && (
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true">/</span>
          <span className="text-slate-600 font-medium">{activeTab}</span>
        </span>
      )}
    </nav>
  );
}
