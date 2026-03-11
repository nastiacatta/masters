import { Link } from 'react-router-dom';
import clsx from 'clsx';

const TABS = [
  { id: 'pipeline', label: 'Time-step pipeline', to: '/pipeline' },
  { id: 'experiments', label: 'Experiments', to: '/experiments' },
] as const;

interface ExperimentsTabBarProps {
  /** Current tab (for highlighting) */
  activeTab: 'pipeline' | 'experiments';
  className?: string;
}

export default function ExperimentsTabBar({ activeTab, className }: ExperimentsTabBarProps) {
  return (
    <div
      className={clsx(
        'inline-flex rounded-xl bg-slate-100 p-1',
        className
      )}
      role="tablist"
      aria-label="Main sections"
    >
      {TABS.map((t) => (
        <Link
          key={t.id}
          to={t.to}
          role="tab"
          aria-selected={activeTab === t.id}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === t.id
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
