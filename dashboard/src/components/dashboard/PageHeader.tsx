interface PageHeaderProps {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500 mt-1 max-w-2xl">{description}</p>
    </div>
  );
}
