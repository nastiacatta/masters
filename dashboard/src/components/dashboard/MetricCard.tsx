import { motion } from 'framer-motion';

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  accent?: boolean;
}

export default function MetricCard({ label, value, subtitle, accent }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-slate-200 rounded-xl px-4 py-3 min-w-0"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">{label}</p>
      <p className={`text-xl font-semibold mt-1 tabular-nums ${accent ? 'text-blue-600' : 'text-slate-900'}`}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>}
    </motion.div>
  );
}
