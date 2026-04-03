import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import type { FC } from 'react';

/* ------------------------------------------------------------------ */
/*  NavItem type & route configuration                                 */
/* ------------------------------------------------------------------ */

interface NavItem {
  to: string;
  label: string;
  icon: FC<{ className?: string }>;
  group: 'primary' | 'secondary';
}

/* 16×16 inline SVG icons — simple paths, no icon library */

const HomeIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 8.5L8 3L14 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.5 9.5V13.5H6.5V10.5H9.5V13.5H12.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CogIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.05 3.05L4.1 4.1M11.9 11.9L12.95 12.95M12.95 3.05L11.9 4.1M4.1 11.9L3.05 12.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ChartBarIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="9" width="3" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="6.5" y="5" width="3" height="9" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="11" y="2" width="3" height="12" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const BookIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 2.5H6C7.1 2.5 8 3.4 8 4.5V13.5C8 12.7 7.3 12 6.5 12H2.5V2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M13.5 2.5H10C8.9 2.5 8 3.4 8 4.5V13.5C8 12.7 8.7 12 9.5 12H13.5V2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const BeakerIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.5 2V6L2.5 12.5C2.5 13.5 3.5 14 4.5 14H11.5C12.5 14 13.5 13.5 13.5 12.5L10.5 6V2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M5 2H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4 10.5H12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1.5 2" />
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  /* Primary — thesis story flow */
  { to: '/',           label: 'Overview',            icon: HomeIcon,     group: 'primary' },
  { to: '/results',    label: 'Results',             icon: ChartBarIcon, group: 'primary' },
  { to: '/behaviour',  label: 'Behaviour',           icon: BeakerIcon,   group: 'primary' },
  /* Secondary */
  { to: '/notes',      label: 'Notes',              icon: BookIcon,     group: 'secondary' },
  { to: '/mechanism',  label: 'Mechanism',           icon: CogIcon,      group: 'secondary' },
  { to: '/appendix',   label: 'Appendix',            icon: BeakerIcon,   group: 'secondary' },
];

/* ------------------------------------------------------------------ */
/*  Sidebar component                                                  */
/* ------------------------------------------------------------------ */

export default function Sidebar() {
  const primary   = NAV_ITEMS.filter((n) => n.group === 'primary');
  const secondary = NAV_ITEMS.filter((n) => n.group === 'secondary');

  return (
    <aside className="w-48 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-200">
        <h1 className="text-sm font-bold text-slate-900 tracking-tight">
          Skill × Stake
        </h1>
        <p className="text-[10px] text-slate-400 mt-0.5">Thesis dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {/* Primary group */}
        <ul className="space-y-0.5">
          {primary.map((item) => (
            <li key={item.to}>
              <SidebarLink item={item} />
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div className="border-t border-slate-200 my-3" />

        {/* Secondary group */}
        <ul className="space-y-0.5">
          {secondary.map((item) => (
            <li key={item.to}>
              <SidebarLink item={item} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-200">
        <p className="text-[9px] text-slate-400 leading-relaxed">
          MSc Thesis · 2026
        </p>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual nav link                                                */
/* ------------------------------------------------------------------ */

function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.to === '/' || item.to === '/appendix'}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium',
          'transition-colors duration-100',
          isActive
            ? 'bg-teal-50 text-teal-700 border-l-[3px] border-teal-500 pl-[9px]'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        )
      }
    >
      <Icon className="shrink-0" />
      {item.label}
    </NavLink>
  );
}
