interface SlideWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function SlideWrapper({ children, className = '' }: SlideWrapperProps) {
  return (
    <section
      className={`w-full rounded-xl border border-slate-200 bg-white p-8 ${className}`.trim()}
    >
      {children}
    </section>
  );
}
