import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const ROUTES: { to: string; label: string }[] = [
  { to: '/',           label: 'Home' },
  { to: '/mechanism',  label: 'Mechanism' },
  { to: '/results',    label: 'Comparisons' },
  { to: '/robustness', label: 'Robustness' },
];

export default function Sidebar() {
  return (
    <aside className="w-48 bg-slate-900 flex flex-col h-full shrink-0">
      <div className="px-4 py-4 border-b border-slate-700/50">
        <h1 className="text-sm font-bold text-white tracking-tight">
          Skill × Stake
        </h1>
        <p className="text-[10px] text-slate-400 mt-0.5">Thesis dashboard</p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {ROUTES.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-teal-600/20 text-teal-300'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-slate-700/50">
        <NavLink
          to="/appendix"
          className="text-[10px] text-slate-500 hover:text-slate-400 transition-colors"
        >
          Appendix
        </NavLink>
        <p className="text-[9px] text-slate-600 mt-1 leading-relaxed">
          Adaptive skill and stake in forecast markets.
        </p>
      </div>
    </aside>
  );
}
