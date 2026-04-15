interface InsightCalloutProps {
  title: string;
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning';
}

export default function InsightCallout({ title, children, variant = 'info' }: InsightCalloutProps) {
  const styles = {
    info: 'border-indigo-200 bg-indigo-50 text-indigo-900',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
  };
  const iconStyles = {
    info: 'bg-indigo-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
  };
  const icons = { info: '💡', success: '✓', warning: '⚠' };

  return (
    <div className={`rounded-xl border ${styles[variant]} p-4 flex gap-3 items-start`}>
      <div className={`w-6 h-6 rounded-full ${iconStyles[variant]} flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}>
        {icons[variant]}
      </div>
      <div>
        <div className="text-xs font-semibold mb-1">{title}</div>
        <div className="text-[11px] leading-relaxed opacity-80">{children}</div>
      </div>
    </div>
  );
}
