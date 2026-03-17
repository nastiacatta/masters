/**
 * StepSection — clearly divides content into numbered steps.
 */
interface Props {
  step: number;
  title: string;
  children: React.ReactNode;
  description?: string;
}

export default function StepSection({ step, title, description, children }: Props) {
  return (
    <div className="relative" role="region" aria-label={`Step ${step}: ${title}`}>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white shrink-0 bg-slate-600">
          {step}
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
          {description ? (
            <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
          ) : null}
        </div>
      </div>
      <div className="pl-10 border-l-2 border-slate-200 ml-3 min-h-8">
        {children}
      </div>
    </div>
  );
}
