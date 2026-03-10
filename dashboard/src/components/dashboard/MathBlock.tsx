import clsx from 'clsx';

interface MathBlockProps {
  /** Equation or expression to show (plain text / Unicode) */
  children: React.ReactNode;
  /** Optional label above (e.g. "Effective wager") */
  label?: string;
  /** Optional small caption below */
  caption?: string;
  className?: string;
  /** Highlight as key design choice */
  accent?: boolean;
}

export default function MathBlock({ children, label, caption, className, accent }: MathBlockProps) {
  return (
    <div
      className={clsx(
        'rounded-xl border px-4 py-3 font-mono text-sm text-center',
        accent
          ? 'border-blue-300 bg-blue-50/50 text-slate-800'
          : 'border-slate-200 bg-white text-slate-700',
        className
      )}
    >
      {label && (
        <p className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          {label}
        </p>
      )}
      <div className="break-all">{children}</div>
      {caption && (
        <p className="text-xs font-sans text-slate-500 mt-1.5">{caption}</p>
      )}
    </div>
  );
}
