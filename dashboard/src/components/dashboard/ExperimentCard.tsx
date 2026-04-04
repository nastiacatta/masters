import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { ExperimentMeta } from '@/lib/types';

const BLOCK_COLORS: Record<string, { bg: string; text: string }> = {
  core: { bg: 'bg-teal-100', text: 'text-teal-700' },
  behaviour: { bg: 'bg-violet-100', text: 'text-violet-700' },
  experiments: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
};

export default function ExperimentCard({ experiment }: { experiment: ExperimentMeta }) {
  const navigate = useNavigate();
  const pill = BLOCK_COLORS[experiment.block] ?? { bg: 'bg-slate-100', text: 'text-slate-600' };

  const metrics: { label: string; value: string }[] = [];
  if (experiment.nAgents != null) metrics.push({ label: 'Agents', value: String(experiment.nAgents) });
  if (experiment.rounds != null) metrics.push({ label: 'Rounds', value: String(experiment.rounds) });
  if (experiment.dgp) metrics.push({ label: 'DGP', value: experiment.dgp });

  return (
    <motion.button
      layoutId={`exp-card-${experiment.name}`}
      type="button"
      onClick={() => navigate('/appendix/experiments')}
      className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md hover:border-slate-300 transition-shadow cursor-pointer w-full"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${pill.bg} ${pill.text}`}>
          {experiment.block}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-slate-800 truncate">{experiment.displayName || experiment.name}</h3>
      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
        {experiment.description || 'No description available.'}
      </p>
      {metrics.length > 0 && (
        <div className="flex gap-3 mt-3">
          {metrics.slice(0, 3).map((m) => (
            <div key={m.label} className="text-[10px]">
              <span className="text-slate-400">{m.label}</span>{' '}
              <span className="font-mono font-medium text-slate-600">{m.value}</span>
            </div>
          ))}
        </div>
      )}
    </motion.button>
  );
}
